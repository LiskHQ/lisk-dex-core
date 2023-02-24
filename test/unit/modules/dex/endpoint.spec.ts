/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */

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
import { TokenMethod } from 'lisk-sdk';
import {
	createMethodContext,
	EventQueue,
	MethodContext,
} from 'lisk-framework/dist-node/state_machine';

import { DexModule } from '../../../../src/app/modules';
import {
	DexGlobalStore,
	PoolsStore,
	PositionsStore,
	PriceTicksStore,
	SettingsStore,
} from '../../../../src/app/modules/dex/stores';
import { Address, PoolID, PositionID, TokenID } from '../../../../src/app/modules/dex/types';
import { NUM_BYTES_POOL_ID } from '../../../../src/app/modules/dex/constants';

// import { numberToQ96, q96ToBytes } from '../../../../src/app/modules/dex/utils/q96';
import { numberToQ96, q96ToBytes, bytesToQ96 } from '../../../../src/app/modules/dex/utils/q96';
import { InMemoryPrefixedStateDB } from './inMemoryPrefixedState';
<<<<<<< HEAD

// import { tickToPrice } from '../../../../src/app/modules/dex/utils/math';
import { tickToPrice, priceToTick } from '../../../../src/app/modules/dex/utils/math';
=======
import { tickToPrice } from '../../../../src/app/modules/dex/utils/math';
>>>>>>> feature/endpoints
import {
	PriceTicksStoreData,
	tickToBytes,
} from '../../../../src/app/modules/dex/stores/priceTicksStore';
import {
	DexGlobalStoreData,
	// PoolCreationSettings,
} from '../../../../src/app/modules/dex/stores/dexGlobalStore';
import { PositionsStoreData } from '../../../../src/app/modules/dex/stores/positionsStore';
import { SettingsStoreData } from '../../../../src/app/modules/dex/stores/settingsStore';
import { PoolsStoreData } from '../../../../src/app/modules/dex/stores/poolsStore';
import {
	getPoolIDFromPositionID,
	getToken0Id,
	getToken1Id,
} from '../../../../src/app/modules/dex/utils/auxiliaryFunctions';
import { DexEndpoint } from '../../../../src/app/modules/dex/endpoint';
import { createTransientModuleEndpointContext } from '../../../context/createContext';
import { PrefixedStateReadWriter } from '../../../stateMachine/prefixedStateReadWriter';

