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

import { BaseEndpoint, MethodContext } from 'lisk-sdk';
import { PoolsStore } from './stores';
import { PoolID, PositionID, TokenID } from './types';
import { NamedRegistry } from 'lisk-framework/dist-node/modules/named_registry';
import { getPoolIDFromPositionID, getToken0Id, getToken1Id } from './utils/auxiliaryFunctions';

export class DexEndpoint extends BaseEndpoint {

    public async getAllPoolIDs(	methodContext: MethodContext,
		poolStore: PoolsStore): Promise<PoolID[]>{
			const poolIds: PoolID[] = [];
			const allPoolIds = await poolStore.getAll(methodContext);
			if (allPoolIds && allPoolIds.length){
				allPoolIds.forEach(poolId => {
					poolIds.push(poolId.key);
				});
			}
			return poolIds;
	}

    public async getAllTokenIDs (
        methodContext: MethodContext,
        stores: NamedRegistry,
    ): Promise<Set<TokenID>>{
        const tokens = new Set<TokenID>();
        const allPoolIds = await this.getAllPoolIDs(methodContext, stores.get(PoolsStore));
    
        if (allPoolIds != null && allPoolIds.length > 0) {
            allPoolIds.forEach(poolID => {
                tokens.add(getToken0Id(poolID));
                tokens.add(getToken1Id(poolID));
            });
        }
    
        return tokens;
    };

    public getAllPositionIDsInPool(
        poolId: PoolID,
        positionIdsList: PositionID[],
    ): Buffer[]{
        const result: Buffer[] = [];
        positionIdsList.forEach(positionId => {
            if (getPoolIDFromPositionID(positionId).equals(poolId)) {
                result.push(positionId);
            }
        });
        return result;
    };
}
