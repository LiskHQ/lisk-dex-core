/*
 * Copyright © 2021 Lisk Foundation
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

export const priceTickSchema = {
    $id: '/dex/priceTick',
    "type": "object",
    "required": [
        "liquidityNet",
        "liquidityGross",
        "feeGrowthOutside0",
        "feeGrowthOutside1"
    ],
    "properties": {
        "liquidityNet": {
            "dataType": "sint64",
            "fieldNumber": 1
        },
        "liquidityGross": {
            "dataType": "uint64",
            "fieldNumber": 2
        },
        "feeGrowthOutside0": {
            "dataType": "bytes",
            "fieldNumber": 3
        },
        "feeGrowthOutside1": {
            "dataType": "bytes",
            "fieldNumber": 4
        }
    }
}
