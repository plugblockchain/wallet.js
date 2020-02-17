"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

var _decorators = require("./decorators");

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
describe('decorators', () => {
  // it('test if a Type is a Promise like type', () => {
  //     expect(isTypePromise(Promise)).toBeTruthy();
  //     expect(isTypePromise(class ABC {})).toBeFalsy();
  // });
  describe('@persistBeforeReturn', () => {
    // it('throw error if return is not a Promise', () => {
    //     expect(() => {
    //         class Test {
    //             @persistBeforeReturn
    //             testFunc() {
    //                 return 'abc';
    //             }
    //         }
    //     }).toThrow('method decorated by @persistBeforeReturn must return Promise');
    // });
    it('call syncAccountKeyringMap and persistAll if success', async () => {
      var _class;

      let called = 0;
      let Mock = (_class = class Mock {
        persistAll() {
          called += 1;
          return Promise.resolve();
        }

        syncAccountKeyringMap() {
          called += 1;
          return Promise.resolve();
        }

        testFunc() {
          return Promise.resolve();
        }

      }, ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "testFunc", [_decorators.persistBeforeReturn], Object.getOwnPropertyDescriptor(_class.prototype, "testFunc"), _class.prototype)), _class);
      const mock = new Mock();
      await mock.testFunc();
      expect(called).toBe(2);
    });
    it('not call persistAll if decorated function failed', async () => {
      var _class2;

      let called = 0;
      let Mock = (_class2 = class Mock {
        persistAll() {
          called += 1;
          return Promise.resolve();
        }

        syncAccountKeyringMap() {
          called += 1;
          return Promise.resolve();
        }

        testFunc() {
          return Promise.reject();
        }

      }, ((0, _applyDecoratedDescriptor2.default)(_class2.prototype, "testFunc", [_decorators.persistBeforeReturn], Object.getOwnPropertyDescriptor(_class2.prototype, "testFunc"), _class2.prototype)), _class2);
      const mock = new Mock();
      await mock.testFunc().catch(() => null);
      expect(called).toBe(0);
    });
  });
  describe('@requireUnlocked', () => {
    // it('throw error if isLocked() is true', () => {
    //     class Mock {
    //         isLocked() {
    //             return true;
    //         }
    //         @requireUnlocked
    //         async testFunc() {}
    //     }
    //     const mock = new Mock();
    //     expect(() => mock.testFunc()).toThrow('wallet is locked');
    // });
    it('reject Promise if isLocked() is true', async () => {
      var _class3;

      let Mock = (_class3 = class Mock {
        isLocked() {
          return true;
        }

        async testFunc() {
          return Promise.resolve();
        }

      }, ((0, _applyDecoratedDescriptor2.default)(_class3.prototype, "testFunc", [_decorators.requireUnlocked], Object.getOwnPropertyDescriptor(_class3.prototype, "testFunc"), _class3.prototype)), _class3);
      const mock = new Mock();
      await expect(mock.testFunc()).rejects.toThrow('wallet is locked');
    }); // it('run method and return normally if isLocked() is false', () => {
    //     class Mock {
    //         isLocked() {
    //             return false;
    //         }
    //         @requireUnlocked
    //         testFunc(): string {
    //             return 'ok';
    //         }
    //     }
    //     const mock = new Mock();
    //     expect(mock.testFunc()).toBe('ok');
    // });

    it('run method and resolve promise if isLocked() is false', async () => {
      var _class4;

      let Mock = (_class4 = class Mock {
        isLocked() {
          return false;
        }

        async testFunc() {
          return Promise.resolve('ok');
        }

      }, ((0, _applyDecoratedDescriptor2.default)(_class4.prototype, "testFunc", [_decorators.requireUnlocked], Object.getOwnPropertyDescriptor(_class4.prototype, "testFunc"), _class4.prototype)), _class4);
      const mock = new Mock();
      await expect(mock.testFunc()).resolves.toBe('ok');
    });
    it('run method and reject promise if isLocked() is false', async () => {
      var _class5;

      let Mock = (_class5 = class Mock {
        isLocked() {
          return false;
        }

        async testFunc() {
          return Promise.reject('expected');
        }

      }, ((0, _applyDecoratedDescriptor2.default)(_class5.prototype, "testFunc", [_decorators.requireUnlocked], Object.getOwnPropertyDescriptor(_class5.prototype, "testFunc"), _class5.prototype)), _class5);
      const mock = new Mock();
      await expect(mock.testFunc()).rejects.toMatch('expected');
    });
  });
  describe('@synchronized', () => {
    it('call methods inside class synchronously', async () => {
      var _class6;

      let Mock = (_class6 = class Mock {
        method1() {
          return new Promise(resolve => {
            setTimeout(() => resolve('method1'), 2000);
          });
        }

        method2() {
          return new Promise(resolve => {
            setTimeout(() => resolve('method2'), 1000);
          });
        }

        method3() {
          return new Promise(resolve => {
            setTimeout(() => resolve('method3'), 500);
          });
        }

      }, ((0, _applyDecoratedDescriptor2.default)(_class6.prototype, "method1", [_decorators.synchronized], Object.getOwnPropertyDescriptor(_class6.prototype, "method1"), _class6.prototype), (0, _applyDecoratedDescriptor2.default)(_class6.prototype, "method2", [_decorators.synchronized], Object.getOwnPropertyDescriptor(_class6.prototype, "method2"), _class6.prototype), (0, _applyDecoratedDescriptor2.default)(_class6.prototype, "method3", [_decorators.synchronized], Object.getOwnPropertyDescriptor(_class6.prototype, "method3"), _class6.prototype)), _class6);
      const mock = new Mock();
      const retOrder = [];
      await Promise.all([mock.method1().then(res => retOrder.push(res)), mock.method2().then(res => retOrder.push(res)), mock.method3().then(res => retOrder.push(res))]);
      expect(retOrder).toEqual(['method1', 'method2', 'method3']);
    });
    it('works in the instance scope', async () => {
      var _class7, _class8;

      let Mock1 = (_class7 = class Mock1 {
        method() {
          return new Promise(resolve => {
            setTimeout(() => resolve('Mock1'), 2000);
          });
        }

      }, ((0, _applyDecoratedDescriptor2.default)(_class7.prototype, "method", [_decorators.synchronized], Object.getOwnPropertyDescriptor(_class7.prototype, "method"), _class7.prototype)), _class7);
      let Mock2 = (_class8 = class Mock2 {
        method() {
          return new Promise(resolve => {
            setTimeout(() => resolve('Mock2'), 500);
          });
        }

      }, ((0, _applyDecoratedDescriptor2.default)(_class8.prototype, "method", [_decorators.synchronized], Object.getOwnPropertyDescriptor(_class8.prototype, "method"), _class8.prototype)), _class8);
      const mock1 = new Mock1();
      const mock2 = new Mock2();
      const retOrder = [];
      await Promise.all([mock1.method().then(res => retOrder.push(res)), mock2.method().then(res => retOrder.push(res))]);
      expect(retOrder).toEqual(['Mock2', 'Mock1']);
    });
    it('success even if previous failed', async () => {
      var _class9, _temp;

      let Mock = (_class9 = (_temp = class Mock {
        constructor() {
          this.count = 0;
        }

        method() {
          return new Promise((resolve, reject) => {
            if (this.count === 0) {
              this.count += 1;
              setTimeout(() => reject(new Error()), 1000);
            } else {
              setTimeout(() => resolve('mock'), 0);
            }
          });
        }

      }, _temp), ((0, _applyDecoratedDescriptor2.default)(_class9.prototype, "method", [_decorators.synchronized], Object.getOwnPropertyDescriptor(_class9.prototype, "method"), _class9.prototype)), _class9);
      const mock = new Mock();
      [] = [await expect(mock.method()).rejects.toThrow(), await expect(mock.method()).resolves.toBe('mock')];
    }); // it('throw error if return is not a Promise', () => {
    //     expect(() => {
    //         class Mock {
    //             @synchronized
    //             testFunc() {
    //                 return 'abc';
    //             }
    //         }
    //     }).toThrow('method decorated by @synchronized must return Promise');
    // });
  });
});