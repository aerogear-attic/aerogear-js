/* Need to add license, description, etc. */

(function( window, undefined ) {
    var aerogear = window.aerogear = {};
})( this );


/*********************************************** 
     Begin aerogear.pipeline.js 
***********************************************/ 

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


/*********************************************** 
     Begin rest.js 
***********************************************/ 

/* Need to add license, description, etc. */

// Rest Adapter (default)
(function( aerogear, $, undefined ) {
    aerogear.pipeline.adapters.rest = function( pipeName, recordId, ajaxSettings ) {
        // If recordId not set, check for ajaxSettings in second parameter
        if ( !ajaxSettings ) {
            if ( !recordId ) {
                // no recordId nor ajaxSettings provided
                recordId = "id";
                ajaxSettings = {};
            } else if ( typeof recordId !== "string" ) {
                // recordId contains our ajaxSettings
                ajaxSettings = recordId;
                recordId = "id";
            }
        }

        ajaxSettings = $.extend({
            // use the pipeName as the default rest endpoint
            url: pipeName
        }, ajaxSettings );

        return {
            read: function( options ) {
                options = options || {};
                ajaxSettings = $.extend({
                    type: "GET"
                }, options.ajax || {}, ajaxSettings );

                return $.ajax( ajaxSettings );
            },

            save: function( data, options ) {
                options = options || {};
                ajaxSettings = $.extend({
                    type: data[ recordId ] ? "PUT" : "POST",
                    data: data
                }, options.ajax || {}, ajaxSettings );

                return $.ajax( ajaxSettings );
            },

            delete: function( data, options ) {
                options = options || {};
                ajaxSettings = $.extend({
                    type: "DELETE",
                    data: data || ""
                }, options.ajax || {}, ajaxSettings );

                return $.ajax( ajaxSettings );
            }
        };
    };
})( aerogear, jQuery );
