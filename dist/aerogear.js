/*! AeroGear JavaScript Library - v1.0.0.Alpha - 2012-09-21
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright 2012, Red Hat, Inc., and individual contributors
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

(function( window, undefined ) {
    /**
     * aerogear
     *
     * The aerogear namespace provides a way to encapsulate the library's properties and methods away from the global namespace
    **/
    var aerogear = window.aerogear = {
        /**
         * aerogear#add( config ) -> Object
         * - config (Mixed): This can be a variety of types specifying how to create the object
         *
         * This function is used internally by pipeline, datamanager, etc. to add a new Object (pipe, valve, etc.) to the respective collection. For specific examples look at those internal use cases.
         **/
        add: function ( config ) {
            var i,
                current,
                collection = this._getCollection();

            if ( !config ) {
                return this;
            } else if ( typeof config === "string" ) {
                // config is a string so use default adapter type
                collection[ config ] = aerogear[ this.lib ].adapters[ this.defaultAdapter ]( config );
            } else if ( aerogear.isArray( config ) ) {
                // config is an array so loop through each item in the array
                for ( i = 0; i < config.length; i++ ) {
                    current = config[ i ];

                    if ( typeof current === "string" ) {
                        collection[ current ] = aerogear[ this.lib ].adapters[ this.defaultAdapter ]( current );
                    } else {
                        collection[ current.name ] = aerogear[ this.lib ].adapters[ current.type || this.defaultAdapter ]( current.name, current.settings || {} );
                    }
                }
            } else {
                // config is an object so use that signature
                collection[ config.name ] = aerogear[ this.lib ].adapters[ config.type || this.defaultAdapter ]( config.name, config.settings || {} );
            }

            // reset the collection instance
            this._setCollection( collection );

            return this;
        },
        /**
         * aerogear#remove( config ) -> Object
         * - config (Mixed): This can be a variety of types specifying how to remove the object
         *
         * This function is used internally by pipeline, datamanager, etc. to remove an Object (pipe, valve, etc.) from the respective collection. For specific examples look at those internal use cases.
         **/
        remove: function( config ) {
            var i,
                current,
                collection = this._getCollection();

            if ( typeof config === "string" ) {
                // config is a string so delete that item by name
                delete collection[ config ];
            } else if ( aerogear.isArray( config ) ) {
                // config is an array so loop through each item in the array
                for ( i = 0; i < config.length; i++ ) {
                    current = config[ i ];

                    if ( typeof current === "string" ) {
                        delete collection[ current ];
                    } else {
                        delete collection[ current.name ];
                    }
                }
            } else if ( config ) {
                // config is an object so use that signature
                delete collection[ config.name ];
            }

            // reset the collection instance
            this._setCollection( collection );

            return this;
        }
    };

    /**
     * aerogear.isArray( obj ) -> Boolean
     * - obj (Mixed): This can be any object to test
     *
     * Utility function to test if an object is an Array
     **/
    aerogear.isArray = function( obj ) {
        return ({}).toString.call( obj ) === "[object Array]";
    };
})( this );

(function( aerogear, $, undefined ) {
    aerogear.ajax = function( caller, options ) {
        var deferred = $.Deferred( function() {
            var that = this,
                settings = $.extend( {}, {
                    contentType: "application/json",
                    dataType: "json"
                }, options );

            this.done( settings.success );
            this.fail( settings.error );
            this.always( settings.complete );

            var ajaxSettings = $.extend( {}, settings, {
                success: function( data, textStatus, jqXHR ) {
                    that.resolve( typeof data === "string" && ajaxSettings.dataType === "json" ? JSON.parse( data ) : data, textStatus, jqXHR );
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    that.reject( jqXHR, textStatus, errorThrown );
                },
                complete: function( jqXHR, textStatus ) {
                    that.resolve( jqXHR, textStatus );
                }
            });

            if ( ajaxSettings.contentType === "application/json" && ajaxSettings.data && ( ajaxSettings.type === "POST" || ajaxSettings.type === "PUT" ) ) {
                ajaxSettings.data = JSON.stringify( ajaxSettings.data );
            }

            if ( aerogear.auth && !caller.isAuthenticated() ) {
                this.reject( "auth", "Error: Authentication Required" );
            } else if ( caller.addAuth ) {
                $.ajax( caller.addAuth( ajaxSettings ) );
            } else {
                $.ajax( ajaxSettings );
            }
        });

        var promise = deferred.promise();

        promise.success = deferred.done;
        promise.error = deferred.fail;
        promise.complete = deferred.always;

        return promise;
    };
})( aerogear, jQuery );

