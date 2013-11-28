(function( $ ) {

    module( "authentication" );

    test( "Authentication init", function() {
        expect( 2 );

        var auth1 = AeroGear.Auth("auth").modules;

        equal( Object.keys( auth1 ).length, 1, "Single Auth Module Created" );
        equal( Object.keys( auth1 )[ 0 ], "auth", "Module name auth" );
    });
    test( "Authentication Pipeline init", function() {
        expect( 3 );

        var auth2 = AeroGear.Auth("auth").modules;

        var pipeline = AeroGear.Pipeline([
            {
                name: "pipe1",
                settings: {
                    authenticator: auth2.auth
                }
            }
        ]).pipes;

        equal( Object.keys( auth2 ).length, 1, "Single Auth Module Created" );
        equal( Object.keys( auth2 )[ 0 ], "auth", "Module named auth" );
        equal( Object.keys( pipeline ).length, 1, "1 Pipe Created with auth module" );

    });

    //create an Authenticator and Pipeline to be used for other tests
    var restAuth = AeroGear.Auth("auth").modules.auth;

    var securePipe = AeroGear.Pipeline([
        {
            name: "secured",
            settings: {
                baseURL: "auth/",
                authenticator: restAuth
            }
        }
    ]).pipes.secured;

    asyncTest( "Register", function() {
        expect( 3 );

        var values = {
            username: "john",
            password: "1234"
        };

        restAuth.enroll( values, {
            contentType: "application/json",
            dataType: "json",
            success: function( data ) {
                ok( true, "Successful Register" );
                equal( data.username, "john", "Username is john" );
                equal( data.logged, true, "Logged is true" );
                start();
            }
        });
    });

    asyncTest( "Register - Failure", function() {
        expect( 2 );

        var values = {
            username: "",
            password: "1234"
        };

        restAuth.enroll( values, {
            contentType: "application/json",
            dataType: "json",
            error: function( data ) {
                equal( data.status, 400, "Bad Request Code");
                equal( data.responseJSON.message, "User enrollment failed", "Enrollment Failure Message" );
                start();
            }
        });
    });

    asyncTest( "Login - Failure", function() {
        expect( 2 );

        var values = {
            username: "bob",
            password: "123"
        };

        restAuth.login( values, {
            contentType: "application/json",
            dataType: "json",
            error: function( data ) {
                equal( data.status, 401, "UnAuthorized Code");
                equal( data.responseJSON.message, "User authentication failed", "Login Failure Message" );
                start();
            }
        });
    });

    asyncTest( "Accessing With Invalid Session", function() {
        expect( 2 );

        securePipe.read({
            error: function( data ) {
                equal( data.status, 401, "UnAuthorized Code" );
                ok( true, "Failed Access with InValid Session" );
                start();
            }
        });
    });

    asyncTest( "Log Out With Invalid Session", function() {
        expect( 1 );

        restAuth.logout({
            error: function( data ) {
                equal( data.status, 410, "Gone Code");
                start();
            }
        });

    });

    asyncTest( "Login - Success", function() {
        expect( 2 );

        var values = {
            username: "john",
            password: "123"
        };

        restAuth.login( values, {
            contentType: "application/json",
            dataType: "json",
            success: function( data ) {
                equal( data.username, "john", "Username is John" );
                equal( data.logged, true, "Logged is true" );
                start();
            }
        });
    });

    asyncTest( "Access With Valid Session", function() {
        expect( 1 );

        securePipe.read({
            success: function( data ) {
                ok( true, "Successful Access" );
                start();
            }
        });

    });

    asyncTest( "Log Out", function() {
        expect( 1 );

        restAuth.logout({
            success: function() {
                ok( true, "Logout Successful");
                start();
            }
        });

    });

    asyncTest( "Accessing With Invalid Session then after auth", function() {
        expect( 5 );

        securePipe.read({
            error: function( data ) {
                var values = {
                    username: "john",
                    password: "123"
                };

                equal( data.status, 401, "UnAuthorized Code" );
                ok( true, "Failed Access with InValid Session" );

                securePipe.getAuthenticator().login( values, {
                    contentType: "application/json",
                    dataType: "json",
                    success: function( data ) {
                        equal( data.username, "john", "Username is John" );
                        equal( data.logged, true, "Logged is true" );

                        securePipe.read({
                            success: function( data ) {
                                ok( true, "Successful Access" );
                                start();
                            }
                        });
                    }
                });
            }
        });
    });
})( jQuery );
