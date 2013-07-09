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
    The WebSQL adapter
    This constructor is instantiated when the "DataManager.add()" method is called
    @constructs AeroGear.DataManager.adapters.WebSQL
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @param {AeroGear~successCallbackWEBSQL} [settings.success] - a callback to be called when after successful creation/opening of an IndexedDB
    @param {AeroGear~errorCallbackWEBSQL} [settings.error] - a callback to be called when the there is an error with the creation/opening of an IndexedDB
    @returns {Object} // TODO,  should this return a promise?
    @example
    // TODO

 */
AeroGear.DataManager.adapters.WebSQL = function( storeName, settings ) {

    if (!window.openDatabase ) {
        //console.log( "Your browser doesn't support WebSQL" );
        return;
    }

    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.WebSQL ) ) {
        return new AeroGear.DataManager.adapters.WebSQL( storeName, settings );
    }

    settings = settings || {};

    // Private Instance vars
    var recordId = settings.recordId ? settings.recordId : "id",
        type = "WebSQL",
        data = null,
        success,
        error,
        database,
        objectStore;

    //Do some creation and such
    database = window.openDatabase( storeName, "1", "AeroGear WebSQL Store", 2 * 1024 * 1024 );

    error = function( tx, error ) {
        if( settings.error ) {
            settings.error.call( this, error );
        }
    };

    success = function( tx, result ) {
        if( settings.success ) {
            settings.success.call( this, result );
        }
    };

    database.transaction( function( tx ) {
        tx.executeSql( "CREATE TABLE IF NOT EXISTS " + storeName + " ( " + recordId + " REAL UNIQUE, json)", [], success, error );
    });

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

    /**
        Little utility used to compare nested object values in the filter method
        @private
        @augments WebSQL
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
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called when after successful creation/opening of an IndexedDB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when the there is an error with the creation/opening of an IndexedDB
    @returns {Array} Returns data from the store, optionally filtered by an id
    @example
    //TODO

 */
AeroGear.DataManager.adapters.WebSQL.prototype.read = function( id, options ) {
    var database,
        storeName = this.getStoreName(),
        success,
        error,
        sql,
        data = [],
        i = 0;

    options = options || {};

    database = this.getDatabase();

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
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called when after successful creation/opening of an IndexedDB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when the there is an error with the creation/opening of an IndexedDB
    @returns {Array} Returns the updated data from the store
    @example
    // TODO
 */
AeroGear.DataManager.adapters.WebSQL.prototype.save = function( data, options ) {
    options = options || {};

    var that = this,
        recordId = this.getRecordId(),
        database = this.getDatabase(),
        storeName = this.getStoreName(),
        sql,
        error,
        success,
        i = 0;

    error = function( tx, error ) {
        if( options.error ) {
            options.error.call( this, error );
        }
    };

    success = function( tx, result ) {
        that.read( undefined, options );
    };

    //Need to check existence of record in database first
    this.read( data[ recordId ], {
        success: function( result ) {
            if( result.length ) {
                sql = "Update " + storeName + " set id = ?,  json = ? ";
            } else {
                sql = "INSERT INTO " + storeName + " ( id, json ) values ( ?, ? ) ";
            }

            database.transaction( function( tx ) {
                tx.executeSql( sql, [ data[ recordId ], JSON.stringify( data ) ], success, error );
            });
        },
        error: error
    });

    if( AeroGear.isArray( data ) ) {
        for( i; i < data.length; i++ ){
            //TODO
            console.log( "TODO" );
        }
    }
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @param {AeroGear~successCallbackWEBSQL} [options.success] - a callback to be called when after successful creation/opening of an IndexedDB
    @param {AeroGear~errorCallbackWEBSQL} [options.error] - a callback to be called when the there is an error with the creation/opening of an IndexedDB
    @returns {Array} Returns the updated data from the store
    @example
    // TODO

 */
AeroGear.DataManager.adapters.WebSQL.prototype.remove = function( toRemove, options ) {
    options = options || {};

    var that = this,
        storeName = this.getStoreName(),
        db = this.getDatabase(),
        sql,
        success,
        error,
        i = 0;

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
        db.transaction( function( tx ) {
            tx.executeSql( sql, [], success, error );
        });
    } else if( AeroGear.isArray( toRemove ) ) {
        for( i; i < toRemove.length; i++ ) {
            //request = objectStore.delete( toRemove[ i ].id );
            console.log( "todo" );
        }
    } else {
        db.transaction( function( tx ) {
            tx.executeSql( sql + "where id = ?", [ toRemove ], success, error );
        });
    }
};
