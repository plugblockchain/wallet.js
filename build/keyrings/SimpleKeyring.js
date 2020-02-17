"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SimpleKeyring = void 0;

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

var _keyring = require("@polkadot/keyring");

var _utilCrypto = require("@polkadot/util-crypto");

var _constants = require("../constants");

var _decorators = require("../decorators");

var _class, _temp;

/**
 * a Simple Keyring implementation of ${IKeyring} can be used to manage individual key pairs
 */
let SimpleKeyring = (_class = (_temp = class SimpleKeyring {
  static async generate() {
    return new SimpleKeyring();
  }

  constructor(opt) {
    this._keyring = new _keyring.Keyring({
      type: _constants.DEFAULT_KEYRING_TYPE
    });

    if (opt) {
      this._deserialize(opt);
    }
  }

  async serialize() {
    return (await this.getPairs()).map(pair => pair.toJson());
  }

  async deserialize(data) {
    this._deserialize(data);

    return this;
  }

  async addPair(pair) {
    if (pair === undefined) {
      return this._keyring.addFromMnemonic((0, _utilCrypto.mnemonicGenerate)());
    } else {
      if (pair.isLocked) {
        throw new Error('key pair is locked. unlock before add it into wallet');
      }

      return this._keyring.addPair(pair);
    }
  }

  async getAddresses() {
    return this._keyring.getPairs().map(kp => kp.address);
  }

  async getPair(address) {
    return this._keyring.getPair(address);
  }

  async getPairs() {
    return this._keyring.getPairs();
  }

  async removePair(address) {
    this._keyring.removePair(address);
  }

  addFromJson(pair, ignoreChecksum, passphrase) {
    let keyPair;

    if (ignoreChecksum === undefined || ignoreChecksum === null) {
      keyPair = this._keyring.addFromJson(pair);
    } else {
      keyPair = this._keyring.addFromJson(pair, ignoreChecksum);
    }

    try {
      keyPair.decodePkcs8(passphrase);
    } catch (e) {
      this._keyring.removePair(pair.address);

      throw e;
    }

    return keyPair;
  }

  addFromMnemonic(mnemonic) {
    let meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _constants.DEFAULT_KEYRING_TYPE;
    return this._keyring.addFromMnemonic(mnemonic, meta, type);
  }

  addFromSeed(seed) {
    let meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _constants.DEFAULT_KEYRING_TYPE;
    return this._keyring.addFromSeed(seed, meta, type);
  }

  addFromUri(suri) {
    let meta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _constants.DEFAULT_KEYRING_TYPE;
    return this._keyring.addFromUri(suri, meta, type);
  }

  _deserialize(data) {
    this._keyring = new _keyring.Keyring({
      type: _constants.DEFAULT_KEYRING_TYPE
    });

    for (const json of data) {
      this.addFromJson(json);
    }
  }

}, _temp), ((0, _applyDecoratedDescriptor2.default)(_class, "generate", [_decorators.waitForCryptoReady], Object.getOwnPropertyDescriptor(_class, "generate"), _class), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "deserialize", [_decorators.waitForCryptoReady], Object.getOwnPropertyDescriptor(_class.prototype, "deserialize"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "addPair", [_decorators.waitForCryptoReady], Object.getOwnPropertyDescriptor(_class.prototype, "addPair"), _class.prototype)), _class);
exports.SimpleKeyring = SimpleKeyring;