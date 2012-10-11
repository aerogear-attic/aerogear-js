(function( AeroGear, $, undefined ) {
    /**
        The REST adapter is the default type used when creating a new authentication module. It uses jQuery.ajax to communicate with the server.
        @constructs AeroGear.Auth.adapters.Rest
        @param {String} moduleName - the name used to reference this particular auth module
        @param {Object} [settings={}] - the settings to be passed to the adapter
        @param {Boolean} [settings.agAuth] - True if this adapter should use AeroGear's token based authentication model
        @param {String} [settings.baseURL] - defines the base URL to use for an endpoint
        @param {Object} [settings.endpoints={}] - a set of REST endpoints that correspond to the different public methods including enroll, login and logout
        @param {String} [settings.tokenName="Auth-Token"] - defines the name used for the token header when using agAuth
        @returns {Object} The created auth module
     */
    AeroGear.Auth.adapters.Rest = function( moduleName, settings ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.Auth.adapters.Rest ) ) {
            return new AeroGear.Auth.adapters.Rest( moduleName, settings );
        }

        settings = settings || {};

        // Private Instance vars
        var endpoints = settings.endpoints || {},
            type = "Rest",
            name = moduleName,
            agAuth = !!settings.agAuth,
            baseURL = settings.baseURL,
            tokenName = settings.tokenName || "Auth-Token";

        // Privileged methods
        /**
            Return whether or not the client should consider itself authenticated. Of course, the server may have removed access so that will have to be handled when a request is made
            @private
            @augments Rest
            @returns {Boolean}
         */
        this.isAuthenticated = function() {
            if ( agAuth ) {
                return !!sessionStorage.getItem( "ag-auth-" + name );
            } else {
                // For the default (rest) adapter, we assume if not using agAuth then session so auth will be handled server side
                return true;
            }
        };

        /**
            Adds the auth token to the headers and returns the modified version of the settings
            @private
            @augments Rest
            @param {Object} settings - the settings object that will have the auth identifier added
            @returns {Object} Settings extended with auth identifier
         */
        this.addAuthIdentifier = function( settings ) {
            settings.headers = {};
            settings.headers[ tokenName ] = sessionStorage.getItem( "ag-auth-" + name );
            return $.extend( {}, settings );
        };

        /**
            Removes the stored token effectively telling the client it must re-authenticate with the server
            @private
            @augments Rest
         */
        this.deauthorize = function() {
            sessionStorage.removeItem( "ag-auth-" + name );
        };


        /**
            Returns the value of the private settings var
            @private
            @augments Rest
         */
        this.getSettings = function() {
            return settings;
        };


        /**
            Returns the value of the private settings var
            @private
            @augments Rest
         */
        this.getEndpoints = function() {
            return endpoints;
        };

        /**
            Returns the value of the private name var
            @private
            @augments Rest
         */
        this.getName = function() {
            return name;
        };

        /**
            Returns the value of the private agAuth var which determines whether or not the AeroGear style authentication token should be used
            @private
            @augments Rest
         */
        this.getAGAuth = function() {
            return agAuth;
        };

        /**
            Returns the value of the private baseURL var
            @private
            @augments Rest
         */
        this.getBaseURL = function() {
            return baseURL;
        };

        /**
            Returns the value of the private tokenName var
            @private
            @augments Rest
         */
        this.getTokenName = function() {
            return tokenName;
        };
    };

    //Public Methods
    /**
        Enroll a new user in the authentication system
        @param {Object} data - User profile to enroll
        @param {Object} [options={}] - Options to pass to the enroll method
        @param {String} [options.baseURL] - defines the base URL to use for an endpoint
        @param {String} [options.contentType] - set the content type for the AJAX request (defaults to application/json when using agAuth)
        @param {String} [options.dataType] - specify the data expected to be returned by the server (defaults to json when using agAuth)
        @param {Function} [options.error] - callback to be executed if the AJAX request results in an error
        @param {Function} [options.success] - callback to be executed if the AJAX request results in success
        @returns {Object} The jqXHR created by jQuery.ajax
     */
    AeroGear.Auth.adapters.Rest.prototype.enroll = function( data, options ) {
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
        Authenticate a user
        @param {Object} data - A set of key value pairs representing the user's credentials
        @param {Object} [options={}] - An object containing key/value pairs representing options
        @param {String} [options.baseURL] - defines the base URL to use for an endpoint
        @param {String} [options.contentType] - set the content type for the AJAX request (defaults to application/json when using agAuth)
        @param {String} [options.dataType] - specify the data expected to be returned by the server (defaults to json when using agAuth)
        @param {Function} [options.error] - callback to be executed if the AJAX request results in an error
        @param {String} [options.success] - callback to be executed if the AJAX request results in success
        @returns {Object} The jqXHR created by jQuery.ajax
     */
    AeroGear.Auth.adapters.Rest.prototype.login = function( data, options ) {
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
        End a user's authenticated session
        @param {Object} [options={}] - An object containing key/value pairs representing options
        @param {String} [options.baseURL] - defines the base URL to use for an endpoint
        @param {Function} [options.error] - callback to be executed if the AJAX request results in an error
        @param {String} [options.success] - callback to be executed if the AJAX request results in success
        @returns {Object} The jqXHR created by jQuery.ajax
     */
    AeroGear.Auth.adapters.Rest.prototype.logout = function( options ) {
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
})( AeroGear, jQuery );
