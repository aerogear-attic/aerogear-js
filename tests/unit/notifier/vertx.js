(function( $ ) {

module( "Notifier: Vert.x" );

test( "create - string (Vert.x is default adapter so a string name is also allowed)", function() {
    expect( 2 );

    var vertx = AeroGear.Notifier("createTest").clients;

    equal( Object.keys( vertx ).length, 1, "1 Client created" );
    equal( Object.keys( vertx )[ 0 ], "createTest", "Client Name createTest" );
});

test( "create - object", function() {
    expect( 2 );

    var vertx = AeroGear.Notifier({
        name: "createTest",
        type: "vertx"
    }).clients;

    equal( Object.keys( vertx ).length, 1, "1 Client created" );
    equal( Object.keys( vertx )[ 0 ], "createTest", "Client Name createTest" );
});

test( "create - array", function() {
    expect( 3 );

    var vertx = AeroGear.Notifier([
    "createTest",
    {
        name: "createTest2",
        type: "vertx"
    }]).clients;

    equal( Object.keys( vertx ).length, 2, "2 Clients created" );
    equal( Object.keys( vertx )[ 0 ], "createTest", "Client Name createTest" );
    equal( Object.keys( vertx )[ 1 ], "createTest2", "Client Name createTest2" );
});

// Add client test
test( "add method - string", function() {
    expect( 2 );

    var vertx = AeroGear.Notifier().add("addTest").clients;
    equal( Object.keys( vertx ).length, 1, "Single Client added" );
    equal( Object.keys( vertx )[ 0 ], "addTest", "Client Name addTest" );
});

test( "add method - object", function() {
    expect( 2 );

    var vertx = AeroGear.Notifier().add({
        name: "addTest",
        type: "vertx"
    }).clients;
    equal( Object.keys( vertx ).length, 1, "Single Client added" );
    equal( Object.keys( vertx )[ 0 ], "addTest", "Client Name addTest" );
});

// Remove client test
test( "remove method", function() {
    expect( 3 );

    var vertx = AeroGear.Notifier("removeTest");
    equal( Object.keys( vertx.clients ).length, 1, "Single Client added" );

    vertx.remove("removeTest");
    equal( Object.keys( vertx.clients ).length, 0, "Single Client removed" );
    equal( vertx.clients.removeTest, undefined, "Removed client is really gone" );
});

})( jQuery );
