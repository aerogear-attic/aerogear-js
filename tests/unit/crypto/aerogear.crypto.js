(function( $ ) {

/**
 * SHA256 test vectors
 */

var SHA256_MESSAGE = "My Bonnie lies over the ocean, my Bonnie lies over the sea";
var SHA256_DIGEST = "d281d10296b7bde20df3f3f4a6d1bdb513f4aa4ccb0048c7b2f7f5786b4bcb77";
var SHA256_DIGEST_EMPTY_STRING = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

/**
  * Test vectors for PBKDF2
  */

var PASSWORD = "Bacon ipsum dolor sit amet prosciutto ground round short ribs" +
               "short loin tri-tip meatball jowl frankfurter turducken pork belly";
var ENCRYPTED_PASSWORD = "269a804bf4584bbda65c72143aa86b73449618aeb7fa636ec2fa05d1146f2379";

/**
  * Test vectors for symmetric encryption
  */
var PLAIN_TEXT = "My Bonnie lies over the ocean, my Bonnie lies over the sea";
var BOB_SECRET_KEY = "f3a9375ec8746cc6e78e4b02d7e748988e10c74525e5c0a41d63fe5d21f84224";
var BOB_AAD = "feedfacedeadbeeffeedfacedeadbeefabaddad2";
var BOB_IV = "69696ee955b62b73cd62bda875fc73d68219e0036b7a0b37";
var TAG_SIZE = 128;

var MESSAGE = "be075fc53c81f2d5cf141316ebeb0c7b5228c52a4c62cbd44b66849b64244ffc" +
            "e5ecbaaf33bd751a1ac728d45e6c61296cdc3c01233561f41db66cce314adb31" +
            "0e3be8250c46f06dceea3a7fa1348057e2f6556ad6b1318a024a838f21af1fde" +
            "048977eb48f59ffd4924ca1c60902e52f0a089bc76897040e082f93776384864" +
            "5e0705";
var CIPHERTEXT = "b05177ed87371685bcb4ba37ec51ec66712950fb18778e3c915be42a973f127" +
            "f15f8b053c57c223ef7c2f7bea59bc5b63f32ac0d2daaecb75cb489489a46cbcdb749c0" +
            "9cdc0f6adfbf1cb625053f7b20800f9a7c1ef6a4379df67a9873ec696e0ca484861a70de" +
            "22254fe3790f02b39746fb1f6a47d95294fdfc3e55ff3a38a855c1572e518ad0a036b7c75f" +
            "7e894858562992";

var BOB_PRIVATE_KEY = "5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb";
var BOB_PUBLIC_KEY = "de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f";

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
        cipherText, plainText,
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
        cipherText, plainText,
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
        cipherText, plainText,
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
        cipherText, plainText,
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
    var hex = sjcl.codec.hex,
        digest;
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
