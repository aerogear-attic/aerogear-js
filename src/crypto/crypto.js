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

// Method to provide password encryption with PBKDF2
/**
    Returns the value the encrypted password
    @status Experimental
    @param {String} password - password to be encrypted
    @return {bitArray} - the derived key
    @example
    //Password encryption:
    AeroGear.password('mypassword');
 */
AeroGear.password = function ( password ) {
    var hex = sjcl.codec.hex;
    var salt = new sjcl.prng(12);
    var count = 2048;
    return sjcl.misc.pbkdf2(password, hex.fromBits(salt), count);
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
    AeroGear.encrypt( options );
 */
AeroGear.encrypt = function ( options ) {
    var gcm = sjcl.mode.gcm;
    options = options || {};
    var key = new sjcl.cipher.aes ( options.key );
    return gcm.encrypt(key, options.data, options.IV, options.aad, 128);
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
    AeroGear.decrypt( options );
 */
AeroGear.decrypt = function ( options ) {
   var gcm = sjcl.mode.gcm;
   options = options || {};
   var key = new sjcl.cipher.aes ( options.key );
   return gcm.decrypt(key, options.data, options.IV, options.aad, 128);
};
