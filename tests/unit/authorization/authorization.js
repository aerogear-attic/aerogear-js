(function( $ ) {

    module( "authorization" );
   
    var suiteData = {
            accessToken: "2YotnFZFEjr1zCsicMWpAA",
            tokenExpireTime: 3600,
            clientId: "s6BhdRkqt3",
            wrongAccessToken: "wrongToken"
        },
        authz = AeroGear.Authorization();
        
    authz.add({
        name: "drive",
        settings: {
            clientId: suiteData.clientId,
            redirectURL: "http://localhost:8080/redirect",
            authEndpoint: "https://example.com/o/oauth2/auth",
            validationEndpoint: "https://example.com/oauth2/token",
            scopes: "user"
        }
    });

    var pipeline = AeroGear.Pipeline( { authorizer: authz.services.drive } );
    pipeline.add([
        {
            name: "messages",
            settings: {
                baseURL: "https://example.com/drive/v2/"
            }
        }
    ]);

    test ( "Configuration Setup", function() {
        expect( 4 );
        equal( Object.keys( authz.services ).length, 1, "Single Service Created" );
        equal( Object.keys( authz.services )[ 0 ], "drive", "Service name drive" );
        ok( authz.services[ Object.keys( authz.services )[ 0 ] ].getState(), "State exists" );
        ok( authz.services[ Object.keys( authz.services )[ 0 ] ].getLocalStorageName(), "Local Storage Name exists" );
    });
 
    test( "Validate Response - Success case - OAuth2 Implicit Grant flow", function() {
        expect( 4 );

        var state = authz.services[ Object.keys( authz.services )[ 0 ] ].getState();
        ok( state, "State exists" );

        var accessTokenResponseURI = ["http://example.com/cb#access_token=",
                                suiteData.accessToken,
                                "&state=",
                                state,
                                "&token_type=example&expires_in=",
                                suiteData.tokenExpireTime].join(''),
            success = function ( response ) {
                ok( true, 'Successful validation' );
            },
            error = function ( error ) {
                ok( false, 'Unsuccessful validation' );
            };

        authz.services[ Object.keys( authz.services )[ 0 ] ].validate( accessTokenResponseURI, { success: success, error: error } );
        ok( authz.services[ Object.keys( authz.services )[ 0 ] ].getAccessToken(), "AccessToken exists" );
        strictEqual( authz.services[ Object.keys( authz.services )[ 0 ] ].getAccessToken(), suiteData.accessToken, "Access Token is the expected");
    });

    test( "Validate Response - Failure case - OAuth2 Implicit Grant flow", function() {
        expect( 1 );

        var wrongState = authz.services[ Object.keys( authz.services )[ 0 ] ].getState() + '__',
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
            };

        authz.services[ Object.keys( authz.services )[ 0 ] ].validate( accessTokenResponseURI, { success: success, error: error } );
    });

    asyncTest( "Accessing Resources - Success case - OAuth2 Implicit Grant flow", function() {
        expect( 4 );

        var state = authz.services[ Object.keys( authz.services )[ 0 ] ].getState(),
            accessTokenResponseURI = ["http://example.com/cb#access_token=",
                                suiteData.accessToken,
                                "&state=",
                                state,
                                "&token_type=example&expires_in=",
                                suiteData.tokenExpireTime].join(''),
            success = function ( response ) {
                ok( true, 'Successful validation' );
            },
            error = function ( error ) {
                ok( false, 'Unsuccessful validation' );
            };

        authz.services[ Object.keys( authz.services )[ 0 ] ].validate( accessTokenResponseURI, { success: success, error: error } );
        ok( authz.services[ Object.keys( authz.services )[ 0 ] ].getAccessToken(), "AccessToken exists" );
        strictEqual( authz.services[ Object.keys( authz.services )[ 0 ] ].getAccessToken(), suiteData.accessToken, "Access Token is the expected");

        pipeline.pipes.messages.read({
            success: function( data ) {
                ok( true, "Success callback" );
                start();
            }
        });
    });

    asyncTest( "Accessing Resources - Error case - OAuth2 Implicit Grant flow", function() {
        expect( 4 );
        
        var state = authz.services[ Object.keys( authz.services )[ 0 ] ].getState(),
            accessTokenResponseURI = ["http://example.com/cb#access_token=",
                                suiteData.wrongAccessToken,
                                "&state=",
                                state,
                                "&token_type=example&expires_in=",
                                suiteData.tokenExpireTime].join(''),
            success = function ( response ) {
                ok( true, 'Successful validation' );
            },
            error = function ( error ) {
                ok( false, 'Unsuccessful validation' );
            };

        authz.services[ Object.keys( authz.services )[ 0 ] ].validate( accessTokenResponseURI, { success: success, error: error } );
        ok( authz.services[ Object.keys( authz.services )[ 0 ] ].getAccessToken(), "AccessToken exists" );
        strictEqual( authz.services[ Object.keys( authz.services )[ 0 ] ].getAccessToken(), suiteData.wrongAccessToken, "Access Token is the expected");

        pipeline.pipes.messages.read({
            error: function( data ) {
                ok( true, "Error callback" );
                start();
            }
        });
    });

})( jQuery );
