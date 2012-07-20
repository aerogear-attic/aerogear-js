/* Need to add license, description, etc. */

// Rest Adapter (default)
(function( aerogear, $, undefined ) {
    aerogear.pipeline.adapters.rest = function( pipeName, recordId, ajaxSettings ) {
        ajaxSettings = $.extend({
            // use the pipeName as the default rest endpoint
            url: pipeName
        }, ajaxSettings );

        return {
            recordId: recordId,
            type: "rest",
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
                data = data || {};
                options = options || {};

                var type = data[ recordId ] ? "PUT" : "POST";
                if ( typeof data !== "string" ) {
                    data = JSON.stringify( data );
                }

                return $.ajax( $.extend( {}, ajaxSettings,
                    {
                        type: type,
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
