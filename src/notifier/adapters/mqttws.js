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

import Notifier from 'aerogear.notifier';

/**
    The mqttws adapter uses MQTT over WebSockets for messaging.
    @status Experimental
    @constructs AeroGear.Notifier.adapters.mqttws
    @param {String} clientName - The name used to reference this particular notifier client
    @param {Object} [settings={}] - The settings to be passed to the adapter
    @param {Boolean} [settings.autoConnect=false] - Automatically connect the client to the connectURL on creation. This option is ignored and a connection is automatically established if channels are provided as the connection is necessary prior to channel subscription
    @param {String} [settings.connectURL=""] - Defines the URL for connecting to the messaging service
    @param {Function} [settings.onConnect] - Callback to be executed when a connection is established if autoConnect === true
    @param {Function} [settings.onConnectError] - Callback to be executed when connecting to a service is unsuccessful if autoConnect === true
    @param {Function} [settings.onMessage] - Callback to be executed when a message is received
    @param {Array} [settings.channels=[]] - A set of channel objects to which this client can subscribe. Each object should have a String address
    @returns {Object} The created notifier client
    @example
    // Create an empty Notifier
    var notifier = AeroGear.Notifier();

    // Create a channel object and the channel callback function
    var channelObject = {
        address: "org.aerogear.messaging.global"
    };

    // Add an mqttws client with all the settings
    notifier.add({
        name: "client1",
        settings: {
            autoConnect: true,
            connectURL: window.location.protocol + '//' + window.location.host + "/eventbus",
            onConnect: function() {
                console.log( "connected" );
            },
            onConnectError: function() {
                console.log( "connection error" );
            },
            onMessage: function ( message ) {
                console.log( message.destinationName + " " + message.payloadString );
            },
            channels: [ channelObject ]
        }
    });
 */
Notifier.adapters.mqttws = function( clientName, settings ) {
    // Allow instantiation without using new
    if ( !( this instanceof Notifier.adapters.mqttws ) ) {
        return new Notifier.adapters.mqttws( clientName, settings );
    }

    settings = settings || {};

    Notifier.adapters.base.apply( this, arguments );

    // Private Instance vars
    var type = "mqttws",
        clientId = settings.clientId || "agClientId";

    // Privileged methods
    /**
        Returns the value of the private clientId var
        @private
        @augments mqttws
     */
    this.getClientId = function() {
        return clientId;
    };

    /**
        Set the value of the private clientId var
        @private
        @augments mqttws
        @param {String} id - New clientId for this client
     */
    this.setClientId = function( id ) {
        clientId = id;
    };

    /**
        Process the connect options
        @param {Object} connectOptions - The connect options to process
        @private
        @augments mqttws
     */
    this.processConnectOptions = function( connectOptions ) {
        if ( connectOptions.onConnect ) {
            connectOptions.onSuccess = connectOptions.onConnect;
            delete connectOptions.onConnect;
        }

        if ( connectOptions.onConnectError ) {
            connectOptions.onFailure = connectOptions.onConnectError;
            delete connectOptions.onConnectError;
        }

        if ( connectOptions.login ) {
            connectOptions.userName = connectOptions.login;
            delete connectOptions.login;
        }

        if ( connectOptions.url ) {
            delete connectOptions.url;
        }

        if ( connectOptions.clientId ) {
            delete connectOptions.clientId;
        }

        if ( connectOptions.onMessage ) {
            delete connectOptions.onMessage;
        }
        return connectOptions;
    };

    /**
        Process a URL
        @param {String} url - The url to process
        @private
        @augments mqttws
     */
    this.processURL = function ( url ) {
        var processedURL = {},
            urlParts =  url.split( '/' ),
            protocol = urlParts[ 0 ].split( ':' )[ 0 ],
            domainParts = urlParts[ 2 ].split( ':' ),
            // default path is /mqtt
            path = "/" + ( urlParts[ 3 ] || "mqtt" );

        processedURL.hostname = domainParts[ 0 ];
        processedURL.port = Number( domainParts[ 1 ] ) || ( protocol === 'wss' ? 443 : 80 );
        processedURL.path = path;

        return processedURL;
    };
};

