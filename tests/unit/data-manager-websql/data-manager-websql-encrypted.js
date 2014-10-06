( function() {

    module( "DataManager: WebSQL" );

    test( "Existence of WebSQL", function() {
        expect( 1 );
        ok( window.openDatabase );
    });

    var dm = AeroGear.DataManager();
    dm.add({
        name: "test1q",
        type: "WebSQL",
        settings: {
            crypto: {
                agcrypto: AeroGear.Crypto(),
                options: {
                    key: "password"
                }
            }
        }
    });
})();

( function() {
    var dm = AeroGear.DataManager();

    module( "DataManager: WebSQL - Create and Test open failure", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    auto: false,
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });
        },
        teardown: function() {
            dm.remove( "test1" );
        }
    });

    test( "Create - Name String", function(){
        expect( 2 );

        equal( Object.keys( dm.stores ).length, 1, "1 store created" );
        equal( dm.stores.test1 instanceof AeroGear.DataManager.adapters.WebSQL, true, "new WebSQL DB instance created" );
    });

    asyncTest( "Read - DB not open.  Should Fail", function() {
        expect( 1 );

        dm.stores.test1.read( undefined )
            .catch( function( error ) {
                equal( error, "Database not opened", "error should be caught" );
                start();
            });
    });

    asyncTest( "Save - DB not open.  Should Fail", function() {
        expect( 1 );

        dm.stores.test1.save( {} )
            .catch( function( error ) {
                equal( error, "Database not opened", "error should be caught" );
                start();
            });
    });

    asyncTest( "Remove - DB not open.  Should Fail", function() {
        expect( 1 );

        dm.stores.test1.remove( undefined )
            .catch( function( error ) {
                equal( error, "Database not opened", "error should be caught" );
                start();
            });
    });

    asyncTest( "Filter - DB not open.  Should Fail", function() {
        expect( 1 );

        dm.stores.test1.filter( { "name": "Lucas" }, true )
            .catch( function( error ) {
                equal( error, "Database not opened", "error should be caught" );
                start();
            });
    });
})();

( function() {
    var dm = AeroGear.DataManager();

    module( "DataManager: WebSQL - Open", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    auto: false,
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });
        },
        teardown: function() {
            stop();
            dm.stores.test1.remove( undefined )
                .then( function() {
                    start();
                })
                .catch( function() {
                    start();
                });
        }
    });

    asyncTest( "Open", function() {
        expect( 1 );

        dm.stores.test1.open()
            .then( function() {
                ok( true, "WebSQL test1 created successfully" );
                start();
            })
            .catch( function( error ) {
                ok( false, "error, WebSQL create error" + error );
                start();
            });
    });
})();

(function() {
    var dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: WebSQL - Save", {
        setup: function() {
            stop();

            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });

            data = [
                {
                    "id": 1,
                    "name": "Luke",
                    "type": "Human"
                },
                {
                    "id": 2,
                    "name": "Otter",
                    "type": "Cat"
                }
            ];

            dm.stores.test1.open()
                .then( start );
        },
        teardown: function() {
            stop();
            dm.stores.test1.remove( undefined )
                .then( function() {
                    start();
                })
                .catch( function() {
                    start();
                });
        }
    });

    asyncTest( "Save Data - Array", function() {
        expect( 2 );
        dm.stores.test1.save( data )
            .then( function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 2, "2 items in database" );
                start();
            })
            .catch( function( error ) {
                console.log( error );
                ok( false, "Failed to save records" + error );
                start();
            });
    });

    asyncTest( "Save Data - 1 Item", function() {
        expect( 2 );

        dm.stores.test1.save( { "id": 3, "name": "Grace", "type": "Little Person" } )
            .then( function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 1, "1 items in database" );
                start();
            })
            .catch( function( error ) {
                console.log( error );
                ok( false, "Failed to save records" + error );
                start();
            });
    });

    asyncTest( "Save Data - Array - Reset", function() {
        expect( 4 );
        var newData = [
            {
                "id": 3,
                "name": "Luke",
                "type": "Human"
            },
            {
                "id": 4,
                "name": "Otter",
                "type": "Cat"
            }
        ];

        dm.stores.test1.save( data )
            .then( function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 2, "2 items in database" );
            })
            .then( function() {
                return dm.stores.test1.save( newData, { reset: true } );
            })
            .then( function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 2, "2 items in database" );
                start();
            });
    });
})();

(function() {
    var dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: WebSQL - Read", {
        setup: function() {
            stop();

            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });

            data = [
                {
                    "id": 1,
                    "name": "Luke",
                    "type": "Human"
                },
                {
                    "id": 2,
                    "name": "Otter",
                    "type": "Cat"
                }
            ];

            dm.stores.test1.open()
                .then( start );
        },
        teardown: function() {
            stop();
            dm.stores.test1.remove( undefined )
                .then( function() {
                    start();
                })
                .catch( function() {
                    start();
                });
        }
    });

    asyncTest( "Read Data - All", function() {
        expect( 2 );
        dm.stores.test1.save( data )
            .then( function() {
                return dm.stores.test1.read( undefined );
            })
            .then( function( data ) {
                ok( true, "read all data successful" );
                equal( data.length, 2, "2 items returned" );
                start();
            })
            .catch( function( error ) {
                ok( false, "Read All has errors" + error );
                start();
            });
    });

    asyncTest( "Read Data - 1 item - string", function() {
        expect( 2 );
        dm.stores.test1.save( data )
            .then( function() {
                return dm.stores.test1.read( 1 );
            })
            .then( function( data ) {
                ok( true, "read 1 item successful" );
                equal( data.length, 1, "1 items returned" );
                start();
            })
            .catch( function( error ) {
                ok( false, "Read 1 has errors" + error );
            });
    });
})();

