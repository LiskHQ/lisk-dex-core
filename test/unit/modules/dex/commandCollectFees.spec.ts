/*
 * Copyright © 2020 Lisk Foundation
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

import { Transaction } from '@liskhq/lisk-chain';
import { codec } from '@liskhq/lisk-codec';
import { utils } from '@liskhq/lisk-cryptography';
import { TokenMethod, VerifyStatus } from 'lisk-framework';
import { EventQueue } from 'lisk-framework/dist-node/state_machine';
import {
	createMethodContext,
	MethodContext,
} from 'lisk-framework/dist-node/state_machine/method_context';
import { PrefixedStateReadWriter } from 'lisk-framework/dist-node/state_machine/prefixed_state_read_writer';
import {
	createBlockContext,
	createBlockHeaderWithDefaults,
	createTransactionContext,
} from 'lisk-framework/dist-node/testing';
import { loggerMock } from 'lisk-framework/dist-node/testing/mocks';
import { DexModule } from '../../../../src/app/modules';
import { CollectFeesCommand } from '../../../../src/app/modules/dex/commands/collectFees';
import { collectFeesSchema } from '../../../../src/app/modules/dex/schemas';
import {
	DexGlobalStore,
	PoolsStore,
	PositionsStore,
	PriceTicksStore,
} from '../../../../src/app/modules/dex/stores';
import { DexGlobalStoreData } from '../../../../src/app/modules/dex/stores/dexGlobalStore';
import { PoolsStoreData } from '../../../../src/app/modules/dex/stores/poolsStore';
import { PositionsStoreData } from '../../../../src/app/modules/dex/stores/positionsStore';
import {
	PriceTicksStoreData,
	tickToBytes,
} from '../../../../src/app/modules/dex/stores/priceTicksStore';
import { Address, PositionID } from '../../../../src/app/modules/dex/types';
import { getPoolIDFromPositionID } from '../../../../src/app/modules/dex/utils/auxiliaryFunctions';
import { tickToPrice } from '../../../../src/app/modules/dex/utils/math';
import { numberToQ96, q96ToBytes } from '../../../../src/app/modules/dex/utils/q96';
import { InMemoryPrefixedStateDB } from './inMemoryPrefixedStateDB';

describe('dex:command:collectFees', () => {
	describe('dex:command:collectFees', () => {
		let command: CollectFeesCommand;
		let stateStore: PrefixedStateReadWriter;
		let methodContext: MethodContext;

		const dexModule = new DexModule();
		const senderAddress: Address = Buffer.from('00000000000000000', 'hex');
		const positionId: PositionID = Buffer.from('00000001000000000101643130', 'hex');

		const transferMock = jest.fn();
		const unLockMock = jest.fn();
		const getAvailableBalance = jest.fn().mockReturnValue(BigInt(250));

		const tokenMethod = new TokenMethod(dexModule.stores, dexModule.events, dexModule.name);
		let poolsStore: PoolsStore;
		let priceTicksStore: PriceTicksStore;
		let dexGlobalStore: DexGlobalStore;
		let positionsStore: PositionsStore;

		stateStore = new PrefixedStateReadWriter(new InMemoryPrefixedStateDB());
		methodContext = createMethodContext({
			stateStore,
			eventQueue: new EventQueue(0),
		});

		const poolsStoreData: PoolsStoreData = {
			liquidity: BigInt(5),
			sqrtPrice: q96ToBytes(BigInt('327099227039063106')),
			feeGrowthGlobal0: q96ToBytes(numberToQ96(BigInt(10))),
			feeGrowthGlobal1: q96ToBytes(numberToQ96(BigInt(6))),
			tickSpacing: 1,
		};

		const priceTicksStoreDataTickLower: PriceTicksStoreData = {
			liquidityNet: BigInt(5),
			liquidityGross: BigInt(5),
			feeGrowthOutside0: q96ToBytes(numberToQ96(BigInt(8))),
			feeGrowthOutside1: q96ToBytes(numberToQ96(BigInt(5))),
		};

		const priceTicksStoreDataTickUpper: PriceTicksStoreData = {
			liquidityNet: BigInt(5),
			liquidityGross: BigInt(5),
			feeGrowthOutside0: q96ToBytes(numberToQ96(BigInt(4))),
			feeGrowthOutside1: q96ToBytes(numberToQ96(BigInt(3))),
		};

		const dexGlobalStoreData: DexGlobalStoreData = {
			positionCounter: BigInt(10),
			collectableLSKFees: BigInt(10),
		};
		const positionsStoreData: PositionsStoreData = {
			tickLower: -8,
			tickUpper: -5,
			liquidity: BigInt(15),
			feeGrowthInsideLast0: q96ToBytes(numberToQ96(BigInt(3))),
			feeGrowthInsideLast1: q96ToBytes(numberToQ96(BigInt(1))),
			ownerAddress: senderAddress,
		};

		beforeEach(async () => {
			command = new CollectFeesCommand(dexModule.stores, dexModule.events);

			poolsStore = dexModule.stores.get(PoolsStore);
			priceTicksStore = dexModule.stores.get(PriceTicksStore);
			dexGlobalStore = dexModule.stores.get(DexGlobalStore);
			positionsStore = dexModule.stores.get(PositionsStore);

			await dexGlobalStore.set(methodContext, positionId, dexGlobalStoreData);
			await dexGlobalStore.set(methodContext, Buffer.alloc(0), dexGlobalStoreData);
			await dexGlobalStore.set(methodContext, Buffer.from([]), dexGlobalStoreData);

			await poolsStore.setKey(
				methodContext,
				[senderAddress, getPoolIDFromPositionID(positionId)],
				poolsStoreData,
			);
			await poolsStore.set(methodContext, getPoolIDFromPositionID(positionId), poolsStoreData);
			await priceTicksStore.setKey(
				methodContext,
				[getPoolIDFromPositionID(positionId), tickToBytes(positionsStoreData.tickLower)],
				priceTicksStoreDataTickLower,
			);
			await priceTicksStore.setKey(
				methodContext,
				[getPoolIDFromPositionID(positionId), tickToBytes(positionsStoreData.tickUpper)],
				priceTicksStoreDataTickUpper,
			);
			await priceTicksStore.setKey(
				methodContext,
				[
					getPoolIDFromPositionID(positionId),
					q96ToBytes(tickToPrice(positionsStoreData.tickLower)),
				],
				priceTicksStoreDataTickLower,
			);
			await priceTicksStore.setKey(
				methodContext,
				[
					getPoolIDFromPositionID(positionId),
					q96ToBytes(tickToPrice(positionsStoreData.tickUpper)),
				],
				priceTicksStoreDataTickUpper,
			);

			await positionsStore.set(methodContext, positionId, positionsStoreData);
			await positionsStore.setKey(methodContext, [senderAddress, positionId], positionsStoreData);

			tokenMethod.transfer = transferMock;
			tokenMethod.unlock = unLockMock;
			tokenMethod.getAvailableBalance = getAvailableBalance.mockReturnValue(BigInt(250));

			command.init({
				tokenMethod,
			});
		});

		describe('verify', () => {
			it('should be successful when all the parameters are correct', async () => {
				const context = createTransactionContext({
					transaction: new Transaction({
						module: 'dex',
						command: 'collectFees',
						fee: BigInt(5000000),
						nonce: BigInt(0),
						senderPublicKey: senderAddress,
						params: codec.encode(collectFeesSchema, {
							positions: new Array(0),
						}),
						signatures: [utils.getRandomBytes(64)],
					}),
				});

				const result = await command.verify(context.createCommandVerifyContext(collectFeesSchema));

				expect(result.error?.message).not.toBeDefined();
				expect(result.status).toEqual(VerifyStatus.OK);
			});

			it('should fail when positions size is more than MAX_NUM_POSITIONS_FEE_COLLECTION', async () => {
				const context = createTransactionContext({
					transaction: new Transaction({
						module: 'dex',
						command: 'collectFees',
						fee: BigInt(5000000),
						nonce: BigInt(0),
						senderPublicKey: senderAddress,
						params: codec.encode(collectFeesSchema, {
							positions: new Array(24).fill({ positionID: Buffer.from('0000000100', 'hex') }),
						}),
						signatures: [utils.getRandomBytes(64)],
					}),
				});
				const result = await command.verify(context.createCommandVerifyContext(collectFeesSchema));
				expect(result.error?.message).toBe('Please enter the correct positions');
				expect(result.status).toEqual(VerifyStatus.FAIL);
			});
		});

		describe('execute', () => {
			const blockHeader = createBlockHeaderWithDefaults({ height: 101 });
			stateStore = new PrefixedStateReadWriter(new InMemoryPrefixedStateDB());
			const blockAfterExecuteContext = createBlockContext({
				header: blockHeader,
			}).getBlockAfterExecuteContext();
			methodContext = createMethodContext({
				stateStore,
				eventQueue: blockAfterExecuteContext.eventQueue,
			});
			it('should collect Fees ', async () => {
				await expect(
					command.execute({
						chainID: utils.getRandomBytes(32),
						params: {
							positions: [positionId],
						},
						logger: loggerMock,
						header: blockHeader,
						eventQueue: blockAfterExecuteContext.eventQueue,
						getStore: (moduleID: Buffer, prefix: Buffer) => stateStore.getStore(moduleID, prefix),
						getMethodContext: () => methodContext,
						assets: { getAsset: jest.fn() },
						currentValidators: [],
						impliesMaxPrevote: false,
						maxHeightCertified: Number(10),
						certificateThreshold: BigInt(2),
						transaction: new Transaction({
							module: 'dex',
							command: 'collectFees',
							fee: BigInt(5000000),
							nonce: BigInt(0),
							senderPublicKey: senderAddress,
							params: codec.encode(collectFeesSchema, {
								positions: [positionId],
							}),
							signatures: [utils.getRandomBytes(64)],
						}),
					}),
				).resolves.toBeUndefined();
				expect(tokenMethod.transfer).toHaveBeenCalledTimes(1);
				const events = blockAfterExecuteContext.eventQueue.getEvents();
				const validatorFeesIncentivesCollectedEvent = events.filter(
					e => e.toObject().name === 'feesIncentivesCollectedEvent',
				);
				expect(validatorFeesIncentivesCollectedEvent).toHaveLength(1);
			});
		});

		describe('stress test for checking the event emission and the time taken', () => {
			(() => {
				const testarray = Array.from({ length: 20000 });
				testarray.forEach(() => {
					return stress();
				});
			})();

			function stress() {
				const blockHeader = createBlockHeaderWithDefaults({ height: 101 });
				const blockAfterExecuteContext = createBlockContext({
					header: blockHeader,
				}).getBlockAfterExecuteContext();

				let stressTestMethodContext = createMethodContext({
					stateStore,
					eventQueue: blockAfterExecuteContext.eventQueue,
				});
				it('should collect fees stress tests', async () => {
					await expect(
						command.execute({
							chainID: utils.getRandomBytes(32),
							params: {
								positions: [positionId],
							},
							logger: loggerMock,
							header: blockHeader,
							eventQueue: blockAfterExecuteContext.eventQueue,
							getStore: (moduleID: Buffer, prefix: Buffer) => stateStore.getStore(moduleID, prefix),
							getMethodContext: () => stressTestMethodContext,
							assets: { getAsset: jest.fn() },
							currentValidators: [],
							impliesMaxPrevote: false,
							maxHeightCertified: Number(10),
							certificateThreshold: BigInt(2),
							transaction: new Transaction({
								module: 'dex',
								command: 'collectFees',
								fee: BigInt(5000000),
								nonce: BigInt(0),
								senderPublicKey: senderAddress,
								params: codec.encode(collectFeesSchema, {
									positions: [positionId],
								}),
								signatures: [utils.getRandomBytes(64)],
							}),
						}),
					).resolves.toBeUndefined();
					expect(tokenMethod.transfer).toBeCalledTimes(1);
					const events = blockAfterExecuteContext.eventQueue.getEvents();
					const validatorFeesIncentivesCollectedEvent = events.filter(
						e => e.toObject().name === 'feesIncentivesCollectedEvent',
					);
					expect(validatorFeesIncentivesCollectedEvent).toHaveLength(1);
				});
			}
		});
	});
});
