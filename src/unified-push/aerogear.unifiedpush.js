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
(function( AeroGear, $, undefined ) {
    /**
        The UnifiedPushClient object is used to perfom register and unregister operations against the AeroGear UnifiedPush server.
        @constructs AeroGear.UnifiedPushClient
        @param {String} variantID - the id representing the mobile application variant
        @param {String} variantSecret - the secret for the mobile application variant
        @param {String} pushServerBaseURL - the location of the UnifiedPush server
        @returns {Object} The created unified push server client
        @example
        //Create the UnifiedPush client object:
        var client = AeroGear.UnifiedPushClient(
            "myVariantID",
            "myVariantSecret",
            "http://SERVER:PORT/CONTEXT"
        );

        // assemble the metadata for the registration:
        var metadata = new Object();
        metadata.deviceToken = theDeviceToken;
        metadata.alias = "some_username";
        metadata.category = "email";

        // perform the registration against the UnifiedPush server:
        client.registerWithPushServer(metadata);

     */
    AeroGear.UnifiedPushClient = function( variantID, variantSecret, pushServerBaseURL ) {
        // we require the baseURL to be present
        if (! pushServerBaseURL) {
            throw "UnifiedPushClientException";
        }
        var pushServerURL = pushServerBaseURL + "/rest/registry/device";

        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.UnifiedPushClient ) ) {
            return new AeroGear.UnifiedPushClient( variantID, variantSecret, pushServerBaseURL );
        }

        /**
            Performs a register request against the UnifiedPush Server using the given metadata which represents a client that wants to register with the server.
            @param {Object} installationMetadata - the metadata for the client
            @param {String} installationMetadata.deviceToken - identifies the client within its PushNetwork. On Android this is the registrationID, on iOS this is the deviceToken and on SimplePush this is the channelID of the subscribed channel.
            @param {String} [installationMetadata.alias] - Application specific alias to identify users with the system. Common use case would be an email address or a username.
            @param {String} [installationMetadata.category] - In SimplePush this is the name of the registration endpoint. On Hybrid platforms like Apache Cordova this is used for tagging the registered client.
            @param {String} [installationMetadata.operatingSystem] - Useful on Hybrid platforms like Apache Cordova to specifiy the underlying operating system.
            @param {String} [installationMetadata.osVersion] - Useful on Hybrid platforms like Apache Cordova to specify the version of the underlying operating system.
            @param {String} [installationMetadata.deviceType] - Useful on Hybrid platforms like Apache Cordova to specify the type of the used device, like iPad or Android-Phone.
         */
        this.registerWithPushServer = function( installationMetadata ) {

            // we need a deviceToken, registrationID or a channelID:
            if (! installationMetadata.deviceToken) {
                throw "UnifiedPushRegistrationException";
            }

            // if we see a category that is not the (SimplePush) broadcast, we require the alias to be present:
            if (installationMetadata.category && installationMetadata.category !== "broadcast" && !installationMetadata.alias ) {
                throw "UnifiedPushRegistrationException";
            }

            $.ajax({
                contentType: "application/json",
                dataType: "json",
                type: "POST",
                crossDomain: true,
                url: pushServerURL,
                headers: {
                    "Authorization": "Basic " + window.btoa(variantID + ":" + variantSecret)
                },
                data: JSON.stringify({
                    category: installationMetadata.category,
                    deviceToken: installationMetadata.deviceToken,
                    alias: installationMetadata.alias,
                    mobileOperatingSystem: installationMetadata.operatingSystem,
                    osVersion: installationMetadata.osVersion,
                    deviceType: installationMetadata.deviceType
                })
            });
        };

        /**
            Performs an unregister request against the UnifiedPush Server for the given deviceToken. The deviceToken identifies the client within its PushNetwork. On Android this is the registrationID, on iOS this is the deviceToken and on SimplePush this is the channelID of the subscribed channel.
            @param {String} deviceToken - unique String which identifies the client that is being unregistered.
         */
        this.unregisterWithPushServer = function( deviceToken ) {
            var url = pushServerBaseURL || "http://" + window.location.hostname + ":8080/ag-push/rest/registry/device";
            $.ajax({
                contentType: "application/json",
                dataType: "json",
                type: "DELETE",
                crossDomain: true,
                url: pushServerURL + "/" + deviceToken,
                headers: {
                    "Authorization": "Basic " + window.btoa(variantID + ":" + variantSecret)
                },
                data: JSON.stringify({
                    deviceToken: deviceToken
                })
            });
        };
    };

})( AeroGear, jQuery );
