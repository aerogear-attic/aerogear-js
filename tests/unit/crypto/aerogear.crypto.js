(function( $ ) {

module( "PBKDF2 - Password-based key derivation" );

test( "Password validation with random salt provided", function() {

    var hex = sjcl.codec.hex,
        rawPassword = AeroGear.Crypto().deriveKey( PASSWORD ),
        newRawPassword = AeroGear.Crypto().deriveKey( PASSWORD );

    notEqual( hex.fromBits( rawPassword ), hex.fromBits( newRawPassword ), "Password is the same" );

});

module( "Password based encrytion with GCM" );

test( "Encrypt/Decrypt raw bytes providing password", function() {

    var rawPassword = AeroGear.Crypto().deriveKey( PASSWORD ),
        utf8String = sjcl.codec.utf8String,
        hex = sjcl.codec.hex,
        cipherText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: rawPassword,
            data: utf8String.toBits( PLAIN_TEXT )
    };
    cipherText = AeroGear.Crypto().encrypt( options );
    options.data = cipherText;
    plainText = AeroGear.Crypto().decrypt ( options );
    equal( utf8String.fromBits( plainText ), PLAIN_TEXT, "Encryption has failed" );
});

test( "Encrypt/Decrypt raw bytes providing password and salt", function() {

    var agCrypto = new AeroGear.Crypto(),
        rawPassword = agCrypto.deriveKey( PASSWORD ),
        utf8String = sjcl.codec.utf8String,
        hex = sjcl.codec.hex,
        cipherText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: rawPassword,
            data: utf8String.toBits( PLAIN_TEXT )
    };
    cipherText = agCrypto.encrypt( options );
    options.data = cipherText;
    options.key = agCrypto.deriveKey( PASSWORD, agCrypto.getSalt() );
    plainText = agCrypto.decrypt ( options );

    equal( utf8String.fromBits( plainText ), PLAIN_TEXT, "Encryption has failed" );
});

test( "Encrypt/Decrypt raw bytes providing password with implicit IV", function() {

    var agCrypto = new AeroGear.Crypto(),
        rawPassword = agCrypto.deriveKey( PASSWORD ),
        utf8String = sjcl.codec.utf8String,
        hex = sjcl.codec.hex,
        cipherText,
        options = {
            AAD: hex.toBits( BOB_AAD ),
            key: rawPassword,
            data: utf8String.toBits( PLAIN_TEXT )
    };
    cipherText = agCrypto.encrypt( options );
    options.data = cipherText;
    plainText = agCrypto.decrypt ( options );
    equal( utf8String.fromBits( plainText ), PLAIN_TEXT, "Encryption has failed" );
});

test( "Encrypt/Decrypt raw bytes providing password with IV being provided", function() {

    var agCrypto = new AeroGear.Crypto(),
        rawPassword = agCrypto.deriveKey( PASSWORD ),
        utf8String = sjcl.codec.utf8String,
        hex = sjcl.codec.hex,
        cipherText,
        options = {
            AAD: hex.toBits( BOB_AAD ),
            key: rawPassword,
            data: utf8String.toBits( PLAIN_TEXT )
    };
    cipherText = agCrypto.encrypt( options );
    options.data = cipherText;
    options.IV = agCrypto.getIV();
    plainText = agCrypto.decrypt ( options );
    equal( utf8String.fromBits( plainText ), PLAIN_TEXT, "Encryption has failed" );
});

test( "Encrypt/Decrypt raw bytes providing corrupted password", function() {

    var rawPassword = AeroGear.Crypto().deriveKey( PASSWORD ),
        utf8String = sjcl.codec.utf8String,
        hex = sjcl.codec.hex,
        cipherText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: rawPassword,
            data: utf8String.toBits( PLAIN_TEXT )
    };
    cipherText = AeroGear.Crypto().encrypt( options );
    options.key[0] = ' ';
    options.data = cipherText;

    throws( function() {
        AeroGear.Crypto().decrypt ( options );
    }, "Should throw an exception for corrupted password");

});

module( "Symmetric encrytion with GCM" );

test( "Encrypt raw bytes", function() {
    var hex = sjcl.codec.hex,
        cipherText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: hex.toBits( BOB_SECRET_KEY ),
            data: hex.toBits( MESSAGE )
    };
    cipherText = AeroGear.Crypto().encrypt( options );
    equal( hex.fromBits( cipherText ),  CIPHERTEXT, "Encryption has failed" );
});

test( "Encrypt/Decrypt raw bytes", function() {

    var hex = sjcl.codec.hex,
        plainText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: hex.toBits( BOB_SECRET_KEY ),
            data: hex.toBits( MESSAGE )
        };
    options.data = AeroGear.Crypto().encrypt( options );
    plainText = AeroGear.Crypto().decrypt ( options );
    equal( hex.fromBits( plainText ),  MESSAGE, "Encryption has failed" );
});

