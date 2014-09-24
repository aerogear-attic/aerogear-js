(function() {

    module( "authorization", {
        setup: function() {
            this.server = sinon.fakeServer.create();
            this.server.autoRespond = true;

            this.server.respondWith( 'GET', /drive\/v2\/messages\?access_token=([a-zA-Z0-9]+)/,
                function( xhr, accessToken ) {
                    if ( accessToken && accessToken !== suiteData.wrongAccessToken ) {
                        xhr.respond( 200 );
                    } else {
                        xhr.respond( 401 );
                    }
                }
            );

            this.server.respondWith( 'GET', /oauth2\/token\?access_token=([^&]+)/,
                function( xhr, accessToken ) {
                    if ( accessToken && accessToken !== suiteData.wrongAccessToken && accessToken !== suiteData.accessTokenWrongAudience ) {
                        xhr.response = { "audience": suiteData.clientId };
                        xhr.respond( 200, {"Content-Type": "application/json"}, JSON.stringify({}));
                    } else if ( accessToken && accessToken === suiteData.accessTokenWrongAudience ) {
                        xhr.respond( 200, {"Content-Type": "application/json"}, JSON.stringify({}));
                    } else {
                        xhr.respond( 401 );
                    }
                }
            );
        },
        teardown: function() {
            this.server.restore();
        }
    });

    var authz = AeroGear.Authorization();

    var DRIVE = "drive";

    authz.add({
        name: DRIVE,
        settings: {
            clientId: suiteData.clientId,
            redirectURL: "http://localhost:8080/redirect",
            authEndpoint: "https://example.com/drive/v2/messages",
            validationEndpoint: "https://example.com/oauth2/token",
            scopes: "user"
        }
    });

    test ( "Configuration Setup", function() {
        expect( 4 );
        equal( Object.keys( authz.services ).length, 1, "Single Service Created" );
        equal( Object.keys( authz.services )[ 0 ], "drive", "Service name drive" );
        ok( authz.services[ DRIVE ].getState(), "State exists" );
        ok( authz.services[ DRIVE ].getLocalStorageName(), "Local Storage Name exists" );
    });

    asyncTest( "Validate Response - Success case - OAuth2 Implicit Grant flow", function() {
        expect( 4 );

        var state = authz.services[ DRIVE ].getState();
        ok( state, "State exists" );

        var accessTokenResponseURI = ["http://example.com/cb#access_token=",
                                suiteData.accessToken,
                                "&state=",
                                state,
                                "&token_type=example&expires_in=",
                                suiteData.tokenExpireTime].join(''),
            success = function ( response ) {
                ok( true, 'Successful validation' );
                ok( authz.services[ DRIVE ].getAccessToken(), "AccessToken exists" );
                strictEqual( authz.services[ DRIVE ].getAccessToken(), suiteData.accessToken, "Access Token is the expected");
                start();
            },
            error = function ( error ) {
                ok( false, 'Unsuccessful validation: ' + error );
                start();
            };

        authz.services[ DRIVE ].validate( accessTokenResponseURI )
            .then( success )
            .catch( error );
    });

    asyncTest( "Validate Response - Failure case - OAuth2 Implicit Grant flow", function() {
        expect( 1 );

        var wrongState = authz.services[ DRIVE ].getState() + '__',
            accessTokenResponseURI = ["http://example.com/cb#access_token=",
                                suiteData.accessToken,
                                "&state=",
                                wrongState,
                                "&token_type=example&expires_in=",
                                suiteData.tokenExpireTime].join(''),
            success = function ( response ) {
                ok( false, 'Successful validation' );
            },
            error = function ( error ) {
                ok( true, 'Unsuccessful validation' );
                start();
            };

        authz.services[ DRIVE ].validate( accessTokenResponseURI )
            .then( success )
            .catch( error );
    });

    asyncTest( "Validate Response - Failure case - Wrong Audience - OAuth2 Implicit Grant flow", function() {
        expect( 2 );

        var state = authz.services[ DRIVE ].getState();
        ok( state, "State exists" );

        var accessTokenResponseURI = ["http://example.com/cb#access_token=",
                                suiteData.accessTokenWrongAudience,
                                "&state=",
                                state,
                                "&token_type=example&expires_in=",
                                suiteData.tokenExpireTime].join(''),
            success = function ( response ) {
                ok( false, 'Successful validation' );
            },
            error = function ( error ) {
                ok( true, 'Unsuccessful validation' );
                start();
            };

        authz.services[ DRIVE ].validate( accessTokenResponseURI )
            .then( success )
            .catch( error );
    });

    asyncTest( "Accessing Resources - Success case - OAuth2 Implicit Grant flow", function() {
        expect( 4 );

        var state = authz.services[ DRIVE ].getState(),
            accessTokenResponseURI = ["http://example.com/cb#access_token=",
                                suiteData.accessToken,
                                "&state=",
                                state,
                                "&token_type=example&expires_in=",
                                suiteData.tokenExpireTime].join(''),
            success = function ( response ) {

            },
            error = function ( error ) {
                ok( false, 'Unsuccessful validation' );
            };

        authz.services[ DRIVE ].validate( accessTokenResponseURI )
            .then( function() {
                ok( true, 'Successful validation' );
                ok( authz.services[ DRIVE ].getAccessToken(), "AccessToken exists" );
                strictEqual( authz.services[ DRIVE ].getAccessToken(), suiteData.accessToken, "Access Token is the expected");

                return authz.services[ DRIVE ].execute( { url: "https://example.com/drive/v2/messages", type: "GET" } )
                    .then( function( data ) {
                        ok( true, "Success callback" );
                        start();
                    });
            })
            .catch( error );
    });

    asyncTest( "Accessing Resources - Error case - OAuth2 Implicit Grant flow", function() {
        expect( 2 );

        var state = authz.services[ DRIVE ].getState(),
            accessTokenResponseURI = ["http://example.com/cb#access_token=",
                                suiteData.accessToken,
                                "&state=",
                                state,
                                "&token_type=example&expires_in=",
                                suiteData.tokenExpireTime].join(''),
            error = function ( error ) {
                ok( false, 'Unsuccessful validation' );
                start();
            };

        authz.services[ DRIVE ].validate( accessTokenResponseURI )
            .then( function( data ) {
                ok( true, 'Successful validation' );

                // explicitly set wrong access token
                var wrongTokenJSON = { accessToken: suiteData.wrongAccessToken};
                localStorage.setItem( authz.services[ DRIVE ].getLocalStorageName(), JSON.stringify( wrongTokenJSON ) );
                // access resources using wrong access token
                authz.services[ DRIVE ].execute()
                    .then( function() {
                        ok( false, "should fail with wrong access token" );
                        start();
                    })
                    .catch( function() {
                        ok( true, "Error callback" );
                        start();
                    });
            })
            .catch( error );
    });

})();
