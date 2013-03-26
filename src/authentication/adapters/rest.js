/* AeroGear JavaScript Library
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright Red Hat, Inc., and individual contributors
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
/**
    The REST adapter is the default type used when creating a new authentication module. It uses jQuery.ajax to communicate with the server.
    This constructor is instantiated when the "Auth.add()" method is called
    @constructs AeroGear.Auth.adapters.Rest
    @param {String} moduleName - the name used to reference this particular auth module
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {Boolean} [settings.agAuth] - True if this adapter should use AeroGear's token based authentication model
    @param {String} [settings.baseURL] - defines the base URL to use for an endpoint
    @param {Object} [settings.endpoints={}] - a set of REST endpoints that correspond to the different public methods including enroll, login and logout
    @param {String} [settings.tokenName="Auth-Token"] - defines the name used for the token header when using agAuth
    @returns {Object} The created auth module
    @example
//Create an empty Authenticator
var auth = AeroGear.Auth();

//Add a custom REST module to it
auth.add( "module1", {
    agAuth: true,
    baseURL: "http://customURL.com"
});

//Add a custom REST module to it with custom security endpoints
auth.add( "module2", {
    agAuth: true,
    endpoints: {
        enroll: "register",
        login: "go",
        logout: "leave"
    }
});
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
        baseURL = settings.baseURL || "",
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
        settings.headers = settings.headers ? settings.headers : {};
        settings.headers[ tokenName ] = sessionStorage.getItem( "ag-auth-" + name );
        return jQuery.extend( {}, settings );
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

    /**
        Process the options passed to a method
        @private
        @augments Rest
     */
     this.processOptions = function( options ) {
        var processedOptions = {};
        if ( options.contentType ) {
            processedOptions.contentType = options.contentType;
        } else if ( agAuth ) {
            processedOptions.contentType = "application/json";
        }

        if ( options.dataType ) {
            processedOptions.dataType = options.dataType;
        } else if ( agAuth ) {
            processedOptions.dataType = "json";
        }

        if ( options.baseURL ) {
            processedOptions.url = options.baseURL;
        } else {
            processedOptions.url = baseURL;
        }

        return processedOptions;
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
    @param {AeroGear~completeCallbackREST} [options.complete] - a callback to be called when the result of the request to the server is complete, regardless of success
    @param {AeroGear~errorCallbackREST} [options.error] - callback to be executed if the AJAX request results in an error
    @param {AeroGear~successCallbackREST} [options.success] - callback to be executed if the AJAX request results in success
    @returns {Object} The jqXHR created by jQuery.ajax
    @example
var auth = AeroGear.Auth( "userAuth" ).modules[ 0 ],
    data = { userName: "user", password: "abc123", name: "John" };

// Enroll a new user
auth.enroll( data );

//Add a custom REST module to it with custom security endpoints
var custom = AeroGear.Auth({
    name: "customModule",
    settings: {
        agAuth: true,
        endpoints: {
        enroll: "register",
        login: "go",
        logout: "leave"
    }
}).modules[ 0 ],
data = { userName: "user", password: "abc123", name: "John" };

custom.enroll( data, {
    baseURL: "http://customurl/",
    success: function( data ) { ... },
    error: function( error ) { ... }
});
 */
AeroGear.Auth.adapters.Rest.prototype.enroll = function( data, options ) {
    options = options || {};

    var that = this,
        name = this.getName(),
        tokenName = this.getTokenName(),
        endpoints = this.getEndpoints(),
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
        extraOptions = jQuery.extend( {}, this.processOptions( options ), {
            complete: options.complete,
            success: success,
            error: error,
            data: data
        });

    if ( endpoints.enroll ) {
        extraOptions.url += endpoints.enroll;
    } else {
        extraOptions.url += "auth/enroll";
    }

    // Stringify data if we actually want to POST JSON data
    if ( extraOptions.contentType === "application/json" && extraOptions.data && typeof extraOptions.data !== "string" ) {
        extraOptions.data = JSON.stringify( extraOptions.data );
    }

    return jQuery.ajax( jQuery.extend( {}, this.getSettings(), { type: "POST" }, extraOptions ) );
};

/**
    Authenticate a user
    @param {Object} data - A set of key value pairs representing the user's credentials
    @param {Object} [options={}] - An object containing key/value pairs representing options
    @param {String} [options.baseURL] - defines the base URL to use for an endpoint
    @param {String} [options.contentType] - set the content type for the AJAX request (defaults to application/json when using agAuth)
    @param {String} [options.dataType] - specify the data expected to be returned by the server (defaults to json when using agAuth)
    @param {AeroGear~completeCallbackREST} [options.complete] - a callback to be called when the result of the request to the server is complete, regardless of success
    @param {AeroGear~errorCallbackREST} [options.error] - callback to be executed if the AJAX request results in an error
    @param {AeroGear~successCallbackREST} [options.success] - callback to be executed if the AJAX request results in success
    @returns {Object} The jqXHR created by jQuery.ajax
    @example
var auth = AeroGear.Auth( "userAuth" ).modules[ 0 ],
    data = { userName: "user", password: "abc123" };

// Enroll a new user
auth.login( data );

//Add a custom REST module to it with custom security endpoints
var custom = AeroGear.Auth({
    name: "customModule",
    settings: {
        agAuth: true,
        endpoints: {
        enroll: "register",
        login: "go",
        logout: "leave"
    }
}).modules[ 0 ],
data = { userName: "user", password: "abc123", name: "John" };

custom.login( data, {
    baseURL: "http://customurl/",
    success: function( data ) { ... },
    error: function( error ) { ... }
});
 */
AeroGear.Auth.adapters.Rest.prototype.login = function( data, options ) {
    options = options || {};

    var that = this,
        name = this.getName(),
        tokenName = this.getTokenName(),
        endpoints = this.getEndpoints(),
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
        extraOptions = jQuery.extend( {}, this.processOptions( options ), {
            complete: options.complete,
            success: success,
            error: error,
            data: data
        });

    if ( endpoints.login ) {
        extraOptions.url += endpoints.login;
    } else {
        extraOptions.url += "auth/login";
    }

    // Stringify data if we actually want to POST/PUT JSON data
    if ( extraOptions.contentType === "application/json" && extraOptions.data && typeof extraOptions.data !== "string" ) {
        extraOptions.data = JSON.stringify( extraOptions.data );
    }

    return jQuery.ajax( jQuery.extend( {}, this.getSettings(), { type: "POST" }, extraOptions ) );
};

/**
    End a user's authenticated session
    @param {Object} [options={}] - An object containing key/value pairs representing options
    @param {String} [options.baseURL] - defines the base URL to use for an endpoint
    @param {AeroGear~completeCallbackREST} [options.complete] - a callback to be called when the result of the request to the server is complete, regardless of success
    @param {AeroGear~errorCallbackREST} [options.error] - callback to be executed if the AJAX request results in an error
    @param {AeroGear~successCallbackREST} [options.success] - callback to be executed if the AJAX request results in success
    @returns {Object} The jqXHR created by jQuery.ajax
    @example
var auth = AeroGear.Auth( "userAuth" ).modules[ 0 ];

// Enroll a new user
auth.logout();

    //Add a custom REST module to it with custom security endpoints
var custom = AeroGear.Auth({
    name: "customModule",
    settings: {
        agAuth: true,
        endpoints: {
        enroll: "register",
        login: "go",
        logout: "leave"
    }
}).modules[ 0 ],
data = { userName: "user", password: "abc123", name: "John" };

custom.logout({
    baseURL: "http://customurl/",
    success: function( data ) { ... },
    error: function( error ) { ... }
});
 */
AeroGear.Auth.adapters.Rest.prototype.logout = function( options ) {
    options = options || {};

    var that = this,
        name = this.getName(),
        tokenName = this.getTokenName(),
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
        extraOptions = jQuery.extend( {}, this.processOptions( options ), {
            complete: options.complete,
            success: success,
            error: error
        });

    if ( endpoints.logout ) {
        extraOptions.url += endpoints.logout;
    } else {
        extraOptions.url += "auth/logout";
    }

    extraOptions.headers = {};
    extraOptions.headers[ tokenName ] = sessionStorage.getItem( "ag-auth-" + name );

    return jQuery.ajax( jQuery.extend( {}, this.getSettings(), { type: "POST" }, extraOptions ) );
};
