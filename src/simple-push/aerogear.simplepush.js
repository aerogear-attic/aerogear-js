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
(function( AeroGear, $, uuid, undefined ) {
    var stompNotifier, nativePush;
    // Use browser push implementation when available
    // TODO: Test for browser-prefixed implementations
    if ( navigator.push ) {
        nativePush = navigator.push;
    }

    AeroGear.SimplePush = {};
    AeroGear.SimplePush.config = {
        pushAppID: "",
        appInstanceID: "",
        pushNetworkLogin: "guest",
        pushNetworkPassword: "guest",
        channelPrefix: "jms.topic.aerogear",
        pushNetworkURL: "http://" + window.location.hostname + ":61614/agPushNetwork",
        pushServerURL: "http://" + window.location.hostname + ":8080/registry/device"
    };

    navigator.push = (function() {
        return {
            register: nativePush ? nativePush.register : function() {
                var $request, requestEvent,
                    request = {};

                if ( !stompNotifier || !AeroGear.SimplePush.sessionID ) {
                    throw "SimplePushConnectionError";
                }

                request.address = AeroGear.SimplePush.config.channelPrefix + "." + AeroGear.SimplePush.sessionID + "." + uuid();

                stompNotifier.subscribe({
                    address: request.address,
                    callback: function( message ) {
                        $( navigator.push ).trigger({
                            type: "push",
                            message: message
                        });
                    }
                });

                // Provide method to inform push server
                request.registerWithPushServer = function( messageType, endpoint ) {
                    // TODO: Send info to push server which should cleanup / remove the setTimeout below
                };

                $request = $( request );
                $request.on( "success", function( event ) {
                    this.onsuccess( event );
                });

                setTimeout( function() {
                    requestEvent = jQuery.Event( "success", {
                        target: {
                            result: {
                                address: request.address
                            }
                        }
                    });
                    $request.trigger( requestEvent );
                }, 100 );

                return request;
            },

            unregister: nativePush ? nativePush.unregister : function( endpoint ) {
                stompNotifier.unsubscribe( endpoint );
                // TODO: Inform push server?
            },

            connect: function( pushConnectCallback ) {
                var that = this;

                if ( stompNotifier ) {
                    return;
                }

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
                        var endpointID;
                        // TODO: Replace this with a server and/or client generated UUIDv4 token
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

                        // Subscribe to broadcast channel
                        stompNotifier.subscribe({
                            address: AeroGear.SimplePush.config.channelPrefix + ".broadcast",
                            callback: function( message ) {
                                $( navigator.push ).trigger({
                                    type: "push",
                                    message: message
                                });
                            }
                        });

                        // Call push.connect callback
                        pushConnectCallback.call( that, arguments );
                    }
                });
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
})( AeroGear, jQuery, uuid );
