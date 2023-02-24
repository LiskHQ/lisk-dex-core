/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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

import { MIN_SINT32 } from '@liskhq/lisk-validator';
import { NamedRegistry } from 'lisk-framework/dist-node/modules/named_registry';
import { MethodContext, TokenMethod } from 'lisk-sdk';
import { DexGlobalStore, PoolsStore } from '../stores';
import { PoolID, TokenID } from '../types';
import {
	getAllPoolIDs,
	getDexGlobalData,
	getPool,
	getToken0Amount,
	getToken1Amount,
} from './auxiliaryFunctions';
import {
	addQ96,
	bytesToQ96,
	divQ96,
	mulDivQ96,
	mulQ96,
	numberToQ96,
	q96ToBytes,
	roundDownQ96,
} from './q96';

export const computeNewIncentivesPerLiquidity = async (
	methodContext: MethodContext,
	stores: NamedRegistry,
	poolID: PoolID,
	currentHeight: number,
): Promise<bigint> => {
	const dexGlobalStore = stores.get(DexGlobalStore);
	const dexGlobalStoreData = await dexGlobalStore.get(methodContext, Buffer.from([]));
	let incentivizedPools: { poolId: Buffer; multiplier: number } | undefined;
	let pooldIDFlag = false;

	dexGlobalStoreData.incentivizedPools.forEach(incentivizedPool => {
		if (incentivizedPool.poolId.equals(poolID)) {
			incentivizedPools = incentivizedPool;
		}
	});

	if (incentivizedPools == null) {
		throw new Error('Invalid arguments');
	}

	const pool = await getPool(methodContext, stores, poolID);
	const allPoolIds = await getAllPoolIDs(methodContext, stores.get(PoolsStore));

	for (const poolIDItem of allPoolIds) {
		if (poolIDItem.equals(poolID)) {
			pooldIDFlag = true;
		}
	}

	if (!pooldIDFlag || pool.heightIncentivesUpdate >= currentHeight) {
		throw new Error('Invalid arguments');
	}

	const poolMultiplier = BigInt(incentivizedPools.multiplier);
	const totalIncentives = BigInt(0);

	const incentives = mulDivQ96(
		numberToQ96(totalIncentives),
		numberToQ96(poolMultiplier),
		numberToQ96(BigInt(dexGlobalStoreData.totalIncentivesMultiplier)),
	);
	const incentivesPerLiquidity = divQ96(incentives, numberToQ96(pool.liquidity));
	const currentIncentivesPerLiquidity = bytesToQ96(pool.incentivesPerLiquidityAccumulator);
	return addQ96(incentivesPerLiquidity, currentIncentivesPerLiquidity);
};

export const updatePoolIncentives = async (
	methodContext: MethodContext,
	stores: NamedRegistry,
	poolID: PoolID,
	currentHeight: number,
) => {
	const dexGlobalStore = stores.get(DexGlobalStore);
	const dexGlobalStoreData = await dexGlobalStore.get(methodContext, Buffer.from([]));
	let incentivizedPools: { poolId: Buffer; multiplier: number } | undefined;

	dexGlobalStoreData.incentivizedPools.forEach(incentivizedPool => {
		if (incentivizedPool.poolId.equals(poolID)) {
			incentivizedPools = incentivizedPool;
		}
	});

	if (incentivizedPools == null) {
		return;
	}

	const pool = await getPool(methodContext, stores, poolID);
	const allPoolIds = await getAllPoolIDs(methodContext, stores.get(PoolsStore));
	if (!allPoolIds.includes(poolID) || pool.heightIncentivesUpdate >= currentHeight) {
		return;
	}

	const newIncentivesPerLiquidity = await computeNewIncentivesPerLiquidity(
		methodContext,
		stores,
		poolID,
		currentHeight,
	);
	pool.incentivesPerLiquidityAccumulator = q96ToBytes(newIncentivesPerLiquidity);
	pool.heightIncentivesUpdate = currentHeight.valueOf();
};

