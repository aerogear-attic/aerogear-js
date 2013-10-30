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
    The IndexedDB adapter stores data in an IndexedDB database for more persistent client side storage
    This constructor is instantiated when the "DataManager.add()" method is called
    @constructs AeroGear.DataManager.adapters.IndexedDB
    @status Experimental
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @returns {Object} The created store
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an IndexedDB store
    dm.add({
        name: "newStore",
        storageType: "IndexedDB"
    });

 */
AeroGear.DataManager.adapters.IndexedDB = function( storeName, settings ) {

    if ( !window.indexedDB ) {
        throw "Your browser doesn't support IndexedDB";
    }

    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.IndexedDB ) ) {
        return new AeroGear.DataManager.adapters.IndexedDB( storeName, settings );
    }

    AeroGear.DataManager.adapters.base.apply( this, arguments );

    settings = settings || {};

    // Private Instance vars
    var request, database;

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
        Sets the value of the private database var
        @private
        @augments IndexedDB
     */
    this.setDatabase = function( db ) {
        database = db;
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
        @private
        @augments IndexedDB
        Compatibility fix
        Added in 1.3 to remove in 1.4
    */
    this.getAsync = function() {
        return true;
    };
};
// Public Methods
/**
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.IndexedDB.isValid = function() {
    return !!window.indexedDB;
};

/**
    Open the Database
    @param {Object} [options={}] - options
    @param {AeroGear~successCallbackINDEXEDDB} [settings.success] - a callback to be called after successfully opening an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [settings.error] - a callback to be called when there is an error with the opening of an IndexedDB
    @return {Object} A jQuery.Deferred promise
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an IndexedDB store
    dm.add({
        name: "newStore",
        storageType: "IndexedDB"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });
*/
AeroGear.DataManager.adapters.IndexedDB.prototype.open = function( options ) {
    options = options || {};

    var request, database,
        that = this,
        storeName = this.getStoreName(),
        recordId = this.getRecordId(),
        deferred = jQuery.Deferred();

    //Attempt to open the indexedDB database
    request = window.indexedDB.open( storeName );

    request.onsuccess = function( event ) {
        database = event.target.result;
        that.setDatabase( database );
        deferred.resolve( database, "success", options.success );
    };

    request.onerror = function( event ) {
        deferred.reject( event, "error", options.error );
    };

    // Only called when the database doesn't exist and needs to be created
    request.onupgradeneeded = function( event ) {
        database = event.target.result;
        database.createObjectStore( storeName, { keyPath: recordId } );
    };

    deferred.always( this.always );
    return deferred.promise();
};