(function() {
    var dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: WebSQL - Update", {
        setup: function() {
            stop();

            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });

            data = [
                {
                    "id": 1,
                    "name": "Luke",
                    "type": "Human"
                },
                {
                    "id": 2,
                    "name": "Otter",
                    "type": "Cat"
                }
            ];

            dm.stores.test1.open()
                .then( start );
        },
        teardown: function() {
            stop();
            dm.stores.test1.remove( undefined )
                .then( function() {
                    start();
                })
                .catch( function() {
                    start();
                });
        }
    });

    asyncTest( "Update Data - 1 item", function() {
        expect( 3 );
        dm.stores.test1.save( data )
            .then( function() {
                return dm.stores.test1.save( { "id": 1, "name": "Lucas", "type": "human" });
            })
            .then( function( data ) {
                ok( true, "update 1 item successful" );
                equal( data.length, 2, "2 items still returned" );
                equal( data[ 1 ].name, "Lucas", "Name field Updated"  );
                start();
            })
            .catch( function( error ) {
                ok( false, "update 1 has errors" + error );
                start();
            });
    });
})();

(function() {
    var dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: WebSQL - Remove", {
        setup: function() {
            stop();

            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });

            data = [
                {
                    "id": 1,
                    "name": "Luke",
                    "type": "Human"
                },
                {
                    "id": 2,
                    "name": "Otter",
                    "type": "Cat"
                }
            ];

            dm.stores.test1.open()
                .then( start );
        },
        teardown: function() {
            stop();
            dm.stores.test1.remove( undefined )
                .then( function() {
                    start();
                })
                .catch( function() {
                    start();
                });
        }
    });

    asyncTest( "Remove Data - 1 item - string", function() {
        expect( 2 );
        dm.stores.test1.save( data )
            .then( function() {
                return dm.stores.test1.remove( 1 );
            })
            .then( function( data ) {
                ok( true, "remove 1 item successful" );
                equal( data.length, 1, "1 items returned" );
                start();
            })
            .catch( function( error ) {
                ok( false, "remove 1 has errors" + error );
                start();
            });
    });

    asyncTest( "Remove Data - All", function() {
        expect( 2 );
        dm.stores.test1.save( data )
            .then( function() {
                return dm.stores.test1.remove( undefined );
            })
            .then( function( data ) {
                ok( true, "remove all items" );
                equal( data.length, 0, "0 items returned" );
                start();
            })
            .catch( function( error ) {
                ok( false, "remove all has errors" + error );
                start();
            });
    });
})();

(function() {
    var dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: WebSQL - Filter", {
        setup: function() {
            stop();

            dm.add({
                name: "test1",
                type: "WebSQL",
                settings: {
                    crypto: {
                        agcrypto: AeroGear.Crypto(),
                        options: {
                            key: "password"
                        }
                    }
                }
            });

            data = [
                {
                    "id": 1,
                    "name": "Luke",
                    "type": "Human"
                },
                {
                    "id": 2,
                    "name": "Otter",
                    "type": "Cat"
                }
            ];

            dm.stores.test1.open()
                .then( start );
        },
        teardown: function() {
            stop();
            dm.stores.test1.remove( undefined )
                .then( function() {
                    start();
                })
                .catch( function() {
                    start();
                });
        }
    });

    asyncTest( "filter Data - 1 item", function() {
        expect( 3 );
        dm.stores.test1.save( data )
            .then( function() {
                return dm.stores.test1.filter( { "name": "Luke" }, true );
            })
            .then( function( data ) {
                ok( true, "filter 1 item successfully" );
                equal( data.length, 1, "1 item returned" );
                equal( data[ 0 ].name, "Luke", "Name field returned"  );
                start();
            })
            .catch( function( error ) {
                console.log( error.stack );
                ok( false, "update 1 has errors: " + error );
                start();
            });
    });
})();

( function() {
    var dm = AeroGear.DataManager();
    dm.add({
        name: "test1",
        type: "WebSQL",
        settings: {
            crypto: {
                agcrypto: AeroGear.Crypto(),
                options: {
                    key: "password"
                }
            }
        }
    });
    module( "DataManager - Indexed - Cleanup on End",{
        setup: function() {
            stop();
            dm.stores.test1.open()
                .then( start );
        }
    });

    asyncTest( "end clean", function() {
        expect( 0 );
        dm.stores.test1.remove( undefined )
            .then( function() {
                start();
            })
            .catch( function() {
                start();
            });
    });
})();
