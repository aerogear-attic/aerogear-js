module("authentication - configuration");

test("Custom REST Authentication module init", function () {
    expect(7);

    var auth1 = AeroGear.Auth();

    auth1.add({
        name: "module1",
        settings: {
            baseURL: "http://customURL.com",
            endpoints: {
                enroll: "register",
                login: "go",
                logout: "leave"
            }
        }
    });

    equal(Object.keys(auth1.modules).length, 1, "Single Auth Module Created");
    equal(Object.keys(auth1.modules)[0], "module1", "Module name module1");
    equal(auth1.modules[Object.keys(auth1.modules)[0]].getBaseURL(), "http://customURL.com", "Base URL is http://customURL.com");
    equal(Object.keys(auth1.modules[Object.keys(auth1.modules)[0]].getEndpoints()).length, 3, "Endpoints are set");
    equal(auth1.modules[Object.keys(auth1.modules)[0]].getEndpoints().enroll, "register", "Enroll endpoint is enroll");
    equal(auth1.modules[Object.keys(auth1.modules)[0]].getEndpoints().login, "go", "Login endpoint is go");
    equal(auth1.modules[Object.keys(auth1.modules)[0]].getEndpoints().logout, "leave", "Logout endpoint is leave");
});

test("Authentication init", function () {
    expect(2);

    var auth1 = AeroGear.Auth("auth").modules;

    equal(Object.keys(auth1).length, 1, "Single Auth Module Created");
    equal(Object.keys(auth1)[0], "auth", "Module name auth");
});

module("authentication - agXHR requests", {
    setup: function () {
        this.server = sinon.fakeServer.create();

        Object.defineProperty(this.server.xhr.prototype, "response", {
            get: function() {
                switch ( this.responseType ) {
                    case "json":
                        return JSON.parse( this.responseText );
                    case "arraybuffer":
                        //TODO
                        return undefined;
                    case "blob":
                        //TODO
                        return undefined;
                }
            },
            configurable: true
        });
    },
    teardown: function () {
        this.server.restore();
    }
});

// create an Authenticator to be used for other tests
var restAuth = AeroGear.Auth("auth").modules.auth;

// create a custom Authenticator
var customRestAuth = AeroGear.Auth({
    name: "customModule",
    settings: {
        baseURL: "baseTest/",
        endpoints: {
            enroll: "register",
            login: "go",
            logout: "leave"
        }
    }
}).modules.customModule;

asyncTest("Register - Success", function () {
    expect(5);

    this.server.respondWith( "POST", "auth/enroll", [ 201, { "Content-Type": "application/json" }, JSON.stringify({ username: "john", logged: true })]);

    var values = {
        username: "john",
        password: "1234"
    };

    restAuth.enroll(values, {
        contentType: "application/json",
        dataType: "json",
        success: function (data, statusText, agXHR) {
            ok(true, "Successful Register");
            equal(statusText, "Created", "Status is created");
            equal(data.username, "john", "Username is john");
            equal(data.logged, true, "Logged is true");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });

    this.server.respond();
});

asyncTest("Register - Failure", function () {
    expect(3);

    this.server.respondWith( "POST", "auth/enroll", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ message: "User enrollment failed" })]);

    var values = {
        username: "",
        password: "1234"
    };

    restAuth.enroll(values, {
        contentType: "application/json",
        dataType: "json",
        error: function (data, statusText, agXHR) {
            equal(statusText, "Bad Request", "Bad Request Code");
            equal(data.message, "User enrollment failed", "Enrollment Failure Message");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });
    
    this.server.respond();
});

asyncTest("Register - Custom Authenticator - Success", function () {
    expect(5);

    this.server.respondWith( "POST", "baseTest/register", [ 201, { "Content-Type": "application/json" }, JSON.stringify({ username: "john", logged: true })]);

    var values = {
        username: "john",
        password: "1234"
    };

    customRestAuth.enroll(values, {
        contentType: "application/json",
        dataType: "json",
        success: function (data, statusText, agXHR) {
            ok(true, "Successful Register");
            equal(statusText, "Created", "Status is created");
            equal(data.username, "john", "Username is john");
            equal(data.logged, true, "Logged is true");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });

    this.server.respond();
});

asyncTest("Register - Custom Authenticator - Failure", function () {
    expect(3);

    this.server.respondWith( "POST", "baseTest/register", [ 400, { "Content-Type": "application/json" }, JSON.stringify({ message: "User enrollment failed" })]);

    var values = {
        username: "",
        password: "1234"
    };

    customRestAuth.enroll(values, {
        contentType: "application/json",
        dataType: "json",
        error: function (data, statusText, agXHR) {
            equal(statusText, "Bad Request", "Bad Request Code");
            equal(data.message, "User enrollment failed", "Enrollment Failure Message");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });
    
    this.server.respond();
});

asyncTest("Login - Success", function () {
    expect(4);

    this.server.respondWith( "POST", "auth/login", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ username: "bob", logged: true })]);

    var values = {
        username: "bob",
        password: "123"
    };

    restAuth.login(values, {
        contentType: "application/json",
        dataType: "json",
        success: function (data, statusText, agXHR) {
            equal(statusText, "OK", "OK Code");
            equal(data.username, "bob", "Login username is bob");
            equal(data.logged, true, "Login logged is true");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });

    this.server.respond();
});

