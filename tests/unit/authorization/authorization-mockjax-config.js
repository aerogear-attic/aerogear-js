(function( $ ) {

    $.mockjaxClear();
    
    $.mockjax({
        url: /drive\/v2\/messages\?access_token=([a-zA-Z0-9]+)/,
        urlParams: ['accessToken'],
        type: "GET",
        response: function( settings ) {
            var accessToken = settings.urlParams.accessToken;
            if ( accessToken && accessToken !== 'wrongToken' ) {
                this.status = 200,
                this.statusText = "OK";
            } else { 
                this.status = 401,
                this.statusText = "Unauthorized Request";
            }
        }
    });

})(jQuery);
