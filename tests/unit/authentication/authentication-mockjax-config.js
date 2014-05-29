(function( $ ) {

var sessionActive = false;

$.mockjaxClear();

$.mockjax({
    url: "auth/enroll",
    type: "POST",
    response: function( event ) {
        var data = JSON.parse( event.data );
        if( data.username !== "" && data.password !=="" ) {
            this.responseText = {
                username: data.username,
                logged: true
            };
        } else {
            this.status = 400;
            this.statusText = "Bad Request";
            this.responseText = {
                message : 'User enrollment failed'
            };
        }
    }
});

$.mockjax({
    url: "baseTest/register",
    type: "POST",
    response: function( event ) {
        var data = JSON.parse( event.data );
        if( data.username !== "" && data.password !== "" ) {
            this.responseText = {
                username: data.username,
                logged: true
            };
        } else {
            this.status = 400;
            this.statusText = "Bad Request";
            this.responseText = {
                message : 'User enrollment failed'
            };
        }
    }
});

$.mockjax({
    url: "baseTest/go",
    type: "POST",
    response: function( event ) {
        var data = JSON.parse( event.data );
        if( data.username === "john" && data.password === "123" ) {
            this.responseText = {
                username: "john",
                logged: true
            };
            sessionActive = true;
        } else {
            this.status = 401;
            this.statusText = "UnAuthorized";
            this.responseText = {
                message : "User authentication failed"
            };
            sessionActive = false;
        }

    }
});

$.mockjax({
    url: "auth/login",
    type: "POST",
    response: function( event ) {
        var data = JSON.parse( event.data );
        if( data.username === "john" && data.password === "123" ) {
            this.responseText = {
                username: "john",
                logged: true
            };
            sessionActive = true;
        } else {
            sessionActive = false;
            this.status = 401;
            this.statusText = "UnAuthorized";
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
            this.status = 401;
            this.statusText = "UnAuthorized";
        }
    }
});

$.mockjax({
    url: "baseTest/leave",
    type: "POST",
    response: function( event ) {
        if( sessionActive ) {
            sessionActive = false;
            var data = event.data;

            this.status = "204";
            this.statusText = "No Content";
        } else {
            this.status = 410;
            this.statusText = "Gone";
        }
    },
    responseText: []
});

$.mockjax({
    url: "auth/logout",
    type: "POST",
    response: function( event ) {
        if( sessionActive ) {
            sessionActive = false;
            var data = event.data;

            this.status = "204";
            this.statusText = "No Content";
        } else {
            this.status = 410;
            this.statusText = "Gone";
        }
    },
    responseText: []
});

})(jQuery);
