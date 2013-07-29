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
        DESCRIPTION
        @constructs AeroGear.UnifiedPushClient
        @param {String} variantID - the id representing the mobile application variant
        @param {String} variantSecret - the secret for the mobile application variant
        @param {String} [pushServerURL="http://" + window.location.hostname + ":8080/ag-push/rest/registry/device"] - location of the unified push server
        @returns {Object} The created unified push server client
     */
    AeroGear.UnifiedPushClient = function( variantID, variantSecret, pushServerURL ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.UnifiedPushClient ) ) {
            return new AeroGear.UnifiedPushClient( variantID, variantSecret, pushServerURL );
        }

        this.registerWithPushServer = function( messageType, endpoint, alias ) {
            var RegistrationError,
                url = pushServerURL || "http://" + window.location.hostname + ":8080/ag-push/rest/registry/device";

            if ( messageType !== "broadcast" && !alias ) {
                throw "UnifiedPushRegistrationException";
            }

            $.ajax({
                contentType: "application/json",
                dataType: "json",
                type: "POST",
				crossDomain: true,
                url: url,
                headers: {
                    "Authorization": "Basic " + window.btoa(variantID + ":" + variantSecret)
                },
                data: JSON.stringify({
                    category: messageType,
                    deviceToken: endpoint.channelID,
                    alias: alias
                })
            });
        };

        this.unregisterWithPushServer = function( endpoint ) {
            var url = pushServerURL || "http://" + window.location.hostname + ":8080/ag-push/rest/registry/device";
            $.ajax({
                contentType: "application/json",
                dataType: "json",
                type: "DELETE",
                crossDomain: true,
                url: url + "/" + endpoint.channelID,
                headers: {
                    "Authorization": "Basic " + window.btoa(variantID + ":" + variantSecret)
                },
                data: JSON.stringify({
                    deviceToken: endpoint.channelID
                })
            });
        };
    };

})( AeroGear, jQuery );
