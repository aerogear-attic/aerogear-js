(function( $ ) {

// Do not reorder tests on rerun
QUnit.config.reorder = false;

module( "dataManager: memory" );

test( "create - name string", function() {
    expect( 3 );

    var dm = aerogear.dataManager( "createTest1" ).valves;
    equal( Object.keys( dm ).length, 1, "Single Valve created" );
    equal( Object.keys( dm )[ 0 ], "createTest1", "Valve Name createTest1" );
    equal( dm.createTest1.type, "memory", "Default valve type (memory)" );
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
    ]).valves;

    equal( Object.keys( dm ).length, 3, "3 Valves created" );
    equal( Object.keys( dm )[ 0 ], "createTest21", "Valve Name createTest21" );
    equal( Object.keys( dm )[ 1 ], "createTest22", "Valve Name createTest22" );
    equal( Object.keys( dm )[ 2 ], "createTest23", "Valve Name createTest23" );
    equal( dm.createTest21.type, "memory", "Default valve type (memory)" );
    equal( dm.createTest22.type, "memory", "Specified valve type (memory)" );
    equal( dm.createTest23.type, "memory", "Default valve type (memory)" );
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
    ]).valves;

    equal( Object.keys( dm ).length, 2, "2 Valves created" );
    equal( Object.keys( dm )[ 0 ], "createTest31", "Valve Name createTest31" );
    equal( Object.keys( dm )[ 1 ], "createTest32", "Valve Name createTest32" );
    equal( dm.createTest31.type, "memory", "Default valve type (memory)" );
    equal( dm.createTest32.type, "memory", "Specified valve type (memory)" );
});

test( "add and remove - string ", function() {
    expect( 7 );

    var dm = aerogear.dataManager();
    dm.add( "addTest1" ),
    dm.add( "addTest2" );

    equal( Object.keys( dm.valves ).length, 2, "2 Valves added" );
    equal( Object.keys( dm.valves )[ 0 ], "addTest1", "Valve Name addTest1" );
    equal( Object.keys( dm.valves )[ 1 ], "addTest2", "Valve Name addTest1" );
    equal( dm.valves.addTest1.type, "memory", "Default valve type (memory)" );
    equal( dm.valves.addTest2.type, "memory", "Default valve type (memory)" );

    dm.remove( "addTest1" );
    equal( Object.keys( dm.valves ).length, 1, "1 Valves removed" );
    equal( dm.valves.addTest1, undefined, "Valve Name addTest1 no longer exists" );


});

test( "add and remove - array ", function() {
    expect( 7 );

    var dm = aerogear.dataManager();
    dm.add( [
     "addTest3",  
     ] );

    equal( Object.keys( dm.valves ).length, 2, "2 Valves added" );
    equal( Object.keys( dm.valves )[ 0 ], "addTest3", "Valve Name addTest1" );
    equal( Object.keys( dm.valves )[ 1 ], "addTest4", "Valve Name addTest1" );
    equal( dm.valves.addTest1.type, "memory", "Default valve type (memory)" );
    equal( dm.valves.addTest2.type, "memory", "Default valve type (memory)" );

    dm.remove( "addTest1" );
    equal( Object.keys( dm.valves ).length, 1, "1 Valves removed" );
    equal( dm.valves.addTest1, undefined, "Valve Name addTest1 no longer exists" );


});

// Create a default (memory) dataManager to store data for some tests
var userValve = aerogear.dataManager( "users" ).valves.users;

