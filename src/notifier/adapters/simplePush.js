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
/**
    This adapter allows communication with the AeroGear implementation of the SimplePush server protocol. Most of this functionality will be hidden behind the SimplePush client polyfill but is accessible if necessary.
    @status Experimental
    @constructs AeroGear.Notifier.adapters.SimplePush
    @param {String} clientName - the name used to reference this particular notifier client
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {String} [settings.connectURL=""] - defines the URL for connecting to the messaging service
    @param {Boolean} [settings.useNative=false] - Create a WebSocket connection to the Mozilla SimplePush server instead of a SockJS connection to a custom server
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
        connectURL = settings.connectURL || "",
        useNative = settings.useNative || false,
        client = null,
        pushStore = JSON.parse( localStorage.getItem("ag-push-store") || '{}' );

    pushStore.channels = pushStore.channels || [];
    for ( var channel in pushStore.channels ) {
        pushStore.channels[ channel ].state = "available";
    }
    localStorage.setItem( "ag-push-store", JSON.stringify( pushStore ) );

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
        Returns the value of the private useNative var
        @private
        @augments AeroGear.Notifier.adapters.SimplePush
     */
    this.getUseNative = function() {
        return useNative;
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
        Returns the value of the private pushStore var
        @private
        @augments AeroGear.Notifier.adapters.SimplePush
     */
    this.getPushStore = function() {
        return pushStore;
    };

    /**
        Sets the value of the private pushStore var as well as the local store
        @private
        @augments AeroGear.Notifier.adapters.SimplePush
     */
    this.setPushStore = function( newStore ) {
        pushStore = newStore;
        localStorage.setItem( "ag-push-store", JSON.stringify( newStore ) );
    };

    /**
        Processes all incoming messages from the SimplePush server
        @private
        @augments AeroGear.Notifier.adapters.SimplePush
     */
    this.processMessage = function( message ) {
        var channel, updates;
        if ( message.messageType === "register" && message.status === 200 ) {
            channel = {
                channelID: message.channelID,
                version: message.version,
                state: "used"
            };
            pushStore.channels = this.updateChannel( pushStore.channels, channel );
            this.setPushStore( pushStore );

            // Send the push endpoint to the client for app registration
            channel.pushEndpoint = message.pushEndpoint;

            // Trigger registration success callback
            jQuery( navigator.push ).trigger( jQuery.Event( message.channelID + "-success", {
                target: {
                    result: channel.pushEndpoint
                }
            }));
        } else if ( message.messageType === "register" ) {
            throw "SimplePushRegistrationError";
        } else if ( message.messageType === "unregister" && message.status === 200 ) {
            pushStore.channels.splice( this.findChannelIndex( pushStore.channels, "channelID", message.channelID ), 1 );
            this.setPushStore( pushStore );
        } else if ( message.messageType === "unregister" ) {
            throw "SimplePushUnregistrationError";
        } else if ( message.messageType === "notification" ) {
            updates = message.updates;

            // Notifications could come in a batch so process all
            for ( var i = 0, updateLength = updates.length; i < updateLength; i++ ) {

                // Trigger the push event which apps will create their listeners to respond to when receiving messages
                jQuery( navigator.push ).trigger( jQuery.Event( "push", {
                    message: updates[ i ]
                }));
            }

            // Acknowledge all updates sent in this notification message
            message.messageType = "ack";
            client.send( JSON.stringify( message ) );
        }
    };

    /**
        Generate the hello message send during the initial handshake with the SimplePush server. Sends any pre-existing channels for reregistration as well
        @private
        @augments AeroGear.Notifier.adapters.SimplePush
     */
    this.generateHello = function() {
        var channels = pushStore.channels,
            msg = {
            messageType: "hello",
            uaid: "",
            channelIDs: []
        };

        if ( pushStore.uaid ) {
            msg.uaid = pushStore.uaid;
        }
        if ( channels && msg.uaid !== "" ) {
            for ( var length = channels.length, i = length - 1; i > -1; i-- ) {
                msg.channelIDs.push( pushStore.channels[ i ].channelID );
            }
        }

        return JSON.stringify( msg );
    };

    // Utility Functions
    /**
        Find the array index of a particular channel based on a particular field value
        @private
        @augments AeroGear.Notifier.adapters.SimplePush
     */
    this.findChannelIndex = function( channels, filterField, filterValue ) {
        for ( var i = 0; i < channels.length; i++ ) {
            if ( channels[ i ][ filterField ] === filterValue ) {
                return i;
            }
        }
    };

    /**
        Update a channel with new information
        @private
        @augments AeroGear.Notifier.adapters.SimplePush
     */
    this.updateChannel = function( channels, channel ) {
        for( var i = 0; i < channels.length; i++ ) {
            if ( channels[ i ].channelID === channel.channelID ) {
                channels[ i ].version = channel.version;
                channels[ i ].state = channel.state;
                break;
            }
        }

        return channels;
    };

    /**
        Proxies the binding of subscription success handlers
        @private
        @augments AeroGear.Notifier.adapters.SimplePush
     */
    this.bindSubscribeSuccess = function( channelID, request ) {
        jQuery( navigator.push ).off( channelID + "-success" );
        jQuery( navigator.push ).on( channelID + "-success", function( event ) {
            request.onsuccess( event );
        });
    };
};