describe('dex: offChainEndpointFunctions', () => {
	const poolId: PoolID = Buffer.from('0000000000000000000001000000000000c8', 'hex');
	const senderAddress: Address = Buffer.from('0000000000000000', 'hex');
	const positionId: PositionID = Buffer.from('00000001000000000101643130', 'hex');
	const dexModule = new DexModule();
	const feeTier = 23343408;
	const poolIdLSK = Buffer.from('0000000100000000', 'hex');
	const token0Id: TokenID = Buffer.from('0000000000000000', 'hex');
	const token1Id: TokenID = Buffer.from('0000010000000000', 'hex');

	const INVALID_ADDRESS = '1234';
	const tokenMethod = new TokenMethod(dexModule.stores, dexModule.events, dexModule.name);
<<<<<<< HEAD

	const inMemoryPrefixedStateDB = new InMemoryPrefixedStateDB();
	const stateStore: PrefixedStateReadWriter = new PrefixedStateReadWriter(inMemoryPrefixedStateDB);
=======
	// const stateStore: PrefixedStateReadWriter = new PrefixedStateReadWriter(inMemoryPrefixedStateDB);

	const stateStore: PrefixedStateReadWriter = new PrefixedStateReadWriter(
		new InMemoryPrefixedStateDB(),
	);
>>>>>>> feature/endpoints

	let moduleEndpointContext = createTransientModuleEndpointContext({
		stateStore,
		params: { address: INVALID_ADDRESS },
	});

	const methodContext: MethodContext = createMethodContext({
		contextStore: new Map(),
		stateStore,
		eventQueue: new EventQueue(0),
	});

	// const poolCreationSettingsData: PoolCreationSettings = {
	// 	feeTier: 100,
	// 	tickSpacing: 1,
	// };

	let poolsStore: PoolsStore;
	let priceTicksStore: PriceTicksStore;
	let dexGlobalStore: DexGlobalStore;
	let positionsStore: PositionsStore;
	let settingsStore: SettingsStore;
	let endpoint: DexEndpoint;

	const transferMock = jest.fn();
	const lockMock = jest.fn();
	const unlockMock = jest.fn();
	const getAvailableBalanceMock = jest.fn().mockReturnValue(BigInt(250));
	const lockedAmountMock = jest.fn().mockReturnValue(BigInt(5));

	const poolsStoreData: PoolsStoreData = {
		liquidity: BigInt(5000000),
		sqrtPrice: q96ToBytes(BigInt(tickToPrice(100))),
		incentivesPerLiquidityAccumulator: q96ToBytes(numberToQ96(BigInt(10))),
		heightIncentivesUpdate: 5,
		feeGrowthGlobal0: q96ToBytes(numberToQ96(BigInt(10))),
		feeGrowthGlobal1: q96ToBytes(numberToQ96(BigInt(10))),
		tickSpacing: 1,
	};

	const priceTicksStoreDataTickLower: PriceTicksStoreData = {
		liquidityNet: BigInt(5),
		liquidityGross: BigInt(5),
		feeGrowthOutside0: q96ToBytes(numberToQ96(BigInt(0))),
		feeGrowthOutside1: q96ToBytes(numberToQ96(BigInt(0))),
		incentivesPerLiquidityOutside: q96ToBytes(numberToQ96(BigInt(2))),
	};

	const priceTicksStoreDataTickUpper: PriceTicksStoreData = {
		liquidityNet: BigInt(5),
		liquidityGross: BigInt(5),
		feeGrowthOutside0: q96ToBytes(numberToQ96(BigInt(5))),
		feeGrowthOutside1: q96ToBytes(numberToQ96(BigInt(5))),
		incentivesPerLiquidityOutside: q96ToBytes(numberToQ96(BigInt(3))),
	};

	const dexGlobalStoreData: DexGlobalStoreData = {
		positionCounter: BigInt(15),
		collectableLSKFees: BigInt(10),
		poolCreationSettings: [{ feeTier: 100, tickSpacing: 1 }],
		incentivizedPools: [{ poolId: poolId, multiplier: 10 }],
		totalIncentivesMultiplier: 1,
	};

	const positionsStoreData: PositionsStoreData = {
		tickLower: -10,
		tickUpper: 10,
		liquidity: BigInt(1000),
		feeGrowthInsideLast0: q96ToBytes(numberToQ96(BigInt(0))),
		feeGrowthInsideLast1: q96ToBytes(numberToQ96(BigInt(0))),
		ownerAddress: senderAddress,
	};

	const settingStoreData: SettingsStoreData = {
		protocolFeeAddress: Buffer.from('0000000000000000', 'hex'),
		protocolFeePart: 10,
		validatorsLSKRewardsPart: 5,
		poolCreationSettings: {
			feeTier: 100,
			tickSpacing: 1,
		},
	};

	describe('constructor', () => {
		beforeEach(async () => {
			poolsStore = dexModule.stores.get(PoolsStore);
			priceTicksStore = dexModule.stores.get(PriceTicksStore);
			dexGlobalStore = dexModule.stores.get(DexGlobalStore);
			positionsStore = dexModule.stores.get(PositionsStore);
			settingsStore = dexModule.stores.get(SettingsStore);
			endpoint = new DexEndpoint(dexModule.stores, dexModule.offchainStores);

			await dexGlobalStore.set(methodContext, Buffer.from([]), dexGlobalStoreData);

			await settingsStore.set(methodContext, Buffer.from([]), settingStoreData);

			await poolsStore.setKey(
				methodContext,
				[senderAddress, getPoolIDFromPositionID(positionId)],
				poolsStoreData,
			);

			await poolsStore.setKey(methodContext, [poolId], poolsStoreData);
			await poolsStore.setKey(methodContext, [poolIdLSK], poolsStoreData);
			await poolsStore.set(methodContext, poolIdLSK, poolsStoreData);
			await poolsStore.set(methodContext, getPoolIDFromPositionID(positionId), poolsStoreData);
			await priceTicksStore.setKey(
				methodContext,
				[getPoolIDFromPositionID(positionId), tickToBytes(positionsStoreData.tickLower)],
				priceTicksStoreDataTickLower,
			);

			await priceTicksStore.setKey(
				methodContext,
				[Buffer.concat([getPoolIDFromPositionID(positionId), tickToBytes(5)])],
				priceTicksStoreDataTickLower,
			);

			await priceTicksStore.setKey(
				methodContext,
				[getPoolIDFromPositionID(positionId), tickToBytes(positionsStoreData.tickUpper)],
				priceTicksStoreDataTickUpper,
			);
			await priceTicksStore.setKey(
				methodContext,
				[poolId, tickToBytes(100)],
				priceTicksStoreDataTickUpper,
			);
			await priceTicksStore.setKey(
				methodContext,
				[getPoolIDFromPositionID(positionId), tickToBytes(positionsStoreData.tickUpper)],
				priceTicksStoreDataTickUpper,
			);
			await priceTicksStore.setKey(
				methodContext,
				[getPoolIDFromPositionID(positionId), tickToBytes(positionsStoreData.tickUpper)],
				priceTicksStoreDataTickUpper,
			);
			await priceTicksStore.setKey(
				methodContext,
				[getPoolIDFromPositionID(positionId), tickToBytes(positionsStoreData.tickUpper)],
				priceTicksStoreDataTickUpper,
			);

			await positionsStore.set(methodContext, positionId, positionsStoreData);
			await positionsStore.setKey(methodContext, [senderAddress, positionId], positionsStoreData);

			tokenMethod.transfer = transferMock;
			tokenMethod.lock = lockMock;
			tokenMethod.unlock = unlockMock;
			tokenMethod.getAvailableBalance = getAvailableBalanceMock.mockReturnValue(BigInt(250));
			tokenMethod.getLockedAmount = lockedAmountMock.mockReturnValue(BigInt(5));
		});

		it('getAllPoolIDs', async () => {
			await endpoint.getAllPoolIDs(moduleEndpointContext).then(res => {
				expect(res[0]).toStrictEqual(
					Buffer.from('000000000000000000000001000000000101643130', 'hex'),
				);
			});
		});

		it('getToken1Amount', async () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: { poolID: poolId },
			});
			await endpoint.getToken1Amount(tokenMethod, moduleEndpointContext).then(res => {
				expect(res).toBe(BigInt(5));
			});
		});

		it('getToken0Amount', async () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: { poolID: poolId },
			});
			await endpoint.getToken0Amount(tokenMethod, moduleEndpointContext).then(res => {
				expect(res).toBe(BigInt(5));
			});
		});

		it('getFeeTier', () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: { poolID: getPoolIDFromPositionID(positionId), positionIDsList: [positionId] },
			});
			expect(endpoint.getFeeTier(moduleEndpointContext)).toEqual(feeTier);
		});

		it('getPoolIDFromTickID', () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: { tickID: Buffer.from('000000010000000001016431308000000a', 'hex') },
			});
			expect(endpoint.getPoolIDFromTickID(moduleEndpointContext)).toStrictEqual(
				Buffer.from('00000001000000000101643130800000', 'hex'),
			);
		});

		it('getPositionIndex', () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: { positionID: positionId },
			});
			expect(endpoint.getPositionIndex(moduleEndpointContext)).toBe(1);
		});

		it('getAllTokenIDs', async () => {
			await endpoint.getAllTokenIDs(moduleEndpointContext).then(res => {
				expect(res.size).toBeGreaterThan(0);
			});
		});

		it('getAllPositionIDsInPool', () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: { poolID: getPoolIDFromPositionID(positionId), positionIDsList: [positionId] },
			});
			const positionIDs = endpoint.getAllPositionIDsInPool(moduleEndpointContext);
			expect(positionIDs.indexOf(positionId)).not.toBe(-1);
		});

		it('getPool', async () => {
<<<<<<< HEAD
			await endpoint
				.getPool(moduleEndpointContext, getPoolIDFromPositionID(positionId))
				.then(res => {
					expect(res).not.toBeNull();
					expect(res.liquidity).toBe(BigInt(5000000));
				});
		});

		it('getCurrentSqrtPrice', async () => {
			expect(
				(
					await endpoint.getCurrentSqrtPrice(
						moduleEndpointContext,
						getPoolIDFromPositionID(positionId),
						false,
					)
				).toString(),
			).toBe('78833030112140176575862854576');
=======
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: { poolID: getPoolIDFromPositionID(positionId) },
			});
			await endpoint.getPool(moduleEndpointContext).then(res => {
				expect(res).not.toBeNull();
				expect(res.liquidity).toBe(BigInt(5));
			});
		});

		it('getCurrentSqrtPrice', async () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: { poolID: getPoolIDFromPositionID(positionId), priceDirection: false },
			});

			expect((await endpoint.getCurrentSqrtPrice(moduleEndpointContext)).toString()).toBe(
				'79208358939348018173455069823',
			);
