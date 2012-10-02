(function( aerogear, $, undefined ) {
    /**
     * aerogear.auth
     *
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
