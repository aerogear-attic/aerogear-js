(function( AeroGear, $, undefined ) {
    /**
        The AeroGear.Pipeline provides a persistence API that is protocol agnostic and does not depend on any certain data model. Through the use of adapters, this library provides common methods like read, save and delete that will just work.
        @constructs AeroGear.Pipeline
        @param {String|Array|Object} [config] - A configuration for the pipe(s) being created along with the Pipeline. If an object or array containing objects is used, the objects can have the following properties:
        @param {String} config.name - the name that the pipe will later be referenced by
        @param {String} [config.type="rest"] - the type of pipe as determined by the adapter used
        @param {String} [config.recordId="id"] - the identifier used to denote the unique id for each record in the data associated with this pipe
        @param {Object} [config.settings={}] - the settings to be passed to the adapter
        @returns {Object} pipeline - The created Pipeline containing any pipes that may have been created
        @example
        // Create an empty Pipeline
        var pl = AeroGear.Pipeline();

        // Create a single pipe using the default adapter
        var pl2 = AeroGear.Pipeline( "tasks" );

        // Create multiple pipes using the default adapter
        var pl3 = AeroGear.Pipeline( [ "tasks", "projects" ] );
     */
    AeroGear.Pipeline = function( config ) {
        // Allow instantiation without using new
        if ( !( this instanceof AeroGear.Pipeline ) ) {
            return new AeroGear.Pipeline( config );
        }
        var pipeline = $.extend( {}, AeroGear, {
            lib: "Pipeline",
            type: config ? config.type || "Rest" : "Rest",
            collectionName: "pipes"
        });

        return pipeline.add( config );
    };

    /**
        The adapters object is provided so that adapters can be added to the AeroGear.Pipeline namespace dynamically and still be accessible to the add method
        @augments AeroGear.Pipeline
     */
    AeroGear.Pipeline.adapters = {};
})( AeroGear, jQuery );
