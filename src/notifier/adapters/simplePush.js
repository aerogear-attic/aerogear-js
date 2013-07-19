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
        connectURL = settings.connectURL || "",
        client = null,
        pushStore = JSON.parse( localStorage.getItem("ag-push-store") || '{}' ),
        isConnected = false;

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
        Returns the value of the private isConnected var
        @private
        @augments AeroGear.Notifier.adapters.SimplePush
     */
    this.getIsConnected = function() {
        return isConnected;
    };

    /**
        Sets the value of the private isConnected var
        @private
        @augments AeroGear.Notifier.adapters.SimplePush
     */
    this.setIsConnected = function( value ) {
        isConnected = value;
    };

    /**
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

            jQuery( navigator.push ).trigger( jQuery.Event( message.channelID + "-success", {
                target: {
                    result: channel
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
            for ( var i = 0, updateLength = updates.length; i < updateLength; i++ ) {
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
     */
    this.generateHello = function() {
        var channels = pushStore.channels,
            msg = {
            messageType: "hello",
            uaid: ""
        };

        if ( pushStore.uaid ) {
            msg.uaid = pushStore.uaid;
        }
        if ( channels && msg.uaid !== "" ) {
            msg.channels = [];
            for ( var length = channels.length, i = length - 1; i > -1; i-- ) {
                if ( pushStore.channels[ i ].status !== "new" ) {
                    msg.channels.push( pushStore.channels[ i ].channelID );
                }
            }

            if ( !msg.channels.length ) {
                delete msg.channels;
            }
        }

        return JSON.stringify( msg );
    };

    // Utility Functions
    this.findChannelIndex = function( channels, filterField, filterValue ) {
        for ( var i = 0; i < channels.length; i++ ) {
            if ( channels[ i ][ filterField ] === filterValue ) {
                return i;
            }
        }
    };

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

    this.bindSubscribeSuccess = function( channelID, request ) {
        jQuery( navigator.push ).on( channelID + "-success", function( event ) {
            request.onsuccess( event );
        });
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
    var that = this,
        client = new SockJS( options.url || this.getConnectURL() );

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
            that.setIsConnected( true );
            if ( message.uaid === pushStore.uaid ) {
                for ( var channel in pushStore.channels ) {
                    if ( channel.status === "used" ) {
                        // Trigger the registration event since there will be no register message
                        jQuery( navigator.push ).trigger( jQuery.Event( pushStore.channels[ channel ].channelID + "-success", {
                            target: {
                                result: pushStore.channels[ channel ]
                            }
                        }));
                    }
                }
            } else {
                // Set uaid to new server provided id
                pushStore.uaid = message.uaid;
            }

            that.setPushStore( pushStore );

            if ( options.onConnect ) {
                options.onConnect( message );
            }
        } else {
            that.processMessage( message );
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
    this.setIsConnected( false );
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
    var index, response, channelID, channelLength,
        processed = false,
        client = this.getClient(),
        pushStore = this.getPushStore();

    if ( reset ) {
        this.unsubscribe( this.getChannels() );
    }

    channels = AeroGear.isArray( channels ) ? channels : [ channels ];
    pushStore.channels = pushStore.channels || [];
    channelLength = pushStore.channels.length;

    for ( var i = 0; i < channels.length; i++ ) {
        // check for previously registered channels
        if ( channelLength ) {
            index = this.findChannelIndex( pushStore.channels, "state", "available" );
            if ( index !== undefined ) {
                this.bindSubscribeSuccess( pushStore.channels[ index ].channelID, channels[ i ].requestObject );
                channels[ i ].channelID = pushStore.channels[ index ].channelID;
                if ( client.readyState === SockJS.OPEN && this.getIsConnected() ) {
                    channels[ i ].state = "used";
                    // Trigger the registration event since there will be no register message
                    jQuery( navigator.push ).trigger( jQuery.Event( channels[ i ].channelID + "-success", {
                        target: {
                            result: channels[ i ]
                        }
                    }));
                } else {
                    channels[ i ].state = "new";
                }
                pushStore.channels[ index ] = channels[ i ];
                processed = true;
            }
        }

        if ( !processed ) {
            // No previous channels available so add a new one
            this.bindSubscribeSuccess( channels[ i ].channelID, channels[ i ].requestObject );

            if ( client.readyState === SockJS.OPEN && this.getIsConnected() ) {
                channels[ i ].state = "used";
                client.send('{"messageType": "register", "channelID": "' + channels[ i ].channelID + '"}');
            } else {
                channels[ i ].channelID = uuid();
                channels[ i ].state = "new";
            }

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

 */
AeroGear.Notifier.adapters.SimplePush.prototype.unsubscribe = function( channels ) {
    var client = this.getClient();

    channels = AeroGear.isArray( channels ) ? channels : [ channels ];
    for ( var i = 0; i < channels.length; i++ ) {
        client.send( '{"messageType": "unregister", "channelID": "' + channels[ i ].channelID + '"}');
    }
};
