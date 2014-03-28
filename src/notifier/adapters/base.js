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
    The Base Notifier adapter that all other Notifier adapters( except SimplePush ) will extend from.
    Not to be Instantiated directly
*/

AeroGear.Notifier.adapters.base = function( clientName, settings ) {
    if ( this instanceof AeroGear.Notifier.adapters.base ) {
        throw "Invalid instantiation of base class AeroGear.Notifier.adapters.base";
    }

    settings = settings || {};

    var connectURL = settings.connectURL || "",
        channels = settings.channels || [],
        autoConnect = !!settings.autoConnect || channels.length,
        state = AeroGear.Notifier.CONNECTING,
        name = clientName,
        client = null;

    // Privileged methods
    /**
        Returns the value of the private connectURL var
        @private
        @augments AeroGear.Notifier.adapters.base
     */
    this.getConnectURL = function() {
        return connectURL;
    };

    /**
        Set the value of the private connectURL var
        @private
        @augments AeroGear.Notifier.adapters.base
        @param {String} url - New connectURL for this client
     */
    this.setConnectURL = function( url ) {
        connectURL = url;
    };

    /**
        Returns the value of the private channels var
        @private
        @augments AeroGear.Notifier.adapters.base
     */
    this.getChannels = function() {
        return channels;
    };

    /**
        Adds a channel to the set
        @param {Object} channel - The channel object to add to the set
        @private
        @augments AeroGear.Notifier.adapters.base
     */
    this.addChannel = function( channel ) {
        channels.push( channel );
    };

    /**
        Check if subscribed to a channel
        @param {String} address - The address of the channel object to search for in the set
        @private
        @augments AeroGear.Notifier.adapters.base
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
        @augments AeroGear.Notifier.adapters.base
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
        @augments AeroGear.Notifier.adapters.base
     */
    this.getState = function() {
        return state;
    };

    /**
        Sets the value of the private state var
        @private
        @augments AeroGear.Notifier.adapters.base
     */
    this.setState = function( newState ) {
        state = newState;
    };

    /**
        Returns the value of the private client var
        @private
        @augments AeroGear.Notifier.adapters.base
     */
    this.getClient = function() {
        return client;
    };

    /**
        Sets the value of the private client var
        @private
        @augments AeroGear.Notifier.adapters.base
     */
    this.setClient = function( newClient ) {
        client = newClient;
    };

    // Handle auto-connect.
    // for stompws ONLY - If Login or Password are needed, autoConnect won't happen
    if ( ( autoConnect || channels.length ) && ( !settings.login && !settings.password ) ) {
        this.connect({
            url: connectURL,
            onConnect: settings.onConnect,
            onDisconnect: settings.onDisconnect, // for Vertx
            onConnectError: settings.onConnectError,
            onMessage: settings.onMessage // for mqttws
        });
    }
};
