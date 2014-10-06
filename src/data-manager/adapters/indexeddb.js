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
    @param {Boolean} [settings.auto=true] - set to 'false' to disable 'auto-connect' for read/remove/save/filter
    @param {Object} [settings.crypto] - the crypto settings to be passed to the adapter
    @param {Object} [settings.crypto.agcrypto] - the AeroGear.Crypto object to be used
    @param {Object} [settings.crypto.options] - the specific options for the AeroGear.Crypto encrypt/decrypt methods
    @returns {Object} The created store
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
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
    var database,
        auto = ( settings.auto === undefined || settings.auto ) ? true : false;

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

    /**
        This function will check if the database is open.
        If 'auto' is not true, an error is thrown.
        If 'auto' is true, attempt to open the database then
        run the function passed in
        @private
        @augments IndexedDB
     */
    this.run = function( fn ) {
        var that = this;

        if( !database ) {
            if( !auto ) {
                // hasn't been opened yet
                throw "Database not opened";
            } else {
                this.open()
                    .then( function( value, status ) {
                        if( status === "error" ) {
                            throw "Database not opened";
                        } else {
                            fn.call( that, database );
                        }
                    });
            }
        } else {
            fn.call( this, database );
        }
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
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open()
        .then(function() { ... })
        .catch(function(error) { ... });
*/
AeroGear.DataManager.adapters.IndexedDB.prototype.open = function() {

    var request, database,
        that = this,
        storeName = this.getStoreName(),
        recordId = this.getRecordId();

    return new Promise( function( resolve, reject ) {
        // Attempt to open the indexedDB database
        request = window.indexedDB.open( storeName );

        request.onsuccess = function( event ) {
            database = event.target.result;
            that.setDatabase( database );
            resolve( database );
        };

        request.onerror = function( event ) {
            reject( event );
        };

        // Only called when the database doesn't exist and needs to be created
        request.onupgradeneeded = function( event ) {
            database = event.target.result;
            database.createObjectStore( storeName, { keyPath: recordId } );
        };
    });
};


/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open()
        .then( function() {

            // read all records
            dm.stores.test1.read( undefined )
                .then( function( data ) { ... } )
                .catch( function( error ) { ... } );

            // read a record with a particular id
            dm.stores.test1.read( 5 )
                .then( function( data ) { ... } )
                .catch( function( error ) { ... } );
        });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.read = function( id ) {

    var transaction, objectStore, cursor, request,
        that = this,
        data = [],
        storeName = this.getStoreName();

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function( database ) {

            if( !database.objectStoreNames.contains( storeName ) ) {
                return resolve( [] );
            }

            transaction = database.transaction( storeName );
            objectStore = transaction.objectStore( storeName );

            if( id ) {
                request = objectStore.get( id );

                request.onsuccess = function() {
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

            transaction.oncomplete = function() {
                resolve( that.decrypt( data ));
            };

            transaction.onerror = function( event ) {
                reject( event );
            };
        });
    });
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - additional options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open()
        .then( function() {

            // save one record
            dm.stores.newStore.save( { "id": 3, "name": "Grace", "type": "Little Person" })
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );

            // save multiple Records
            dm.stores.newStore.save([
                    { "id": 3, "name": "Grace", "type": "Little Person" },
                    { "id": 4, "name": "Graeham", "type": "Really Little Person" }
                ])
                .then( function( newData ) { ... } )
                .catch( function( error ) { ... } );
        });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.save = function( data, options ) {
    options = options || {};

    var transaction, objectStore,
        that = this,
        storeName = this.getStoreName(),
        i = 0;

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function( database ) {
            transaction = database.transaction( storeName, "readwrite" );
            objectStore = transaction.objectStore( storeName );

            if( options.reset ) {
                objectStore.clear();
            }

            if( Array.isArray( data ) ) {
                for( i; i < data.length; i++ ) {
                    objectStore.put( this.encrypt( data[ i ] ) );
                }
            } else {
                objectStore.put( this.encrypt( data ) );
            }

            transaction.oncomplete = function() {
                that.read()
                    .then( function( newData ) {
                        resolve( newData );
                    })
                    .catch( function() {
                        reject( data, status );
                    });
            };

            transaction.onerror = function( event ) {
                reject( event );
            };
        });
    });
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open()
        .then( function() {

        // remove one record
        dm.stores.newStore.remove( 1 )
            .then( function( newData ) { ... } )
            .catch( function( error ) { ... } );

        // save multiple Records
        dm.stores.newStore.remove( undefined )
            .then( function( newData ) { ... } )
            .catch( function( error ) { ... } );
      });
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.remove = function( toRemove ) {

    var objectStore, transaction,
        that = this,
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        i = 0;

    return new Promise( function( resolve, reject) {
        that.run.call( that, function() {
            transaction = database.transaction( storeName, "readwrite" );
            objectStore = transaction.objectStore( storeName );

            if( !toRemove ) {
               objectStore.clear();
            } else  {
               toRemove = Array.isArray( toRemove ) ? toRemove: [ toRemove ];

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

            transaction.oncomplete = function() {
                that.read()
                    .then( function( newData ) {
                        resolve( newData );
                    })
                    .catch( function( error ) {
                        reject( error );
                    });
            };

            transaction.onerror = function( event ) {
               reject( event );
            };
        });
    });
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key/value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store
    dm.add({
        name: "newStore",
        type: "IndexedDB"
    });

    dm.stores.newStore.open()
        .then( function() {

        dm.stores.test1.filter( { "name": "Lucas" }, true )
            .then( function( filteredData ) { ... } )
            .catch( function( error ) { ... } );
    });

 */
AeroGear.DataManager.adapters.IndexedDB.prototype.filter = function( filterParameters, matchAny ) {

    var that = this;

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function() {
            this.read()
                .then( function( data ) {
                    AeroGear.DataManager.adapters.Memory.prototype.save.call( that, data, true );
                    AeroGear.DataManager.adapters.Memory.prototype.filter.call( that, filterParameters, matchAny ).then( function( filteredData ) {
                        resolve( filteredData );
                    });
                })
                .catch( function( error ) {
                    reject( error );
                });
        });
    });
};

/**
    Close the current store
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an IndexedDB store and then delete a record
    dm.add({
        name: "newStore",
        type: "IndexedDB"
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
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "IndexedDB", AeroGear.DataManager.adapters.IndexedDB );
