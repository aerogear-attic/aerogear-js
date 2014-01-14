(function( $ ) {

    $.mockjaxClear();
    
    $.mockjax({
        url: /drive\/v2\/messages\?access_token=([a-zA-Z0-9]+)/,
        urlParams: ['accessToken'],
        type: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        response: function( settings ) {
            var accessToken = settings.urlParams.accessToken;
            if ( accessToken && accessToken !== suiteData.wrongAccessToken ) {
                this.status = 200,
                this.statusText = "OK";
            } else { 
                this.status = 401,
                this.statusText = "Unauthorized Request";
            }
        }
    });

    $.mockjax({
        url: /oauth2\/token\?access_token=([a-zA-Z0-9]+)/,
        urlParams: ['accessToken'],
        type: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        response: function( settings ) {
            var accessToken = settings.urlParams.accessToken;
            if ( accessToken && accessToken !== suiteData.wrongAccessToken && accessToken !== suiteData.accessTokenWrongAudience ) {
                this.status = 200,
                this.statusText = "OK",
                this.responseText = JSON.stringify({
                    audience: suiteData.clientId
                });
            } else if ( accessToken && accessToken === suiteData.accessTokenWrongAudience ) {
                this.status = 200,
                this.statusText = "OK",
                this.responseText = JSON.stringify({});
            } else { 
                this.status = 401,
                this.statusText = "Unauthorized Request";
            }
        }
    });

})(jQuery);
