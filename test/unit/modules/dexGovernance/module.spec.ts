/*
 * Copyright © 2022 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

import {
	BaseModule,
	PoSModule,
	TokenModule,
	GenesisBlockExecuteContext,
	testing,
	cryptography
} from 'lisk-sdk';

import { IndexStore, ProposalsStore } from '../../../../src/app/modules/dexGovernance/stores';

import { DexGovernanceModule } from '../../../../src/app/modules/dexGovernance/module';
import { DexGovernanceEndpoint } from '../../../../src/app/modules/dexGovernance/endpoint';
import { GenesisBlockContext } from 'lisk-framework/dist-node/state_machine/';
import { PrefixedStateReadWriter } from 'lisk-framework/dist-node/state_machine/prefixed_state_read_writer';
import { EventQueue } from 'lisk-framework/dist-node/state_machine';
import { loggerMock } from 'lisk-framework/dist-node/testing/mocks';

import { InMemoryPrefixedStateDB } from './inMemoryPrefixedState';
import { MODULE_NAME_DEX_GOVERNANCE } from '../../../../src/app/modules/dexGovernance/constants';

import { DexGovernanceMethod } from '../../../../src/app/modules/dexGovernance/method';
import { IndexStoreData } from '../../../../src/app/modules/dexGovernance/stores/indexStore';
import { Proposal } from '../../../../src/app/modules/dexGovernance/types';
import { PoolID } from '../../../../src/app/modules/dex/types';

const { createBlockHeaderWithDefaults } = testing;
const { utils } = cryptography;

describe('DexGovernanceModule', () => {
	const poolId: PoolID = Buffer.from('0000000000000000000001000000000000c8', 'hex');
	let dexGovernanceModule: DexGovernanceModule;
	let tokenModule: TokenModule;
	let posModule: PoSModule;
	let genesisBlockContext: GenesisBlockContext;

	const inMemoryPrefixedStateDB = new InMemoryPrefixedStateDB();
	const stateStore: PrefixedStateReadWriter = new PrefixedStateReadWriter(inMemoryPrefixedStateDB);
	const blockHeader = createBlockHeaderWithDefaults({ height: 101 });

	let proposalsStore: ProposalsStore;

	const proposalsStoreData: Proposal = {
		creationHeight: 100,
		votesYes: BigInt(10),
		votesNo: BigInt(10),
		votesPass: BigInt(10),
		type: 1,
		content: {
			text: Buffer.from('proposalsStoreData', 'hex'),
			poolID: poolId,
			multiplier: 3,
			metadata: {
				title: Buffer.from('proposals metadata', 'hex'),
				author: Buffer.from('Daniel Salo', 'hex'),
				summary: Buffer.from('proposal', 'hex'),
				discussionsTo: Buffer.from('Lightcurve', 'hex')
			}
		},
		status: 1
	}

	const getAsset = jest.fn();

	genesisBlockContext = new GenesisBlockContext({
		logger: loggerMock,
		stateStore,
		header: blockHeader,
		assets: { getAsset: getAsset },
		eventQueue: new EventQueue(0),
		chainID: utils.getRandomBytes(32)
	});

	const genesisBlockExecuteContext: GenesisBlockExecuteContext = genesisBlockContext.createInitGenesisStateContext();
	genesisBlockExecuteContext.assets.getAsset = getAsset;

	beforeEach(async () => {
		dexGovernanceModule = new DexGovernanceModule();
		tokenModule = new TokenModule();
		posModule = new PoSModule();
		proposalsStore = dexGovernanceModule.stores.get(ProposalsStore);

		await proposalsStore.set(genesisBlockExecuteContext, Buffer.alloc(0), proposalsStoreData);

		tokenModule.method.mint = jest.fn().mockImplementation(async () => Promise.resolve());
		tokenModule.method.lock = jest.fn().mockImplementation(async () => Promise.resolve());
		tokenModule.method.unlock = jest.fn().mockImplementation(async () => Promise.resolve());
		tokenModule.method.transfer = jest.fn().mockImplementation(async () => Promise.resolve());
		tokenModule.method.getLockedAmount = jest.fn().mockResolvedValue(BigInt(1000));

		dexGovernanceModule.addDependencies(tokenModule.method, posModule.method);
	});

	it('should inherit from BaseModule', () => {
		expect(DexGovernanceModule.prototype).toBeInstanceOf(BaseModule);
	});

	describe('constructor', () => {
		it('should have valid name', () => {
			expect(dexGovernanceModule.name).toBe(MODULE_NAME_DEX_GOVERNANCE);
		});

		it('should expose endpoint', () => {
			expect(dexGovernanceModule).toHaveProperty('endpoint');
			expect(dexGovernanceModule.endpoint).toBeInstanceOf(DexGovernanceEndpoint);
		});

		it('should expose method', () => {
			expect(dexGovernanceModule).toHaveProperty('method');
			expect(dexGovernanceModule.method).toBeInstanceOf(DexGovernanceMethod);
		});

		it('initGenesisState', async () => {
			await dexGovernanceModule.initGenesisState(genesisBlockExecuteContext);
			const indexStore = dexGovernanceModule.stores.get(IndexStore);
			const indexStoreData: IndexStoreData = await indexStore.get(genesisBlockExecuteContext, Buffer.alloc(0));
			expect(indexStoreData.newestIndex).toEqual(0);
			expect(indexStoreData.nextOutcomeCheckIndex).toEqual(0);
			expect(indexStoreData.nextQuorumCheckIndex).toEqual(0);
		});

		it('verifyGenesisBlock', async () => {
			getAsset.mockImplementation(m => Buffer.from(m));
			const proposalData: Proposal = {
				creationHeight: 100,
				votesYes: BigInt(10),
				votesNo: BigInt(10),
				votesPass: BigInt(10),
				type: 1,
				content: {
					text: Buffer.from('proposalsStoreData', 'hex'),
					poolID: poolId,
					multiplier: 3,
					metadata: {
						title: Buffer.from('proposals metadata', 'hex'),
						author: Buffer.from('Daniel Salo', 'hex'),
						summary: Buffer.from('proposal', 'hex'),
						discussionsTo: Buffer.from('Lightcurve', 'hex')
					}
				},
				status: 4
			}
			const proposalStore = dexGovernanceModule.stores.get(ProposalsStore);
			await proposalStore.set(genesisBlockExecuteContext, Buffer.alloc(0), proposalData);
			// const result = genesisBlockExecuteContext.assets.getAsset("dexGovernance");
			expect(() => dexGovernanceModule.verifyGenesisBlock(genesisBlockExecuteContext)).toThrow(Error("Invalid proposal status"));
		});
	});
});