(function( aerogear, undefined ) {
    /**
     * aerogear.pipeline
     *
     * The aerogear.pipeline namespace provides a persistence API that is protocol agnostic and does not depend on any certain data model. Through the use of adapters, both provided and custom, user supplied, this library provides common methods like read, save and delete that will just work.
     *
     * `aerogear.pipeline( config[, baseURL] ) -> Object`
     * - **config** (Mixed) - This can be a variety of types specifying how to create the pipe as illustrated below
     * - **baseURL** (String) - The base URL to use for the server location that this pipe should communicate with
     *
     * When passing a pipe configuration object to `add`, the following items can be provided:
     *  - **name** - String (Required), the name that the pipe will later be referenced by
     *  - **type** - String (Optional, default - "rest"), the type of pipe as determined by the adapter used
     *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
     *   - Adapters may have a number of varying configuration settings including but not limited to:
     *    - **recordId** - String (Optional, default - "id"), the identifier used to denote the unique id for each record in the data associated with this pipe
     *    - **baseURL** - String (Optional, default - ""), the base URL to use in conjunction with the adapter name as the endpoint.
     *
     * Returns an object representing a collection of server connections (pipes) and their corresponding data models. This object provides a standard way to communicate with the server no matter the data format or transport expected.
     *
     * ##### Example
     *
     *     // Create a single pipe using the default adapter
     *     var pipeline = aerogear.pipeline( "tasks" );
     *
     *     // Create multiple pipes using the default adapter
     *     var myPipeline = aerogear.pipeline( [ "tasks", "projects" ] );
     **/
    aerogear.pipeline = function( config ) {
        var pipeline = {
            lib: "pipeline",
            defaultAdapter: "rest",
            pipes: {},
            /**
             * aerogear.pipeline#add( config[, baseURL] ) -> Object
             * - config (Mixed): This can be a variety of types specifying how to create the pipe as illustrated below
             * - baseURL (String): The base URL to use for the server location that this pipe should communicate with
             *
             * When passing a pipe configuration object to `add`, the following items can be provided:
             *  - **name** - String (Required), the name that the pipe will later be referenced by
             *  - **type** - String (Optional, default - "rest"), the type of pipe as determined by the adapter used
             *  - **recordId** - String (Optional, default - "id"), the identifier used to denote the unique id for each record in the data associated with this pipe
             *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
             *   - Adapters may have a number of varying configuration settings.
             *
             * Returns the full pipeline object with the new pipe(s) added
             *
             *     // Add a single pipe using the default configuration (rest).
             *     aerogear.pipeline.add( String pipeName );
             *
             *     // Add multiple pipes all using the default configuration (rest).
             *     aerogear.pipeline.add( Array[String] pipeNames );
             *
             *     // Add one or more pipe configuration objects.
             *     aerogear.pipeline.add( Object/Array[Object] pipeConfigurations )
             *
             * The default pipe type is `rest`. You may also use one of the other provided types or create your own.
             *
             * ##### Example
             *
             *     var pipeline = aerogear.pipeline();
             *
             *     // Add a single pipe using the default adapter
             *     pipeline = pipeline.add( "tasks" );
             *
             *     // Add multiple pipes using the default adapter
             *     pipeline = pipeline.add( [ "tags", "projects" ] );
             *
             **/
            add: function( config, baseURL ) {
                return aerogear.add.call( this, config );
            },
            /**
             * aerogear.pipeline#remove( toRemove ) -> Object
             * - toRemove (Mixed): This can be a variety of types specifying the pipe to remove as illustrated below
             *
             * Returns the full pipeline object with the specified pipe(s) removed
             *
             *     // Remove a single pipe.
             *     aerogear.pipeline.remove( String pipeName );
             *
             *     // Remove multiple pipes.
             *     aerogear.pipeline.remove( Array[String] pipeNames );
             *
             *     // Remove one or more pipes by passing entire pipe objects.
             *     aerogear.pipeline.remove( Object/Array[Object] pipes )
             *
             * ##### Example
             *
             *     var pipeline = aerogear.pipeline( [ "projects", "tags", "tasks" ] );
             *
             *     // Remove a single pipe
             *     pipeline.remove( "tasks" );
             *
             *     // Remove multiple pipes
             *     pipeline.remove( [ "tags", "projects" ] );
             *
             **/
            remove: function( toRemove ) {
                return aerogear.remove.call( this, toRemove );
            },
            // Helper function to set pipes
            _setCollection: function( collection ) {
                this.pipes = collection;
            },
            // Helper function to get the pipes
            _getCollection: function() {
                return this.pipes;
            }
        };

        return pipeline.add( config );
    };

    /**
     * aerogear.pipeline.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.pipeline namespace dynamically and still be accessible to the add method
     **/
    aerogear.pipeline.adapters = {};
})( aerogear );

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
                extraOptions = {
                    type: "GET",
                    success: success
                };

                if ( options.error ) {
                    extraOptions.error = options.error;
                }

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
                extraOptions = {
                    data: data,
                    type: type,
                    url: url,
                    success: success
                };

                if ( options.error ) {
                    extraOptions.error = options.error;
                }

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
                extraOptions = {
                    type: "DELETE",
                    url: url,
                    success: success
                };

                if ( options.error ) {
                    extraOptions.error = options.error;
                }

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

