(function( aerogear, $, undefined ) {
    /**
     * aerogear.dataManager.adapters.memory
     *
     **/
    aerogear.dataManager.adapters.memory = function( valveName, settings ) {
        return {
            recordId: settings && settings.recordId ? settings.recordId : "id",
            type: "memory",
            data: null,
            /**
             * aerogear.dataManager.adapters.memory#read( [id] ) -> Object
             * - id (Mixed): Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
             *
             **/
            read: function( id ) {
                var filter = {};
                filter[ this.recordId ] = id;
                return id ? this.filter( filter ) : this.data;
            },

            /**
             * aerogear.dataManager.adapters.memory#save( data[, reset] ) -> Object
             * - data (Mixed): An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the valve representing the unique identifier for a "record" in the data set.
             * - reset (Boolean): If true, this will empty the current data and set it to the data being saved
             *
             **/
            save: function( data, reset ) {
                var itemFound = false;

                data = aerogear.isArray( data ) ? data : [ data ];

                if ( reset ) {
                    this.data = data;
                } else {
                    if ( this.data ) {
                        for ( var i = 0; i < data.length; i++ ) {
                            for( var item in this.data ) {
                                if ( this.data[ item ][ this.recordId ] === data[ i ][ this.recordId ] ) {
                                    this.data[ item ] = data[ i ];
                                    itemFound = true;
                                    break;
                                }
                            }
                            if ( !itemFound ) {
                                this.data.push( data[ i ] );
                            }

                            itemFound = false;
                        }
                    } else {
                        this.data = data;
                    }
                }

                return this.data;
            },

            /**
             * aerogear.dataManager.adapters.memory#remove( toRemove ) -> Object
             * - toRemove (Mixed): A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
             *
             **/
            remove: function( toRemove ) {
                if ( !toRemove ) {
                    // empty data array and return
                    return this.data = [];
                } else {
                    toRemove = aerogear.isArray( toRemove ) ? toRemove : [ toRemove ];
                }
                var delId,
                    item;

                for ( var i = 0; i < toRemove.length; i++ ) {
                    if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
                        delId = toRemove[ i ];
                    } else if ( toRemove ) {
                        delId = toRemove[ i ][ this.recordId ];
                    } else {
                        // Missing record id so just skip this item in the arrray
                        continue;
                    }

                    for( item in this.data ) {
                        if ( this.data[ item ][ this.recordId ] === delId ) {
                            this.data.splice( item, 1 );
                        }
                    }
                }

                return this.data;
            },

            /**
             * aerogear.dataManager.adapters.memory#filter( filterParameters[, matchAny = false] ) -> Array[Object]
             * - filterParameters (Object): An object containing key value pairs on which to filter the valve's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
             * - matchAny (Boolean): When true, an item is included in the output if any of the filter parameters is matched.
             *
             * Returns a filtered array of data objects based on the contents of the valve's data object and the filter parameters. This method only returns a copy of the data and leaves the original data object intact.
             *
             **/
            filter: function( filterParameters, matchAny ) {
                var filtered,
                    i, j;

                if ( !filterParameters ) {
                    filtered = this.data || [];
                    return filtered;
                }

                filtered = this.data.filter( function( value, index, array) {
                    var match = matchAny ? false : true,
                        keys = Object.keys( filterParameters ),
                        filterObj, paramMatch, paramResult;

                    for ( i = 0; i < keys.length; i++ ) {
                        if ( filterParameters[ keys[ i ] ].data ) {
                            // Parameter value is an object
                            filterObj = filterParameters[ keys[ i ] ];
                            paramResult = filterObj.matchAny ? false : true;

                            for ( j = 0; j < filterObj.data.length; j++ ) {
                                if ( filterObj.matchAny && filterObj.data[ j ] === value[ keys[ i ] ] ) {
                                    // At least one value must match and this one does so return true
                                    paramResult = true;
                                    break;
                                }
                                if ( !filterObj.matchAny && filterObj.data[ j ] !== value[ keys[ i ] ] ) {
                                    // All must match but this one doesn't so return false
                                    paramResult = false;
                                    break;
                                }
                            }
                        } else {
                            // Filter on parameter value
                            paramResult = filterParameters[ keys[ i ] ] === value[ keys[ i ] ] ? true : false;
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

                return filtered;
            }
        };
    };
})( aerogear, jQuery );
