(function( aerogear, $, undefined ) {
    /**
     * aerogear.auth.adapters.rest
     *
     * The REST adapter is the default type used when creating a new authentication module. It uses jQuery.ajax to communicate with the server.
     *
     **/
    aerogear.auth.adapters.rest = function( moduleName, settings ) {
        // Allow instantiation without using new
        if ( !( this instanceof aerogear.auth.adapters.rest ) ) {
            return new aerogear.auth.adapters.rest( moduleName, settings );
        }

        settings = settings || {};
        var endPoints = settings.endPoints || {},
            type = "rest",
            name = moduleName,
            agAuth = !!settings.agAuth,
            baseURL = settings.baseURL,
            tokenName = settings.tokenName || "Auth-Token";

        // Privileged methods
        this.isAuthenticated = function() {
            return agAuth;
        };

        this.addAuth = function( settings ) {
            settings.headers = {};
            settings.headers[ tokenName ] = sessionStorage.getItem( "ag-auth-" + name );
            return $.extend( {}, settings );
        };

        this.deauthorize = function() {
            sessionStorage.removeItem( "ag-auth-" + name );
        };

        this.getSettings = function() {
            return settings;
        };
        this.getEndPoints = function() {
            return endPoints;
        };
        this.getType = function() {
            return type;
        };
        this.getName = function() {
            return name;
        };
        this.getBaseURL = function() {
            return baseURL;
        };
        this.getTokenName = function() {
            return tokenName;
        };
    };

    //Public Methods

    /**
     * aerogear.auth.adapters.rest#register( data[, options] ) -> Object
     * - data (Object): User profile to register
     * - options (Object): Options to pass to the register method.
     *
     **/
    aerogear.auth.adapters.rest.prototype.register = function( data, options ) {
        options = options || {};

        var that = this,
            name = this.getName(),
            tokenName = this.getTokenName(),
            baseURL = this.getBaseURL(),
            endPoints = this.getEndPoints(),
            success = function( data, textStatus, jqXHR ) {
                sessionStorage.setItem( "ag-auth-" + name, that.isAuthenticated() ? jqXHR.getResponseHeader( tokenName ) : "true" );

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
                contentType: options.contentType,
                dataType: options.dataType,
                success: success,
                error: error,
                data: data
            },
            url = "";

        if ( options.baseURL ) {
            url = options.baseURL;
        } else if ( baseURL ) {
            url = baseURL;
        }
        if ( endPoints.register ) {
            url += endPoints.register;
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
     *
     **/
    aerogear.auth.adapters.rest.prototype.login = function( data, options ) {
        options = options || {};

        var that = this,
            name = this.getName(),
            tokenName = this.getTokenName(),
            baseURL = this.getBaseURL(),
            endPoints = this.getEndPoints(),
            success = function( data, textStatus, jqXHR ) {
                sessionStorage.setItem( "ag-auth-" + name, that.isAuthenticated() ? jqXHR.getResponseHeader( tokenName ) : "true" );

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
                contentType: options.contentType,
                dataType: options.dataType,
                success: success,
                error: error,
                data: data
            },
            url = "";

        if ( options.baseURL ) {
            url = options.baseURL;
        } else if ( baseURL ) {
            url = baseURL;
        }
        if ( endPoints.login ) {
            url += endPoints.login;
        } else {
            url += "auth/login";
        }
        if ( url.length ) {
            extraOptions.url = url;
        }

        return $.ajax( $.extend( {}, this.getSettings(), { type: "POST" }, extraOptions ) );
    };

    aerogear.auth.adapters.rest.prototype.logout = function( options ) {
        options = options || {};

        var that = this,
            name = this.getName(),
            tokenName = this.getTokenName(),
            baseURL = this.getBaseURL(),
            endPoints = this.getEndPoints(),
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
        if ( endPoints.logout ) {
            url += endPoints.logout;
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
