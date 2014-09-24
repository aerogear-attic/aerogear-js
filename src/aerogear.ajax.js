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
    The AeroGear.ajax is used to perform Ajax requests.
    @status Experimental
    @param {Object} [settings={}] - the settings to configure the request
    @param {String} [settings.url] - the url to send the request to
    @param {String} [settings.type="GET"] - the type of the request
    @param {String} [settings.dataType="json"] - the data type of the recipient's response
    @param {String} [settings.accept="application/json"] - the media types which are acceptable for the recipient's response
    @param {String} [settings.contentType="application/json"] - the media type of the entity-body sent to the recipient
    @param {Object} [settings.headers] - the HTTP request headers
    @param {Object} [settings.params] - contains query parameters to be added in URL in case of GET request or in request body in case of POST and application/x-www-form-urlencoded content type
    @param {Object} [settings.data] - the data to be sent to the recipient
    @returns {Object} An ES6 Promise - the object returned will look like:

    {
        data: dataOrError, - the data or an error
        statusText: statusText, - the status of the response
        agXHR: request - the xhr request object
    };

    @example

        var es6promise = AeroGear.ajax({
            type: "GET",
            params: {
                param1: "val1"
            },
            url: "http://SERVER:PORT/CONTEXT"
        });
*/
AeroGear.ajax = function( settings ) {
    return new Promise( function( resolve, reject ) {
        settings = settings || {};

        var request = new XMLHttpRequest(),
            that = this,
            requestType = ( settings.type || "GET" ).toUpperCase(),
            responseType = ( settings.dataType || "json" ).toLowerCase(),
            accept = ( settings.accept || "application/json" ).toLowerCase(),
            // TODO: compare contentType by checking if it starts with some value since it might contains the charset as well
            contentType = ( settings.contentType || "application/json" ).toLowerCase(),
            header,
            name,
            urlEncodedData = [],
            url = settings.url,
            data = settings.data;

        if ( settings.params ) {
            // encode params
            if( requestType === "GET" || ( requestType === "POST" && contentType === "application/x-www-form-urlencoded" ) ) {
                for( name in settings.params ) {
                    urlEncodedData.push( encodeURIComponent( name ) + "=" + encodeURIComponent( settings.params[ name ] || "" ) );
                }
            // add params in request body
            } else if ( contentType === "application/json" ) {
                data = data || {};
                data.params = data.params || {};
                AeroGear.extend( data.params,  settings.params );
            }
        }

        if ( contentType === "application/x-www-form-urlencoded" ) {
            if ( data ) {
                for( name in data ) {
                    urlEncodedData.push( encodeURIComponent( name ) + '=' + encodeURIComponent( data[ name ] ) );
                }
            }
            data = urlEncodedData.join( "&" );
        }

        // if is GET request & URL params exist then add them in URL
        if( requestType === "GET" && urlEncodedData.length > 0 ) {
            url += "?" + urlEncodedData.join( "&" );
        }

        request.open( requestType, url, true, settings.username, settings.password );

        request.responseType = responseType;
        request.setRequestHeader( "Content-Type", contentType );
        request.setRequestHeader( "Accept", accept );

        if( settings.headers ) {
            for ( header in settings.headers ) {
                request.setRequestHeader( header, settings.headers[ header ] );
            }
        }

        // Success and 400's
        request.onload = function() {
            var status = ( request.status < 400 ) ? "success" : "error",
                promiseValue = that._createPromiseValue( request, status );

            if( status === "success" ) {
                return resolve( promiseValue );
            }

            return reject( promiseValue );
        };

        // Network errors
        request.onerror = function() {
            var status = "error";

            reject( that._createPromiseValue( request, status ) );
        };

        // create promise arguments
        this._createPromiseValue = function( request, status ) {
            var statusText = request.statusText || status,
                dataOrError = ( responseType === 'text' || responseType === '') ? request.responseText : request.response;

            return {
                data: dataOrError,
                statusText: statusText,
                agXHR: request
            };
        };

        request.send( data );
    });
};
