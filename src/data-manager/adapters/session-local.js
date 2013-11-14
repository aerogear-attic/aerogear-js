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
    The SessionLocal adapter extends the Memory adapter to store data in either session or local storage which makes it a little more persistent than memory
    This constructor is instantiated when the "DataManager.add()" method is called
    @status Stable
    @constructs AeroGear.DataManager.adapters.SessionLocal
    @mixes AeroGear.DataManager.adapters.Memory
    @param {String} storeName - the name used to reference this particular store
    @param {Object} [settings={}] - the settings to be passed to the adapter
    @param {Boolean} [settings.async=false] -  If true, all operations will be simulated as asynchronous and return a promise. This is a compatibility option for the Memory and SessionLocal adapters only for 1.3.0 and will be removed in the 1.4.0 release
    @param {String} [settings.recordId="id"] - the name of the field used to uniquely identify a "record" in the data
    @param {String} [settings.storageType="sessionStorage"] - the type of store can either be sessionStorage or localStorage
    @param {Object} [settings.crypto] - the crypto settings to be passed to the adapter
    @param {Object} [settings.crypto.agcrypto] - the AeroGear.Crypto object to be used
    @param {Object} [settings.crypto.options] - the specific options for the AeroGear.Crypto encrypt/decrypt methods
    @returns {Object} The created store
    @example
//Create an empty DataManager
var dm = AeroGear.DataManager();

//Add a custom SessionLocal store using local storage as its storage type
dm.add( "newStore", {
    recordId: "customID",
    storageType: "localStorage"
});
 */
AeroGear.DataManager.adapters.SessionLocal = function( storeName, settings ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.DataManager.adapters.SessionLocal ) ) {
        return new AeroGear.DataManager.adapters.SessionLocal( storeName, settings );
    }

    AeroGear.DataManager.adapters.Memory.apply( this, arguments );

    // Private Instance vars
    var storeType = settings.storageType || "sessionStorage",
        name = storeName,
        appContext = document.location.pathname.replace(/[\/\.]/g,"-"),
        storeKey = name + appContext,
        content = window[ storeType ].getItem( storeKey ),
        currentData = content ? this.decrypt( JSON.parse( content ), true ) : null ;

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

/**
    Determine if this adapter is supported in the current environment
*/
AeroGear.DataManager.adapters.SessionLocal.isValid = function() {
    return !!(window.localStorage && window.sessionStorage);
};

