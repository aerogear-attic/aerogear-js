/* AeroGear JavaScript Library
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright Red Hat, Inc., and individual contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/**
    The jsonPath adapter.
    @status Experimental
    @constructs AeroGear.DiffSyncEngine.adapters.jsonPatch
    @returns {Object} The created adapter
 */
AeroGear.DiffSyncEngine.adapters.jsonPatch = function() {
    if ( !( this instanceof AeroGear.DiffSyncEngine.adapters.jsonPatch ) ) {
        return new AeroGear.DiffSyncEngine.adapters.jsonPatch();
    }

    var stores = {
        docs: [],
        shadows: [],
        backups: [],
        edits: []
    };

    /**
     * Adds a new document to this sync engine.
     *
     * @param doc the document to add.
     */
    this.addDocument = function( doc ) {
        this._saveDocument( JSON.parse( JSON.stringify( doc ) ) );
        this._saveShadow( JSON.parse( JSON.stringify( doc ) ) );
        this._saveShadowBackup( JSON.parse( JSON.stringify( doc ) ), 0 );
    };

    /**
     * Performs the client side of a differential sync.
     * When a client makes an update to it's document, it is first diffed against the shadow
     * document. The result of this is an {@link Edits} instance representing the changes.
     * There might be pending edits that represent edits that have not made it to the server
     * for some reason (for example packet drop). If a pending edit exits the contents (the diffs)
     * of the pending edit will be included in the returned Edits from this method.
     *
     * @param doc the updated document.
     * @returns {object} containing the diffs that between the clientDoc and it's shadow doc.
     */
    this.diff = function( doc ) {
        var patchMsg, pendingEdits,
            shadow = this._readData( doc.id, "shadows" )[ 0 ];

        patchMsg = {
            msgType: "patch",
            id: doc.id,
            clientId: shadow.clientId,
            edits: [{
                clientVersion: shadow.clientVersion,
                serverVersion: shadow.serverVersion,
                // currently not implemented but we probably need this for checking the client and server shadow are identical be for patching.
                checksum: '',
                diffs: jsonpatch.compare( shadow.content, doc.content )
            }]
        };

        shadow.clientVersion++;
        shadow.content = doc.content;
        this._saveShadow( JSON.parse( JSON.stringify( shadow ) ) );

        // add any pending edits from the store
        pendingEdits = this._getEdits( doc.id );
        if ( pendingEdits && pendingEdits.length > 0 ) {
            patchMsg.edits = pendingEdits.concat( patchMsg.edits );
        }

        return patchMsg;
    };

    /**
     * Performs the client side patch process.
     *
     * @param patchMsg the patch message that is sent from the server
     *
     * @example:
     * {
     *   "msgType":"patch",
     *   "id":"12345",
     *   "clientId":"3346dff7-aada-4d5f-a3da-c93ff0ffc472",
     *   "edits":[{
     *     "clientVersion":0,
     *     "serverVersion":0,
     *     "checksum":"5f9844b21c298ea1f3ed7bf37f96e42df03395b",
     *     "diffs":[
     *       {"operation":"UNCHANGED","text":"I'm a Je"},
     *       {"operation":"DELETE","text":"di"}]
     *   }]
     * }
    */
    this.patch = function( patchMsg ) {
        // Flow is based on the server side
        // patch the shadow
        var patchedShadow = this.patchShadow( patchMsg );
        // Then patch the document
        this.patchDocument( patchedShadow );
        // then save backup shadow
        this._saveShadowBackup( patchedShadow, patchedShadow.clientVersion );

    };

    this.patchShadow = function( patchMsg ) {
        // First get the shadow document for this doc.id and clientId
        var i, patched, edit,
            shadow = this.getShadow( patchMsg.id ),
            edits = patchMsg.edits;
        //Iterate over the edits of the doc
        for ( i = 0; i < edits.length; i++ ) {
            edit = edits[i];

            //Check for dropped packets?
            // edit.clientVersion < shadow.ClientVersion
            if( edit.clientVersion < shadow.clientVersion && !this._isSeeded( edit ) ) {
                // Dropped packet?  // restore from back
                shadow = this._restoreBackup( shadow, edit );
                continue;
            }

            //check if we already have this one
            // IF SO discard the edit
            // edit.serverVersion < shadow.ServerVesion
            if( edit.serverVersion < shadow.serverVersion ) {
                // discard edit
                this._removeEdit( patchMsg.id, edit );
                continue;
            }

            //make sure the versions match
            if( (edit.serverVersion === shadow.serverVersion && edit.clientVersion === shadow.clientVersion) || this._isSeeded( edit )) {
                // Good ,  Patch the shadow
                this.applyEditsToShadow( edit, shadow );
                if ( this._isSeeded( edit ) ) {
                    shadow.clientVersion = 0;
                } else if ( edit.clientVersion >= 0 ) {
                    shadow.serverVersion++;
                }
                this._saveShadow( shadow );
                this._removeEdit( patchMsg.id, edit );
            }
        }

        return shadow;
    };

    // A seeded patch is when all clients start with a base document. They all send this base version as
    // part of the addDocument call. The server will respond with a patchMsg enabling the client to
    // patch it's local version to get the latest updates. Such an edit is identified by a clientVersion
    // set to '-1'.
    this._isSeeded = function( edit ) {
        return edit.clientVersion === -1;
    };

    this.applyEditsToShadow = function ( edits, shadow ) {
        var patchResult;
        // returns true or false,  should probably do something with it?
        patchResult = jsonpatch.apply( shadow.content, edits.diffs );
        return shadow;
    };

    this.patchDocument = function( shadow ) {
        var doc, diffs, patch;

        // first get the document based on the shadowdocs ID
        doc = this.getDocument( shadow.id );

        diffs = jsonpatch.compare( doc.content, shadow.content );

        patch = jsonpatch.apply( doc.content, diffs );

        //save the newly patched document,  do we save if the apply failed?
        this._saveDocument( doc );

        return patch;
    };

    this._saveData = function( data, type ) {
        data = Array.isArray( data ) ? data : [ data ];

        stores[ type ] = data;
    };

    this._readData = function( id, type ) {
        return stores[ type ].filter( function( doc ) {
            return doc.id === id;
        });
    };

    this._saveDocument = function( doc ) {
        this._saveData( doc, "docs" );
        return doc;
    };

    this._saveShadow = function( doc ) {
        var shadow = {
            id: doc.id,
            serverVersion: doc.serverVersion || 0,
            clientId: doc.clientId,
            clientVersion: doc.clientVersion || 0,
            content: doc.content
        };

        this._saveData( shadow, "shadows" );
        return shadow;
    };

    this._saveShadowBackup = function( shadow, clientVersion ) {
        var backup = { id: shadow.id, clientVersion: clientVersion, content: shadow.content };
        this._saveData( backup, "backups" );
        return backup;
    };

    this.getDocument = function( id ) {
        return this._readData( id, "docs" )[ 0 ];
    };

    this.getShadow = function( id ) {
        return this._readData( id, "shadows" )[ 0 ];
    };

    this.getBackup = function( id ) {
        return this._readData( id, "backups" )[ 0 ];
    };

    this._saveEdits = function( patchMsg ) {
        var record = { id: patchMsg.id, clientId: patchMsg.clientId, edits: patchMsg.edits};
        this._saveData( record, "edits" );
        return record;
    };

    this._getEdits = function( id ) {
        var patchMessages = this._readData( id, "edits" );

        return patchMessages.length ? patchMessages.edits : [];
    };

    this._removeEdit = function( documentId,  edit ) {
        var pendingEdits = this._readData( documentId, "edits" ), i, j, pendingEdit;
        for ( i = 0; i < pendingEdits.length; i++ ) {
            pendingEdit = pendingEdits[i];
            for ( j = 0; j < pendingEdit.edits.length; j++) {
                if ( pendingEdit.edits[j].clientVersion <= edit.clientVersion) {
                    pendingEdit.edits.splice(i, 1);
                    break;
                }
            }
        }
    };

    this._removeEdits = function( documentId ) {
        var edits = this._readData( documentId, "edits" ), i;
        edits.splice(0, edits.length);
    };

    this._restoreBackup = function( shadow, edit) {
        var patchedShadow, restoredBackup,
            backup = this.getBackup( shadow.id );

        if ( edit.clientVersion === backup.clientVersion ) {

            restoredBackup = {
                id: backup.id,
                clientVersion: backup.clientVersion,
                content: backup.content
            };

            patchedShadow = this.applyEditsToShadow( edit, restoredBackup );
            restoredBackup.serverVersion++;
            this._removeEdits( shadow.id );

            return this._saveShadow( patchedShadow );
        } else {
            throw "Edit's clientVersion '" + edit.clientVersion + "' does not match the backups clientVersion '" + backup.clientVersion + "'";
        }
    };
};
