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
    var simpleNotifier, nativePush;
    // Use browser push implementation when available
    // TODO: Test for browser-prefixed implementations
    // TODO: Actually use the native version when present
    if ( navigator.push ) {
        nativePush = navigator.push;
    }

    // SimplePush Default Config
    AeroGear.SimplePush = window.AeroGearSimplePush;
    AeroGear.SimplePush.variantID = window.AeroGearSimplePush.variantID || "";
    AeroGear.SimplePush.simplePushServerURL = window.AeroGearSimplePush.simplePushServerURL || "http://" + window.location.hostname + ":7777/simplepush";
    AeroGear.SimplePush.unifiedPushServerURL = window.AeroGearSimplePush.unifiedPushServerURL || "http://" + window.location.hostname + ":8080/ag-push/rest/registry/device";

    // Add push to the navigator object
    navigator.push = (function() {
        return {
            register: nativePush ? nativePush.register : function() {
                var request = AeroGear.UnifiedPushClient( AeroGear.SimplePush.variantID, AeroGear.SimplePush.unifiedPushServerURL );

                if ( !simpleNotifier ) {
                    throw "SimplePushConnectionError";
                }

                simpleNotifier.subscribe({
                    requestObject: request,
                    callback: function( message ) {
                        $( navigator.push ).trigger({
                            type: "push",
                            message: message
                        });
                    }
                });

                return request;
            },

            unregister: nativePush ? nativePush.unregister : function( endpoint ) {
                simpleNotifier.unsubscribe( endpoint );
            }
        };
    })();

    navigator.setMessageHandler = function( messageType, callback ) {
        var handler;
        // TODO: Check for other browser implementations
        if ( navigator.mozSetMessageHandler ) {
            navigator.mozSetMessageHandler.apply( arguments );
            return;
        }

        handler = function( event ) {
            var message = event.message;
            callback.call( this, message );
        };

        $( navigator.push ).on( messageType, handler );
    };

    // Create a Notifier connection to the Push Network
    simpleNotifier = AeroGear.Notifier({
        name: "agPushNetwork",
        type: "SimplePush",
        settings: {
            connectURL: AeroGear.SimplePush.simplePushServerURL
        }
    }).clients.agPushNetwork;

    simpleNotifier.connect({
        onConnect: function( data ) {
            var pushStore = JSON.parse( localStorage.getItem("ag-push-store") || '{}' ),
                channels = pushStore.channels || [];

            // Subscribe to any new channels
            for ( var channel in channels ) {
                if ( channels[ channel ].state === "new" ) {
                    simpleNotifier.subscribe({
                        channelID: channels[ channel ].channelID,
                        callback: function( message ) {
                            $( navigator.push ).trigger({
                                type: "push",
                                message: message
                            });
                        }
                    });
                }
            }
        }
    });
})( AeroGear, jQuery );
