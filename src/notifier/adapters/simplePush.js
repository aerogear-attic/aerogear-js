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
        @constructs AeroGear.Notifier.adapters.SimplePush
        @param {String} clientName - the name used to reference this particular notifier client
        @param {Object} [settings={}] - the settings to be passed to the adapter
        @param {String} [settings.connectURL=""] - defines the URL for connecting to the messaging service
        @returns {Object} The created notifier client
     */
    AeroGear.Notifier.adapters.SimplePush = function( clientName, settings ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.Notifier.adapters.SimplePush ) ) {
            return new AeroGear.Notifier.adapters.SimplePush( clientName, settings );
        }

        settings = settings || {};

        // Private Instance vars
        var type = "SimplePush",
            name = clientName,
            channels = settings.channels || [],
            connectURL = settings.connectURL || "",
            client = null,
            uaid = null;

        // Privileged methods
        /**
            Returns the value of the private settings var
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
         */
        this.getSettings = function() {
            return settings;
        };

        /**
            Returns the value of the private name var
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
         */
        this.getName = function() {
            return name;
        };

        /**
            Returns the value of the private connectURL var
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
         */
        this.getConnectURL = function() {
            return connectURL;
        };

        /**
            Set the value of the private connectURL var
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
            @param {String} url - New connectURL for this client
         */
        this.setConnectURL = function( url ) {
            connectURL = url;
        };

        /**
            Returns the value of the private channels var
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
         */
        this.getChannels = function() {
            return channels;
        };

        /**
            Adds a channel to the set
            @param {Object} channel - The channel object to add to the set
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
         */
        this.addChannel = function( channel ) {
            channels.push( channel );
        };


        /**
            Check if subscribed to a channel
            @param {String} address - The channelID of the channel object to search for in the set
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
         */
        this.getChannelIndex = function( channelID ) {
            for ( var i = 0; i < channels.length; i++ ) {
                if ( channels[ i ].channelID === channelID ) {
                    return i;
                }
            }
            return -1;
        };

        /**
            Removes a channel from the set
            @param {Object} channel - The channel object to remove from the set
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
         */
        this.removeChannel = function( channel ) {
            var index = this.getChannelIndex( channel.channelID );
            if ( index >= 0 ) {
                channels.splice( index, 1 );
            }
        };


        /**
            Returns the value of the private client var
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
         */
        this.getClient = function() {
            return client;
        };

        /**
            Sets the value of the private client var
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
         */
        this.setClient = function( newClient ) {
            client = newClient;
        };

        /**
            Returns the value of the private uaid var
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
         */
        this.getUAID = function() {
            return uaid;
        };

        /**
            Sets the value of the private uaid var
            @private
            @augments AeroGear.Notifier.adapters.SimplePush
         */
        this.setUAID = function( newUAID ) {
            uaid = newUAID;
        };

        /**
         */
        this.processMessage = function( message ) {
            var channel, updates, updateLength, i;
            if ( message.messageType === "register" && message.status === 200 ) {
                channel = channels[ this.getChannelIndex( message.channelID ) ];
                channel.pushEndpoint = message.pushEndpoint;
                this.addChannel( channel );
                $( navigator.push ).trigger( $.Event( message.channelID + "-success", {
                    target: {
                        result: channel
                    }
                }));
            } else if ( message.messageType === "register" ) {
                // TODO: handle registration errors
            } else if ( message.messageType === "unregister" && message.status === 200 ) {
                this.removeChannel( channels[ this.getChannelIndex( message.channelID ) ] );
            } else if ( message.messageType === "unregister" ) {
                // TODO: handle unregistration errors
            } else if ( message.messageType === "notification" ) {
                updates = message.updates;
                for ( i = 0, updateLength = updates.length; i < updateLength; i++ ) {
                    $( navigator.push ).trigger( $.Event( "push", {
                        message: updates[ i ]
                    }));
                }
            }
        };
    };

    //Public Methods
    /**
        Connect the client to the messaging service
        @param {Object} options - Options to pass to the connect method
        @param {String} [options.url] - The URL for the messaging service. This url will override and reset any connectURL specified when the client was created.
        @param {Function} [options.onConnect] - callback to be executed when a connection is established and hello message has been acknowledged
        @param {Function} [options.onConnectError] - callback to be executed when connecting to a service is unsuccessful
        @example

     */
    AeroGear.Notifier.adapters.SimplePush.prototype.connect = function( options ) {
        // All WS stuff will be replaced by SockJS eventually
        if ( !window.WebSocket ) {
            window.WebSocket = window.MozWebSocket;
        }

        var that = this,
            client = new WebSocket( options.url || this.getConnectURL() );

        client.onopen = function() {
            // Immediately send hello message
            client.send('{"messageType": "hello"}');
        };

        client.onerror = function( error ) {
            if ( options.onConnectError ) {
                options.onConnectError.apply( this, arguments );
            }
        };

        client.onmessage = function( message ) {
            var data = JSON.parse( message.data );

            if ( data.messageType === "hello" ) {
                that.setUAID( data.uaid );

                if ( options.onConnect ) {
                    options.onConnect( data );
                }
            } else {
                that.processMessage( data );
            }
        };

        this.setClient( client );
    };

    /**
        Disconnect the client from the messaging service
        @param {Function} [onDisconnect] - callback to be executed when a connection is terminated
        @example

     */
    AeroGear.Notifier.adapters.SimplePush.prototype.disconnect = function( onDisconnect ) {
        var client = this.getClient();

        client.close();
        if ( onDisconnect ) {
            onDisconnect();
        }
    };

    /**
        Subscribe this client to a new channel
        @param {Object|Array} channels - a channel object or array of channel objects to which this client can subscribe. Each object should have a String address as well as a callback to be executed when a message is received on that channel.
        @param {Boolean} [reset] - if true, remove all channels from the set and replace with the supplied channel(s)
        @example

     */
    AeroGear.Notifier.adapters.SimplePush.prototype.subscribe = function( channels, reset ) {
        var client = this.getClient();

        if ( reset ) {
            this.unsubscribe( this.getChannels() );
        }

        channels = AeroGear.isArray( channels ) ? channels : [ channels ];
        for ( var i = 0; i < channels.length; i++ ) {
            if ( client.readyState === WebSocket.OPEN ) {
                client.send( '{"messageType": "register", "channelID": "' + channels[ i ].channelID + '"}');
            } else {
                // add to channel list for later registration
                this.addChannel( channels[ i ] );
            }
        }
    };

    /**
        Unsubscribe this client from a channel
        @param {Object|Array} channels - a channel object or a set of channel objects to which this client nolonger wishes to subscribe
        @example

     */
    AeroGear.Notifier.adapters.SimplePush.prototype.unsubscribe = function( channels ) {
        var client = this.getClient();

        channels = AeroGear.isArray( channels ) ? channels : [ channels ];
        for ( var i = 0; i < channels.length; i++ ) {
            client.send( '{"messageType": "unregister", "channelID": "' + channels[ i ].channelID + '"}');
        }
    };

})( AeroGear, jQuery );
