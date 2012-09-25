(function( $ ) {

// Do not reorder tests on rerun
QUnit.config.reorder = false;

module( "dataManager: memory" );

test( "create - name string", function() {
    expect( 3 );

    var dm = aerogear.dataManager( "createTest1" ).stores;
    equal( Object.keys( dm ).length, 1, "Single Store created" );
    equal( Object.keys( dm )[ 0 ], "createTest1", "Store Name createTest1" );
    equal( dm.createTest1.type, "memory", "Default store type (memory)" );
});

test( "create - name array", function() {
    expect( 7 );

    var dm = aerogear.dataManager([
        "createTest21",
        {
            name: "createTest22",
            type: "memory"
        },
        "createTest23"
    ]).stores;

    equal( Object.keys( dm ).length, 3, "3 Stores created" );
    equal( Object.keys( dm )[ 0 ], "createTest21", "Store Name createTest21" );
    equal( Object.keys( dm )[ 1 ], "createTest22", "Store Name createTest22" );
    equal( Object.keys( dm )[ 2 ], "createTest23", "Store Name createTest23" );
    equal( dm.createTest21.type, "memory", "Default store type (memory)" );
    equal( dm.createTest22.type, "memory", "Specified store type (memory)" );
    equal( dm.createTest23.type, "memory", "Default store type (memory)" );
});

test( "create - object", function() {
    expect( 5 );

    var dm = aerogear.dataManager([
        {
            name: "createTest31"
        },
        {
            name: "createTest32",
            type: "memory"
        }
    ]).stores;

    equal( Object.keys( dm ).length, 2, "2 Stores created" );
    equal( Object.keys( dm )[ 0 ], "createTest31", "Store Name createTest31" );
    equal( Object.keys( dm )[ 1 ], "createTest32", "Store Name createTest32" );
    equal( dm.createTest31.type, "memory", "Default store type (memory)" );
    equal( dm.createTest32.type, "memory", "Specified store type (memory)" );
});

test( "add and remove - string ", function() {
    expect( 7 );

    var dm = aerogear.dataManager();
    dm.add( "addTest1" ),
    dm.add( "addTest2" );

    equal( Object.keys( dm.stores ).length, 2, "2 Stores added" );
    equal( Object.keys( dm.stores )[ 0 ], "addTest1", "Store Name addTest1" );
    equal( Object.keys( dm.stores )[ 1 ], "addTest2", "Store Name addTest2" );
    equal( dm.stores.addTest1.type, "memory", "Default store type (memory)" );
    equal( dm.stores.addTest2.type, "memory", "Default store type (memory)" );

    dm.remove( "addTest1" );
    equal( Object.keys( dm.stores ).length, 1, "1 Stores removed" );
    equal( dm.stores.addTest1, undefined, "Store Name addTest1 no longer exists" );


});

test( "add and remove - array ", function() {
    expect( 10 );

    var dm = aerogear.dataManager();
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
    equal( dm.stores.addTest3.type, "memory", "Default store type (memory)" );
    equal( dm.stores.addTest4.type, "memory", "Default store type (memory)" );
    equal( dm.stores.addTest5.type, "memory", "Default store type (memory)" );

    dm.remove( ["addTest5", "addTest4"] );
    equal( Object.keys( dm.stores ).length, 1, "2 Stores removed" );
    equal( dm.stores.addTest4, undefined, "Store Name addTest4 no longer exists" );
    equal( dm.stores.addTest5, undefined, "Store Name addTest5 no longer exists" );


});

test( "add and remove - object ", function() {
    expect( 9 );

    var dm = aerogear.dataManager();
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
    equal( dm.stores.addTest6.type, "memory", "Default store type (memory)" );
    equal( dm.stores.addTest7.type, "memory", "Default store type (memory)" );

    dm.remove( { name: "addTest6" } );
    equal( Object.keys( dm.stores ).length, 1, "1 Stores removed" );
    equal( dm.stores.addTest6, undefined, "Store Name addTest6 no longer exists" );

    dm.remove( [ { name: "addTest7" } ] );
    equal( Object.keys( dm.stores ).length, 0, "1 Stores removed" );
    equal( dm.stores.addTest7, undefined, "Store Name addTest7 no longer exists" );



});

// Create a default (memory) dataManager to store data for some tests
var userStore = aerogear.dataManager( "users" ).stores.users;

// Initialize the data set
test( "save - initialize", function() {
    expect( 1 );

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
    ]);

    equal( userStore.data.length, 6, "Initial data added to store" );
});

