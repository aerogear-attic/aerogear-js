(function( $ ) {

module( "PBKDF2 - Password-based key derivation" );

test( "Password validation with random salt provided", function() {

    var hex = sjcl.codec.hex,
        rawPassword = AeroGear.crypto.deriveKey( PASSWORD ),
        newRawPassword = AeroGear.crypto.deriveKey( PASSWORD );

    notEqual( hex.fromBits( rawPassword ), hex.fromBits( newRawPassword ), "Password is the same" );

});

module( "Password based encrytion with GCM" );

test( "Encrypt/Decrypt raw bytes providing password", function() {

    var rawPassword = AeroGear.crypto.deriveKey( PASSWORD ),
        cipherText,
        options = {
            IV: BOB_IV,
            AAD: BOB_AAD,
            key: rawPassword,
            data: MESSAGE,
            codec: sjcl.codec.hex
    };
    cipherText = AeroGear.crypto.encrypt( options );
    options.data = cipherText;
    plainText = AeroGear.crypto.decrypt ( options );
    equal( plainText, MESSAGE, "Encryption has failed" );
});

test( "Encrypt/Decrypt raw bytes providing corrupted password", function() {

    var rawPassword = AeroGear.crypto.deriveKey( PASSWORD ),
        utf8String = sjcl.codec.utf8String,
        hex = sjcl.codec.hex,
        cipherText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: rawPassword,
            data: utf8String.toBits( PLAIN_TEXT )
    };
    cipherText = AeroGear.crypto.encrypt( options );
    options.key[0] = ' ';
    options.data = cipherText;

    throws( function() {
        AeroGear.crypto.decrypt ( options )
    }, "Should throw an exception for corrupted password");

});

module( "Symmetric encrytion with GCM" );

test( "Encrypt raw bytes", function() {
    var cipherText,
        hex = sjcl.codec.hex,
        options = {
            IV: BOB_IV,
            AAD: BOB_AAD,
            key: BOB_SECRET_KEY,
            data: MESSAGE,
            codec: hex
    };
    cipherText = AeroGear.crypto.encrypt( options );
    equal( hex.fromBits( cipherText ),  CIPHERTEXT, "Encryption has failed" );
});

test( "Encrypt/Decrypt raw bytes", function() {

    var hex = sjcl.codec.hex,
        plainText,
        options = {
            IV: BOB_IV,
            AAD: BOB_AAD,
            key: BOB_SECRET_KEY,
            data: MESSAGE,
            codec: hex
        };
    options.data = AeroGear.crypto.encrypt( options );
    plainText = AeroGear.crypto.decrypt ( options );
    equal( plainText,  MESSAGE, "Encryption has failed" );
});

test( "Decrypt corrupted ciphertext", function() {
    var hex = sjcl.codec.hex,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: hex.toBits( BOB_SECRET_KEY ),
            data: hex.toBits( MESSAGE )
        };
    options.data = AeroGear.crypto.encrypt( options );
    options.data[23] = ' ';

    throws( function() {
        AeroGear.crypto.decrypt ( options )
    }, "Should throw an exception for corrupted ciphertext");
});

test( "Decrypt with corrupted IV", function() {
    var hex = sjcl.codec.hex,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: hex.toBits( BOB_SECRET_KEY ),
            data: hex.toBits( MESSAGE )
        };
    options.data = AeroGear.crypto.encrypt( options );
    options.IV[23] = ' ';

    throws(function(){
        AeroGear.crypto.decrypt ( options )
    }, "Should throw an exception for corrupted IVs");
});

module( "Secure Hash Algorithm (SHA-256)" );

test( "Should generated a valid SHA output", function() {
    var hex = sjcl.codec.hex,
        digest = AeroGear.crypto.hash(SHA256_MESSAGE);
    equal( hex.fromBits( digest ),  SHA256_DIGEST, "Hash is invalid" );
});

test( "Should generated a valid SHA output for empty strings", function() {
    var hex = sjcl.codec.hex;
        digest = AeroGear.crypto.hash("");
    equal( hex.fromBits( digest ),  SHA256_DIGEST_EMPTY_STRING, "Hash is invalid" );
});

module( "Digital signatures" );

test( "Should generate a valid signature", function() {
    var validation,
        options = {
            keys: sjcl.ecc.ecdsa.generateKeys(192),
            message: PLAIN_TEXT
        };
    options.signature = AeroGear.crypto.sign( options );
    validation = AeroGear.crypto.verify( options );

    ok( validation, "Signature should be valid" );

});

test( "Should raise an error with corrupted key", function() {
    var options = {
        keys: sjcl.ecc.ecdsa.generateKeys(192),
        message: PLAIN_TEXT
    };
    options.signature = AeroGear.crypto.sign( options );
    options.keys = sjcl.ecc.ecdsa.generateKeys(192,10);

    throws(function(){
        AeroGear.crypto.verify( options );
    }, "Should throw an exception for corrupted or wrong keys");
});

test( "Should raise an error with corrupted signature", function() {
    var options = {
        keys: sjcl.ecc.ecdsa.generateKeys(192),
        message: PLAIN_TEXT
    };
    options.signature = AeroGear.crypto.sign( options );
    options.signature[1] = ' ';

    throws(function(){
        AeroGear.crypto.verify( options );
    }, "Should throw an exception for corrupted signatures");
});

module( "Asymmetric encryption with ECC" );

test( "Encrypt/Decrypt raw bytes", function() {
    var hex = sjcl.codec.hex,
        keyPair = new AeroGear.crypto.KeyPair(),
        cipherText, plainText,
        options = {
            IV: BOB_IV,
            AAD: BOB_AAD,
            key: keyPair.publicKey,
            data: MESSAGE,
            codec: hex
        };
    cipherText = AeroGear.crypto.encrypt( options );
    options.key = keyPair.privateKey;
    options.data = cipherText;
    plainText = AeroGear.crypto.decrypt( options );
    equal( plainText,  MESSAGE, "Encryption has failed" );
});

test( "Decrypt corrupted ciphertext", function() {
    var hex = sjcl.codec.hex,
        keyPair = new AeroGear.crypto.KeyPair(),
        cipherText, plainText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: keyPair.publicKey,
            data: hex.toBits( MESSAGE )
        };
    options.data = AeroGear.crypto.encrypt( options );
    options.data[23] = ' ';
    options.key = keyPair.privateKey;

    throws( function() {
        AeroGear.crypto.decrypt ( options )
    }, "Should throw an exception for corrupted ciphertext");
});

test( "Decrypt with corrupted IV", function() {
    var hex = sjcl.codec.hex,
        keyPair = new AeroGear.crypto.KeyPair(),
        cipherText, plainText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: keyPair.publicKey,
            data: hex.toBits( MESSAGE )
        };
    options.data = AeroGear.crypto.encrypt( options );
    options.IV[23] = ' ';
    options.key = keyPair.privateKey;

    throws( function() {
        AeroGear.crypto.decrypt ( options )
    }, "Should throw an exception for corrupted IVs");
});

test( "Decrypt with the wrong key", function() {
    var hex = sjcl.codec.hex,
        keyPair = new AeroGear.crypto.KeyPair(),
        cipherText, plainText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: keyPair.publicKey,
            data: hex.toBits( MESSAGE )
        };
    options.data = AeroGear.crypto.encrypt( options );
    options.key = hex.toBits( BOB_PRIVATE_KEY );

    throws( function() {
        AeroGear.crypto.decrypt ( options )
    }, "Should throw an exception for decryption with the wrong key");
});

})( jQuery );
