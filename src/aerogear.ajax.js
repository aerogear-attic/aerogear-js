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
    @param {AeroGear~successCallback} [options.success] - callback to be executed if the AJAX request results in success
    @param {AeroGear~errorCallback} [options.error] - callback to be executed if the AJAX request results in error
    @param {Object} [settings.params] - contains query parameters to be added in URL in case of GET request or in request body in case of POST and application/x-www-form-urlencoded content type
    @param {Object} [settings.data] - the data to be sent to the recipient
    @returns {Object} An ES6 Promise
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
            _oncomplete,
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
                callbackArgs = that._createCallbackArgs( request, status ),
                promiseValue = that._createPromiseValue.apply( this, callbackArgs );

            if( status === "success" ) {
                resolve( promiseValue );
            } else {
                reject( promiseValue );
            }

            that._oncomplete( request, status, callbackArgs );
        };

        // Network errors
        request.onerror = function() {
            var status = "error",
                callbackArgs = that._createCallbackArgs( request, status );

            reject( that._createPromiseValue.apply( this, callbackArgs ) );
            that._oncomplete( request, status, callbackArgs );
        };
        
        // create callback arguments
        this._createCallbackArgs = function( request, status ) {
            var statusText = request.statusText || status,
                dataOrError = request.responseText;

            if ( responseType === 'json' ) {
                try {
                    dataOrError = JSON.parse( dataOrError );
                } catch ( error ) {
                    dataOrError = request.responseText;
                }
            }
            return [ dataOrError, statusText, request ];
        };
        
        // create promise value
        this._createPromiseValue = function( dataOrError, statusText, request ) {
            return {
                data: dataOrError,
                statusText: statusText,
                agXHR: request
            };
        };

        this._oncomplete = function( request, status, callbackArgs ) {
            if( settings[ status ] ) {
                settings[ status ].apply( this, callbackArgs || that._createCallbackArgs( request, status ) );
            }

            if( settings.complete ) {
                settings.complete.call( this, "complete", request );
            }
        };

        request.send( data );
    });
};
