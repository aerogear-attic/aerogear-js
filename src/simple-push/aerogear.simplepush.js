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
    /* DOCS */
    AeroGear.SimplePushClient = function( options ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.SimplePushClient ) ) {
            return new AeroGear.SimplePushClient( options );
        }

        var spClient = this,
            connectOptions = {
                onConnect: function() {
                    if ( spClient.options.onConnect ) {
                        spClient.options.onConnect();
                    }
                },
                onClose: function() {
                    spClient.simpleNotifier.disconnect( spClient.options.onClose );
                }
            };

        spClient.options = options || {};

        // Add push to the navigator object
        navigator.push = (function() {
            return {
                register: function() {
                    var request = {
                        onsuccess: function( event ) {}
                    };

                    if ( !spClient.simpleNotifier ) {
                        throw "SimplePushConnectionError";
                    }

                    spClient.simpleNotifier.subscribe({
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

                unregister: function( endpoint ) {
                    spClient.simpleNotifier.unsubscribe( endpoint );
                },

                reconnect: function() {
                    spClient.simpleNotifier.connect( connectOptions );
                }
            };
        })();

        navigator.setMessageHandler = function( messageType, callback ) {
            $( navigator.push ).on( messageType, function( event ) {
                var message = event.message;
                callback.call( this, message );
            });
        };

        // Create a Notifier connection to the Push Network
        spClient.simpleNotifier = AeroGear.Notifier({
            name: "agPushNetwork",
            type: "SimplePush",
            settings: {
                connectURL: spClient.options.simplePushServerURL
            }
        }).clients.agPushNetwork;

        spClient.simpleNotifier.connect( connectOptions );
    };
})( AeroGear, jQuery );
