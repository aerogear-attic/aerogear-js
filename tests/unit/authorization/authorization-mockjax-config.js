(function( $ ) {

    $.mockjaxClear();
    
    $.mockjax({
        url: "drive/v2/messages?access_token=*",
        type: "GET",
        response: function( settings ) {
            this.status = 200,
            this.statusText = "OK"
        }
    });

})(jQuery);
