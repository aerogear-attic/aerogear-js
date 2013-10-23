( function( $ ) {

    module( "DataManager: IndexedDB" );

    test( "Existence of IndexedDB", function() {
        expect( 1 );
        ok( window.indexedDB );
    });

    //This can test a Delete method?
    asyncTest( "clean up", function() {
        expect( 0 );
        var deleteRequest,
            dbs = [ "test1" ];

        for( var db in dbs ) {
            deleteRequest = window.indexedDB.deleteDatabase( dbs[ db ] );
        }

        deleteRequest.onsuccess = function( event ) {
            start();
        };
    });
})( jQuery );

( function( $ ) {
    var dm = AeroGear.DataManager();

    module( "DataManager: IndexedDB - Create and Test open failure", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "IndexedDB"
            });
        },
        teardown: function() {
            dm.remove( "test1" );
        }
    });

    test( "Create - Name String", function(){
        expect( 2 );

        equal( Object.keys( dm.stores ).length, 1, "1 store created" );
        equal( dm.stores.test1 instanceof AeroGear.DataManager.adapters.IndexedDB, true, "new Indexed DB instance created" );
    });

    test( "Read - DB not open.  Should Fail", function() {
        expect( 1 );

        raises( function() {
                dm.stores.test1.read( undefined );
            },
            "Database not opened",
            "throws"
        );
    });

    test( "Save - DB not open.  Should Fail", function() {
        expect( 1 );

        raises( function() {
                dm.stores.test1.save( {} );
            },
            "Database not opened",
            "throws"
        );
    });

    test( "Remove - DB not open.  Should Fail", function() {
        expect( 1 );

        raises( function() {
                dm.stores.test1.remove( undefined );
            },
            "Database not opened",
            "throws"
        );
    });

    test( "Filter - DB not open.  Should Fail", function() {
        expect( 1 );

        raises( function() {
                dm.stores.test1.filter( { "name": "Lucas" }, true );
            },
            "Database not opened",
            "throws"
        );
    });
})( jQuery );

( function( $ ) {
    var dm = AeroGear.DataManager();

    module( "DataManager: IndexedDB - Open", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "IndexedDB"
            });
        },
        teardown: function() {
            var deleteRequest,
                dbs = [ "test1" ];

            dm.stores.test1.close();

            dm.remove( "test1" );

            for( var db in dbs ) {

                deleteRequest = window.indexedDB.deleteDatabase( dbs[ db ] );
            }

            deleteRequest.onsuccess = function( event ) {
                console.log( event );
            };

            deleteRequest.onerror = function( event ) {
                console.log( event );
            };
        }
    });

    asyncTest( "Open", function() {
        expect( 4 );

        dm.stores.test1.open({
            success: function( data ) {
                ok( true, "IndexedDB test1 created successfully" );
                equal( data.name, "test1", "Store Name test1" );
                equal( data.objectStoreNames.length, 1, "Object Store length should be 1" );
                equal( data.objectStoreNames[ 0 ], "test1", "Object Store name should be test1" );
                start();
            },
            error: function( error ) {
                ok( false, "error, IndexedDB create error" + error );
                start();
            }
        });
    });

    asyncTest( "Open as a promise", function() {
        expect( 4 );

        dm.stores.test1.open().then( function( data ) {
            ok( true, "IndexedDB test1 created successfully" );
            equal( data.name, "test1", "Store Name test1" );
            equal( data.objectStoreNames.length, 1, "Object Store length should be 1" );
            equal( data.objectStoreNames[ 0 ], "test1", "Object Store name should be test1" );
            start();
        });
    });
})( jQuery );

