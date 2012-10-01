(function( $ ) {

    module( "authentication: Token" );

    test( "Authentication init", function() {
        expect( 4 );

        var auth1 = aerogear.auth({
            name: "auth",
            settings: {
                agAuth: true
            }
        }).modules;

        equal( Object.keys( auth1 ).length, 1, "Single Auth Module Created" );
        equal( Object.keys( auth1 )[ 0 ], "auth", "Module name auth" );
        equal( auth1.auth.agAuth, true, "agAuth Setting True" );
        equal( auth1.auth.type, "rest", "Default auth module type(rest)" );
    });
    test( "Authentication Pipeline init", function() {
        expect( 4 );

        var auth2 = aerogear.auth({
            name: "auth",
            settings: {
                agAuth: true
            }
        }).modules;

        var pipe = aerogear.pipeline([
            {
                name: "pipe1",
                settings: {
                    authenticator: auth2
                }
            }
        ]).pipes;

        equal( Object.keys( auth2 ).length, 1, "Single Auth Module Created" );
        equal( Object.keys( auth2 )[ 0 ], "auth", "Module named auth" );
        equal( Object.keys( pipe ).length, 1, "1 Pipe Created" );
        equal( pipe.pipe1.authenticator.auth.name, "auth", "Authenticator named auth added to pipe" );

    });

    //create an Authenticator and Pipeline to be used for other tests
    var restAuth = aerogear.auth([
        {
            name: "auth",
            settings: {
                agAuth: true
            }
        }
    ]).modules.auth;

    var securePipe = aerogear.pipeline([
        {
            name: "secured",
            settings: {
                baseURL: "/auth/",
                authenticator: restAuth
            }
        }
    ]).pipes.secured;

    asyncTest( "No Token", function() {
        expect( 1 );

        securePipe.read({
            error: function( data, message ) {
                equal( message, "Error: Authentication Required", "Initial Page load Auth Failure" );
                start();
            }
        });
    });

    asyncTest( "Login - Success", function() {
        expect( 4 );

        //a little clean up
        sessionStorage.removeItem( "ag-auth-auth" );

        var values = {
            username: "john",
            password: "123"
        };

        equal( sessionStorage.getItem( "ag-auth-auth" ), null, "Auth Token doesn't exist yet" );

        restAuth.login( values, {
            success: function( data ) {
                equal( sessionStorage.getItem( "ag-auth-auth" ), "123456", "Auth-Token set correctly" );
                equal( data.username, "john", "Username is John" );
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
                equal( data.responseText.message, "User authentication failed", "Login Failure Message" );
                start();
            }
        });
    });

    test( "Access With Valid Token", function() {
        expect( 0 );
    });

    test( "Accessing With Invalid Token", function() {
        expect( 0 );
    });

    test( "Log Out", function() {
        expect( 0 );
    });
})( jQuery );
