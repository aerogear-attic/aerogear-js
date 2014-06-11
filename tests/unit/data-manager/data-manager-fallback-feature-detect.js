( function() {
    // The non hacky way

    module( "DataManager Creation with fallbacks - Feature Detection", {
        setup: function() {
        },
        teardown: function() {
        }
    });

    test( "create IndexedDB - Fallsback if not available - name string", function() {
        expect( 4 );

        var adapter,
            type;
        if( "IndexedDB" in AeroGear.DataManager.validAdapters ) {
            adapter = AeroGear.DataManager.adapters.IndexedDB;
            type = "IndexedDB";
        } else {
            for( var i = 0; i < AeroGear.DataManager.preferred.length; i++ ) {
                if( AeroGear.DataManager.preferred[ i ] in AeroGear.DataManager.validAdapters ) {
                    adapter = AeroGear.DataManager.adapters[ AeroGear.DataManager.preferred[ i ] ];
                    type = AeroGear.DataManager.preferred[ i ];
                    break;
                }
            }
        }
        var dm = AeroGear.DataManager( { name: "createTest1", type: "IndexedDB" } ).stores;
        equal( Object.keys( dm ).length, 1, "Single Store created" );
        equal( Object.keys( dm )[ 0 ], "createTest1", "Store Name createTest1" );
        equal( dm.createTest1 instanceof adapter, true, type + " Created " );
        equal( dm.createTest1.getAsync(), true, "Adapter should be in async mode since it fellback" );
    });

    test( "create WebSQL - Fallsback if not available - name string", function() {
        expect( 4 );

        var adapter,
            type;
        if( "WebSQL" in AeroGear.DataManager.validAdapters ) {
            adapter = AeroGear.DataManager.adapters.WebSQL;
            type = "WebSQL";
        } else {
            for( var i = 0; i < AeroGear.DataManager.preferred.length; i++ ) {
                if( AeroGear.DataManager.preferred[ i ] in AeroGear.DataManager.validAdapters ) {
                    adapter = AeroGear.DataManager.adapters[ AeroGear.DataManager.preferred[ i ] ];
                    type = AeroGear.DataManager.preferred[ i ];
                    break;
                }
            }
        }

        var dm = AeroGear.DataManager( { name: "createTest1", type: "WebSQL" } ).stores;
        equal( Object.keys( dm ).length, 1, "Single Store created" );
        equal( Object.keys( dm )[ 0 ], "createTest1", "Store Name createTest1" );
        equal( dm.createTest1 instanceof adapter, true, type + " Created " );
        equal( dm.createTest1.getAsync(), true, "Adapter should be in async mode since it fellback" );
    });
})();
