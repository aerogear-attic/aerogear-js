(function( $ ) {

    module( "authorization" );
   
    var authz = AeroGear.Authorization();
        
    authz.add({
        name: "drive",
        settings: {
            clientId: "s6BhdRkqt3",
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
        expect( 3 );
        equal( Object.keys( authz.services ).length, 1, "Single Service Created" );
        equal( Object.keys( authz.services )[ 0 ], "drive", "Service name drive" );
        ok( authz.services[ Object.keys( authz.services )[ 0 ] ].getState(), "State exists" );
    });
 
    test( "Validate Response - Success case - OAuth2 Implicit Grant flow", function() {
        expect( 3 );

        var state = authz.services[ Object.keys( authz.services )[ 0 ] ].getState();
        ok( state, "State exists" );

        var accessTokenResponseURI = ["http://example.com/cb#access_token=2YotnFZFEjr1zCsicMWpAA&state=",
                                state,
                                "&token_type=example&expires_in=3600"].join(''),
            success = function ( response ) {
                ok( true, 'Successful validation' );
            },
            error = function ( error ) {
                ok( false, 'Unsuccessful validation' );
            };

        authz.services[ Object.keys( authz.services )[ 0 ] ].validate( accessTokenResponseURI, { success: success, error: error } );
        ok( authz.services[ Object.keys( authz.services )[ 0 ] ].getAccessToken(), "AccessToken exists" );
    });

    test( "Validate Response - Failure case - OAuth2 Implicit Grant flow", function() {
        expect( 1 );

        var wrongState = authz.services[ Object.keys( authz.services )[ 0 ] ].getState() + '__',
            accessTokenResponseURI = ["http://example.com/cb#access_token=2YotnFZFEjr1zCsicMWpAA&state=",
                                wrongState,
                                "&token_type=example&expires_in=3600"].join(''),
            success = function ( response ) {
                ok( false, 'Successful validation' );
            },
            error = function ( error ) {
                ok( true, 'Unsuccessful validation' );
            };

        authz.services[ Object.keys( authz.services )[ 0 ] ].validate( accessTokenResponseURI, { success: success, error: error } );
    });

    asyncTest( "Accessing resources", function() {
        expect( 3 );

        var state = authz.services[ Object.keys( authz.services )[ 0 ] ].getState(),
            accessTokenResponseURI = ["http://example.com/cb#access_token=2YotnFZFEjr1zCsicMWpAA&state=",
                                state,
                                "&token_type=example&expires_in=3600"].join(''),
            success = function ( response ) {
                ok( true, 'Successful validation' );
            },
            error = function ( error ) {
                ok( false, 'Unsuccessful validation' );
            };

        authz.services[ Object.keys( authz.services )[ 0 ] ].validate( accessTokenResponseURI, { success: success, error: error } );
        ok( authz.services[ Object.keys( authz.services )[ 0 ] ].getAccessToken(), "AccessToken exists" );

        pipeline.pipes.messages.read({
            success: function( data ) {
                ok( true, "Success callback" );
                start();
            }
        });
    });

})( jQuery );
