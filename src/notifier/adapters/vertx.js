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
(function( AeroGear, VX, undefined ) {
    /**
        The vertx adapter is the default type used when creating a new notifier client. It uses the vert.x bus and underlying SockJS implementation for messaging.
        @constructs AeroGear.Notifier.adapters.vertx
        @param {String} clientName - the name used to reference this particular notifier client
        @param {Object} [settings={}] - the settings to be passed to the adapter
        @param {Boolean} [settings.autoConnect=false] - Automatically connect the client to the connectURL on creation. This option is ignored and a connection is automatically established if channels are provided as the connection is necessary prior to channel subscription
        @param {String} [settings.connectURL=""] - defines the URL for connecting to the messaging service
        @param {Function} [settings.onConnect] - callback to be executed when a connection is established if autoConnect === true
        @param {Function} [settings.onDisconnect] - callback to be executed when a connection is terminated if autoConnect === true
        @param {Function} [settings.onConnectError] - callback to be executed when connecting to a service is unsuccessful if autoConnect === true
        @param {Array} [settings.channels=[]] - a set of channel objects to which this client can subscribe. Each object should have a String address as well as a callback to be executed when a message is received on that channel.
        @returns {Object} The created notifier client
        @example
        // Create an empty Notifier
        var notifier = AeroGear.Notifier();

        // Create a channel object and the channel callback function
        var channelObject = {
            address: "org.aerogear.messaging.global",
            callback: channelCallback
        };

        function channelCallback( message ) {
            console.log( message );
        }

        // Add a vertx client with all the settings
        notifier.add({
            name: "client1",
            settings: {
                autoConnect: true,
                connectURL: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + "/eventbus",
                onConnect: function() {
                    console.log( "connected" );
                },
                onConnectError: function() {
                    console.log( "connection error" );
                },
                onDisconnect: function() {
                    console.log( "Disconnected" );
                },
                channels: [ channelObject ]
            }
        });
     */
    AeroGear.Notifier.adapters.vertx = function( clientName, settings ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.Notifier.adapters.vertx ) ) {
            return new AeroGear.Notifier.adapters.vertx( clientName, settings );
        }

        settings = settings || {};

        // Private Instance vars
        var type = "vertx",
            name = clientName,
            channels = settings.channels || [],
            autoConnect = !!settings.autoConnect || channels.length,
            connectURL = settings.connectURL || "",
            state = AeroGear.Notifier.CONNECTING,
            bus = null;

        // Privileged methods
        /**
            Returns the value of the private connectURL var
            @private
            @augments vertx
         */
        this.getConnectURL = function() {
            return connectURL;
        };

        /**
            Set the value of the private connectURL var
            @private
            @augments vertx
            @param {String} url - New connectURL for this client
         */
        this.setConnectURL = function( url ) {
            connectURL = url;
        };

        /**
            Returns the value of the private channels var
            @private
            @augments vertx
         */
        this.getChannels = function() {
            return channels;
        };

        /**
            Adds a channel to the set
            @param {Object} channel - The channel object to add to the set
            @private
            @augments vertx
         */
        this.addChannel = function( channel ) {
            channels.push( channel );
        };

        /**
            Check if subscribed to a channel
            @param {String} address - The address of the channel object to search for in the set
            @private
            @augments vertx
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
            @augments vertx
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
            @augments vertx
         */
        this.getState = function() {
            return state;
        };

        /**
            Sets the value of the private state var
            @private
            @augments vertx
         */
        this.setState = function( newState ) {
            state = newState;
        };

        /**
            Returns the value of the private bus var
            @private
            @augments vertx
         */
        this.getBus = function() {
            return bus;
        };

        /**
            Sets the value of the private bus var
            @private
            @augments vertx
         */
        this.setBus = function( newBus ) {
            bus = newBus;
        };

        // Handle auto-connect
        if ( autoConnect || channels.length ) {
            this.connect({
                url: connectURL,
                onConnect: settings.onConnect,
                onDisconnect: settings.onDisconnect,
                onConnectError: settings.onConnectError
            });
        }
    };

    //Public Methods
    /**
        Connect the client to the messaging service
        @param {Object} [options={}] - Options to pass to the connect method
        @param {String} [options.url] - The URL for the messaging service. This url will override and reset any connectURL specified when the client was created.
        @param {Function} [options.onConnect] - callback to be executed when a connection is established
        @param {Function} [options.onDisconnect] - callback to be executed when a connection is terminated
        @param {Function} [options.onConnectError] - callback to be executed when connecting to a service is unsuccessful
        @example
        // Create an empty Notifier
        var notifier = AeroGear.Notifier();

        // Add a vertx client
        notifier.add({
            name: "client1",
            settings: {
                connectURL: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + "/eventbus",
                onConnect: function() {
                    console.log( "connected" );
                },
                onConnectError: function() {
                    console.log( "connection error" );
                },
                onDisconnect: function() {
                    console.log( "Disconnected" );
                }
            }
        });

        // Connect to the vertx messaging service
        notifierVertx.clients.client1.connect();

     */
    AeroGear.Notifier.adapters.vertx.prototype.connect = function( options ) {
        options = options || {};
        var that = this,
            bus = new VX.EventBus( options.url || this.getConnectURL() );

        bus.onopen = function() {
            // Make a Copy of the channel array instead of a reference.
            var channels = that.getChannels().slice( 0 );

            that.setState( AeroGear.Notifier.CONNECTED );

            that.subscribe( channels, true );

            if ( options.onConnect ) {
                options.onConnect.apply( this, arguments );
            }
        };

        bus.onclose = function() {
            if ( that.getState() === AeroGear.Notifier.DISCONNECTING ) {
                // Fire disconnect as usual
                that.setState( AeroGear.Notifier.DISCONNECTED );
                if ( options.onDisconnect ) {
                    options.onDisconnect.apply( this, arguments );
                }
            } else {
                // Error connecting so fire error callback
                if ( options.onConnectError ) {
                    options.onConnectError.apply( this, arguments );
                }
            }
        };

        this.setBus( bus );
    };

    /**
        Disconnect the client from the messaging service
        @example
        // Create an empty Notifier
        var notifier = AeroGear.Notifier();

        // Add a vertx client
        notifier.add({
            name: "client1",
            settings: {
                connectURL: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + "/eventbus",
                onConnect: function() {
                    console.log( "connected" );
                },
                onConnectError: function() {
                    console.log( "connection error" );
                },
                onDisconnect: function() {
                    console.log( "Disconnected" );
                }
            }
        });

        // Connect to the vertx messaging service
        notifierVertx.clients.client1.connect();

        // Disconnect from the vertx messaging service
        notifierVertx.clients.client1.disconnect();

     */
    AeroGear.Notifier.adapters.vertx.prototype.disconnect = function() {
        var bus = this.getBus();
        if ( this.getState() === AeroGear.Notifier.CONNECTED ) {
            this.setState( AeroGear.Notifier.DISCONNECTING );
            bus.close();
        }
    };

    /**
        Subscribe this client to a new channel
        @param {Object|Array} channels - a channel object or array of channel objects to which this client can subscribe. Each object should have a String address as well as a callback to be executed when a message is received on that channel.
        @param {Boolean} [reset] - if true, remove all channels from the set and replace with the supplied channel(s)
        @example
        // Create an empty Notifier
        var notifier = AeroGear.Notifier();

        // Create a channel object and the channel callback function
        var channelObject = {
            address: "org.aerogear.messaging.global",
            callback: channelCallback
        };

        function channelCallback( message ) {
            console.log( message );
        }

        // Add a vertx client with autoConnect === true and no channels
        notifier.add({
            name: "client1",
            settings: {
                autoConnect: true,
                connectURL: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + "/eventbus",
                onConnect: function() {
                    console.log( "connected" );
                },
                onConnectError: function() {
                    console.log( "connection error" );
                },
                onDisconnect: function() {
                    console.log( "Disconnected" );
                }
            }
        });

        //Subscribe to a channel
        notifierVertx.clients.client1.subscribe( channelObject );

        //Subscribe to multiple channels at once
        notifierVertx.clients.client1.subscribe([
            {
                address: "newChannel",
                callback: function(){...}
            },
            {
                address: "anotherChannel",
                callback: function(){ ... }
            }
        ]);

        //Subscribe to a channel, but first unsubscribe by adding the reset parameter
        notifierVertx.clients.client1.subscribe({
                address: "newChannel",
                callback: function(){ ... }
            }, true );
     */
    AeroGear.Notifier.adapters.vertx.prototype.subscribe = function( channels, reset ) {
        var bus = this.getBus();

        if ( reset ) {
            this.unsubscribe( this.getChannels() );
        }

        channels = AeroGear.isArray( channels ) ? channels : [ channels ];
        for ( var i = 0; i < channels.length; i++ ) {
            this.addChannel( channels[ i ] );
            bus.registerHandler( channels[ i ].address, channels[ i ].callback );
        }
    };

    /**
        Unsubscribe this client from a channel
        @param {Object|Array} channels - a channel object or a set of channel objects to which this client nolonger wishes to subscribe
        @example
        // Unsubscribe from a previously subscribed channel
        notifierVertx.clients.client1.unsubscribe(
            {
                address: "org.aerogear.messaging.global",
                callback: channelCallback
            }
        );

        // Unsubscribe from multiple channels
        notifierVertx.clients.client1.unsubscribe([
            {
                address: "newChannel",
                callback: newCallbackFunction
            },
            {
                address: "anotherChannel",
                callback: "anotherChannelCallbackFunction"
            }
        ]);


     */
    AeroGear.Notifier.adapters.vertx.prototype.unsubscribe = function( channels ) {
        var bus = this.getBus();

        channels = AeroGear.isArray( channels ) ? channels : [ channels ];
        for ( var i = 0; i < channels.length; i++ ) {
            this.removeChannel( channels[ i ] );
            bus.unregisterHandler( channels[ i ].address, channels[ i ].callback );
        }
    };

})( AeroGear, vertx );