>>>>>>> feature/endpoints
		});

		it('getDexGlobalData', async () => {
			await endpoint.getDexGlobalData(moduleEndpointContext).then(res => {
				expect(res).not.toBeNull();
				expect(res.positionCounter).toBe(BigInt(15));
				expect(res.collectableLSKFees).toBe(BigInt(10));
			});
		});

<<<<<<< HEAD
		it('getPosition', async () => {
			const positionIdsList = [positionId];
			const newPositionId: PositionID = Buffer.from('00000001000000000101643130', 'hex');
			await positionsStore.set(methodContext, newPositionId, positionsStoreData);
			await positionsStore.setKey(methodContext, [newPositionId], positionsStoreData);
			await endpoint
				.getPosition(moduleEndpointContext, newPositionId, positionIdsList)
				.then(res => {
					expect(res).not.toBeNull();
				});
		});

		it('getTickWithTickId', async () => {
			const tickWithTickID = await endpoint.getTickWithTickId(moduleEndpointContext, [
				getPoolIDFromPositionID(positionId),
				tickToBytes(positionsStoreData.tickLower),
			]);
			expect(tickWithTickID).not.toBeNull();
			expect(tickWithTickID.liquidityNet).toBe(BigInt(5));
		});

		it('getTickWithPoolIdAndTickValue', async () => {
			const tickValue = 5;
			priceTicksStore.setKey(
				methodContext,
				[getPoolIDFromPositionID(positionId), tickToBytes(tickValue)],
				priceTicksStoreDataTickUpper,
			);

			const tickWithPoolIdAndTickValue = await endpoint.getTickWithPoolIdAndTickValue(
				moduleEndpointContext,
				getPoolIDFromPositionID(positionId),
				tickValue,
			);
			expect(tickWithPoolIdAndTickValue).not.toBeNull();
			expect(tickWithPoolIdAndTickValue.liquidityNet).toBe(BigInt(5));
		});

		it('getLSKPrice', async () => {
			const result = Buffer.alloc(4);
			const tempFeeTier = q96ToBytes(
				BigInt(result.writeUInt32BE(dexGlobalStoreData.poolCreationSettings[0].feeTier, 0)),
			);
			await poolsStore.setKey(
				methodContext,
				[getPoolIDFromPositionID(positionId), positionId, tempFeeTier],
				poolsStoreData,
			);
			await poolsStore.setKey(methodContext, [poolIdLSK, poolIdLSK, tempFeeTier], poolsStoreData);
			await poolsStore.setKey(methodContext, [poolIdLSK, positionId, tempFeeTier], poolsStoreData);

			const res = await endpoint.getLSKPrice(
				tokenMethod,
				moduleEndpointContext,
				getPoolIDFromPositionID(positionId),
			);
			expect(res).toBe(BigInt(1));
		});

		it('getTVL', async () => {
			const res = await endpoint.getTVL(
				tokenMethod,
				moduleEndpointContext,
				getPoolIDFromPositionID(positionId),
			);
			expect(res).toBe(BigInt(5));
		});

