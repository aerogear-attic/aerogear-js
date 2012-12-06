(function( AeroGear, $, undefined ) {
    /**
        Wrapper utility around jQuery.ajax to preform some custom actions
        @private
        @method
        @param {Object} caller - the AeroGear object (pipe, datamanager, etc.) that is calling AeroGear.ajax
        @param {Object} options - settings for jQuery.ajax
     */
    AeroGear.ajax = function( caller, options ) {
        var deferred = $.Deferred( function() {
            var that = this,
                settings = $.extend( {}, {
                    contentType: "application/json",
                    dataType: "json"
                }, options ),
                crossDomain = caller.getCrossDomainSettings(),
                jsonpOptions = {};

            //Check for CrossDomain
            if( crossDomain ) {
                if( crossDomain.type === "jsonp" || !AeroGear.hasCORS() ) {
                    jsonpOptions.dataType = "jsonp";
                    jsonpOptions.jsonp = crossDomain.jsonp ? crossDomain.jsonp : "callback";

                    settings = $.extend( {}, settings, jsonpOptions );
                }
            }

            this.done( settings.success );
            this.fail( settings.error );
            this.always( settings.complete );

            var ajaxSettings = $.extend( {}, settings, {
                success: function( data, textStatus, jqXHR ) {
                    that.resolve( typeof data === "string" && ajaxSettings.dataType === "json" ? JSON.parse( data ) : data, textStatus, jqXHR );
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if ( ajaxSettings.dataType === "json" ) {
                        try {
                            jqXHR.responseJSON = JSON.parse( jqXHR.responseText );
                        } catch( error ) {}
                    }
                    that.reject( jqXHR, textStatus, errorThrown );
                },
                complete: function( jqXHR, textStatus ) {
                    that.resolve( jqXHR, textStatus );
                }
            });

            if ( ajaxSettings.contentType === "application/json" && ajaxSettings.data && ( ajaxSettings.type === "POST" || ajaxSettings.type === "PUT" ) ) {
                ajaxSettings.data = JSON.stringify( ajaxSettings.data );
            }

            if ( AeroGear.Auth && !caller.isAuthenticated() ) {
                this.reject( "auth", "Error: Authentication Required" );
            } else if ( caller.addAuthIdentifier ) {
                $.ajax( caller.addAuthIdentifier( ajaxSettings ) );
            } else {
                $.ajax( ajaxSettings );
            }
        });

        var promise = deferred.promise();

        promise.success = deferred.done;
        promise.error = deferred.fail;
        promise.complete = deferred.always;

        return promise;
    };

    /**
        Utility function to test if an object is an Array
        @private
        @method
        @param {Object} obj - This can be any object to test
     */
    AeroGear.isArray = function( obj ) {
        return ({}).toString.call( obj ) === "[object Array]";
    };
    AeroGear.hasCORS = function() {
        return ( $.support.cors || ( typeof window.XDomainRequest != "undefined" ) );
    };
})( AeroGear, jQuery );
