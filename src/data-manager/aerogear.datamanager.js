(function( aerogear, undefined ) {
    /**
     * aerogear.dataManager
     *
     * The aerogear.dataManager namespace provides a mechanism for connecting to and moving data in and out of different types of client side storage.
     *
     * `aerogear.dataManager( config ) -> Object`
     * - **config** (Mixed) When passing a valve configuration object to `add`, the following items can be provided:
     *  - **name** - String (Required), the name that the valve will later be referenced by
     *  - **type** - String (Optional, default - "memory"), the type of valve as determined by the adapter used
     *  - **recordId** - String (Optional, default - "id"), the identifier used to denote the unique id for each record in the data associated with this valve
     *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
     *   - Adapters may have a number of varying configuration settings.
     *
     * Returns an object representing a collection of data connections (valves) and their corresponding data models. This object provides a standard way to interact with client side data no matter the data format or storage mechanism used.
     *
     * ##### Example
     *
     **/
    aerogear.dataManager = function( config ) {
        var dataManager = {
                lib: "dataManager",
                defaultAdapter: "memory",
                valves: {},
                /**
                 * aerogear.dataManager#add( config ) -> Object
                 * - config (Mixed): This can be a variety of types specifying how to create the valve as illustrated below
                 *
                 * When passing a valve configuration object to `add`, the following items can be provided:
                 *  - **name** - String (Required), the name that the valve will later be referenced by
                 *  - **type** - String (Optional, default - "memory"), the type of valve as determined by the adapter used
                 *  - **recordId** - String (Optional, default - "id"), the identifier used to denote the unique id for each record in the data associated with this valve
                 *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
                 *   - Adapters may have a number of varying configuration settings.
                 *
                 * Returns the full dataManager object with the new valve(s) added
                 *
                 *     // Add a single valve using the default configuration (memory).
                 *     aerogear.dataManager.add( String valveName );
                 *
                 *     // Add multiple valves all using the default configuration (memory).
                 *     aerogear.dataManager.add( Array[String] valveNames );
                 *
                 *     // Add one or more valve configuration objects.
                 *     aerogear.dataManager.add( Object/Array[Object] valveConfigurations )
                 *
                 * The default valve type is `memory`. You may also use one of the other provided types or create your own.
                 *
                 * ##### Example
                 *
                 *     var dm = aerogear.dataManager();
                 *
                 *     // Add a single valve using the default adapter
                 *     dm = dm.add( "tasks" );
                 *
                 *     // Add multiple valves using the default adapter
                 *     dm = dm.add( [ "tags", "projects" ] );
                 *
                 **/
                add: function( config ) {
                    return aerogear.add.call( this, config );
                },
                /**
                 * aerogear.dataManager#remove( toRemove ) -> Object
                 * - toRemove (Mixed): This can be a variety of types specifying the valve to remove as illustrated below
                 *
                 * Returns the full dataManager object with the specified valve(s) removed
                 *
                 *     // Remove a single valve.
                 *     aerogear.dataManager.remove( String valveName );
                 *
                 *     // Remove multiple valves.
                 *     aerogear.dataManager.remove( Array[String] valveNames );
                 *
                 *     // Remove one or more valves by passing entire valve objects.
                 *     aerogear.dataManager.remove( Object/Array[Object] valves )
                 *
                 * ##### Example
                 *
                 *     var dm = aerogear.dataManager( [ "projects", "tags", "tasks" ] );
                 *
                 *     // Remove a single valve
                 *     dm.remove( "tasks" );
                 *
                 *     // Remove multiple valves
                 *     dm.remove( [ "tags", "projects" ] );
                 *
                 **/
                remove: function( config ) {
                    return aerogear.remove.call( this, config );
                },
                // Helper function to set valves
                _setCollection: function( collection ) {
                    this.valves = collection;
                },
                // Helper function to get the valves
                _getCollection: function() {
                    return this.valves;
                }
            };

        return dataManager.add( config );
    };

    /**
     * aerogear.dataManager.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.dataManager namespace dynamically and still be accessible to the add method
     **/
    aerogear.dataManager.adapters = {};
})( aerogear );
