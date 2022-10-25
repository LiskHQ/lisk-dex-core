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
	ADDRESS_LIQUIDITY_PROVIDER_REWARDS_POOL,
	ADDRESS_TRADER_REWARDS_POOL,
	ADDRESS_VALIDATOR_REWARDS_POOL,
	NUM_BYTES_ADDRESS,
} from '../../../../src/app/modules/dexRewards/constants';

describe('DexRewardsModule:constants', () => {
	it('should generate addresses', () => {
		expect(ADDRESS_LIQUIDITY_PROVIDER_REWARDS_POOL).toHaveLength(NUM_BYTES_ADDRESS);
		expect(ADDRESS_TRADER_REWARDS_POOL).toHaveLength(NUM_BYTES_ADDRESS);
		expect(ADDRESS_VALIDATOR_REWARDS_POOL).toHaveLength(NUM_BYTES_ADDRESS);
	});
});