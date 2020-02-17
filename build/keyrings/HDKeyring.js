"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HDKeyring = void 0;

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

var _keyring = require("@polkadot/keyring");

var _utilCrypto = require("@polkadot/util-crypto");

var _hdkey = _interopRequireDefault(require("hdkey"));

var _constants = require("../constants");

var _decorators = require("../decorators");

var _class, _class2, _temp;

const privateMnemonic = new WeakMap(); // tslint:disable member-ordering no-magic-numbers

/**
 * a HD Keyring implementation of ${IKeyring}
 * will use hd path "m/44'/317'/0'/0" by default
 */
let HDKeyring = (_class = (_temp = _class2 = class HDKeyring {
  // can be replaced in derived classes
  static async generate() {
    let opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    const mnemonic = (0, _utilCrypto.mnemonicGenerate)(opt.words);
    const keyring = new HDKeyring({
      mnemonic,
      numberOfAccounts: opt.numberOfAccounts || 0,
      hdPath: opt.hdPath,
      keyringType: opt.keyringType || _constants.DEFAULT_KEYRING_TYPE
    });
    return keyring;
  }

  constructor(opt) {
    this.rootKey = void 0;
    this.pairs = void 0;
    this.hdPath = void 0;
    this.keyringType = void 0;
    this.pairs = [];
    this.hdPath = opt && opt.hdPath ? opt.hdPath : this.constructor.DEFAULT_HD_PATH;

    if (opt) {
      this._deserialize(opt);
    }
  }

  async deserialize(opt) {
    this._deserialize(opt);

    return this;
  }

  async serialize() {
    return {
      mnemonic: privateMnemonic.get(this),
      numberOfAccounts: this.pairs.length,
      hdPath: this.hdPath,
      keyringType: this.keyringType
    };
  }

  async addPair() {
    if (!this.rootKey) {
      throw new Error('hd wallet not initialized');
    }

    const keyring = new _keyring.Keyring({
      type: _constants.DEFAULT_KEYRING_TYPE
    });
    const kp = keyring.addFromSeed(this.rootKey.deriveChild(this.pairs.length).privateKey);
    this.pairs.push(kp);
    return kp;
  }

  async getAddresses() {
    return this.pairs.map(kp => kp.address);
  }

  async getPair(address) {
    const pair = this.pairs.find(kp => kp.address === address);

    if (!pair) {
      throw new Error("Unable to retrieve keypair ".concat(address));
    }

    return pair;
  }

  async getPairs() {
    return this.pairs;
  }

  async removePair(address) {
    return Promise.reject(new Error("HD Keyring doesn't support removePair"));
  }

  _deserialize(opt) {
    const {
      mnemonic,
      numberOfAccounts = 0,
      hdPath = this.hdPath,
      keyringType = _constants.DEFAULT_KEYRING_TYPE
    } = opt;

    const hdKey = _hdkey.default.fromMasterSeed(Buffer.from((0, _utilCrypto.mnemonicToSeed)(mnemonic)));

    this.hdPath = hdPath;
    this.rootKey = hdKey.derive(hdPath);
    privateMnemonic.set(this, mnemonic);
    const keyring = new _keyring.Keyring({
      type: _constants.DEFAULT_KEYRING_TYPE
    });

    for (let i = 0; i < numberOfAccounts; i++) {
      const kp = keyring.addFromSeed(this.rootKey.deriveChild(i).privateKey);
      this.pairs.push(kp);
    }

    this.keyringType = keyringType;
  }

}, _class2.DEFAULT_HD_PATH = "m/44'/317'/0'/0", _temp), ((0, _applyDecoratedDescriptor2.default)(_class, "generate", [_decorators.waitForCryptoReady], Object.getOwnPropertyDescriptor(_class, "generate"), _class), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "deserialize", [_decorators.waitForCryptoReady], Object.getOwnPropertyDescriptor(_class.prototype, "deserialize"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "addPair", [_decorators.waitForCryptoReady], Object.getOwnPropertyDescriptor(_class.prototype, "addPair"), _class.prototype)), _class);
exports.HDKeyring = HDKeyring;