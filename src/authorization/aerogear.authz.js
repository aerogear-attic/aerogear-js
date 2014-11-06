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

import Core from 'aerogear.core';

/**
    The AeroGear.Authorization namespace provides an authentication API.
    @status Experimental
    @class
    @param {String|Array|Object} [config] - A configuration for the service(s) being created along with the authorizer. If an object or array containing objects is used, the objects can have the following properties:
    @param {String} config.name - the name that the module will later be referenced by
    @param {String} [config.type="OAuth2"] - the type of module as determined by the adapter used
    @param {Object} [config.settings={}] - the settings to be passed to the adapter. For specific settings, see the documentation for the adapter you are using.
    @returns {Object} The created authorizer containing any authz services that may have been created
    @example
    // Create an empty authorizer
    var authz = AeroGear.Authorization();
 */
function Authorization ( config ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.Authorization ) ) {
        return new AeroGear.Authorization( config );
    }

    // Super constructor
    Core.call( this );

    this.lib = "Authorization";
    this.type = config ? config.type || "OAuth2" : "OAuth2";

    /**
        The name used to reference the collection of service instances created from the adapters
        @memberOf AeroGear.Authorization
        @type Object
        @default services
     */
    this.collectionName = "services";

    this.add( config );
};

Authorization.prototype = Core;
Authorization.constructor = Core.Authorization;

/**
    The adapters object is provided so that adapters can be added to the AeroGear.Authorization namespace dynamically and still be accessible to the add method
    @augments AeroGear.Authorization
 */
Authorization.adapters = {};

export default Authorization;