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
(function( AeroGear, $, uuid, undefined ) {
    /**
        The SessionLocal adapter extends the Memory adapter to store data in either session or local storage which makes it a little more persistent than memory
        @constructs AeroGear.DataManager.adapters.SessionLocal
        @mixes AeroGear.DataManager.adapters.Memory
        @param {String} storeName - the name used to reference this particular store
        @param {Object} [settings={}] - the settings to be passed to the adapter
        @param {Boolean} [settings.dataSync=false] - if true, any pipes associated with this store will attempt to keep the data in sync with the server (coming soon)
        @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
        @param {String} [settings.storageType="sessionStorage"] - the type of store can either be sessionStorage or localStorage
        @returns {Object} The created store
     */
    AeroGear.DataManager.adapters.SessionLocal = function( storeName, settings ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.DataManager.adapters.SessionLocal ) ) {
            return new AeroGear.DataManager.adapters.SessionLocal( storeName, settings );
        }

        AeroGear.DataManager.adapters.Memory.apply( this, arguments );

        // Private Instance vars
        var data = null,
            type = "SessionLocal",
            storeType = settings.storageType || "sessionStorage",
            name = storeName,
            dataSync = settings.dataSync,
            appContext = document.location.pathname.replace(/[\/\.]/g,"-"),
            storeKey = name + appContext,
            currentData = JSON.parse( window[ storeType ].getItem( storeKey ) );

        // Initialize data from the persistent store if it exists
        if ( currentData ) {
            AeroGear.DataManager.adapters.Memory.prototype.save.call( this, currentData, true );
        }

        // Privileged Methods
        /**
            Returns the value of the private storeType var
            @private
            @augments SessionLocal
            @returns {String}
         */
        this.getStoreType = function() {
            return storeType;
        };

        /**
            Returns the value of the private storeKey var
            @private
            @augments SessionLocal
            @returns {String}
         */
        this.getStoreKey = function() {
            return storeKey;
        };
    };

    // Inherit from the Memory adapter
    AeroGear.DataManager.adapters.SessionLocal.prototype = Object.create( new AeroGear.DataManager.adapters.Memory(), {
        // Public Methods
        save: {
            value: function( data, options ) {
                // Call the super method
                AeroGear.DataManager.adapters.Memory.prototype.save.apply( this, arguments );

                // Sync changes to persistent store
                try {
                    window[ this.getStoreType() ].setItem( this.getStoreKey(), JSON.stringify( this.getData() ) );
                    if ( options && options.storageSuccess ) {
                        options.storageSuccess( data );
                    }
                } catch( error ) {
                    if ( options && options.storageError ) {
                        options.storageError( error, data );
                    } else {
                        throw error;
                    }
                }
            }, enumerable: true, configurable: true, writable: true
        },
        remove: {
            value: function( toRemove, options ) {
                // Call the super method
                AeroGear.DataManager.adapters.Memory.prototype.remove.apply( this, arguments );

                // Sync changes to persistent store
                window[ this.getStoreType() ].setItem( this.getStoreKey(), JSON.stringify( this.getData() ) );
            }, enumerable: true, configurable: true, writable: true
        }
    });
})( AeroGear, jQuery, uuid );
