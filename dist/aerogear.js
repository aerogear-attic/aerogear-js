/*! AeroGear JavaScript Library - v1.0.0.Alpha - 2012-08-20
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright 2012, Red Hat, Inc., and individual contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

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
    // TODO: Share this across entire lib
    function isArray( obj ) {
        return ({}).toString.call( obj ) === "[object Array]";
    }

    aerogear.pipeline.adapters.rest = function( pipeName, recordId, ajaxSettings ) {
        ajaxSettings = $.extend({
            // use the pipeName as the default rest endpoint
            url: pipeName,
            // set the default content type and Accept headers to JSON
            contentType: "application/json",
            dataType: "json"
        }, ajaxSettings );

        return {
            recordId: recordId,
            type: "rest",
            data: null,
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
                    that.data = isArray( data ) ? data : [ data ];

                    if ( options.ajax.success ) {
                        options.ajax.success.apply( this, arguments );
                    }
                };

                return $.ajax( $.extend( {}, ajaxSettings, { type: "GET" }, options.ajax, { success: success } ) );
            },

            save: function( data, options ) {
                var that = this,
                    type,
                    url,
                    itemFound = false;
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

                var success = function( data ) {
                    if ( that.data ) {
                        for( var item in that.data ) {
                            if ( that.data[ item ].id === data.id ) {
                                that.data[ item ] = data;
                                itemFound = true;
                            }
                        }
                        if ( !itemFound ) {
                            that.data.push( data );
                        }
                    } else {
                        that.data = isArray( data ) ? data : [ data ];
                    }

                    if ( options.ajax.success ) {
                        options.ajax.success.apply( this, arguments );
                    }
                };

                if ( typeof data !== "string" ) {
                    data = JSON.stringify( data );
                }

                return $.ajax( $.extend( {}, ajaxSettings,
                    {
                        data: data,
                        type: type,
                        url: url
                    },
                    options.ajax || {},
                    { success: success }
                ));
            },

            remove: function( toRemove, options ) {
                var that = this,
                    delId = 0,
                    delPath = "",
                    url;

                options = options || {};

                if ( typeof toRemove === "string" || typeof toRemove === "number" ) {
                    delId = parseInt( toRemove, 10 );
                } else if ( toRemove ) {
                    if ( typeof toRemove.record === "string" || typeof toRemove.record === "number" ) {
                        delId = parseInt( toRemove.record, 10 );
                    } else if ( toRemove.record ) {
                        delId = parseInt( toRemove.record[ this.recordId ], 10 );
                    }
                } else {
                    throw "aerogear.pipeline.rest: missing argument";
                }

                delPath = delId ? "/" + delId : "";
                if ( options.ajax ) {
                    if ( options.ajax.url ) {
                        url = options.ajax.url;
                    } else {
                        url = ajaxSettings.url + delPath;
                    }
                } else if ( toRemove.ajax ) {
                    options.ajax = toRemove.ajax;
                    if ( toRemove.ajax.url ) {
                        url = toRemove.ajax.url;
                    } else {
                        url = ajaxSettings.url + delPath;
                    }
                } else {
                    url = ajaxSettings.url + delPath;
                }

                var success = function( data ) {
                    var itemIndex;

                    for( var item in that.data ) {
                        if ( that.data[ item ].id === delId ) {
                            that.data.splice( item, 1 );
                        }
                    }

                    if ( options.ajax.success ) {
                        options.ajax.success.apply( this, arguments );
                    }
                };

                return $.ajax( $.extend( {}, ajaxSettings,
                    {
                        type: "DELETE",
                        url: url
                    },
                    options.ajax || {},
                    { success: success }
                ));
            }
        };
    };
})( aerogear, jQuery );
