( function() {

    // A Little Bit of setup
    // Remove the indexedDB and webSQL adapters from our list of valid adapters
    // so we can show the fallback to sessionLocal.
    // but first lets save a reference
    var validAdapters = AeroGear.DataManager.validAdapters;

    module( "DataManager Creation with fallbacks", {
        setup: function() {

            for( var adapter in AeroGear.DataManager.validAdapters ) {
                if( adapter === "IndexedDB" || adapter === "WebSQL") {
                    delete AeroGear.DataManager.validAdapters[ adapter ];
                }
            }
        },
        teardown: function() {
            AeroGear.DataManager.validAdapters = validAdapters;
        }
    });

    test( "create IndexedDB - Fallsback to SessionLocal - name string", function() {
        expect( 3 );

        var dm = AeroGear.DataManager( { name: "createTest1", type: "IndexedDB" } ).stores;
        equal( Object.keys( dm ).length, 1, "Single Store created" );
        equal( Object.keys( dm )[ 0 ], "createTest1", "Store Name createTest1" );
        equal( dm.createTest1 instanceof AeroGear.DataManager.adapters.SessionLocal, true, "Fellback to SessionLocal" );
    });

    test( "create IndexedDB and WebSQL - Fallsback to SessionLocal - name array", function() {
        expect( 7 );

        var dm = AeroGear.DataManager([
            {
                name: "createTest21",
                type: "WebSQL"
            },
            {
                name: "createTest22",
                type: "IndexedDB"
            },
            "createTest23"
        ]).stores;

        equal( Object.keys( dm ).length, 3, "3 Stores created" );
        equal( Object.keys( dm )[ 0 ], "createTest21", "Store Name createTest21" );
        equal( Object.keys( dm )[ 1 ], "createTest22", "Store Name createTest22" );
        equal( Object.keys( dm )[ 2 ], "createTest23", "Store Name createTest23" );
        equal( dm.createTest21 instanceof AeroGear.DataManager.adapters.SessionLocal, true, "Fellback to SessionLocal" );
        equal( dm.createTest22 instanceof AeroGear.DataManager.adapters.SessionLocal, true, "Fellback to SessionLocal" );
        equal( dm.createTest23 instanceof AeroGear.DataManager.adapters.Memory, true, "No Fallback should happen" );
    });

    test( "create - object", function() {
        expect( 5 );

        var dm = AeroGear.DataManager([
            {
                name: "createTest31"
            },
            {
                name: "createTest32",
                type: "WebSQL"
            }
        ]).stores;

        equal( Object.keys( dm ).length, 2, "2 Stores created" );
        equal( Object.keys( dm )[ 0 ], "createTest31", "Store Name createTest31" );
        equal( Object.keys( dm )[ 1 ], "createTest32", "Store Name createTest32" );
        equal( dm.createTest31 instanceof AeroGear.DataManager.adapters.Memory, true, "No Fallback should happen" );
        equal( dm.createTest32 instanceof AeroGear.DataManager.adapters.SessionLocal, true, "Fellback to SessionLocal" );
    });

    module( "DataManager Creation with fallbacks off", {
        setup: function() {

            for( var adapter in AeroGear.DataManager.validAdapters ) {
                if( adapter === "IndexedDB" || adapter === "WebSQL") {
                    delete AeroGear.DataManager.validAdapters[ adapter ];
                }
            }
        },
        teardown: function() {
            AeroGear.DataManager.validAdapters = validAdapters;
        }
    });

    test( "create WebSQL - No Fallback - name string", function() {
        expect( 3 );

        var dm = AeroGear.DataManager( { name: "createTest1", type: "WebSQL", settings: { fallback: false } } ).stores;
        equal( Object.keys( dm ).length, 1, "Single Store created" );
        equal( Object.keys( dm )[ 0 ], "createTest1", "Store Name createTest1" );
        equal( dm.createTest1 instanceof AeroGear.DataManager.adapters.WebSQL, true, "Didn't Fallback" );
    });

    test( "create WebSQL - No Fallback - name array", function() {
        expect( 5 );

        var dm = AeroGear.DataManager([
            {
                name: "createTest21",
                type: "WebSQL",
                settings: {
                    fallback: false
                }
            },
            "createTest23"
        ]).stores;

        equal( Object.keys( dm ).length, 2, "2 Stores created" );
        equal( Object.keys( dm )[ 0 ], "createTest21", "Store Name createTest21" );
        equal( Object.keys( dm )[ 1 ], "createTest23", "Store Name createTest23" );
        equal( dm.createTest21 instanceof AeroGear.DataManager.adapters.WebSQL, true, "Didn't Fallback" );
        equal( dm.createTest23 instanceof AeroGear.DataManager.adapters.Memory, true, "No Fallback should happen" );
    });

    test( "create - object", function() {
        expect( 5 );

        var dm = AeroGear.DataManager([
            {
                name: "createTest31"
            },
            {
                name: "createTest32",
                type: "WebSQL",
                settings: {
                    fallback: false
                }
            }
        ]).stores;

        equal( Object.keys( dm ).length, 2, "2 Stores created" );
        equal( Object.keys( dm )[ 0 ], "createTest31", "Store Name createTest31" );
        equal( Object.keys( dm )[ 1 ], "createTest32", "Store Name createTest32" );
        equal( dm.createTest31 instanceof AeroGear.DataManager.adapters.Memory, true, "No Fallback should happen" );
        equal( dm.createTest32 instanceof AeroGear.DataManager.adapters.WebSQL, true, "Didn't Fallback" );
    });

    module( "DataManager Creation with fallbacks while supplying preferred list", {
        setup: function() {

            for( var adapter in AeroGear.DataManager.validAdapters ) {
                if( adapter === "IndexedDB" || adapter === "WebSQL") {
                    delete AeroGear.DataManager.validAdapters[ adapter ];
                }
            }
        },
        teardown: function() {
            AeroGear.DataManager.validAdapters = validAdapters;
        }
    });

    test( "create IndexedDB - Fallsback to Memory - name string", function() {
        expect( 3 );

        var dm = AeroGear.DataManager( { name: "createTest1", type: "IndexedDB", settings: { preferred: [ "Memory" ] } } ).stores;
        equal( Object.keys( dm ).length, 1, "Single Store created" );
        equal( Object.keys( dm )[ 0 ], "createTest1", "Store Name createTest1" );
        equal( dm.createTest1 instanceof AeroGear.DataManager.adapters.Memory, true, "Fellback to Memory" );
    });

    test( "create IndexedDB and WebSQL - Fallsback to Memory - name array", function() {
        expect( 7 );

        var dm = AeroGear.DataManager([
            {
                name: "createTest21",
                type: "WebSQL",
                settings: { preferred: [ "Memory" ] }
            },
            {
                name: "createTest22",
                type: "IndexedDB"
            },
            "createTest23"
        ]).stores;

        equal( Object.keys( dm ).length, 3, "3 Stores created" );
        equal( Object.keys( dm )[ 0 ], "createTest21", "Store Name createTest21" );
        equal( Object.keys( dm )[ 1 ], "createTest22", "Store Name createTest22" );
        equal( Object.keys( dm )[ 2 ], "createTest23", "Store Name createTest23" );
        equal( dm.createTest21 instanceof AeroGear.DataManager.adapters.Memory, true, "Fellback to Memory" );
        equal( dm.createTest22 instanceof AeroGear.DataManager.adapters.SessionLocal, true, "Fellback to SessionLocal" );
        equal( dm.createTest23 instanceof AeroGear.DataManager.adapters.Memory, true, "No Fallback should happen" );
    });
})( );
