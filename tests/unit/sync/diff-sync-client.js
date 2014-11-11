(function() {

    module( 'Diff Sync integration test' );

    test( 'AeroGear.DiffSyncClient should support creation without the new keyword', function() {
        var client = AeroGear.DiffSyncClient( { serverUrl: 'ws://localhost:7777/sync' } );
        ok( client , 'Should be no problem not using new when creating' );
    });

    test( 'serverUrl is mandatory', function() {
        throws( function() { AeroGear.DiffSyncClient(); } , Error, "'serverUrl' must be specified" );
    });

    test( 'member access', function() {
        var client = AeroGear.DiffSyncClient( { serverUrl: 'ws://localhost:7777/sync' } );
        equal( client.serverUrl, undefined, 'Should not be able to access private members serverUrl' );
        equal( client.sendQueue, undefined, 'Should not be able to access private members sendQueue' );
        equal( client.ws, undefined, 'Should not be able to access private members ws' );
    });

    function uuid()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function( c ) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString( 16 );
        });
    }

})();
