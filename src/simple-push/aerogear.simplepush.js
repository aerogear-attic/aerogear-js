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
        @class
        @augments AeroGear.Core
        @example
     */
    AeroGear.SimplePush = function( config ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.SimplePush ) ) {
            return new AeroGear.SimplePush( config );
        }
        // Super Constructor
        AeroGear.Core.call( this );

        this.lib = "SimplePush";
        this.type = config ? config.type || "SimplePush" : "SimplePush";

        /**
            DESCRIPTION
            @memberOf AeroGear.SimplePush
            @type Object
            @default connection
         */
        this.collectionName = "connection";

        this.add( config );
    };

    AeroGear.SimplePush.prototype = AeroGear.Core;
    AeroGear.SimplePush.constructor = AeroGear.SimplePush;

    /**
        The adapters object is provided so that adapters can be added to the AeroGear.Notifier namespace dynamically and still be accessible to the add method
        @augments AeroGear.Notifier
     */
    AeroGear.SimplePush.adapters = {};
})( AeroGear );
