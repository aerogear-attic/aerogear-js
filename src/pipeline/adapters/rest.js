(function( AeroGear, $, undefined ) {
    /**
        The REST adapter is the default type used when creating a new pipe. It uses jQuery.ajax to communicate with the server. By default, the RESTful endpoint used by this pipe is the app's current context, followed by the pipe name. For example, if the app is running on http://mysite.com/myApp, then a pipe named `tasks` would use http://mysite.com/myApp/tasks as its REST endpoint.
        @constructs AeroGear.Pipeline.adapters.Rest
        @param {String} pipeName - the name used to reference this particular pipe
        @param {Object} [settings={}] - the settings to be passed to the adapter
        @param {Object} [settings.authenticator=null] - the AeroGear.auth object used to pass credentials to a secure endpoint
        @param {String} [settings.baseURL] - defines the base URL to use for an endpoint
        @param {String} [settings.endpoint=pipename] - overrides the default naming of the endpoint which uses the pipeName
        @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
        @returns {Object} The created pipe
     */
    AeroGear.Pipeline.adapters.Rest = function( pipeName, settings ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.Pipeline.adapters.Rest ) ) {
            return new AeroGear.Pipeline.adapters.Rest( pipeName, settings );
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
            type = "Rest";

        // Privileged Methods
        /**
            Return whether or not the client should consider itself authenticated. Of course, the server may have removed access so that will have to be handled when a request is made
            @private
            @augments Rest
            @returns {Boolean}
         */
        this.isAuthenticated = function() {
            return authenticator ? authenticator.isAuthenticated() : true;
        };

        /**
            Adds the auth token to the headers and returns the modified version of the settings
            @private
            @augments Rest
            @param {Object} settings - the settings object that will have the auth identifier added
            @returns {Object} Settings extended with auth identifier
         */
        this.addAuthIdentifier = function( settings ) {
            return authenticator ? authenticator.addAuthIdentifier( settings ) : settings;
        };

        /**
            Removes the stored token effectively telling the client it must re-authenticate with the server
            @private
            @augments Rest
         */
        this.deauthorize = function() {
            if ( authenticator ) {
                authenticator.deauthorize();
            }
        };

        /**
            Returns the value of the private ajaxSettings var
            @private
            @augments Rest
            @returns {Object}
         */
        this.getAjaxSettings = function() {
            return ajaxSettings;
        };

        /**
            Returns the value of the private recordId var
            @private
            @augments Rest
            @returns {String}
         */
        this.getRecordId = function() {
            return recordId;
        };

        /**
            Returns the value of the private authenticator var
            @private
            @augments Rest
            @returns {Object}
         */
        this.getAuthenticator = function() {
            return authenticator;
        };
    };

    // Public Methods
    /**
        Reads data from the specified endpoint
        @param {Object} [options={}] - Additional options
        @param {Function} [options.complete] - a callback to be called when the result of the request to the server is complete, regardless of success
        @param {Object} [options.data] - a hash of key/value pairs that can be passed to the server as additional information for use when determining what data to return
        @param {Function} [options.error] - a callback to be called when the request to the server results in an error
        @param {Object} [options.statusCode] - a collection of status codes and callbacks to fire when the request to the server returns on of those codes. For more info see the statusCode option on the <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax page</a>.
        @param {Function} [options.success] - a callback to be called when the result of the request to the server is successful
        @returns {Object} A deferred implementing the promise interface similar to the jqXHR created by jQuery.ajax
        @example
        var myPipe = AeroGear.pipeline( "tasks" ).pipes[ 0 ];

        // Get a set of key/value pairs of all data on the server associated with this pipe
        var allData = myPipe.read();

        // A data object can be passed to filter the data and in the case of REST,
        // this object is converted to query string parameters which the server can use.
        // The values would be determined by what the server is expecting
        var filteredData = myPipe.read({
            data: {
                limit: 10,
                date: "2012-08-01"
                ...
            }
        });
     */
    AeroGear.Pipeline.adapters.Rest.prototype.read = function( options ) {
        options = options || {};
        var that = this,
            success = function( data ) {
            var stores = options.stores ? AeroGear.isArray( options.stores ) ? options.stores : [ options.stores ] : [],
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
            var stores = options.stores ? that.isArray( options.stores ) ? options.stores : [ options.stores ] : [],
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

        return AeroGear.ajax( this, $.extend( {}, this.getAjaxSettings(), extraOptions ) );
    };

    /**
        Save data asynchronously to the server. If this is a new object (doesn't have a record identifier provided by the server), the data is created on the server (POST) and then that record is sent back to the client including the new server-assigned id, otherwise, the data on the server is updated (PUT).
        @param {Object} data - For new data, this will be an object representing the data to be saved to the server. For updating data, a hash of key/value pairs one of which must be the `recordId` you set during creation of the pipe representing the identifier the server will use to update this record and then any other number of pairs representing the data. The data object is then stringified and passed to the server to be processed.
        @param {Object} [options={}] - Additional options
        @param {Function} [options.complete] - a callback to be called when the result of the request to the server is complete, regardless of success
        @param {Function} [options.error] - a callback to be called when the request to the server results in an error
        @param {Object} [options.statusCode] - a collection of status codes and callbacks to fire when the request to the server returns on of those codes. For more info see the statusCode option on the <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax page</a>.
        @param {Function} [options.success] - a callback to be called when the result of the request to the server is successful
        @param {Object|Array} [options.stores] - A single store object or array of stores to be updated when a server update is successful
        @returns {Object} A deferred implementing the promise interface similar to the jqXHR created by jQuery.ajax
        @example
        var myPipe = AeroGear.pipeline( "tasks" ).pipes[ 0 ];

        // Store a new task
        myPipe.save({
            title: "Created Task",
            date: "2012-07-13",
            ...
        });

        // Pass a success and error callback, in this case using the REST pipe and jQuery.ajax so the functions take the same parameters.
        myPipe.save({
            title: "Another Created Task",
            date: "2012-07-13",
            ...
        },
        {
            success: function( data, textStatus, jqXHR ) {
                console.log( "Success" );
            },
            error: function( jqXHR, textStatus, errorThrown ) {
                console.log( "Error" );
            }
        });

        // Update an existing piece of data
        var toUpdate = myPipe.data[ 0 ];
        toUpdate.data.title = "Updated Task";
        myPipe.save( toUpdate );
     */
    AeroGear.Pipeline.adapters.Rest.prototype.save = function( data, options ) {
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
            var stores = AeroGear.isArray( options.stores ) ? options.stores : [ options.stores ],
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
            var stores = options.stores ? AeroGear.isArray( options.stores ) ? options.stores : [ options.stores ] : [],
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

        return AeroGear.ajax( this, $.extend( {}, ajaxSettings, extraOptions ) );
    };

    /**
        Remove data asynchronously from the server. Passing nothing will inform the server to remove all data at this pipe's endpoint.
        @param {String|Object} [data] - A variety of objects can be passed to specify the item(s) to remove
        @param {Object} [options={}] - Additional options
        @param {Function} [options.complete] - a callback to be called when the result of the request to the server is complete, regardless of success
        @param {Function} [options.error] - a callback to be called when the request to the server results in an error
        @param {Object} [options.statusCode] - a collection of status codes and callbacks to fire when the request to the server returns on of those codes. For more info see the statusCode option on the <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax page</a>.
        @param {Function} [options.success] - a callback to be called when the result of the request to the server is successful
        @param {Object|Array} [options.stores] - A single store object or array of stores to be updated when a server update is successful
        @returns {Object} A deferred implementing the promise interface similar to the jqXHR created by jQuery.ajax
        @example
        var myPipe = AeroGear.pipeline( "tasks" ).pipes[ 0 ];

        // Store a new task
        myPipe.save({
            title: "Created Task"
        });

        // Store another new task
        myPipe.save({
            title: "Another Created Task"
        });

        // Store one more new task
        myPipe.save({
            title: "And Another Created Task"
        });

        // Remove a particular item from the server by its id
        var toRemove = myPipe.data[ 0 ];
        myPipe.remove( toRemove.id );

        // Remove an item from the server using the data object
        toRemove = myPipe.data[ 0 ];
        myPipe.remove( toRemove );

        // Delete all remaining data from the server associated with this pipe
        myPipe.delete();
     */
    AeroGear.Pipeline.adapters.Rest.prototype.remove = function( toRemove, options ) {
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
                stores = AeroGear.isArray( options.stores ) ? options.stores : [ options.stores ];
                for ( item in stores ) {
                    stores[ item ].remove( delId );
                }
            }

            if ( options.success ) {
                options.success.apply( this, arguments );
            }
        },
        error = function( type, errorMessage ) {
            var stores = options.stores ? AeroGear.isArray( options.stores ) ? options.stores : [ options.stores ] : [],
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

        return AeroGear.ajax( this, $.extend( {}, ajaxSettings, extraOptions ) );
    };
})( AeroGear, jQuery );
