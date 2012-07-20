(function( $ ) {

module( "pipeline: rest" );

test( "create - name string", function() {
    expect( 3 );

    var pipe = aerogear.pipeline( "createTest1" ).pipes;
    equal( Object.keys( pipe ).length, 1, "Single Pipe created" );
    equal( Object.keys( pipe )[ 0 ], "createTest1", "Pipe Name createTest1" );
    equal( pipe.createTest1.type, "rest", "Default pipe type (rest)" );
});

test( "create - name array", function() {
    expect( 7 );

    var pipe = aerogear.pipeline([
        "createTest21",
        {
            name: "createTest22",
            type: "rest",
            recordId: "testId",
            settings: {
                url: "testURL"
            }
        },
        "createTest23"
    ]).pipes;

    equal( Object.keys( pipe ).length, 3, "3 Pipes created" );
    equal( Object.keys( pipe )[ 0 ], "createTest21", "Pipe Name createTest21" );
    equal( Object.keys( pipe )[ 1 ], "createTest22", "Pipe Name createTest22" );
    equal( Object.keys( pipe )[ 2 ], "createTest23", "Pipe Name createTest23" );
    equal( pipe.createTest21.type, "rest", "Default pipe type (rest)" );
    equal( pipe.createTest22.type, "rest", "Specified pipe type (rest)" );
    equal( pipe.createTest23.type, "rest", "Default pipe type (rest)" );
});

test( "create - object", function() {
    expect( 10 );

    var pipe = aerogear.pipeline([
        {
            name: "createTest31"
        },
        {
            name: "createTest32",
            recordId: "testId",
            settings: {
                url: "testURL"
            }
        },
        {
            name: "createTest33",
            type: "rest",
            recordId: "testId",
            settings: {
                url: "testURL"
            }
        }
    ]).pipes;

    equal( Object.keys( pipe ).length, 3, "3 Pipes created" );
    equal( Object.keys( pipe )[ 0 ], "createTest31", "Pipe Name createTest31" );
    equal( Object.keys( pipe )[ 1 ], "createTest32", "Pipe Name createTest32" );
    equal( Object.keys( pipe )[ 2 ], "createTest33", "Pipe Name createTest33" );
    equal( pipe.createTest31.type, "rest", "Default pipe type (rest)" );
    equal( pipe.createTest31.recordId, "id", "Default recordId (id)" );
    equal( pipe.createTest32.type, "rest", "Default pipe type (rest)" );
    equal( pipe.createTest32.recordId, "testId", "Specified recordId (testId)" );
    equal( pipe.createTest33.type, "rest", "Specified pipe type (rest)" );
    equal( pipe.createTest33.recordId, "testId", "Specified recordId (testId)" );
});


// Pipe to be used for all remaining tests
var pipeline = aerogear.pipeline( "tasks" ),
    pipe = pipeline.pipes.tasks;

test( "add method", function() {
    expect( 3 );

    var pipe = pipeline.add( "addTest" ).pipes;
    equal( Object.keys( pipe ).length, 2, "Single Pipe added" );
    equal( Object.keys( pipe )[ 1 ], "addTest", "Pipe Name addTest" );
    equal( pipe.addTest.type, "rest", "Default pipe type (rest)" );
});

test( "remove method", function() {
    expect( 2 );

    var pipe = pipeline.remove( "addTest" ).pipes;
    equal( Object.keys( pipe ).length, 1, "Single Pipe removed" );
    equal( pipe.addTest, undefined, "Removed pipe is really gone" );
});

asyncTest( "read method", function() {
    expect( 3 );

    var read1 = pipe.read({
        ajax: {
            success: function( data, textStatus, jqXHR ) {
                equal( data[ 1 ].id, 67890, "Read all data" );
            }
        }
    });

    var read2 = pipe.read({
        data: { limit: 1 },
        ajax: {
            success: function( data, textStatus, jqXHR ) {
                equal( data[ 0 ].id, 12345, "Read only first record - data option" );
            }
        }
    });

    var read3 = pipe.read({
        ajax: {
            data: { limit: 1 },
            success: function( data, textStatus, jqXHR ) {
                equal( data[ 0 ].id, 12345, "Read only first record - ajax data option" );
            }
        }
    });

    $.when( read1, read2, read3 ).done( function( r1, r2, r3 ) {
        start();
    });
});

asyncTest( "save method", function() {
    expect( 2 );

    var save1 = pipe.save({
        title: "New Task",
        date: "2012-08-01"
    },
    {
        ajax: {
            success: function( data, textStatus, jqXHR ) {
                equal( data[ 0 ].id, 11223, "POST - new data" );
            }
        }
    });

    var save2 = pipe.save({
        id: 11223,
        data: {
            title: "Updated Task",
            date: "2012-08-01"
        }
    },
    {
        ajax: {
            success: function( data, textStatus, jqXHR ) {
                ok( true, "PUT - update existing data" );
            }
        }
    });

    $.when( save1, save2 ).done( function( s1, s2 ) {
        start();
    });
});

asyncTest( "delete method", function() {
    expect( 3 );

    var delete1 = pipe.delete({
        ajax: {
            success: function( data, textStatus, jqXHR ) {
                ok( true, "DELETE - all data at end of this pipe" );
            }
        }
    });

    var delete2 = pipe.delete({
        record: 11223,
        ajax: {
            success: function( data, textStatus, jqXHR ) {
                ok( true, "DELETE - single record using default record identifier" );
            }
        }
    });

    var delete3 = pipe.delete({
        record: {
            taskID: 11223
        },
        ajax: {
            success: function( data, textStatus, jqXHR ) {
                ok( true, "DELETE - single record using custom record identifier" );
            }
        }
    });

    $.when( delete1, delete2, delete3 ).done( function( d1, d2, d3 ) {
        start();
    });
});

})( jQuery );