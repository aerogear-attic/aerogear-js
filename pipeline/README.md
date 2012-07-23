# AeroGear Pipeline

Pipeline is a JavaScript library that provides a persistence API that is protocol agnostic and does not depend on any certain data model. Through the use of adapters, both provided and custom, user supplied, this library provides common methods like read, save and delete that will just work.

## Features & API

### Pipeline
An object representing a collection of server connections (pipes) and their corresponding data models. This object provides a standard way to communicate with the server no matter the data format or transport expected.

#### Create - aerogear.pipeline( Mixed pipeConfig )
Instantiate `aerogear.pipeline`. A pipeline must have at least one pipe. Create returns a pipeline object containing methods and pipe objects.

* Create a pipeline with a single pipe using the default configuration (rest).
    
    `aerogear.pipeline( String pipeName )`
    
* Create a pipeline with multiple pipes all using the default configuration (rest).
    
    `aerogear.pipeline( Array[String] pipeNames )`
    
* Create a pipeline with one or more pipe configuration objects. 

    `aerogear.pipeline( Object pipeConfigurations )`

    
The default pipe type is `rest`. You may also use one of the other provided types or create your own.

	// Create an instance of aerogear.pipeline with a single pipe
	var myPipeline = aerogear.pipeline( "tasks" );

##### Pipe Configuration
When passing a pipeConfiguration object to aerogear.pipeline, the following items can be provided.

* **name** - String (Required), the name that the pipe will later be referenced by
* **type** - String (Optional, default - "rest"), the type of pipe as determined by the adapter used 
* **options** - Object (Optional, default - {}), the options to be passed to the adapter
  * Adapters may have a number of varying configuration options. [See adapters](#adapters) below.


#### Add pipe - aerogear.pipeline.add( Mixed pipeConfig )
Add one or more pipes to the pipeline. Add can add pipes using the same options as when the pipeline was created by passing either a single pipe name, an array of pipe names or an object with one or more pipe configurations.

	// Add a pipe to the previous created pipeline
	myPipeline.add( "tags" );
	

#### Remove pipe - aerogear.pipeline.remove( Mixed pipeConfig )
Remove one or more pipes from the pipeline. Remove can remove pipes using the same options as when the pipeline was created by passing either a single pipe name, an array of pipe names or an object containing one or more pipes.

	// remove a pipe from the previous created pipeline
	myPipeline.remove( "tags" );


<h2 id="adapters">Adapters</h2>
### REST (Default)
The REST adapter is the default type used when creating a new pipe. It uses jQuery.ajax to communicate with the server. By default, the RESTful endpoint used by this pipe is the app's current context, followed by the pipe name. For example, if the app is running on http://mysite.com/myApp, then a pipe named tasks would use http://mysite.com/myApp/tasks as its REST endpoint.
#### Options
* **ajax** - Object, a hash of key/value pairs can be supplied to jQuery.ajax method via this option.

#### Retrieve data - read( [Object options] )
Retrieve data asynchronously from the server. This function returns a jqXHR which implements the Promise interface. See the [Defered Object](http://api.jquery.com/category/deferred-object/) reference on the jQuery site for more information.
##### Parameters
* **options** - Object (Optional)
  * **data** - Object, a hash of key/value pairs that can be passed to the server as additional information for use when determining what data to return (Optional)
  * **ajax** - Object, a hash of key/value pairs that will be added to or override any ajax settings set during creation of the pipe using this adapter

Example:

	// Use the tasks pipe created earlier
	var myPipe = myPipeline.tasks;
	
    // Get a set of key/value pairs of all data on the server associated with this pipe
    var allData = myPipe.read();
    
    // A data object can be passed to filter the data and in the case of REST,
    // this object is converted to query string parameters which the server can use.
    // The values would be determined by what the server is expecting
    var filteredData = myPipe.read({
    	data: {
    		limit: 10,
    		date: "2012-08-01"
    		…
    	}
    });
    
Example returned data in allData:

	[
		{
			id: 12345
			title: "Do Something",
			date: "2012-08-01",
			…
		},
		{
			id: 67890
			title: "Do Something Else",
			date: "2012-08-02",
			…
		},
		…
	]

#### Save data - save( Object data [, Object, options ] )
Save data to the server. If this is a new object (doesn't have a record identifier provided by the server), the data is created on the server (POST), otherwise, the data on the server is updated (PUT).

##### Parameters
* **data** - Object (Required), For new data, this will be an object representing the data to be saved to teh server. For updating data, a hash of key/value pairs one of which must be the `recordId` you set during creation of the pipe representing the identifier the server will use to update this record and then any other number of pairs representing the data. The data object is then stringified and passed to the server to be processed.
* **options** - Object (Optional), for the rest adapter, an object with a single key/value pair, the key being `ajax`, that will be added to or override any ajax settings set during creation of the pipe using this adapter

Example:

	// Continue use of tasks pipe created earlier
    // Store a new task
    myPipe.save({
    	title: "Created Task",
    	date: "2012-07-13",
    	…
    });
    
    // Pass a success and error callback, in this case using the REST pipe and jQuery.ajax so the functions take the same parameters.
    myPipe.save({
    	title: "Another Created Task",
    	date: "2012-07-13",
    	…
    },
    {
    	ajax: {
    		success: function( data, textStatus, jqXHR ) {
        		console.log( "Success" );
    		},
    		error: function( jqXHR, textStatus, errorThrown ) {
        		console.log( "Error" );
    		}
    	}
    });
    
    // Update an existing piece of data in the allData var we read earlier
    allData[0].data.title = "Updated Task";
    myPipe.save( allData[0] );


#### Delete data - delete( [Mixed options] )
Remove data from the server. Passing nothing will inform the server to remove all data at this pipe's rest endpoint. You may also pass a set of options that is or contains the record identifier of the item you want to delete.

##### Parameters
* **options** - Mixed (Optional), For the rest adapter, if this parameter is provided, one option called `record` must be included. If this record option is a string or a number, it is assumed that it is the id of an object to be deleted and using the recordId set during creation of the pipe, that item will be deleted. If an object is provided, the recordId specified during creation is pulled out of that object to be passed to the server. Also, if options is an object, an `ajax` object that will be added to or override any ajax settings set during creation of the pipe using this adapter may also be provided

	// Continue use of tasks pipe created earlier
	// Remove a particular item from the server, again from allData created above
    myPipe.delete( allData[0].id );
    
    // Delete all data from the server associated with this pipe
    myPipe.delete();


### New Pipes
TODO: This will explain how to create a new custom pipe rather than just using the provided pipes.

## References
* [jQuery.ajax](http://api.jquery.com/jQuery.ajax/)
* API feature inspiration
  * [Amplify.js](http://amplifyjs.com/)