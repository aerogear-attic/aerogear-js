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
    The AeroGear Differential Sync Engine.
    @status Experimental
    @constructs AeroGear.DiffSyncEngine
    @param {Object} config - A configuration
    @param {function} [config.type = "jsonPatch"] - the type of sync engine, defaults to jsonPatch
    @returns {object} diffSyncClient - The created DiffSyncClient
    @example
 */
AeroGear.DiffSyncEngine = function( config ) {
    if ( !( this instanceof AeroGear.DiffSyncEngine ) ) {
        return new AeroGear.DiffSyncEngine( config );
    }
    // Super Constructor
    AeroGear.Core.call( this );

    this.lib = "DiffSyncEngine";
    this.type = config ? config.type || "jsonPatch" : "jsonPatch";

    /**
        The name used to reference the collection of sync engines instances created from the adapters
        @memberOf AeroGear.DiffSyncEngine
        @type Object
        @default modules
     */
    this.collectionName = "engines";

    this.add( config );
};

AeroGear.DiffSyncEngine.prototype = AeroGear.Core;
AeroGear.DiffSyncEngine.constructor = AeroGear.DiffSyncEngine;

/**
    The adapters object is provided so that adapters can be added to the AeroGear.DiffSyncEngine namespace dynamically and still be accessible to the add method
    @augments AeroGear.DiffSyncEngine
 */
AeroGear.DiffSyncEngine.adapters = {};
