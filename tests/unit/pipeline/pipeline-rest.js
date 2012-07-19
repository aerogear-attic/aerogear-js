(function( $ ) {

module( "pipeline: rest" );

// Pipe to be used for all tests
var pipe = aerogear.pipeline( "tasks" ).tasks;

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