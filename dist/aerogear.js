/*! AeroGear JavaScript Library - v1.0.0.Alpha - 2012-08-10
* https://github.com/aerogear/aerogear-js
* Copyright (c) 2012 AeroGear Team and contributors; Licensed ALv2 */

(function( window, undefined ) {
    var aerogear = window.aerogear = {};
})( this );

// AeroGear Pipeline
(function( aerogear, undefined ) {
    function isArray( obj ) {
        return ({}).toString.call( obj ) === "[object Array]";
    }

    aerogear.pipeline = function( pipe ) {
        var pipeline = {};

        pipeline.add = function( pipe ) {
            var i,
                current,
                // initialize pipes if not already
                pipes = pipeline.pipes = pipeline.pipes || {};

            if ( typeof pipe === "string" ) {
                // pipe is a string so use
                pipes[ pipe ] = aerogear.pipeline.adapters.rest( pipe, "id" );
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

            pipeline.pipes = pipes;

            return pipeline;
        };

        pipeline.remove = function( pipe ) {
            var i,
                current,
                // initialize pipes if not already
                pipes = pipeline.pipes = pipeline.pipes || {};

            if ( typeof pipe === "string" ) {
                // pipe is a string so use
                delete pipes[ pipe ];
            } else if ( isArray( pipe ) ) {
                // pipe is an array so loop through each item in the array
                for ( i = 0; i < pipe.length; i++ ) {
                    current = pipe[ i ];

                    if ( typeof current === "string" ) {
                        delete pipes[ current ];
                    } else {
                        delete pipes[ current.name ];
                    }
                }
            } else if ( pipe ) {
                // pipe is an object so use that signature
                delete pipes[ pipe.name ];
            }

            pipeline.pipes = pipes;

            return pipeline;
        };

        return pipeline.add( pipe );
    };

    aerogear.pipeline.adapters = {};
})( aerogear );

// Rest Adapter (default)
(function( aerogear, $, undefined ) {
    aerogear.pipeline.adapters.rest = function( pipeName, recordId, ajaxSettings ) {
        ajaxSettings = $.extend({
            // use the pipeName as the default rest endpoint
            url: pipeName,
            // set the default content type to JSON
            contentType: "application/json"
        }, ajaxSettings );

        return {
            recordId: recordId,
            type: "rest",
            data: {},
            read: function( options ) {
                var that = this,
                    data;
                if ( options ) {
                    if ( options.ajax && options.ajax.data ) {
                        data = options.ajax.data;
                    } else if ( options.data ) {
                        data = options.data;
                    } else if ( !options.ajax ) {
                        options.ajax = {};
                    }
                    if ( data ) {
                        options.ajax.data = data;
                    }
                } else {
                    options = { ajax: {} };
                }

                var success = function( data ) {
                    that.data = data;
                    if ( options.ajax.success ) {
                        options.ajax.success.apply( this, arguments );
                    }
                };

                return $.ajax( $.extend( {}, ajaxSettings, { type: "GET" }, options.ajax, { success: success } ) );
            },

            save: function( data, options ) {
                var type,
                    url;
                data = data || {};
                options = options || {};
                type = data[ this.recordId ] ? "PUT" : "POST";

                if ( !options.ajax.url && data[ this.recordId ] ) {
                    url = ajaxSettings.url + "/" + data[ this.recordId ];
                } else if ( !options.ajax.url ) {
                    url = ajaxSettings.url;
                } else {
                    url = options.ajax.url;
                }

                if ( typeof data !== "string" ) {
                    data = JSON.stringify( data );
                }

                return $.ajax( $.extend( {}, ajaxSettings,
                    {
                        data: data,
                        type: type,
                        url: url
                    },
                    options.ajax || {}
                ));
            },

            del: function( options ) {
                var delId = "",
                    url;
                options = options || {};

                if ( typeof options === "string" || typeof options === "number" ) {
                    delId = "" + options;
                } else {
                    if ( typeof options.record === "string" || typeof options.record === "number" ) {
                        delId = "" + options.record;
                    } else if ( options.record ) {
                        delId = "" + options.record[ this.recordId ];
                    }
                }

                delId = delId.length ? "/" + delId : "";
                if ( options.ajax ) {
                    if ( !options.ajax.url ) {
                        url = ajaxSettings.url + delId;
                    } else {
                        url = options.ajax.url;
                    }
                } else {
                    url = ajaxSettings.url + delId;
                }

                return $.ajax( $.extend( {}, ajaxSettings,
                    {
                        type: "DELETE",
                        url: url
                    },
                    options.ajax || {}
                ));
            }
        };
    };
})( aerogear, jQuery );
