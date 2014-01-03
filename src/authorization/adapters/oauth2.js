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
    The OAuth2 adapter is the default type used when creating a new authorization module. It uses jQuery.ajax to communicate with the server.
    This constructor is instantiated when the "Authorizer.add()" method is called
    @status Experimental
    @constructs AeroGear.Authorization.adapters.OAuth2
    @param {String} name - the name used to reference this particular authz module
    @param {Object} settings={} - the settings to be passed to the adapter
    @param {String} settings.clientId - the client id/ app Id of the protected service
    @param {String} settings.redirectURL - the URL to redirect to
    @param {String} settings.authEndpoint - the endpoint for authorization
    @param {String} settings.scopes - a space separated list of "scopes" or things you want to access
    @returns {Object} The created authz module
    @example
    //Create an empty Authenticator
    var authz = AeroGear.Authorization();

    authz.add({
        name: "coolThing",
        settings: {
            clientId: "12345",
            redirectURL: "http://localhost:3000/redirector.html",
            authEndpoint: "http://localhost:3000/v1/authz",
            scopes: "userinfo coolstuff"
        }
    });
 */
AeroGear.Authorization.adapters.OAuth2 = function( name, settings ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.Authorization.adapters.OAuth2 ) ) {
        return new AeroGear.Authorization.adapters.OAuth2( name, settings );
    }

    settings = settings || {};

    // Private Instance vars
    var type = "OAuth2",
        state = uuid(), //Recommended in the spec,
        clientId = settings.clientId, //Required by the spec
        redirectURL = settings.redirectURL, //optional in the spec, but doesn't make sense without it
        scopes = settings.scopes, //Optional by the spec
        accessToken,
        localStorageName = "ag-oauth2-" + clientId,
        authEndpoint = settings.authEndpoint + "?" +
            "response_type=token" +
            "&redirect_uri=" + encodeURIComponent( redirectURL ) +
            "&scope=" + encodeURIComponent( scopes ) +
            "&state=" + encodeURIComponent( state ) +
            "&client_id=" + encodeURIComponent( clientId );

    // Privileged Methods
    /**
        Returns the value of the private settings var
        @private
        @augments OAuth2
     */
    this.getAccessToken = function() {
        if( localStorage[ localStorageName ] ) {
            accessToken = JSON.parse( localStorage[ localStorageName ] ).accessToken;
        }

        return accessToken;
    };

    /**
        Returns the value of the private settings var
        @private
        @augments OAuth2
     */
    this.getState = function() {
        return state;
    };

    /**
        Returns the value of the private settings var
        @private
        @augments OAuth2
     */
    this.getLocalStorageName = function() {
        return localStorageName;
    };

    /**
        Returns the value of a custom error message
        @private
        @augments OAuth2
     */
    this.createError = function( options ) {
        options = options || {};
        return AeroGear.extend( options, { authURL: authEndpoint } );
    };

    /**
        Returns the value of a parsed query string
        @private
        @augments OAuth2
     */
    this.parseQueryString = function( locationString ) {
        //taken from https://developers.google.com/accounts/docs/OAuth2Login
        // First, parse the query string
        var params = {},
            queryString = locationString.substr( locationString.indexOf( "#" ) + 1 ),
            regex = /([^&=]+)=([^&]*)/g,
            m;
        while ( ( m = regex.exec(queryString) ) ) {
            params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        }
        return params;
    };
};

