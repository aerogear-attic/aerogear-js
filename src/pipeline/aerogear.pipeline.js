(function( aerogear, $, undefined ) {
    /**
     * aerogear.pipeline
     *
     * The aerogear.pipeline namespace provides a persistence API that is protocol agnostic and does not depend on any certain data model. Through the use of adapters, this library provides common methods like read, save and delete that will just work.
     *
     * `aerogear.pipeline( config ) -> Object`
     * - **config** (Mixed) - This can be a variety of types specifying how to create the pipe as illustrated below
     *
     * When passing a pipe configuration object to `add`, the following items can be provided:
     *  - **name** - String (Required), the name that the pipe will later be referenced by
     *  - **type** - String (Optional, default - "rest"), the type of pipe as determined by the adapter used
     *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
     *   - Adapters may have a number of varying configuration settings
     *
     * Returns an object representing a collection of server connections (pipes) and their corresponding data models. This object provides a standard way to communicate with the server no matter the data format or transport expected.
     *
     * ##### Example
     *
     *      // Create an empty pipeline
     *      var pipeline = aerogear.pipeline();
     *
     *      // Create a single pipe using the default adapter
     *      var pipeline2 = aerogear.pipeline( "tasks" );
     *
     *      // Create multiple pipes using the default adapter
     *      var pipeline3 = aerogear.pipeline( [ "tasks", "projects" ] );
     **/
    aerogear.pipeline = function( config ) {
        var pipeline = $.extend( {}, aerogear, {
            lib: "pipeline",
            type: config ? config.type || "rest" : "rest",
            collectionName: "pipes"
        });

        return pipeline.add( config );
    };

    /**
     * aerogear.pipeline.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.pipeline namespace dynamically and still be accessible to the add method
     **/
    aerogear.pipeline.adapters = {};
})( aerogear, jQuery );