export const updateIncentivizedPools = async (
	methodContext: MethodContext,
	stores: NamedRegistry,
	poolId: PoolID,
	multiplier: number,
	currentHeight: number,
) => {
	const dexGlobalStoreData = await getDexGlobalData(methodContext, stores);

	for (const incentivizedPool of dexGlobalStoreData.incentivizedPools) {
		await updatePoolIncentives(methodContext, stores, incentivizedPool.poolId, currentHeight);
	}
	dexGlobalStoreData.incentivizedPools.forEach((incentivizedPools, index) => {
		if (incentivizedPools.poolId.equals(poolId)) {
			dexGlobalStoreData.totalIncentivesMultiplier -= incentivizedPools.multiplier;
			dexGlobalStoreData.incentivizedPools.splice(index, 1);
		}
	});
	if (multiplier > 0) {
		dexGlobalStoreData.totalIncentivesMultiplier += multiplier;
		dexGlobalStoreData.incentivizedPools.push({ poolId, multiplier });
		dexGlobalStoreData.incentivizedPools.sort((a, b) => (a.poolId < b.poolId ? -1 : 1));
	}
};

export const getCredibleDirectPrice = async (
	tokenMethod: TokenMethod,
	methodContext: MethodContext,
	stores: NamedRegistry,
	tokenID0: TokenID,
	tokenID1: TokenID,
): Promise<bigint> => {
	const directPools: Buffer[] = [];

	const settings = (await getDexGlobalData(methodContext, stores)).poolCreationSettings;
	const allpoolIDs = await getAllPoolIDs(methodContext, stores.get(PoolsStore));

	const tokenIDArrays = [tokenID0, tokenID1].sort((a, b) => (a < b ? -1 : 1));
	const concatedTokenIDs = Buffer.concat(tokenIDArrays);

	settings.forEach(setting => {
		const tokenIDAndSettingsArray = [concatedTokenIDs, q96ToBytes(numberToQ96(setting.feeTier))];
		const potentialPoolId: Buffer = Buffer.concat(tokenIDAndSettingsArray);
		allpoolIDs.forEach(poolId => {
			if (poolId.equals(potentialPoolId)) {
				directPools.push(potentialPoolId);
			}
		});
	});

	if (directPools.length === 0) {
		throw new Error('No direct pool between given tokens');
	}

	const token1ValuesLocked: bigint[] = [];

	for (const directPool of directPools) {
		const pool = await getPool(methodContext, stores, directPool);
		const token0Amount = await getToken0Amount(tokenMethod, methodContext, directPool);
		const token0ValueQ96 = mulQ96(
			mulQ96(numberToQ96(token0Amount), bytesToQ96(pool.sqrtPrice)),
			bytesToQ96(pool.sqrtPrice),
		);
		token1ValuesLocked.push(
			roundDownQ96(token0ValueQ96) +
				(await getToken1Amount(tokenMethod, methodContext, directPool)),
		);
	}

	let maxToken1ValueLocked = BigInt(MIN_SINT32);
	let maxToken1ValueLockedIndex = 0;
	token1ValuesLocked.forEach((token1ValueLocked, index) => {
		if (token1ValueLocked > maxToken1ValueLocked) {
			maxToken1ValueLocked = token1ValueLocked;
			maxToken1ValueLockedIndex = index;
		}
	});

	const poolSqrtPrice = (
		await getPool(methodContext, stores, directPools[maxToken1ValueLockedIndex])
	).sqrtPrice;
	return mulQ96(bytesToQ96(poolSqrtPrice), bytesToQ96(poolSqrtPrice));
};

export const addPoolCreationSettings = async (
	methodContext: MethodContext,
	stores: NamedRegistry,
	feeTier: number,
	tickSpacing: number,
) => {
	if (feeTier > 1000000) {
		throw new Error('Fee tier can not be greater than 100%');
	}
	const dexGlobalStoreData = await getDexGlobalData(methodContext, stores);
	dexGlobalStoreData.poolCreationSettings.forEach(creationSettings => {
		if (creationSettings.feeTier === feeTier) {
			throw new Error('Cannot update fee tier');
		}
	});
	dexGlobalStoreData.poolCreationSettings.push({ feeTier, tickSpacing });
};