//Takes the querystring that is returned after the "dance" unparsed.
/**
    Enroll a new user in the authentication system
    @param {String} queryString - The returned query string to be parsed
    @param {Object} [options={}] - Options to pass to the enroll method
    @param {AeroGear~errorCallbackREST} [options.error] - callback to be executed if the AJAX request results in an error
    @param {AeroGear~successCallbackREST} [options.success] - callback to be executed if the AJAX request results in success
    @returns {Object} The jqXHR created by jQuery.ajax
    @example
    //Create the Authorizer
    var authz = AeroGear.Authorization(),
        pipe;

    authz.add({
        name: "coolThing",
        settings: {
            clientId: "12345",
            redirectURL: "http://localhost:3000/redirector.html",
            authEndpoint: "http://localhost:3000/v1/authz",
            scopes: "userinfo coolstuff"
        }
    });

    //Create a new Pipeline with an authorizer
    pipe = AeroGear.Pipeline( { authorizer: authz.services.coolThing } );

    //Add a pipe
    pipe.add([
    {
        name: "cal",
        settings: {
            baseURL: "http://localhost:3000/",
            endpoint: "v1/userinfo"
        }
    }
    ]);

    //Make the call. OAuth2.read() will be called by Pipe.Read
    pipe.pipes.cal.read({
        success:function( response ) {
            ....
        },
        error: function( error ) {
            //an error happened, so take the authURL and do the "OAuth2 Dance",
        }
    });

    //After a successful response from the "OAuth2 Dance", validate that the query string is valid, If all is well, the access_token will be stored.
    authz.services.coolThing.validate( responseFromAuthEndpoint, {
        success: function( response ){
            ...
        },
        error: function( error ) {
            ...
        }
    });

    //Make pipe.read calls
    pipe.pipes.cal.read({
        success:function( response ) {
            //Should be success calls
        },
        error: function( error ) {
            ....
        }
    });

 */
AeroGear.Authorization.adapters.OAuth2.prototype.validate = function( queryString, options ) {
    options = options || {};

    var that = this,
        parsedQuery = this.parseQueryString( queryString ),
        state = this.getState(),
        error,
        success;

    success = function( response ) {
        //Perhaps we can use crypt here to be more secure
        localStorage.setItem( that.getLocalStorageName(), JSON.stringify( { "accessToken": parsedQuery.access_token } ) );
        if( options.success ) {
            options.success.apply( this, arguments );
        }
    };

    error = function( response ) {
        if( options.error ) {
            options.error.call( this, that.createError( response ) );
        }
    };

    if( parsedQuery.error ) {
        error.call( this, parsedQuery  );
        return;
    }

    //Make sure that the "state" value returned is the same one we sent
    if( parsedQuery.state !== state ) {
        //No Good
        error.call( this, { error: "invalid_request", state: state, error_description: "state's do not match"  } );
        return;
    }

    // The Spec does not specify that you need to validate the token
    success.call( this, parsedQuery );
};

/**
    Read a secure endpoint - To be used with the Pipe.read() method
    @param {Object} options={} - Options to pass to the enroll method
    @param {String} options.url - the endpoint to access
    @param {AeroGear~errorCallbackREST} [options.error] - callback to be executed if the AJAX request results in an error
    @param {AeroGear~successCallbackREST} [options.success] - callback to be executed if the AJAX request results in success
    @returns {Object} The jqXHR created by jQuery.ajax - IF an error is returned,  the authentication URL will be appended to the response object
    @example
    //Create the Authorizer
    var authz = AeroGear.Authorization(),
    pipe;

    authz.add({
    name: "coolThing",
    settings: {
        clientId: "12345",
        redirectURL: "http://localhost:3000/redirector.html",
        authEndpoint: "http://localhost:3000/v1/authz",
        scopes: "userinfo coolstuff"
    }
    });

    //Create a new Pipeline with an authorizer
    pipe = AeroGear.Pipeline( { authorizer: authz.services.coolThing } );

    //Add a pipe
    pipe.add([
    {
        name: "cal",
        settings: {
            baseURL: "http://localhost:3000/",
            endpoint: "v1/userinfo"
        }
    }
    ]);

    //Make the call. OAuth2.read() will be called by Pipe.Read
    pipe.pipes.cal.read({
        success:function( response ) {
            ....
        },
        error: function( error ) {
            ....
        }
    });
 */
AeroGear.Authorization.adapters.OAuth2.prototype.execute = function( options ) {
    options = options || {};
    var that = this,
        url = options.url + "?access_token=" + this.getAccessToken(),
        contentType = "application/x-www-form-urlencoded",
        success,
        error;

    success = function( response ) {
        if( options.success ) {
            options.success.apply( this, arguments );
        }
    };
    error = function( response ) {
        if( options.error ) {
            options.error.call( this, that.createError( response ) );
        }
    };

    return jQuery.ajax({
        url: url,
        type: options.type,
        contentType: contentType,
        success: success,
        error: error
    });
};
