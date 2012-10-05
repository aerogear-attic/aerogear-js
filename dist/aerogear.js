/*! AeroGear JavaScript Library - v1.0.0.Alpha - 2012-10-05
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
         * This function is used internally by pipeline, datamanager, etc. to add a new Object (pipe, store, etc.) to the respective collection. For specific examples look at those internal use cases.
         **/
        add: function ( config ) {
            var i,
                current,
                collection = this[ this.collectionName ] || {};

            if ( !config ) {
                return this;
            } else if ( typeof config === "string" ) {
                // config is a string so use default adapter type
                collection[ config ] = aerogear[ this.lib ].adapters[ this.type ]( config );
            } else if ( aerogear.isArray( config ) ) {
                // config is an array so loop through each item in the array
                for ( i = 0; i < config.length; i++ ) {
                    current = config[ i ];

                    if ( typeof current === "string" ) {
                        collection[ current ] = aerogear[ this.lib ].adapters[ this.type ]( current );
                    } else {
                        collection[ current.name ] = aerogear[ this.lib ].adapters[ current.type || this.type ]( current.name, current.settings || {} );
                    }
                }
            } else {
                // config is an object so use that signature
                collection[ config.name ] = aerogear[ this.lib ].adapters[ config.type || this.type ]( config.name, config.settings || {} );
            }

            // reset the collection instance
            this[ this.collectionName ] = collection;

            return this;
        },
        /**
         * aerogear#remove( config ) -> Object
         * - config (Mixed): This can be a variety of types specifying how to remove the object
         *
         * This function is used internally by pipeline, datamanager, etc. to remove an Object (pipe, store, etc.) from the respective collection. For specific examples look at those internal use cases.
         **/
        remove: function( config ) {
            var i,
                current,
                collection = this[ this.collectionName ] || {};

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
            this[ this.collectionName ] = collection;

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
    /**
     * aerogear.ajax( caller[, options] ) -> Object
     * - caller (Object): the AeroGear object (pipe, datamanager, etc.) that is calling aerogear.ajax
     * - options (Object): settings for jQuery.ajax
     *
     * Returns a promise similar to the promise returned by jQuery.ajax
     **/
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
                    if ( ajaxSettings.dataType === "json" ) {
                        try {
                            jqXHR.responseJSON = JSON.parse( jqXHR.responseText );
                        } catch( error ) {}
                    }
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
            } else if ( caller.addAuthIdentifier ) {
                $.ajax( caller.addAuthIdentifier( ajaxSettings ) );
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

(function( aerogear, $, undefined ) {
    /**
     * aerogear.pipeline
     *
     * The aerogear.pipeline namespace provides a persistence API that is protocol agnostic and does not depend on any certain data model. Through the use of adapters, this library provides common methods like read, save and delete that will just work.
     *
     * `aerogear.pipeline( config ) -> Object`
     * - **config** (Mixed) - This can be a variety of types specifying how to create the pipe as illustrated below
     *
     * When passing a pipe configuration object to `add`, the following items can be provided:
     *  - **name** - String (Required), the name that the pipe will later be referenced by
     *  - **type** - String (Optional, default - "rest"), the type of pipe as determined by the adapter used
     *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
     *   - Adapters may have a number of varying configuration settings
     *
     * Returns an object representing a collection of server connections (pipes) and their corresponding data models. This object provides a standard way to communicate with the server no matter the data format or transport expected.
     *
     * ##### Example
     *
     *      // Create an empty pipeline
     *      var pipeline = aerogear.pipeline();
     *
     *      // Create a single pipe using the default adapter
     *      var pipeline2 = aerogear.pipeline( "tasks" );
     *
     *      // Create multiple pipes using the default adapter
     *      var pipeline3 = aerogear.pipeline( [ "tasks", "projects" ] );
     **/
    aerogear.pipeline = function( config ) {
        var pipeline = $.extend( {}, aerogear, {
            lib: "pipeline",
            type: config ? config.type || "rest" : "rest",
            collectionName: "pipes"
        });

        return pipeline.add( config );
    };

    /**
     * aerogear.pipeline.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.pipeline namespace dynamically and still be accessible to the add method
     **/
    aerogear.pipeline.adapters = {};
})( aerogear, jQuery );

(function( aerogear, $, undefined ) {
    /**
     * new aerogear.pipeline.adapters.rest
     *
     * The REST adapter is the default type used when creating a new pipe. It uses jQuery.ajax to communicate with the server. By default, the RESTful endpoint used by this pipe is the app's current context, followed by the pipe name. For example, if the app is running on http://mysite.com/myApp, then a pipe named `tasks` would use http://mysite.com/myApp/tasks as its REST endpoint.
     *
     * `aerogear.pipeline.adapters.rest( pipeName [, settings] ) -> Object`
     * - pipeName (String): the name that will be used to reference this pipe
     * - settings (Object) - an object used to pass additional parameters to the pipe
     *  - authenticator (Object) - the aerogear.auth object used to pass credentials to a secure endpoint
     *  - baseURL (String): defines the base URL to use for an endpoint
     *  - endpoint (String): overrides the default naming of the endpoint which uses the pipeName.
     *  - recordId (String): the name of the field used to uniquely identify a "record" in the data
     **/
    aerogear.pipeline.adapters.rest = function( pipeName, settings ) {
        // Allow instantiation without using new
        if ( !( this instanceof aerogear.pipeline.adapters.rest ) ) {
            return new aerogear.pipeline.adapters.rest( pipeName, settings );
        }

        settings = settings || {};

        // Private Instance vars
        var endpoint = settings.endpoint || pipeName,
            ajaxSettings = {
                // use the pipeName as the default rest endpoint
                url: settings.baseURL ? settings.baseURL + endpoint : endpoint
            },
            recordId = settings.recordId || "id",
            authenticator = settings.authenticator || null,
            type = "rest";

        // Privileged Methods
        /**
         * aerogear.pipeline.adapters.rest#isAuthenticated() -> Boolean
         * If this pipe instance has an authenticator, return the result of the authenticators isAuthenticated method to determine auth status
         **/
        this.isAuthenticated = function() {
            return authenticator ? authenticator.isAuthenticated() : true;
        };

        /**
         * aerogear.pipeline.adapters.rest#addAuth( settings ) -> Boolean
         * If this pipe instance has an authenticator, return the result of the authenticators addAuth method which adds appropriate settings to the ajax request base on the authenticator's needs
         **/
        this.addAuthIdentifier = function( settings ) {
            return authenticator ? authenticator.addAuthIdentifier( settings ) : settings;
        };

        /**
         * aerogear.pipeline.adapters.rest#deAuthorize() -> Boolean
         * If this pipe instance has an authenticator, call the authenticators deauthorize method to remove authorization
         **/
        this.deauthorize = function() {
            if ( authenticator ) {
                authenticator.deauthorize();
            }
        };

        /**
         * aerogear.pipeline.adapters.rest#getAjaxSettings() -> Object
         *
         * Returns the value of the private ajaxSettings var
         **/
        this.getAjaxSettings = function() {
            return ajaxSettings;
        };

        /**
         * aerogear.pipeline.adapters.rest#getRecordId() -> String
         *
         * Returns the value of the private recordId var
         **/
        this.getRecordId = function() {
            return recordId;
        };

        /**
         * aerogear.pipeline.adapters.rest#getAuthenticator() -> Object
         *
         * Returns the value of the private authenticator var
         **/
        this.getAuthenticator = function() {
            return authenticator;
        };
    };

    // Public Methods
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
     *  - **stores** - Mixed, A single store object or array of stores to be initialized/reset when a server read is successful
     *
     * Returns a promise from aerogear.ajax. See the [Defered Object](http://api.jquery.com/category/deferred-object/) reference on the jQuery site for more information.
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
     **/
    aerogear.pipeline.adapters.rest.prototype.read = function( options ) {
        options = options || {};
        var that = this,
            success = function( data ) {
            var stores = options.stores ? aerogear.isArray( options.stores ) ? options.stores : [ options.stores ] : [],
                item;

            if ( stores.length ) {
                for ( item in stores ) {
                    stores[ item ].save( data, true );
                }
            }

            if ( options.success ) {
                options.success.apply( this, arguments );
            }
        },
        error = function( type, errorMessage ) {
            var stores = options.stores ? aerogear.isArray( options.stores ) ? options.stores : [ options.stores ] : [],
                item;

            if ( type === "auth" && stores.length ) {
                // If auth error, clear existing data for security
                for ( item in stores ) {
                    stores[ item ].remove();
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

        return aerogear.ajax( this, $.extend( {}, this.getAjaxSettings(), extraOptions ) );
    };

    /**
     * aerogear.pipeline.adapters.rest#save( data[, options] ) -> Object
     * - data (Object): For new data, this will be an object representing the data to be saved to the server. For updating data, a hash of key/value pairs one of which must be the `recordId` you set during creation of the pipe representing the identifier the server will use to update this record and then any other number of pairs representing the data. The data object is then stringified and passed to the server to be processed.
     * - options (Object): An object containing key/value pairs representing options
     *  - **complete** (Function), a callback to be called when the result of the request to the server is complete, regardless of success
     *  - **error** (Function), a callback to be called when the request to the server results in an error
     *  - **statusCode** (Object), a collection of status codes and callbacks to fire when the request to the server returns on of those codes. For more info see the statusCode option on the [jQuery.ajax page](http://api.jquery.com/jQuery.ajax/).
     *  - **success** (Function), a callback to be called when the result of the request to the server is successful
     *  - **stores** - Mixed, A single store object or array of stores to be updated when a server update is successful
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
     **/
    aerogear.pipeline.adapters.rest.prototype.save = function( data, options ) {
        var that = this,
            recordId = this.getRecordId(),
            ajaxSettings = this.getAjaxSettings(),
            type,
            url;

        data = data || {};
        options = options || {};
        type = data[ recordId ] ? "PUT" : "POST";

        if ( data[ recordId ] ) {
            url = ajaxSettings.url + "/" + data[ recordId ];
        } else {
            url = ajaxSettings.url;
        }

        var success = function( data ) {
            var stores = aerogear.isArray( options.stores ) ? options.stores : [ options.stores ],
                item;

            if ( options.stores ) {
                for ( item in stores ) {
                    stores[ item ].save( data );
                }
            }

            if ( options.success ) {
                options.success.apply( this, arguments );
            }
        },
        error = function( type, errorMessage ) {
            var stores = options.stores ? aerogear.isArray( options.stores ) ? options.stores : [ options.stores ] : [],
                item;

            if ( type === "auth" && stores.length ) {
                // If auth error, clear existing data for security
                for ( item in stores ) {
                    stores[ item ].remove();
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
    };

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
     *  - **stores** - Mixed, A single store object or array of stores to be updated when a server update is successful
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
     **/
    aerogear.pipeline.adapters.rest.prototype.remove = function( toRemove, options ) {
        var that = this,
            recordId = this.getRecordId(),
            ajaxSettings = this.getAjaxSettings(),
            delPath = "",
            delId,
            url;

        if ( typeof toRemove === "string" || typeof toRemove === "number" ) {
            delId = toRemove;
        } else if ( toRemove && toRemove[ recordId ] ) {
            delId = toRemove[ recordId ];
        } else if ( toRemove && !options ) {
            // No remove item specified so treat as options
            options = toRemove;
        }

        options = options || {};

        delPath = delId ? "/" + delId : "";
        url = ajaxSettings.url + delPath;

        var success = function( data ) {
            var stores,
                item;

            if ( options.stores ) {
                stores = aerogear.isArray( options.stores ) ? options.stores : [ options.stores ];
                for ( item in stores ) {
                    stores[ item ].remove( delId );
                }
            }

            if ( options.success ) {
                options.success.apply( this, arguments );
            }
        },
        error = function( type, errorMessage ) {
            var stores = options.stores ? aerogear.isArray( options.stores ) ? options.stores : [ options.stores ] : [],
                item;

            if ( type === "auth" && stores.length ) {
                // If auth error, clear existing data for security
                for ( item in stores ) {
                    stores[ item ].remove();
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
    };
})( aerogear, jQuery );

(function( aerogear, $, undefined ) {
    /**
     * aerogear.dataManager
     *
     * The aerogear.dataManager namespace provides a mechanism for connecting to and moving data in and out of different types of client side storage.
     *
     * `aerogear.dataManager( config ) -> Object`
     * - **config** (Mixed) When passing a store configuration object to `add`, the following items can be provided:
     *  - **name** - String (Required), the name that the store will later be referenced by
     *  - **type** - String (Optional, default - "memory"), the type of store as determined by the adapter used
     *  - **recordId** - String (Optional, default - "id"), the identifier used to denote the unique id for each record in the data associated with this store
     *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
     *   - Adapters may have a number of varying configuration settings.
     *
     * Returns an object representing a collection of data connections (stores) and their corresponding data models. This object provides a standard way to interact with client side data no matter the data format or storage mechanism used.
     *
     * ##### Example
     *
     *      // Create an empty dataManager
     *      var dm = aerogear.dataManager();
     *
     *      // Create a single store using the default adapter
     *      var dm2 = aerogear.dataManager( "tasks" );
     *
     *      // Create multiple stores using the default adapter
     *      var dm3 = aerogear.dataManager( [ "tasks", "projects" ] );
     **/
    aerogear.dataManager = function( config ) {
        var dataManager = $.extend( {}, aerogear, {
                lib: "dataManager",
                type: config ? config.type || "memory" : "memory",
                collectionName: "stores"
            });

        return dataManager.add( config );
    };

    /**
     * aerogear.dataManager.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.dataManager namespace dynamically and still be accessible to the add method
     **/
    aerogear.dataManager.adapters = {};
})( aerogear, jQuery );

(function( aerogear, $, undefined ) {
    /**
     * aerogear.dataManager.adapters.memory
     *
     * The memory adapter is the default type used when creating a new store. Data is simply stored in a data var and is lost on unload (close window, leave page, etc.)
     *
     * `aerogear.datamanager.adapters.memory( storeName [, settings] ) -> Object`
     * - storeName (String): the name that will be used to reference this store
     * - settings (Object) - an object used to pass additional parameters to the store
     *  - recordId (String): the name of the field used to uniquely identify a "record" in the data
     **/
    aerogear.dataManager.adapters.memory = function( storeName, settings ) {
        // Allow instantiation without using new
        if ( !( this instanceof aerogear.dataManager.adapters.memory ) ) {
            return new aerogear.dataManager.adapters.memory( storeName, settings );
        }

        settings = settings || {};

        // Private Instance vars
        var recordId = settings.recordId ? settings.recordId : "id",
            type = "memory",
            data = null;

        // Privileged Methods
        /**
         * aerogear.dataManager.adapters.memory#getRecordId() -> String
         *
         * Returns the value of the private recordId var
         **/
        this.getRecordId = function() {
            return recordId;
        };

        /**
         * aerogear.dataManager.adapters.memory#getData() -> Object
         *
         * Returns the complete contents of the store's data
         **/
        this.getData = function() {
            return data;
        };

        /**
         * aerogear.dataManager.adapters.memory#setData()
         *
         * Resets the complete contents of the store's data
         **/
        this.setData = function( newData ) {
            data = newData;
        };

        /**
         * aerogear.dataManager.adapters.memory#addDataRecord()
         *
         * Adds a record to the store's data set
         **/
        this.addDataRecord = function( record ) {
            data.push( record );
        };

        /**
         * aerogear.dataManager.adapters.memory#removeDataRecord()
         *
         * Removes a single record from the store's data set
         **/
        this.removeDataRecord = function( record ) {
            data.splice( record, 1 );
        };
    };

    // Public Methods
    /**
     * aerogear.dataManager.adapters.memory#read( [id] ) -> Object
     * - id (Mixed): Usually a String or Number representing a single "record" in the data set or if no id is specified, all data is returned
     *
     * Returns data from the store, optionally filtered by an id
     **/
    aerogear.dataManager.adapters.memory.prototype.read = function( id ) {
        var filter = {};
        filter[ this.getRecordId() ] = id;
        return id ? this.filter( filter ) : this.getData();
    };

    /**
     * aerogear.dataManager.adapters.memory#save( data[, reset] ) -> Object
     * - data (Mixed): An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
     * - reset (Boolean): If true, this will empty the current data and set it to the data being saved
     *
     * Saves data to the store, optionally clearing and resetting the data
     **/
    aerogear.dataManager.adapters.memory.prototype.save = function( data, reset ) {
        var itemFound = false;

        data = aerogear.isArray( data ) ? data : [ data ];

        if ( reset ) {
            this.setData( data );
        } else {
            if ( this.getData() ) {
                for ( var i = 0; i < data.length; i++ ) {
                    for( var item in this.getData() ) {
                        if ( this.getData()[ item ][ this.getRecordId() ] === data[ i ][ this.getRecordId() ] ) {
                            this.getData()[ item ] = data[ i ];
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

        return this.getData();
    };

    /**
     * aerogear.dataManager.adapters.memory#remove( toRemove ) -> Object
     * - toRemove (Mixed): A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
     *
     * Removes data from the store
     **/
    aerogear.dataManager.adapters.memory.prototype.remove = function( toRemove ) {
        if ( !toRemove ) {
            // empty data array and return
            this.setData( [] );
            return this.getData();
        } else {
            toRemove = aerogear.isArray( toRemove ) ? toRemove : [ toRemove ];
        }
        var delId,
            item;

        for ( var i = 0; i < toRemove.length; i++ ) {
            if ( typeof toRemove[ i ] === "string" || typeof toRemove[ i ] === "number" ) {
                delId = toRemove[ i ];
            } else if ( toRemove ) {
                delId = toRemove[ i ][ this.getRecordId() ];
            } else {
                // Missing record id so just skip this item in the arrray
                continue;
            }

            for( item in this.getData() ) {
                if ( this.getData()[ item ][ this.getRecordId() ] === delId ) {
                    this.removeDataRecord( item );
                }
            }
        }

        return this.getData();
    };

    /**
     * aerogear.dataManager.adapters.memory#filter( filterParameters[, matchAny = false] ) -> Array[Object]
     * - filterParameters (Object): An object containing key value pairs on which to filter the store's data. To filter a single parameter on multiple values, the value can be an object containing a data key with an Array of values to filter on and its own matchAny key that will override the global matchAny for that specific filter parameter.
     * - matchAny (Boolean): When true, an item is included in the output if any of the filter parameters is matched.
     *
     * Returns a filtered array of data objects based on the contents of the store's data object and the filter parameters. This method only returns a copy of the data and leaves the original data object intact.
     **/
    aerogear.dataManager.adapters.memory.prototype.filter = function( filterParameters, matchAny ) {
        var filtered,
            i, j, k;

        if ( !filterParameters ) {
            filtered = this.getData() || [];
            return filtered;
        }

        filtered = this.getData().filter( function( value, index, array) {
            var match = matchAny ? false : true,
                keys = Object.keys( filterParameters ),
                filterObj, paramMatch, paramResult;

            for ( i = 0; i < keys.length; i++ ) {
                if ( filterParameters[ keys[ i ] ].data ) {
                    // Parameter value is an object
                    filterObj = filterParameters[ keys[ i ] ];
                    paramResult = filterObj.matchAny ? false : true;

                    for ( j = 0; j < filterObj.data.length; j++ ) {
                        if( aerogear.isArray( value[ keys[ i ] ] ) ) {
                            if(value[ keys [ i ] ].length ) {
                                if( $( value[ keys ] ).not( filterObj.data ).length === 0 && $( filterObj.data ).not( value[ keys ] ).length === 0 ) {
                                    paramResult = true;
                                    break;
                                } else {
                                    for( k = 0; k < value[ keys[ i ] ].length; k++ ) {
                                        if ( filterObj.matchAny && filterObj.data[ j ] === value[ keys[ i ] ][ k ] ) {
                                            // At least one value must match and this one does so return true
                                            paramResult = true;
                                            break;
                                        }
                                        if ( !filterObj.matchAny && filterObj.data[ j ] !== value[ keys[ i ] ][ k ] ) {
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
                    }
                } else {
                    // Filter on parameter value
                    if( aerogear.isArray( value[ keys[ i ] ] ) ) {
                        paramResult = matchAny ? false: true;

                        if(value[ keys[ i ] ].length ) {
                            for(j = 0; j < value[ keys[ i ] ].length; j++ ) {
                                if( matchAny && filterParameters[ keys[ i ] ] === value[ keys[ i ] ][ j ]  ) {
                                    //at least one must match and this one does so return true
                                    paramResult = true;
                                    break;
                                }
                                if( !matchAny && filterParameters[ keys[ i ] ] !== value[ keys[ i ] ][ j ] ) {
                                    //All must match but this one doesn't so return false
                                    paramResult = false;
                                    break;
                                }
                            }
                        } else {
                            paramResult = false;
                        }
                    } else {
                         paramResult = filterParameters[ keys[ i ] ] === value[ keys[ i ] ] ? true : false;
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

        return filtered;
    };
})( aerogear, jQuery );

(function( aerogear, $, undefined ) {
    /**
     * aerogear.auth
     * The aerogear.auth namespace provides an authentication and enrollment API. Through the use of adapters, this library provides common methods like enroll, login and logout that will just work.
     *
     * `aerogear.auth( config ) -> Object`
     * - **config** (Mixed) - This can be a variety of types specifying how to create the module as illustrated below
     *
     * When passing an auth configuration object to `add`, the following items can be provided:
     *  - **name** - String (Required), the name that the module will later be referenced by
     *  - **type** - String (Optional, default - "rest"), the type of module as determined by the adapter used
     *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
     *   - Adapters may have a number of varying configuration settings
     *
     * Returns an object representing a collection of authentication modules. This object provides a standard way to authenticate with a service no matter the data format or transport expected.
     *
     * ##### Example
     *
     *      // Create an empty authenticator
     *      var auth = aerogear.auth();
     *
     *      // Create a single module using the default adapter
     *      var auth2 = aerogear.auth( "myAuth" );
     *
     *      // Create multiple modules using the default adapter
     *      var auth3 = aerogear.auth( [ "someAuth", "anotherAuth" ] );
     **/
    aerogear.auth = function( config ) {
        var auth = $.extend( {}, aerogear, {
                lib: "auth",
                type: config.type || "rest",
                collectionName: "modules"
            });

        return auth.add( config );
    };

    /**
     * aerogear.auth.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.auth namespace dynamically and still be accessible to the add method
     **/
    aerogear.auth.adapters = {};
})( aerogear, jQuery );

(function( aerogear, $, undefined ) {
    /**
     * new aerogear.auth.adapters.rest
     *
     * The REST adapter is the default type used when creating a new authentication module. It uses jQuery.ajax to communicate with the server.
     *
     * `aerogear.auth.adapters.rest( moduleName[, settings] ) -> Object`
     * - moduleName (String): the name used to reference this particular auth module
     * - settings (Object): an object used to pass additional parameters to the module
     *  - endpoints (Object): a set of REST endpoints that correspond to the different public methods including enroll, login and logout
     *  - baseURL (String): defines the base URL to use for an endpoint
     **/
    aerogear.auth.adapters.rest = function( moduleName, settings ) {
        // Allow instantiation without using new
        if ( !( this instanceof aerogear.auth.adapters.rest ) ) {
            return new aerogear.auth.adapters.rest( moduleName, settings );
        }

        settings = settings || {};

        // Private Instance vars
        var endpoints = settings.endpoints || {},
            type = "rest",
            name = moduleName,
            agAuth = !!settings.agAuth,
            baseURL = settings.baseURL,
            tokenName = settings.tokenName || "Auth-Token";

        // Privileged methods
        /**
         * aerogear.auth.adapters.rest#isAuthenticated() -> Boolean
         *
         * Return whether or not the client should consider itself authenticated. Of course, the server may have removed access so that will have to be handled when a request is made
         **/
        this.isAuthenticated = function() {
            if ( agAuth ) {
                return !!sessionStorage.getItem( "ag-auth-" + name );
            } else {
                // For the default (rest) adapter, we assume if not using agAuth then session so auth will be handled server side
                return true;
            }
        };

        /**
         * aerogear.auth.adapters.rest#addAuthIdentifier( settings ) -> Object
         * - settings (Object): the settings object that will have the auth identifier added
         *
         * Adds the auth token to the headers and returns the modified version of the settings
         **/
        this.addAuthIdentifier = function( settings ) {
            settings.headers = {};
            settings.headers[ tokenName ] = sessionStorage.getItem( "ag-auth-" + name );
            return $.extend( {}, settings );
        };

        /**
         * aerogear.auth.adapters.rest#deauthorize()
         *
         * Removes the stored token effectively telling the client it must re-authenticate with the server
         **/
        this.deauthorize = function() {
            sessionStorage.removeItem( "ag-auth-" + name );
        };

        /**
         * aerogear.auth.adapters.rest#getSettings() -> Object
         *
         * Returns the value of the private settings var
         **/
        this.getSettings = function() {
            return settings;
        };

        /**
         * aerogear.auth.adapters.rest#getSettings() -> Object
         *
         * Returns the value of the private settings var
         **/
        this.getEndpoints = function() {
            return endpoints;
        };

        /**
         * aerogear.auth.adapters.rest#getName() -> String
         *
         * Returns the value of the private name var
         **/
        this.getName = function() {
            return name;
        };

        /**
         * aerogear.auth.adapters.rest#getAGAuth() -> Boolean
         *
         * Returns the value of the private agAuth var which determines whether or not the AeroGear style authentication token should be used
         **/
        this.getAGAuth = function() {
            return agAuth;
        };

        /**
         * aerogear.auth.adapters.rest#getBaseURL() -> String
         *
         * Returns the value of the private baseURL var
         **/
        this.getBaseURL = function() {
            return baseURL;
        };

        /**
         * aerogear.auth.adapters.rest#getTokenName() -> Object
         *
         * Returns the value of the private tokenName var
         **/
        this.getTokenName = function() {
            return tokenName;
        };
    };

    //Public Methods
    /**
     * aerogear.auth.adapters.rest#enroll( data[, options] ) -> Object
     * - data (Object): User profile to enroll
     * - options (Object): Options to pass to the enroll method.
     *  - baseURL (String): defines the base URL to use for an endpoint
     *  - contentType (String): set the content type for the AJAX request (defaults to application/json when using agAuth)
     *  - dataType (String): specify the data expected to be returned by the server (defaults to json when using agAuth)
     *  - error (Function): callback to be executed if the AJAX request results in an error
     *  - success (Function): callback to be executed if the AJAX request results in an error
     *
     * Enroll a new user in the authentication system
     **/
    aerogear.auth.adapters.rest.prototype.enroll = function( data, options ) {
        options = options || {};

        var that = this,
            name = this.getName(),
            tokenName = this.getTokenName(),
            baseURL = this.getBaseURL(),
            endpoints = this.getEndpoints(),
            agAuth = this.getAGAuth(),
            success = function( data, textStatus, jqXHR ) {
                sessionStorage.setItem( "ag-auth-" + name, that.getAGAuth() ? jqXHR.getResponseHeader( tokenName ) : "true" );

                if ( options.success ) {
                    options.success.apply( this, arguments );
                }
            },
            error = function( jqXHR, textStatus, errorThrown ) {
                var args;

                try {
                    jqXHR.responseJSON = JSON.parse( jqXHR.responseText );
                    args = [ jqXHR, textStatus, errorThrown ];
                } catch( error ) {
                    args = arguments;
                }

                if ( options.error ) {
                    options.error.apply( this, args );
                }
            },
            extraOptions = {
                success: success,
                error: error,
                data: data
            },
            url = "";

        if ( options.contentType ) {
            extraOptions.contentType = options.contentType;
        } else if ( agAuth ) {
            extraOptions.contentType = "application/json";
        }
        if ( options.dataType ) {
            extraOptions.dataType = options.dataType;
        } else if ( agAuth ) {
            extraOptions.dataType = "json";
        }
        if ( options.baseURL ) {
            url = options.baseURL;
        } else if ( baseURL ) {
            url = baseURL;
        }
        if ( endpoints.enroll ) {
            url += endpoints.enroll;
        } else {
            url += "auth/register";
        }
        if ( url.length ) {
            extraOptions.url = url;
        }

        return $.ajax( $.extend( {}, this.getSettings(), { type: "POST" }, extraOptions ) );
    };

    /**
     * aerogear.auth.adapters.rest#login( data[, options] ) -> Object
     * - data (Object): A set of key value pairs representing the user's credentials
     * - options (Object): An object containing key/value pairs representing options
     *  - baseURL (String): defines the base URL to use for an endpoint
     *  - contentType (String): set the content type for the AJAX request (defaults to application/json when using agAuth)
     *  - dataType (String): specify the data expected to be returned by the server (defaults to json when using agAuth)
     *  - error (Function): callback to be executed if the AJAX request results in an error
     *  - success (Function): callback to be executed if the AJAX request results in an error
     *
     * Authenticate a user
     **/
    aerogear.auth.adapters.rest.prototype.login = function( data, options ) {
        options = options || {};

        var that = this,
            name = this.getName(),
            tokenName = this.getTokenName(),
            baseURL = this.getBaseURL(),
            endpoints = this.getEndpoints(),
            agAuth = this.getAGAuth(),
            success = function( data, textStatus, jqXHR ) {
                sessionStorage.setItem( "ag-auth-" + name, that.getAGAuth() ? jqXHR.getResponseHeader( tokenName ) : "true" );

                if ( options.success ) {
                    options.success.apply( this, arguments );
                }
            },
            error = function( jqXHR, textStatus, errorThrown ) {
                var args;

                try {
                    jqXHR.responseJSON = JSON.parse( jqXHR.responseText );
                    args = [ jqXHR, textStatus, errorThrown ];
                } catch( error ) {
                    args = arguments;
                }

                if ( options.error ) {
                    options.error.apply( this, args );
                }
            },
            extraOptions = {
                success: success,
                error: error,
                data: data
            },
            url = "";

        if ( options.contentType ) {
            extraOptions.contentType = options.contentType;
        } else if ( agAuth ) {
            extraOptions.contentType = "application/json";
        }
        if ( options.dataType ) {
            extraOptions.dataType = options.dataType;
        } else if ( agAuth ) {
            extraOptions.dataType = "json";
        }
        if ( options.baseURL ) {
            url = options.baseURL;
        } else if ( baseURL ) {
            url = baseURL;
        }
        if ( endpoints.login ) {
            url += endpoints.login;
        } else {
            url += "auth/login";
        }
        if ( url.length ) {
            extraOptions.url = url;
        }

        return $.ajax( $.extend( {}, this.getSettings(), { type: "POST" }, extraOptions ) );
    };

    /**
     * aerogear.auth.adapters.rest#logout( [options] ) -> Object
     * - options (Object): An object containing key/value pairs representing options
     *  - baseURL (String): defines the base URL to use for an endpoint
     *  - error (Function): callback to be executed if the AJAX request results in an error
     *  - success (Function): callback to be executed if the AJAX request results in an error
     *
     * End a user's authenticated session
     **/
    aerogear.auth.adapters.rest.prototype.logout = function( options ) {
        options = options || {};

        var that = this,
            name = this.getName(),
            tokenName = this.getTokenName(),
            baseURL = this.getBaseURL(),
            endpoints = this.getEndpoints(),
            success = function( data, textStatus, jqXHR ) {
                that.deauthorize();

                if ( options.success ) {
                    options.success.apply( this, arguments );
                }
            },
            error = function( jqXHR, textStatus, errorThrown ) {
                var args;

                try {
                    jqXHR.responseJSON = JSON.parse( jqXHR.responseText );
                    args = [ jqXHR, textStatus, errorThrown ];
                } catch( error ) {
                    args = arguments;
                }

                if ( options.error ) {
                    options.error.apply( this, args );
                }
            },
            extraOptions = {
                success: success,
                error: error
            },
            url = "";

        if ( options.baseURL ) {
            url = options.baseURL;
        } else if ( baseURL ) {
            url = baseURL;
        }
        if ( endpoints.logout ) {
            url += endpoints.logout;
        } else {
            url += "auth/logout";
        }
        if ( url.length ) {
            extraOptions.url = url;
        }

        if ( this.isAuthenticated() ) {
            extraOptions.headers = {};
            extraOptions.headers[ tokenName ] = sessionStorage.getItem( "ag-auth-" + name );
        }

        return $.ajax( $.extend( {}, this.getSettings(), { type: "POST" }, extraOptions ) );
    };
})( aerogear, jQuery );
