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

AeroGear.ajax = function( settings ) {
    settings = settings || {};

    var request = new XMLHttpRequest(),
        that = this,
        _oncomplete,
        header;

    request.open( settings.type, settings.url, true, settings.username, settings.password );

    request.responseType = "json";
    request.setRequestHeader( "Content-Type", "application/json" );
    request.setRequestHeader( "Accept", "application/json" );

    if( settings.headers ) {
        for( header in settings.headers ) {
            request.setRequestHeader( header, settings.headers[ header ] );
        }
    }

    // Success and 400's
    request.onload = function() {
        that._oncomplete.call( this, request.response, (request.status < 400) ? "success" : "error", request );
    };

    // Network errors
    request.onerror = function() {
        that._oncomplete.call( this, request.response, "error", request );
    };

    this._oncomplete = function( response, status, request ) {

        if( settings[ status ] ) {
            settings[ status ].apply( this, arguments);
        }

        if( settings.complete ) {
            settings.complete.call( this, response, "complete", request );
        }
    };

    request.send( settings.data || {} );
};
