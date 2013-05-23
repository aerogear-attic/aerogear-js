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
    The IndexedDB adapter is the default type used when creating a new store. Data is simply stored in a data var and is lost on unload (close window, leave page, etc.)
    This constructor is instantiated when the "DataManager.add()" method is called
    @constructs AeroGear.DataManager.adapters.IndexedDB
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @returns {Object} The created store
    @example
//Create an empty DataManager
var dm = AeroGear.DataManager();

//Add a custom IndexedDB store
dm.add( "newStore", {
    recordId: "customID"
});
 */
AeroGear.DataManager.adapters.IndexedDB = function( storeName, settings ) {
    //Make sure we can do this
    window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

    if (!window.indexedDB) {
        //console.log( "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available." );
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
        database,
        objectStore,
        version; //TODO: be a promise

    //Do some creation and such
    request = window.indexedDB.open( storeName );

    request.onsuccess = function( event ) {
        version = event.target.result.version;
        database = event.target.result;

        if( settings.success ) {
            settings.success.call( this, database );
        }
    };

    request.onerror = function( event ) {
        if( settings.error ) {
            settings.error.call( this, event.target.error );
        }
    };

    request.onupgradeneeded = function( event ) {
        database = event.target.result;
        objectStore = database.createObjectStore( storeName, { keyPath: recordId } );
            //TODO: set up indexes?
        version = event.newVersion;
    };


    this.getDatabase = function() {
        return database;
    };

    this.setDatabase = function( db ) {
        database = db;
    };

    this.getVersion = function() {
        return version;
    };

    this.setVersion = function( newVersion ) {
        version = newVersion;
    };

    this.getStoreName = function() {
        return storeName;
    };

    // Privileged Methods
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
        Returns the value of the private data var
        @private
        @augments IndexedDB
        @returns {Array}
     */
    this.getData = function() {
        return data;
    };

    /**
        Sets the value of the private data var
        @private
        @augments IndexedDB
     */
    this.setData = function( newData ) {
        data = newData;
    };

    /**
        Empties the value of the private data var
        @private
        @augments IndexedDB
     */
    this.emptyData = function() {
        data = null;
    };

    /**
        Adds a record to the store's data set
        @private
        @augments IndexedDB
     */
    this.addDataRecord = function( record ) {
        data = data || [];
        data.push( record );
    };

    /**
        Adds a record to the store's data set
        @private
        @augments IndexedDB
     */
    this.updateDataRecord = function( index, record ) {
        data[ index ] = record;
    };

    /**
        Removes a single record from the store's data set
        @private
        @augments IndexedDB
     */
    this.removeDataRecord = function( index ) {
        data.splice( index, 1 );
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
    @returns {Array} Returns data from the store, optionally filtered by an id
    @example
var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

// Get an array of all data in the store
var allData = dm.read();

//Read a specific piece of data based on an id
var justOne = dm.read( 12345 );
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.read = function( id, settings ) {
    var db,
        transaction,
        storeName = this.getStoreName(),
        objectStore,
        data = [],
        cursor,
        request;

    settings = settings || {};

    db = this.getDatabase();

    if( !db.objectStoreNames.contains( storeName ) ) {
        return [];
    }

    transaction = db.transaction( storeName );
    objectStore = transaction.objectStore( storeName );

    if( id ) {
        request = objectStore.get( id );

        request.onsuccess = function( event ) {
            data.push( request.result );
        };

        request.onerror = function( event ) {
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
        if( settings.success ) {
            settings.success.call( this, data );
        }
    };

    transaction.onerror = function( event ) {
        if( settings.error ) {
            settings.error.call( this, event );
        }
    };
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Boolean} [reset] - If true, this will empty the current data and set it to the data being saved
    @returns {Array} Returns the updated data from the store
    @example
var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

// Store a new task
dm.save({
    title: "Created Task",
    date: "2012-07-13",
    ...
});

//Store an array of new Tasks
dm.save([
    {
        title: "Task2",
        date: "2012-07-13"
    },
    {
        title: "Task3",
        date: "2012-07-13"
        ...
    }
]);

// Update an existing piece of data
var toUpdate = dm.read()[ 0 ];
toUpdate.data.title = "Updated Task";
dm.save( toUpdate );
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.save = function( data, settings ) {
    settings = settings || {};

    var that = this,
        db = this.getDatabase(),
        transaction,
        storeName = this.getStoreName(),
        objectStore,
        request,
        i = 0;

    transaction = db.transaction( storeName, "readwrite" );
    objectStore = transaction.objectStore( storeName );

    if( AeroGear.isArray( data ) ) {
        for( i; i < data.length; i++ ){
            request = objectStore.put( data[ i ] );
        }
    } else {
        request = objectStore.put( data );
    }

    transaction.oncomplete = function( event ) {
        if( settings.success ) {
            that.read( undefined, settings );
        }
    };

    transaction.onerror = function( event ) {
        if( settings.error ) {
            settings.error.call( this, event );
        }
    };
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @returns {Array} Returns the updated data from the store
    @example
var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

// Store a new task
dm.save({
    title: "Created Task"
});

// Store another new task
dm.save({
    title: "Another Created Task"
});

// Store one more new task
dm.save({
    title: "And Another Created Task"
});

// Remove a particular item from the store by its id
var toRemove = dm.read()[ 0 ];
dm.remove( toRemove.id );

// Remove an item from the store using the data object
toRemove = dm.read()[ 0 ];
dm.remove( toRemove );

// Delete all remaining data from the store
dm.remove();
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.remove = function( toRemove, settings ) {
    settings = settings || {};

    var that = this,
        db = this.getDatabase(),
        transaction,
        storeName = this.getStoreName(),
        objectStore,
        request,
        i = 0;

    transaction = db.transaction( storeName, "readwrite" );
    objectStore = transaction.objectStore( storeName );

    if( !toRemove ) {
        request = objectStore.clear();
    } else if( AeroGear.isArray( toRemove ) ) {
        for( i; i < toRemove.length; i++ ) {
            request = objectStore.delete( toRemove[ i ].id );
        }
    } else {
        request = objectStore.delete( toRemove );
    }

    transaction.oncomplete = function( event ) {
        if( settings.success ) {
            that.read( undefined, settings );
        }
    };

    transaction.onerror = function( event ) {
        if( settings.error ) {
            settings.error.call( this, event );
        }
    };
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @returns {Array} Returns a filtered array of data objects based on the contents of the store's data object and the filter parameters. This method only returns a copy of the data and leaves the original data object intact.
    @example
var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

// An object can be passed to filter the data
// This would return all records with a user named 'admin' **AND** a date of '2012-08-01'
var filteredData = dm.filter({
    date: "2012-08-01",
    user: "admin"
});

// The matchAny parameter changes the search to an OR operation
// This would return all records with a user named 'admin' **OR** a date of '2012-08-01'
var filteredData = dm.filter({
    date: "2012-08-01",
    user: "admin"
}, true);
 */
AeroGear.DataManager.adapters.IndexedDB.prototype.filter = function( filterParameters, matchAny ) {
    return "TODO";
};

//AeroGear.DataManager.adapters.IndexedDB.prototype.