(function( aerogear, undefined ) {
    /**
     * aerogear.dataManager
     *
     * The aerogear.dataManager namespace provides a mechanism for connecting to and moving data in and out of different types of client side storage.
     *
     * `aerogear.dataManager( config ) -> Object`
     * - **config** (Mixed) When passing a valve configuration object to `add`, the following items can be provided:
     *  - **name** - String (Required), the name that the valve will later be referenced by
     *  - **type** - String (Optional, default - "memory"), the type of valve as determined by the adapter used
     *  - **recordId** - String (Optional, default - "id"), the identifier used to denote the unique id for each record in the data associated with this valve
     *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
     *   - Adapters may have a number of varying configuration settings.
     *
     * Returns an object representing a collection of data connections (valves) and their corresponding data models. This object provides a standard way to interact with client side data no matter the data format or storage mechanism used.
     *
     * ##### Example
     *
     **/
    aerogear.dataManager = function( config ) {
        var dataManager = {
                lib: "dataManager",
                defaultAdapter: "memory",
                valves: {},
                /**
                 * aerogear.dataManager#add( config ) -> Object
                 * - config (Mixed): This can be a variety of types specifying how to create the valve as illustrated below
                 *
                 * When passing a valve configuration object to `add`, the following items can be provided:
                 *  - **name** - String (Required), the name that the valve will later be referenced by
                 *  - **type** - String (Optional, default - "memory"), the type of valve as determined by the adapter used
                 *  - **recordId** - String (Optional, default - "id"), the identifier used to denote the unique id for each record in the data associated with this valve
                 *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
                 *   - Adapters may have a number of varying configuration settings.
                 *
                 * Returns the full dataManager object with the new valve(s) added
                 *
                 *     // Add a single valve using the default configuration (memory).
                 *     aerogear.dataManager.add( String valveName );
                 *
                 *     // Add multiple valves all using the default configuration (memory).
                 *     aerogear.dataManager.add( Array[String] valveNames );
                 *
                 *     // Add one or more valve configuration objects.
                 *     aerogear.dataManager.add( Object/Array[Object] valveConfigurations )
                 *
                 * The default valve type is `memory`. You may also use one of the other provided types or create your own.
                 *
                 * ##### Example
                 *
                 *     var dm = aerogear.dataManager();
                 *
                 *     // Add a single valve using the default adapter
                 *     dm = dm.add( "tasks" );
                 *
                 *     // Add multiple valves using the default adapter
                 *     dm = dm.add( [ "tags", "projects" ] );
                 *
                 **/
                add: function( config ) {
                    return aerogear.add.call( this, config );
                },
                /**
                 * aerogear.dataManager#remove( toRemove ) -> Object
                 * - toRemove (Mixed): This can be a variety of types specifying the valve to remove as illustrated below
                 *
                 * Returns the full dataManager object with the specified valve(s) removed
                 *
                 *     // Remove a single valve.
                 *     aerogear.dataManager.remove( String valveName );
                 *
                 *     // Remove multiple valves.
                 *     aerogear.dataManager.remove( Array[String] valveNames );
                 *
                 *     // Remove one or more valves by passing entire valve objects.
                 *     aerogear.dataManager.remove( Object/Array[Object] valves )
                 *
                 * ##### Example
                 *
                 *     var dm = aerogear.dataManager( [ "projects", "tags", "tasks" ] );
                 *
                 *     // Remove a single valve
                 *     dm.remove( "tasks" );
                 *
                 *     // Remove multiple valves
                 *     dm.remove( [ "tags", "projects" ] );
                 *
                 **/
                remove: function( config ) {
                    return aerogear.remove.call( this, config );
                },
                // Helper function to set pipes
                _setCollection: function( collection ) {
                    this.valves = collection;
                },
                // Helper function to get the pipes
                _getCollection: function() {
                    return this.valves;
                }
            };

        return dataManager.add( config );
    };

    /**
     * aerogear.dataManager.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.dataManager namespace dynamically and still be accessible to the add method
     **/
    aerogear.dataManager.adapters = {};
})( aerogear );

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

