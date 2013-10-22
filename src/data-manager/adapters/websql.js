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

    if (!window.openDatabase ) {
        throw "Your browser doesn't support WebSQL";
    }

    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.WebSQL ) ) {
        return new AeroGear.DataManager.adapters.WebSQL( storeName, settings );
    }

    settings = settings || {};

    // Private Instance vars
    var success,
        error,
        database,
        data = null,
        type = "WebSQL",
        recordId = settings.recordId ? settings.recordId : "id";

    // Privileged Methods
    /**
        Returns the value of the private data var
        @private
        @augments WebSQL
        @returns {Array}
     */
    this.getData = function() {
        return data;
    };

    /**
        Sets the value of the private data var
        @private
        @augments WebSQL
     */
    this.setData = function( newData ) {
        data = newData;
    };
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
        Returns the value of the private recordId var
        @private
        @augments WebSQL
        @returns {String}
     */
    this.getRecordId = function() {
        return recordId;
    };
};

// Public Methods
/**
    Open the Database
    @param {Object} [options={}] - options
    @param {AeroGear~successCallbackWEBSQL} [settings.success] - a callback to be called when after successful opening of a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [settings.error] - a callback to be called when there is an error opening a WebSQL DB
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
    })
*/
AeroGear.DataManager.adapters.WebSQL.prototype.open = function( options ) {
    var that = this,
        success,
        error,
        database,
        recordId = this.getRecordId(),
        storeName = this.getStoreName();

    //Do some creation and such
    database = window.openDatabase( storeName, "1", "AeroGear WebSQL Store", 2 * 1024 * 1024 );

    error = function( tx, error ) {
        if( options.error ) {
            options.error.call( this, error );
        }
    };

    success = function( tx, result ) {
        if( options.success ) {
            options.success.call( this, result );
        }
        that.setDatabase( database );
    };

    database.transaction( function( tx ) {
        tx.executeSql( "CREATE TABLE IF NOT EXISTS " + storeName + " ( " + recordId + " REAL UNIQUE, json)", [], success, error );
    });
};

/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @param {Object} [options={}] - additional options
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after successfully reading a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when there is an error reading a WebSQL DB
    @returns {Array} Returns data from the store, optionally filtered by an id
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
    var success,
        error,
        sql,
        data = [],
        storeName = this.getStoreName(),
        database = this.getDatabase(),
        i = 0;

    options = options || {};

    if( !database ) {
        //hasn't been opened yet
        if( options.error ) {
            options.error.call( this, "Database not opened" );
        }

        return;
    }

    error = function( tx, error ) {
        if( options.error ) {
            options.error.call( this, error );
        }
    };

    success = function( tx, result ) {

        for( i; i < result.rows.length; i++ ) {
            data.push( JSON.parse( result.rows.item( i ).json ) );
        }

        if( options.success ) {
            options.success.call( this, data );
        }
    };

    sql = "SELECT * FROM " + storeName;

    if( id ) {
        sql += " where id = " + id;
    }

    database.transaction( function( tx ) {
        tx.executeSql( sql, [], success, error );
    });
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - additional options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after successfully saving records to a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when there is an error saving records to a WebSQL DB
    @returns {Array} Returns the updated data from the store
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

    var that = this,
        error,
        success,
        readSuccess,
        recordId = this.getRecordId(),
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        i = 0;

    if( !database ) {
        //hasn't been opened yet
        if( options.error ) {
            options.error.call( this, "Database not opened" );
        }

        return;
    }

    error = function( tx, error ) {
        if( options.error ) {
            options.error.call( this, error );
        }
    };

    success = function( tx, result ) {
        that.read( undefined, options );
    };

    data = AeroGear.isArray( data ) ? data : [ data ];

    database.transaction( function( tx ) {
        data.forEach( function( value ) {
            //Not Really Thrilled by this.  TODO: find a better way
            tx.executeSql( "DELETE FROM " + storeName + " where id = ? ", [ value[ recordId ] ] );
            tx.executeSql( "INSERT INTO " + storeName + " ( id, json ) values ( ?, ? ) ", [ value[ recordId ], JSON.stringify( value ) ] );
        });
    }, error, success );
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after successfully removing a record from a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when there is an error removing a record from a WebSQL DB
    @returns {Array} Returns the updated data from the store
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

    var that = this,
        sql,
        success,
        error,
        storeName = this.getStoreName(),
        database = this.getDatabase(),
        i = 0;

    if( !database ) {
        //hasn't been opened yet
        if( options.error ) {
            options.error.call( this, "Database not opened" );
        }

        return;
    }

    error = function( tx, error ) {
        if( options.error ) {
            options.error.call( this, error );
        }
    };

    success = function( tx, result ) {
        that.read( undefined, options );
    };

    sql = "Delete from " + storeName;

    if( !toRemove ) {
        //remove all
        database.transaction( function( tx ) {
            tx.executeSql( sql, [], success, error );
        });
    } else  {
        toRemove = AeroGear.isArray( toRemove ) ? toRemove: [ toRemove ];
        database.transaction( function( tx ) {
            for( i; i < toRemove.length; i++ ) {
                if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
                    tx.executeSql( sql + " where id = ? ", [ toRemove[ i ] ] );
                } else if ( toRemove ) {
                    tx.executeSql( sql + " where id = ? ", [ toRemove[ i ][ this.getRecordId() ] ] );
                } else {
                    continue;
                }
            }
        }, error, success );
    }
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called after a successful filtering of a WebSQL DB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be calledd after an error filtering a WebSQL DB
    @returns {Array} Returns a filtered array of data objects based on the contents of the store's data object and the filter parameters. This method only returns a copy of the data and leaves the original data object intact.
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
    var that = this,
        database = this.getDatabase();

    if( !database ) {
        //hasn't been opened yet
        if( options.error ) {
            options.error.call( this, "Database not opened" );
        }

        return;
    }

    this.read( undefined, {
        success: function( data ) {
            AeroGear.DataManager.adapters.Memory.prototype.save.call( that, data, true );
            var newData = AeroGear.DataManager.adapters.Memory.prototype.filter.call( that, filterParameters, matchAny );
            if( options.success ) {
                options.success.call( this, newData );
            }
        }
    });
};
