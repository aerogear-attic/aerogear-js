(function( aerogear, $, undefined ) {
    /**
     * aerogear.pipeline.adapters.rest
     *
     * The REST adapter is the default type used when creating a new pipe. It uses jQuery.ajax to communicate with the server. By default, the RESTful endpoint used by this pipe is the app's current context, followed by the pipe name. For example, if the app is running on http://mysite.com/myApp, then a pipe named `tasks` would use http://mysite.com/myApp/tasks as its REST endpoint.
     *
     * `aerogear.pipeline.adapters.rest( pipeName [, settings] ) -> Object`
     * - pipeName (String): the name that will be used to reference this pipe
     * - settings (Object) - an object used to pass additional parameters to the pipe
     *  - authenticator (Object) - the aerogear.auth object used to pass credentials to a secure endpoint
     *  - baseURL (String): overrides the baseURL set at the Pipeline level (if set) and defines the base URL to use for an endpoint
     *  - endPoint (String): overrides the default naming of the endpoint which uses the pipeName.
     *  - recordId (String): the name of the field used to uniquely identify a "record" in the data
     *
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
             *  - **complete** (Function), a callback to be called when the result of the request to the server is complete, regardless of success
             *  - **data** (Object), a hash of key/value pairs that can be passed to the server as additional information for use when determining what data to return
             *  - **error** (Function), a callback to be called when the request to the server results in an error
             *  - **statusCode** (Object), a collection of status codes and callbacks to fire when the request to the server returns on of those codes. For more info see the statusCode option on the [jQuery.ajax page](http://api.jquery.com/jQuery.ajax/).
             *  - **success** (Function), a callback to be called when the result of the request to the server is successful
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
                    statusCode: options.statusCode,
                    complete: options.complete
                };

                return aerogear.ajax( this, $.extend( {}, ajaxSettings, extraOptions ) );
            },

            /**
             * aerogear.pipeline.adapters.rest#save( data[, options] ) -> Object
             * - data (Object): For new data, this will be an object representing the data to be saved to the server. For updating data, a hash of key/value pairs one of which must be the `recordId` you set during creation of the pipe representing the identifier the server will use to update this record and then any other number of pairs representing the data. The data object is then stringified and passed to the server to be processed.
             * - options (Object): An object containing key/value pairs representing options
             *  - **complete** (Function), a callback to be called when the result of the request to the server is complete, regardless of success
             *  - **error** (Function), a callback to be called when the request to the server results in an error
             *  - **statusCode** (Object), a collection of status codes and callbacks to fire when the request to the server returns on of those codes. For more info see the statusCode option on the [jQuery.ajax page](http://api.jquery.com/jQuery.ajax/).
             *  - **success** (Function), a callback to be called when the result of the request to the server is successful
             *  - **valves** - Mixed, A single valve object or array of valves to be updated when a server update is successful
             *
             * Save data asynchronously to the server. If this is a new object (doesn't have a record identifier provided by the server), the data is created on the server (POST) and then that record is sent back to the client including the new server-assigned id, otherwise, the data on the server is updated (PUT).
             *
             * Returns a promise from aerogear.ajax. See the [Deferred Object](http://api.jquery.com/category/deferred-object/) reference on the jQuery site for more information.
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
             *         success: function( data, textStatus, jqXHR ) {
             *             console.log( "Success" );
             *         },
             *         error: function( jqXHR, textStatus, errorThrown ) {
             *             console.log( "Error" );
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
                    statusCode: options.statusCode,
                    complete: options.complete
                };

                return aerogear.ajax( this, $.extend( {}, ajaxSettings, extraOptions ) );
            },

            /**
             * aerogear.pipeline.adapters.rest#remove( toRemove [, options] ) -> Object
             * - toRemove (Mixed): A variety of objects can be passed to remove to specify the item to remove
             *  - String/Number - An id representing the record to be removed
             *  - Object - The actual data record containing a record identifier that will be used to remove the record
             * - options (Object): An object containing key/value pairs representing options
             *  - **complete** (Function), a callback to be called when the result of the request to the server is complete, regardless of success
             *  - **error** (Function), a callback to be called when the request to the server results in an error
             *  - **statusCode** (Object), a collection of status codes and callbacks to fire when the request to the server returns on of those codes. For more info see the statusCode option on the [jQuery.ajax page](http://api.jquery.com/jQuery.ajax/).
             *  - **success** (Function), a callback to be called when the result of the request to the server is successful
             *  - **valves** - Mixed, A single valve object or array of valves to be updated when a server update is successful
             *
             * Remove data asynchronously from the server. Passing nothing will inform the server to remove all data at this pipe's endpoint.
             *
             * Returns a promise from aerogear.ajax. See the [Deferred Object](http://api.jquery.com/category/deferred-object/) reference on the jQuery site for more information.
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
                    if ( toRemove.statusCode && !options.statusCode ) {
                        options.statusCode = toRemove.statusCode;
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
                    statusCode: options.statusCode,
                    complete: options.complete
                };

                return aerogear.ajax( this, $.extend( {}, ajaxSettings, extraOptions ) );
            },

            /**
             * aerogear.pipeline.adapters.rest#isAuthenticated() -> Boolean
             * If this pipe instance has an authenticator, return the result of the authenticators isAuthenticated method to determine auth status
             **/
            isAuthenticated: function() {
                return this.authenticator ? this.authenticator.isAuthenticated() : true;
            },

            /**
             * aerogear.pipeline.adapters.rest#addAuth( settings ) -> Boolean
             * If this pipe instance has an authenticator, return the result of the authenticators addAuth method which adds appropriate settings to the ajax request base on the authenticator's needs
             **/
            addAuth: function( settings ) {
                return this.authenticator ? this.authenticator.addAuth( settings ) : settings;
            },

            /**
             * aerogear.pipeline.adapters.rest#deAuthorize() -> Boolean
             * If this pipe instance has an authenticator, call the authenticators deauthorize method to remove authorization
             **/
            deauthorize: function() {
                if ( this.authenticator ) {
                    this.authenticator.deauthorize();
                }
            }
        };
    };
})( aerogear, jQuery );
