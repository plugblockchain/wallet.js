"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Wallet = void 0;

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

var _util = require("@polkadot/util");

var _decorators = require("./decorators");

var _naclEncryptor = _interopRequireDefault(require("./encryptors/naclEncryptor"));

var _HDKeyring = require("./keyrings/HDKeyring");

var _class, _temp;

let id = 0;
const privateKeyrings = new WeakMap();
const privatePasswd = new WeakMap();

/**
 * retrieve default keyring
 * @param wallet
 * @ignore
 */
function getDefaultKeyring(wallet) {
  return privateKeyrings.get(wallet)[0];
}
/**
 * search for keyring which store the given address account
 * @param wallet
 * @param accountKeyringMap
 * @param address
 * @ignore
 */


function getKeyringByAddress(wallet, accountKeyringMap, address) {
  const krIdx = accountKeyringMap[address];

  if (krIdx === undefined) {
    throw new Error('address not found in wallet');
  }

  return privateKeyrings.get(wallet)[krIdx];
}
/**
 * a Wallet implementation which can be used as signer in cennznet-api
 * support multi-keyring and shipped with a HD Keyring as default keyring type.
 */


let Wallet = (_class = (_temp = class Wallet {
  /**
   * @return the constructor of default keyring
   */
  get defaultKeyringType() {
    return this._keyringTypes[0];
  }

  constructor() {
    let option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.vault = void 0;
    this._encryptor = void 0;
    this._keyringTypes = void 0;
    this._accountKeyringMap = void 0;
    this._isLocked = true;
    this.vault = option.vault;
    this._encryptor = option.encryptor || _naclEncryptor.default;
    this._keyringTypes = option.keyringTypes || [_HDKeyring.HDKeyring];
    this._accountKeyringMap = {};
    privateKeyrings.set(this, []);
  }
  /**
   * sign a raw payload
   * @param payload
   * @requires wallet unlocked
   * @throws when the account is not managed by the wallet.
   */


  async signRaw(payload) {
    const {
      address,
      data
    } = payload;
    const signerPair = await getKeyringByAddress(this, this._accountKeyringMap, address).getPair(address);
    const signature = (0, _util.u8aToHex)(signerPair.sign((0, _util.hexToU8a)(data)));
    return {
      id: ++id,
      signature
    };
  }
  /**
   * verify a signature using nacl or schnorrkel deps on keyring type
   * @param message
   * @param signature
   * @param address
   * @requires wallet unlocked
   * @throws when the account is not managed by the wallet.
   */


  async verifySignature(message, signature, address) {
    const signerPair = await getKeyringByAddress(this, this._accountKeyringMap, address).getPair(address);
    return signerPair.verify((0, _util.u8aToU8a)(message), (0, _util.u8aToU8a)(signature));
  }
  /**
   * erase the current wallet instance and create a new one with default keyring.
   * @param passphrase for the new created wallet.
   */


  async createNewVault(passphrase, opt) {
    privatePasswd.set(this, passphrase);
    privateKeyrings.set(this, [await this.defaultKeyringType.generate(opt)]);
    this._isLocked = false;
    await this.persistAll();
  }
  /**
   * erase the current wallet instance and create a new one with given keyrings.
   * @param passphrase for the new created wallet.
   */


  async createNewVaultAndRestore(passphrase, keyrings) {
    privatePasswd.set(this, passphrase);
    privateKeyrings.set(this, keyrings);
    this._isLocked = false;
    await this.syncAccountKeyringMap();
    await this.persistAll();
  }
  /**
   * erase in-memory keyrings data and forbid any operation which read/write keyrings
   */


  async lock() {
    privatePasswd.set(this, null);
    privateKeyrings.set(this, []);
    this._isLocked = true;
  }
  /**
   * unlock the wallet
   * @param passphrase
   */


  async unlock(passphrase) {
    if (!this.isLocked()) {
      throw new Error('Wallet has already been unlocked');
    }

    const serialized = await this._encryptor.decrypt(passphrase, this.vault);
    const krs = [];
    await Promise.all(serialized.map(async (serialized, idx) => {
      const KeyringType = this.getKeyringTypeByName(serialized.name);
      const kr = new KeyringType();
      krs[idx] = kr;
      return kr.deserialize(serialized.data);
    }));
    privateKeyrings.set(this, krs);
    privatePasswd.set(this, passphrase);
    this._isLocked = false;
  }
  /**
   * export all keyrings in the wallet
   * @param passphrase
   * @requires wallet unlocked
   * @throw when passphrase is wrong
   */


  async export(passphrase) {
    const serialized = await this._encryptor.decrypt(passphrase, this.vault);
    return serialized;
  }
  /**
   * export the specified account in a json format which can be re-imported via SimpleKeyring's addFromJson()
   * @param address
   * @param passphrase
   * @requires wallet unlocked
   * @throw when passphrase is wrong
   * @throw when account doesn't exist
   */


  async exportAccount(address, passphrase) {
    await this._encryptor.decrypt(passphrase, this.vault);
    const signerPair = await getKeyringByAddress(this, this._accountKeyringMap, address).getPair(address);
    return signerPair.toJson();
  }
  /**
   * @return the lock status
   */


  isLocked() {
    return this._isLocked;
  }
  /**
   * generate a new account using default keyring and add it into wallet
   * @return address of the new generated account
   * @requires wallet unlocked
   */


  async addAccount() {
    const defaultKeyring = getDefaultKeyring(this);
    const kp = await defaultKeyring.addPair();
    return kp.address;
  }
  /**
   * remove the spedified account from wallet
   * @param address
   * @requires wallet unlocked
   * @throws when the account is not managed by this wallet
   * @throws when the account is managed by a hd keyring
   */


  async removeAccount(address) {
    const kr = getKeyringByAddress(this, this._accountKeyringMap, address);
    await kr.removePair(address);
  }
  /**
   * @return all addresses managed by this wallet
   * @requires wallet unlocked
   */


  async getAddresses() {
    return Object.keys(this._accountKeyringMap);
  }
  /**
   * add a keyring instance along with all key pairs in it.
   * addresses already exist in the wallet will be removed from the keyring before it's been added
   * it will be cloned to lose reference to the original keyring
   * @param keyring
   * @requires wallet unlocked
   */


  async addKeyring(keyring) {
    if (!this._keyringTypes.includes(keyring.constructor)) {
      this._keyringTypes.push(keyring.constructor);
    }

    const clonedKeying = await this.cloneKeying(keyring);
    await this.checkDuplicate((await clonedKeying.getAddresses()));
    privateKeyrings.get(this).push(clonedKeying);
  }

  async cloneKeying(keyring) {
    const KeyringTypeInstance = new keyring.constructor();
    return KeyringTypeInstance.deserialize((await keyring.serialize()));
  }

  async checkDuplicate(addresses) {
    const existingAddresses = Object.keys(this._accountKeyringMap);

    for (const address of addresses) {
      if (existingAddresses.includes(address)) {
        throw new Error('detected duplicate account, remove it before calling addKeyring()');
      }
    }
  }

  async persistAll() {
    const serialized = [];
    const krs = privateKeyrings.get(this);
    const serializedPromiseArray = krs.map(async kr => kr.serialize());
    (await Promise.all(serializedPromiseArray)).forEach((data, index) => {
      serialized.push({
        name: krs[index].constructor.name,
        data
      });
    });
    this.vault = await this._encryptor.encrypt(privatePasswd.get(this), serialized);
  }

  async syncAccountKeyringMap() {
    const newMap = {};
    const addressesArray = await Promise.all(privateKeyrings.get(this).map(async kr => kr.getAddresses()));

    for (const [idx, addresses] of addressesArray.entries()) {
      for (const address of addresses) {
        if (newMap[address] !== undefined) {
          newMap[address] = await this.trySolveConflicts(address, newMap[address], idx);
        } else {
          newMap[address] = idx;
        }
      }
    }

    this._accountKeyringMap = newMap;
  }

  async trySolveConflicts(address, krIdx1, krIdx2) {
    const keyrings = privateKeyrings.get(this);
    const kr1 = keyrings[krIdx1];
    const kr2 = keyrings[krIdx2];

    try {
      await kr2.removePair(address);
      return krIdx1;
    } catch (e) {
      try {
        await kr1.removePair(address);
        return krIdx2;
      } catch (e) {
        return krIdx1;
      }
    }
  }

  getKeyringTypeByName(name) {
    const KeyringType = this._keyringTypes.find(t => t.name === name);

    if (!KeyringType) {
      throw new Error("keyring type ".concat(name, " not found"));
    }

    return KeyringType;
  }

}, _temp), ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "signRaw", [_decorators.synchronized, _decorators.requireUnlocked, _decorators.waitForCryptoReady], Object.getOwnPropertyDescriptor(_class.prototype, "signRaw"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "verifySignature", [_decorators.synchronized, _decorators.requireUnlocked, _decorators.waitForCryptoReady], Object.getOwnPropertyDescriptor(_class.prototype, "verifySignature"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "createNewVault", [_decorators.synchronized, _decorators.waitForCryptoReady], Object.getOwnPropertyDescriptor(_class.prototype, "createNewVault"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "createNewVaultAndRestore", [_decorators.synchronized, _decorators.waitForCryptoReady], Object.getOwnPropertyDescriptor(_class.prototype, "createNewVaultAndRestore"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "lock", [_decorators.synchronized], Object.getOwnPropertyDescriptor(_class.prototype, "lock"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "unlock", [_decorators.synchronized, _decorators.persistBeforeReturn], Object.getOwnPropertyDescriptor(_class.prototype, "unlock"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "export", [_decorators.synchronized, _decorators.requireUnlocked], Object.getOwnPropertyDescriptor(_class.prototype, "export"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "exportAccount", [_decorators.synchronized, _decorators.requireUnlocked], Object.getOwnPropertyDescriptor(_class.prototype, "exportAccount"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "addAccount", [_decorators.synchronized, _decorators.requireUnlocked, _decorators.persistBeforeReturn, _decorators.waitForCryptoReady], Object.getOwnPropertyDescriptor(_class.prototype, "addAccount"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "removeAccount", [_decorators.synchronized, _decorators.requireUnlocked, _decorators.persistBeforeReturn], Object.getOwnPropertyDescriptor(_class.prototype, "removeAccount"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "getAddresses", [_decorators.synchronized, _decorators.requireUnlocked], Object.getOwnPropertyDescriptor(_class.prototype, "getAddresses"), _class.prototype), (0, _applyDecoratedDescriptor2.default)(_class.prototype, "addKeyring", [_decorators.synchronized, _decorators.requireUnlocked, _decorators.persistBeforeReturn], Object.getOwnPropertyDescriptor(_class.prototype, "addKeyring"), _class.prototype)), _class);
exports.Wallet = Wallet;