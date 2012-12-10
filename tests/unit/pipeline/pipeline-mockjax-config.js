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
        console.log(this, settings);
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
    }
});

$.mockjax({
    url: "tasks/*",
    type: "DELETE",
    headers: {
        "Content-Type": "application/json"
    }
});

$.mockjax({
    url: "tasksCustom/*",
    type: "DELETE",
    headers: {
        "Content-Type": "application/json"
    }
});

// custom base URL mock
$.mockjax({
    url: "baseTest/projects",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    }
});


// custom end point mock
$.mockjax({
    url: "customEndPoint",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    }
});

// custom base URL + end point mock
$.mockjax({
    url: "baseURL/customEndPoint",
    type: "GET",
    headers: {
        "Content-Type": "application/json"
    }
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

})( jQuery );
