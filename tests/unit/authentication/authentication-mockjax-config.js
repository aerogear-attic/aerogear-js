(function( $ ) {

$.mockjaxClear();

$.mockjax({
    url: "auth/login",
    type: "POST",
    response: function( event ) {
        var data = event.data;
        if( data.username == "john" && data.password == "123" )
        {
            this.responseText = {
                username: "john",
                logged: true
            },
            this.headers = {
                "Auth-Token": "123456"
            };
        }
        else
        {
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
        var data = event.data;
    }
});

})(jQuery);