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

import {
    MAX_NUM_BYTES_Q96,
    NUM_BYTES_ADDRESS,
    NUM_BYTES_POOL_ID,
    NUM_BYTES_POSITION_ID,
    NUM_BYTES_TICK_ID,
} from './constants';
import { PoolsStore } from './stores';

<<<<<<< HEAD
export const poolsSchema = {
    $id: '/dex/pools',
    "type": "object",
    "required": [
        "liquidity",
        "sqrtPrice",
        "feeGrowthGlobal0",
        "feeGrowthGlobal1",
        "tickSpacing"
    ],
    "properties": {
        "liquidity": {
            "dataType": "uint64",
            "fieldNumber": 1
        },
        "sqrtPrice": {
            "dataType": "bytes",
            "maxLength": MAX_NUM_BYTES_Q96,
            "fieldNumber": 2
        },
        "feeGrowthGlobal0": {
            "dataType": "bytes",
            "maxLength": MAX_NUM_BYTES_Q96,
            "fieldNumber": 3
        },
        "feeGrowthGlobal1": {
            "dataType": "bytes",
            "maxLength": MAX_NUM_BYTES_Q96,
            "fieldNumber": 4
        },
        "tickSpacing": {
            "dataType": "uint32",
            "fieldNumber": 5
        }
    }
}

export const priceTicksSchema = {
    $id: '/dex/priceTicks',
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
            "maxLength": MAX_NUM_BYTES_Q96,
            "fieldNumber": 3
        },
        "feeGrowthOutside1": {
            "dataType": "bytes",
            "maxLength": MAX_NUM_BYTES_Q96,
            "fieldNumber": 4
        }
    }
}

export const positionsSchema = {
    $id: '/dex/positions',
    "type": "object",
    "required": [
        "tickLower",
        "tickUpper",
        "liquidity",
        "feeGrowthInsideLast0",
        "feeGrowthInsideLast1",
        "ownerAddress"
    ],
    "properties": {
        "tickLower": {
            "dataType": "sint32",
            "fieldNumber": 1
        },
        "tickUpper": {
            "dataType": "sint32",
            "fieldNumber": 2
        },
        "liquidity": {
            "dataType": "uint64",
            "fieldNumber": 3
        },
        "feeGrowthInsideLast0": {
            "dataType": "bytes",
            "maxLength": MAX_NUM_BYTES_Q96,
            "fieldNumber": 4
        },
        "feeGrowthInsideLast1": {
            "dataType": "bytes",
            "maxLength": MAX_NUM_BYTES_Q96,
            "fieldNumber": 5
        },
        "ownerAddress": {
            "dataType": "bytes",
            "length": NUM_BYTES_ADDRESS,
            "fieldNumber": 6
        }
    }
}