// Inherit from the Memory adapter
AeroGear.DataManager.adapters.SessionLocal.prototype = Object.create( new AeroGear.DataManager.adapters.Memory(), {
    // Public Methods
    /**
        Saves data to the store, optionally clearing and resetting the data
        @method
        @memberof AeroGear.DataManager.adapters.SessionLocal
        @param {Object|Array} data - An object or array of objects representing the data to be saved to the server. When doing an update, one of the key/value pairs in the object to update must be the `recordId` you set during creation of the store representing the unique identifier for a "record" in the data set.
        @param {Object} [options] - The options to be passed to the save method
        @param {Boolean} [options.reset] - If true, this will empty the current data and set it to the data being saved
        @param {AeroGear~errorCallbackStorage} [options.error] - A callback to be executed when an error is thrown trying to save data to the store. The most likely error is when the localStorage is full. The callback is passed the error object and the data that was attempted to be saved as arguments.
        @param {AeroGear~success} [options.success] - A callback to be called if the save was successful. This probably isn't necessary since the save is synchronous but is provided for API symmetry.
        @returns {Object} A jQuery.Deferred promise
        @returns {Array} @deprecated Returns the updated data from the store
        @example
var dm = AeroGear.DataManager([{ name: "tasks", type: "SessionLocal" }]).stores[ 0 ];

// Store a new task
dm.save({
    title: "Created Task",
    date: "2012-07-13",
    ...
});

//Store an array of new Tasks
dm.save([
    {
        title: "Task2",
        date: "2012-07-13"
    },
    {
        title: "Task3",
        date: "2012-07-13"
        ...
    }
]);

// Update an existing piece of data
var toUpdate = dm.read()[ 0 ];
toUpdate.data.title = "Updated Task";
dm.save( toUpdate );
     */
    save: {
        value: function( data, options ) {
            // Call the super method
            var newData,
                deferred = jQuery.Deferred(),
                reset = options && options.reset ? options.reset : false,
                oldData = window[ this.getStoreType() ].getItem( this.getStoreKey() ),
                async = this.getAsync(); //added in 1.3.0,  will be removed in 1.4.0

            if( async ) {
                AeroGear.DataManager.adapters.Memory.prototype.save.apply( this, [ arguments[ 0 ], { reset: reset, async: async } ] ).then( function( data ) {
                    newData = data;
                });
            } else {
                newData = AeroGear.DataManager.adapters.Memory.prototype.save.apply( this, [ arguments[ 0 ], { reset: reset } ] );
            }

            deferred.always( this.always );

            // Sync changes to persistent store
            try {
                window[ this.getStoreType() ].setItem( this.getStoreKey(), JSON.stringify( this.encrypt( newData ) ) );
                if ( options && options.success ) {
                    options.storageSuccess( newData );
                }
            } catch( error ) {
                oldData = oldData ? JSON.parse( oldData ) : [];

                if( async ) {
                    AeroGear.DataManager.adapters.Memory.prototype.save.apply( this, [ oldData, { reset: reset, async: async } ] ).then( function( data ) {
                        newData = data;
                    });
                } else {
                    newData = AeroGear.DataManager.adapters.Memory.prototype.save.apply( this, [ oldData, { reset: reset } ] );
                }

                if ( options && options.error ) {
                    return async ? deferred.reject( data, "error", options ? options.error : undefined ) : options.error( error, data );
                } else {
                    if( async ) {
                        deferred.reject();
                    }
                    throw error;
                }
            }

            return async ? deferred.resolve( newData, "success", options ? options.success : undefined ) : newData;
        }, enumerable: true, configurable: true, writable: true
    },
    /**
        Removes data from the store
        @method
        @memberof AeroGear.DataManager.adapters.SessionLocal
        @param {String|Object|Array} toRemove - A variety of objects can be passed to remove to specify the item or if nothing is provided, all data is removed
        @param {Object} [options] - The options to be passed to the save method
        @param {AeroGear~successrCallbackStorage} [options.success] - A callback to be called if the remove was successful. This probably isn't necessary since the remove is synchronous but is provided for API symmetry.
        @returns {Object} A jQuery.Deferred promise
        @returns {Array} @deprecated Returns the updated data from the store
        @example
var dm = AeroGear.DataManager([{ name: "tasks", type: "SessionLocal" }]).stores[ 0 ];

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
            var newData,
                deferred = jQuery.Deferred(),
                async = this.getAsync();  //added in 1.3.0,  will be removed in 1.4.0;

            if( async ) {
                AeroGear.DataManager.adapters.Memory.prototype.remove.apply( this, [ arguments[ 0 ], { async: true } ] ).then( function( data ) {
                    newData = data;
                });
            } else {
                newData = AeroGear.DataManager.adapters.Memory.prototype.remove.apply( this, arguments );
            }

            // Sync changes to persistent store
            window[ this.getStoreType() ].setItem( this.getStoreKey(), JSON.stringify( this.encrypt( newData ) ) );

            if( async ) {
                deferred.always( this.always );
                return deferred.resolve( newData, status, options ? options.success : undefined );
            } else {
                return newData;
            }
        }, enumerable: true, configurable: true, writable: true
    }
});

/**
    Validate this adapter and add it to AeroGear.DataManager.validAdapters if valid
*/
AeroGear.DataManager.validateAdapter( "SessionLocal", AeroGear.DataManager.adapters.SessionLocal );
