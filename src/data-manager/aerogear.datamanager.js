(function( AeroGear, $, undefined ) {
    /**
        A collection of data connections (stores) and their corresponding data models. This object provides a standard way to interact with client side data no matter the data format or storage mechanism used.
        @class
        @augments AeroGear.Core
        @param {String|Array|Object} [config] - A configuration for the store(s) being created along with the DataManager. If an object or array containing objects is used, the objects can have the following properties:
        @param {String} config.name - the name that the store will later be referenced by
        @param {String} [config.type="memory"] - the type of store as determined by the adapter used
        @param {String} [config.recordId="id"] - the identifier used to denote the unique id for each record in the data associated with this store
        @param {Object} [config.settings={}] - the settings to be passed to the adapter
        @returns {object} dataManager - The created DataManager containing any stores that may have been created
        @example
        // Create an empty DataManager
        var dm = AeroGear.DataManager();

        // Create a single store using the default adapter
        var dm2 = AeroGear.DataManager( "tasks" );

        // Create multiple stores using the default adapter
        var dm3 = AeroGear.DataManager( [ "tasks", "projects" ] );
     */
    AeroGear.DataManager = function( config ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.DataManager ) ) {
            return new AeroGear.DataManager( config );
        }

        // Super Constructor
        AeroGear.Core.call( this );

        this.lib = "DataManager";
        this.type = config ? config.type || "Memory" : "Memory";

        /**
            The name used to reference the collection of data store instances created from the adapters
            @memberOf AeroGear.DataManager
            @type Object
            @default stores
         */
        this.collectionName = "stores";

        this.add( config );
    };

    AeroGear.DataManager.prototype = AeroGear.Core;
    AeroGear.DataManager.constructor = AeroGear.DataManager;

    /**
        The adapters object is provided so that adapters can be added to the AeroGear.DataManager namespace dynamically and still be accessible to the add method
        @augments AeroGear.DataManager
     */
    AeroGear.DataManager.adapters = {};

    // Constants
    AeroGear.DataManager.STATUS_NEW = 1;
    AeroGear.DataManager.STATUS_MODIFIED = 2;
    AeroGear.DataManager.STATUS_REMOVED = 0;
})( AeroGear, jQuery );