// Read data
test( "read", function() {
    expect( 2 );

    equal( userStore.read().length, 6, "Read all data" );
    equal( userStore.read( 12345 ).length, 1, "Read single item by id" );
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
    equal( userStore.read().length, 7, "Read all data including new item" );
    equal( userStore.read( 12351 ).length, 1, "Read new item by id" );
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
    equal( userStore.read().length, 9, "Read all data including new items" );
    equal( userStore.read( 12353 ).length, 1, "Read new item by id" );
});
test( "update single", function() {
    expect( 2 );

    userStore.save({
        id: 12351,
        fname: "Updated",
        lname: "Person",
        dept: "New"
    });
    equal( userStore.read().length, 9, "Data length unchanged" );
    equal( userStore.read( 12351 )[ 0 ].fname, "Updated", "Check item is updated" );
});
test( "update multiple", function() {
    expect( 2 );

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
    equal( userStore.read().length, 9, "Data length unchanged" );
    equal( userStore.read( 12353 )[ 0 ].fname, "Updated", "Check item is updated" );
});
test( "update and add", function() {
    expect( 3 );

    userStore.save([
        {
            id: 12352,
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
    equal( userStore.read().length, 10, "One new item added" );
    equal( userStore.read( 12352 )[ 0 ].fname, "UpdatedAgain", "Check item is updated" );
    equal( userStore.read( 12354 ).length, 1, "Read new item by id" );
});

// Remove data
test( "remove single", function() {
    expect( 2 );

    userStore.remove( 12351 );
    equal( userStore.read().length, 9, "Read all data without removed item" );
    equal( userStore.read( 12351 ).length, 0, "Removed item doesn't exist" );
});
test( "remove multiple - different formats", function() {
    expect( 3 );

    userStore.remove([
        12353,
        userStore.read( 12345 )[ 0 ]
    ]);
    equal( userStore.read().length, 7, "Read all data without removed items" );
    equal( userStore.read( 12353 ).length, 0, "Removed item doesn't exist" );
    equal( userStore.read( 12345 ).length, 0, "Removed item doesn't exist" );
});

// Reset Data
test( "reset all data", function() {
    expect( 3 );

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
    ], true);
    equal( userStore.read().length, 6, "Read all data" );
    equal( userStore.read( 12345 ).length, 1, "Removed item has returned" );
    equal( userStore.read( 12351 ).length, 0, "Added item doesn't exist" );
});

// Filter Data
test( "filter single field", function() {
    expect( 3 );

    var filtered = userStore.filter({
        fname: "John"
    });

    equal( userStore.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 2, "2 Items Matched Query" );
    ok( filtered[ 0 ].fname == "John" && filtered[ 1 ].fname == "John", "Correct items returned" );
});
test( "filter multiple fields, single value - AND", function() {
    expect( 3 );

    var filtered = userStore.filter({
        fname: "John",
        dept: "Marketing"
    });

    equal( userStore.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 1, "1 Item Matched Query" );
    ok( filtered[ 0 ].fname == "John" && filtered[ 0 ].dept == "Marketing", "Correct item returned" );
});
test( "filter multiple fields, single value - OR", function() {
    expect( 3 );

    var filtered = userStore.filter({
        fname: "John",
        dept: "Marketing"
    }, true );

    equal( userStore.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 3, "3 Items Matched Query" );
    ok( filtered[ 0 ].fname == "John" && filtered[ 1 ].fname == "John" && filtered[ 1 ].dept == "Marketing" && filtered[ 2 ].dept == "Marketing", "Correct items returned" );
});
test( "filter single field, multiple values - AND (probably never used, consider removing)", function() {
    expect( 2 );

    var filtered = userStore.filter({
        fname: {
            data: [ "John", "Jane" ]
        }
    });

    equal( userStore.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 0, "0 Items Matched Query" );
});
test( "filter single field, multiple values - OR", function() {
    expect( 3 );

    var filtered = userStore.filter({
        fname: {
            data: [ "John", "Jane" ],
            matchAny: true
        }
    });

    equal( userStore.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 4, "4 Items Matched Query" );
    ok( filtered[ 0 ].fname == "John" && filtered[ 1 ].fname == "Jane" && filtered[ 2 ].fname == "John" && filtered[ 3 ].fname == "Jane", "Correct items returned" );
});
test( "filter multiple fields - AND, multiple values - OR", function() {
    expect( 3 );

    var filtered = userStore.filter({
        fname: {
            data: [ "John", "Jane" ],
            matchAny: true
        },
        dept: "Accounting"
    });

    equal( userStore.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 2, "2 Items Matched Query" );
    ok( filtered[ 0 ].fname == "John" && filtered[ 0 ].dept == "Accounting" && filtered[ 1 ].fname == "Jane" && filtered[ 1 ].dept == "Accounting", "Correct items returned" );
});
test( "filter multiple fields - OR, multiple values - OR", function() {
    expect( 3 );

    var filtered = userStore.filter({
        fname: {
            data: [ "John", "Jane" ],
            matchAny: true
        },
        dept: {
            data: [ "Accounting", "IT" ],
            matchAny: true
        }
    }, true );

    equal( userStore.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 5, "5 Items Matched Query" );
    ok( filtered[ 0 ].id != 12350 && filtered[ 1 ].id != 12350 && filtered[ 2 ].id != 12350 && filtered[ 3 ].id != 12350 && filtered[ 4 ].id != 12350, "Correct items returned" );
});

//create a default(memory) dataManager to store data for some tests
var tasksValve = aerogear.dataManager( "tasks" ).valves.tasks;

test( "reset all data", function() {
    expect( 1 );

    tasksValve.save([
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

    equal( tasksValve.read().length, 3, "3 Items Added" );
});

test( "filter single field , Array in Data - AND, ", function() {
    expect( 2 );

    var filtered = tasksValve.filter( { tags: 111 } );

    equal( tasksValve.read().length, 3, "Original Data Unchanged" );
    equal( filtered.length, 1, "1 Item Matched" );
});


})( jQuery );
