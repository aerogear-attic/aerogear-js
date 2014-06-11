(function() {

    module( "DataManager: Memory" );

    test( "create - name string", function() {
        expect( 2 );

        var dm = AeroGear.DataManager( "createTest1" ).stores;
        equal( Object.keys( dm ).length, 1, "Single Store created" );
        equal( Object.keys( dm )[ 0 ], "createTest1", "Store Name createTest1" );
    });

    test( "create - name array", function() {
        expect( 4 );

        var dm = AeroGear.DataManager([
            "createTest21",
            {
                name: "createTest22",
                type: "Memory"
            },
            "createTest23"
        ]).stores;

        equal( Object.keys( dm ).length, 3, "3 Stores created" );
        equal( Object.keys( dm )[ 0 ], "createTest21", "Store Name createTest21" );
        equal( Object.keys( dm )[ 1 ], "createTest22", "Store Name createTest22" );
        equal( Object.keys( dm )[ 2 ], "createTest23", "Store Name createTest23" );
    });

    test( "create - object", function() {
        expect( 3 );

        var dm = AeroGear.DataManager([
            {
                name: "createTest31"
            },
            {
                name: "createTest32",
                type: "Memory"
            }
        ]).stores;

        equal( Object.keys( dm ).length, 2, "2 Stores created" );
        equal( Object.keys( dm )[ 0 ], "createTest31", "Store Name createTest31" );
        equal( Object.keys( dm )[ 1 ], "createTest32", "Store Name createTest32" );
    });

    test( "add and remove - string ", function() {
        expect( 5 );

        var dm = AeroGear.DataManager();
        dm.add( "addTest1" );
        dm.add( "addTest2" );

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
            "addTest3",
            {
                name: "addTest4"
            },
            "addTest5"
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
                name: "addTest6"
            },
            {
                name: "addTest7"
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
    var contactStore = AeroGear.DataManager( { name: "contacts", settings: { async: true } } ).stores.contacts;

    module( "DataManager: Memory - Promise API", {
        setup: function() {
            contactStore.save([
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

    asyncTest( "methods return Promises", function() {
        var openPromise,
            readPromise,
            filterPromise,
            savePromise,
            deletePromise,
            closeReturnValue;

        expect( 6 );

        openPromise = contactStore.open();
        ok( openPromise instanceof Promise, "open() returns promise" );


        openPromise
            .then( function() {
                readPromise = contactStore.read();
                ok( readPromise instanceof Promise, "read() returns promise" );

                filterPromise = contactStore.filter({});
                ok( filterPromise instanceof Promise, "filter() returns promise" );

                savePromise = contactStore.save( {
                    id: 12351,
                    fname: "Joe",
                    lname: "Doe",
                    dept: "Vice President"
                } );
                ok( savePromise instanceof Promise, "save() returns promise" );

                deletePromise = contactStore.remove();
                ok( deletePromise instanceof Promise, "remove() returns promise" );

                return Promise.all( [ readPromise, deletePromise, filterPromise, savePromise ] );
            })
            .then( function() {
                closeReturnValue = contactStore.close();
                ok( closeReturnValue === undefined, "close() returns void" );
                start();
            });
    });

    // Create a default (memory) dataManager to store data for some tests
    var userStore = AeroGear.DataManager( { name: "contacts", settings: { async: true } } ).stores.contacts;

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


    // Read data
    asyncTest( "read", function() {
        expect( 2 );
        Promise.all([
            userStore.read().then( function( data ) {
                equal( data.length, 6, "Read all data" );
            }),
            userStore.read( 12345 ).then( function( data ) {
                equal( data.length, 1, "Read single item by id" );
            })
        ]).then(start);
    });

    // Save data
    asyncTest( "save single", function() {
        expect( 2 );

        userStore
            .save({
                id: 12351,
                fname: "New",
                lname: "Person",
                dept: "New"
            })
            .then(function() {
                return Promise.all([
                    userStore.read().then( function( data ) {
                        equal( data.length, 7, "Read all data including new item" );
                    }),

                    userStore.read( 12351 ).then( function( data ) {
                        equal( data.length, 1, "Read new item by id" );
                    })
                ]);
            })
            .then(start);
    });

    asyncTest( "save multiple", function() {
        expect( 2 );

        userStore
            .save([
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
            ])
            .then(function() {
                return Promise.all([
                    userStore.read().then( function( data ) {
                        equal( data.length, 8, "Read all data including new item" );
                    }),

                    userStore.read( 12353 ).then( function( data ) {
                        equal( data.length, 1, "Read new item by id" );
                    })
                ]);
            })
            .then(start);


    });
    asyncTest( "update single", function() {
        expect( 3 );

        userStore
            .save({
                id: 12351,
                fname: "New",
                lname: "Person",
                dept: "New"
            })
            .then(function() {
                return userStore.read( 12351 ).then( function( data ) {
                    equal( data.length, 1, "Read new item by id" );
                });
            })
            .then(function() {
                return userStore.save({
                    id: 12351,
                    fname: "Updated",
                    lname: "Person",
                    dept: "New"
                });
            })
            .then(function() {
                return Promise.all([
                    userStore.read().then( function( data ) {
                        equal( data.length, 7, "Data length unchanged" );
                    }),

                    userStore.read( 12351 ).then( function( data ) {
                        equal( data[ 0 ].fname, "Updated", "Check item is updated" );
                    })
                ]);
            })
            .then(start);
    });
    asyncTest( "update multiple", function() {
        expect( 2 );

        // Save New ones first
        userStore
            .save([
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
            ])
            .then(function() {
                // Now Update
                return userStore.save([
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
            })
            .then(function() {
                return Promise.all([
                    userStore.read().then( function( data ) {
                        equal( data.length, 8, "Data length unchanged" );
                    }),
                    userStore.read( 12353 ).then( function( data ) {
                        equal( data[ 0 ].fname, "Updated", "Check item is updated" );
                    })
                ]);
            })
            .then(start);
    });
    asyncTest( "update and add", function() {
        expect( 3 );

        userStore
            .save([
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
            ])
            .then(function() {
                return Promise.all([
                    userStore.read().then( function( data ) {
                        equal( data.length, 7, "One new item added" );
                    }),
                    userStore.read( 12349 ).then( function( data ) {
                        equal( data[ 0 ].fname, "UpdatedAgain", "Check item is updated" );
                    }),
                    userStore.read( 12354 ).then( function( data ) {
                        equal( data.length, 1, "Read new item by id" );
                    })
                ]);
            })
            .then(start);
    });

    // Remove data
    asyncTest( "remove single", function() {
        expect( 3 );

        userStore.remove( 12345 )
            .then( function( data ) {
                equal( data.length, 5, "Returns remaing data"  );
            })
            .then(function() {
                userStore.read().then( function( data ) {
                    equal( data.length, 5, "Read all data without removed item" );
                });
                userStore.read( 12345 ).then( function( data ) {
                    equal( data.length, 0, "Removed item doesn't exist" );
                });
            })
            .then(start);

    });
    asyncTest( "remove multiple - different formats", function() {
        expect( 3 );

        var otherData;
        userStore.read( 12345 )
            .then( function( data ) {
                otherData = data;
            })
            .then(function() {
                return userStore.remove([
                    12346,
                    otherData[ 0 ]
                ]);
            })
            .then(function() {
                Promise.all([
                    userStore.read().then( function( data ) {
                        equal( data.length, 4, "Read all data without removed item" );
                    }),
                    userStore.read( 12345 ).then( function( data ) {
                        equal( data.length, 0, "Removed item doesn't exist" );
                    }),
                    userStore.read( 12346 ).then( function( data ) {
                        equal( data.length, 0, "Removed item doesn't exist" );
                    })
                ]);
            })
            .then(start);
    });

    // Filter Data
    asyncTest( "filter single field", function() {
        expect( 3 );

        userStore.filter({ fname: "John" })
            .then( function( filtered ){
                equal( filtered.length, 2, "2 Items Matched Query" );
                ok( filtered[ 0 ].fname === "John" && filtered[ 1 ].fname === "John", "Correct items returned" );
            })
            .then(function() {
                userStore.read().then( function( data ) {
                    equal( data.length, 6, "Original Data Unchanged" );
                });
            })
            .then(start);
    });
    asyncTest( "filter multiple fields, single value - AND", function() {
        expect( 3 );

        userStore.filter({
                fname: "John",
                dept: "Marketing"
            })
            .then(function( filtered ){
                equal( filtered.length, 1, "1 Item Matched Query" );
                ok( filtered[ 0 ].fname === "John" && filtered[ 0 ].dept === "Marketing", "Correct item returned" );
            })
            .then(function() {
                return userStore.read().then( function( data ) {
                    equal( data.length, 6, "Original Data Unchanged" );
                });
            })
            .then(start);
    });
    asyncTest( "filter multiple fields, single value - OR", function() {
        expect( 3 );

        userStore.filter({
                fname: "John",
                dept: "Marketing"
            }, true )
            .then( function( filtered ){
                equal( filtered.length, 3, "3 Items Matched Query" );
                ok( filtered[ 0 ].fname === "John" && filtered[ 1 ].fname === "John" && filtered[ 1 ].dept === "Marketing" && filtered[ 2 ].dept === "Marketing", "Correct items returned" );
            })
            .then(function() {
                return userStore.read().then( function( data ) {
                    equal( data.length, 6, "Original Data Unchanged" );
                });
            })
            .then(start);
    });
    asyncTest( "filter single field, multiple values - AND (probably never used, consider removing)", function() {
        expect( 2 );

        userStore.filter({
                fname: {
                    data: [ "John", "Jane" ]
                }
            })
            .then( function( filtered ) {
                equal( filtered.length, 0, "0 Items Matched Query" );
            })
            .then(function() {
                return userStore.read().then( function( data ) {
                    equal( data.length, 6, "Original Data Unchanged" );
                });
            })
            .then(start);
    });
    asyncTest( "filter single field, multiple values - OR", function() {
        expect( 3 );

        userStore.filter({
                fname: {
                    data: [ "John", "Jane" ],
                    matchAny: true
                }
            })
            .then( function( filtered ) {
                equal( filtered.length, 4, "4 Items Matched Query" );
                ok( filtered[ 0 ].fname === "John" && filtered[ 1 ].fname === "Jane" && filtered[ 2 ].fname === "John" && filtered[ 3 ].fname === "Jane", "Correct items returned" );
            })
            .then(function() {
                return userStore.read().then( function( data ) {
                    equal( data.length, 6, "Original Data Unchanged" );
                });
            })
            .then(start);
    });
    asyncTest( "filter multiple fields - AND, multiple values - OR", function() {
        expect( 3 );

        userStore.filter({
                fname: {
                    data: [ "John", "Jane" ],
                    matchAny: true
                },
                dept: "Accounting"
            })
            .then( function( filtered ) {
                equal( filtered.length, 2, "2 Items Matched Query" );
                ok( filtered[ 0 ].fname === "John" && filtered[ 0 ].dept === "Accounting" && filtered[ 1 ].fname === "Jane" && filtered[ 1 ].dept === "Accounting", "Correct items returned" );
            })
            .then(function() {
                return userStore.read().then( function( data ) {
                    equal( data.length, 6, "Original Data Unchanged" );
                });
            })
            .then(start);
    });
    asyncTest( "filter multiple fields - OR, multiple values - OR", function() {
        expect( 3 );

        userStore.filter({
                fname: {
                    data: [ "John", "Jane" ],
                    matchAny: true
                },
                dept: {
                    data: [ "Accounting", "IT" ],
                    matchAny: true
                }
            }, true )
            .then( function( filtered ) {
                equal( filtered.length, 5, "5 Items Matched Query" );
                ok( filtered[ 0 ].id !== 12350 && filtered[ 1 ].id !== 12350 && filtered[ 2 ].id !== 12350 && filtered[ 3 ].id !== 12350 && filtered[ 4 ].id !== 12350, "Correct items returned" );
            })
            .then(function() {
                return userStore.read().then( function( data ) {
                    equal( data.length, 6, "Original Data Unchanged" );
                });
            })
            .then(start);
    });

    // create a default(memory) dataManager to store data for some tests
    var tasksStore = AeroGear.DataManager( { name: "tasks", settings: { async: true } } ).stores.tasks;

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
            ], true );
        }
    });

    asyncTest( "filter single field , Array in Data, AND", function() {
        expect( 2 );

        tasksStore.filter( { tags: 111 } )
            .then(function( filtered ) {
                equal( filtered.length, 1, "1 Item Matched" );
            })
            .then(function() {
                return tasksStore.read().then( function( data ) {
                    equal( data.length, 4, "Original Data Unchanged" );
                });
            })
            .then(start);
    });

    asyncTest( "filter single field , Array in Data, OR", function() {
        expect( 2 );

        tasksStore.filter( { tags: 111 }, true )
            .then( function( filtered ) {
                equal( filtered.length, 2, "2 Items Matched" );
            })
            .then(function() {
                return tasksStore.read().then( function( data ) {
                    equal( data.length, 4, "Original Data Unchanged" );
                });
            })
            .then(start);
    });

    asyncTest( "filter multiple fields , Array in Data, AND ", function() {
        expect( 2 );

        tasksStore.filter({
                tags: 111,
                project: 11
            }, false )
            .then( function( filtered ) {
                equal( filtered.length, 1, "1 Item Matched" );
            })
            .then(function() {
                return tasksStore.read().then( function( data ) {
                    equal( data.length, 4, "Original Data Unchanged" );
                });
            })
            .then(start);
    });

    asyncTest( "filter multiple fields , Array in Data, OR ", function() {
        expect( 2 );

        tasksStore.filter({
                tags: 111,
                project: 11
            }, true )
            .then( function( filtered ) {
                equal( filtered.length, 2, "2 Item Matched" );
            })
            .then(function() {
                return tasksStore.read().then( function( data ) {
                    equal( data.length, 4, "Original Data Unchanged" );
                });
            })
            .then(start);
    });

    asyncTest( "filter single field Multiple Values, Array in Data, AND", function() {
        expect(2);

        tasksStore.filter({
                tags: {
                    data: [ 111, 222 ],
                    matchAny: false
                }
            })
            .then( function( filtered ) {
                equal( filtered.length, 1, "1 Item Matched" );
            })
            .then( function() {
                tasksStore.read().then( function( data ) {
                    equal( data.length, 4, "Original Data Unchanged" );
                });
            })
            .then(start);
    });

    asyncTest( "filter single field Multiple Values, Array in Data, OR", function() {
        expect(2);

        tasksStore.filter({
                tags: {
                    data: [ 111, 222 ],
                    matchAny: true
                }
            })
            .then(function( filtered ) {
                equal( filtered.length, 3, "3 Items Matched" );
            })
            .then(function() {
                tasksStore.read().then( function( data ) {
                    equal( data.length, 4, "Original Data Unchanged" );
                });
            })
            .then(start);
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

    asyncTest( "filter data with nested objects", function() {
        expect(6);

        Promise.all([
                tasksStore.filter({
                            nested: { anotherNest: { "crazy.key": { val: 12345 } } }
                    })
                    .then(function( filtered ) {
                        equal( filtered.length, 1, "Value only" );
                    }),

                tasksStore.filter({
                        nested: {
                            data: [ { anotherNest: { "crazy.key": { val: 12345 } } } ]
                        }
                    })
                    .then( function( filtered ) {
                        equal( filtered.length, 1, "Value in array" );
                    }),

                tasksStore.filter({
                        nested: {
                            data: [ { anotherNest: { "crazy.key": { val: 12345 } } }, { someOtherNest: { "crazy.key": { val: 67890 } } } ],
                            matchAny: true
                        }
                    })
                    .then( function( filtered ) {
                        equal( filtered.length, 3, "Single field - Multiple values" );
                    }),

                tasksStore.filter({
                        nested: { someOtherNest: { "crazy.key": { val: 67890 } } },
                        moreNesting: { hi: "there" }
                    })
                    .then( function( filtered ) {
                        equal( filtered.length, 1, "Multiple fields - Single value - AND" );
                    }),

                tasksStore.filter({
                        nested: { someOtherNest: { "crazy.key": { val: 67890 } } },
                        moreNesting: { hi: "there" }
                    }, true)
                    .then( function( filtered ) {
                        equal( filtered.length, 2, "Multiple fields - Single value - OR" );
                    })

            ])
            .then(function() {
                return tasksStore.read().then( function( data ) {
                    equal( data.length, 7, "Original Data Unchanged" );
                });
            })
            .then(start);
    });
})();
