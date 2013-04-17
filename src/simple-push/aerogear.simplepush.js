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
    var stompNotifier;
    // Use browser push implementation when available
    // TODO: Test for browser-prefixed implementations
    if ( navigator.push ) {
        return;
    }

    AeroGear.SimplePush = {};
    AeroGear.SimplePush.config = {
        pushAppID: "",
        appInstanceID: "",
        pushNetworkLogin: "guest",
        pushNetworkPassword: "guest",
        channelPrefix: "jms.topic.aerogear.",
        pushNetworkURL: "http://" + window.location.hostname + ":61614/agPushNetwork",
        pushServerURL: "http://" + window.location.hostname + ":8080/registry/device"
    };

    AeroGear.SimplePush.endpoints = {};

    AeroGear.SimplePush.registerWithChannel = function( name, endpoint ) {
        // This is redundant but hopefully helpful in future proofing
        endpoint.name = name;

        AeroGear.SimplePush.endpoints[ name ] = endpoint;
        // TODO: Inform push server?
    };

    navigator.push = (function() {
        function createChannels() {
            // Temporarily set sessionID to true to avoid multiple inits
            AeroGear.SimplePush.sessionID = true;

            // Create a Notifier connection to the Push Network
            stompNotifier = AeroGear.Notifier({
                name: "agPushNetwork",
                type: "stompws",
                settings: {
                    connectURL: AeroGear.SimplePush.config.pushNetworkURL
                }
            }).clients.agPushNetwork;

            stompNotifier.connect({
                login: AeroGear.SimplePush.config.pushNetworkLogin,
                password: AeroGear.SimplePush.config.pushNetworkPassword,
                onConnect: function( stompFrame ) {
                    AeroGear.SimplePush.sessionID = stompFrame.headers.session;

                    // Register with Unified Push server
                    $.ajax({
                        contentType: "application/json",
                        dataType: "json",
                        type: "POST",
                        url: AeroGear.SimplePush.config.pushServerURL,
                        headers: {
                            "ag-push-app": AeroGear.SimplePush.config.pushAppID,
                            "AG-Mobile-APP": AeroGear.SimplePush.config.appInstanceID
                        },
                        data: {
                            token: AeroGear.SimplePush.sessionID,
                            os: "web"
                        }
                    });

                    // Subscribe to personal and broadcast channels
                    stompNotifier.subscribe([
                        {
                            address: AeroGear.SimplePush.config.channelPrefix + AeroGear.SimplePush.sessionID,
                            callback: function( message ) {
                                message.pushEndpoint = message.headers ? AeroGear.SimplePush.endpoints[ message.headers.endpoint ] : undefined;

                                $( document ).trigger({
                                    type: "push",
                                    message: message
                                });
                            }
                        },
                        {
                            address: AeroGear.SimplePush.config.channelPrefix + "broadcast",
                            callback: function( message ) {
                                message.pushEndpoint = AeroGear.SimplePush.endpoints.broadcast;

                                $( document ).trigger({
                                    type: "push",
                                    message: message
                                });
                            }
                        }
                    ]);
                }
            });
        }

        return {
            register: function() {
                if ( !AeroGear.SimplePush.sessionID ) {
                    createChannels();
                }

                return {};
            },

            unregister: function( endpoint ) {
                delete AeroGear.SimplePush.endpoints[ endpoint.name ];
                // TODO: Inform push server?
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

        $( document ).on( messageType, handler );
    };
})( AeroGear, jQuery );
