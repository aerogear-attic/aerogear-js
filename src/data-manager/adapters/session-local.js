(function( AeroGear, $, uuid, undefined ) {
    /**
        The SessionLocal adapter extends the Memory adapter to store data in either session or local storage which makes it a little more persistent than memory
        @constructs AeroGear.DataManager.adapters.SessionLocal
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
            storeKey = name + appContext;

        // Initialize data from the persistent store if it exists
        data = JSON.parse( window[ storeType ].getItem( storeKey ) );

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
        /**
            Saves data to the store, optionally clearing and resetting the data
            @param {Object|Array} data - An object or array of objects representing the data to be saved to the store.
            @param {Object} [options] - Extra options to pass to save
            @param {Object} [options.noSync] - If true, do not sync this save to the server (usually used internally during a sync to avoid loops)
            @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
            @param {Function} [options.storageSuccess] - A callback that can be used for handling success when syncing the data to the session or local store. The function receives the data being saved.
            @param {Function} [options.storageError] - A callback that can be used for handling errors when syncing the data to the session or local store. The function receives the error thrown and the data being saved as arguments.
            @returns {Array} Returns the updated data from the store
            @example
            [TODO]
         */
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

        /**
            Removes data from the store
            @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
            @param {Object} [options] - Extra options to pass to remove
            @param {Object} [options.noSync] - If true, do not sync this remove to the server (usually used internally during a sync to avoid loops)
            @returns {Array} Returns the updated data from the store
            @example
            var dm = AeroGear.DataManager( "tasks" ).stores[ 0 ];

            // Store a new task
            dm.save({
                title: "Created Task"
            });

            // Store another new task
            dm.save({
                title: "Another Created Task"
            });

            // Store one more new task
            dm.save({
                title: "And Another Created Task"
            });

            // Remove a particular item from the store by its id
            var toRemove = dm.read()[ 0 ];
            dm.remove( toRemove.id );

            // Remove an item from the store using the data object
            toRemove = dm.read()[ 0 ];
            dm.remove( toRemove );

            // Delete all remaining data from the store
            dm.remove();
         */
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