// Initialize the data set
test( "save - initialize", function() {
    expect( 1 );

    userValve.save([
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

    equal( userValve.data.length, 6, "Initial data added to valve" );
});

// Read data
test( "read", function() {
    expect( 2 );

    equal( userValve.read().length, 6, "Read all data" );
    equal( userValve.read( 12345 ).length, 1, "Read single item by id" );
});

// Save data
test( "save single", function() {
    expect( 2 );

    userValve.save({
        id: 12351,
        fname: "New",
        lname: "Person",
        dept: "New"
    });
    equal( userValve.read().length, 7, "Read all data including new item" );
    equal( userValve.read( 12351 ).length, 1, "Read new item by id" );
});
test( "save multiple", function() {
    expect( 2 );

    userValve.save([
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
    equal( userValve.read().length, 9, "Read all data including new items" );
    equal( userValve.read( 12353 ).length, 1, "Read new item by id" );
});
test( "update single", function() {
    expect( 2 );

    userValve.save({
        id: 12351,
        fname: "Updated",
        lname: "Person",
        dept: "New"
    });
    equal( userValve.read().length, 9, "Data length unchanged" );
    equal( userValve.read( 12351 )[ 0 ].fname, "Updated", "Check item is updated" );
});
test( "update multiple", function() {
    expect( 2 );

    userValve.save([
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
    equal( userValve.read().length, 9, "Data length unchanged" );
    equal( userValve.read( 12353 )[ 0 ].fname, "Updated", "Check item is updated" );
});
test( "update and add", function() {
    expect( 3 );

    userValve.save([
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
    equal( userValve.read().length, 10, "One new item added" );
    equal( userValve.read( 12352 )[ 0 ].fname, "UpdatedAgain", "Check item is updated" );
    equal( userValve.read( 12354 ).length, 1, "Read new item by id" );
});

// Remove data
test( "remove single", function() {
    expect( 2 );

    userValve.remove( 12351 );
    equal( userValve.read().length, 9, "Read all data without removed item" );
    equal( userValve.read( 12351 ).length, 0, "Removed item doesn't exist" );
});
test( "remove multiple - different formats", function() {
    expect( 3 );

    userValve.remove([
        12353,
        userValve.read( 12345 )[ 0 ]
    ]);
    equal( userValve.read().length, 7, "Read all data without removed items" );
    equal( userValve.read( 12353 ).length, 0, "Removed item doesn't exist" );
    equal( userValve.read( 12345 ).length, 0, "Removed item doesn't exist" );
});

// Reset Data
test( "reset all data", function() {
    expect( 3 );

    userValve.save([
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
    equal( userValve.read().length, 6, "Read all data" );
    equal( userValve.read( 12345 ).length, 1, "Removed item has returned" );
    equal( userValve.read( 12351 ).length, 0, "Added item doesn't exist" );
});

// Filter Data
test( "filter single field", function() {
    expect( 3 );

    var filtered = userValve.filter({
        fname: "John"
    });

    equal( userValve.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 2, "2 Items Matched Query" );
    ok( filtered[ 0 ].fname == "John" && filtered[ 1 ].fname == "John", "Correct items returned" );
});
test( "filter multiple fields, single value - AND", function() {
    expect( 3 );

    var filtered = userValve.filter({
        fname: "John",
        dept: "Marketing"
    });

    equal( userValve.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 1, "1 Item Matched Query" );
    ok( filtered[ 0 ].fname == "John" && filtered[ 0 ].dept == "Marketing", "Correct item returned" );
});
test( "filter multiple fields, single value - OR", function() {
    expect( 3 );

    var filtered = userValve.filter({
        fname: "John",
        dept: "Marketing"
    }, true );

    equal( userValve.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 3, "3 Items Matched Query" );
    ok( filtered[ 0 ].fname == "John" && filtered[ 1 ].fname == "John" && filtered[ 1 ].dept == "Marketing" && filtered[ 2 ].dept == "Marketing", "Correct items returned" );
});
test( "filter single field, multiple values - AND (probably never used, consider removing)", function() {
    expect( 2 );

    var filtered = userValve.filter({
        fname: {
            data: [ "John", "Jane" ]
        }
    });

    equal( userValve.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 0, "0 Items Matched Query" );
});
test( "filter single field, multiple values - OR", function() {
    expect( 3 );

    var filtered = userValve.filter({
        fname: {
            data: [ "John", "Jane" ],
            matchAny: true
        }
    });

    equal( userValve.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 4, "4 Items Matched Query" );
    ok( filtered[ 0 ].fname == "John" && filtered[ 1 ].fname == "Jane" && filtered[ 2 ].fname == "John" && filtered[ 3 ].fname == "Jane", "Correct items returned" );
});
test( "filter multiple fields - AND, multiple values - OR", function() {
    expect( 3 );

    var filtered = userValve.filter({
        fname: {
            data: [ "John", "Jane" ],
            matchAny: true
        },
        dept: "Accounting"
    });

    equal( userValve.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 2, "2 Items Matched Query" );
    ok( filtered[ 0 ].fname == "John" && filtered[ 0 ].dept == "Accounting" && filtered[ 1 ].fname == "Jane" && filtered[ 1 ].dept == "Accounting", "Correct items returned" );
});
test( "filter multiple fields - OR, multiple values - OR", function() {
    expect( 3 );

    var filtered = userValve.filter({
        fname: {
            data: [ "John", "Jane" ],
            matchAny: true
        },
        dept: {
            data: [ "Accounting", "IT" ],
            matchAny: true
        }
    }, true );

    equal( userValve.read().length, 6, "Original Data Unchanged" );
    equal( filtered.length, 5, "5 Items Matched Query" );
    ok( filtered[ 0 ].id != 12350 && filtered[ 1 ].id != 12350 && filtered[ 2 ].id != 12350 && filtered[ 3 ].id != 12350 && filtered[ 4 ].id != 12350, "Correct items returned" );
});

})( jQuery );
