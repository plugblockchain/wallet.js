// Copyright 2019 Centrality Investments Limited
// Licensed under the Apache license, Version 2.0 (the "license"); you may not use this file except in compliance with the license.
// You may obtain a copy of the license at http://www.apache.org/licences/LICENCE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the licence is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the licence for the specific language governing permissions and limitations under the licence.

import 'reflect-metadata';

// type Newable<T> = {
//     name: string;
//     new (...args: any[]): T;
// };

/**
 *
 * @ignore
 */
// export function isTypePromise(type: Newable<any>): boolean {
//     try {
//         const test = new type(() => ({}));
//         return test.then && typeof test.then === 'function';
//     } catch (e) {
//         return false;
//     }
// }

/**
 *
 * @ignore
 */
export const requireUnlocked = (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args) => Promise<any>>
) => {
    const origin = descriptor.value;
    descriptor.value = function(...args) {
        if (this.isLocked()) {
            return Promise.reject(new Error('wallet is locked'));
        }
        return origin.apply(this, args);
    };
};

/**
 *
 * @ignore
 */
export const persistBeforeReturn = (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args) => Promise<any>>
) => {
    const origin = descriptor.value;
    descriptor.value = <any>function(...args) {
        return origin.apply(this, args).then(res =>
            this.syncAccountKeyringMap()
                .then(() => this.persistAll())
                .then(() => res)
        );
    };
};

const mutexLocks = new Map<Object, Promise<any>>();
/**
 *
 * @ignore
 */
export const synchronized = (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args) => Promise<any>>
) => {
    const origin = descriptor.value;
    descriptor.value = async function(...args) {
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
