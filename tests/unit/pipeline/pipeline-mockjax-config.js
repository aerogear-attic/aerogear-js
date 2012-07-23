(function( $ ) {
// Use mockjax to intercept the rest calls and return data to the tests
// Clean up any mocks from previous tests first
$.mockjaxClear();

// read mocks
$.mockjax({
    url: "tasks",
    type: "GET",
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

$.mockjax({
    url: "tasks",
    type: "GET",
    data: { limit: 1 },
    responseText: [
        {
            id: 12345,
            title: "Do Something",
            date: "2012-08-01"
        }
    ]
});

// save mocks
$.mockjax({
    url: "tasks",
    type: "POST",
    responseText: [
        {
            id: 11223,
            title: "New Task",
            date: "2012-08-01"
        }
    ]
});

$.mockjax({
    url: "tasks",
    type: "PUT"
});

// delete mocks
$.mockjax({
    url: "tasks",
    type: "DELETE"
});

})( jQuery );
