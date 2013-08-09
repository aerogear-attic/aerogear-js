(function( $ ) {

module( "Notifier: SimplePush" );

test( "create - object", function() {
    expect( 2 );

    var sp = AeroGear.Notifier({
        name: "createTest",
        type: "SimplePush"
    }).clients;

    equal( Object.keys( sp ).length, 1, "1 Client created" );
    equal( Object.keys( sp )[ 0 ], "createTest", "Client Name createTest" );
});

test( "create - array", function() {
    expect( 3 );

    var sp = AeroGear.Notifier([
    {
        name: "createTest",
        type: "SimplePush"
    },
    {
        name: "createTest2",
        type: "SimplePush"
    }]).clients;

    equal( Object.keys( sp ).length, 2, "2 Clients created" );
    equal( Object.keys( sp )[ 0 ], "createTest", "Client Name createTest" );
    equal( Object.keys( sp )[ 1 ], "createTest2", "Client Name createTest2" );
});

// Add client test
test( "add method - object", function() {
    expect( 2 );

    var sp = AeroGear.Notifier().add({
        name: "addTest",
        type: "SimplePush"
    }).clients;
    equal( Object.keys( sp ).length, 1, "Single Client added" );
    equal( Object.keys( sp )[ 0 ], "addTest", "Client Name addTest" );
});

// Remove client test
test( "remove method", function() {
    expect( 3 );

    var sp = AeroGear.Notifier({
        name: "removeTest",
        type: "SimplePush"
    });
    equal( Object.keys( sp.clients ).length, 1, "Single Client added" );

    sp.remove("removeTest");
    equal( Object.keys( sp.clients ).length, 0, "Single Client removed" );
    equal( sp.clients.removeTest, undefined, "Removed client is really gone" );
});

})( jQuery );
