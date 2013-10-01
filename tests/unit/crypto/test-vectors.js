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

var ALICE_PRIVATE_KEY = "77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a";
var ALICE_PUBLIC_KEY = "8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a";

var BOX_NONCE = "69696ee955b62b73cd62bda875fc73d68219e0036b7a0b37";
var BOX_MESSAGE = "be075fc53c81f2d5cf141316ebeb0c7b5228c52a4c62cbd44b66849b64244ffc" +
            "e5ecbaaf33bd751a1ac728d45e6c61296cdc3c01233561f41db66cce314adb31" +
            "0e3be8250c46f06dceea3a7fa1348057e2f6556ad6b1318a024a838f21af1fde" +
            "048977eb48f59ffd4924ca1c60902e52f0a089bc76897040e082f93776384864" +
            "5e0705";
var BOX_CIPHERTEXT = "fa11d3d36080df6f68d1201bf98d761886dc17003129b1a2ffa8fcb96292ed53f178b07dbd6b451a" +
                     "746f3ae1a47c194f0003b331ef9d0be1b81b49392870a26e4f8e3307e299d9ca23adc0f704559de9bd93" +
                     "e0e95d044829f2b0b2a2b830be0f82de4ea774341cc882c8a63b7914285323e19af6b862281597b14847b1" +
                     "6dc840de8d8d2f7b526b5c4a0516d11c4bd5e4415b20";
