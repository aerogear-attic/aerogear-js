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
    The Memory adapter is the default type used when creating a new store. Data is simply stored in a data var and is lost on unload (close window, leave page, etc.)
    This constructor is instantiated when the "DataManager.add()" method is called
    @status Stable
    @constructs AeroGear.DataManager.adapters.Memory
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {Boolean} [settings.async=false] -  If true, all operations will be simulated as asynchronous and return a promise. This is a compatibility option for the Memory and SessionLocal adapters only for 1.3.0 and will be removed in the 1.4.0 release
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @returns {Object} The created store
    @example
//Create an empty DataManager
var dm = AeroGear.DataManager();

//Add a custom memory store
dm.add( "newStore", {
    recordId: "customID"
});
 */
AeroGear.DataManager.adapters.Memory = function( storeName, settings ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.Memory ) ) {
        return new AeroGear.DataManager.adapters.Memory( storeName, settings );
    }

    AeroGear.DataManager.adapters.base.apply( this, arguments );
    /**
        Empties the value of the private data var
        @private
        @augments Memory
     */
    this.emptyData = function() {
        this.setData( null );
    };

    /**
        Adds a record to the store's data set
        @private
        @augments Memory
     */
    this.addDataRecord = function( record ) {
        this.getData().push( record );
    };

    /**
        Adds a record to the store's data set
        @private
        @augments Memory
     */
    this.updateDataRecord = function( index, record ) {
        this.getData()[ index ] = record;
    };

    /**
        Removes a single record from the store's data set
        @private
        @augments Memory
     */
    this.removeDataRecord = function( index ) {
        this.getData().splice( index, 1 );
    };

    /**
        A Function for a jQuery.Deferred to always call
        @private
        @augments Memory
     */
    this.always = function( value, status, callback ) {
        if( callback ) {
            callback.call( this, value, status );
        }
    };

    /**
        Returns the value of the async setting
        @private
        @augments Memory
        Compatibility fix
        Added in 1.3 to remove in 1.4
    */
    this.getAsync = function() {
        return settings && settings.async ? true : false;
    };

    /**
        Returns a synchronous jQuery.Deferred for api symmetry
        @private
        @augments base
     */
    this.open = function( options ) {
        return jQuery.Deferred().resolve( undefined, "success", options && options.success );
    };

    /**
        Returns a synchronous jQuery.Deferred for api symmetry
        @private
        @augments base
    */
    this.close = function() {
        //purposefully left empty
    };

    /**
        Little utility used to compare nested object values in the filter method
        @private
        @augments Memory
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
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.Memory.isValid = function() {
    return true;
};

/**
    Read data from a store
    @param {String|Number} [id] - Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
    @param {Object} [options={}] - options
    @param {AeroGear~successCallbackMEMORY} [options.success] - a callback to be called after successfully reading a Memory Store -  this read is synchronous but the callback is provided for API symmetry.
    @returns {Object} A jQuery.Deferred promise
    @returns {Array} @deprecated Returns data from the store, optionally filtered by an id
    @example
var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

// Get an array of all data in the store
var allData = dm.read();

//Read a specific piece of data based on an id
var justOne = dm.read( 12345 );
 */
AeroGear.DataManager.adapters.Memory.prototype.read = function( id, options ) {
    var filter = {},
        data,
        deferred = jQuery.Deferred(),
        async = this.getAsync(); //added in 1.3.0,  will be removed in 1.4.0;

    filter[ this.getRecordId() ] = id;
    if( id ) {
        if( async ) {
            this.filter( filter ).then( function( filtered ) { data = filtered; } );
        } else {
            data = this.filter( filter );
        }
    } else {
        data = this.getData();
    }
    //data = id ? this.filter( filter ).then( function( data ) {  } ) : this.getData();
    if( async ) {
        deferred.always( this.always );
        return deferred.resolve( data, "success", options ? options.success : undefined );
    } else {
        return data;
    }
};