asyncTest("Login - Failure", function () {
    expect(3);

    this.server.respondWith( "POST", "auth/login", [ 401, { "Content-Type": "application/json" }, JSON.stringify({ message: "User authentication failed" })]);

    var values = {
        username: "bob",
        password: "123"
    };

    restAuth.login(values, {
        contentType: "application/json",
        dataType: "json",
        error: function (data, statusText, agXHR) {
            equal(statusText, "Unauthorized", "Unauthorized Code");
            equal(data.message, "User authentication failed", "Login Failure Message");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });

    this.server.respond();
});

asyncTest("Login - Custom Authenticator - Success", function () {
    expect(4);

    this.server.respondWith( "POST", "baseTest/go", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ username: "bob", logged: true })]);

    var values = {
        username: "bob",
        password: "123"
    };

    customRestAuth.login(values, {
        contentType: "application/json",
        dataType: "json",
        success: function (data, statusText, agXHR) {
            equal(statusText, "OK", "OK Code");
            equal(data.username, "bob", "Login username is bob");
            equal(data.logged, true, "Login logged is true");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });

    this.server.respond();
});

asyncTest("Login - Custom Authenticator - Failure", function () {
    expect(3);

    this.server.respondWith( "POST", "baseTest/go", [ 401, { "Content-Type": "application/json" }, JSON.stringify({ message: "User authentication failed" })]);

    var values = {
        username: "bob",
        password: "123"
    };

    customRestAuth.login(values, {
        contentType: "application/json",
        dataType: "json",
        error: function (data, statusText, agXHR) {
            equal(statusText, "Unauthorized", "Unauthorized Code");
            equal(data.message, "User authentication failed", "Login Failure Message");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });

    this.server.respond();
});

asyncTest("Logout - Success", function () {
    expect(3);

    this.server.respondWith( "POST", "auth/logout", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ logged: false })]);

    restAuth.logout({
        contentType: "application/json",
        dataType: "json",
        success: function (data, statusText, agXHR) {
            equal(statusText, "OK", "OK Code");
            equal(data.logged, false, "Logout logged is false");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });

    this.server.respond();
});

asyncTest("Logout - Failure", function () {
    expect(3);

    this.server.respondWith( "POST", "auth/logout", [ 500, { "Content-Type": "application/json" }, JSON.stringify({ message: "Server Error" })]);

    restAuth.logout({
        contentType: "application/json",
        dataType: "json",
        error: function (data, statusText, agXHR) {
            equal(statusText, "Internal Server Error", "Internal Server Error Code");
            equal(data.message, "Server Error", "Logout message is Server Error");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });

    this.server.respond();
});

asyncTest("Logout - Custom Authenticator - Success", function () {
    expect(3);

    this.server.respondWith( "POST", "baseTest/leave", [ 200, { "Content-Type": "application/json" }, JSON.stringify({ logged: false })]);

    customRestAuth.logout({
        contentType: "application/json",
        dataType: "json",
        success: function (data, statusText, agXHR) {
            equal(statusText, "OK", "OK Code");
            equal(data.logged, false, "Logout logged is false");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });

    this.server.respond();
});

asyncTest("Logout - Custom Authenticator - Failure", function () {
    expect(3);

    this.server.respondWith( "POST", "baseTest/leave", [ 500, { "Content-Type": "application/json" }, JSON.stringify({ message: "Server Error" })]);

    customRestAuth.logout({
        contentType: "application/json",
        dataType: "json",
        error: function (data, statusText, agXHR) {
            equal(statusText, "Internal Server Error", "Internal Server Error Code");
            equal(data.message, "Server Error", "Logout message is Server Error");
            ok(agXHR instanceof XMLHttpRequest, "agXHR is XMLHttpRequest instance");
            start();
        }
    });

    this.server.respond();
});

module( "authentication - fake xhr", {
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

test("Enroll - Request verification", function () {
    expect(4);

    var values = {
        username: "bob",
        password: "123"
    };

    var authLogin = restAuth.enroll(values, {
        contentType: "application/json",
        dataType: "json"
    });

    var request = this.requests[0];
    
    equal( request.method, "POST", "should be a POST request" );
    equal( request.requestBody.username, "bob", "username should be sent" );
    equal( request.requestBody.password, "123", "password should be sent" );
    equal( authLogin instanceof Promise, true, "should return a promise" );
});

test("Login - Request verification", function () {
    expect(4);

    var values = {
        username: "bob",
        password: "123"
    };

    var authLogin = restAuth.login(values, {
        contentType: "application/json",
        dataType: "json"
    });

    var request = this.requests[0];
    
    equal( request.method, "POST", "should be a POST request" );
    equal( request.requestBody.username, "bob", "username should be sent" );
    equal( request.requestBody.password, "123", "password should be sent" );
    equal( authLogin instanceof Promise, true, "should return a promise" );
});

test("Logout - Request verification", function () {
    expect(2);

    var authLogin = restAuth.logout();

    var request = this.requests[0];
    
    equal( request.method, "POST", "should be a POST request" );
    equal( authLogin instanceof Promise, true, "should return a promise" );
});
