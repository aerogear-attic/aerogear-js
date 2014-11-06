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

import { Authorization } from 'aerogear.authz';

/**
    The OAuth2 adapter is the default type used when creating a new authorization module. It uses AeroGear.ajax to communicate with the server.
    This constructor is instantiated when the "Authorizer.add()" method is called
    @status Experimental
    @constructs AeroGear.Authorization.adapters.OAuth2
    @param {String} name - the name used to reference this particular authz module
    @param {Object} settings={} - the settings to be passed to the adapter
    @param {String} settings.clientId - the client id/ app Id of the protected service
    @param {String} settings.redirectURL - the URL to redirect to
    @param {String} settings.authEndpoint - the endpoint for authorization
    @param {String} [settings.validationEndpoint] - the optional endpoint to validate your token.  Not in the Spec, but recommend for use with Google's API's
    @param {String} settings.scopes - a space separated list of "scopes" or things you want to access
    @returns {Object} The created authz module
    @example
    // Create an empty Authenticator
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
Authorization.adapters.OAuth2 = function( name, settings ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.Authorization.adapters.OAuth2 ) ) {
        return new AeroGear.Authorization.adapters.OAuth2( name, settings );
    }

    settings = settings || {};

    // Private Instance vars
    var state = uuid(), //Recommended in the spec,
        clientId = settings.clientId, //Required by the spec
        redirectURL = settings.redirectURL, //optional in the spec, but doesn't make sense without it,
        validationEndpoint = settings.validationEndpoint, //optional,  not in the spec, but recommend to use with Google's API's
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
    this.getClientId = function() {
        return clientId;
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
        Returns the value of the private settings var
        @private
        @augments OAuth2
     */
    this.getValidationEndpoint = function() {
        return validationEndpoint;
    };

    /**
        Enrich the error response with authentication endpoint URL and re-throw the error
        @private
        @augments OAuth2
     */
    this.enrichErrorAndRethrow = function( err ) {
        err = err || {};
        throw AeroGear.extend( err, { authURL: authEndpoint } );
    };

    /**
        Returns the value of a parsed query string
        @private
        @augments OAuth2
     */
    this.parseQueryString = function( locationString ) {
        // taken from https://developers.google.com/accounts/docs/OAuth2Login
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

/**
    Validate the Authorization endpoints - Takes the querystring that is returned after the "dance" unparsed.
    @param {String} queryString - The returned query string to be parsed
    @returns {Object} The ES6 promise (exposes AeroGear.ajax response as a response parameter; if an error is returned, the authentication URL will be appended to the response object)
    @example
    // Create the Authorizer
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

    // Make the call.
    authz.services.coolThing.execute({url: "http://localhost:3000/v1/authz/endpoint", type: "GET"})
        .then( function( response ){
            ...
        })
        .catch( function( error ) {
            // an error happened, so take the authURL and do the "OAuth2 Dance",
        });
    });

    // After a successful response from the "OAuth2 Dance", validate that the query string is valid, If all is well, the access_token will be stored.
    authz.services.coolThing.validate( responseFromAuthEndpoint )
        .then( function( response ){
            ...
        })
        .catch( function( error ) {
            ...
        });

 */
Authorization.adapters.OAuth2.prototype.validate = function( queryString ) {

    var that = this,
        parsedQuery = this.parseQueryString( queryString ),
        state = this.getState(),
        promise;

    promise = new Promise( function( resolve, reject ) {

        // Make sure that the "state" value returned is the same one we sent
        if( parsedQuery.state !== state ) {
            // No Good
            reject( { error: "invalid_request", state: state, error_description: "state's do not match"  } );
            return;
        }

        if( that.getValidationEndpoint() ) {
            AeroGear.ajax({ url: that.getValidationEndpoint() + "?access_token=" + parsedQuery.access_token })
                .then( function( response ) {
                    // Must Check the audience field that is returned.  This should be the same as the registered clientID
                    // This value is a JSON object that is in xhr.response
                    if( that.getClientId() !== response.agXHR.response.audience ) {
                        reject( { "error": "invalid_token" } );
                        return;
                    }
                    // Perhaps we can use crypt here to be more secure
                    localStorage.setItem( that.getLocalStorageName(), JSON.stringify( { "accessToken": parsedQuery.access_token } ) );
                    resolve( parsedQuery );
                })
                .catch( function( err ) {
                    reject( { "error": "invalid_token" } );
                });
        } else {
            // The Spec does not specify that you need to validate the token
            reject( parsedQuery );
        }
    });

    return promise
        .catch( this.enrichErrorAndRethrow );
};

/**
    @param {Object} options={} - Options to pass to the execute method
    @param {String} [options.type="GET"] - the type of the request
    @param {String} [options.url] - the url of the secured endpoint you want to access
    @returns {Object} The ES6 promise (exposes AeroGear.ajax response as a response parameter; if an error is returned, the authentication URL will be appended to the response object)
    @example
    // Create the Authorizer
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


    // Make the authorization call.
    authz.services.coolThing.execute()
        .then( function( response ){
            ...
        })
        .catch( function( error ) {
            ...
        });
 */
Authorization.adapters.OAuth2.prototype.execute = function( options ) {
    options = options || {};
    var url = options.url + "?access_token=" + this.getAccessToken(),
        contentType = "application/x-www-form-urlencoded";

    return AeroGear.ajax({
            url: url,
            type: options.type,
            contentType: contentType
        })
        .catch( this.enrichErrorAndRethrow );
};

export default Authorization.adapters.OAuth2;