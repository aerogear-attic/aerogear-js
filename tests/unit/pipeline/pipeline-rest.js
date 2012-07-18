(function( $ ) {

module( "pipeline: rest" );

// Pipe to be used for all tests
var pipe = aerogear.pipeline( "tasks" ).tasks;

// Use mockjax to intercept the rest calls and return data to the tests
$.mockjax({
    url: 'tasks',
    responseText: [
        {
            id: 12345,
            data: {
                title: "Do Something",
                date: "2012-08-01"
            }
        },
        {
            id: 67890,
            data: {
                title: "Do Something Else",
                date: "2012-08-02"
            }
        }
    ]
});

$.mockjax({
    url: 'tasks',
    data: { limit: 1 },
    responseText: [
        {
            id: 12345,
            data: {
                title: "Do Something",
                date: "2012-08-01"
            }
        }
    ]
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

})( jQuery );