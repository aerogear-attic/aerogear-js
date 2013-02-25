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
        @param {Boolean} [settings.autoConnect=true] - Automatically connect the client to the connectURL on creation. This option is ignored and a connection is automatically established of channels are provided as the connection is necessary prior to channel subscription
        @param {String} [settings.connectURL=""] - defines the URL for connecting to the messaging service
        @param {Function} [settings.onConnect] - callback to be executed when a connection is established
        @param {Function} [settings.onDisconnect] - callback to be executed when a connection is terminated
        @param {Function} [settings.onConnectError] - callback to be executed when connecting to a service is unsuccessful
        @param {Array} [settings.channels=[]] - a set of channel objects to which this client can subscribe. Each object should have a String address as well as a callback to be executed when a message is received on that channel.
        @returns {Object} The created notifier client
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
            autoConnect = settings.autoConnect || true,
            connectURL = settings.connectURL || "",
            channels = settings.channels || [],
            state = AeroGear.Notifier.CONNECTING,
            bus = null;

        // Privileged methods
        /**
            Returns the value of the private settings var
            @private
            @augments vertx
         */
        this.getSettings = function() {
            return settings;
        };

        /**
            Returns the value of the private name var
            @private
            @augments vertx
         */
        this.getName = function() {
            return name;
        };

        /**
            Returns the value of the private autoConnect var
            @private
            @augments vertx
         */
        this.getAutoConnect = function() {
            return autoConnect;
        };

        /**
            Returns the onConnect callback
            @private
            @augments vertx
         */
        this.getOnConnect = function() {
            return settings.onConnect;
        };

        /**
            Returns the onDisconnect callback
            @private
            @augments vertx
         */
        this.getOnDisconnect = function() {
            return settings.onDisconnect;
        };

        /**
            Returns the onConnectError callback
            @private
            @augments vertx
         */
        this.getOnConnectError = function() {
            return settings.onConnectError;
        };

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
        if ( this.getAutoConnect() || this.getChannels().length ) {
            this.connect({
                url: this.getConnectURL(),
                onConnect: this.getOnConnect(),
                onDisconnect: this.getOnDisconnect(),
                onError: this.getOnConnectError()
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

     */
    AeroGear.Notifier.adapters.vertx.prototype.connect = function( options ) {
        options = options || {};
        var that = this,
            bus = new VX.EventBus( options.url || this.getConnectURL() );

        bus.onopen = function() {
            var channels = that.getChannels();

            that.setState( AeroGear.Notifier.CONNECTED );

            for ( var i = 0; i < channels.length; i++ ) {
                // Subscribe to channels
                //that.subscribe( channels[ i ] );
                this.registerHandler( channels[ i ].address, channels[ i ].callback );
            }

            if ( options.onConnect ) {
                options.onConnect.apply( this, arguments );
            }
        };

        bus.onclose = function() {
            if ( this.getState() === AeroGear.Notifier.CONNECTED ) {
                // Fire disconnect as usual
                this.setState( AeroGear.Notifier.CLOSED );
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
    };

})( AeroGear, vertx );