(function( $ ) {
    var hasopened,
        dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: IndexedDB - Save", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "IndexedDB"
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

            hasopened = dm.stores.test1.open();
        },
        teardown: function() {
            var deleteRequest,
                dbs = [ "test1" ];

            dm.stores.test1.close();

            dm.remove( "test1" );
            hasopened = undefined;

            for( var db in dbs ) {

                deleteRequest = window.indexedDB.deleteDatabase( dbs[ db ] );
            }

            deleteRequest.onsuccess = function( event ) {
                console.log( event );
            };

            deleteRequest.onerror = function( event ) {
                console.log( event );
            };
        }
    });

    asyncTest( "Save Data - Array", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data, {
            success: function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 2, "2 items in database" );
                start();
            },
            error: function( error ) {
                console.log( error );
                ok( false, "Failed to save records" + error );
                start();
            }
            });
        });
    });

    asyncTest( "Save Data - 1 Item", function() {
        expect( 2 );
            hasopened.always( function() {
                dm.stores.test1.save( { "id": 3, "name": "Grace", "type": "Little Person" }, {
                success: function( data ) {
                    ok( true, "Data Saved Successfully" );
                    equal( data.length, 1, "1 items in database" );
                    start();
                },
                error: function( error ) {
                    console.log( error );
                    ok( false, "Failed to save records" + error );
                    start();
                }
            });
        });
    });

    asyncTest( "Save Data - Array - as a promise", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).then( function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 2, "2 items in database" );
                start();
            });
        });
    });
})( jQuery );

(function( $ ) {
    var hasopened,
        dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: IndexedDB - Read", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "IndexedDB"
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

            hasopened = dm.stores.test1.open();
        },
        teardown: function() {
            var deleteRequest,
                dbs = [ "test1" ];

            dm.stores.test1.close();

            dm.remove( "test1" );
            hasopened = undefined;

            for( var db in dbs ) {

                deleteRequest = window.indexedDB.deleteDatabase( dbs[ db ] );
            }

            deleteRequest.onsuccess = function( event ) {
                console.log( event );
            };

            deleteRequest.onerror = function( event ) {
                console.log( event );
            };
        }
    });

    asyncTest( "Read Data - All", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.read( undefined, {
                    success: function( data ) {
                        ok( true, "read all data successful" );
                        equal( data.length, 2, "2 items returned" );
                        start();
                    },
                    error: function( error ) {
                        ok( false, "Read All has errors" + error );
                        start();
                    }
                });
            });
        });
    });

    asyncTest( "Read Data - 1 item - string", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
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
        });
    });

    asyncTest( "Read Data - All - as a Promise", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.read().then( function( data ) {
                    ok( true, "read all data successful" );
                    equal( data.length, 2, "2 items returned" );
                    start();
                });
            });
        });
    });
})( jQuery );

(function( $ ) {
    var hasopened,
        dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: IndexedDB - Update", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "IndexedDB"
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

            hasopened = dm.stores.test1.open();
        },
        teardown: function() {
            var deleteRequest,
                dbs = [ "test1" ];

            dm.stores.test1.close();

            dm.remove( "test1" );
            hasopened = undefined;

            for( var db in dbs ) {

                deleteRequest = window.indexedDB.deleteDatabase( dbs[ db ] );
            }

            deleteRequest.onsuccess = function( event ) {
                console.log( event );
            };

            deleteRequest.onerror = function( event ) {
                console.log( event );
            };
        }
    });

    asyncTest( "Update Data - 1 item", function() {
        expect( 3 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.save( { "id": 1, "name": "Lucas", "type": "human" }, {
                    success: function( data ) {
                        ok( true, "update 1 item successful" );
                        equal( data.length, 2, "2 items still returned" );
                        equal( data[ 0 ].name, "Lucas", "Name field Updated"  );
                        start();
                    },
                    error: function( error ) {
                        ok( false, "update 1 has errors" + error );
                        start();
                    }
                });
            });
        });
    });

    asyncTest( "Update Data - 1 item - as a promise", function() {
        expect( 3 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.save( { "id": 1, "name": "Lucas", "type": "human" } ).then( function( data ) {
                    ok( true, "update 1 item successful" );
                    equal( data.length, 2, "2 items still returned" );
                    equal( data[ 0 ].name, "Lucas", "Name field Updated"  );
                    start();
                });
            });
        });
    });
})( jQuery );