//Public Methods
/**
    Connect the client to the messaging service
    @param {Object} [options={}] - Options to pass to the connect method
    @param {String} [options.url] - The URL for the messaging service. This url will override and reset any connectURL specified when the client was created
    @param {Number} [options.mqttVersion] - The MQTT protocol version. Should be 3 or 4.
    @param {Number} [options.timeout] - If the connect has not succeeded within this number of seconds, it is deemed to have failed
    @param {String} [options.login] - Authentication login name for this connection
    @param {String} [options.password] - Authentication password for this connection
    @param {Number} [options.keepAliveInterval] - The server disconnects this client if there is no activity for this number of seconds
    @param {Messaging.Message} [options.willMessage] - Sent by the server when the client disconnects abnormally
    @param {Boolean} [options.cleanSession] - If true(default) the client and server persistent state is deleted on successful connect
    @param {Boolean} [options.useSSL] - If present and true, use an SSL Websocket connection
    @param {Function} [options.onConnect] - Callback to be executed when a connection is established
    @param {Function} [options.onConnectError] - Callback to be executed when connecting to a service is unsuccessful
    @param {Function} [settings.onMessage] - Callback to be executed when a message is received
    @example
    // Create an empty Notifier
    var notifier = AeroGear.Notifier();

    // Add an mqtt client
    notifier.add({
        name: "client1",
        settings: {
            connectURL: window.location.protocol + '//' + window.location.host + "/eventbus",
            onConnect: function() {
                console.log( "connected" );
            },
            onConnectError: function() {
                console.log( "connection error" );
            },
            onMessage: function ( message ) {
                console.log( message.destinationName + " " + message.payloadString );
            }
        }
    });

    // Connect to the vertx messaging service
    notifier.clients.client1.connect();

 */
Notifier.adapters.mqttws.prototype.connect = function( options ) {
    options = options || {};
    var that = this,
        onConnectCallback = options.onConnect,
        onConnectErrorCallback = options.onConnectError,
        client, onConnect, onConnectError, processedURL;

    processedURL = this.processURL( options.url || this.getConnectURL() );

    client = new Paho.MQTT.Client( processedURL.hostname, processedURL.port, processedURL.path, options.clientId || this.getClientId() );

    if ( options.onMessage ) {
        client.onMessageArrived = options.onMessage;
    }

    options.onConnect = function() {
        // Make a Copy of the channel array instead of a reference.
        var channels = that.getChannels().slice( 0 );

        that.setState( Notifier.CONNECTED );

        that.subscribe( channels, true );

        if ( onConnectCallback ) {
            onConnectCallback.apply( this, arguments );
        }
    };

    options.onConnectError = function() {
        that.setState( Notifier.DISCONNECTED );
        if ( onConnectErrorCallback ) {
            onConnectErrorCallback.apply( this, arguments );
        }
    };

    client.connect( this.processConnectOptions( options ) );
    this.setClient( client );
};

/**
    Disconnect the client from the messaging service
    @example
    // Create an empty Notifier
    var notifier = AeroGear.Notifier();

    // Add an mqtt client
    notifier.add({
        name: "client1",
        settings: {
            connectURL: window.location.protocol + '//' + window.location.host + "/eventbus",
            onConnect: function() {
                console.log( "connected" );
            },
            onConnectError: function() {
                console.log( "connection error" );
            },
            onMessage: function( message ) {
                console.log( message.destinationName + " " + message.payloadString );
            }
        }
    });

    // Connect to the vertx messaging service
    notifier.clients.client1.connect();

    // Disconnect from the vertx messaging service
    notifier.clients.client1.disconnect();

 */
Notifier.adapters.mqttws.prototype.disconnect = function() {
    var client = this.getClient();
    if ( this.getState() === Notifier.CONNECTED ) {
        this.setState( Notifier.DISCONNECTING );
        client.disconnect();
    }
};

