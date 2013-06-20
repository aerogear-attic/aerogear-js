(function( $ ) {

module( "Notifier: STOMP Websocket" );

test( "create - object", function() {
    expect( 2 );

    var stomp = AeroGear.Notifier({
        name: "createTest",
        type: "stompws"
    }).clients;

    equal( Object.keys( stomp ).length, 1, "1 Client created" );
    equal( Object.keys( stomp )[ 0 ], "createTest", "Client Name createTest" );
});

test( "create - array", function() {
    expect( 3 );

    var stomp = AeroGear.Notifier([
    {
        name: "createTest",
        type: "stompws"
    },
    {
        name: "createTest2",
        type: "stompws"
    }]).clients;

    equal( Object.keys( stomp ).length, 2, "2 Clients created" );
    equal( Object.keys( stomp )[ 0 ], "createTest", "Client Name createTest" );
    equal( Object.keys( stomp )[ 1 ], "createTest2", "Client Name createTest2" );
});

// Add client test
test( "add method", function() {
    expect( 2 );

    var stomp = AeroGear.Notifier().add({
        name: "addTest",
        type: "stompws"
    }).clients;
    equal( Object.keys( stomp ).length, 1, "Single Client added" );
    equal( Object.keys( stomp )[ 0 ], "addTest", "Client Name addTest" );
});

// Remove client test
test( "remove method", function() {
    expect( 3 );

    var stomp = AeroGear.Notifier({
        name: "removeTest",
        type: "stompws"
    });
    equal( Object.keys( stomp.clients ).length, 1, "Single Client added" );

    stomp.remove("removeTest");
    equal( Object.keys( stomp.clients ).length, 0, "Single Client removed" );
    equal( stomp.clients.removeTest, undefined, "Removed client is really gone" );
});

})( jQuery );
