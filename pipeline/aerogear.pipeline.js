/* Need to add license, description, etc. */

// AeroGear Pipeline
(function( aerogear, undefined ) {
    aerogear.pipeline = function( pipe ) {
        var config = pipe || {},
            pipes = {};

        if ( typeof config === "string" ) {
            pipes[ config ] = aerogear.pipeline.adapters.rest( config );
        }

        return pipes;
    };

    aerogear.pipeline.adapters = {};
})( aerogear );
