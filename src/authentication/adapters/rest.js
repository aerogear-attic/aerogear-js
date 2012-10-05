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
