(function( AeroGear, $, undefined ) {
    /**
        The AeroGear.Auth namespace provides an authentication and enrollment API. Through the use of adapters, this library provides common methods like enroll, login and logout that will just work.
        @constructs AeroGear.Auth
        @param {String|Array|Object} [config] - A configuration for the modules(s) being created along with the authenticator. If an object or array containing objects is used, the objects can have the following properties:
        @param {String} config.name - the name that the module will later be referenced by
        @param {String} [config.type="rest"] - the type of module as determined by the adapter used
        @param {Object} [config.settings={}] - the settings to be passed to the adapter
        @returns {Object} auth - The created authenticator containing any auth modules that may have been created
        @example
        // Create an empty authenticator
        var auth = AeroGear.Auth();

        // Create a single module using the default adapter
        var auth2 = AeroGear.Auth( "myAuth" );

        // Create multiple modules using the default adapter
        var auth3 = AeroGear.Auth( [ "someAuth", "anotherAuth" ] );
     */
    AeroGear.Auth = function( config ) {
        var auth = $.extend( {}, AeroGear, {
                lib: "Auth",
                type: config ? config.type || "Rest" : "Rest",
                collectionName: "modules"
            });

        return auth.add( config );
    };

    /**
        The adapters object is provided so that adapters can be added to the AeroGear.Auth namespace dynamically and still be accessible to the add method
        @augments AeroGear.Auth
     */
    AeroGear.Auth.adapters = {};
})( AeroGear, jQuery );
