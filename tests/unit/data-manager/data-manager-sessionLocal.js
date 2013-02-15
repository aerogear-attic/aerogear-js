(function( $ ) {

// Do not reorder tests on rerun
QUnit.config.reorder = false;

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

module( "DataManager: SessionLocal - Data Manipulation" );

// Create a session based dataManager to store data for some tests
var userStoreReload,
    userStore = AeroGear.DataManager({
    name: "users",
    type: "SessionLocal"
}).stores.users;

// Initialize the data set
test( "save - initialize", function() {
    expect( 2 );

    var returnedData = userStore.save([
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

    equal( returnedData.length, 6, "Initial data returned on save" );
    equal( userStore.read().length, 6, "Initial data readable from store" );

    userStoreReload = AeroGear.DataManager({
        name: "users",
        type: "SessionLocal"
    }).stores.users;
});

// Check data was loaded from existing session store
test( "load session stored data", function() {
    expect( 1 );

    equal( userStoreReload.read().length, 6, "Previously stored data added to store" );
});

// Read data
test( "read", function() {
    expect( 2 );

    equal( userStore.read().length, 6, "Read all data" );
    equal( userStore.read( 12345 ).length, 1, "Read single item by id" );
});

// Save data
test( "save single", function() {
    expect( 3 );

    var returnedData = userStore.save({
        id: 12351,
        fname: "New",
        lname: "Person",
        dept: "New"
    });
    equal( returnedData.length, 7, "Save returns updated data set" );
    equal( userStore.read().length, 7, "Read all data including new item" );
    equal( userStore.read( 12351 ).length, 1, "Read new item by id" );
});
test( "save multiple", function() {
    expect( 3 );

    var returnedData = userStore.save([
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
    equal( returnedData.length, 9, "Save returns updated data set" );
    equal( userStore.read().length, 9, "Read all data including new items" );
    equal( userStore.read( 12353 ).length, 1, "Read new item by id" );
});
test( "update single", function() {
    expect( 3 );

    var returnedData = userStore.save({
        id: 12351,
        fname: "Updated",
        lname: "Person",
        dept: "New"
    });
    equal( returnedData.length, 9, "Save returns updated data set with same length" );
    equal( userStore.read().length, 9, "Data length unchanged" );
    equal( userStore.read( 12351 )[ 0 ].fname, "Updated", "Check item is updated" );
});
test( "update multiple", function() {
    expect( 3 );

    var returnedData = userStore.save([
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
    equal( returnedData.length, 9, "Save returns updated data set with same length" );
    equal( userStore.read().length, 9, "Data length unchanged" );
    equal( userStore.read( 12353 )[ 0 ].fname, "Updated", "Check item is updated" );
});
test( "update and add", function() {
    expect( 4 );

    var returnedData = userStore.save([
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
    equal( returnedData.length, 10, "Save returns updated data set" );
    equal( userStore.read().length, 10, "One new item added" );
    equal( userStore.read( 12352 )[ 0 ].fname, "UpdatedAgain", "Check item is updated" );
    equal( userStore.read( 12354 ).length, 1, "Read new item by id" );
});

// Remove data
test( "remove single", function() {
    expect( 3 );

    var returnedData = userStore.remove( 12351 );
    equal( returnedData.length, 9, "Remove returns updated data set" );
    equal( userStore.read().length, 9, "Read all data without removed item" );
    equal( userStore.read( 12351 ).length, 0, "Removed item doesn't exist" );
});
test( "remove multiple - different formats", function() {
    expect( 4 );

    var returnedData = userStore.remove([
        12353,
        userStore.read( 12345 )[ 0 ]
    ]);
    equal( returnedData.length, 7, "Remove returns updated data set" );
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
    ], { reset: true });
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

//create a localStorage based dataManager to store data for some tests
var tasksStore = AeroGear.DataManager({
    name: "tasks",
    type: "SessionLocal",
    settings: {
        storageType: "localStorage"
    }}).stores.tasks;

test( "reset all data", function() {
    expect( 1 );

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
    ], { reset: true });

    equal( tasksStore.read().length, 4, "4 Items Added" );
});

test( "filter single field , Array in Data, AND", function() {
    expect( 2 );

    var filtered = tasksStore.filter( { tags: 111 } );

    equal( tasksStore.read().length, 4, "Original Data Unchanged" );
    equal( filtered.length, 1, "1 Item Matched" );
});

test( "filter single field , Array in Data, OR", function() {
    expect( 2 );

    var filtered = tasksStore.filter( { tags: 111 }, true );

    equal( tasksStore.read().length, 4, "Original Data Unchanged" );
    equal( filtered.length, 2, "2 Items Matched" );
});

test( "filter multiple fields , Array in Data, AND ", function() {
    expect( 2 );

    var filtered = tasksStore.filter({
        tags: 111,
        project: 11
    }, false );

    equal( tasksStore.read().length, 4, "Original Data Unchanged" );
    equal( filtered.length, 1, "1 Item Matched" );
});

test( "filter multiple fields , Array in Data, OR ", function() {
    expect( 2 );

    var filtered = tasksStore.filter({
        tags: 111,
        project: 11
    }, true );

    equal( tasksStore.read().length, 4, "Original Data Unchanged" );
    equal( filtered.length, 2, "2 Item Matched" );
});

test( "filter single field Multiple Values, Array in Data, AND", function() {
    expect(2);

    var filtered = tasksStore.filter({
        tags: {
            data: [ 111, 222 ],
            matchAny: false
        }
    });

    equal( tasksStore.read().length, 4, "Original Data Unchanged" );
    equal( filtered.length, 1, "1 Item Matched" );
});

test( "filter single field Multiple Values, Array in Data, OR", function() {
    expect(2);

    var filtered = tasksStore.filter({
        tags: {
            data: [ 111, 222 ],
            matchAny: true
        }
    });

    equal( tasksStore.read().length, 4, "Original Data Unchanged" );
    equal( filtered.length, 3, "3 Items Matched" );
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
        type: "SessionLocal"
    },
    {
        name: "size2",
        type: "SessionLocal",
        settings: {
            storageType: "localStorage"
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
        storageSuccess: sizeSuccessHandler,
        storageError: sizeErrorHandler
    });

    store.save({
        id: "test",
        val: data2
    }, {
        storageSuccess: sizeSuccessHandler,
        storageError: sizeErrorHandler
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
        storageSuccess: sizeSuccessHandler,
        storageError: sizeErrorHandler
    });

    store.save({
        id: "test",
        val: data2
    }, {
        storageSuccess: sizeSuccessHandler,
        storageError: sizeErrorHandler
    });
});

})( jQuery );
