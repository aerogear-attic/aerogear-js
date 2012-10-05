(function( aerogear, $, undefined ) {
    /**
     * aerogear.auth
     * The aerogear.auth namespace provides an authentication and enrollment API. Through the use of adapters, this library provides common methods like enroll, login and logout that will just work.
     *
     * `aerogear.auth( config ) -> Object`
     * - **config** (Mixed) - This can be a variety of types specifying how to create the module as illustrated below
     *
     * When passing an auth configuration object to `add`, the following items can be provided:
     *  - **name** - String (Required), the name that the module will later be referenced by
     *  - **type** - String (Optional, default - "rest"), the type of module as determined by the adapter used
     *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
     *   - Adapters may have a number of varying configuration settings
     *
     * Returns an object representing a collection of authentication modules. This object provides a standard way to authenticate with a service no matter the data format or transport expected.
     *
     * ##### Example
     *
     *      // Create an empty authenticator
     *      var auth = aerogear.auth();
     *
     *      // Create a single module using the default adapter
     *      var auth2 = aerogear.auth( "myAuth" );
     *
     *      // Create multiple modules using the default adapter
     *      var auth3 = aerogear.auth( [ "someAuth", "anotherAuth" ] );
     **/
    aerogear.auth = function( config ) {
        var auth = $.extend( {}, aerogear, {
                lib: "auth",
                type: config.type || "rest",
                collectionName: "modules"
            });

        return auth.add( config );
    };

    /**
     * aerogear.auth.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.auth namespace dynamically and still be accessible to the add method
     **/
    aerogear.auth.adapters = {};
})( aerogear, jQuery );
