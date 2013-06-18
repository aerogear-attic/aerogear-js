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
(function( AeroGear, stomp, undefined ) {
    /**
        The stomp adapter uses an underlying stomp.js implementation for messaging.
        @constructs AeroGear.Notifier.adapters.stompws
        @param {String} clientName - the name used to reference this particular notifier client
        @param {Object} [settings={}] - the settings to be passed to the adapter
        @param {String} [settings.connectURL=""] - defines the URL for connecting to the messaging service
        @returns {Object} The created notifier client
     */
    AeroGear.Notifier.adapters.stompws = function( clientName, settings ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.Notifier.adapters.stompws ) ) {
            return new AeroGear.Notifier.adapters.stompws( clientName, settings );
        }

        settings = settings || {};

        // Private Instance vars
        var type = "stompws",
            name = clientName,
            channels = settings.channels || [],
            connectURL = settings.connectURL || "",
            state = AeroGear.Notifier.CONNECTING,
            client = null;

        // Privileged methods
        /**
            Returns the value of the private connectURL var
            @private
            @augments AeroGear.Notifier.adapters.stompws
         */
        this.getConnectURL = function() {
            return connectURL;
        };

        /**
            Set the value of the private connectURL var
            @private
            @augments AeroGear.Notifier.adapters.stompws
            @param {String} url - New connectURL for this client
         */
        this.setConnectURL = function( url ) {
            connectURL = url;
        };

        /**
            Returns the value of the private channels var
            @private
            @augments AeroGear.Notifier.adapters.stompws
         */
        this.getChannels = function() {
            return channels;
        };

        /**
            Adds a channel to the set
            @param {Object} channel - The channel object to add to the set
            @private
            @augments AeroGear.Notifier.adapters.stompws
         */
        this.addChannel = function( channel ) {
            channels.push( channel );
        };


        /**
            Check if subscribed to a channel
            @param {String} address - The address of the channel object to search for in the set
            @private
            @augments AeroGear.Notifier.adapters.stompws
         */
        this.getChannelIndex = function( address ) {
            for ( var i = 0; i < channels.length; i++ ) {
                if ( channels[ i ].address === address ) {
                    return i;
                }
            }
            return -1;
        };

        /**
            Removes a channel from the set
            @param {Object} channel - The channel object to remove from the set
            @private
            @augments AeroGear.Notifier.adapters.stompws
         */
        this.removeChannel = function( channel ) {
            var index = this.getChannelIndex( channel.address );
            if ( index >= 0 ) {
                channels.splice( index, 1 );
            }
        };

        /**
            Returns the value of the private state var
            @private
            @augments AeroGear.Notifier.adapters.stompws
         */
        this.getState = function() {
            return state;
        };

        /**
            Sets the value of the private state var
            @private
            @augments AeroGear.Notifier.adapters.stompws
         */
        this.setState = function( newState ) {
            state = newState;
        };

        /**
            Returns the value of the private client var
            @private
            @augments AeroGear.Notifier.adapters.stompws
         */
        this.getClient = function() {
            return client;
        };

        /**
            Sets the value of the private client var
            @private
            @augments AeroGear.Notifier.adapters.stompws
         */
        this.setClient = function( newClient ) {
            client = newClient;
        };
    };

    //Public Methods
    /**
        Connect the client to the messaging service
        @param {Object} options - Options to pass to the connect method
        @param {String} options.login - login name used to connect to the server
        @param {String} options.password - password used to connect to the server
        @param {String} [options.url] - The URL for the messaging service. This url will override and reset any connectURL specified when the client was created.
        @param {Function} [options.onConnect] - callback to be executed when a connection is established
        @param {Function} [options.onConnectError] - callback to be executed when connecting to a service is unsuccessful
        @param {String} [options.host] - name of a virtual host on the stomp server that the client wishes to connect to
        @example

     */
    AeroGear.Notifier.adapters.stompws.prototype.connect = function( options ) {
        options = options || {};
        var that = this,
            client = new stomp.client( options.url || this.getConnectURL() ),
            onConnect = function() {
                var channels = that.getChannels().slice( 0 );

                that.setState( AeroGear.Notifier.CONNECTED );

                that.subscribe( channels, true );

                if ( options.onConnect ) {
                    options.onConnect.apply( this, arguments );
                }
            },
            onConnectError = function() {
                that.setState( AeroGear.Notifier.DISCONNECTED );
                if ( options.onConnectError ) {
                    options.onConnectError.apply( this, arguments );
                }
            };

        client.connect( options.login, options.password, onConnect, onConnectError, options.host );
        this.setClient( client );
    };

    /**
        Disconnect the client from the messaging service
        @param {Function} [onDisconnect] - callback to be executed when a connection is terminated
        @example

     */
    AeroGear.Notifier.adapters.stompws.prototype.disconnect = function( onDisconnect ) {
        var that = this,
            client = this.getClient(),
            disconnected = function() {
                if ( that.getState() === AeroGear.Notifier.DISCONNECTING ) {
                    // Fire disconnect as usual
                    that.setState( AeroGear.Notifier.DISCONNECTED );
                    if ( onDisconnect ) {
                        onDisconnect.apply( this, arguments );
                    }
                }
            };

        if ( this.getState() === AeroGear.Notifier.CONNECTED ) {
            this.setState( AeroGear.Notifier.DISCONNECTING );
            client.disconnect( disconnected );
        }
    };

    /**
        Subscribe this client to a new channel
        @param {Object|Array} channels - a channel object or array of channel objects to which this client can subscribe. Each object should have a String address as well as a callback to be executed when a message is received on that channel.
        @param {Boolean} [reset] - if true, remove all channels from the set and replace with the supplied channel(s)
        @example

     */
    AeroGear.Notifier.adapters.stompws.prototype.subscribe = function( channels, reset ) {
        var client = this.getClient();

        if ( reset ) {
            this.unsubscribe( this.getChannels() );
        }

        channels = AeroGear.isArray( channels ) ? channels : [ channels ];
        for ( var i = 0; i < channels.length; i++ ) {
            channels[ i ].id = client.subscribe( channels[ i ].address, channels[ i ].callback );
            this.addChannel( channels[ i ] );
        }
    };

    /**
        Unsubscribe this client from a channel
        @param {Object|Array} channels - a channel object or a set of channel objects to which this client nolonger wishes to subscribe
        @example

     */
    AeroGear.Notifier.adapters.stompws.prototype.unsubscribe = function( channels ) {
        var client = this.getClient();

        channels = AeroGear.isArray( channels ) ? channels : [ channels ];
        for ( var i = 0; i < channels.length; i++ ) {
            client.unsubscribe( channels[ i ].id );
            this.removeChannel( channels[ i ] );
        }
    };

    /**
        Send a message to a particular channel
        @param {String} channel - the channel to which to send the message
        @param {String|Object} [message=""] - the message object to send
        @example

     */
    AeroGear.Notifier.adapters.stompws.prototype.send = function( channel, message ) {
        var headers = {},
            client = this.getClient();

        message = message || "";
        if ( message.headers ) {
            headers = message.headers;
            message = message.body;
        }

        client.send( channel, headers, message );
    };

})( AeroGear, Stomp );
