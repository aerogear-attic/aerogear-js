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
    The AeroGear Differential Sync Client.
    @status Experimental
    @constructs AeroGear.UnifiedPushClient
    @param {Object} config - A configuration
    @param {String} config.serverUrl - the url of the Differential Sync Server
    @param {Object} [config.syncEngine="AeroGear.DiffSyncEngine"] -
    @param {function} [config.onopen] -
    @param {function} [config.onclose] -
    @param {function} [config.onsync] -
    @param {function} [config.onerror] -
    @returns {object} diffSyncClient - The created DiffSyncClient
    @example
 */
AeroGear.DiffSyncClient = function ( config ) {
    if ( ! ( this instanceof AeroGear.DiffSyncClient ) ) {
        return new AeroGear.DiffSyncClient( config );
    }

    config = config || {};

    var ws,
        sendQueue = [],
        that = this,
        syncEngine = config.syncEngine || new AeroGear.DiffSyncEngine({name: 'jsonPatchEngine'}).engines.jsonPatchEngine;

    if ( config.serverUrl === undefined ) {
        throw new Error( "'config.serverUrl' must be specified" );
    }

    /**
        Connects to the Differential Sync Server using WebSockets
    */
    this.connect = function() {
        ws = new WebSocket( config.serverUrl );
        ws.onopen = function ( e ) {
            if ( config.onopen ) {
                config.onopen.apply( this, arguments );
            }

            //console.log ( 'WebSocket opened. SendQueue.length=', sendQueue.length );
            while ( sendQueue.length ) {
                var task = sendQueue.pop();
                if ( task.type === "add" ) {
                    send ( task.type, task.msg );
                } else {
                    that.sendEdits( task.msg );
                }
            }
        };
        ws.onmessage = function( e ) {
            var data, doc;

            try {
                data = JSON.parse( e.data );
            } catch( err ) {
                data = {};
            }

            if ( data ) {
                that._patch( data );
            }

            doc = that.getDocument( data.id );

            if( config.onsync ) {
                config.onsync.call( this, doc, e );
            }
        };
        ws.onerror = function( e ) {
            if ( config.onerror ) {
                config.onerror.apply( this, arguments );
            }
        };
        ws.onclose = function( e ) {
            if ( config.onclose ) {
                 config.onclose.apply( this, arguments);
            }
        };
    };

    // connect needs to be callable for implementing reconnect.
    this.connect();

    /**
        Disconnects from the Differential Sync Server closing it's Websocket connection
    */
    this.disconnect = function() {
        //console.log('Closing Connection');
        ws.close();
    };

    /**
        patch -
        @param {Object} data - The data to be patched
    */
    this._patch = function( data ) {
        syncEngine.patch( data );
    };

    /**
        getDocument -
        @param {String} id - the id of the document to get
        @returns {Object} - The document from the sync engine
    */
    this.getDocument = function( id ) {
        return syncEngine.getDocument( id );
    };

    /**
        diff
        @param {Object} data - the data to perform a diff on
        @returns {Object} - An Object containing the edits from the Sync Engine
    */
    this._diff = function( data ) {
        return syncEngine.diff( data );
    };

    /**
        addDocument
        @param {Object} doc - a document to add to the sync engine
    */
    this.addDocument = function( doc ) {
        syncEngine.addDocument( doc );

        if ( ws.readyState === 0 ) {
            sendQueue.push( { type: "add", msg: doc } );
        } else if ( ws.readyState === 1 ) {
            send( "add", doc );
        }
    };

    /**
        sendEdits
        @param {Object} edit - the edits to be sent to the server
    */
    this._sendEdits = function( edit ) {
        if ( ws.readyState === WebSocket.OPEN ) {
            //console.log( 'sending edits:', edit );
            ws.send( JSON.stringify( edit ) );
        } else {
            //console.log("Client is not connected. Add edit to queue");
            if ( sendQueue.length === 0 ) {
                sendQueue.push( { type: "patch", msg: edit } );
            } else {
                var updated = false;
                for (var i = 0 ; i < sendQueue.length; i++ ) {
                    var task = sendQueue[i];
                    if (task.type === "patch" && task.msg.clientId === edit.clientId && task.msg.id === edit.id) {
                        for (var j = 0 ; j < edit.edits.length; j++) {
                            task.msg.edits.push( edit.edits[j] );
                        }
                        updated = true;
                    }
                }
                if ( !updated ) {
                    sendQueue.push( { type: "patch", msg: edit } );
                }
            }
        }
    };

    /**
        sync
        @param {Object} data - the Data to be sync'd with the server
    */
    this.sync = function( data ) {
        var edits = that._diff( data );
        that._sendEdits( edits );
    };

    /**
        removeDoc
        TODO
    */
    this.removeDoc = function( doc ) {
       // TODO?
       // console.log( "removing  doc from engine" );
    };

    /**
        fetch
        @param {String} docId - the id of a document to fetch from the Server
    */
    this.fetch = function( docId ) {
        var doc, edits, task;

        if ( sendQueue.length === 0 ) {
            doc = syncEngine.getDocument( docId );
            that.sync( doc );
        } else {
            while ( sendQueue.length ) {
                task = sendQueue.shift();
                if ( task.type === "add" ) {
                    send ( task.type, task.msg );
                } else {
                    that._sendEdits( task.msg );
                }
            }
        }
    };

    /**
        send
        @param {String} msgType
        @param {Object} doc
    */
    var send = function ( msgType, doc ) {
        var json = { msgType: msgType, id: doc.id, clientId: doc.clientId, content: doc.content };
        //console.log ( 'sending ' + JSON.stringify ( json ) );
        ws.send( JSON.stringify ( json ) );
    };
};