export const settingsSchema = {
    $id: '/dex/settings',
    type: 'object',
    required: [
        'protocolFeeAddress',
        'protocolFeePart',
        'validatorsLSKRewardsPart',
        'poolCreationSettings',
    ],
    properties: {
        protocolFeeAddress: {
            dataType: 'bytes',
            length: NUM_BYTES_ADDRESS,
            fieldNumber: 1,
        },
        protocolFeePart: {
            dataType: 'uint32',
            fieldNumber: 2,
        },
        validatorsLSKRewardsPart: {
            dataType: 'uint32',
            fieldNumber: 3,
        },
        poolCreationSettings: {
            type: 'array',
            fieldNumber: 4,
            items: {
                type: 'object',
                required: ['feeTier', 'tickSpacing'],
                properties: {
                    feeTier: {
                        dataType: 'uint32',
                        fieldNumber: 1,
                    },
                    tickSpacing: {
                        dataType: 'uint32',
                        fieldNumber: 2,
                    },
                },
            },
        },
    },
=======
export const globalDataSchema = {
	$id: '/dex/settings',
	type: "object",
	required: [
		"positionCounter",
		"poolCreationSettings",
		"incentivizedPools",
		"totalIncentivesMultiplier"
	],
	properties: {
		positionCounter: {
			dataType: "uint64",
			fieldNumber: 1
		},
		poolCreationSettings: {
			type: "array",
			fieldNumber: 2,
			items: {
				type: "object",
				required: ["feeTier", "tickSpacing"],
				properties: {
					feeTier: {
						dataType: "uint32",
						fieldNumber: 1
					},
					tickSpacing: {
						dataType: "uint32",
						fieldNumber: 2
					}
				}
			}
		},
		incentivizedPools: {
			type: "array",
			fieldNumber: 3,
			items: {
				type: "object",
				required: ["poolId", "multiplier"],
				properties: {
					poolId: {
						dataType: "bytes",
						length: NUM_BYTES_POOL_ID,
						fieldNumber: 1
					},
					multiplier: {
						dataType: "uint32",
						fieldNumber: 2
					}
				}
			}
		},
		totalIncentivesMultiplier: {
			dataType: "uint32",
			fieldNumber: 4
		}
	}
>>>>>>> 9668154 (refactor: fix globalDataSchema)
};

export const genesisDEXSchema = {
    $id: '/dex/genesis',
    type: 'object',
    required: [
        'stateSubstore',
        'poolSubstore',
        'priceTickSubstore',
        'positionSubstore',
        'settingsSubstore',
    ],
    properties: {
        stateSubstore: {
            type: 'object',
            fieldNumber: 1,
            required: ['positionCounter', 'collectableLSKFees'],
            properties: {
                positionCounter: {
                    dataType: 'uint64',
                    fieldNumber: 1,
                },
                collectableLSKFees: {
                    dataType: 'uint64',
                    fieldNumber: 2,
                },
            },
        },
        poolSubstore: {
            type: 'array',
            fieldNumber: 2,
            items: {
                type: 'object',
                required: [
                    'poolId',
                    'liquidity',
                    'sqrtPrice',
                    'feeGrowthGlobal0',
                    'feeGrowthGlobal1',
                    'tickSpacing',
                ],
                properties: {
                    poolId: {
                        dataType: 'bytes',
                        length: NUM_BYTES_POOL_ID,
                        fieldNumber: 1,
                    },
                    liquidity: {
                        dataType: 'uint64',
                        fieldNumber: 2,
                    },
                    sqrtPrice: {
                        dataType: 'bytes',
                        maxLength: MAX_NUM_BYTES_Q96,
                        fieldNumber: 3,
                    },
                    feeGrowthGlobal0: {
                        dataType: 'bytes',
                        maxLength: MAX_NUM_BYTES_Q96,
                        fieldNumber: 4,
                    },
                    feeGrowthGlobal1: {
                        dataType: 'bytes',
                        maxLength: MAX_NUM_BYTES_Q96,
                        fieldNumber: 5,
                    },
                    tickSpacing: {
                        dataType: 'uint32',
                        fieldNumber: 6,
                    },
                },
            },
        },
        priceTickSubstore: {
            type: 'array',
            fieldNumber: 3,
            items: {
                type: 'object',
                required: [
                    'tickId',
                    'liquidityNet',
                    'liquidityGross',
                    'feeGrowthOutside0',
                    'feeGrowthOutside1',
                ],
                properties: {
                    tickId: {
                        dataType: 'bytes',
                        length: NUM_BYTES_TICK_ID,
                        fieldNumber: 1,
                    },
                    liquidityNet: {
                        dataType: 'sint64',
                        fieldNumber: 2,
                    },
                    liquidityGross: {
                        dataType: 'uint64',
                        fieldNumber: 3,
                    },
                    feeGrowthOutside0: {
                        dataType: 'bytes',
                        maxLength: MAX_NUM_BYTES_Q96,
                        fieldNumber: 4,
                    },
                    feeGrowthOutside1: {
                        dataType: 'bytes',
                        maxLength: MAX_NUM_BYTES_Q96,
                        fieldNumber: 5,
                    },
                },
            },
        },
        positionSubstore: {
            type: 'array',
            fieldNumber: 4,
            items: {
                type: 'object',
                required: [
                    'positionId',
                    'tickLower',
                    'tickUpper',
                    'liquidity',
                    'feeGrowthInsideLast0',
                    'feeGrowthInsideLast1',
                ],
                properties: {
                    positionId: {
                        dataType: 'bytes',
                        length: NUM_BYTES_POSITION_ID,
                        fieldNumber: 1,
                    },
                    tickLower: {
                        dataType: 'sint32',
                        fieldNumber: 2,
                    },
                    tickUpper: {
                        dataType: 'sint32',
                        fieldNumber: 3,
                    },
                    liquidity: {
                        dataType: 'uint64',
                        fieldNumber: 4,
                    },
                    feeGrowthInsideLast0: {
                        dataType: 'bytes',
                        maxLength: MAX_NUM_BYTES_Q96,
                        fieldNumber: 5,
                    },
                    feeGrowthInsideLast1: {
                        dataType: 'bytes',
                        maxLength: MAX_NUM_BYTES_Q96,
                        fieldNumber: 6,
                    },
                    ownerAddress: {
                        dataType: 'bytes',
                        length: NUM_BYTES_ADDRESS,
                        fieldNumber: 7,
                    },
                },
            },
        },
        settingsSubstore: {
            type: 'object',
            fieldNumber: 5,
            required: [
                'protocolFeeAddress',
                'protocolFeePart',
                'validatorsLSKRewardsPart',
                'poolCreationSettings',
            ],
            properties: {
                protocolFeeAddress: {
                    dataType: 'bytes',
                    length: NUM_BYTES_ADDRESS,
                    fieldNumber: 1,
                },
                protocolFeePart: {
                    dataType: 'uint32',
                    fieldNumber: 2,
                },
                validatorsLSKRewardsPart: {
                    dataType: 'uint32',
                    fieldNumber: 3,
                },
                poolCreationSettings: {
                    type: 'array',
                    fieldNumber: 4,
                    items: {
                        type: 'object',
                        required: ['feeTier', 'tickSpacing'],
                        properties: {
                            feeTier: {
                                dataType: 'uint32',
                                fieldNumber: 1,
                            },
                            tickSpacing: {
                                dataType: 'uint32',
                                fieldNumber: 2,
                            },
                        },
                    },
                },
            },
        },
    },
};

export const addLiquiditySchema = {
    $id: '/dex/addLiquiditySchema',
    type: 'object',
    required: [
        'positionID',
        'amount0Desired',
        'amount1Desired',
        'amount0Min',
        'amount1Min',
        'maxTimestampValid',
    ],
    properties: {
        positionID: {
            dataType: 'bytes',
            fieldNumber: 1,
        },
        amount0Desired: {
            dataType: 'uint64',
            fieldNumber: 2,
        },
        amount1Desired: {
            dataType: 'uint64',
            fieldNumber: 3,
        },
        amount0Min: {
            dataType: 'uint64',
            fieldNumber: 4,
        },
        amount1Min: {
            dataType: 'uint64',
            fieldNumber: 5,
        },
        maxTimestampValid: {
            dataType: 'uint64',
            fieldNumber: 6,
        },
    },
};

export const createPositionSchema = {
    $id: '/dex/createPositionSchema',
    type: 'object',
    required: [
        'poolID',
        'tickLower',
        'tickUpper',
        'amount0Desired',
        'amount1Desired',
        'amount0Min',
        'amount1Min',
        'maxTimestampValid',
    ],
    properties: {
        poolID: {
            dataType: 'bytes',
            fieldNumber: 1,
        },
        tickLower: {
            dataType: 'sint32',
            fieldNumber: 2,
        },
        tickUpper: {
            dataType: 'sint32',
            fieldNumber: 3,
        },
        amount0Desired: {
            dataType: 'uint64',
            fieldNumber: 4,
        },
        amount1Desired: {
            dataType: 'uint64',
            fieldNumber: 5,
        },
        amount0Min: {
            dataType: 'uint64',
            fieldNumber: 6,
        },
        amount1Min: {
            dataType: 'uint64',
            fieldNumber: 7,
        },
        maxTimestampValid: {
            dataType: 'uint64',
            fieldNumber: 8,
        },
    },
};

export const createPoolSchema = {
    $id: '/dex/createPoolSchema',
    type: 'object',
    required: [
        'tokenID0',
        'tokenID1',
        'feeTier',
        'tickInitialPrice',
        'initialPosition',
        'maxTimestampValid',
    ],
    properties: {
        tokenID0: {
            dataType: 'bytes',
            fieldNumber: 1,
        },
        tokenID1: {
            dataType: 'bytes',
            fieldNumber: 2,
        },
        feeTier: {
            dataType: 'uint32',
            fieldNumber: 3,
        },
        tickInitialPrice: {
            dataType: 'sint32',
            fieldNumber: 4,
        },
        initialPosition: {
            type: 'object',
            fieldNumber: 5,
            required: ['tickLower', 'tickUpper', 'amount0Desired', 'amount1Desired'],
            properties: {
                tickLower: {
                    dataType: 'sint32',
                    fieldNumber: 1,
                },
                tickUpper: {
                    dataType: 'sint32',
                    fieldNumber: 2,
                },
                amount0Desired: {
                    dataType: 'uint64',
                    fieldNumber: 3,
                },
                amount1Desired: {
                    dataType: 'uint64',
                    fieldNumber: 4,
                },
            },
        },
        maxTimestampValid: {
            dataType: 'uint64',
            fieldNumber: 6,
        },
    },
};

export const collectFeesSchema = {
    $id: '/dex/collectFees',
    "type": "object",
    "required": ["positions"],
    "properties": {
        "positions": {
            "type": "array",
            "fieldNumber": 1,
            "items": {
                "type": "object",
                "required": ["positionID"],
                "properties": {
                    "positionID": {
                        "dataType": "bytes",
                        "fieldNumber": 1
                    },
                }
            }
        }
    }
}

export const removeLiquiditySchema = {
    $id: '/dex/removeLiquidity',
    "type": "object",
    "required": [
        "positionID",
        "liquidityToRemove",
        "amount0Min",
        "amount1Min",
        "maxTimestampValid"
    ],
    "properties": {
        "positionID": {
            "dataType": "bytes",
            "fieldNumber": 1
        },
        "liquidityToRemove": {
            "dataType": "uint64",
            "fieldNumber": 2
        },
        "amount0Min": {
            "dataType": "uint64",
            "fieldNumber": 3
        },
        "amount1Min": {
            "dataType": "uint64",
            "fieldNumber": 4
        },
        "maxTimestampValid": {
            "dataType": "uint64",
            "fieldNumber": 5
        },
    }
}
export const getAllPoolIdsRequestSchema = {
    $id: 'dex/getAllPoolIds',
    type: 'object',
    required: ['poolStore'],
    properties: {
        poolStore: PoolsStore,
    },
};

export const getAllPoolIdsResponseSchema = {
    $id: 'dex/getAllPoolIds',
    type: 'object',
    required: ['PoolID'],
    properties: {
        PoolID: Buffer
    }
};

export const getToken1AmountResponseSchema = {
    $id: 'dex/getToken1Amount',
    type: 'object',
    required: ['poolID'],
    properties: {
        poolID: {
            dataType: 'bytes',
            fieldNumber: 1,
        }
    }
};

export const getToken0AmountResponseSchema = {
    $id: 'dex/getToken0Amount',
    type: 'object',
    required: ['poolID'],
    properties: {
        poolID: {
            dataType: 'bytes',
            fieldNumber: 1,
        }
    }
}

export const getToken1AmountRequestSchema = {
    $id: 'dex/getToken1Amount',
    type: 'object',
    required: ['token1Amount'],
    properties: {
        Token1Amount: {
            dataType: 'uint64',
            fieldNumber: 1,
        }
    }
}

export const getToken0AmountRequestSchema = {
    $id: 'dex/getToken0Amount',
    type: 'object',
    required: ['token0Amount'],
    properties: {
        Token1Amount: {
            dataType: 'uint64',
            fieldNumber: 1,
        }
    }
}

export const getFeeTierResquestSchema = {
    $id: 'dex/getFeeTier',
    type: 'object',
    required: ['poolId'],
    properties: {
        poolId: {
            dataType: 'bytes',
            fieldNumber: 1,
        },
    },
};

export const getFeeTierResponseSchema = {
    $id: 'dex/getFeeTier',
    type: 'object',
    required: ['feeTier'],
    properties: {
        feeTier: {
            dataType: 'uint32',
            fieldNumber: 1,
        },
    },
};

export const getPoolIDFromTickIDRequestSchema = {
    $id: 'dex/getPoolIDFromTickID',
    type: 'object',
    required: ['tickID'],
    properties: {
        tickID: {
            dataType: 'bytes',
            fieldNumber: 1,
        }
    },
};

export const getPoolIDFromTickIDResponseSchema = {
    $id: 'dex/getPoolIDFromTickID',
    type: 'object',
    required: ['poolId'],
    properties: {
        poolId: {
            dataType: 'bytes',
            fieldNumber: 1,
        }
    },
};

export const getPositionIndexResquestSchema = {
    $id: 'dex/getPositionIndex',
    type: 'object',
    required: ['positionId'],
    properties: {
        positionId: {
            dataType: 'bytes',
            fieldNumber: 1,
        }
    },
};

export const getPositionIndexResponseSchema = {
    $id: 'dex/getPositionIndex',
    type: 'object',
    required: ['positionIndex'],
    properties: {
        positionIndex: {
            dataType: 'unit32',
            fieldNumber: 1,
        }
    },
};

export const getAllPositionIDsInPoolRequestSchema = {
    $id: 'dex/getAllPositionIDs',
    type: 'object',
    required: ['poolId', 'positionIdsList'],
    properties: {
        poolId: {
            dataType: 'buffer',
            fieldNumber: 1,
        },
        positionIdsList: {
            type: 'array',
            fieldNumber: 1,
            items: {
                type: 'object',
                required: ['positionID'],
                properties: {
                    positionID: {
                        dataType: 'bytes',
                        fieldNumber: 1,
                    },
                },
            },
        },
    },
};

export const getAllPositionIDsInPoolResponseSchema = {
    $id: 'dex/getAllPositionIDs',
    type: 'object',
    required: ['positionIdsList'],
    properties: {
        positionIdsList: {
            type: 'array',
            fieldNumber: 1,
            items: {
                type: 'object',
                required: ['positionID'],
                properties: {
                    positionID: {
                        dataType: 'bytes',
                        fieldNumber: 1,
                    },
                },
            },
        },
    },
};

export const getCurrentSqrtPriceRequestSchema = {
    $id: 'dex/getCurrentSqrtPrice',
    type: 'object',
    required: ['stores', 'poolID', 'priceDirection'],
    properties: {
        stores: {
            dataType: 'object',
            fieldNumber: 1,
        },
        poolID: {
            dataType: 'bytes',
            fieldNumber: 2,
        },
        priceDirection: {
            dataType: 'boolean',
            fieldNumber: 3,
        },
    },
};

export const getCurrentSqrtPriceResponseSchema = {
    $id: 'dex/getCurrentSqrtPrice',
    type: 'object',
    required: ['currentSqrtPrice'],
    properties: {
        currentSqrtPrice: {
            dataType: 'uint64',
            fieldNumber: 1,
        },
    },
};

export const getDexGlobalDataRequestSchema = {
    $id: 'dex/getDexGlobalData',
    type: 'object',
    required: ['stores'],
    properties: {
        stores: {
            dataType: 'object',
            fieldNumber: 1,
        },
    },
};

export const getDexGlobalDataResponseSchema = {
    $id: 'dex/getDexGlobalData',
    type: 'object',
    required: ['dexGlobalData'],
    properties: {
        dexGlobalData: {
            dataType: 'object',
            fieldNumber: 1,
        },
    },
};

export const getPoolResponseSchema = {
    $id: 'dex/getPool',
    type: 'object',
    required: ['stores', 'poolID'],
    properties: {
        stores: {
            dataType: 'object',
            fieldNumber: 1,
        },
        poolID: {
            dataType: 'bytes',
            fieldNumber: 2,
        },
    },
};

export const getPoolRequestSchema = {
    $id: 'dex/getPool',
    type: 'object',
    required: ['stores', 'poolID'],
    properties: {
        stores: {
            dataType: 'object',
            fieldNumber: 1,
        },
        poolID: {
            dataType: 'bytes',
            fieldNumber: 2,
        },
    },
};

export const getTickWithPoolIdAndTickValueRequestSchema = {
    $id: 'dex/getTickWithPoolIdAndTickValue',
    type: 'object',
    required: ['stores', 'poolId', 'tickValue'],
    properties: {
        stores: {
            dataType: 'object',
            fieldNumber: 1,
        },
        poolId: {
            dataType: 'bytes',
            fieldNumber: 2,
        },
        tickValue: {
            dataType: 'unit32',
            fieldNumber: 3,
        },
    },
};

export const getTickWithPoolIdAndTickValueResponseSchema = {
    $id: 'dex/getTickWithPoolIdAndTickValue',
    type: 'object',
    required: ['priceTicksStoreData'],
    properties: {
        priceTicksStoreData: {
            dataType: 'object',
            fieldNumber: 1,
        },
    },
};

export const getTickWithTickIdRequestSchema = {
    $id: 'dex/getTickWithTickId',
    type: 'object',
    required: ['stores', 'tickIDs'],
    properties: {
        stores: {
            dataType: 'object',
            fieldNumber: 1,
        },
        tickIDs: {
            type: 'array',
            fieldNumber: 2,
            items: {
                type: 'object',
                required: ['tickId'],
                properties: {
                    positionID: {
                        dataType: 'bytes',
                        fieldNumber: 1,
                    },
                },
            },
        },
    },
};

export const getTickWithTickIdResponseSchema = {
    $id: 'dex/getTickWithTickId',
    type: 'object',
    required: ['priceTicksStoreData'],
    properties: {
        priceTicksStoreData: {
            dataType: 'object',
            fieldNumber: 1,
        },
    },
};

export const getLSKPriceResponseSchema = {
    $id: 'dex/getLSKPrice',
    type: 'object',
    required: ['tokenMethod', 'methodContext', 'stores', 'tokenId'],
    properties: {
        tokenMethod: {
            dataType: 'object',
            fieldNumber: 1,
        },
        methodContext: {
            dataType: 'object',
            fieldNumber: 2,
        },
        stores: {
            dataType: 'object',
            fieldNumber: 3,
        },
        tokenId: {
            dataType: 'bytes',
            fieldNumber: 4,
        },
    },
};

export const getLSKPriceRequestSchema = {
    $id: 'dex/getLSKPrice',
    type: 'object',
    required: ['lskPrice'],
    properties: {
        lskPrice: {
            dataType: 'uint64',
            fieldNumber: 1,
        },
    },
};
