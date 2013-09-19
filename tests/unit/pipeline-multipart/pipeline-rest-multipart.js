//Currently only runs when running tests in the browser
// https://github.com/ariya/phantomjs/issues/11013

// Save method with files
asyncTest( "save method - Multipart", function() {
    expect( 1 );

    var saveFile = AeroGear.Pipeline( "saveFile" ).pipes.saveFile,
        file = new Blob(['hello world'], {type: 'text/plain'});
    saveFile.save(
        {
            file: file
        },
        {
            success: function( data, textStatus, jqXHR ) {
                //test headers?
                ok( true, "POST - save data with file" );
                start();
            }
        }
    );
});

// Save method with files
asyncTest( "save method - Multipart - Update", function() {
    expect( 1 );

    var saveFile = AeroGear.Pipeline( "saveFile" ).pipes.saveFile,
        file = new Blob(['hello world'], {type: 'text/plain'});
    saveFile.save(
        {
            id: "12345",
            file: file
        },
        {
            success: function( data, textStatus, jqXHR ) {
                //test headers?
                ok( true, "POST - save data with file" );
                start();
            }
        }
    );
});
