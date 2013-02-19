(function( $ ) {
// Use mockjax to intercept the rest calls and return data to the tests
// Clean up any mocks from previous tests first
$.mockjaxClear();

// read mocks
$.mockjax({
    url: "tasks",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    data: { limit: "1" },
    response: function( settings ) {
            this.responseText = JSON.stringify([{
            id: 12345,
            title: "Do Something",
            date: "2012-08-01"
        }]);
    }
});

$.mockjax({
    url: "tasks",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: [
        {
            id: 12345,
            title: "Do Something",
            date: "2012-08-01"
        },
        {
            id: 67890,
            title: "Do Something Else",
            date: "2012-08-02"
        }
    ]
});

// save mocks
$.mockjax({
    url: "tasks",
    type: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        id: 11223,
        title: "New Task",
        date: "2012-08-01"
    }
});

$.mockjax({
    url: "tasksCustom",
    type: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        id: 44556,
        title: "Another Task",
        date: "2012-08-01"
    }
});

$.mockjax({
    url: "tasks/*",
    type: "PUT",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        id: 11223,
        title: "Updated Task",
        date: "2012-08-01"
    }
});

$.mockjax({
    url: "tasksCustom/*",
    type: "PUT",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        id: 44556,
        title: "Another Updated Task",
        date: "2012-08-01"
    }
});

// delete mocks
$.mockjax({
    url: "tasks",
    type: "DELETE",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: []
});

$.mockjax({
    url: "tasks/*",
    type: "DELETE",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: []
});

$.mockjax({
    url: "tasksCustom/*",
    type: "DELETE",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: []
});

// custom base URL mock
$.mockjax({
    url: "baseTest/projects",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: []
});


// custom end point mock
$.mockjax({
    url: "customEndPoint",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: []
});

// custom base URL + end point mock
$.mockjax({
    url: "baseURL/customEndPoint",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: []
});

//id added to the end of the endpoint mock
$.mockjax({
    url: "baseURL/customEndPoint/12345",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        name: "My Name",
        id: 12345
    }
});

$.mockjax({
    url: "jsonpTest",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    response: function( settings ) {
        this.responseText = JSON.stringify({
            "callback": settings.jsonp,
            "dataType": settings.dataType
        });
    }
});

// Paging vars
var defaultData = {
        offset: "1",
        limit: "2"
    },
    defaultResponseText = [
        {
            id: 12345,
            title: "Do Something",
            date: "2012-08-01"
        },
        {
            id: 67890,
            title: "Do Something Else",
            date: "2012-08-02"
        }
    ];

