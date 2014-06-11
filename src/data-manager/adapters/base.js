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
/**
    The Base adapter that all other adapters will extend from.
    Not to be Instantiated directly
 */
AeroGear.DataManager.adapters.base = function( storeName, settings ) {
    if ( this instanceof AeroGear.DataManager.adapters.base ) {
        throw "Invalid instantiation of base class AeroGear.DataManager.adapters.base";
    }

    settings = settings || {};

    // Private Instance vars
    var data = null,
        recordId = settings.recordId ? settings.recordId : "id",
        crypto = settings.crypto || {},
        cryptoOptions = crypto.options || {};

    // Privileged Methods
    /**
        Returns the value of the private data var
        @private
        @augments base
        @returns {Array}
     */
    this.getData = function() {
        return data || [];
    };

    /**
        Sets the value of the private data var
        @private
        @augments base
     */
    this.setData = function( newData ) {
        data = newData;
    };
    /**
        Returns the value of the private recordId var
        @private
        @augments base
        @returns {String}
     */
    this.getRecordId = function() {
        return recordId;
    };

    /**
        Encrypt data being saved or updated if applicable
        @private
        @augments base
     */
    this.encrypt = function( data ) {
        var content;

        if( crypto.agcrypto ) {
            cryptoOptions.data = sjcl.codec.utf8String.toBits( JSON.stringify( data ) );
            content = {
                id: data[ recordId ],
                data: crypto.agcrypto.encrypt( cryptoOptions )
            };
            window.localStorage.setItem( "ag-" + storeName + "-IV", JSON.stringify( { id: crypto.agcrypto.getIV() } ) );
            return content;
        }

        return data;
    };

    /**
        Decrypt data being read if applicable
        @private
        @augments base
     */
    this.decrypt = function( data, isSessionLocal ) {
        var content, IV;

        if( crypto.agcrypto ) {
            IV = JSON.parse( window.localStorage.getItem( "ag-" + storeName + "-IV" ) ) || {};
            cryptoOptions.IV = IV.id;
            data = Array.isArray( data ) ? data : [ data ];
            content = data.map( function( value ) {
                cryptoOptions.data = value.data;
                return JSON.parse( sjcl.codec.utf8String.fromBits( crypto.agcrypto.decrypt( cryptoOptions ) ) );
            });

            return isSessionLocal ? content[ 0 ] : content;
        }

        return data;
    };
};
