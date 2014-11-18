import Notifier from 'aerogear.notifier';
import 'mqttws';

(function() {

module( "Notifier: MQTT Websocket" );

test( "create - object", function() {
    expect( 2 );

    var mqtt = Notifier({
        name: "createTest",
        type: "mqttws"
    }).clients;

    equal( Object.keys( mqtt ).length, 1, "1 Client created" );
    equal( Object.keys( mqtt )[ 0 ], "createTest", "Client Name createTest" );
});

test( "create - array", function() {
    expect( 3 );

    var mqtt = Notifier([
    {
        name: "createTest",
        type: "mqttws"
    },
    {
        name: "createTest2",
        type: "mqttws"
    }]).clients;

    equal( Object.keys( mqtt ).length, 2, "2 Clients created" );
    equal( Object.keys( mqtt )[ 0 ], "createTest", "Client Name createTest" );
    equal( Object.keys( mqtt )[ 1 ], "createTest2", "Client Name createTest2" );
});

// Add client test
test( "add method", function() {
    expect( 2 );

    var mqtt = Notifier().add({
        name: "addTest",
        type: "mqttws"
    }).clients;

    equal( Object.keys( mqtt ).length, 1, "Single Client added" );
    equal( Object.keys( mqtt )[ 0 ], "addTest", "Client Name addTest" );
});

// Remove client test
test( "remove method", function() {
    expect( 3 );

    var mqtt = Notifier({
        name: "removeTest",
        type: "mqttws"
    });

    equal( Object.keys( mqtt.clients ).length, 1, "Single Client added" );
    mqtt.remove("removeTest");
    equal( Object.keys( mqtt.clients ).length, 0, "Single Client removed" );
    equal( mqtt.clients.removeTest, undefined, "Removed client is really gone" );
});

})();
