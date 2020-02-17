"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.synchronized = exports.persistBeforeReturn = exports.requireUnlocked = exports.waitForCryptoReady = void 0;

var _utilCrypto = require("@polkadot/util-crypto");

require("reflect-metadata");

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

/**
 *
 * @ignore
 */
const waitForCryptoReady = (target, propertyKey, descriptor) => {
  const origin = descriptor.value;

  descriptor.value = async function () {
    await (0, _utilCrypto.cryptoWaitReady)();

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return origin.apply(this, args);
  };
};
/**
 *
 * @ignore
 */


exports.waitForCryptoReady = waitForCryptoReady;

const requireUnlocked = (target, propertyKey, descriptor) => {
  const origin = descriptor.value;

  descriptor.value = function () {
    if (this.isLocked()) {
      return Promise.reject(new Error('wallet is locked'));
    }

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return origin.apply(this, args);
  };
};
/**
 *
 * @ignore
 */


exports.requireUnlocked = requireUnlocked;

const persistBeforeReturn = (target, propertyKey, descriptor) => {
  const origin = descriptor.value;

  descriptor.value = function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return origin.apply(this, args).then(res => this.syncAccountKeyringMap().then(() => this.persistAll()).then(() => res));
  };
};

exports.persistBeforeReturn = persistBeforeReturn;
const mutexLocks = new Map();
/**
 *
 * @ignore
 */

const synchronized = (target, propertyKey, descriptor) => {
  const origin = descriptor.value;

  descriptor.value = async function () {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    let mutexLock = mutexLocks.get(this);

    if (!mutexLock) {
      mutexLock = origin.apply(this, args);
    } else {
      mutexLock = mutexLock.catch(() => {}).then(() => origin.apply(this, args));
    }

    mutexLocks.set(this, mutexLock);
    return mutexLock;
  };
};

exports.synchronized = synchronized;