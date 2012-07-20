/* Need to add license, description, etc. */

// AeroGear Pipeline
(function( aerogear, undefined ) {
    function isArray( obj ) {
        return ({}).toString.call( obj ) === "[object Array]";
    }

    aerogear.pipeline = function( pipe ) {
        var i,
            current,
            pipes = {};

        if ( typeof pipe === "string" ) {
            // pipe is a string so use
            pipes[ pipe ] = aerogear.pipeline.adapters.rest( pipe );
        } else if ( isArray( pipe ) ) {
            // pipe is an array so loop through each item in the array
            for ( i = 0; i < pipe.length; i++ ) {
                current = pipe[ i ];

                if ( typeof current === "string" ) {
                    pipes[ current ] = aerogear.pipeline.adapters.rest( current );
                } else {
                    pipes[ current.name ] = aerogear.pipeline.adapters[ current.type || "rest" ]( current.name, current.recordId || "id", current.settings || {} );
                }
            }
        } else if ( pipe ) {
            // pipe is an object so use that signature
            pipes[ pipe.name ] = aerogear.pipeline.adapters[ pipe.type || "rest" ]( pipe.name, pipe.recordId || "id", pipe.settings || {} );
        } else {
            // pipe is undefined so throw error
            throw "aerogear.pipeline: pipe is undefined";
        }

        return pipes;
    };

    aerogear.pipeline.adapters = {};
})( aerogear );
