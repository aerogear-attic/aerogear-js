/* AeroGear JavaScript Library
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright Red Hat, Inc., and individual contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

AeroGear.Crypto = function() {

    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.Crypto ) ) {
        return new AeroGear.Crypto();
    }

    // Local Variables
    var privateKey, publicKey;

    /**
        Returns the value of the private key var
        @private
        @augments Crypto
        @returns {Object}
     */
    this.getPrivateKey = function() {
        return privateKey;
    };

    /**
        Returns the value of the public key var
        @private
        @augments Crypto
        @returns {Object}
     */
    this.getPublicKey = function() {
        return publicKey;
    };

    // Method to provide key derivation with PBKDF2
    /**
        Returns the value of the key
        @status Experimental
        @param {String} password - master password
        @return {bitArray} - the derived key
        @example
        //Password encryption:
        AeroGear.crypto.deriveKey( 'mypassword' );
     */
    this.deriveKey = function( password ) {
        var utf8String = sjcl.codec.utf8String,
            salt = new Uint32Array( 1 ),
            count = 2048;
        crypto.getRandomValues( salt );
        return sjcl.misc.pbkdf2( password, utf8String.toBits( salt[0] ), count );
    };

    // Method to provide symmetric encryption with GCM by default
    /**
        Encrypts in GCM mode
        @status Experimental
        @param {Object} options - includes IV (Initialization Vector), AAD
            (Additional Authenticated Data), key (private key for encryption),
            plainText (data to be encrypted)
        @return {bitArray} - The encrypted data represented by an array of bytes
        @example
        //Data encryption:
        var options = {
            IV: myIV,
            AAD: myAAD,
            key: mySecretKey,
            data: message
        };
        AeroGear.crypto.encrypt( options );
     */
    this.encrypt = function( options ) {
        options = options || {};
        var gcm = sjcl.mode.gcm,
            key = new sjcl.cipher.aes ( options.key );
        return gcm.encrypt( key, options.data, options.IV, options.aad, 128 );
    };

    // Method to provide symmetric decryption with GCM by default
    /**
        Decrypts in GCM mode
        @status Experimental
        @param {Object} options - includes IV (Initialization Vector), AAD
            (Additional Authenticated Data), key (private key for encryption),
            ciphertext (data to be decrypted)
        @return {bitArray} - The decrypted data
        @example
        //Data decryption:
        var options = {
            IV: myIV,
            AAD: myAAD,
            key: mySecretKey,
            data: ciphertext
        };
        AeroGear.crypto.decrypt( options );
     */
    this.decrypt = function( options ) {
        options = options || {};
        var gcm = sjcl.mode.gcm,
            key = new sjcl.cipher.aes ( options.key );
        return gcm.decrypt( key, options.data, options.IV, options.aad, 128 );
    };

    // Method to provide secure hashing
    /**
        Generates a hash output based on SHA-256
        @status Experimental
        @param {bitArray|String} data to hash.
        @return {bitArray} - Hash value
        @example
        //Data hashing:
        AeroGear.crypto.hash( options );
     */
    this.hash = function( data ) {
        return sjcl.hash.sha256.hash( data );
    };

    // Method to provide digital signatures
    /**
        Sign messages with ECDSA
        @status Experimental
        @param {Object} options - includes keys (provided keys to sign the message),
            message (message to be signed)
        @return {bitArray} - Digital signature
        @example
        //Message sign:
        var options = {
            keys: providedKey,
            message: PLAIN_TEXT
        };
        AeroGear.crypto.sign( options );
     */
    this.sign = function( options ) {
        options = options || {};
        var keys = options.keys || sjcl.ecc.ecdsa.generateKeys( 192 ),
            hash = sjcl.hash.sha256.hash( options.message );
        return keys.sec.sign( hash );
    };

    // Method to verify digital signatures
    /**
        Verify signed messages with ECDSA
        @status Experimental
        @param {Object} options - includes keys (provided keys to sign the message),
            message (message to be verified), signature (Digital signature)
        @return {bitArray} - Signature
        @example
        //Message validation
        var options = {
            keys: sjcl.ecc.ecdsa.generateKeys(192),
            signature: signatureToBeVerified
        };
        AeroGear.crypto.verify( options );
     */
    this.verify = function ( options ) {
        options = options || {};
        var message = sjcl.hash.sha256.hash( options.message );
        return options.keys.pub.verify( message, options.signature );
    };

    this.KeyPair = function( prKey, pubKey ) {

        var keys, pub;

        if ( prKey && pubKey ) {
            privateKey = prKey;
            publicKey = pubKey;
        } else {
            keys = sjcl.ecc.elGamal.generateKeys( 192,0 );
            //kem - key encapsulation mechanism
            pub = keys.pub.kem();
            publicKey = pub.key;
            privateKey = keys.sec.unkem( pub.tag );
        }

        return this;
    };
};
