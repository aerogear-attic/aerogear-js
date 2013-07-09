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
    The AeroGear.Notifier namespace provides a messaging API. Through the use of adapters, this library provides common methods like connect, disconnect, subscribe, unsubscribe and publish.
    @class
    @augments AeroGear.Core
    @param {String|Array|Object} [config] - A configuration for the client(s) being created along with the notifier. If an object or array containing objects is used, the objects can have the following properties:
    @param {String} config.name - the name that the client will later be referenced by
    @param {String} [config.type="vertx"] - the type of client as determined by the adapter used
    @param {Object} [config.settings={}] - the settings to be passed to the adapter
    @returns {Object} The created notifier containing any messaging clients that may have been created
    @example
    // Create an empty notifier
    var notifier = AeroGear.Notifier();

    // Create a single client using the default adapter
    var notifier2 = AeroGear.Notifier( "myNotifier" );

    // Create multiple clients using the default adapter
    var notifier3 = AeroGear.Notifier( [ "someNotifier", "anotherNotifier" ] );

    // Create a default adapter with settings
    var notifier4 = AeroGear.Notifier({
        name: "vertxNotifier",
        type: "vertx",
        settings: { ... }
    });

    // Create a stompws adapter with settings
    var notifier5 = AeroGear.Notifier({
        name: "STOMPNotifier",
        type: "stompws",
        settings: { ... }
    });

    // Create a vertx and stompws adapter with settings
    var notifier6 = AeroGear.Notifier([
        {
            name: "vertxNotifier",
            type: "vertx",
            settings: { ... }
        },
        {
            name: "STOMPNotifier",
            type: "stompws",
            settings: { ... }
        }
    ]);
 */
AeroGear.Notifier = function( config ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.Notifier ) ) {
        return new AeroGear.Notifier( config );
    }
    // Super Constructor
    AeroGear.Core.call( this );

    this.lib = "Notifier";
    this.type = config ? config.type || "vertx" : "vertx";

    /**
        The name used to reference the collection of notifier client instances created from the adapters
        @memberOf AeroGear.Notifier
        @type Object
        @default modules
     */
    this.collectionName = "clients";

    this.add( config );
};

AeroGear.Notifier.prototype = AeroGear.Core;
AeroGear.Notifier.constructor = AeroGear.Notifier;

/**
    The adapters object is provided so that adapters can be added to the AeroGear.Notifier namespace dynamically and still be accessible to the add method
    @augments AeroGear.Notifier
 */
AeroGear.Notifier.adapters = {};

/**
    A set of constants used to track the state of a client connection.
 */
AeroGear.Notifier.CONNECTING = 0;
AeroGear.Notifier.CONNECTED = 1;
AeroGear.Notifier.DISCONNECTING = 2;
AeroGear.Notifier.DISCONNECTED = 3;
