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
            baseURL: settings.baseURL,
            tokenName: settings.tokenName || "Auth-Token",
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
                        sessionStorage.setItem( "ag-auth-" + that.name, that.agAuth ? data[ that.tokenName ] : "true" );

                        if ( options.success ) {
                            options.success.apply( this, arguments );
                        }
                    },
                    extraOptions = {
                        contentType: options.contentType,
                        dataType: options.dataType,
                        success: success,
                        error: options.error,
                        data: data
                    },
                    url = "";

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
                        sessionStorage.setItem( "ag-auth-" + that.name, that.agAuth ? data[ that.tokenName ] : "true" );

                        if ( options.success ) {
                            options.success.apply( this, arguments );
                        }
                    },
                    extraOptions = {
                        contentType: options.contentType,
                        dataType: options.dataType,
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
                if ( endPoints.login ) {
                    url += endPoints.login;
                } else {
                    url += "auth/login";
                }
                if ( url.length ) {
                    extraOptions.url = url;
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
                    extraOptions.headers = {};
                    extraOptions.headers[ this.tokenName ] = sessionStorage.getItem( "ag-auth-" + this.name );
                }

                return $.ajax( $.extend( {}, settings, { type: "POST" }, extraOptions ) );
            },

            isAuthenticated: function() {
                var auth = sessionStorage.getItem( "ag-auth-" + this.name );
                return !!auth;
            },

            addAuth: function( settings ) {
                settings.headers = {};
                settings.headers[ this.tokenName ] = sessionStorage.getItem( "ag-auth-" + this.name );
                return $.extend( {}, settings );
            },

            deauthorize: function() {
                sessionStorage.removeItem( "ag-auth-" + this.name );
            }
        };
    };
})( aerogear, jQuery );