// Web Linking Paging Mocks
$.mockjax({
    url: "pageTestWebLink",
    type: "GET",
    data: defaultData,
    headers: {
        "Content-Type": "application/json",
        "Link": "<http://fakeLink.com?offset=2&limit=2>; rel=\"next\", <http://fakeLink.com?offset=0&limit=2>; rel=\"previous\""
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestWebLink",
    type: "GET",
    headers: {
        "Content-Type": "application/json",
        "Link": "<http://fakeLink.com?offset=1&limit=2>; rel=\"next\""
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestWebLinkCustomIdentifiers",
    type: "GET",
    data: defaultData,
    headers: {
        "Content-Type": "application/json",
        "Link": "<http://fakeLink.com?offset=2&limit=2>; rel=\"forward\", <http://fakeLink.com?offset=0&limit=2>; rel=\"back\""
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestWebLinkCustomIdentifiers",
    type: "GET",
        headers: {
        "Content-Type": "application/json",
        "Link": "<http://fakeLink.com?offset=1&limit=2>; rel=\"forward\""
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestWebLinkCustomIdentifiersA",
    type: "GET",
    headers: {
        "Content-Type": "application/json",
        "Link": "<http://fakeLink.com?offset=2&limit=2>; rel=\"next\", <http://fakeLink.com?offset=0&limit=2>; rel=\"first\""
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestWebLinkCustomParameters",
    type: "GET",
    data: {
        pageNumber: 2,
        rpp: 2
    },
    headers: {
        "Content-Type": "application/json",
        "Link": "<http://fakeLink.com?pageNumber=1&rpp=2>; rel=\"previous\", <http://fakeLink.com?pageNumber=3&rpp=2>; rel=\"next\""
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestWebLinkCustomParameters",
    type: "GET",
    headers: {
        "Content-Type": "application/json",
        "Link": "<http://fakeLink.com?pageNumber=2&rpp=2>; rel=\"next\""
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestWebLinkCustomAll",
    type: "GET",
    data: {
        current: 2,
        count: 2
    },
    headers: {
        "Content-Type": "application/json",
        "Link": "<http://fakeLink.com?current=1&count=2>; rel=\"minus\", <http://fakeLink.com?current=3&count=2>; rel=\"plus\""
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestWebLinkCustomAll",
    type: "GET",
    headers: {
        "Content-Type": "application/json",
        "Link": "<http://fakeLink.com?current=2&count=2>; rel=\"plus\""
    },
    responseText: defaultResponseText
});

// Header Paging Mocks
$.mockjax({
    url: "pageTestHeader",
    type: "GET",
    data: defaultData,
    headers: {
        "Content-Type": "application/json",
        "previous": "pageTestHeader?offset=0&limit=2",
        "next": "pageTestHeader?offset=2&limit=2"
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestHeader",
    type: "GET",
        headers: {
        "Content-Type": "application/json",
        "next": "pageTestHeader?offset=1&limit=2"
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestHeaderCustomIdentifiers",
    type: "GET",
    data: defaultData,
    headers: {
        "Content-Type": "application/json",
        "back": "pageTestHeaderCustomIdentifiers?offset=0&limit=2",
        "forward": "pageTestHeaderCustomIdentifiers?offset=2&limit=2"
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestHeaderCustomIdentifiers",
    type: "GET",
        headers: {
        "Content-Type": "application/json",
        "forward": "pageTestHeaderCustomIdentifiers?offset=1&limit=2"
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestHeaderCustomParameters",
    type: "GET",
    data: {
        pageNumber: 2,
        rpp: 2
    },
    headers: {
        "Content-Type": "application/json",
        "previous": "pageTestHeaderCustomParameters?pageNumber=1&rpp=2",
        "next": "pageTestHeaderCustomParameters?pageNumber=3&rpp=2"
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestHeaderCustomParameters",
    type: "GET",
    headers: {
        "Content-Type": "application/json",
        "next": "pageTestHeaderCustomParameters?pageNumber=2&rpp=2"
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestHeaderCustomAll",
    type: "GET",
    data: {
        current: 2,
        count: 2
    },
    headers: {
        "Content-Type": "application/json",
        "minus": "pageTestHeaderCustomAll?current=1&count=2",
        "plus": "pageTestHeaderCustomAll?current=3&count=2"
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestHeaderCustomAll",
    type: "GET",
    headers: {
        "Content-Type": "application/json",
        "plus": "pageTestHeaderCustomAll?current=2&count=2"
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestHeaderProvider",
    type: "GET",
    data: {
        current: 2,
        count: 2
    },
    headers: {
        "Content-Type": "application/json",
        "providerPrevious": "{\"current\":1,\"count\":2}",
        "providerNext": "{\"current\":3,\"count\":2}"
    },
    responseText: defaultResponseText
});

$.mockjax({
    url: "pageTestHeaderProvider",
    type: "GET",
    headers: {
        "Content-Type": "application/json",
        "providerNext": "{\"current\":2,\"count\":2}"
    },
    responseText: defaultResponseText
});

// Body Paging Mocks
$.mockjax({
    url: "pageTestBody",
    type: "GET",
    data: defaultData,
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        previous: {
            offset: 0,
            limit: 2
        },
        next: {
            offset: 2,
            limit: 2
        },
        results: defaultResponseText
    }
});

$.mockjax({
    url: "pageTestBody",
    type: "GET",
        headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        next: {
            offset: 1,
            limit: 2
        },
        results: defaultResponseText
    }
});

$.mockjax({
    url: "pageTestBodyCustomIdentifiers",
    type: "GET",
    data: defaultData,
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        back: {
            offset: 0,
            limit: 2
        },
        forward: {
            offset: 2,
            limit: 2
        },
        results: defaultResponseText
    }
});

$.mockjax({
    url: "pageTestBodyCustomIdentifiers",
    type: "GET",
        headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        forward: {
            offset: 1,
            limit: 2
        },
        results: defaultResponseText
    }
});

$.mockjax({
    url: "pageTestBodyCustomParameters",
    type: "GET",
    data: {
        pageNumber: 2,
        rpp: 2
    },
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        previous: {
            pageNumber: 1,
            rpp: 2
        },
        next: {
            pageNumber: 3,
            rpp: 2
        },
        results: defaultResponseText
    }
});

$.mockjax({
    url: "pageTestBodyCustomParameters",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        next: {
            pageNumber: 2,
            limit: 2
        },
        results: defaultResponseText
    }
});

$.mockjax({
    url: "pageTestBodyCustomAll",
    type: "GET",
    data: {
        current: 2,
        count: 2
    },
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        minus: {
            current: 1,
            count: 2
        },
        plus: {
            current: 3,
            count: 2
        },
        results: defaultResponseText
    }
});

$.mockjax({
    url: "pageTestBodyCustomAll",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        plus: {
            current: 2,
            count: 2
        },
        results: defaultResponseText
    }
});

$.mockjax({
    url: "pageTestBodyProvider",
    type: "GET",
    data: {
        current: 2,
        count: 2
    },
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        pagingMetadata: {
            deeper: {
                providerPrevious: {
                    current: 1,
                    count: 2
                },
                providerNext: {
                    current: 3,
                    count: 2
                }
            }
        },
        results: defaultResponseText
    }
});

$.mockjax({
    url: "pageTestBodyProvider",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: {
        pagingMetadata: {
            deeper: {
                providerNext: {
                    current: 2,
                    count: 2
                }
            }
        },
        results: defaultResponseText
    }
});

$.mockjax({
    url: "long",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    },
    responseText: "returned",
    responseTime: 6000
});

})( jQuery );