/**
    Saves data to the store, optionally clearing and resetting the data
    @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
    @param {Object} [options={}] - options
    @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
    @param {AeroGear~successCallbackMEMORY} [options.success] - a callback to be called after successfully saving data from a Memory Store -  this save is synchronous but the callback is provided for API symmetry.
    @returns {Object} A jQuery.Deferred promise
    @returns {Array} @deprecated Returns the updated data from the store
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
AeroGear.DataManager.adapters.Memory.prototype.save = function( data, options ) {
    var itemFound = false,
        deferred = jQuery.Deferred(),
        async = this.getAsync(); //added in 1.3.0,  will be removed in 1.4.0

    data = AeroGear.isArray( data ) ? data : [ data ];

    if ( options && options.reset ) {
        this.setData( data );
    } else {
        if ( this.getData() ) {
            for ( var i = 0; i < data.length; i++ ) {
                for( var item in this.getData() ) {
                    if ( this.getData()[ item ][ this.getRecordId() ] === data[ i ][ this.getRecordId() ] ) {
                        this.updateDataRecord( item, data[ i ] );
                        itemFound = true;
                        break;
                    }
                }
                if ( !itemFound ) {
                    this.addDataRecord( data[ i ] );
                }

                itemFound = false;
            }
        } else {
            this.setData( data );
        }
    }
    if( async ) {
        deferred.always( this.always );
        return deferred.resolve( this.getData(), "success", options ? options.success : undefined );
    } else {
        return this.getData();
    }
};

/**
    Removes data from the store
    @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
    @param {Object} [options={}] - options
    @param {AeroGear~successCallbackMEMORY} [options.success] - a callback to be called after successfully removing data from a  Memory Store -  this remove is synchronous but the callback is provided for API symmetry.
    @returns {Object} A jQuery.Deferred promise
    @returns {Array} @deprecated Returns the updated data from the store
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
AeroGear.DataManager.adapters.Memory.prototype.remove = function( toRemove, options ) {
    var delId, data, item,
        deferred = jQuery.Deferred(),
        async = this.getAsync(); //added in 1.3.0,  will be removed in 1.4.0

    deferred.always( this.always );

    if ( !toRemove ) {
        // empty data array and return
        this.emptyData();
        return async ? deferred.resolve( this.getData(), "success", options ? options.success : undefined ) : this.getData();
    } else {
        toRemove = AeroGear.isArray( toRemove ) ? toRemove : [ toRemove ];
    }

    for ( var i = 0; i < toRemove.length; i++ ) {
        if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
            delId = toRemove[ i ];
        } else if ( toRemove ) {
            delId = toRemove[ i ][ this.getRecordId() ];
        } else {
            // Missing record id so just skip this item in the arrray
            continue;
        }

        data = this.getData( true );
        for( item in data ) {
            if ( data[ item ][ this.getRecordId() ] === delId ) {
                this.removeDataRecord( item );
            }
        }
    }

    return async ? deferred.resolve( this.getData(), "success", options ? options.success : undefined ) : this.getData();
};

/**
    Filter the current store's data
    @param {Object} [filterParameters] - An object containing key value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
    @param {Boolean} [matchAny] - When true, an item is included in the output if any of the filter parameters is matched.
    @param {Object} [options={}] - options
    @param {AeroGear~successCallbackMEMORY} [options.success] - a callback to be called after successfully filter data from a Memory Store -  this filter is synchronous but the callback is provided for API symmetry.
    @return {Object} A jQuery.Deferred promise
    @returns {Array} @deprecated Returns a filtered array of data objects based on the contents of the store's data object and the filter parameters. This method only returns a copy of the data and leaves the original data object intact.
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
AeroGear.DataManager.adapters.Memory.prototype.filter = function( filterParameters, matchAny, options ) {
    var filtered, key, j, k, l, nestedKey, nestedFilter, nestedValue,
        that = this,
        deferred = jQuery.Deferred(),
        async = this.getAsync(); //Added in 1.3.0  Will Be Removed in 1.4.0

    deferred.always( this.always );

    if ( !filterParameters ) {
        filtered = this.getData() || [];
        //Added in 1.3.0  Will Be Removed in 1.4.0
        return async ? deferred.resolve( filtered, "success", options ? options.success : undefined ) : filtered;
        //return deferred.resolve( filtered, "success", options ? options.success : undefined );
    }

    filtered = this.getData().filter( function( value, index, array) {
        var match = matchAny ? false : true,
            keys = Object.keys( filterParameters ),
            filterObj, paramMatch, paramResult;

        for ( key = 0; key < keys.length; key++ ) {
            if ( filterParameters[ keys[ key ] ].data ) {
                // Parameter value is an object
                filterObj = filterParameters[ keys[ key ] ];
                paramResult = filterObj.matchAny ? false : true;

                for ( j = 0; j < filterObj.data.length; j++ ) {
                    if( AeroGear.isArray( value[ keys[ key ] ] ) ) {
                        if( value[ keys [ key ] ].length ) {
                            if( jQuery( value[ keys ] ).not( filterObj.data ).length === 0 && jQuery( filterObj.data ).not( value[ keys ] ).length === 0 ) {
                                paramResult = true;
                                break;
                            } else {
                                for( k = 0; k < value[ keys[ key ] ].length; k++ ) {
                                    if ( filterObj.matchAny && filterObj.data[ j ] === value[ keys[ key ] ][ k ] ) {
                                        // At least one value must match and this one does so return true
                                        paramResult = true;
                                        if( matchAny ) {
                                            break;
                                        } else {
                                            for( l = 0; l < value[ keys[ key ] ].length; l++ ) {
                                                if( !matchAny && filterObj.data[ j ] !== value[ keys[ key ] ][ l ] ) {
                                                    // All must match but this one doesn't so return false
                                                    paramResult = false;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    if ( !filterObj.matchAny && filterObj.data[ j ] !== value[ keys[ key ] ][ k ] ) {
                                        // All must match but this one doesn't so return false
                                        paramResult = false;
                                        break;
                                    }
                                }
                            }
                        } else {
                            paramResult = false;
                        }
                    } else {
                        if ( typeof filterObj.data[ j ] === "object" ) {
                            if ( filterObj.matchAny && that.traverseObjects( keys[ key ], filterObj.data[ j ], value[ keys[ key ] ] ) ) {
                                // At least one value must match and this one does so return true
                                paramResult = true;
                                break;
                            }
                            if ( !filterObj.matchAny && !that.traverseObjects( keys[ key ], filterObj.data[ j ], value[ keys[ key ] ] ) ) {
                                // All must match but this one doesn't so return false
                                paramResult = false;
                                break;
                            }
                        } else {
                            if ( filterObj.matchAny && filterObj.data[ j ] === value[ keys[ key ] ] ) {
                                // At least one value must match and this one does so return true
                                paramResult = true;
                                break;
                            }
                            if ( !filterObj.matchAny && filterObj.data[ j ] !== value[ keys[ key ] ] ) {
                                // All must match but this one doesn't so return false
                                paramResult = false;
                                break;
                            }
                        }
                    }
                }
            } else {
                // Filter on parameter value
                if( AeroGear.isArray( value[ keys[ key ] ] ) ) {
                    paramResult = matchAny ? false: true;

                    if( value[ keys[ key ] ].length ) {
                        for(j = 0; j < value[ keys[ key ] ].length; j++ ) {
                            if( matchAny && filterParameters[ keys[ key ] ] === value[ keys[ key ] ][ j ]  ) {
                                //at least one must match and this one does so return true
                                paramResult = true;
                                break;
                            }
                            if( !matchAny && filterParameters[ keys[ key ] ] !== value[ keys[ key ] ][ j ] ) {
                                //All must match but this one doesn't so return false
                                paramResult = false;
                                break;
                            }
                        }
                    } else {
                        paramResult = false;
                    }
                } else {
                    if ( typeof filterParameters[ keys[ key ] ] === "object" ) {
                        paramResult = that.traverseObjects( keys[ key ], filterParameters[ keys[ key ] ], value[ keys[ key ] ] );
                    } else {
                        paramResult = filterParameters[ keys[ key ] ] === value[ keys[ key ] ] ? true : false;
                    }
                }
            }

            if ( matchAny && paramResult ) {
                // At least one item must match and this one does so return true
                match = true;
                break;
            }
            if ( !matchAny && !paramResult ) {
                // All must match but this one doesn't so return false
                match = false;
                break;
            }
        }

        return match;
    });
    //Added in 1.3.0  Will Be Removed in 1.4.0
    return async ? deferred.resolve( filtered, "success", options ? options.success : undefined ) : filtered;
    //return deferred.resolve( filtered, "success", options ? options.success : undefined );
};

/**
    Validate this adapter and add it to AeroGear.DataManagerCore.adapters if valid
*/
AeroGear.DataManager.validateAdapter( "Memory", AeroGear.DataManager.adapters.Memory );
