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
    The AeroGear.Pipeline provides a persistence API that is protocol agnostic and does not depend on any certain data model. Through the use of adapters, this library provides common methods like read, save and delete that will just work.
    @class
    @augments AeroGear.Core
    @param {String|Array|Object} [config] - A configuration for the pipe(s) being created along with the Pipeline. If an object or array containing objects is used, the objects can have the following properties:
    @param {String} config.name - the name that the pipe will later be referenced by
    @param {String} [config.type="rest"] - the type of pipe as determined by the adapter used
    @param {String} [config.recordId="id"] - the identifier used to denote the unique id for each record in the data associated with this pipe
    @param {Object} [config.settings={}] - the settings to be passed to the adapter. For specific settings, see the documentation for the adapter you are using.
    @returns {Object} pipeline - The created Pipeline containing any pipes that may have been created
    @example
// Create an empty Pipeline
var pl = AeroGear.Pipeline();

// Create a single pipe using the default adapter
var pl2 = AeroGear.Pipeline( "tasks" );

// Create multiple pipes using the default adapter
var pl3 = AeroGear.Pipeline( [ "tasks", "projects" ] );

//Create a new REST pipe with a custom ID using an object
var pl4 = AeroGear.Pipeline({
    name: "customPipe",
    type: "rest",
    recordId: "CustomID"
});

//Create multiple REST pipes using objects
var pl5 = AeroGear.Pipeline([
    {
        name: "customPipe",
        type: "rest",
        recordId: "CustomID"
    },
    {
        name: "customPipe2",
        type: "rest",
        recordId: "CustomID"
    }
]);
 */
AeroGear.Pipeline = function( config ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.Pipeline ) ) {
        return new AeroGear.Pipeline( config );
    }

    // Super constructor
    AeroGear.Core.call( this );

    this.lib = "Pipeline";
    this.type = config ? config.type || "Rest" : "Rest";

    /**
        The name used to reference the collection of pipe instances created from the adapters
        @memberOf AeroGear.Pipeline
        @type Object
        @default pipes
     */
    this.collectionName = "pipes";

    this.add( config );
};

AeroGear.Pipeline.prototype = AeroGear.Core;
AeroGear.Pipeline.constructor = AeroGear.Pipeline;

/**
    The adapters object is provided so that adapters can be added to the AeroGear.Pipeline namespace dynamically and still be accessible to the add method
    @augments AeroGear.Pipeline
 */
AeroGear.Pipeline.adapters = {};
