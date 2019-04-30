// Copyright 2019 Centrality Investments Limited
// Licensed under the Apache license, Version 2.0 (the "license"); you may not use this file except in compliance with the license.
// You may obtain a copy of the license at http://www.apache.org/licences/LICENCE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the licence is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the licence for the specific language governing permissions and limitations under the licence.

import {KeyringPair} from '@plugnet/keyring/types';

export interface IWallet {
    lock(): Promise<void>;

    unlock(password?: string): Promise<void>;

    isLocked(): boolean;
}

export interface WalletOption {
    vault?: string;
    encryptor?: Encryptor;
    keyringTypes?: KeyringType<any>[];
}

export interface IKeyring<S> {
    serialize(): Promise<S>;

    deserialize(obj: S): Promise<this>;

    getPair(address: string): Promise<KeyringPair>;

    getPairs(): Promise<KeyringPair[]>;

    getAddresses(): Promise<string[]>;

    removePair(address: string): Promise<void>;

    addPair(): Promise<KeyringPair>;
}

export interface KeyringType<T> {
    name: string;
    new (data?: T): IKeyring<T>;
    generate(): Promise<IKeyring<T>>;
}

export interface Encryptor {
    encrypt(passphrase: string, json: object): Promise<string>;

    decrypt(passphrase: string, encoded: string): Promise<object>;
}
