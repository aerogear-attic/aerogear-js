(function( aerogear, undefined ) {
    /**
     * aerogear.auth
     *
     **/
    aerogear.auth = function( config ) {
        var auth = {
                lib: "auth",
                defaultAdapter: "rest",
                modules: {},
                /**
                 * aerogear.auth#add( config[, baseURL] ) -> Object
                 * - config (Mixed): This can be a variety of types specifying how to create the authentication module
                 * - baseURL (String): The base URL to use for the server location that this authentication module should communicate with
                 *
                 **/
                add: function( config ) {
                    return aerogear.add.call( this, config );
                },
                /**
                 * aerogear.auth#remove( toRemove ) -> Object
                 * - toRemove (Mixed): This can be a variety of types specifying the authentication module to remove as illustrated below
                 *
                 **/
                remove: function( toRemove ) {
                    return aerogear.remove.call( this, toRemove );
                },
                // Helper function to set auth modules
                _setCollection: function( collection ) {
                    this.modules = collection;
                },
                // Helper function to get the auth modules
                _getCollection: function() {
                    return this.modules;
                }
            };

        return auth.add( config );
    };

    /**
     * aerogear.auth.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.auth namespace dynamically and still be accessible to the add method
     **/
    aerogear.auth.adapters = {};
})( aerogear );