/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @param {Object} [options={}] - additional options
    @param {AeroGear~successCallbackINDEXEDDB} [options.success] - a callback to be called after the successful reading of an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [options.error] - a callback to be called when there is an error reading an IndexedDB
    @return {Object} A jQuery.Deferred promise
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an IndexedDB store
    dm.add({
        name: "newStore",
        storageType: "IndexedDB"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    dm.stores.test1.read( undefined, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });

    //read a record with a particular id
    dm.stores.test1.read( 5, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.read = function( id, options ) {
    options = options || {};

    var transaction, objectStore, cursor, request,
        data = [],
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        deferred = jQuery.Deferred();

    if( !database ) {
        //hasn't been opened yet
        throw "Database not opened";
    }

    if( !database.objectStoreNames.contains( storeName ) ) {
        deferred.resolve( [], "success", options.success );
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
        deferred.resolve( data, "success", options.success );
    };

    transaction.onerror = function( event ) {
        deferred.reject( event, "error", options.error );
    };

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - additional options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @param {AeroGear~successCallbackINDEXEDDB} [options.success] - a callback to be called after the successful saving of a record into an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [options.error] - a callback to be called when there is an error with the saving of a record into an IndexedDB
    @return {Object} A jQuery.Deferred promise
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an IndexedDB store
    dm.add({
        name: "newStore",
        storageType: "IndexedDB"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    dm.stores.newStore.save( { "id": 3, "name": "Grace", "type": "Little Person" }, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });

    //Save multiple Records
    dm.stores.newStore.save(
        [
            { "id": 3, "name": "Grace", "type": "Little Person" },
            { "id": 4, "name": "Graeham", "type": "Really Little Person" }
        ],
        {
            success: function( data ) { ... },
            error: function( error ) { ... }
        }
    );
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.save = function( data, options ) {
    options = options || {};

    var transaction, objectStore,
        that = this,
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        deferred = jQuery.Deferred(),
        i = 0;

    if( !database ) {
        //hasn't been opened yet
        throw "Database not opened";
    }

    transaction = database.transaction( storeName, "readwrite" );
    objectStore = transaction.objectStore( storeName );

    if( options.reset ) {
        objectStore.clear();
    }

    if( AeroGear.isArray( data ) ) {
        for( i; i < data.length; i++ ) {
            objectStore.put( data[ i ] );
        }
    } else {
        objectStore.put( data );
    }

    transaction.oncomplete = function( event ) {
        that.read().done( function( data, status ) {
            if( status === "success" ) {
                deferred.resolve( data, status, options.success );
            } else {
                deferred.reject( data, status, options.error );
            }
        });
    };

    transaction.onerror = function( event ) {
        deferred.reject( event, "error", options.error );
    };

    deferred.always( this.always );

    return deferred.promise();
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @param {AeroGear~successCallbackINDEXEDDB} [options.success] - a callback to be called after successfully removing a record out of an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [options.error] - a callback to be called when there is an error removing a record out of an IndexedDB
    @return {Object} A jQuery.Deferred promise
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an IndexedDB store
    dm.add({
        name: "newStore",
        storageType: "IndexedDB"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    // Delete a record
    dm.stores.newStore.remove( 1, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });

    //Remove all data
    dm.stores.newStore.remove( undefined, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.remove = function( toRemove, options ) {
    options = options || {};

    var objectStore, transaction,
        that = this,
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        deferred = jQuery.Deferred(),
        i = 0;

    if( !database ) {
        //hasn't been opened yet
        throw "Database not opened";
    }

    transaction = database.transaction( storeName, "readwrite" );
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
        that.read().done( function( data, status ) {
            if( status === "success" ) {
                deferred.resolve( data, status, options.success );
            } else {
                deferred.reject( data, status, options.error );
            }
        });
    };

    transaction.onerror = function( event ) {
        deferred.reject( event, "error", options.error );
    };

    deferred.always( this.always );

    return deferred.promise();
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @param {AeroGear~successCallbackINDEXEDDB} [options.success] - a callback to be called after successful filtering of an IndexedDB
    @param {AeroGear~errorCallbackINDEXEDDB} [options.error] - a callback to be calledd after an error filtering of an IndexedDB
    @return {Object} A jQuery.Deferred promise
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an IndexedDB store
    dm.add({
        name: "newStore",
        storageType: "IndexedDB"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });

    dm.stores.test1.filter( { "name": "Lucas" }, true, {
        success: function( data ) { ... },
        error: function( error ) { ... }
    });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.filter = function( filterParameters, matchAny, options ) {
    options = options || {};

    var that = this,
        deferred = jQuery.Deferred(),
        database = this.getDatabase();

    if( !database ) {
        //hasn't been opened yet
        throw "Database not opened";
    }

    this.read().then( function( data, status ) {
        if( status !== "success" ) {
            deferred.reject( data, status, options.error );
            return;
        }

        AeroGear.DataManager.adapters.Memory.prototype.save.call( that, data, true );
        AeroGear.DataManager.adapters.Memory.prototype.filter.call( that, filterParameters, matchAny ).then( function( data ) {
            deferred.resolve( data, "success", options.success );
        });
    });

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Close the current store
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an IndexedDB store and then delete a record
    dm.add({
        name: "newStore",
        storageType: "IndexedDB"
    });

    dm.stores.newStore.close();
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.close = function() {
    var database = this.getDatabase();
    if( database ) {
        database.close();
    }
};

/**
    Validate this adapter and add it to AeroGear.DataManagerCore.adapters if valid
*/
AeroGear.DataManagerCore.validateAdapter( "IndexedDB", AeroGear.DataManager.adapters.IndexedDB );
