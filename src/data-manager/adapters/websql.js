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
    The WebSQL adapter stores data in a WebSQL database for more persistent client side storage
    This constructor is instantiated when the "DataManager.add()" method is called
    @constructs AeroGear.DataManager.adapters.WebSQL
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

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

 */
AeroGear.DataManager.adapters.WebSQL = function( storeName, settings ) {

    if ( !window.openDatabase ) {
        throw "Your browser doesn't support WebSQL";
    }

    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.WebSQL ) ) {
        return new AeroGear.DataManager.adapters.WebSQL( storeName, settings );
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
        @augments WebSQL
        @returns {Object}
     */
    this.getDatabase = function() {
        return database;
    };

    /**
        Sets the value of the private database var
        @private
        @augments WebSQL
     */
    this.setDatabase = function( db ) {
        database = db;
    };

    /**
        Returns the value of the private storeName var
        @private
        @augments WebSQL
        @returns {String}
     */
    this.getStoreName = function() {
        return storeName;
    };

    /**
        @private
        @augments WebSQL
        Compatibility fix
        Added in 1.3 to remove in 1.4
    */
    this.getAsync = function() {
        return true;
    };

    /**
        This function will check if the database is open.
        If 'auto' is not true, an error is thrown.
        If 'auto' is true, attempt to open the databse then
        run the function passed in
        @private
        @augments WebSQL
     */
    this.run = function( callback ) {
        var that = this;

        if( !database ) {
            if( !auto ) {
                // hasn't been opened yet
                throw "Database not opened";
            } else {
                this.open()
                    .then( function() {
                        callback.call( that, database );
                    })
                    .catch( function() {
                        throw "Database not opened";
                    });
            }
        } else {
            callback.call( this, database );
        }
    };
};

// Public Methods
/**
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.WebSQL.isValid = function() {
    return !!window.openDatabase;
};

/**
    Open the Database
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
    });

    dm.stores.newStore.open()
        .then(function() { ... })
        .catch(function(error) { ... });
*/
AeroGear.DataManager.adapters.WebSQL.prototype.open = function() {

    var database,
        that = this,
        version = "1",
        databaseSize = 2 * 1024 * 1024,
        recordId = this.getRecordId(),
        storeName = this.getStoreName(),
        success, error;

    // Do some creation and such
    database = window.openDatabase( storeName, version, "AeroGear WebSQL Store", databaseSize );

    return new Promise( function( resolve, reject ) {
        error = function( transaction, error ) {
            reject( error );
        };

        success = function() {
            that.setDatabase( database );
            resolve( database );
        };

        database.transaction( function( transaction ) {
            transaction.executeSql( "CREATE TABLE IF NOT EXISTS '" + storeName + "' ( " + recordId + " REAL UNIQUE, json)", [], success, error );
        });
    });
};

/**
 This method is just for sake of API symmetry with other DataManagers. It immediately returns.
 @private
 @augments base
 */
AeroGear.DataManager.adapters.WebSQL.prototype.close = function() {
};

/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @return {Object} A Promise
    @example
    // Create an empty DataManager
    var dm = AeroGear.DataManager();

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
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
AeroGear.DataManager.adapters.WebSQL.prototype.read = function( id ) {

    var that = this,
        data = [],
        params = [],
        storeName = this.getStoreName(),
        database = this.getDatabase(),
        sql, success, error,
        i = 0;

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function() {

            error = function( transaction, error ) {
                reject( error );
            };

            success = function( transaction, result ) {
                var rowLength = result.rows.length;
                for( i; i < rowLength; i++ ) {
                    data.push( JSON.parse( result.rows.item( i ).json ) );
                }
                resolve( that.decrypt( data ) );
            };

            sql = "SELECT * FROM '" + storeName + "'";

            if( id ) {
                sql += " WHERE ID = ?";
                params = [ id ];
            }

            database.transaction( function( transaction ) {
                transaction.executeSql( sql, params, success, error );
            });
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

    // Add an WebSQL store
    dm.add({
        name: "newStore",
        type: "WebSQL"
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
AeroGear.DataManager.adapters.WebSQL.prototype.save = function( data, options ) {
    options = options || {};

    var that = this,
        recordId = this.getRecordId(),
        storeName = this.getStoreName(),
        error, success;

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function( database ) {

            error = function( transaction, error ) {
                reject( error );
            };

            success = function() {
                that.read()
                    .then( function( newData ) {
                        resolve( newData );
                    })
                    .catch( function( error ) {
                        reject( error );
                    });
            };

            data = Array.isArray( data ) ? data : [ data ];

            database.transaction( function( transaction ) {
                if( options.reset ) {
                    transaction.executeSql( "DROP TABLE " + storeName );
                    transaction.executeSql( "CREATE TABLE IF NOT EXISTS '" + storeName + "' ( " + recordId + " REAL UNIQUE, json)" );
                }
                data.forEach( function( value ) {
                    value = that.encrypt( value );
                    transaction.executeSql( "INSERT OR REPLACE INTO '" + storeName + "' ( id, json ) VALUES ( ?, ? ) ", [ value[ recordId ], JSON.stringify( value ) ] );
                });
            }, error, success );
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
        type: "WebSQL"
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
AeroGear.DataManager.adapters.WebSQL.prototype.remove = function( toRemove ) {

    var that = this,
        storeName = this.getStoreName(),
        sql, success, error,
        i = 0;

    return new Promise( function( resolve, reject ) {
        that.run.call( that, function( database ) {

            error = function( transaction, error ) {
                reject( error );
            };

            success = function() {
                that.read()
                    .then( function( newData ) {
                        resolve( newData );
                    })
                    .catch( function( error ) {
                        reject( error );
                    });
            };

            sql = "DELETE FROM '" + storeName + "'";

            if( !toRemove ) {
                // remove all
                database.transaction( function( transaction ) {
                    transaction.executeSql( sql, [], success, error );
                });
            } else {
                toRemove = Array.isArray( toRemove ) ? toRemove: [ toRemove ];
                database.transaction( function( transaction ) {
                    for( i; i < toRemove.length; i++ ) {
                        if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
                            transaction.executeSql( sql + " WHERE ID = ? ", [ toRemove[ i ] ] );
                        } else if ( toRemove ) {
                            transaction.executeSql( sql + " WHERE ID = ? ", [ toRemove[ i ][ this.getRecordId() ] ] );
                        } else {
                            continue;
                        }
                    }
                }, error, success );
            }
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
        type: "WebSQL"
    });

    dm.stores.newStore.open()
        .then( function() {

        dm.stores.test1.filter( { "name": "Lucas" }, true )
            .then( function( filteredData ) { ... } )
            .catch( function( error ) { ... } );
    });
 */
AeroGear.DataManager.adapters.WebSQL.prototype.filter = function( filterParameters, matchAny ) {

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
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "WebSQL", AeroGear.DataManager.adapters.WebSQL );
