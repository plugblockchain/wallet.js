// Copyright 2019 Centrality Investments Limited
// Licensed under the Apache license, Version 2.0 (the "license"); you may not use this file except in compliance with the license.
// You may obtain a copy of the license at http://www.apache.org/licences/LICENCE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the licence is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the licence for the specific language governing permissions and limitations under the licence.

import {hexToU8a, stringToU8a, u8aFixLength, u8aToHex, u8aToString} from '@plugnet/util';
import {randomBytes, secretbox} from 'tweetnacl';

const newNonce = () => randomBytes(secretbox.nonceLength);

const PASS_STRENGTH = 256;

const encrypt = async (passphrase: string, json: object): Promise<string> => {
    const keyUint8Array = u8aFixLength(stringToU8a(passphrase), PASS_STRENGTH, true);

    const nonce = newNonce();
    const messageUint8 = stringToU8a(JSON.stringify(json));
    const box = secretbox(messageUint8, nonce, keyUint8Array);

    const fullMessage = new Uint8Array(nonce.length + box.length);
    fullMessage.set(nonce);
    fullMessage.set(box, nonce.length);

    return u8aToHex(fullMessage);
};

const decrypt = async (passphrase: string, encoded: string): Promise<object> => {
    const keyUint8Array = u8aFixLength(stringToU8a(passphrase), PASS_STRENGTH, true);
    const messageWithNonceAsUint8Array = hexToU8a(encoded);
    const nonce = messageWithNonceAsUint8Array.slice(0, secretbox.nonceLength);
    const message = messageWithNonceAsUint8Array.slice(secretbox.nonceLength, encoded.length);

    const decrypted = secretbox.open(message, nonce, keyUint8Array);

    if (!decrypted) {
        throw new Error('wrong passphrase');
    }

    const base64DecryptedMessage = u8aToString(decrypted);
    return JSON.parse(base64DecryptedMessage);
};

export default {
    encrypt,
    decrypt,
};
