(function( $ ) {

$.mockjaxClear();

$.mockjax({
    url: "auth/enroll",
    type: "POST",
    response: function( event ) {
        var data = JSON.parse( event.data );

        this.responseText = {
            username: data.username,
            logged: true
        },
        this.headers = {
            "Auth-Token": "123456789"
        };
    }
});

$.mockjax({
    url: "auth/login",
    type: "POST",
    response: function( event ) {
        var data = JSON.parse( event.data );
        if( data.username == "john" && data.password == "123" ) {
            this.responseText = {
                username: "john",
                logged: true
            },
            this.headers = {
                "Auth-Token": "123456"
            };
        } else {
            this.status = 401,
            this.statusText = "UnAuthorized",
            this.responseText = {
                message : "User authentication failed"
            },
            this.headers = "";
        }

    }
});

$.mockjax({
    url: "auth/secured",
    type: "GET",
    response: function( event ) {
        var authToken = event.headers["Auth-Token"];
        if( authToken && authToken == "1234567" ) {
            this.responseText = {
                value1: "value1",
                value2: "value2"
            };
        } else {
            this.status = 401,
            this.statusText = "UnAuthorized",
            this.headers = "";
        }
    }
});

$.mockjax({
    url: "auth/logout",
    type: "POST",
    response: function( event ) {
        var data = event.data;

        this.status = "204",
        this.statusText = "No Content";
    },
    responseText: []
});

})(jQuery);