=======
>>>>>>> feature/endpoints
		it('getAllTicks', async () => {
			await endpoint.getAllTicks(moduleEndpointContext).then(res => {
				expect(res).not.toBeNull();
			});
		});

		it('getPosition', async () => {
			const positionIdsList = [positionId];
			const newPositionId: PositionID = Buffer.from('00000001000000000101643130', 'hex');
			await positionsStore.set(methodContext, newPositionId, positionsStoreData);
			await positionsStore.setKey(methodContext, [newPositionId], positionsStoreData);
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: { positionID: newPositionId, positionIDsList: positionIdsList },
			});
			await endpoint.getPosition(moduleEndpointContext).then(res => {
				expect(res).not.toBeNull();
			});
		});

		it('getTickWithTickId', async () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: {
					tickIDs: Buffer.concat([
						getPoolIDFromPositionID(positionId),
						tickToBytes(positionsStoreData.tickLower),
					]),
				},
			});
			const tickWithTickID = await endpoint.getTickWithTickId(moduleEndpointContext);
			expect(tickWithTickID).not.toBeNull();
			expect(tickWithTickID.liquidityNet).toBe(BigInt(5));
		});

		it('getTickWithPoolIdAndTickValue', async () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: {
					poolID: getPoolIDFromPositionID(positionId),
					tickValue: 5,
				},
			});
			const tickWithPoolIdAndTickValue = await endpoint.getTickWithPoolIdAndTickValue(
				moduleEndpointContext,
			);
			expect(tickWithPoolIdAndTickValue).not.toBeNull();
			expect(tickWithPoolIdAndTickValue.liquidityNet).toBe(BigInt(5));
		});

		it('getLSKPrice', async () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: {
					tokenID: getPoolIDFromPositionID(positionId),
					poolID: getPoolIDFromPositionID(positionId),
				},
			});
			const result = Buffer.alloc(4);
			const tempFeTier = q96ToBytes(
				BigInt(result.writeUInt32BE(dexGlobalStoreData.poolCreationSettings.feeTier, 0)),
			);
			await poolsStore.setKey(
				methodContext,
				[getPoolIDFromPositionID(positionId), positionId, tempFeTier],
				poolsStoreData,
			);
			await poolsStore.setKey(methodContext, [poolIdLSK, poolIdLSK, tempFeTier], poolsStoreData);
			await poolsStore.setKey(methodContext, [poolIdLSK, positionId, tempFeTier], poolsStoreData);

			const res = await endpoint.getLSKPrice(tokenMethod, moduleEndpointContext);
			expect(res).toBe(BigInt(1));
		});

		it('getTVL', async () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: {
					poolID: getPoolIDFromPositionID(positionId),
					token0ID: getToken0Id(getPoolIDFromPositionID(positionId)),
					token1ID: getToken1Id(getPoolIDFromPositionID(positionId)),
				},
			});
			const res = await endpoint.getTVL(tokenMethod, moduleEndpointContext);
			expect(res).toBe(BigInt(5));
		});

		it('getAllTickIDsInPool', async () => {
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: { tickID: Buffer.from('000000010000000001016431308000000a', 'hex') },
			});
			const tempPoolID = endpoint.getPoolIDFromTickID(moduleEndpointContext);
			moduleEndpointContext = createTransientModuleEndpointContext({
				stateStore,
				params: {
					tickID: Buffer.from('000000010000000001016431308000000a', 'hex'),
					poolID: tempPoolID,
				},
			});
			const allTickIDsInPool = await endpoint.getAllTickIDsInPool(moduleEndpointContext);
			let ifKeyExists = false;
			allTickIDsInPool.forEach(tickIdInPool => {
				if (tickIdInPool.equals(Buffer.from('000000010000000001016431308000000a', 'hex'))) {
					ifKeyExists = true;
				}
			});
			expect(ifKeyExists).toBe(true);
		});

