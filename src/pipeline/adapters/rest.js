(function( aerogear, $, undefined ) {
    /**
     * aerogear.pipeline.adapters.rest
     *
     * The REST adapter is the default type used when creating a new pipe. It uses jQuery.ajax to communicate with the server. By default, the RESTful endpoint used by this pipe is the app's current context, followed by the pipe name. For example, if the app is running on http://mysite.com/myApp, then a pipe named `tasks` would use http://mysite.com/myApp/tasks as its REST endpoint.
     *
     * `aerogear.pipeline.adapters.rest( pipeName [, recordId, ajaxSettings] ) -> Object`
     * - pipeName (String): the name that will be used to reference this pipe
     * - recordId (String): the record identifier specified when the pipe was created
     * - settings (Object) - an object used to pass additional parameters to the pipe
     *  - These are mostly settings defined by jQuery.ajax and are passed through to that method. In addition, a baseURL set at the Pipeline level can define the base URL to use for an endpoint, as well as an endPoint can be defined to override the default naming of the endpoint using the pipeName.
     *
     * When creating a new pipe using the REST adapter, the `settings` parameter to be supplied to pipeline is a hash of key/value pairs that will be supplied to the jQuery.ajax method.
     *
     * Once created, the new pipe will contain:
     * - **recordId** - the record identifier specified when the pipe was created
     * - **type** - the type specified when the pipe was created
     **/
    aerogear.pipeline.adapters.rest = function( pipeName, settings ) {
        var endPoint = settings && settings.endPoint ? settings.endPoint : pipeName,
            ajaxSettings = $.extend({
                // use the pipeName as the default rest endpoint
                url: settings && settings.baseURL ? settings.baseURL + "/" + endPoint : endPoint
            }, settings );

        return {
            recordId: settings && settings.recordId ? settings.recordId : "id",
            authenticator: settings && settings.authenticator ? settings.authenticator : null,
            type: "rest",
            /**
             * aerogear.pipeline.adapters.rest#read( [options] ) -> Object
             * - options (Object): Additional options
             *
             * The options sent to read can include the following:
             *  - **data** - Object, a hash of key/value pairs that can be passed to the server as additional information for use when determining what data to return (Optional)
             *  - **ajax** - Object, a hash of key/value pairs that will be added to or override any AJAX settings set during creation of the pipe using this adapter (Optional)
             *  - **valves** - Mixed, A single valve object or array of valves to be initialized/reset when a server read is successful
             *
             * Returns a jqXHR which implements the Promise interface. See the [Defered Object](http://api.jquery.com/category/deferred-object/) reference on the jQuery site for more information.
             *
             *     var myPipe = aerogear.pipeline( "tasks" ).pipes[ 0 ];
             *
             *     // Get a set of key/value pairs of all data on the server associated with this pipe
             *     var allData = myPipe.read();
             *
             *     // A data object can be passed to filter the data and in the case of REST,
             *     // this object is converted to query string parameters which the server can use.
             *     // The values would be determined by what the server is expecting
             *     var filteredData = myPipe.read({
             *         data: {
             *             limit: 10,
             *             date: "2012-08-01"
             *             ...
             *         }
             *     });
             *
             * Example returned data in allData:
             *
             *     [
             *         {
             *             id: 12345
             *             title: "Do Something",
             *             date: "2012-08-01",
             *             ...
             *         },
             *         {
             *             id: 67890
             *             title: "Do Something Else",
             *             date: "2012-08-02",
             *             ...
             *         },
             *         ...
             *     ]
             *
             **/
            read: function( options ) {
                options = options || {};
                var success = function( data ) {
                    var valves = options.valves ? aerogear.isArray( options.valves ) ? options.valves : [ options.valves ] : [],
                        item;

                    if ( valves.length ) {
                        for ( item in valves ) {
                            valves[ item ].save( data, true );
                        }
                    }

                    if ( options.success ) {
                        options.success.apply( this, arguments );
                    }
                },
                error = function( type, errorMessage ) {
                    var valves = options.valves ? aerogear.isArray( options.valves ) ? options.valves : [ options.valves ] : [],
                        item;

                    if ( type === "auth" && valves.length ) {
                        // If auth error, clear existing data for security
                        for ( item in valves ) {
                            valves[ item ].remove();
                        }
                    }

                    if ( options.error ) {
                        options.error.apply( this, arguments );
                    }
                },
                extraOptions = {
                    type: "GET",
                    success: success,
                    error: error,
                    complete: options.complete
                };

                return aerogear.ajax( this, $.extend( {}, ajaxSettings, extraOptions ) );
            },

            /**
             * aerogear.pipeline.adapters.rest#save( data[, options] ) -> Object
             * - data (Object): For new data, this will be an object representing the data to be saved to the server. For updating data, a hash of key/value pairs one of which must be the `recordId` you set during creation of the pipe representing the identifier the server will use to update this record and then any other number of pairs representing the data. The data object is then stringified and passed to the server to be processed.
             * - options (Object): An object containing key/value pairs representing options
             *   - ajax (Object): AJAX options added to or overriding any ajax settings set during creation of the pipe using this adapter
             *   - valves (Mixed): A single valve object or array of valves to be updated when a server update is successful
             *
             * Save data asynchronously to the server. If this is a new object (doesn't have a record identifier provided by the server), the data is created on the server (POST) and then that record is sent back to the client including the new server-assigned id, otherwise, the data on the server is updated (PUT).
             *
             * Returns a jqXHR which implements the Promise interface. See the [Defered Object](http://api.jquery.com/category/deferred-object/) reference on the jQuery site for more information.
             *
             *     var myPipe = aerogear.pipeline( "tasks" ).pipes[ 0 ];
             *
             *     // Store a new task
             *     myPipe.save({
             *         title: "Created Task",
             *         date: "2012-07-13",
             *         ...
             *     });
             *
             *     // Pass a success and error callback, in this case using the REST pipe and jQuery.ajax so the functions take the same parameters.
             *     myPipe.save({
             *         title: "Another Created Task",
             *         date: "2012-07-13",
             *         ...
             *     },
             *     {
             *         ajax: {
             *             success: function( data, textStatus, jqXHR ) {
             *                 console.log( "Success" );
             *             },
             *             error: function( jqXHR, textStatus, errorThrown ) {
             *                 console.log( "Error" );
             *             }
             *         }
             *     });
             *
             *     // Update an existing piece of data
             *     var toUpdate = myPipe.data[ 0 ];
             *     toUpdate.data.title = "Updated Task";
             *     myPipe.save( toUpdate );
             *
             **/
            save: function( data, options ) {
                var type,
                    url;

                data = data || {};
                options = options || {};
                type = data[ this.recordId ] ? "PUT" : "POST";

                if ( !options.url && data[ this.recordId ] ) {
                    url = ajaxSettings.url + "/" + data[ this.recordId ];
                } else if ( !options.url ) {
                    url = ajaxSettings.url;
                } else {
                    url = options.url;
                }

                var success = function( data ) {
                    var valves = aerogear.isArray( options.valves ) ? options.valves : [ options.valves ],
                        item;

                    if ( options.valves ) {
                        for ( item in valves ) {
                            valves[ item ].save( data );
                        }
                    }

                    if ( options.success ) {
                        options.success.apply( this, arguments );
                    }
                },
                error = function( type, errorMessage ) {
                    var valves = options.valves ? aerogear.isArray( options.valves ) ? options.valves : [ options.valves ] : [],
                        item;

                    if ( type === "auth" && valves.length ) {
                        // If auth error, clear existing data for security
                        for ( item in valves ) {
                            valves[ item ].remove();
                        }
                    }

                    if ( options.error ) {
                        options.error.apply( this, arguments );
                    }
                },
                extraOptions = {
                    data: data,
                    type: type,
                    url: url,
                    success: success,
                    error: error,
                    complete: options.complete
                };

                return aerogear.ajax( this, $.extend( {}, ajaxSettings, extraOptions ) );
            },

            /**
             * aerogear.pipeline.adapters.rest#remove( toRemove [, options] ) -> Object
             * - toRemove (Mixed): A variety of objects can be passed to remove to specify the item to remove as illustrated below
             * - options (Object): An object containing key/value pairs representing options
             *   - ajax (Object): AJAX options added to or overriding any ajax settings set during creation of the pipe using this adapter
             *   - valves (Mixed): A single valve object or array of valves to be updated when a server update is successful
             *
             * Remove data asynchronously from the server. Passing nothing will inform the server to remove all data at this pipe's rest endpoint.
             *
             * Returns a jqXHR which implements the Promise interface. See the [Defered Object](http://api.jquery.com/category/deferred-object/) reference on the jQuery site for more information.
             *
             *     var myPipe = aerogear.pipeline( "tasks" ).pipes[ 0 ];
             *
             *     // Store a new task
             *     myPipe.save({
             *         title: "Created Task"
             *     });
             *
             *     // Store another new task
             *     myPipe.save({
             *         title: "Another Created Task"
             *     });
             *
             *     // Store one more new task
             *     myPipe.save({
             *         title: "And Another Created Task"
             *     });
             *
             *     // Remove a particular item from the server by its id
             *     var toRemove = myPipe.data[ 0 ];
             *     myPipe.remove( toRemove.id );
             *
             *     // Remove an item from the server using the data object
             *     toRemove = myPipe.data[ 0 ];
             *     myPipe.remove( toRemove );
             *
             *     // Delete all remaining data from the server associated with this pipe
             *     myPipe.delete();
             *
             **/
            remove: function( toRemove, options ) {
                var delPath = "",
                    delId,
                    url;

                options = options || {};

                if ( typeof toRemove === "string" || typeof toRemove === "number" ) {
                    delId = toRemove;
                } else if ( toRemove ) {
                    if ( typeof toRemove.record === "string" || typeof toRemove.record === "number" ) {
                        delId = toRemove.record;
                    } else if ( toRemove.record ) {
                        delId = toRemove.record[ this.recordId ];
                    }

                    if ( toRemove.success && !options.success ) {
                        options.success = toRemove.success;
                    }
                    if ( toRemove.error && !options.error ) {
                        options.error = toRemove.error;
                    }
                }

                delPath = delId ? "/" + delId : "";
                if ( options.url ) {
                    url = options.url;
                } else if ( toRemove.url ) {
                    url = toRemove.url;
                } else {
                    url = ajaxSettings.url + delPath;
                }

                var success = function( data ) {
                    var valves,
                        item;

                    if ( options.valves ) {
                        valves = aerogear.isArray( options.valves ) ? options.valves : [ options.valves ];
                        for ( item in valves ) {
                            valves[ item ].remove( delId );
                        }
                    } else if ( toRemove.valves ) {
                        valves = aerogear.isArray( toRemove.valves ) ? toRemove.valves : [ toRemove.valves ];
                        for ( item in valves ) {
                            valves[ item ].remove( delId );
                        }
                    }

                    if ( options.success ) {
                        options.success.apply( this, arguments );
                    }
                },
                error = function( type, errorMessage ) {
                    var valves = options.valves ? aerogear.isArray( options.valves ) ? options.valves : [ options.valves ] : [],
                        item;

                    if ( type === "auth" && valves.length ) {
                        // If auth error, clear existing data for security
                        for ( item in valves ) {
                            valves[ item ].remove();
                        }
                    }

                    if ( options.error ) {
                        options.error.apply( this, arguments );
                    }
                },
                extraOptions = {
                    type: "DELETE",
                    url: url,
                    success: success,
                    error: error,
                    complete: options.complete
                };

                return aerogear.ajax( this, $.extend( {}, ajaxSettings, extraOptions ) );
            },

            isAuthenticated: function() {
                return this.authenticator ? this.authenticator.isAuthenticated() : true;
            },

            addAuth: function( settings ) {
                return this.authenticator ? this.authenticator.addAuth( settings ) : settings;
            },

            deauthorize: function() {
                if ( this.authenticator ) {
                    this.authenticator.deauthorize();
                }
            }
        };
    };
})( aerogear, jQuery );
