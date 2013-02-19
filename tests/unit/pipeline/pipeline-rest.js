(function( $ ) {

module( "Pipeline: Rest - General" );

test( "create - name string", function() {
    expect( 2 );

    var pipe = AeroGear.Pipeline( "createTest1" ).pipes;
    equal( Object.keys( pipe ).length, 1, "Single Pipe created" );
    equal( Object.keys( pipe )[ 0 ], "createTest1", "Pipe Name createTest1" );
});

test( "create - name array", function() {
    expect( 4 );

    var pipe = AeroGear.Pipeline([
        "createTest21",
        {
            name: "createTest22",
            type: "Rest",
            recordId: "testId",
            settings: {
                url: "testURL"
            }
        },
        "createTest23"
    ]).pipes;

    equal( Object.keys( pipe ).length, 3, "3 Pipes created" );
    equal( Object.keys( pipe )[ 0 ], "createTest21", "Pipe Name createTest21" );
    equal( Object.keys( pipe )[ 1 ], "createTest22", "Pipe Name createTest22" );
    equal( Object.keys( pipe )[ 2 ], "createTest23", "Pipe Name createTest23" );
});

test( "create - object", function() {
    expect( 7 );

    var pipe = AeroGear.Pipeline([
        {
            name: "createTest31"
        },
        {
            name: "createTest32",
            settings: {
                recordId: "testId",
                url: "testURL"
            }
        },
        {
            name: "createTest33",
            type: "Rest",
            settings: {
                recordId: "testId",
                url: "testURL"
            }
        }
    ]).pipes;

    equal( Object.keys( pipe ).length, 3, "3 Pipes created" );
    equal( Object.keys( pipe )[ 0 ], "createTest31", "Pipe Name createTest31" );
    equal( Object.keys( pipe )[ 1 ], "createTest32", "Pipe Name createTest32" );
    equal( Object.keys( pipe )[ 2 ], "createTest33", "Pipe Name createTest33" );
    equal( pipe.createTest31.getRecordId(), "id", "Default recordId (id)" );
    equal( pipe.createTest32.getRecordId(), "testId", "Specified recordId (testId)" );
    equal( pipe.createTest33.getRecordId(), "testId", "Specified recordId (testId)" );
});


// Pipeline to be used for all remaining tests
var pipeline = AeroGear.Pipeline([
        {
            name: "tasks"
        },
        {
            name: "tasksCustom",
            settings: {
                recordId: "taskId"
            }
        },
        {
            name: "projects",
            settings: {
                baseURL: "baseTest/"
            }
        },
        {
            name: "tags",
            settings: {
                endpoint: "customEndPoint"
            }
        },
        {
            name: "users",
            settings: {
                baseURL: "baseURL/",
                endpoint: "customEndPoint"
            }
        }
    ]),
    pipe = pipeline.pipes.tasks,
    pipe2 = pipeline.pipes.tasksCustom,
    pipe3 = pipeline.pipes.projects,
    pipe4 = pipeline.pipes.tags,
    pipe5 = pipeline.pipes.users;

// Add pipe test
test( "add method", function() {
    expect( 2 );

    var pipe = pipeline.add( "addTest" ).pipes;
    equal( Object.keys( pipe ).length, 6, "Single Pipe added" );
    equal( Object.keys( pipe )[ 5 ], "addTest", "Pipe Name addTest" );
});

// Remove pipe test
test( "remove method", function() {
    expect( 2 );

    var pipe = pipeline.remove( "addTest" ).pipes;
    equal( Object.keys( pipe ).length, 5, "Single Pipe removed" );
    equal( pipe.addTest, undefined, "Removed pipe is really gone" );
});

// Read method test
asyncTest( "read method", function() {
    expect( 2 );

    var read1 = pipe.read({
        success: function( data, textStatus, jqXHR ) {
            equal( data[ 1 ].id, 67890, "Read all data" );
        }
    });

    var read2 = pipe.read({
        query: { limit: 1 },
        success: function( data, textStatus, jqXHR ) {
            equal( data.length, 1, "Read only first record - query option" );
        }
    });

    $.when( read1, read2 ).done( function( r1, r2 ) {
        start();
    });
});

// Save method test
asyncTest( "save method", function() {
    expect( 4 );

    var save1, save2;

    save1 = pipe.save({
        title: "New Task",
        date: "2012-08-01"
    },
    {
        success: function( data, textStatus, jqXHR ) {
            ok( true, "POST - new data" );
        }
    });

    save2 = pipe2.save({
        title: "Another Task",
        date: "2012-08-01"
    },
    {
        success: function( data, textStatus, jqXHR ) {
            ok( true, "POST - new data with custom record id" );
        }
    });

    $.when( save1, save2 ).done( function( s1, s2 ) {
        var save3, save4;

        save3 = pipe.save({
            id: 11223,
            title: "Updated Task",
            date: "2012-08-01"
        },
        {
            success: function( data, textStatus, jqXHR ) {
                ok( true, "PUT - update existing data" );
            }
        });

        save4 = pipe2.save({
            taskId: 44556,
            title: "Another Updated Task",
            date: "2012-08-01"
        },
        {
            success: function( data, textStatus, jqXHR ) {
                ok( true, "PUT - update existing data with custom record id" );
            }
        });

        $.when( save3, save4 ).done( function( s3, s4 ) {
            start();
        });
    });
});

// Remove method test
asyncTest( "remove method", function() {
    expect( 3 );

    var remove1 = pipe.remove( 12345, {
        success: function( data, textStatus, jqXHR ) {
            ok( true, "DELETE - single record using default integer record identifier" );
        }
    });

    var remove2 = pipe2.remove( { taskId: 44556 },
        {
            success: function( data, textStatus, jqXHR ) {
                ok( true, "DELETE - single record using custom record identifier" );
            }
        }
    );

    $.when( remove1, remove2 ).done( function( r1, r2 ) {
        pipe.remove({
            success: function( data, textStatus, jqXHR ) {
                ok( true, "DELETE - all data at end of this pipe" );
                start();
            }
        });
    });
});

// Test custom base URL
asyncTest( "base URL", function() {
    expect( 1 );

    var read = pipe3.read({
        success: function( data, textStatus, jqXHR ) {
            ok( true, "Read success from custom base URL" );
            start();
        }
    });
});

// Test custom endpoint
asyncTest( "end point", function() {
    expect( 1 );

    var read = pipe4.read({
        success: function( data, textStatus, jqXHR ) {
            ok( true, "Read success from custom end point" );
            start();
        }
    });
});

// Test custom base URL and endpoint
asyncTest( "base URL + end point", function() {
    expect( 1 );

    var read = pipe5.read({
        success: function( data, textStatus, jqXHR ) {
            ok( true, "Read success from custom end point" );
            start();
        }
    });
});


var pipeline2 = AeroGear.Pipeline([
    {
        name: "custom",
        settings: {
            baseURL: "baseURL/",
            endpoint: "customEndPoint"
        }
    },
    {
        name: "custom2",
        settings: {
            baseURL: "baseURL/",
            endpoint: "customEndPoint",
            recordId: "identifier"
        }
    }
]);

var pipe6 = pipeline2.pipes.custom,
    pipe7 = pipeline2.pipes.custom2,
    pipe8 = pipeline2.pipes.paged;

asyncTest( "ID added to end point", function() {
    expect( 2 );

    var read = pipe6.read({
        id: 12345,
        success: function( data, textStatus, jqXHR ) {
            ok( true, "Read success from endpoint with id on the end" );
            equal( data.id, 12345, "Id is 12345" );
            start();
        }
    });
});

asyncTest( "ID added to end point with custom recordID", function() {
    expect( 2 );

    var read = pipe7.read({
        identifier: 12345,
        success: function( data, textStatus, jqXHR ) {
            ok( true, "Read success from endpoint with id on the end" );
            equal( data.id, 12345, "Id is 12345" );
            start();
        }
    });
});

module( "Pipeline: Rest - Paging" );

var pagingPipes = AeroGear.Pipeline([
    {
        name: "webLinking",
        settings: {
            endpoint: "pageTestWebLink",
            pageConfig: true
        }
    },
    {
        name: "webLinking2",
        settings: {
            endpoint: "pageTestWebLinkCustomIdentifiers",
            pageConfig: {
                previousIdentifier: "back",
                nextIdentifier: "forward"
            }
        }
    },
    {
        name: "webLinking3",
        settings: {
            endpoint: "pageTestWebLinkCustomParameters",
            pageConfig: true
        }
    },
    {
        name: "webLinking4",
        settings: {
            endpoint: "pageTestWebLinkCustomAll",
            pageConfig: {
                previousIdentifier: "minus",
                nextIdentifier: "plus"
            }
        }
    },
    {
        name: "webLinking5",
        settings: {
            endpoint: "pageTestWebLinkCustomIdentifiersA",
            pageConfig: true
        }
    },
    {
        name: "header",
        settings: {
            endpoint: "pageTestHeader",
            pageConfig: {
                metadataLocation: "header"
            }
        }
    },
    {
        name: "header2",
        settings: {
            endpoint: "pageTestHeaderCustomIdentifiers",
            pageConfig: {
                metadataLocation: "header",
                previousIdentifier: "back",
                nextIdentifier: "forward"
            }
        }
    },
    {
        name: "header3",
        settings: {
            endpoint: "pageTestHeaderCustomParameters",
            pageConfig: {
                metadataLocation: "header"
            }
        }
    },
    {
        name: "header4",
        settings: {
            endpoint: "pageTestHeaderCustomAll",
            pageConfig: {
                metadataLocation: "header",
                previousIdentifier: "minus",
                nextIdentifier: "plus"
            }
        }
    },
    {
        name: "header5",
        settings: {
            endpoint: "pageTestHeaderProvider",
            pageConfig: {
                metadataLocation: "header",
                previousIdentifier: "providerPrevious",
                nextIdentifier: "providerNext",
                parameterProvider: function( jqXHR ) {
                    var links = {};
                    links.providerPrevious = JSON.parse( jqXHR.getResponseHeader( "providerPrevious" ) );
                    links.providerNext = JSON.parse( jqXHR.getResponseHeader( "providerNext" ) );
                    return links;
                }
            }
        }
    },
    {
        name: "body",
        settings: {
            endpoint: "pageTestBody",
            pageConfig: {
                metadataLocation: "body"
            }
        }
    },
    {
        name: "body2",
        settings: {
            endpoint: "pageTestBodyCustomIdentifiers",
            pageConfig: {
                metadataLocation: "body",
                previousIdentifier: "back",
                nextIdentifier: "forward"
            }
        }
    },
    {
        name: "body3",
        settings: {
            endpoint: "pageTestBodyCustomParameters",
            pageConfig: {
                metadataLocation: "body"
            }
        }
    },
    {
        name: "body4",
        settings: {
            endpoint: "pageTestBodyCustomAll",
            pageConfig: {
                metadataLocation: "body",
                previousIdentifier: "minus",
                nextIdentifier: "plus"
            }
        }
    },
    {
        name: "body5",
        settings: {
            endpoint: "pageTestBodyProvider",
            pageConfig: {
                metadataLocation: "body",
                previousIdentifier: "providerPrevious",
                nextIdentifier: "providerNext",
                parameterProvider: function( body ) {
                    var links = {};
                    links.providerPrevious = body.pagingMetadata.deeper.providerPrevious;
                    links.providerNext = body.pagingMetadata.deeper.providerNext;
                    return links;
                }
            }
        }
    }
]);

asyncTest( "webLinking (default)", function() {
    expect( 3 );

    pagingPipes.pipes.webLinking.read({
        offsetValue: 1,
        limitValue: 2,
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "webLinking - custom identifiers", function() {
    expect( 3 );

    pagingPipes.pipes.webLinking2.read({
        offsetValue: 1,
        limitValue: 2,
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "webLinking - custom query parameters", function() {
    expect( 3 );

    pagingPipes.pipes.webLinking3.read({
        paging: {
            pageNumber: 2,
            rpp: 2
        },
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "webLinking - custom identifiers and query parameters", function() {
    expect( 3 );

    pagingPipes.pipes.webLinking4.read({
        paging: {
            current: 2,
            count: 2
        },
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "webLinking - custom identifiers, but not overriding them", function() {
    expect( 1 );

    pagingPipes.pipes.webLinking5.read({
        success: function( data, textStatus, jqXHR ) {
            var pagingObject = pagingPipes.pipes.webLinking5.webLinkingPageParser( jqXHR );
            equal( pagingObject.next, "offset=2&limit=2", "next is set correctly" );
            start();
        }
    });
});

asyncTest( "header", function() {
    expect( 3 );

    pagingPipes.pipes.header.read({
        offsetValue: 1,
        limitValue: 2,
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "header - custom identifiers", function() {
    expect( 3 );

    pagingPipes.pipes.header2.read({
        offsetValue: 1,
        limitValue: 2,
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "header - custom query parameters", function() {
    expect( 3 );

    pagingPipes.pipes.header3.read({
        paging: {
            pageNumber: 2,
            rpp: 2
        },
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "header - custom identifiers and query parameters", function() {
    expect( 3 );

    pagingPipes.pipes.header4.read({
        paging: {
            current: 2,
            count: 2
        },
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "header - custom identifiers and query parameters with parameter provider", function() {
    expect( 3 );

    pagingPipes.pipes.header5.read({
        paging: {
            current: 2,
            count: 2
        },
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "body", function() {
    expect( 3 );

    pagingPipes.pipes.body.read({
        offsetValue: 1,
        limitValue: 2,
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "body - custom identifiers", function() {
    expect( 3 );

    pagingPipes.pipes.body2.read({
        offsetValue: 1,
        limitValue: 2,
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "body - custom query parameters", function() {
    expect( 3 );

    pagingPipes.pipes.body3.read({
        paging: {
            pageNumber: 2,
            rpp: 2
        },
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "body - custom identifiers and query parameters", function() {
    expect( 3 );

    pagingPipes.pipes.body4.read({
        paging: {
            current: 2,
            count: 2
        },
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

asyncTest( "body - custom identifiers and query parameters with parameter provider", function() {
    expect( 3 );

    pagingPipes.pipes.body5.read({
        paging: {
            current: 2,
            count: 2
        },
        success: function( data, textStatus, jqXHR ) {
            data.previous({
                success: function( data ) {
                    ok( true, "Read success from previous call" );
                    data.next({
                        success: function() {
                            ok( true, "Read success from next call" );
                            start();
                        }
                    });
                }
            });
            ok( true, "Read success from endpoint with paging" );
        }
    });
});

module( "Pipeline: Rest - Misc" );

var longPipe = AeroGear.Pipeline({
        name: "long",
        type: "Rest",
        settings: {
            timeout: 5
        }
    }).pipes.long;

asyncTest( "timeout", function() {
    expect( 1 );

    longPipe.read({
        success: function( data, textStatus, jqXHR ) {
            ok( true, "This should not happen and will cause the test to fail if it does" );
        },
        complete: function( jqXHR, textStatus ) {
            equal( textStatus, "timeout", "Timeout Triggered Complete Callback" );
            start();
        }
    });
});

asyncTest( "abort (cancel)", function() {
    expect( 2 );

    var xhr = longPipe.read({
        success: function( data, textStatus, jqXHR ) {
            ok( true, "This should not happen and will cause the test to fail if it does" );
        },
        error: function( jqXHR, textStatus, errorThrown ) {
            equal( textStatus, "abort", "Abort Triggered Error Callback" );
        },
        complete: function( jqXHR, textStatus ) {
            equal( textStatus, "abort", "Abort Triggered Complete Callback" );
            start();
        }
    });

    setTimeout( function() {
        xhr.abort();
    }, 2000 );
});

})( jQuery );