test( "Decrypt corrupted ciphertext", function() {
    var hex = sjcl.codec.hex,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: hex.toBits( BOB_SECRET_KEY ),
            data: hex.toBits( MESSAGE )
        };
    options.data = AeroGear.Crypto().encrypt( options );
    options.data[23] = ' ';

    throws( function() {
        AeroGear.Crypto().decrypt ( options );
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
    options.data = AeroGear.Crypto().encrypt( options );
    options.IV[23] = ' ';

    throws(function(){
        AeroGear.Crypto().decrypt ( options );
    }, "Should throw an exception for corrupted IVs");
});

module( "Secure Hash Algorithm (SHA-256)" );

test( "Should generated a valid SHA output", function() {
    var hex = sjcl.codec.hex,
        digest = AeroGear.Crypto().hash(SHA256_MESSAGE);
    equal( hex.fromBits( digest ),  SHA256_DIGEST, "Hash is invalid" );
});

test( "Should generated a valid SHA output for empty strings", function() {
    var hex = sjcl.codec.hex;
        digest = AeroGear.Crypto().hash("");
    equal( hex.fromBits( digest ),  SHA256_DIGEST_EMPTY_STRING, "Hash is invalid" );
});

module( "Digital signatures" );

test( "Should generate a valid signature", function() {
    var validation,
        options = {
            keys: sjcl.ecc.ecdsa.generateKeys(192),
            message: PLAIN_TEXT
        };
    options.signature = AeroGear.Crypto().sign( options );
    validation = AeroGear.Crypto().verify( options );

    ok( validation, "Signature should be valid" );

});

test( "Should raise an error with corrupted key", function() {
    var options = {
        keys: sjcl.ecc.ecdsa.generateKeys(192),
        message: PLAIN_TEXT
    };
    options.signature = AeroGear.Crypto().sign( options );
    options.keys = sjcl.ecc.ecdsa.generateKeys(192,10);

    throws(function(){
        AeroGear.Crypto().verify( options );
    }, "Should throw an exception for corrupted or wrong keys");
});

test( "Should raise an error with corrupted signature", function() {
    var options = {
        keys: sjcl.ecc.ecdsa.generateKeys(192),
        message: PLAIN_TEXT
    };
    options.signature = AeroGear.Crypto().sign( options );
    options.signature[1] = ' ';

    throws(function(){
        AeroGear.Crypto().verify( options );
    }, "Should throw an exception for corrupted signatures");
});

module( "Asymmetric encryption with ECC" );

test( "Encrypt/Decrypt raw bytes", function() {
    var hex = sjcl.codec.hex,
        keyPair = new AeroGear.Crypto().KeyPair(),
        cipherText, plainText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: keyPair.getPublicKey(),
            data: hex.toBits( MESSAGE )
        };
    cipherText = AeroGear.Crypto().encrypt( options );
    options.key = keyPair.getPrivateKey();
    options.data = cipherText;
    plainText = AeroGear.Crypto().decrypt( options );
    equal( hex.fromBits( plainText ),  MESSAGE, "Encryption has failed" );
});

test( "Encrypt/Decrypt raw bytes - Provided keys", function() {
    var hex = sjcl.codec.hex,
        keys = sjcl.ecc.elGamal.generateKeys( 192,0 ),
        pub = keys.pub.kem(),
        publicKey = pub.key,
        privateKey = keys.sec.unkem( pub.tag ),
        keyPair = new AeroGear.Crypto().KeyPair( publicKey, privateKey ),
        cipherText, plainText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: keyPair.getPublicKey(),
            data: hex.toBits( MESSAGE )
        };
    cipherText = AeroGear.Crypto().encrypt( options );
    options.key = keyPair.getPrivateKey();
    options.data = cipherText;
    plainText = AeroGear.Crypto().decrypt( options );
    equal( hex.fromBits( plainText ),  MESSAGE, "Encryption has failed" );
});

test( "Decrypt corrupted ciphertext", function() {
    var hex = sjcl.codec.hex,
        keyPair = new AeroGear.Crypto().KeyPair(),
        cipherText, plainText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: keyPair.getPublicKey(),
            data: hex.toBits( MESSAGE )
        };
    options.data = AeroGear.Crypto().encrypt( options );
    options.data[23] = ' ';
    options.key = keyPair.getPrivateKey();

    throws( function() {
        AeroGear.Crypto().decrypt ( options );
    }, "Should throw an exception for corrupted ciphertext");
});

test( "Decrypt with corrupted IV", function() {
    var hex = sjcl.codec.hex,
        keyPair = new AeroGear.Crypto().KeyPair(),
        cipherText, plainText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: keyPair.getPublicKey(),
            data: hex.toBits( MESSAGE )
        };
    options.data = AeroGear.Crypto().encrypt( options );
    options.IV[23] = ' ';
    options.key = keyPair.getPrivateKey();

    throws( function() {
        AeroGear.Crypto().decrypt ( options );
    }, "Should throw an exception for corrupted IVs");
});

test( "Decrypt with the wrong key", function() {
    var hex = sjcl.codec.hex,
        keyPair = new AeroGear.Crypto().KeyPair(),
        cipherText, plainText,
        options = {
            IV: hex.toBits( BOB_IV ),
            AAD: hex.toBits( BOB_AAD ),
            key: keyPair.getPublicKey(),
            data: hex.toBits( MESSAGE )
        };
    options.data = AeroGear.Crypto().encrypt( options );
    options.key = hex.toBits( BOB_PRIVATE_KEY );

    throws( function() {
        AeroGear.Crypto().decrypt( options );
    }, "Should throw an exception for decryption with the wrong key");
});

})( jQuery );
