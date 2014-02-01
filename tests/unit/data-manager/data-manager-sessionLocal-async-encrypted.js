(function( $ ) {

    // Empty stores before starting tests
    for ( var sessionItem in window.sessionStorage ) {
        sessionStorage.removeItem( sessionItem );
    }
    for ( var localItem in window.localStorage ) {
        localStorage.removeItem( localItem );
    }

    module( "DataManager: SessionLocal" );

    test( "create - name string", function() {
        expect( 2 );

        var dm = AeroGear.DataManager({ name: "createTest1", type: "SessionLocal" }).stores;
        equal( Object.keys( dm ).length, 1, "Single Store created" );
        equal( Object.keys( dm )[ 0 ], "createTest1", "Store Name createTest1" );
    });

    test( "create - array", function() {
        expect( 4 );

        var dm = AeroGear.DataManager([
            {
                name: "createTest21",
                type: "SessionLocal"
            },
            {
                name: "createTest22",
                type: "SessionLocal"
            },
            {
                name: "createTest23",
                type: "SessionLocal"
            }
        ]).stores;

        equal( Object.keys( dm ).length, 3, "3 Stores created" );
        equal( Object.keys( dm )[ 0 ], "createTest21", "Store Name createTest21" );
        equal( Object.keys( dm )[ 1 ], "createTest22", "Store Name createTest22" );
        equal( Object.keys( dm )[ 2 ], "createTest23", "Store Name createTest23" );
    });

    test( "add and remove - string ", function() {
        expect( 5 );

        var dm = AeroGear.DataManager();
        dm.add({
            name: "addTest1",
            type: "SessionLocal"
        }),
        dm.add({
            name: "addTest2",
            type: "SessionLocal"
        });

        equal( Object.keys( dm.stores ).length, 2, "2 Stores added" );
        equal( Object.keys( dm.stores )[ 0 ], "addTest1", "Store Name addTest1" );
        equal( Object.keys( dm.stores )[ 1 ], "addTest2", "Store Name addTest2" );

        dm.remove( "addTest1" );
        equal( Object.keys( dm.stores ).length, 1, "1 Stores removed" );
        equal( dm.stores.addTest1, undefined, "Store Name addTest1 no longer exists" );
    });

    test( "add and remove - array ", function() {
        expect( 7 );

        var dm = AeroGear.DataManager();
        dm.add([
            {
                name: "addTest3",
                type: "SessionLocal"
            },
            {
                name: "addTest4",
                type: "SessionLocal"
            },
            {
                name: "addTest5",
                type: "SessionLocal"
            }
        ]);

        equal( Object.keys( dm.stores ).length, 3, "3 Stores added" );
        equal( Object.keys( dm.stores )[ 0 ], "addTest3", "Store Name addTest3" );
        equal( Object.keys( dm.stores )[ 1 ], "addTest4", "Store Name addTest4" );
        equal( Object.keys( dm.stores )[ 2 ], "addTest5", "Store Name addTest5" );

        dm.remove( ["addTest5", "addTest4"] );
        equal( Object.keys( dm.stores ).length, 1, "2 Stores removed" );
        equal( dm.stores.addTest4, undefined, "Store Name addTest4 no longer exists" );
        equal( dm.stores.addTest5, undefined, "Store Name addTest5 no longer exists" );
    });

    test( "add and remove - object ", function() {
        expect( 7 );

        var dm = AeroGear.DataManager();
        dm.add([
            {
                name: "addTest6",
                type: "SessionLocal"
            },
            {
                name: "addTest7",
                type: "SessionLocal"
            }
        ]);

        equal( Object.keys( dm.stores ).length, 2, "2 Stores added" );
        equal( Object.keys( dm.stores )[ 0 ], "addTest6", "Store Name addTest6" );
        equal( Object.keys( dm.stores )[ 1 ], "addTest7", "Store Name addTest7" );

        dm.remove( { name: "addTest6" } );
        equal( Object.keys( dm.stores ).length, 1, "1 Stores removed" );
        equal( dm.stores.addTest6, undefined, "Store Name addTest6 no longer exists" );

        dm.remove( [ { name: "addTest7" } ] );
        equal( Object.keys( dm.stores ).length, 0, "1 Stores removed" );
        equal( dm.stores.addTest7, undefined, "Store Name addTest7 no longer exists" );
    });

    // Create a default (memory) dataManager to store data for some tests
    var agcrypto = AeroGear.Crypto(),
        userStore = AeroGear.DataManager({
            name: "users",
            type: "SessionLocal",
            settings: {
                async: true,
                crypto: {
                    agcrypto: agcrypto,
                    options: {
                        key: "password"
                    }
                }
            }
        }).stores.users,
        userStoreReload;

    module( "DataManager: Memory - Data Manipulation",{
        setup: function() {
            userStore.save([
                {
                    id: 12345,
                    fname: "John",
                    lname: "Smith",
                    dept: "Accounting"
                },
                {
                    id: 12346,
                    fname: "Jane",
                    lname: "Smith",
                    dept: "IT"
                },
                {
                    id: 12347,
                    fname: "John",
                    lname: "Doe",
                    dept: "Marketing"
                },
                {
                    id: 12348,
                    fname: "Jane",
                    lname: "Doe",
                    dept: "Accounting"
                },
                {
                    id: 12349,
                    fname: "Any",
                    lname: "Name",
                    dept: "IT"
                },
                {
                    id: 12350,
                    fname: "Another",
                    lname: "Person",
                    dept: "Marketing"
                }
            ], { reset: true } );
        }
    });

    test( "load session stored data", function() {
        userStoreReload = AeroGear.DataManager({
            name: "users",
            type: "SessionLocal",
            settings: {
                async: true,
                crypto: {
                    agcrypto: agcrypto,
                    options: {
                        key: "password"
                    }
                }
            }
        }).stores.users;

        userStore.read().then( function( data ) {
            equal( data.length, 6, "Read all data" );
        });

        userStoreReload.read().then( function( data ) {
            equal( data.length, 6, "Previously stored data added to store" );
        });
    });


    // Read data
    test( "read", function() {
        expect( 2 );
        userStore.read().then( function( data ) {
            equal( data.length, 6, "Read all data" );
        });
        userStore.read( 12345 ).then( function( data ) {
            equal( data.length, 1, "Read single item by id" );
        });
    });

    // Save data
    test( "save single", function() {
        expect( 2 );

        userStore.save({
            id: 12351,
            fname: "New",
            lname: "Person",
            dept: "New"
        });

        userStore.read().then( function( data ) {
            equal( data.length, 7, "Read all data including new item" );
        });

        userStore.read( 12351 ).then( function( data ) {
            equal( data.length, 1, "Read new item by id" );
        });
    });
    test( "save multiple", function() {
        expect( 2 );

        userStore.save([
            {
                id: 12352,
                fname: "New",
                lname: "Person2",
                dept: "New"
            },
            {
                id: 12353,
                fname: "New",
                lname: "Person3",
                dept: "New"
            }
        ]);

        userStore.read().then( function( data ) {
            equal( data.length, 8, "Read all data including new item" );
        });

        userStore.read( 12353 ).then( function( data ) {
            equal( data.length, 1, "Read new item by id" );
        });
    });
    test( "update single", function() {
        expect( 3 );

        userStore.save({
            id: 12351,
            fname: "New",
            lname: "Person",
            dept: "New"
        });
        userStore.read( 12351 ).then( function( data ) {
            equal( data.length, 1, "Read new item by id" );
        });

        // Now Update
        userStore.save({
            id: 12351,
            fname: "Updated",
            lname: "Person",
            dept: "New"
        });

        userStore.read().then( function( data ) {
            equal( data.length, 7, "Data length unchanged" );
        });

        userStore.read( 12351 ).then( function( data ) {
            equal( data[ 0 ].fname, "Updated", "Check item is updated" );
        });
    });
    test( "update multiple", function() {
        expect( 2 );

        // Save New ones first
        userStore.save([
            {
                id: 12352,
                fname: "New",
                lname: "Person2",
                dept: "New"
            },
            {
                id: 12353,
                fname: "New",
                lname: "Person3",
                dept: "New"
            }
        ]);

        // Now Update
        userStore.save([
            {
                id: 12352,
                fname: "Updated",
                lname: "Person2",
                dept: "New"
            },
            {
                id: 12353,
                fname: "Updated",
                lname: "Person3",
                dept: "New"
            }
        ]);

        userStore.read().then( function( data ) {
            equal( data.length, 8, "Data length unchanged" );
        });

        userStore.read( 12353 ).then( function( data ) {
            equal( data[ 0 ].fname, "Updated", "Check item is updated" );
        });
    });
    test( "update and add", function() {
        expect( 3 );

        userStore.save([
            {
                id: 12349,
                fname: "UpdatedAgain",
                lname: "Person2",
                dept: "New"
            },
            {
                id: 12354,
                fname: "New",
                lname: "Person4",
                dept: "New"
            }
        ]);

        userStore.read().then( function( data ) {
            equal( data.length, 7, "One new item added" );
        });

        userStore.read( 12349 ).then( function( data ) {
            equal( data[ 0 ].fname, "UpdatedAgain", "Check item is updated" );
        });

        userStore.read( 12354 ).then( function( data ) {
            equal( data.length, 1, "Read new item by id" );
        });
    });

    // Remove data
    test( "remove single", function() {
        expect( 2 );

        userStore.remove( 12345 );
        userStore.read().then( function( data ) {
            equal( data.length, 5, "Read all data without removed item" );
        });
        userStore.read( 12345 ).then( function( data ) {
            equal( data.length, 0, "Removed item doesn't exist" );
        });
    });
    test( "remove multiple - different formats", function() {
        expect( 3 );
        var otherData;
        userStore.read( 12345 ).then( function( data ) {
            otherData = data;
        });

        userStore.remove([
            12346,
            otherData[ 0 ]
        ]);

        userStore.read().then( function( data ) {
            equal( data.length, 4, "Read all data without removed item" );
        });
        userStore.read( 12345 ).then( function( data ) {
            equal( data.length, 0, "Removed item doesn't exist" );
        });
        userStore.read( 12346 ).then( function( data ) {
            equal( data.length, 0, "Removed item doesn't exist" );
        });
    });

    // Filter Data
    test( "filter single field", function() {
        expect( 3 );

        var filtered;

        userStore.filter({
            fname: "John"
        }).then( function( data ){
            filtered = data;
        });

        userStore.read().then( function( data ) {
            equal( data.length, 6, "Original Data Unchanged" );
        });

        equal( filtered.length, 2, "2 Items Matched Query" );
        ok( filtered[ 0 ].fname === "John" && filtered[ 1 ].fname === "John", "Correct items returned" );
    });
    test( "filter multiple fields, single value - AND", function() {
        expect( 3 );

        var filtered;

        userStore.filter({
            fname: "John",
            dept: "Marketing"
        }).then( function( data ){
            filtered = data;
        });

        userStore.read().then( function( data ) {
            equal( data.length, 6, "Original Data Unchanged" );
        });
        equal( filtered.length, 1, "1 Item Matched Query" );
        ok( filtered[ 0 ].fname === "John" && filtered[ 0 ].dept === "Marketing", "Correct item returned" );
    });
    test( "filter multiple fields, single value - OR", function() {
        expect( 3 );

        var filtered;

        userStore.filter({
            fname: "John",
            dept: "Marketing"
        }, true ).then( function( data ){
            filtered = data;
        });

        userStore.read().then( function( data ) {
            equal( data.length, 6, "Original Data Unchanged" );
        });
        equal( filtered.length, 3, "3 Items Matched Query" );
        ok( filtered[ 0 ].fname === "John" && filtered[ 1 ].fname === "John" && filtered[ 1 ].dept === "Marketing" && filtered[ 2 ].dept === "Marketing", "Correct items returned" );
    });
    test( "filter single field, multiple values - AND (probably never used, consider removing)", function() {
        expect( 2 );

        var filtered;

        userStore.filter({
            fname: {
                data: [ "John", "Jane" ]
            }
        }).then( function( data ) {
            filtered = data;
        });

        userStore.read().then( function( data ) {
            equal( data.length, 6, "Original Data Unchanged" );
        });
        equal( filtered.length, 0, "0 Items Matched Query" );
    });
    test( "filter single field, multiple values - OR", function() {
        expect( 3 );

        var filtered;

        userStore.filter({
            fname: {
                data: [ "John", "Jane" ],
                matchAny: true
            }
        }).then( function( data ) {
            filtered = data;
        });

        userStore.read().then( function( data ) {
            equal( data.length, 6, "Original Data Unchanged" );
        });
        equal( filtered.length, 4, "4 Items Matched Query" );
        ok( filtered[ 0 ].fname === "John" && filtered[ 1 ].fname === "Jane" && filtered[ 2 ].fname === "John" && filtered[ 3 ].fname === "Jane", "Correct items returned" );
    });
    test( "filter multiple fields - AND, multiple values - OR", function() {
        expect( 3 );

        var filtered;

        userStore.filter({
            fname: {
                data: [ "John", "Jane" ],
                matchAny: true
            },
            dept: "Accounting"
        }).then( function( data ) {
            filtered = data;
        });

        userStore.read().then( function( data ) {
            equal( data.length, 6, "Original Data Unchanged" );
        });
        equal( filtered.length, 2, "2 Items Matched Query" );
        ok( filtered[ 0 ].fname === "John" && filtered[ 0 ].dept === "Accounting" && filtered[ 1 ].fname === "Jane" && filtered[ 1 ].dept === "Accounting", "Correct items returned" );
    });
    test( "filter multiple fields - OR, multiple values - OR", function() {
        expect( 3 );

        var filtered;

        userStore.filter({
            fname: {
                data: [ "John", "Jane" ],
                matchAny: true
            },
            dept: {
                data: [ "Accounting", "IT" ],
                matchAny: true
            }
        }, true ).then( function( data ) {
            filtered = data;
        });

        userStore.read().then( function( data ) {
            equal( data.length, 6, "Original Data Unchanged" );
        });
        equal( filtered.length, 5, "5 Items Matched Query" );
        ok( filtered[ 0 ].id !== 12350 && filtered[ 1 ].id !== 12350 && filtered[ 2 ].id !== 12350 && filtered[ 3 ].id !== 12350 && filtered[ 4 ].id !== 12350, "Correct items returned" );
    });

    // create a default(memory) dataManager to store data for some tests
    var tasksStore = AeroGear.DataManager({
            name: "tasks",
            type: "SessionLocal",
            settings: {
                async: true
            }
        }).stores.tasks;

    module( "Filter - Advanced", {
        setup: function() {
            tasksStore.save([
                {
                    id: 123,
                    date: "2012-10-03",
                    title: "Task 0-1",
                    description: "Task 0-1 description Text",
                    project: 99,
                    tags: [ ]
                },
                {
                    id: 12345,
                    date: "2012-07-30",
                    title: "Task 1-1",
                    description: "Task 1-1 description text",
                    project: 11,
                    tags: [ 111 ]
                },
                {
                    id: 67890,
                    date: "2012-07-30",
                    title: "Task 2-1",
                    description: "Task 2-1 description text",
                    project: 22,
                    tags: [ 111, 222 ]
                },
                {
                    id: 54321,
                    date: "2012-07-30",
                    title: "Task 3-1",
                    description: "Task 3-1 description text",
                    project: 33,
                    tags: [ 222 ]
                }
            ], { reset: true } );
        }
    });

    test( "filter single field , Array in Data, AND", function() {
        expect( 2 );

        var filtered;

        tasksStore.filter( { tags: 111 } ).then( function( data ) { filtered = data; } );

        tasksStore.read().then( function( data ) {
            equal( data.length, 4, "Original Data Unchanged" );
        });
        equal( filtered.length, 1, "1 Item Matched" );
    });

    test( "filter single field , Array in Data, OR", function() {
        expect( 2 );

        var filtered;

        tasksStore.filter( { tags: 111 }, true ).then( function( data ) { filtered = data; } );

        tasksStore.read().then( function( data ) {
            equal( data.length, 4, "Original Data Unchanged" );
        });
        equal( filtered.length, 2, "2 Items Matched" );
    });

    test( "filter multiple fields , Array in Data, AND ", function() {
        expect( 2 );

        var filtered;

        tasksStore.filter({
            tags: 111,
            project: 11
        }, false ).then( function( data ) { filtered = data; } );

        tasksStore.read().then( function( data ) {
            equal( data.length, 4, "Original Data Unchanged" );
        });
        equal( filtered.length, 1, "1 Item Matched" );
    });

    test( "filter multiple fields , Array in Data, OR ", function() {
        expect( 2 );

        var filtered;

        tasksStore.filter({
            tags: 111,
            project: 11
        }, true ).then( function( data ) { filtered = data; } );

        tasksStore.read().then( function( data ) {
            equal( data.length, 4, "Original Data Unchanged" );
        });
        equal( filtered.length, 2, "2 Item Matched" );
    });

    test( "filter single field Multiple Values, Array in Data, AND", function() {
        expect(2);

        var filtered;

        tasksStore.filter({
            tags: {
                data: [ 111, 222 ],
                matchAny: false
            }
        }).then( function( data ) { filtered = data; } );

        tasksStore.read().then( function( data ) {
            equal( data.length, 4, "Original Data Unchanged" );
        });
        equal( filtered.length, 1, "1 Item Matched" );
    });

    test( "filter single field Multiple Values, Array in Data, OR", function() {
        expect(2);

        var filtered;

        tasksStore.filter({
            tags: {
                data: [ 111, 222 ],
                matchAny: true
            }
        }).then( function( data ) { filtered = data; } );

        tasksStore.read().then( function( data ) {
            equal( data.length, 4, "Original Data Unchanged" );
        });
        equal( filtered.length, 3, "3 Items Matched" );
    });

    module( "Filter Data with Nested Objects",{
        setup: function() {
            tasksStore.save([
                {
                    id: 123,
                    date: "2012-10-03",
                    title: "Task 0-1",
                    description: "Task 0-1 description Text",
                    project: 99,
                    tags: [ ]
                },
                {
                    id: 12345,
                    date: "2012-07-30",
                    title: "Task 1-1",
                    description: "Task 1-1 description text",
                    project: 11,
                    tags: [ 111 ]
                },
                {
                    id: 67890,
                    date: "2012-07-30",
                    title: "Task 2-1",
                    description: "Task 2-1 description text",
                    project: 22,
                    tags: [ 111, 222 ]
                },
                {
                    id: 54321,
                    date: "2012-07-30",
                    title: "Task 3-1",
                    description: "Task 3-1 description text",
                    project: 33,
                    tags: [ 222 ]
                },
                {
                    id: 999999,
                    date: "2012-07-30",
                    title: "Task",
                    description: "Task description text",
                    nested: {
                        anotherNest: {
                            "crazy.key": {
                                val: 12345
                            }
                        }
                    }
                },
                {
                    id: 999998,
                    date: "2012-07-30",
                    title: "Task",
                    description: "Task description text",
                    nested: {
                        someOtherNest: {
                            "crazy.key": {
                                val: 67890
                            }
                        }
                    }
                },
                {
                    id: 999997,
                    date: "2012-07-30",
                    title: "Task",
                    description: "Task description text",
                    nested: {
                        someOtherNest: {
                            "crazy.key": {
                                val: 67890
                            }
                        }
                    },
                    moreNesting: {
                        hi: "there"
                    }
                }
            ]);
        }
    });

    test( "filter data with nested objects", function() {
        expect(6);

        var filtered, filtered2, filtered3, filtered4, filtered5;

        tasksStore.filter({
                nested: { anotherNest: { "crazy.key": { val: 12345 } } }
        }).then( function( data ) { filtered = data; } );

        tasksStore.filter({
            nested: {
                data: [ { anotherNest: { "crazy.key": { val: 12345 } } } ]
            }
        }).then( function( data ) { filtered2 = data; } );

        tasksStore.filter({
            nested: {
                data: [ { anotherNest: { "crazy.key": { val: 12345 } } }, { someOtherNest: { "crazy.key": { val: 67890 } } } ],
                matchAny: true
            }
        }).then( function( data ) { filtered3 = data; } );

        tasksStore.filter({
            nested: { someOtherNest: { "crazy.key": { val: 67890 } } },
            moreNesting: { hi: "there" }
        }).then( function( data ) { filtered4 = data; } );

        tasksStore.filter({
            nested: { someOtherNest: { "crazy.key": { val: 67890 } } },
            moreNesting: { hi: "there" }
        }, true).then( function( data ) { filtered5 = data; } );

        tasksStore.read().then( function( data ) {
            equal( data.length, 7, "Original Data Unchanged" );
        });
        equal( filtered.length, 1, "Value only" );
        equal( filtered2.length, 1, "Value in array" );
        equal( filtered3.length, 3, "Single field - Multiple values" );
        equal( filtered4.length, 1, "Multiple fields - Single value - AND" );
        equal( filtered5.length, 2, "Multiple fields - Single value - OR" );
    });

    module( "DataManager: SessionLocal - Size Limits" );

    // Empty stores before size tests
    for ( sessionItem in window.sessionStorage ) {
        sessionStorage.removeItem( sessionItem );
    }
    for ( localItem in window.localStorage ) {
        localStorage.removeItem( localItem );
    }

    // Create a session and a local store for testing data size limits
    var sizeErrorHandler = function( error, data ) {
            ok( true, "Error properly handled" );
        },
        sizeSuccessHandler = function( data ) {
            ok( true, "Data Saved Successfully" );
        },
        sizeStores = AeroGear.DataManager([
        {
            name: "size1",
            type: "SessionLocal",
            settings: {
                async: true
            }
        },
        {
            name: "size2",
            type: "SessionLocal",
            settings: {
                storageType: "localStorage",
                async: true
            }
        }
    ]);

    test( "size limit - sessionStorage", function() {
        expect( 2 );

        var store = sizeStores.stores.size1,
            data1 = new Array( 1048576 ).join( "x" ),
            data2 = new Array( 1048576 * 6 ).join( "x" ),
            max = 12;

        store.save({
            id: "test",
            val: data1
        }, {
            success: sizeSuccessHandler,
            error: sizeErrorHandler
        });

        store.save({
            id: "test",
            val: data2
        }, {
            success: sizeSuccessHandler,
            error: sizeErrorHandler
        });
    });

    test( "size limit - localStorage", function() {
        expect( 2 );

        var store = sizeStores.stores.size2,
            data1 = new Array( 1048576 ).join( "x" ),
            data2 = new Array( 1048576 * 6 ).join( "x" ),
            max = 12;

        store.save({
            id: "test",
            val: data1
        }, {
            success: sizeSuccessHandler,
            error: sizeErrorHandler
        });

        store.save({
            id: "test",
            val: data2
        }, {
            success: sizeSuccessHandler,
            error: sizeErrorHandler
        });
    });
})( jQuery );
