( function( $ ) {

// Do not reorder tests on rerun
    QUnit.config.reorder = false;

    module( "DataManager: WebSQL" );

    test( "Existence of WebSQL", function() {
        expect( 1 );
        ok( window.openDatabase );
    });

    var dm = AeroGear.DataManager();

    asyncTest( "Create - Name String", function() {
        expect( 1 );
        dm.add({
            name: "test1",
            type: "WebSQL",
            settings: {
                success: function( data ) {
                    database = data;
                    ok( true, "WebSQl test1 created successfully" );
                    start();
                },
                error: function( error ) {
                    ok( false, "error, WebSQL create error" + error );
                    start();
                }
            }
        });
    });

    //WebSQL has no remove Database method, perhaps just truncate the table
    asyncTest( "clean up", function() {
        expect( 1 );
        var dbs = [ "test1" ];
        dm.stores.test1.remove( undefined, {
            success: function( data ) {
                ok( true, "data reset" );
                start();
            },
            error: function( error ) {
                ok( false, "error reseting data" );
                start();
            }
        });
    });

    asyncTest( "Save Data - 1 Item", function() {
        expect( 2 );
        dm.stores.test1.save( { "id": 1, "name": "Grace", "type": "Little Person" }, {
            success: function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 1, "1 item in database" );
                start();
            },
            error: function( error ) {
                ok( false, "Failed to save records" + error );
                start();
            }
        });
    });

    asyncTest( "Read Data - 1 item - string", function() {
        expect( 2 );
        dm.stores.test1.read( 1, {
            success: function( data ) {
                ok( true, "read 1 item successful" );
                equal( data.length, 1, "1 items returned" );
                start();
            },
            error: function( error ) {
                ok( false, "Read 1 has errors" + error );
                start();
            }
        });
    });

    asyncTest( "Update Data - 1 item", function() {
        expect( 3 );
        dm.stores.test1.save( [{ "id": "1", "name": "Lucas", "type": "human" }], {
            success: function( data ) {
                ok( true, "update 2 item successful" );
                equal( data.length, 1, "1 item still returned" );
                equal( data[ 0 ].name, "Lucas", "Name field Updated"  );
                start();
            },
            error: function( error ) {
                ok( false, "update 1 has errors" + error );
                start();
            }
        });
    });



    var data = [
        {
            "id": 2,
            "name": "Luke",
            "type": "Human"
        },
        {
            "id": 3,
            "name": "Otter",
            "type": "Cat"
        }
    ];

    asyncTest( "Save Data - Array", function() {
        expect( 2 );
        dm.stores.test1.save( data, {
            success: function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 3, "3 items in database" );
                start();
            },
            error: function( error ) {
                console.log( error );
                ok( false, "Failed to save records" + error );
                start();
            }
        });
    });

    asyncTest( "Read Data - All", function() {
        expect( 2 );
        dm.stores.test1.read( undefined, {
            success: function( data ) {
                ok( true, "read all data successful" );
                equal( data.length, 3, "3 items returned" );
                start();
            },
            error: function( error ) {
                ok( false, "Read All has errors" + error );
                start();
            }
        });
    });

    asyncTest( "filter Data - 1 item", function() {
        expect( 3 );
        dm.stores.test1.filter( { "name": "Lucas" }, true, {
            success: function( data ) {
                ok( true, "filter 1 item successfully" );
                equal( data.length, 1, "1 item returned" );
                equal( data[ 0 ].name, "Lucas", "Name field returned"  );
                start();
            },
            error: function( error ) {
                ok( false, "update 1 has errors" + error );
                start();
            }
        });
    });

    asyncTest( "Remove Data - 1 item - string", function() {
        expect( 2 );
        dm.stores.test1.remove( 1, {
            success: function( data ) {
                ok( true, "remove 1 item successful" );
                equal( data.length, 2, "2 items returned" );
                start();
            },
            error: function( error ) {
                ok( false, "remove 1 has errors" + error );
                start();
            }
        });
    });

    asyncTest( "Remove Data - All", function() {
        expect( 2 );
        dm.stores.test1.remove( undefined, {
            success: function( data ) {
                ok( true, "remove all items" );
                equal( data.length, 0, "0 items returned" );
                start();
            },
            error: function( error ) {
                ok( false, "remove all has errors" + error );
                start();
            }
        });
    });

})( jQuery );
