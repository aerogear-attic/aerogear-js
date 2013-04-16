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
(function( AeroGear, undefined ) {
    /**
        DESCRIPTION
        @constructs AeroGear.SimplePush.adapters.SimplePush
        @param {String} connectionName - the name used to reference this SimplePush connection
        @param {Object} settings={} - the settings to be passed to the adapter
        @param {String} settings.pushNetworkLogin - push network username
        @param {String} settings.pushNetworkPassword - push network password
        @param {String} [settings.channelPrefix="jms.topic.aerogear."] - the prefix to add to the session ID to form a personal push notification channel
        @param {String} [settings.pushNetworkURL="<origin>/agPushNetwork"] - defines the base URL for connecting to the push messaging service
        @param {String} [settings.pushServerURL="<origin>/agUnifiedPush"] - defines the URL for connecting to the AeroGear Unified Push server
        @param {String} [settings.endpoints=[]] - the set of endpoints to filter push notifications by
        @param {Function} [settings.onNetworkConnect] - a callback to execute when the Notifier is connected
        @returns {Object} The created SimplePush connection
     */
    AeroGear.SimplePush.adapters.SimplePush = function( connectionName, settings ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.SimplePush.adapters.SimplePush ) ) {
            return new AeroGear.SimplePush.adapters.SimplePush( connectionName, settings );
        }

        settings = settings || {};

        // Private Instance vars
        var stompNotifier,
            that = this,
            type = "SimplePush",
            name = connectionName,
            endpoints = settings.endpoints || [],
            pushNetworkURL = settings.pushNetworkURL || "http://" + window.location.hostname + ":61614/agPushNetwork",
            pushServerURL = settings.pushServerURL || "http://" + window.location.hostname + ":8080/agUnifiedPush",
            channelPrefix = settings.channelPrefix || "jms.topic.aerogear.",
            sessionID = null;

        // Privileged methods
        /**
            Returns the value of the private settings var
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
         */
        this.getSettings = function() {
            return settings;
        };

        /**
            Returns the value of the private name var
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
         */
        this.getName = function() {
            return name;
        };

        /**
            Returns the value of the private pushNetworkURL var
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
         */
        this.getPushNetworkURL = function() {
            return pushNetworkURL;
        };

        /**
            Set the value of the private pushNetworkURL var
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
            @param {String} url - New pushNetworkURL for this client
         */
        this.setPushNetworkURL = function( url ) {
            pushNetworkURL = url;
        };

        /**
            Returns the value of the private pushServerURL var
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
         */
        this.getPushServerURL = function() {
            return pushServerURL;
        };

        /**
            Set the value of the private pushServerURL var
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
            @param {String} url - New pushServerURL for this client
         */
        this.setPushServerURL = function( url ) {
            pushServerURL = url;
        };

        /**
            Returns the value of the private endpoints var
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
         */
        this.getEndpoints = function() {
            return endpoints;
        };

        /**
            Adds an endpoint to the set
            @param {Object} endpoint - The endpoint object to add to the set
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
         */
        this.addEndpoint = function( endpoint ) {
            endpoints.push( endpoint );
        };

        /**
            Check if subscribed to an endpoint
            @param {String} address - The address of the endpoint object to search for in the set
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
         */
        this.getEndpointIndex = function( address ) {
            for ( var i = 0; i < endpoints.length; i++ ) {
                if ( endpoints[ i ].address === address ) {
                    return i;
                }
            }
            return -1;
        };

        /**
            Removes an endpoint from the set
            @param {String} address - The endpoint address for the endpoint object to remove from the set
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
         */
        this.removeEndpoint = function( address ) {
            var index = this.getEndpointIndex( address );
            if ( index >= 0 ) {
                endpoints.splice( index, 1 );
            }
        };

        /**
            Returns the value of the private sessionID var
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
         */
        this.getSessionID = function() {
            return sessionID;
        };

        /**
            Sets the value of the private sessionID var
            @param {String} newSession - The new sessionID to set
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
         */
        this.setSessionID = function( newSession ) {
            sessionID = newSession;
        };

        /**
            Returns the value of the private channelPrefix var
            @private
            @augments AeroGear.SimplePush.adapters.SimplePush
         */
        this.getChannelPrefix = function() {
            return channelPrefix;
        };

        // Instantiating SimplePush immediately creates a Notifier connection to the Push Network
        stompNotifier = AeroGear.Notifier({
            name: "agPushNetwork",
            type: "stompws",
            settings: {
                connectURL: pushNetworkURL
            }
        }).clients.agPushNetwork;

        stompNotifier.connect({
            login: settings.login,
            password: settings.password,
            onConnect: function( stompFrame ) {
                var endpoints = that.getEndpoints(),
                    settings = that.getSettings();
                that.setSessionID( stompFrame.headers.session );

                stompNotifier.subscribe({
                    address: that.getChannelPrefix() + that.getSessionID(),
                    callback: function( message ) {
                        var endpoint;
                        if ( message.headers && message.headers.endpoint ) {
                            endpoint = endpoints[ that.getEndpointIndex( message.headers.endpoint ) ];
                            if ( endpoint ) {
                                endpoint.callback( message );
                            }
                        }
                    }
                });

                // TODO: Process initial provided endpoints to register with unified push server

                // Call user supplied onNetworkConnect callback
                if ( settings.onNetworkConnect ) {
                    settings.onNetworkConnect.call( that, stompFrame );
                }
            }
        });
    };

    //Public Methods
    /**
        Register a push message endpoint
        @param {String} address - endpoint identifier
        @param {Function} callback - callback to be executed when a message is received on this endpoint
        @example

     */
    AeroGear.SimplePush.adapters.SimplePush.prototype.register = function( address, callback ) {
        this.addEndpoint({
            address: address,
            callback: callback
        });

        /**************************************
        * TODO: Register with Unified Push Server
        **************************************/
    };

    //Public Methods
    /**
        Unregister a push message endpoint
        @param {String} address - endpoint identifier
        @example

     */
    AeroGear.SimplePush.adapters.SimplePush.prototype.unregister = function( address ) {
        this.removeEndpoint( address );

        /**************************************
        * TODO: Unregister with Unified Push Server
        **************************************/
    };

})( AeroGear );
