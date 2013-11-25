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
    @param {Boolean} [settings.auto=false] - set to 'true' to enable 'auto-connect' for read/remove/save/filter
    @param {Object} [settings.crypto] - the crypto settings to be passed to the adapter
    @param {Object} [settings.crypto.agcrypto] - the AeroGear.Crypto object to be used
    @param {Object} [settings.crypto.options] - the specific options for the AeroGear.Crypto encrypt/decrypt methods
    @returns {Object} The created store
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an WebSQL store
    dm.add({
        name: "newStore",
        storageType: "WebSQL"
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
        auto = settings.auto;

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
                //hasn't been opened yet
                throw "Database not opened";
            } else {
                this.open().always( function( value, status ) {
                    if( status === "error" ) {
                        throw "Database not opened";
                    } else {
                        callback.call( that, database );
                    }
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
    @param {Object} [options={}] - options
    @param {AeroGear~successCallbackWEBSQL} [settings.success] - a callback to be called when after successful opening of a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [settings.error] - a callback to be called when there is an error opening a WebSQL DB
    @return {Object} A jQuery.Deferred promise
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an WebSQL store
    dm.add({
        name: "newStore",
        storageType: "WebSQL"
    });

    dm.stores.newStore.open({
        success: function() { ... },
        error: function() { ... }
    });
*/
AeroGear.DataManager.adapters.WebSQL.prototype.open = function( options ) {
    options = options || {};

    var success, error, database,
        that = this,
        version = "1",
        databaseSize = 2 * 1024 * 1024,
        recordId = this.getRecordId(),
        storeName = this.getStoreName(),
        deferred = jQuery.Deferred();

    //Do some creation and such
    database = window.openDatabase( storeName, version, "AeroGear WebSQL Store", databaseSize );

    error = function( transaction, error ) {
        deferred.reject( error, "error", options.error );
    };

    success = function( transaction, result ) {
        that.setDatabase( database );
        deferred.resolve( database, "success", options.success );
    };

    database.transaction( function( transaction ) {
        transaction.executeSql( "CREATE TABLE IF NOT EXISTS " + storeName + " ( " + recordId + " REAL UNIQUE, json)", [], success, error );
    });

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @param {Object} [options={}] - additional options
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after successfully reading a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when there is an error reading a WebSQL DB
    @return {Object} A jQuery.Deferred promise
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an WebSQL store
    dm.add({
        name: "newStore",
        storageType: "WebSQL"
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
AeroGear.DataManager.adapters.WebSQL.prototype.read = function( id, options ) {
    options = options || {};

    var success, error, sql, _read,
        that = this,
        data = [],
        storeName = this.getStoreName(),
        database = this.getDatabase(),
        deferred = jQuery.Deferred(),
        i = 0;

    _read = function( database ) {
        error = function( transaction, error ) {
            deferred.reject( error, "error", options.error );
        };

        success = function( transaction, result ) {
            var rowLength = result.rows.length;
            for( i; i < rowLength; i++ ) {
                data.push( JSON.parse( result.rows.item( i ).json ) );
            }
            deferred.resolve( that.decrypt( data ), "success", options.success );
        };

        sql = "SELECT * FROM " + storeName;

        if( id ) {
            sql += " WHERE ID = " + id;
        }

        database.transaction( function( transaction ) {
            transaction.executeSql( sql, [], success, error );
        });
    };

    this.run.call( this, _read );

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - additional options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after successfully saving records to a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when there is an error saving records to a WebSQL DB
    @return {Object} A jQuery.Deferred promise
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an WebSQL store
    dm.add({
        name: "newStore",
        storageType: "WebSQL"
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
AeroGear.DataManager.adapters.WebSQL.prototype.save = function( data, options ) {
    options = options || {};

    var error, success, readSuccess, _save,
        that = this,
        recordId = this.getRecordId(),
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        deferred = jQuery.Deferred(),
        i = 0;

    _save = function( database ) {
        error = function( transaction, error ) {
        deferred.reject( error, "error", options.error );
    };

    success = function( transaction, result ) {
        that.read().done( function( result, status ) {
                if( status === "success" ) {
                    deferred.resolve( result, status, options.success );
                } else {
                    deferred.reject( result, status, options.error );
                }
            });
        };

        data = AeroGear.isArray( data ) ? data : [ data ];

        database.transaction( function( transaction ) {
            if( options.reset ) {
                transaction.executeSql( "DROP TABLE " + storeName );
                transaction.executeSql( "CREATE TABLE IF NOT EXISTS " + storeName + " ( " + recordId + " REAL UNIQUE, json)" );
            }
            data.forEach( function( value ) {
                value = that.encrypt( value );
                transaction.executeSql( "INSERT OR REPLACE INTO " + storeName + " ( id, json ) VALUES ( ?, ? ) ", [ value[ recordId ], JSON.stringify( value ) ] );
            });
        }, error, success );
    };

    this.run.call( this, _save );

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after successfully removing a record from a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when there is an error removing a record from a WebSQL DB
    @return {Object} A jQuery.Deferred promise
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an IndexedDB store
    dm.add({
        name: "newStore",
        storageType: "WebSQL"
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
AeroGear.DataManager.adapters.WebSQL.prototype.remove = function( toRemove, options ) {
    options = options || {};

    var sql, success, error, _remove,
        that = this,
        storeName = this.getStoreName(),
        database = this.getDatabase(),
        deferred = jQuery.Deferred(),
        i = 0;

    _remove = function( database ) {
        error = function( transaction, error ) {
            deferred.reject( error, "error", options.error );
        };

        success = function( transaction, result ) {
            that.read().done( function( result, status ) {
                if( status === "success" ) {
                    deferred.resolve( result, status, options.success );
                } else {
                    deferred.reject( result, status, options.error );
                }
            });
        };

        sql = "DELETE FROM " + storeName;

        if( !toRemove ) {
            //remove all
            database.transaction( function( transaction ) {
                transaction.executeSql( sql, [], success, error );
            });
        } else {
            toRemove = AeroGear.isArray( toRemove ) ? toRemove: [ toRemove ];
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
    };

    this.run.call( this, _remove );

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after a successful filtering of a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be calledd after an error filtering a WebSQL DB
    @return {Object} A jQuery.Deferred promise
    @example
    //Create an empty DataManager
    var dm = AeroGear.DataManager();

    //Add an IndexedDB store
    dm.add({
        name: "newStore",
        storageType: "WebSQL"
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
AeroGear.DataManager.adapters.WebSQL.prototype.filter = function( filterParameters, matchAny, options ) {
    options = options || {};

    var _filter,
        that = this,
        deferred = jQuery.Deferred(),
        db = this.getDatabase();

    _filter = function() {
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
    };

    this.run.call( this, _filter );

    deferred.always( this.always );
    return deferred.promise();
};

/**
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "WebSQL", AeroGear.DataManager.adapters.WebSQL );
