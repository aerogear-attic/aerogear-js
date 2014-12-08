import DataManager from 'aerogear.datamanager';
import 'indexeddb';
import Crypto from 'aerogear.crypto';

( function() {

    if ( !window.indexedDB ) {
        return;
    }

    module( "DataManager: IndexedDB" );

    test( "Existence of IndexedDB", function() {
        expect( 1 );
        ok( window.indexedDB );
    });

    // This can test a Delete method?
    asyncTest( "clean up", function() {
        expect( 0 );
        var deleteRequest,
            dbs = [ "test1" ];

        for( var db in dbs ) {
            deleteRequest = window.indexedDB.deleteDatabase( dbs[ db ] );
        }

        deleteRequest.onsuccess = function() {
            start();
        };
    });
})();

( function() {

    if ( !window.indexedDB ) {
        return;
    }

    var dm = DataManager();

    module( "DataManager: IndexedDB - Create and Test open failure", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "IndexedDB",
                settings: {
                    agcrypto: Crypto(),
                    auto: false
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
        equal( dm.stores.test1 instanceof DataManager.adapters.IndexedDB, true, "new Indexed DB instance created" );
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

    if ( !window.indexedDB ) {
        return;
    }

    var dm = DataManager();

    module( "DataManager: IndexedDB - Open", {
        setup: function() {
            dm.add({
                name: "test1",
                type: "IndexedDB",
                settings: {
                    auto: false,
                    agcrypto: Crypto()
                }
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

        dm.stores.test1.open()
            .then( function( data ) {
                ok( true, "IndexedDB test1 created successfully" );
                equal( data.name, "test1", "Store Name test1" );
                equal( data.objectStoreNames.length, 1, "Object Store length should be 1" );
                equal( data.objectStoreNames[ 0 ], "test1", "Object Store name should be test1" );
                start();
            })
            .catch( function( error ) {
                ok( false, "error, IndexedDB create error" + error );
                start();
            });
    });
})();

(function() {

    if ( !window.indexedDB ) {
        return;
    }

    var dm = DataManager(),
        data = null;

    module( "DataManager: IndexedDB - Save", {
        setup: function() {
            stop();

            dm.add({
                name: "test1",
                type: "IndexedDB",
                settings: {
                    crypto: {
                        agcrypto: Crypto(),
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

    asyncTest( "Save Data - Array", function() {
        expect( 3 );
        dm.stores.test1.save( data )
            .then( function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 2, "2 items in database" );
                equal( data[ 1 ].name, "Otter", "encrypted saved data is decrypted successfully" );
                start();
            })
            .catch( function( error ) {
                console.log( error );
                ok( false, "Failed to save records" + error );
                start();
            });
    });

    asyncTest( "Save Data - 1 Item", function() {
        expect( 3 );
        dm.stores.test1.save( { "id": 3, "name": "Grace", "type": "Little Person" } )
            .then( function( data ) {
                ok( true, "Data Saved Successfully" );
                equal( data.length, 1, "1 items in database" );
                equal( data[ 0 ].name, "Grace", "encrypted saved data is decrypted successfully"  );
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

    if ( !window.indexedDB ) {
        return;
    }

    var dm = DataManager(),
        data = null;

    module( "DataManager: IndexedDB - Read", {
        setup: function() {
            stop();

            dm.add({
                name: "test1",
                type: "IndexedDB",
                settings: {
                    crypto: {
                        agcrypto: Crypto(),
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
                start();
            });
    });
})();

(function() {

    if ( !window.indexedDB ) {
        return;
    }

    var dm = DataManager(),
        data = null;

    module( "DataManager: IndexedDB - Update", {
        setup: function() {
            stop();

            dm.add({
                name: "test1",
                type: "IndexedDB",
                settings: {
                    crypto: {
                        agcrypto: Crypto(),
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

    asyncTest( "Update Data - 1 item", function() {
        expect( 3 );
        dm.stores.test1.save( data )
            .then( function() {
                return dm.stores.test1.save( { "id": 1, "name": "Lucas", "type": "human" } );
            })
            .then( function( data ) {
                ok( true, "update 1 item successful" );
                equal( data.length, 2, "2 items still returned" );
                equal( data[ 0 ].name, "Lucas", "Name field Updated"  );
                start();
            })
            .catch( function( error ) {
                ok( false, "update 1 has errors" + error );
                start();
            });
    });
})();

(function() {

    if ( !window.indexedDB ) {
        return;
    }

    var dm = DataManager(),
        data = null;

    module( "DataManager: IndexedDB - Remove", {
        setup: function() {
            stop();

            dm.add({
                name: "test1",
                type: "IndexedDB",
                settings: {
                    crypto: {
                        agcrypto: Crypto(),
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

    if ( !window.indexedDB ) {
        return;
    }

    var dm = DataManager(),
        data = null;

    module( "DataManager: IndexedDB - Filter", {
        setup: function() {
            stop();

            dm.add({
                name: "test1",
                type: "IndexedDB",
                settings: {
                    crypto: {
                        agcrypto: Crypto(),
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

    asyncTest( "filter Data - 1 item", function() {
        expect( 3 );
        dm.stores.test1.save( data )
            .then( function() {
                return dm.stores.test1.filter( { "name": "Luke" }, true);
            })
            .then( function( data ) {
                ok( true, "filter 1 item successfully" );
                equal( data.length, 1, "1 item returned" );
                equal( data[ 0 ].name, "Luke", "Name field returned"  );
                start();
            })
            .catch( function( error ) {
                ok( false, "update 1 has errors" + error );
                start();
            });
    });
})();

( function() {

    if ( !window.indexedDB ) {
        return;
    }

    var dm = DataManager();
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

        deleteRequest.onsuccess = function() {
            start();
        };

        deleteRequest.onerror = function() {
            start();
        };
    });
})();
