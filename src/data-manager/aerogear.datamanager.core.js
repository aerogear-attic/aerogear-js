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
    AeroGear.DataManagerCore is a base for the DataManager modules to extend. It is not to be instantiated and will throw an error when attempted
    @class
    @private
 */
AeroGear.DataManagerCore = function() {
     // Prevent instantiation of this base class
    if ( this instanceof AeroGear.DataManagerCore ) {
        throw "Invalid instantiation of base class AeroGear.DataManagerCore";
    }

    /**
        This function is used by the AeroGear.DataManager to add a new Object to its respective collection.
        @name AeroGear.add
        @method
        @param {String|Array|Object} config - This can be a variety of types specifying how to create the object. See the particular constructor for the object calling .add for more info.
        @returns {Object} The object containing the collection that was updated
     */
    this.add = function( config ){
        config = config || {};

        var i,
            type = config.type || "Memory";

        if( !( type in this.adapters ) ) {
            for( i = 0; i < AeroGear.DataManagerCore.prefered.length; i++ ) {
                if( AeroGear.DataManagerCore.prefered[ i ] in this.adapters ) {
                    //For Deprecation purposes in 1.3.0  will be removed in 1.4.0
                    if( type === "IndexedDB" || type === "WebSQL" ) {
                        config.settings = AeroGear.extend( config.settings || {}, { async: true } );
                    }
                    config.type = AeroGear.DataManagerCore.prefered[ i ];
                    break;
                }
            }
        }

        AeroGear.Core.call( this );
        this.add( config );

        //Put back DataManagerCore.add
        this.add = this._add;
    };

    //Save a reference to DataManagerCore.add to put back later
    this._add = this.add;

    /**
        This function is used internally by datamanager to remove an Object from the respective collection.
        @name AeroGear.remove
        @method
        @param {String|String[]|Object[]|Object} config - This can be a variety of types specifying how to remove the object.
        @returns {Object} The object containing the collection that was updated
     */
    this.remove = function( config ){
        AeroGear.Core.call( this );
        this.remove( config );

        //Put back DataManagerCore.remove
        this.remove = this._remove;
    };

    //Save a reference to DataManagerCore.remove to put back later
    this._remove = this.remove;
};

/**
    Stores the valid adapters
*/
AeroGear.DataManagerCore.adapters = {};

/**
    prefered adapters for the fallback strategy
*/
AeroGear.DataManagerCore.prefered = [ "IndexedDB", "WebSQL", "SessionLocal", "Memory" ];

/**
    Method to determine and store what adapters are valid for this environment
*/
AeroGear.DataManagerCore.validateAdapter = function( id, obj ) {
    if( obj.isValid() ) {
        AeroGear.DataManagerCore.adapters[ id ] = obj;
    }
};
