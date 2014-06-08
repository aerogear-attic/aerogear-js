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
            this.resolver = function() {
                ok( true, "resolved promise" );
                start();
            };
        },
        teardown: function () {
            this.server.restore();
        }
    });

    asyncTest( "GET - with success promise", function() {
        this.server.respondWith( "GET", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        AeroGear.ajax( this.settings ).then( this.resolver );
        this.server.respond();
    });

    asyncTest( "POST - with success promise", function() {
        this.server.respondWith( "POST", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "POST";

        AeroGear.ajax( this.settings ).then( this.resolver );
        this.server.respond();
    });

    asyncTest( "PUT - with success promise", function() {
        this.server.respondWith( "PUT", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "PUT";

        AeroGear.ajax( this.settings ).then( this.resolver );
        this.server.respond();
    });

    asyncTest( "DELETE - with success promise", function() {
        this.server.respondWith( "DELETE", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "DELETE";

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
            this.rejector = function() {
                ok( true, "rejected promise" );
                start();
            };
        },
        teardown: function () {
            this.server.restore();
        }
    });

    asyncTest( "GET - with error promise", function() {
        this.server.respondWith( "GET", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        AeroGear.ajax( this.settings ).catch( this.rejector );
        this.server.respond();
    });

    asyncTest( "POST - with error promise", function() {
        this.server.respondWith( "POST", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "POST";

        AeroGear.ajax( this.settings ).catch( this.rejector );
        this.server.respond();
    });

    asyncTest( "PUT - with error promise", function() {
        this.server.respondWith( "PUT", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "PUT";

        AeroGear.ajax( this.settings ).catch( this.rejector );
        this.server.respond();
    });

    asyncTest( "DELETE - with error promise", function() {
        this.server.respondWith( "DELETE", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "DELETE";

        AeroGear.ajax( this.settings ).catch( this.rejector );
        this.server.respond();
    });

    asyncTest( "GET - with error promise - not using catch", function() {
        this.server.respondWith( "GET", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        AeroGear.ajax( this.settings ).then( null, this.rejector );
        this.server.respond();
    });

    asyncTest( "POST - with error promise - not using catch", function() {
        this.server.respondWith( "POST", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "POST";

        AeroGear.ajax( this.settings ).then( null, this.rejector );
        this.server.respond();
    });

    asyncTest( "PUT - with error promise - not using catch", function() {
        this.server.respondWith( "PUT", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "PUT";

        AeroGear.ajax( this.settings ).then( null, this.rejector );
        this.server.respond();
    });

    asyncTest( "DELETE - with error promise - not using catch", function() {
        this.server.respondWith( "DELETE", "/api", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "DELETE";

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
        // the queryString params should not be considered from aerogear.ajax since the request type is not GET
        this.server.respondWith( "POST", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "POST";

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "PUT - application/json with queryString parameters", function() {
        // the queryString params should not be considered from aerogear.ajax since the request type is not GET
        this.server.respondWith( "PUT", "/api", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ key: "value" })]);

        this.settings.type = "PUT";

        AeroGear.ajax( this.settings );
        this.server.respond();
    });

    asyncTest( "DELETE - application/json with queryString parameters", function() {
        // the queryString params should not be considered from aerogear.ajax since the request type is not GET
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

})( jQuery );
