(function( $ ) {

var sessionActive = false;

$.mockjaxClear();

$.mockjax({
    url: "auth/enroll",
    type: "POST",
    response: function( event ) {
        var data = JSON.parse( event.data );

        this.responseText = {
            username: data.username,
            logged: true
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
            };
            sessionActive = true;
        } else {
            this.status = 401,
            this.statusText = "UnAuthorized",
            this.responseText = {
                message : "User authentication failed"
            };
        }

    }
});

$.mockjax({
    url: "auth/secured",
    type: "GET",
    response: function( event ) {
        if( sessionActive ) {
            this.responseText = {
                value1: "value1",
                value2: "value2"
            };
        } else {
            this.status = 401,
            this.statusText = "UnAuthorized";
        }
    }
});

$.mockjax({
    url: "auth/logout",
    type: "POST",
    response: function( event ) {
        sessionActive = false;
        var data = event.data;

        this.status = "204",
        this.statusText = "No Content";
    },
    responseText: []
});

})(jQuery);
