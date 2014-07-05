(function( $ ) {

    module( "UnifiedPush Client - General" );

    test( "create - New UnifiedPush Client with no arguments", function() {
        expect( 1 );

        raises( function() {
                AeroGear.UnifiedPushClient();
            },
            "UnifiedPushClientException",
            "throws UnifiedPushClientException"
        );
    });

    test( "create - New UnifiedPush Client with 1 argument", function() {
        expect( 1 );

        raises( function() {
                AeroGear.UnifiedPushClient( "Arg" );
            },
            "UnifiedPushClientException",
            "throws UnifiedPushClientException"
        );
    });

    test( "create - New UnifiedPush Client with 2 arguments", function() {
        expect( 1 );

        raises( function() {
                AeroGear.UnifiedPushClient( "Arg", "Secret" );
            },
            "UnifiedPushClientException",
            "throws UnifiedPushClientException"
        );
    });

    test( "create - New UnifiedPush Client with arguments", function() {
        expect(3);

        var client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "URL" );

        equal( client instanceof AeroGear.UnifiedPushClient, true, "client should be an instance of UPS Client" );
        equal( client.hasOwnProperty( "registerWithPushServer" ), true, "client should have a registerWithPushServer method" );
        equal( client.hasOwnProperty( "unregisterWithPushServer" ), true, "client should have a unregisterWithPushServer method" );
    });

    module( "UnifiedPush Client - Register and UnRegister", {
        setup: function() {
            var that = this;
            this.requests = [];
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.xhr.onCreate = function( xhr ) {
                that.requests.push( xhr );
            };
        },
        teardown: function() {
            this.xhr.restore();
        }
    });

    test( "call register with no device token", function() {
        expect(1);

        raises( function() {
                AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "URL" ).registerWithPushServer();
            },
            "UnifiedPushRegistrationException",
            "throws UnifiedPushRegistrationException"
        );
    });

    test( "call register with proper settings", function() {
        expect(4);

        var client, settings, ret;

        settings = {};

        settings.metadata = {
            deviceToken: "12345"
        };

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserver" );

        ret = client.registerWithPushServer( settings );
        var request = this.requests[0];

        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );
        equal( request.url, "/api/pushserver" + "/rest/registry/device", "request.url should be the concatenation of push server url and device registry url" );
        equal( request.method, "POST", "request.method should a POST request" );
        equal( JSON.parse( request.requestBody ).deviceToken, "12345", "request body should have a request token param" );

    });

    test( "call unregister", function() {
        expect(3);

        var client, settings, ret,
            deviceToken = "12345";

        settings = {};

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserver" );

        ret = client.unregisterWithPushServer( deviceToken, settings );
        var request = this.requests[0];

        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );
        equal( request.url, "/api/pushserver" + "/rest/registry/device/" + deviceToken, "request.url should be the concatenation of push server url, device registry url and device token" );
        equal( request.method, "DELETE", "request.method should a DELETE request" );

    });

    module( "UnifiedPush Client - Register fake server", {
       setup: function () {
            var testData = {
                "id": "402880e43fa95bb3013fa960f9ee0002",
                "deviceToken": "12345"
            };
            this.server = sinon.fakeServer.create();
            this.server.respondWith( "POST", "/api/pushserver/rest/registry/device", [ 200, { "Content-Type": "application/json" }, JSON.stringify(testData)]);
        },
        teardown: function () {
            this.server.restore();
        }
    });

    asyncTest( "register successfully with a promise", function() {
        expect(2);

        var client, settings, ret;

        settings = {};

        settings.metadata = {
            deviceToken: "12345"
        };

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserver" );

        ret = client.registerWithPushServer( settings );
        this.server.respond();

        ret.then(
            function( promiseValue ) {
                equal( promiseValue.agXHR.status, 200, "should be a 200" );
                start();
            }
        );

        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );

    });

    asyncTest( "register unsuccessfully with a promise", function() {
        expect(2);

        var client, settings, ret;

        settings = {};

        settings.metadata = {
            deviceToken: "12345"
        };

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserv" );

        ret = client.registerWithPushServer( settings );
        this.server.respond();

        ret.catch(
            function( promiseValue ) {
                equal( promiseValue.agXHR.status, 404, "should be a 404" );
                start();
            }
        );

        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );

    });

    asyncTest( "register successfully with a callback", function() {
        expect(2);

        var client, settings, ret;

        settings = {
            success: function( data, statusText, request ) {
                equal( request.status, 200, "should be a 200" );
                start();
            }
        };

        settings.metadata = {
            deviceToken: "12345"
        };

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserver" );

        ret = client.registerWithPushServer( settings );
        this.server.respond();


        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );

    });

    asyncTest( "register unsuccessfully with a callback", function() {
        expect(2);

        var client, settings, ret;

        settings = {
            error: function( error, statusText, request ) {
                equal( request.status, 404, "should be a 404" );
                start();
            }
        };

        settings.metadata = {
            deviceToken: "12345"
        };

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserv" );

        ret = client.registerWithPushServer( settings );
        this.server.respond();
        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );

    });

    asyncTest( "register with complete callback", function() {
        expect(2);

        var client, settings, ret;

        settings = {
            complete: function( status, request ) {
                ok( true, "complete should be called" );
                start();
            }
        };

        settings.metadata = {
            deviceToken: "12345"
        };

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserver" );

        ret = client.registerWithPushServer( settings );
        this.server.respond();


        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );

    });

     module( "UnifiedPush Client - Register fake server", {
       setup: function () {
            this.server = sinon.fakeServer.create();
            this.server.respondWith( "DELETE", "/api/pushserver/rest/registry/device/12345", [ 204, { "Content-Type": "application/json" }, JSON.stringify({})]);
        },
        teardown: function () {
            this.server.restore();
        }
    });

    asyncTest( "unregister successfully with a promise", function() {
        expect(2);

        var client, settings, ret,
            deviceToken = "12345";

        settings = {};

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserver" );

        ret = client.unregisterWithPushServer( deviceToken, settings );
        this.server.respond();

        ret.then(
            function( promiseValue ) {
                equal( promiseValue.agXHR.status, 204, "should be a 204" );
                start();
            }
        );

        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );
    });

    asyncTest( "register unsuccessfully with a promise", function() {
        expect(2);

        var client, settings, ret;

        settings = {};

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserv" );

        ret = client.unregisterWithPushServer( settings );
        this.server.respond();

        ret.catch(
            function( promiseValue ) {
                equal( promiseValue.agXHR.status, 404, "should be a 404" );
                start();
            }
        );

        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );

    });

    asyncTest( "unregister successfully with a callback", function() {
        expect(2);

        var client, settings, ret,
            deviceToken = "12345";

        settings = {
            success: function( data, statusText, request ) {
                equal( request.status, 204, "should be a 204" );
                start();
            }
        };

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserver" );

        ret = client.unregisterWithPushServer( deviceToken, settings );
        this.server.respond();


        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );
    });

    asyncTest( "unregister unsuccessfully with a callback", function() {
        expect(2);

        var client, settings, ret;

        settings = {
            error: function( error, statusText, request ) {
                equal( request.status, 404, "should be a 404" );
                start();
            }
        };

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserv" );

        ret = client.unregisterWithPushServer( "123", settings );
        this.server.respond();
        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );

    });

    asyncTest( "register with complete callback", function() {
        expect(2);

        var client, settings, ret,
            deviceToken = "12345";

        settings = {
            complete: function( status, request ) {
                ok( true, "complete should be called" );
                start();
            }
        };

        client = AeroGear.UnifiedPushClient( "VARIANT_ID", "SECRET", "/api/pushserver" );

        ret = client.unregisterWithPushServer( deviceToken, settings );
        this.server.respond();


        equal( ret instanceof Promise, true, "the return value should be an es6 promise" );
    });

})( jQuery );
