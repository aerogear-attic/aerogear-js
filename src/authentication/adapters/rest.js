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
    @status Stable
    @constructs AeroGear.Auth.adapters.Rest
    @param {String} moduleName - the name used to reference this particular auth module
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.baseURL] - defines the base URL to use for an endpoint
    @param {Object} [settings.endpoints={}] - a set of REST endpoints that correspond to the different public methods including enroll, login and logout
    @returns {Object} The created auth module
    @example
//Create an empty Authenticator
var auth = AeroGear.Auth();

//Add a custom REST module to it
auth.add( {
    name: "module1",
    settings: {
        baseURL: "http://customURL.com"
    }
});

//Add a custom REST module to it with custom security endpoints
auth.add( {
    name: "module2",
    settings: {
        endpoints: {
            enroll: "register",
            login: "go",
            logout: "leave"
        }
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
        baseURL = settings.baseURL || "";

    // Privileged methods
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
        Returns the value of the private baseURL var
        @private
        @augments Rest
     */
    this.getBaseURL = function() {
        return baseURL;
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
        }

        if ( options.dataType ) {
            processedOptions.dataType = options.dataType;
        }

        if ( options.baseURL ) {
            processedOptions.url = options.baseURL;
        } else {
            processedOptions.url = baseURL;
        }

        if( options.xhrFields ) {
            processedOptions.xhrFields = options.xhrFields;
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
    @param {String} [options.contentType] - set the content type for the AJAX request
    @param {String} [options.dataType] - specify the data expected to be returned by the server
    @param {Object} [options.xhrFields] - specify extra xhr options, like the withCredentials flag
    @param {AeroGear~completeCallbackREST} [options.complete] - a callback to be called when the result of the request to the server is complete, regardless of success
    @param {AeroGear~errorCallbackREST} [options.error] - callback to be executed if the AJAX request results in an error
    @param {AeroGear~successCallbackREST} [options.success] - callback to be executed if the AJAX request results in success
    @returns {Object} The jqXHR created by jQuery.ajax
    @example
var auth = AeroGear.Auth( "userAuth" ).modules.userAuth,
    data = { userName: "user", password: "abc123", name: "John" };

// Enroll a new user
auth.enroll( data );

//Add a custom REST module to it with custom security endpoints
var custom = AeroGear.Auth({
    name: "customModule",
    settings: {
        endpoints: {
            enroll: "register",
            login: "go",
            logout: "leave"
        }
    }
}).modules.customModule,
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
        endpoints = this.getEndpoints(),
        success = function( data, textStatus, jqXHR ) {
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
    @param {String} [options.contentType] - set the content type for the AJAX request
    @param {String} [options.dataType] - specify the data expected to be returned by the server
    @param {AeroGear~completeCallbackREST} [options.complete] - a callback to be called when the result of the request to the server is complete, regardless of success
    @param {AeroGear~errorCallbackREST} [options.error] - callback to be executed if the AJAX request results in an error
    @param {AeroGear~successCallbackREST} [options.success] - callback to be executed if the AJAX request results in success
    @returns {Object} The jqXHR created by jQuery.ajax
    @example
var auth = AeroGear.Auth( "userAuth" ).modules.userAuth,
    data = { userName: "user", password: "abc123" };

// Enroll a new user
auth.login( data );

//Add a custom REST module to it with custom security endpoints
var custom = AeroGear.Auth({
    name: "customModule",
    settings: {
        endpoints: {
            enroll: "register",
            login: "go",
            logout: "leave"
        }
    }
}).modules.customModule,
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
        endpoints = this.getEndpoints(),
        success = function( data, textStatus, jqXHR ) {
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
var auth = AeroGear.Auth( "userAuth" ).modules.userAuth;

// Enroll a new user
auth.logout();

    //Add a custom REST module to it with custom security endpoints
var custom = AeroGear.Auth({
    name: "customModule",
    settings: {
        endpoints: {
            enroll: "register",
            login: "go",
            logout: "leave"
        }
    }
}).modules.customModule,
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
        endpoints = this.getEndpoints(),
        success = function( data, textStatus, jqXHR ) {
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

    return jQuery.ajax( jQuery.extend( {}, this.getSettings(), { type: "POST" }, extraOptions ) );
};
