(function( $ ) {

    module( "AeroGear.ajax - fake xhr", {
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

    test( "Default Request", function() {
        expect(2);
        var settings = {};

        var ret = AeroGear.ajax( settings );
        var request = this.requests[0];
        console.log( request );
        equal( request.method, "GET", "should be a GET request" );
        equal( ret instanceof Promise, true, "AeroGear.ajax should return a promise" );
    });

    test( "GET Request", function() {
        expect(2);
        var settings = {};

        settings.type = "GET";

        var ret = AeroGear.ajax( settings );
        var request = this.requests[0];

        equal( request.method, "GET", "should be a GET request" );
        equal( ret instanceof Promise, true, "AeroGear.ajax should return a promise" );
    });

    test( "POST Request", function() {
        expect(2);
        var settings = {};

        settings.type = "POST";

        var ret = AeroGear.ajax( settings );
        var request = this.requests[0];

        equal( request.method, "POST", "should be a POST request" );
        equal( ret instanceof Promise, true, "AeroGear.ajax should return a promise" );
    });

    test( "PUT Request", function() {
        expect(2);
        var settings = {};

        settings.type = "PUT";

        var ret = AeroGear.ajax( settings );
        var request = this.requests[0];

        equal( request.method, "PUT", "should be a PUT request" );
        equal( ret instanceof Promise, true, "AeroGear.ajax should return a promise" );
    });

    test( "DELETE Request", function() {
        expect(2);
        var settings = {};

        settings.type = "DELETE";

        var ret = AeroGear.ajax( settings );
        var request = this.requests[0];

        equal( request.method, "DELETE", "should be a DELETE request" );
        equal( ret instanceof Promise, true, "AeroGear.ajax should return a promise" );
    });

    test( "Headers in Request", function() {
        expect(3);
        var settings = {};

        settings.headers = {
            "HEADER_KEY": "HEADER_VALUE",
            "COOL_HEADER": "COOL_HEADER_VALUE"
        };

        var ret = AeroGear.ajax( settings );
        var request = this.requests[0];

        equal( request.requestHeaders.HEADER_KEY, "HEADER_VALUE", "HEADER_VALUE should be in he HEADER" );
        equal( request.requestHeaders.COOL_HEADER, "COOL_HEADER_VALUE", "COOL_HEADER_VALUE should be in he HEADER" );
        equal( ret instanceof Promise, true, "AeroGear.ajax should return a promise" );
    });
    
    test( "POST - application/x-www-form-urlencoded with query params and data", function() {
        expect(5);
        var settings = {};

        settings.type = 'POST';
        settings.dataType = "application/x-www-form-urlencoded";
        settings.contentType = "application/x-www-form-urlencoded";
        settings.params = {
            param1: 'val1',
            'param 2': 'val 2'
        };
        settings.data = {
            param3: 'val3'
        };
        settings.url = '/api';

        var ret = AeroGear.ajax( settings ),
            request = this.requests[0],
            requestBodyParamPairs = request.requestBody.split('&');
        
        equal( requestBodyParamPairs.length, 3, '3 parameters should have been sent' );
        ok( requestBodyParamPairs.indexOf( 'param1=val1' ) !== -1, 'param1 should have been sent' );
        ok( requestBodyParamPairs.indexOf( 'param%202=val%202' ) !== -1, 'param2 should have been sent' );
        ok( requestBodyParamPairs.indexOf( 'param3=val3') !== -1, 'param3 should have been sent' );
        equal( request.url, '/api', 'params are not added in URL since request is not GET' );
    });

    test( "POST - application/json with query params and data", function() {
        expect(4);
        var settings = {};

        settings.type = 'POST';
        settings.dataType = "application/x-www-form-urlencoded";
        settings.contentType = "application/json";
        settings.params = {
            param1: 'val1',
            'param 2': 'val 2'
        };
        settings.data = {
            param3: 'val3'
        };
        settings.url = '/api';

        var ret = AeroGear.ajax( settings ),
            request = this.requests[0];

        equal( request.requestBody.param3 , 'val3', 'param3 should have been sent' );
        equal( request.requestBody.params.param1 , 'val1', 'param1 should have been sent' );
        equal( request.requestBody.params[ 'param 2' ], 'val 2', 'param2 should have been sent' );
        equal( request.url, '/api', 'params are not added in URL since request is not GET' );
    });

    module( "AeroGear.ajax -  fake server - success callbacks", {
        setup: function() {
            this.server = sinon.fakeServer.create();
            this.settings = {
                url: "/api",
                success: function() {
                    ok( true, "success callback should be called" );
                    start();
                }
            };
        },
        teardown: function () {
            this.server.restore();
        }
    });

    asyncTest( "GET - with success callback", function() {
        this.server.respondWith( "GET", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "POST - with success callback", function() {
        this.server.respondWith( "POST", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "POST";

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "PUT - with success callback", function() {
        this.server.respondWith( "PUT", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "PUT";

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "DELETE - with success callback", function() {
        this.server.respondWith( "DELETE", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({})]);

        this.settings.type = "DELETE";

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    module( "AeroGear.ajax -  fake server - success promises", {
        setup: function() {
            this.server = sinon.fakeServer.create();
            this.settings = {
                url: "/api"
            };
        },
        teardown: function () {
            this.server.restore();
        }
    });

    asyncTest( "GET - with success promise", function() {
        expect(5);
        
        this.server.respondWith( "GET", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.resolver = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "OK", "statusText is OK in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).then( this.resolver );
        this.server.respond();
    });

    asyncTest( "POST - with success promise", function() {
        expect(5);

        this.server.respondWith( "POST", "/api", [ 201, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "POST";

        this.resolver = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "Created", "statusText is Created in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).then( this.resolver );
        this.server.respond();
    });

    asyncTest( "PUT - with success promise", function() {
        expect(5);
        this.server.respondWith( "PUT", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "PUT";

        this.resolver = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "OK", "statusText is OK in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).then( this.resolver );
        this.server.respond();
    });

    asyncTest( "DELETE - with success promise", function() {
        expect(5);
        this.server.respondWith( "DELETE", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "DELETE";

        this.resolver = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "OK", "statusText is OK in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).then( this.resolver );
        this.server.respond();
    });

    module( "AeroGear.ajax -  fake server - error callbacks", {
        setup: function() {
            this.server = sinon.fakeServer.create();
            this.settings = {
                url: "/api",
                error: function() {
                    ok( true, "error callback should be called" );
                    start();
                }
            };
        },
        teardown: function () {
            this.server.restore();
        }
    });

    asyncTest( "GET - with error callback", function() {
        this.server.respondWith( "GET", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "POST - with error callback", function() {
        this.server.respondWith( "POST", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "POST";

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "PUT - with error callback", function() {
        this.server.respondWith( "PUT", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "PUT";

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "DELETE - with error callback", function() {
        this.server.respondWith( "DELETE", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "DELETE";

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    module( "AeroGear.ajax -  fake server - reject promises", {
        setup: function() {
            this.server = sinon.fakeServer.create();
            this.settings = {
                url: "/api"
            };
        },
        teardown: function () {
            this.server.restore();
        }
    });

    asyncTest( "GET - with error promise", function() {
        expect(5);
        this.server.respondWith( "GET", "/api", [ 401, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.rejector = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "Unauthorized", "statusText is Unauthorized in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).catch( this.rejector );
        this.server.respond();
    });

    asyncTest( "POST - with error promise", function() {
        expect(5);
        this.server.respondWith( "POST", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "POST";

        this.rejector = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "Bad Request", "statusText is Bad Request in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).catch( this.rejector );
        this.server.respond();
    });

    asyncTest( "PUT - with error promise", function() {
        expect(5);
        this.server.respondWith( "PUT", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "PUT";

        this.rejector = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "Bad Request", "statusText is Bad Request in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).catch( this.rejector );
        this.server.respond();
    });

    asyncTest( "DELETE - with error promise", function() {
        expect(5);
        this.server.respondWith( "DELETE", "/api", [ 500, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "DELETE";
        
        this.rejector = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "Internal Server Error", "statusText is Internal Server Error in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).catch( this.rejector );
        this.server.respond();
    });

    asyncTest( "GET - with error promise - not using catch", function() {
        expect(5);
        
        this.server.respondWith( "GET", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.rejector = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "Bad Request", "statusText is Bad Request in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).then( null, this.rejector );
        this.server.respond();
    });

    asyncTest( "POST - with error promise - not using catch", function() {
        expect(5);
        this.server.respondWith( "POST", "/api", [ 401, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "POST";

        this.rejector = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "Unauthorized", "statusText is Unauthorized in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).then( null, this.rejector );
        this.server.respond();
    });

    asyncTest( "PUT - with error promise - not using catch", function() {
        expect(5);
        this.server.respondWith( "PUT", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "PUT";

        this.rejector = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "Bad Request", "statusText is Bad Request in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).then( null, this.rejector );
        this.server.respond();
    });

    asyncTest( "DELETE - with error promise - not using catch", function() {
        expect(5);
        this.server.respondWith( "DELETE", "/api", [ 500, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "DELETE";

        this.rejector = function( promiseValue ) {
            ok( true, "resolved promise" );
            ok( promiseValue, "promise value exists" );
            equal( promiseValue.data.key, "value", "data exists in promise value" );
            equal( promiseValue.statusText, "Internal Server Error", "statusText is Internal Server Error in promise value" );
            ok( promiseValue.agXHR instanceof XMLHttpRequest, "agXHR exists in promise value and is instance of XMLHttpRequest" );
            start();
        };

        AeroGear.ajax( this.settings ).then( null, this.rejector );
        this.server.respond();
    });

    module( "AeroGear.ajax - fake server - queryString params", {
        setup: function() {
            this.server = sinon.fakeServer.create();
            this.settings = {
                url: "/api",
                params : {
                    project: "aerogear",
                    library: "aerogear-js",
                    // used to test the URI encoding
                    'module $': "aerogear ajax"
                },
                success: function() {
                    ok( true, "success callback should be called" );
                    start();
                }
            };
        },
        teardown: function () {
            this.server.restore();
        }
    });

    asyncTest( "GET - application/json with queryString parameters", function() {
        this.server.respondWith( "GET", "/api?project=aerogear&library=aerogear-js&module%20%24=aerogear%20ajax", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "POST - application/json with queryString parameters", function() {
        this.server.respondWith( "POST", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "POST";

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "PUT - application/json with queryString parameters", function() {
        this.server.respondWith( "PUT", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "PUT";

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "DELETE - application/json with queryString parameters", function() {
        this.server.respondWith( "DELETE", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({})]);

        this.settings.type = "DELETE";

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "GET - text/plain with queryString parameters", function() {
        this.server.respondWith( "GET", "/api?project=aerogear&library=aerogear-js&module%20%24=aerogear%20ajax", [ 200, { "Content-Type": "text/plain" }, JSON.stringify({ key: "value" })]);

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "GET - application/x-www-form-urlencoded with queryString parameters", function() {
        this.server.respondWith( "GET", "/api?project=aerogear&library=aerogear-js&module%20%24=aerogear%20ajax", [ 200, { "Content-Type": "application/x-www-form-urlencoded" }, JSON.stringify({ key: "value" })]);

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    module("AeroGear.ajax - Callbacks", {
        setup: function () {
            this.server = sinon.fakeServer.create();
        },
        teardown: function () {
            this.server.restore();
        }
    });

    asyncTest("AeroGear.ajax - Callbacks - Success", function () {
        expect(4);

        this.server.respondWith( "POST", "auth/login", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ username: "bob", logged: true })]);

        var values = {
            username: "bob",
            password: "123"
        };

        AeroGear.ajax({
            contentType: "application/json",
            dataType: "json",
            url: 'auth/login',
            type: 'POST',
            success: function (data, statusText, agXHR) {
                equal(statusText, "OK", "OK Code");
                equal(data.username, "bob", "Login username is bob");
                equal(data.logged, true, "Login logged is true");
                ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
                start();
            },
            data: values
        });

        this.server.respond();
    });

    asyncTest("AeroGear.ajax - Callbacks - Failure", function () {
        expect(3);

        this.server.respondWith( "POST", "auth/login", [ 401, { "Content-Type": "application/json" }, JSON.stringify({ message: "User authentication failed" })]);

        var values = {
            username: "bob",
            password: "123"
        };

        AeroGear.ajax({
            contentType: "application/json",
            dataType: "json",
            url: 'auth/login',
            type: 'POST',
            error: function (data, statusText, agXHR) {
                equal(statusText, "Unauthorized", "Unauthorized Code");
                equal(data.message, "User authentication failed", "Login Failure Message");
                ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
                start();
            },
            data: values
        });

        this.server.respond();
    });

    asyncTest("AeroGear.ajax - Callbacks - Complete", function () {
        expect(2);

        this.server.respondWith( "POST", "auth/login", [ 401, { "Content-Type": "application/json" }, JSON.stringify({ message: "User authentication failed" })]);

        var values = {
            username: "bob",
            password: "123"
        };

        AeroGear.ajax({
            contentType: "application/json",
            dataType: "json",
            url: 'auth/login',
            type: 'POST',
            complete: function (statusText, agXHR) {
                equal(statusText, "complete", "statusText complete");
                ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
                start();
            },
            data: values
        });

        this.server.respond();
    });
})( jQuery );