/**
    Subscribe this client to a new channel
    @param {Object|Array} channels - A channel object or array of channel objects to which this client can subscribe. Each object should have a String address as well as an optional subscribeOptions object which is used to control the subscription
    @param {Boolean} [reset] - If true, remove all channels from the set and replace with the supplied channel(s)
    @example
    // Create an empty Notifier
    var notifier = AeroGear.Notifier();

    // Create a channel object and the channel callback function
    var channelObject = {
        address: "org.aerogear.messaging.global",
        subscribeOptions: {
            qos: 2,
            onSuccess: function() {
                console.log( 'Subscription was successful' );
            },
            onFailure: function() {
                console.log( 'Subscription failed' );
            },
            timeout: 60
        }
    };

    // Add a mqtt client with autoConnect === true and no channels
    notifier.add({
        name: "client1",
        settings: {
            autoConnect: true,
            connectURL: window.location.protocol + '//' + window.location.host + "/eventbus",
            onConnect: function() {
                console.log( "connected" );
            },
            onConnectError: function() {
                console.log( "connection error" );
            },
            onMessage: function( message ) {
                console.log( message.destinationName + " " + message.payloadString );
            }
        }
    });

    // Subscribe to a channel
    notifier.clients.client1.subscribe( channelObject );

    // Subscribe to multiple channels at once
    notifier.clients.client1.subscribe([
        {
            address: "newChannel",
            subscribeOptions: {...}
        },
        {
            address: "anotherChannel",
            subscribeOptions: { ... }
        }
    ]);

    // Subscribe to a channel, but first unsubscribe from all currently subscribed channels by adding the reset parameter
    notifier.clients.client1.subscribe({
            address: "newChannel",
            subscribeOptions: { ... }
        }, true );
 */
Notifier.adapters.mqttws.prototype.subscribe = function( channels, reset ) {
    var client = this.getClient();

    if ( reset ) {
        this.unsubscribe( this.getChannels() );
    }

    channels = Array.isArray( channels ) ? channels : [ channels ];
    for ( var i = 0; i < channels.length; i++ ) {
        this.addChannel( channels[ i ] );
        client.subscribe( channels[ i ].address, channels[ i ].subscribeOptions || {} );
    }
};

/**
    Unsubscribe this client from a channel
    @param {Object|Array} channels - A channel object or a set of channel objects to which this client nolonger wishes to subscribe. Each object should have a String address and an optional unsubscribeOptions object
    @example
    // Unsubscribe from a previously subscribed channel
    notifier.clients.client1.unsubscribe(
        {
            address: "org.aerogear.messaging.global",
            unsubscribeOptions: {
                onSuccess: function() {
                    console.log( 'Unusubscribe was successful' );
                },
                onFailure: function() {
                    console.log( 'Unsubscribe failed' );
                },
                timeout: 20
            }
        }
    );

    // Unsubscribe from multiple channels
    notifier.clients.client1.unsubscribe([
        {
            address: "newChannel",
            unsubscribeOptions: { ... }
        },
        {
            address: "anotherChannel"
        }
    ]);
 */
Notifier.adapters.mqttws.prototype.unsubscribe = function( channels ) {
    var client = this.getClient();

    channels = Array.isArray( channels ) ? channels : [ channels ];
    for ( var i = 0; i < channels.length; i++ ) {
        client.unsubscribe( channels[ i ].address, channels[ i ].unsubscribeOptions || {} );
        this.removeChannel( channels[ i ] );
    }
};

/**
    Send a message to a particular channel
    @param {String} channel - The channel to which to send the message
    @param {String|Object} [message=""] - The message object to send
    @param {Object} [sendOptions] - The send options to send
    @example
    // Send an empty message to a channel
    notifier.clients.client1.send( "test.address" );

    // Send a "Hello" message to a channel
    notifier.clients.client1.send( "test.address", "Hello" );
 */
Notifier.adapters.mqttws.prototype.send = function( channel, message, sendOptions ) {
    var client = this.getClient();
    message = new Paho.MQTT.Message( message || "" );
    message.destinationName = channel;

    if ( sendOptions ) {
        if ( sendOptions.qos ) {
            message.qos = sendOptions.qos;
        }
        if ( sendOptions.retained ) {
            message.retained = sendOptions.retained;
        }
        if ( sendOptions.duplicate ) {
            message.duplicate = sendOptions.duplicate;
        }
    }

    client.send( message );
};
