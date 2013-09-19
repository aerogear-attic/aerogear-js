(function( $ ) {
// Use mockjax to intercept the rest calls and return data to the tests
// Clean up any mocks from previous tests first
$.mockjaxClear();

// save mocks
$.mockjax({
    url: "saveFile",
    type: "POST",
    headers: {
        "Content-Type": "multipart/form-data"
    },
    responseText: {
        status: 200
    }
});

// save mocks
$.mockjax({
    url: "saveFile/*",
    type: "PUT",
    headers: {
        "Content-Type": "multipart/form-data"
    },
    responseText: {
        status: 200
    }
});

})( jQuery );
