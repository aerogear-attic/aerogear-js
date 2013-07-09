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
    The IndexedDB adapter
    This constructor is instantiated when the "DataManager.add()" method is called
    @constructs AeroGear.DataManager.adapters.IndexedDB
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @param {AeroGear~successCallbackINDEXEDDB} [settings.success] - a callback to be called when after successful creation/opening of an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [settings.error] - a callback to be called when the there is an error with the creation/opening of an IndexedDB
    @returns {Object} // TODO,  should this return a promise?
    @example
    // TODO

 */
AeroGear.DataManager.adapters.IndexedDB = function( storeName, settings ) {

    // Normalize
    window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    if (!window.indexedDB) {
        //console.log( "Your browser doesn't support IndexedDB" );
        return;
    }

    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.IndexedDB ) ) {
        return new AeroGear.DataManager.adapters.IndexedDB( storeName, settings );
    }

    settings = settings || {};

    // Private Instance vars
    var recordId = settings.recordId ? settings.recordId : "id",
        type = "IndexedDB",
        data = null,
        request,
        database;

    // Attempt to open the indexedDB database
    request = window.indexedDB.open( storeName );

    request.onsuccess = function( event ) {
        database = event.target.result;

        if( settings.success ) {
            settings.success.call( this, database, arguments );
        }
    };

    request.onerror = function( event ) {
        if( settings.error ) {
            settings.error.call( this, event.target.error, arguments );
        }
    };

    // Only called when the database doesn't exist and needs to be created
    request.onupgradeneeded = function( event ) {
        database = event.target.result;
        database.createObjectStore( storeName, { keyPath: recordId } );
        //TODO: set up indexes?
    };

    // Privileged Methods
    /**
        Returns the value of the private database var
        @private
        @augments IndexedDB
        @returns {Object}
     */
    this.getDatabase = function() {
        return database;
    };

    /**
        Returns the value of the private storeName var
        @private
        @augments IndexedDB
        @returns {String}
     */
    this.getStoreName = function() {
        return storeName;
    };

    /**
        Returns the value of the private recordId var
        @private
        @augments IndexedDB
        @returns {String}
     */
    this.getRecordId = function() {
        return recordId;
    };

    /**
        Little utility used to compare nested object values in the filter method
        @private
        @augments IndexedDB
        @param {String} nestedKey - Filter key to test
        @param {Object} nestedFilter - Filter object to test
        @param {Object} nestedValue - Value object to test
        @returns {Boolean}
     */
    this.traverseObjects = function( nestedKey, nestedFilter, nestedValue ) {
        while ( typeof nestedFilter === "object" ) {
            if ( nestedValue ) {
                // Value contains this key so continue checking down the object tree
                nestedKey = Object.keys( nestedFilter )[ 0 ];
                nestedFilter = nestedFilter[ nestedKey ];
                nestedValue = nestedValue[ nestedKey ];
            } else {
                break;
            }
        }
        if ( nestedFilter === nestedValue ) {
            return true;
        } else {
            return false;
        }
    };
};

// Public Methods
/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @param {Object} [options={}] - additional options
    @param {AeroGear~successCallbackINDEXEDDB} [options.success] - a callback to be called when after successful creation/opening of an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [options.error] - a callback to be called when the there is an error with the creation/opening of an IndexedDB
    @returns {Array} Returns data from the store, optionally filtered by an id
    @example
    //TODO

 */
AeroGear.DataManager.adapters.IndexedDB.prototype.read = function( id, options ) {
    var database,
        transaction,
        storeName = this.getStoreName(),
        objectStore,
        data = [],
        cursor,
        request;

    options = options || {};

    database = this.getDatabase();

    // TODO what if the database is not open,  they called read first
    if( !database.objectStoreNames.contains( storeName ) ) {
        return [];
    }

    transaction = database.transaction( storeName );
    objectStore = transaction.objectStore( storeName );

    if( id ) {
        request = objectStore.get( id );

        request.onsuccess = function( event ) {
            data.push( request.result );
        };

    } else {
        cursor = objectStore.openCursor();
        cursor.onsuccess = function( event ) {
            var result = event.target.result;
            if( result ) {
                data.push( result.value );
                result.continue();
            }
        };
    }

    transaction.oncomplete = function( event ) {
        if( options.success ) {
            options.success.call( this, data, arguments );
        }
    };

    transaction.onerror = function( event ) {
        if( options.error ) {
            options.error.call( this, arguments );
        }
    };
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - additional options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @param {AeroGear~successCallbackINDEXEDDB} [options.success] - a callback to be called when after successful creation/opening of an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [options.error] - a callback to be called when the there is an error with the creation/opening of an IndexedDB
    @returns {Array} Returns the updated data from the store
    @example
    // TODO

 */
AeroGear.DataManager.adapters.IndexedDB.prototype.save = function( data, options ) {
    options = options || {};

    var that = this,
        db = this.getDatabase(),
        transaction,
        storeName = this.getStoreName(),
        objectStore,
        i = 0;

    // TODO implement reset

    transaction = db.transaction( storeName, "readwrite" );
    objectStore = transaction.objectStore( storeName );

    if( AeroGear.isArray( data ) ) {
        for( i; i < data.length; i++ ){
            objectStore.put( data[ i ] );
        }
    } else {
        objectStore.put( data );
    }

    transaction.oncomplete = function( event ) {
        if( options.success ) {
            that.read( undefined, options );
        }
    };

    transaction.onerror = function( event ) {
        if( options.error ) {
            options.error.call( this, arguments );
        }
    };
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @param {AeroGear~successCallbackINDEXEDDB} [options.success] - a callback to be called when after successful creation/opening of an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [options.error] - a callback to be called when the there is an error with the creation/opening of an IndexedDB
    @returns {Array} Returns the updated data from the store
    @example

    // TODO
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.remove = function( toRemove, options ) {
    options = options || {};

    var that = this,
        db = this.getDatabase(),
        transaction,
        storeName = this.getStoreName(),
        objectStore,
        i = 0;

    transaction = db.transaction( storeName, "readwrite" );
    objectStore = transaction.objectStore( storeName );

    if( !toRemove ) {
        objectStore.clear();
    } else  {
        toRemove = AeroGear.isArray( toRemove ) ? toRemove: [ toRemove ];

        for( i; i < toRemove.length; i++ ) {
            if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
                objectStore.delete( toRemove[ i ] );
            } else if ( toRemove ) {
                objectStore.delete( toRemove[ i ][ this.getRecordId() ] );
            } else {
                continue;
            }
        }
    }

    transaction.oncomplete = function( event ) {
        if( options.success ) {
            that.read( undefined, options, arguments );
        }
    };

    transaction.onerror = function( event ) {
        if( options.error ) {
            options.error.call( this, arguments );
        }
    };
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @returns {Array} Returns a filtered array of data objects based on the contents of the store's data object and the filter parameters. This method only returns a copy of the data and leaves the original data object intact.
    @example

    // TODO
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.filter = function( filterParameters, matchAny ) {
    return "TODO";
};

/**
    Close the current store
    @example

    // TODO
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.close = function() {
    this.getDatabase().close();
};
