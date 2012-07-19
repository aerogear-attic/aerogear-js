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
                var data;
                if ( options ) {
                    if ( options.ajax && options.ajax.data ) {
                        data = options.ajax.data;
                    } else if ( options.data ) {
                        data = options.data;
                    }
                    if ( data ) {
                        options.ajax.data = data;
                    }
                } else {
                    options = {};
                }

                return $.ajax( $.extend( {}, ajaxSettings, { type: "GET" }, options.ajax || {} ) );
            },

            save: function( data, options ) {
                options = options || {};

                return $.ajax( $.extend( {}, ajaxSettings,
                    {
                        type: data[ recordId ] ? "PUT" : "POST",
                        data: data
                    },
                    options.ajax || {}
                ));
            },

            delete: function( options ) {
                var data;
                options = options || {};
                if ( typeof options.record === "string" || typeof options.record === "number" ) {
                    data = { id: options.record };
                } else {
                    data = options.record;
                }

                return $.ajax( $.extend( {}, ajaxSettings,
                    {
                        type: "DELETE",
                        data: data
                    },
                    options.ajax || {}
                ));
            }
        };
    };
})( aerogear, jQuery );
