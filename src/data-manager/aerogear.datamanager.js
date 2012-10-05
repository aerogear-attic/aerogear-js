(function( aerogear, $, undefined ) {
    /**
     * aerogear.dataManager
     *
     * The aerogear.dataManager namespace provides a mechanism for connecting to and moving data in and out of different types of client side storage.
     *
     * `aerogear.dataManager( config ) -> Object`
     * - **config** (Mixed) When passing a store configuration object to `add`, the following items can be provided:
     *  - **name** - String (Required), the name that the store will later be referenced by
     *  - **type** - String (Optional, default - "memory"), the type of store as determined by the adapter used
     *  - **recordId** - String (Optional, default - "id"), the identifier used to denote the unique id for each record in the data associated with this store
     *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
     *   - Adapters may have a number of varying configuration settings.
     *
     * Returns an object representing a collection of data connections (stores) and their corresponding data models. This object provides a standard way to interact with client side data no matter the data format or storage mechanism used.
     *
     * ##### Example
     *
     *      // Create an empty dataManager
     *      var dm = aerogear.dataManager();
     *
     *      // Create a single store using the default adapter
     *      var dm2 = aerogear.dataManager( "tasks" );
     *
     *      // Create multiple stores using the default adapter
     *      var dm3 = aerogear.dataManager( [ "tasks", "projects" ] );
     **/
    aerogear.dataManager = function( config ) {
        var dataManager = $.extend( {}, aerogear, {
                lib: "dataManager",
                type: config ? config.type || "memory" : "memory",
                collectionName: "stores"
            });

        return dataManager.add( config );
    };

    /**
     * aerogear.dataManager.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.dataManager namespace dynamically and still be accessible to the add method
     **/
    aerogear.dataManager.adapters = {};
})( aerogear, jQuery );
