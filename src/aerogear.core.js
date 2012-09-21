(function( window, undefined ) {
    /**
     * aerogear
     *
     * The aerogear namespace provides a way to encapsulate the library's properties and methods away from the global namespace
    **/
    var aerogear = window.aerogear = {
        /**
         * aerogear#add( config ) -> Object
         * - config (Mixed): This can be a variety of types specifying how to create the object
         *
         * This function is used internally by pipeline, datamanager, etc. to add a new Object (pipe, valve, etc.) to the respective collection. For specific examples look at those internal use cases.
         **/
        add: function ( config ) {
            var i,
                current,
                collection = this._getCollection();

            if ( !config ) {
                return this;
            } else if ( typeof config === "string" ) {
                // config is a string so use default adapter type
                collection[ config ] = aerogear[ this.lib ].adapters[ this.defaultAdapter ]( config );
            } else if ( aerogear.isArray( config ) ) {
                // config is an array so loop through each item in the array
                for ( i = 0; i < config.length; i++ ) {
                    current = config[ i ];

                    if ( typeof current === "string" ) {
                        collection[ current ] = aerogear[ this.lib ].adapters[ this.defaultAdapter ]( current );
                    } else {
                        collection[ current.name ] = aerogear[ this.lib ].adapters[ current.type || this.defaultAdapter ]( current.name, current.settings || {} );
                    }
                }
            } else {
                // config is an object so use that signature
                collection[ config.name ] = aerogear[ this.lib ].adapters[ config.type || this.defaultAdapter ]( config.name, config.settings || {} );
            }

            // reset the collection instance
            this._setCollection( collection );

            return this;
        },
        /**
         * aerogear#remove( config ) -> Object
         * - config (Mixed): This can be a variety of types specifying how to remove the object
         *
         * This function is used internally by pipeline, datamanager, etc. to remove an Object (pipe, valve, etc.) from the respective collection. For specific examples look at those internal use cases.
         **/
        remove: function( config ) {
            var i,
                current,
                collection = this._getCollection();

            if ( typeof config === "string" ) {
                // config is a string so delete that item by name
                delete collection[ config ];
            } else if ( aerogear.isArray( config ) ) {
                // config is an array so loop through each item in the array
                for ( i = 0; i < config.length; i++ ) {
                    current = config[ i ];

                    if ( typeof current === "string" ) {
                        delete collection[ current ];
                    } else {
                        delete collection[ current.name ];
                    }
                }
            } else if ( config ) {
                // config is an object so use that signature
                delete collection[ config.name ];
            }

            // reset the collection instance
            this._setCollection( collection );

            return this;
        }
    };

    /**
     * aerogear.isArray( obj ) -> Boolean
     * - obj (Mixed): This can be any object to test
     *
     * Utility function to test if an object is an Array
     **/
    aerogear.isArray = function( obj ) {
        return ({}).toString.call( obj ) === "[object Array]";
    };
})( this );