// Public Methods
/**
    Connect the client to the messaging service
    @param {Object} [options] - Options to pass to the connect method
    @param {String} [options.url] - The URL for the messaging service. This url will override and reset any connectURL specified when the client was created.
    @param {Array} [options.protocols_whitelist] -  A list protocols that may be used by SockJS. By default all available protocols will be used, which is equivalent to supplying: "['websocket', 'xdr-streaming', 'xhr-streaming', 'iframe-eventsource', 'iframe-htmlfile', 'xdr-polling', 'xhr-polling', 'iframe-xhr-polling', 'jsonp-polling']"
    @param {Function} [options.onConnect] - callback to be executed when a connection is established and hello message has been acknowledged
    @param {Function} [options.onConnectError] - callback to be executed when connecting to a service is unsuccessful
    @param {Function} [options.onClose] - callback to be executed when a connection to the server is closed
    @example
    var SPNotifier = AeroGear.Notifier({
        name: "sp",
        type: "SimplePush",
        settings: {
            connectURL: "http://localhost:7777/simplepush"
        }
    }).clients.sp;

    // Use all defaults
    SPNotifier.connect();

    // Custom options
    SPNotifier.connect({
        simplePushServerURL: "http://some.other.domain",
        onConnect: spConnect,
        onClose: spClose
    });
 */
AeroGear.Notifier.adapters.SimplePush.prototype.connect = function( options ) {
    options = options || {};

    var that = this,
        client = this.getUseNative() ? new WebSocket( options.url || this.getConnectURL() ) : new SockJS( options.url || this.getConnectURL(), undefined, options );

    client.onopen = function() {
        // Immediately send hello message
        client.send( that.generateHello() );
    };

    client.onerror = function( error ) {
        if ( options.onConnectError ) {
            options.onConnectError.apply( this, arguments );
        }
    };

    client.onmessage = function( message ) {
        var pushStore = that.getPushStore();
        message = JSON.parse( message.data );

        if ( message.messageType === "hello" ) {
            if ( message.uaid !== pushStore.uaid ) {
                pushStore.uaid = message.uaid;
                that.setPushStore( pushStore );
            }

            if ( options.onConnect ) {
                options.onConnect( message );
            }
        } else {
            that.processMessage( message );
        }
    };

    client.onclose = function() {
        if ( options.onClose ) {
            options.onClose.apply( this, arguments );
        }
    };

    this.setClient( client );
};

/**
    Disconnect the client from the messaging service
    @param {Function} [onDisconnect] - callback to be executed when a connection is terminated
    @example
    var SPNotifier = AeroGear.Notifier({
        name: "sp",
        type: "SimplePush",
        settings: {
            connectURL: "http://localhost:7777/simplepush"
        }
    }).clients.sp;

    // Default
    SPNotifier.disconnect();

    // Pass disconnect callback
    SPNotifier.disconnect(function() {
        console.log("Disconnected");
    });
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
    @param {Object|Array} channels - a channel object or array of channel objects to which this client can subscribe. At a minimum, each channel should contain a requestObject which will eventually contain the subscription success callback and a callback, which is fired when notifications are received. Reused channels may also contain channelID and other metadata.
    @param {Boolean} [reset] - if true, remove all channels from the set and replace with the supplied channel(s)
    @example
    var SPNotifier = AeroGear.Notifier({
        name: "sp",
        type: "SimplePush",
        settings: {
            connectURL: "http://localhost:7777/simplepush"
        }
    }).clients.sp;

    SPNotifier.subscribe({
        requestObject: {},
        callback: function( message ) {
            console.log("Notification Received");
        }
    });
 */
AeroGear.Notifier.adapters.SimplePush.prototype.subscribe = function( channels, reset ) {
    var index, response, channelID, channelLength,
        processed = false,
        client = this.getClient(),
        pushStore = this.getPushStore();

    if ( reset ) {
        this.unsubscribe( this.getChannels() );
    }

    channels = Array.isArray( channels ) ? channels : [ channels ];
    pushStore.channels = pushStore.channels || [];
    channelLength = pushStore.channels.length;

    for ( var i = 0; i < channels.length; i++ ) {
        // check for previously registered channels
        if ( channelLength ) {
            index = this.findChannelIndex( pushStore.channels, "state", "available" );
            if ( index !== undefined ) {
                this.bindSubscribeSuccess( pushStore.channels[ index ].channelID, channels[ i ].requestObject );
                channels[ i ].channelID = pushStore.channels[ index ].channelID;
                channels[ i ].state = "used";

                // Trigger the registration event since there will be no register message
                setTimeout((function(channel) {
                    return function() {
                        jQuery( navigator.push ).trigger( jQuery.Event( channel.channelID + "-success", {
                            target: {
                                result: channel.pushEndpoint
                            }
                        }));
                    };
                })(channels[ i ]), 0);

                pushStore.channels[ index ] = channels[ i ];
                processed = true;
            }
        }

        // No previous channels available so add a new one
        if ( !processed ) {
            channels[ i ].channelID = channels[ i ].channelID || uuid();
            channels[ i ].state = "used";
            this.bindSubscribeSuccess( channels[ i ].channelID, channels[ i ].requestObject );
            client.send('{"messageType": "register", "channelID": "' + channels[ i ].channelID + '"}');

            pushStore.channels.push( channels[ i ] );
        }

        processed = false;
    }

    this.setPushStore( pushStore );
};

/**
    Unsubscribe this client from a channel
    @param {Object|Array} channels - a channel object or a set of channel objects to which this client nolonger wishes to subscribe
    @example
    var SPNotifier = AeroGear.Notifier({
        name: "sp",
        type: "SimplePush",
        settings: {
            connectURL: "http://localhost:7777/simplepush"
        }
    }).clients.sp;

    SPNotifier.unsubscribe( channelObject );
 */
AeroGear.Notifier.adapters.SimplePush.prototype.unsubscribe = function( channels ) {
    var client = this.getClient();

    channels = Array.isArray( channels ) ? channels : [ channels ];
    for ( var i = 0; i < channels.length; i++ ) {
        client.send( '{"messageType": "unregister", "channelID": "' + channels[ i ].channelID + '"}');
    }
};
