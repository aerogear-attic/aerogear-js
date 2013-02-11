(function( $ ) {

    // Do not reorder tests on rerun
    QUnit.config.reorder = false;

    module( "authentication: Token" );

    test( "Authentication init", function() {
        expect( 3 );

        var auth1 = AeroGear.Auth({
            name: "auth",
            settings: {
                agAuth: true
            }
        }).modules;

        equal( Object.keys( auth1 ).length, 1, "Single Auth Module Created" );
        equal( Object.keys( auth1 )[ 0 ], "auth", "Module name auth" );
        equal( auth1.auth.isAuthenticated(), false, "Current Auth Status" );
    });
    test( "Authentication Pipeline init", function() {
        expect( 2 );

        var pipeline = AeroGear.Pipeline( "pipe1" ).pipes,
            auth2 = AeroGear.Auth({
                name: "auth",
                settings: {
                    agAuth: true,
                    pipes: pipeline
                }
            }).modules;

        equal( Object.keys( auth2 ).length, 1, "Single Auth Module Created" );
        equal( Object.keys( auth2 )[ 0 ], "auth", "Module named auth" );

    });

    //create an Authenticator and Pipeline to be used for other tests
    var securePipe = AeroGear.Pipeline( "secured" ).pipes.secured,
        restAuth = AeroGear.Auth([
            {
                name: "auth",
                settings: {
                    agAuth: true,
                    pipes: securePipe
                }
            }
        ]).modules.auth;

    asyncTest( "No Token", function() {
        expect( 1 );

        //a little clean up
        sessionStorage.removeItem( "ag-auth-auth" );

        securePipe.read({
            error: function( type, message ) {
                equal( message, "Error: Authentication Required", "Initial Page load Auth Failure" );
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

    asyncTest( "Read With Valid Token", function() {
        expect( 1 );

        //set a Auth-Token, for example purpose's
        sessionStorage.setItem( "ag-auth-auth", "1234567" );
        securePipe.read({
            success: function( data ) {
                ok( true, "Successful Read with Valid Token" );
                start();
            }
        });

    });

    asyncTest( "Save New With Valid Token", function() {
        expect( 1 );

        //set a Auth-Token, for example purpose's
        sessionStorage.setItem( "ag-auth-auth", "1234567" );
        securePipe.save({
            name: "New Item"
        },
        {
            success: function( data ) {
                ok( true, "Successful Save with Valid Token" );
                start();
            }
        });

    });

    asyncTest( "Save Changes to Existing Item With Valid Token", function() {
        expect( 1 );

        //set a Auth-Token, for example purpose's
        sessionStorage.setItem( "ag-auth-auth", "1234567" );
        securePipe.save({
            id: 999999,
            name: "New Item"
        },
        {
            success: function( data ) {
                ok( true, "Successful Save with Valid Token" );
                start();
            }
        });

    });

    asyncTest( "Remove Item With Valid Token", function() {
        expect( 1 );

        //set a Auth-Token, for example purpose's
        sessionStorage.setItem( "ag-auth-auth", "1234567" );
        securePipe.remove( 999999,
        {
            success: function( data ) {
                ok( true, "Successful Remove with Valid Token" );
                start();
            }
        });

    });

    asyncTest( "Read With Invalid Token", function() {
        expect( 2 );

        //set a Auth-Token, for example purpose's
        sessionStorage.setItem( "ag-auth-auth", "12345" );
        securePipe.read({
            error: function( data ) {
                equal( data.status, 401, "UnAuthorized Code" );
                ok( true, "Failed Read with InValid Token" );
                start();
            }
        });
    });

    asyncTest( "Save New With Invalid Token", function() {
        expect( 2 );

        //set a Auth-Token, for example purpose's
        sessionStorage.setItem( "ag-auth-auth", "12345" );
        securePipe.save({
            name: "New Item"
        },
        {
            error: function( data ) {
                equal( data.status, 401, "UnAuthorized Code" );
                ok( true, "Failed Save with InValid Token" );
                start();
            }
        });

    });

    asyncTest( "Save Changes to Existing Item With Invalid Token", function() {
        expect( 2 );

        //set a Auth-Token, for example purpose's
        sessionStorage.setItem( "ag-auth-auth", "12345" );
        securePipe.save({
            id: 999999,
            name: "New Item"
        },
        {
            error: function( data ) {
                equal( data.status, 401, "UnAuthorized Code" );
                ok( true, "Failed Save with InValid Token" );
                start();
            }
        });

    });

    asyncTest( "Remove Item With Invalid Token", function() {
        expect( 2 );

        //set a Auth-Token, for example purpose's
        sessionStorage.setItem( "ag-auth-auth", "12345" );
        securePipe.remove( 999999,
        {
            error: function( data ) {
                equal( data.status, 401, "UnAuthorized Code" );
                ok( true, "Failed Remove with InValid Token" );
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