(function( aerogear, undefined ) {
    /**
     * aerogear.auth
     *
     **/
    aerogear.auth = function( config ) {
        var auth = {
                lib: "auth",
                defaultAdapter: "rest",
                modules: {},
                /**
                 * aerogear.auth#add( config[, baseURL] ) -> Object
                 * - config (Mixed): This can be a variety of types specifying how to create the authentication module
                 * - baseURL (String): The base URL to use for the server location that this authentication module should communicate with
                 *
                 **/
                add: function( config ) {
                    return aerogear.add.call( this, config );
                },
                /**
                 * aerogear.auth#remove( toRemove ) -> Object
                 * - toRemove (Mixed): This can be a variety of types specifying the authentication module to remove as illustrated below
                 *
                 **/
                remove: function( toRemove ) {
                    return aerogear.remove.call( this, toRemove );
                },
                // Helper function to set auth modules
                _setCollection: function( collection ) {
                    this.modules = collection;
                },
                // Helper function to get the auth modules
                _getCollection: function() {
                    return this.modules;
                }
            };

        return auth.add( config );
    };

    /**
     * aerogear.auth.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.auth namespace dynamically and still be accessible to the add method
     **/
    aerogear.auth.adapters = {};
})( aerogear );

(function( aerogear, $, undefined ) {
    /**
     * aerogear.auth.adapters.rest
     *
     * The REST adapter is the default type used when creating a new authentication module. It uses jQuery.ajax to communicate with the server.
     *
     **/
    aerogear.auth.adapters.rest = function( moduleName, settings ) {
        var endPoints = settings && settings.endPoints || {};
        settings = settings || {};

        return {
            type: "rest",
            name: moduleName,
            agAuth: !!settings.agAuth,
            baseURL: settings.baseURL || null,
            /**
             * aerogear.auth.adapters.rest#register( data[, options] ) -> Object
             * - data (Object): User profile to register
             * - options (Object): Options to pass to the register method.
             *
             **/
            register: function( data, options ) {
                options = options || {};

                var that = this,
                    success = function( data, textStatus, jqXHR ) {
                        sessionStorage.setItem( "ag-auth-" + that.name, that.agAuth ? data[ "Auth-Token" ] : "true" );

                        if ( options.success ) {
                            options.success.apply( this, arguments );
                        }
                    },
                    extraOptions = {
                        success: success,
                        data: data
                    },
                    url = "";

                if ( options.error ) {
                    extraOptions.error = options.error;
                }

                if ( options.baseURL ) {
                    url = options.baseURL;
                } else if ( this.baseURL ) {
                    url = this.baseURL;
                }
                if ( endPoints.register ) {
                    url += endPoints.register;
                } else {
                    url += "auth/register";
                }
                if ( url.length ) {
                    extraOptions.url = url;
                }

                return $.ajax( $.extend( {}, settings, { type: "POST" }, extraOptions ) );
            },

            /**
             * aerogear.auth.adapters.rest#login( data[, options] ) -> Object
             * - data (Object): A set of key value pairs representing the user's credentials
             * - options (Object): An object containing key/value pairs representing options
             *
             **/
            login: function( data, options ) {
                options = options || {};

                var that = this,
                    success = function( data, textStatus, jqXHR ) {
                        sessionStorage.setItem( "ag-auth-" + that.name, that.agAuth ? data[ "token" ] : "true" );

                        if ( options.success ) {
                            options.success.apply( this, arguments );
                        }
                    },
                    extraOptions = {
                        success: success
                    },
                    url = "";

                if ( options.error ) {
                    extraOptions.error = options.error;
                }

                if ( options.baseURL ) {
                    url = options.baseURL;
                } else if ( this.baseURL ) {
                    url = this.baseURL;
                }
                if ( endPoints.login ) {
                    url += endPoints.login;
                } else {
                    url += "auth/login";
                }
                if ( url.length ) {
                    extraOptions.url = url;
                }

                if ( this.agAuth ) {
                    extraOptions.headers = {
                        "Auth-Credential": data.credential,
                        "Auth-Password": data.password
                    };
                } else {
                    extraOptions.data = data;
                }

                return $.ajax( $.extend( {}, settings, { type: "POST" }, extraOptions ) );
            },

            logout: function( options ) {
                options = options || {};

                var that = this,
                    success = function( data, textStatus, jqXHR ) {
                        that.deauthorize();

                        if ( options.success ) {
                            options.success.apply( this, arguments );
                        }
                    },
                    extraOptions = {
                        success: success
                    },
                    url = "";

                if ( options.error ) {
                    extraOptions.error = options.error;
                }

                if ( options.baseURL ) {
                    url = options.baseURL;
                } else if ( this.baseURL ) {
                    url = this.baseURL;
                }
                if ( endPoints.logout ) {
                    url += endPoints.logout;
                } else {
                    url += "auth/logout";
                }
                if ( url.length ) {
                    extraOptions.url = url;
                }

                if ( this.agAuth ) {
                    extraOptions.headers = {
                        "Auth-Token": sessionStorage.getItem( "ag-auth-" + this.name )
                    };
                }

                return $.ajax( $.extend( {}, settings, { type: "POST" }, extraOptions ) );
            },

            isAuthenticated: function() {
                var auth = sessionStorage.getItem( "ag-auth-" + this.name );
                return !!auth;
            },

            addAuth: function( settings ) {
                return $.extend( {}, settings, { headers: { "Auth-Token": sessionStorage.getItem( "ag-auth-" + this.name ) } } );
            },

            deauthorize: function() {
                sessionStorage.removeItem( "ag-auth-" + this.name );
            }
        };
    };
})( aerogear, jQuery );
