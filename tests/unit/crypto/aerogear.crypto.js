(function( $ ) {

module( "PBKDF2 - Password encrytion" );

test( "Password validation with random salt provided", function() {

    var hex = sjcl.codec.hex;
    rawPassword = AeroGear.password(PASSWORD);
    equal( hex.fromBits(rawPassword), ENCRYPTED_PASSWORD, "Password is not the same" );

});

module( "Symmetric encrytion with GCM" );

test( "Encrypt raw bytes", function() {
    var hex = sjcl.codec.hex;
    var options = {
        IV: hex.toBits( BOB_IV ),
        AAD: hex.toBits( BOB_AAD ),
        key: hex.toBits( BOB_SECRET_KEY ),
        data: hex.toBits( MESSAGE )
    };
    var cipherText = AeroGear.encrypt( options );
    equal( hex.fromBits( cipherText ),  CIPHERTEXT, "Encryption has failed" );
});

test( "Decrypt raw bytes", function() {

    var hex = sjcl.codec.hex;

    var options = {
        IV: hex.toBits( BOB_IV ),
        AAD: hex.toBits( BOB_AAD ),
        key: hex.toBits( BOB_SECRET_KEY ),
        data: hex.toBits( MESSAGE )
    };
    options.data = AeroGear.encrypt( options );
    var plainText = AeroGear.decrypt ( options );
    equal( hex.fromBits( plainText ),  MESSAGE, "Encryption has failed" );
});

test( "Decrypt corrupted ciphertext", function() {
    var hex = sjcl.codec.hex;

    var options = {
        IV: hex.toBits( BOB_IV ),
        AAD: hex.toBits( BOB_AAD ),
        key: hex.toBits( BOB_SECRET_KEY ),
        data: hex.toBits( MESSAGE )
    };
    options.data = AeroGear.encrypt( options );
    options.data[23] = ' ';

    throws( function() {
        AeroGear.decrypt ( options )
    }, "Should throw an exception for corrupted ciphers");
});

test( "Decrypt with corrupted IV", function() {
    var hex = sjcl.codec.hex;

    var options = {
        IV: hex.toBits( BOB_IV ),
        AAD: hex.toBits( BOB_AAD ),
        key: hex.toBits( BOB_SECRET_KEY ),
        data: hex.toBits( MESSAGE )
    };
    options.data = AeroGear.encrypt( options );
    options.IV[23] = ' ';

    throws(function(){
        AeroGear.decrypt ( options )
    }, "Should throw an exception for corrupted IVs");
});

module( "Secure Hash Algorithm (SHA-256)" );

test( "Should generated a valid SHA output", function() {
    var hex = sjcl.codec.hex;
    var digest = AeroGear.hash(SHA256_MESSAGE);
    equal( hex.fromBits( digest ),  SHA256_DIGEST, "Hash is invalid" );
});

test( "Should generated a valid SHA output for empty strings", function() {
    var hex = sjcl.codec.hex;
    var digest = AeroGear.hash("");
    equal( hex.fromBits( digest ),  SHA256_DIGEST_EMPTY_STRING, "Hash is invalid" );
});

module( "Digital signatures" );

test( "Should generate a valid signature", function() {
    var options = {
        keys: sjcl.ecc.ecdsa.generateKeys(192),
        message: PLAIN_TEXT
    };
    options.signature = AeroGear.sign( options );
    var validation = AeroGear.verify( options );

    ok( validation, "Signature should be valid" );

});

test( "Should raise an error with corrupted key", function() {
    var options = {
        keys: sjcl.ecc.ecdsa.generateKeys(192),
        message: PLAIN_TEXT
    };
    options.signature = AeroGear.sign( options );
    options.keys = sjcl.ecc.ecdsa.generateKeys(192,10);

    throws(function(){
        AeroGear.verify( options );
    }, "Should throw an exception for corrupted or wrong keys");
});

test( "Should raise an error with corrupted signature", function() {
    var options = {
        keys: sjcl.ecc.ecdsa.generateKeys(192),
        message: PLAIN_TEXT
    };
    options.signature = AeroGear.sign( options );
    options.signature[1] = ' ';

    throws(function(){
        AeroGear.verify( options );
    }, "Should throw an exception for corrupted signatures");
});

test( "TODO", function() {
    ok( 1 == "1", "Passed!" );
});


module( "TODO - Asymmetric encryption with ECC" );

test( "TODO", function() {
    ok( 1 == "1", "Passed!" );
});

})( jQuery );