(function( $ ) {
    var hasopened,
        dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: IndexedDB - Remove", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "IndexedDB"
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

            hasopened = dm.stores.test1.open();
        },
        teardown: function() {
            var deleteRequest,
                dbs = [ "test1" ];

            dm.stores.test1.close();

            dm.remove( "test1" );
            hasopened = undefined;

            for( var db in dbs ) {

                deleteRequest = window.indexedDB.deleteDatabase( dbs[ db ] );
            }

            deleteRequest.onsuccess = function( event ) {
                console.log( event );
            };

            deleteRequest.onerror = function( event ) {
                console.log( event );
            };
        }
    });

    asyncTest( "Remove Data - 1 item - string", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.remove( 1, {
                    success: function( data ) {
                        ok( true, "remove 1 item successful" );
                        equal( data.length, 1, "1 items returned" );
                        start();
                    },
                    error: function( error ) {
                        ok( false, "remove 1 has errors" + error );
                        start();
                    }
                });
            });
        });
    });

    asyncTest( "Remove Data - All", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
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
        });
    });

    asyncTest( "Remove Data - All - as a promise", function() {
        expect( 2 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.remove().then( function( data ) {
                    ok( true, "remove all items" );
                    equal( data.length, 0, "0 items returned" );
                    start();
                });
            });
        });
    });
})( jQuery );

(function( $ ) {
    var hasopened,
        dm = AeroGear.DataManager(),
        data = null;

    module( "DataManager: IndexedDB - Filter", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "IndexedDB"
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

            hasopened = dm.stores.test1.open();
        },
        teardown: function() {
            var deleteRequest,
                dbs = [ "test1" ];

            dm.stores.test1.close();

            dm.remove( "test1" );
            hasopened = undefined;

            for( var db in dbs ) {

                deleteRequest = window.indexedDB.deleteDatabase( dbs[ db ] );
            }

            deleteRequest.onsuccess = function( event ) {
                console.log( event );
            };

            deleteRequest.onerror = function( event ) {
                console.log( event );
            };
        }
    });

    asyncTest( "filter Data - 1 item", function() {
        expect( 3 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.filter( { "name": "Luke" }, true, {
                    success: function( data ) {
                        ok( true, "filter 1 item successfully" );
                        equal( data.length, 1, "1 item returned" );
                        equal( data[ 0 ].name, "Luke", "Name field returned"  );
                        start();
                    },
                    error: function( error ) {
                        ok( false, "update 1 has errors" + error );
                        start();
                    }
                });
            });
        });
    });

    asyncTest( "filter Data - 1 item - as a promise", function() {
        expect( 3 );
        hasopened.always( function() {
            dm.stores.test1.save( data ).done( function() {
                dm.stores.test1.filter( { "name": "Luke" }, true ).then( function( data ) {
                    ok( true, "filter 1 item successfully" );
                    equal( data.length, 1, "1 item returned" );
                    equal( data[ 0 ].name, "Luke", "Name field returned"  );
                    start();
                });
            });
        });
    });
})( jQuery );

( function( $ ) {
    var dm = AeroGear.DataManager();
    dm.add({
        name: "test1",
        type: "IndexedDB"
    });
    module( "DataManager - Indexed - Cleanup on End" );

    asyncTest( "end clean", function() {
        expect( 0 );
        var deleteRequest,
            dbs = [ "test1" ];

       dm.stores.test1.close();

        for( var db in dbs ) {

            deleteRequest = window.indexedDB.deleteDatabase( dbs[ db ] );
        }

        deleteRequest.onsuccess = function( event ) {
            start();
        };

        deleteRequest.onerror = function( event ) {
            start();
        };
    });
})( jQuery );
