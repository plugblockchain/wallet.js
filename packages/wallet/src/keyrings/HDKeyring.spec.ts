// Copyright 2019 Centrality Investments Limited
// Licensed under the Apache license, Version 2.0 (the "license"); you may not use this file except in compliance with the license.
// You may obtain a copy of the license at http://www.apache.org/licences/LICENCE-2.0.
// Unless required by applicable law or agreed to in writing, software distributed under the licence is distributed on an "AS IS" BASIS,  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the licence for the specific language governing permissions and limitations under the licence.

import {KeyringPair} from '@plugnet/keyring/types';
import {waitReady as cryptoWaitReady} from '@plugnet/wasm-crypto';
import {HDKeyring} from './HDKeyring';
import {IKeyring} from '../types';

describe('HDKeyring', () => {
    beforeAll(async () => {
        await cryptoWaitReady();
    });

    describe('happy path', () => {
        const times = 10;
        let keyring: IKeyring<any>;
        let keyPairs: KeyringPair[];
        beforeEach(async () => {
            keyring = await HDKeyring.generate();
            keyPairs = [];
            for (let i = 0; i < times; i++) {
                const keyPair = await keyring.addPair();
                keyPairs.push(keyPair);
            }
            expect(keyPairs).toHaveLength(times);
        });

        it('removePair(address) not support', async () => {
            const kp = keyPairs[0];
            await expect(keyring.removePair(kp.address())).rejects.toThrow("doesn't support removePair");
        });
    });

    it('throw error if not initialized', async () => {
        const keyring = new HDKeyring(undefined);
        await expect(keyring.addPair()).rejects.toThrow('hd wallet not initialized');
    });

    it('recover from mnemonic', async () => {
        const keyring = new HDKeyring({
            mnemonic: 'urban tuna work fiber excuse gown adult grab winner rigid lamp appear',
        });
        await expect(keyring.getAddresses()).resolves.toHaveLength(0);
        const kp = await keyring.addPair();
        expect(kp.address()).toBe('5CLYG6kwn9cUnDvSnKRorrZDKje6P3Vy724QxujPoue13rSy');
    });
});
