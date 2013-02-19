(function( $ ) {

    module( "authentication: Token" );

    test( "Authentication init", function() {
        expect( 2 );

        var auth1 = AeroGear.Auth({
            name: "auth",
            settings: {
                agAuth: true
            }
        }).modules;

        equal( Object.keys( auth1 ).length, 1, "Single Auth Module Created" );
        equal( Object.keys( auth1 )[ 0 ], "auth", "Module name auth" );
    });
    test( "Authentication Pipeline init", function() {
        expect( 3 );

        var auth2 = AeroGear.Auth({
            name: "auth",
            settings: {
                agAuth: true
            }
        }).modules;

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
    var restAuth = AeroGear.Auth([
        {
            name: "auth",
            settings: {
                agAuth: true
            }
        }
    ]).modules.auth;

    var securePipe = AeroGear.Pipeline([
        {
            name: "secured",
            settings: {
                baseURL: "auth/",
                authenticator: restAuth
            }
        }
    ]).pipes.secured;

    asyncTest( "No Token", function() {
        expect( 1 );

        //a little clean up
        sessionStorage.removeItem( "ag-auth-auth" );

        securePipe.read({
            error: function( jqXHR, textStatus, errorThrown ) {
                equal( errorThrown, "UnAuthorized", "Initial Page load Auth Failure" );
                start();
            }
        });
    });

    asyncTest( "Register", function() {
        expect( 4 );

        //a little clean up
        sessionStorage.removeItem( "ag-auth-auth" );
        var values = {
            username: "john",
            password: "1234"
        };

        restAuth.enroll( values, {
            success: function( data ) {
                ok( true, "Successful Register" );
                equal( sessionStorage.getItem( "ag-auth-auth" ), "123456789", "Auth-Token set correctly" );
                equal( data.username, "john", "Username is john" );
                equal( data.logged, true, "Logged is true" );
                start();
            }
        });
    });
    asyncTest( "Login - Failure", function() {
        expect( 4 );

        //a little clean up
        sessionStorage.removeItem( "ag-auth-auth" );

        var values = {
            username: "bob",
            password: "123"
        };

        equal( sessionStorage.getItem( "ag-auth-auth" ), null, "Auth Token doesn't exist yet" );

        restAuth.login( values, {
            error: function( data ) {
                equal( sessionStorage.getItem( "ag-auth-auth" ), null, "Auth Token doesn't exist" );
                equal( data.status, 401, "UnAuthorized Code");
                equal( data.responseJSON.message, "User authentication failed", "Login Failure Message" );
                start();
            }
        });
    });

    asyncTest( "Login - Success", function() {
        expect( 5 );

        //a little clean up
        sessionStorage.removeItem( "ag-auth-auth" );

        var values = {
            username: "john",
            password: "123"
        };

        equal( sessionStorage.getItem( "ag-auth-auth" ), null, "Auth Token doesn't exist yet" );

        restAuth.login( values, {
            success: function( data ) {
                equal( restAuth.isAuthenticated(), true, "Auth Success" );
                equal( sessionStorage.getItem( "ag-auth-auth" ), "123456", "Auth-Token set correctly" );
                equal( data.username, "john", "Username is John" );
                equal( data.logged, true, "Logged is true" );
                start();
            }
        });
    });

    asyncTest( "Access With Valid Token", function() {
        expect( 1 );

        //set a Auth-Token, for example purpose's
        sessionStorage.setItem( "ag-auth-auth", "1234567" );
        securePipe.read({
            success: function( data ) {
                ok( true, "Successful Access with Valid Token" );
                start();
            }
        });

    });

    asyncTest( "Accessing With Invalid Token", function() {
        expect( 2 );

        //set a Auth-Token, for example purpose's
        sessionStorage.setItem( "ag-auth-auth", "12345" );
        securePipe.read({
            error: function( data ) {
                equal( data.status, 401, "UnAuthorized Code" );
                ok( true, "Failed Access with InValid Token" );
                start();
            }
        });
    });

    asyncTest( "Log Out", function() {
        expect( 2 );

        //set a Auth-Token, for example purpose's
        sessionStorage.setItem( "ag-auth-auth", "1234567" );

        restAuth.logout({
            success: function() {
                ok( true, "Logout Successful");
                equal( sessionStorage.getItem( "ag-auth-auth" ), null, "Auth-Token removed" );
                start();
            }
        });

    });
})( jQuery );
