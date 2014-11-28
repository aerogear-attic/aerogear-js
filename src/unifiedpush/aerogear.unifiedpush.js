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

import { AeroGear } from 'aerogear.core';
import ajax from 'aerogear.ajax';

/**
    The UnifiedPushClient object is used to perfom register and unregister operations against the AeroGear UnifiedPush server.
    @status Experimental
    @constructs AeroGear.UnifiedPushClient
    @param {String} variantID - the id representing the mobile application variant
    @param {String} variantSecret - the secret for the mobile application variant
    @param {String} pushServerURL - the location of the UnifiedPush server e.g. http(s)//host:port/context
    @returns {Object} The created unified push server client
    @example
    // Create the UnifiedPush client object:
    var client = AeroGear.UnifiedPushClient(
        "myVariantID",
        "myVariantSecret",
        "http://SERVER:PORT/CONTEXT"
    );

    // assemble the metadata for the registration:
    var metadata = {
        deviceToken: "http://server.com/simplePushEndpoint",
        alias: "some_username",
        categories: [ "email" ]
    };

    var settings = {};

    settings.metadata = metadata;

    // perform the registration against the UnifiedPush server:
    client.registerWithPushServer( settings );

 */
function UnifiedPushClient( variantID, variantSecret, pushServerURL ) {

    // we require all arguments to be present, otherwise it does not work
    if ( !variantID || !variantSecret || !pushServerURL ) {
        throw "UnifiedPushClientException";
    }

    // Allow instantiation without using new
    if ( !( this instanceof UnifiedPushClient ) ) {
        return new UnifiedPushClient( variantID, variantSecret, pushServerURL );
    }

    pushServerURL = pushServerURL.substr(-1) === '/' ? pushServerURL : pushServerURL + '/';
    /**
        Performs a register request against the UnifiedPush Server using the given metadata which represents a client that wants to register with the server.
        @param {Object} settings The settings to pass in
        @param {Object} settings.metadata - the metadata for the client
        @param {String} settings.metadata.deviceToken - identifies the client within its PushNetwork. On Android this is the registrationID, on iOS this is the deviceToken and on SimplePush this is the URL of the given SimplePush server/network.
        @param {String} [settings.metadata.alias] - Application specific alias to identify users with the system. Common use case would be an email address or a username.
        @param {Array} [settings.metadata.categories] - In SimplePush this is the name of the registration endpoint. On Hybrid platforms like Apache Cordova this is used for tagging the registered client.
        @param {String} [settings.metadata.operatingSystem] - Useful on Hybrid platforms like Apache Cordova to specifiy the underlying operating system.
        @param {String} [settings.metadata.osVersion] - Useful on Hybrid platforms like Apache Cordova to specify the version of the underlying operating system.
        @param {String} [settings.metadata.deviceType] - Useful on Hybrid platforms like Apache Cordova to specify the type of the used device, like iPad or Android-Phone.
        @returns {Object} An ES6 Promise created by AeroGear.ajax
     */
    this.registerWithPushServer = function( settings ) {
        settings = settings || {};
        var metadata = settings.metadata || {};

        // we need a deviceToken, registrationID or a channelID:
        if ( !metadata.deviceToken ) {
            throw "UnifiedPushRegistrationException";
        }

        // Make sure that settings.metadata.categories is an Array
        metadata.categories = Array.isArray( metadata.categories ) ? metadata.categories : ( metadata.categories ? [ metadata.categories ] : [] );

        return ajax({
            contentType: "application/json",
            dataType: "json",
            type: "POST",
            url: pushServerURL + "rest/registry/device",
            headers: {
                "Authorization": "Basic " + window.btoa(variantID + ":" + variantSecret)
            },
            data: JSON.stringify( metadata )
        });
    };

    /**
        Performs an unregister request against the UnifiedPush Server for the given deviceToken. The deviceToken identifies the client within its PushNetwork. On Android this is the registrationID, on iOS this is the deviceToken and on SimplePush this is the URL of the given SimplePush server/network.
        @param {String} deviceToken - unique String which identifies the client that is being unregistered.
        @returns {Object} An ES6 Promise created by AeroGear.ajax
     */
    this.unregisterWithPushServer = function( deviceToken ) {
        return ajax({
            contentType: "application/json",
            dataType: "json",
            type: "DELETE",
            url: pushServerURL + "rest/registry/device/" + deviceToken,
            headers: {
                "Authorization": "Basic " + window.btoa(variantID + ":" + variantSecret)
            }
        });
    };
}

AeroGear.UnifiedPushClient = UnifiedPushClient;

export default UnifiedPushClient;