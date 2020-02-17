"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("@polkadot/util");

var _tweetnacl = require("tweetnacl");

// Copyright 2019 Centrality Investments Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const newNonce = () => (0, _tweetnacl.randomBytes)(_tweetnacl.secretbox.nonceLength);

const PASS_STRENGTH = 256;

const encrypt = async (passphrase, json) => {
  const keyUint8Array = (0, _util.u8aFixLength)((0, _util.stringToU8a)(passphrase), PASS_STRENGTH, true);
  const nonce = newNonce();
  const messageUint8 = (0, _util.stringToU8a)(JSON.stringify(json));
  const box = (0, _tweetnacl.secretbox)(messageUint8, nonce, keyUint8Array);
  const fullMessage = new Uint8Array(nonce.length + box.length);
  fullMessage.set(nonce);
  fullMessage.set(box, nonce.length);
  return (0, _util.u8aToHex)(fullMessage);
};

const decrypt = async (passphrase, encoded) => {
  const keyUint8Array = (0, _util.u8aFixLength)((0, _util.stringToU8a)(passphrase), PASS_STRENGTH, true);
  const messageWithNonceAsUint8Array = (0, _util.hexToU8a)(encoded);
  const nonce = messageWithNonceAsUint8Array.slice(0, _tweetnacl.secretbox.nonceLength);
  const message = messageWithNonceAsUint8Array.slice(_tweetnacl.secretbox.nonceLength, encoded.length);

  const decrypted = _tweetnacl.secretbox.open(message, nonce, keyUint8Array);

  if (!decrypted) {
    throw new Error('wrong passphrase');
  }

  const base64DecryptedMessage = (0, _util.u8aToString)(decrypted);
  return JSON.parse(base64DecryptedMessage);
};

var _default = {
  encrypt,
  decrypt
};
exports.default = _default;