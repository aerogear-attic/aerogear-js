(function( $ ) {

    module( "authentication" );

    test( "Custom REST Authentication module init", function() {
        expect( 7 );

        var auth1 = AeroGear.Auth();

        auth1.add( {
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

        equal( Object.keys( auth1.modules ).length, 1, "Single Auth Module Created" );
        equal( Object.keys( auth1.modules )[ 0 ], "module1", "Module name module1" );
        equal( auth1.modules[ Object.keys( auth1.modules )[ 0 ] ].getBaseURL(), "http://customURL.com", "Base URL is http://customURL.com" );
        equal( Object.keys( auth1.modules[ Object.keys( auth1.modules )[ 0 ] ].getEndpoints() ).length, 3, "Endpoints are set" );
        equal( auth1.modules[ Object.keys( auth1.modules )[ 0 ] ].getEndpoints().enroll, "register", "Enroll endpoint is enroll" );
        equal( auth1.modules[ Object.keys( auth1.modules )[ 0 ] ].getEndpoints().login, "go", "Login endpoint is go" );
        equal( auth1.modules[ Object.keys( auth1.modules )[ 0 ] ].getEndpoints().logout, "leave", "Logout endpoint is leave" );
    });

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

    asyncTest( "Register - Custom Authenticator", function() {
        expect( 3 );

        var values = {
            username: "john",
            password: "1234"
        };

        customRestAuth.enroll( values, {
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

    asyncTest( "Login & Logout - Success", function() {
        expect( 3 );

        var values = {
            username: "john",
            password: "123"
        };

        var login = restAuth.login( values, {
            contentType: "application/json",
            dataType: "json",
            success: function( data ) {
                equal( data.username, "john", "Username is John" );
                equal( data.logged, true, "Logged is true" );
            }
        });

        $.when( login ).done( function ( s1 ) {

            var logout = restAuth.logout({
                success: function() {
                    ok( true, "Logout Successful");
                }
            });

            $.when( logout ).done( function ( s2 ) {
                start();
            });
        });
    });

    asyncTest( "Login & Logout - Custom Authenticator - Success", function() {
        expect( 3 );

        var values = {
            username: "john",
            password: "123"
        };

        var login = customRestAuth.login( values, {
            contentType: "application/json",
            dataType: "json",
            success: function( data ) {
                equal( data.username, "john", "Username is John" );
                equal( data.logged, true, "Logged is true" );
            }
        });

        $.when( login ).done( function ( s1 ) {

            var logout = customRestAuth.logout({
                success: function() {
                    ok( true, "Logout Successful");
                }
            });

            $.when( logout ).done( function ( s2 ) {
                start();
            });
        }); 
    });

    asyncTest( "Login & Access With Valid Session & Logout", function() {
        expect( 4 );
        
        var values = {
            username: "john",
            password: "123"
        };

        var login = restAuth.login( values, {
            contentType: "application/json",
            dataType: "json",
            success: function( data ) {
                equal( data.username, "john", "Username is John" );
                equal( data.logged, true, "Logged is true" );
            }
        });

        $.when( login ).done( function ( s1 ) {

            var read = securePipe.read({
                success: function( data ) {
                    ok( true, "Successful Access" );
                }
            });
            
            $.when( read ).done( function ( s2 ) {
                
                var logout = restAuth.logout( {
                    success: function() {
                        ok( true, "Logout Successful");
                    }
                });
                
                $.when( logout ).done( function ( s3 ) {
                    start();
                });
                
            });
        });

    });
    
    asyncTest( "Accessing With Invalid Session then after auth and logout", function() {
        expect( 6 );

        var unauthorizedRead = securePipe.read( {
            error: function( data ) {

                equal( data.status, 401, "UnAuthorized Code" );
                ok( true, "Failed Access with InValid Session" );
            }
        });

        $.when( unauthorizedRead ).fail( function ( s1 ) {

            var values = {
                username: "john",
                password: "123"
            };

            var login = securePipe.getAuthenticator().login( values, {
                    contentType: "application/json",
                    dataType: "json",
                    success: function( data ) {
                        equal( data.username, "john", "Username is John" );
                        equal( data.logged, true, "Logged is true" );
                    }
            });

            $.when( login ).done( function ( s2 ) {
                
                var read = securePipe.read({
                    success: function( data ) {
                        ok( true, "Successful Access" );
                    }
                });
                
                $.when( read ).done( function ( s3 ) {

                    var logout = securePipe.getAuthenticator().logout( {
                        success: function() {
                            ok( true, "Logout Successful");
                        }
                    });

                    $.when( logout ).done( function ( s4 ) {
                        start();
                    });
                });
            });
        });
    });
})( jQuery );