<<<<<<< HEAD
		it('dryRunSwapExactIn', async () => {
			const currentTick = priceToTick(bytesToQ96(poolsStoreData.sqrtPrice));
			const currentTickID = q96ToBytes(BigInt(currentTick));
			await poolsStore.setKey(
				methodContext,
				[currentTickID.slice(0, NUM_BYTES_POOL_ID)],
				poolsStoreData,
			);

			await priceTicksStore.setKey(methodContext, [currentTickID], priceTicksStoreDataTickUpper);

			await priceTicksStore.setKey(
				methodContext,
				[Buffer.from('000000000000000000000000000000000000000000000006', 'hex')],
				priceTicksStoreDataTickUpper,
			);

			const amountIn = BigInt(50);
			const minAmountOut = BigInt(10);
			moduleEndpointContext.params = {
				tokenIdIn: token0Id,
				amountIn,
				tokenIdOut: token1Id,
				minAmountOut,
				swapRoute: [poolId],
			};
			const result = await endpoint.dryRunSwapExactIn(moduleEndpointContext);

			expect(result[2]).toEqual(BigInt(0));
			expect(result[3]).toEqual(BigInt(0));
=======
		it('getCollectableFeesAndIncentives', async () => {
			moduleEndpointContext.params = {
				positionID: positionId,
			};
			const [
				collectableFee0,
				collectableFee1,
				collectableIncentives,
			] = await endpoint.getCollectableFeesAndIncentives(moduleEndpointContext, tokenMethod);

			expect(collectableFee0).toEqual(BigInt(0));
			expect(collectableFee1).toEqual(BigInt(0));
			expect(collectableIncentives).toEqual(BigInt(0));
>>>>>>> feature/endpoints
		});
	});
});
