(function( aerogear, undefined ) {
    /**
     * aerogear.pipeline
     *
     * The aerogear.pipeline namespace provides a persistence API that is protocol agnostic and does not depend on any certain data model. Through the use of adapters, both provided and custom, user supplied, this library provides common methods like read, save and delete that will just work.
     *
     * `aerogear.pipeline( config[, baseURL] ) -> Object`
     * - **config** (Mixed) - This can be a variety of types specifying how to create the pipe as illustrated below
     * - **baseURL** (String) - The base URL to use for the server location that this pipe should communicate with
     *
     * When passing a pipe configuration object to `add`, the following items can be provided:
     *  - **name** - String (Required), the name that the pipe will later be referenced by
     *  - **type** - String (Optional, default - "rest"), the type of pipe as determined by the adapter used
     *  - **recordId** - String (Optional, default - "id"), the identifier used to denote the unique id for each record in the data associated with this pipe
     *  - **baseURL** - String (Optional, default - ""), the base URL to use in conjunction with the adapter name as the endpoint.
     *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
     *   - Adapters may have a number of varying configuration settings.
     *
     * Returns an object representing a collection of server connections (pipes) and their corresponding data models. This object provides a standard way to communicate with the server no matter the data format or transport expected.
     *
     * ##### Example
     *
     *     // Create a single pipe using the default adapter
     *     var pipeline = aerogear.pipeline( "tasks" );
     *
     *     // Create multiple pipes using the default adapter
     *     var myPipeline = aerogear.pipeline( [ "tasks", "projects" ] );
     **/
    aerogear.pipeline = function( config, baseURL ) {
        function setBaseURL( baseURL, config ) {
            if ( baseURL && config ) {
                if ( config.settings ) {
                    config.settings.baseURL = baseURL;
                } else {
                    config.settings = { baseURL: baseURL };
                }
            }
            var current, i;

            if ( !config || !baseURL ) {
                return config;
            } else if ( typeof config === "string"  ) {
                config = { name: config, settings: { baseURL: baseURL } };
            } else if ( aerogear.isArray( config ) ) {
                for ( i = 0; i < config.length; i++ ) {
                    current = config[ i ];

                    if ( typeof current === "string" ) {
                        config[ i ] = { name: config[ i ], settings: { baseURL: baseURL } };
                    } else if ( config[ i ].settings ) {
                        config[ i ].settings.baseURL = baseURL;
                    } else {
                        config[ i ].settings = { baseURL: baseURL };
                    }
                }
            } else {
                if ( config.settings ) {
                    config.settings.baseURL = baseURL;
                } else {
                    config.settings = { baseURL: baseURL };
                }
            }

            return config;
        }

        var pipeline = {
                lib: "pipeline",
                defaultAdapter: "rest",
                pipes: {},
                /**
                 * aerogear.pipeline#add( config[, baseURL] ) -> Object
                 * - config (Mixed): This can be a variety of types specifying how to create the pipe as illustrated below
                 * - baseURL (String): The base URL to use for the server location that this pipe should communicate with
                 *
                 * When passing a pipe configuration object to `add`, the following items can be provided:
                 *  - **name** - String (Required), the name that the pipe will later be referenced by
                 *  - **type** - String (Optional, default - "rest"), the type of pipe as determined by the adapter used
                 *  - **recordId** - String (Optional, default - "id"), the identifier used to denote the unique id for each record in the data associated with this pipe
                 *  - **settings** - Object (Optional, default - {}), the settings to be passed to the adapter
                 *   - Adapters may have a number of varying configuration settings.
                 *
                 * Returns the full pipeline object with the new pipe(s) added
                 *
                 *     // Add a single pipe using the default configuration (rest).
                 *     aerogear.pipeline.add( String pipeName );
                 *
                 *     // Add multiple pipes all using the default configuration (rest).
                 *     aerogear.pipeline.add( Array[String] pipeNames );
                 *
                 *     // Add one or more pipe configuration objects.
                 *     aerogear.pipeline.add( Object/Array[Object] pipeConfigurations )
                 *
                 * The default pipe type is `rest`. You may also use one of the other provided types or create your own.
                 *
                 * ##### Example
                 *
                 *     var pipeline = aerogear.pipeline();
                 *
                 *     // Add a single pipe using the default adapter
                 *     pipeline = pipeline.add( "tasks" );
                 *
                 *     // Add multiple pipes using the default adapter
                 *     pipeline = pipeline.add( [ "tags", "projects" ] );
                 *
                 **/
                add: function( config, baseURL ) {
                    return aerogear.add.call( this, setBaseURL( baseURL, config ) );
                },
                /**
                 * aerogear.pipeline#remove( toRemove ) -> Object
                 * - toRemove (Mixed): This can be a variety of types specifying the pipe to remove as illustrated below
                 *
                 * Returns the full pipeline object with the specified pipe(s) removed
                 *
                 *     // Remove a single pipe.
                 *     aerogear.pipeline.remove( String pipeName );
                 *
                 *     // Remove multiple pipes.
                 *     aerogear.pipeline.remove( Array[String] pipeNames );
                 *
                 *     // Remove one or more pipes by passing entire pipe objects.
                 *     aerogear.pipeline.remove( Object/Array[Object] pipes )
                 *
                 * ##### Example
                 *
                 *     var pipeline = aerogear.pipeline( [ "projects", "tags", "tasks" ] );
                 *
                 *     // Remove a single pipe
                 *     pipeline.remove( "tasks" );
                 *
                 *     // Remove multiple pipes
                 *     pipeline.remove( [ "tags", "projects" ] );
                 *
                 **/
                remove: function( toRemove ) {
                    return aerogear.remove.call( this, toRemove );
                },
                // Helper function to set pipes
                _setCollection: function( collection ) {
                    this.pipes = collection;
                },
                // Helper function to get the pipes
                _getCollection: function() {
                    return this.pipes;
                }
            };

        return pipeline.add( config, baseURL );
    };

    /**
     * aerogear.pipeline.adapters
     *
     * The adapters object is provided so that adapters can be added to the aerogear.pipeline namespace dynamically and still be accessible to the add method
     **/
    aerogear.pipeline.adapters = {};
})( aerogear );
