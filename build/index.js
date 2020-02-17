"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Keyring", {
  enumerable: true,
  get: function get() {
    return _keyring.default;
  }
});
Object.defineProperty(exports, "TestingPairs", {
  enumerable: true,
  get: function get() {
    return _testingPairs.default;
  }
});
Object.defineProperty(exports, "Wallet", {
  enumerable: true,
  get: function get() {
    return _Wallet.Wallet;
  }
});
Object.defineProperty(exports, "SimpleKeyring", {
  enumerable: true,
  get: function get() {
    return _SimpleKeyring.SimpleKeyring;
  }
});
Object.defineProperty(exports, "HDKeyring", {
  enumerable: true,
  get: function get() {
    return _HDKeyring.HDKeyring;
  }
});

var _keyring = _interopRequireDefault(require("@polkadot/keyring"));

var _testingPairs = _interopRequireDefault(require("@polkadot/keyring/testingPairs"));

var _Wallet = require("./Wallet");

var _SimpleKeyring = require("./keyrings/SimpleKeyring");

var _HDKeyring = require("./keyrings/HDKeyring");