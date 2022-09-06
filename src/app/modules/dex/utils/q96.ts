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
    toBufferBE
} from 'bigint-buffer';
import {
    Q96
} from '../types';
import {
    MAX_NUM_BYTES_Q96
} from '../constants';
import {
    ONE,
    TWO,
    N_96
} from "./mathConstants";


//Fixed Point Arithmetic
export const numberToQ96 = (r: bigint): Q96 => {
    const _exp: bigint = TWO ** N_96;
    const _r = BigInt(r);
    const num: bigint = _r * _exp;

    return num;
}

export const roundDownQ96 = (a: Q96): Q96 => a >> N_96

export const roundUpQ96 = (a: Q96) => {
    if (a <= 0) {
        throw new Error('Division by zero')
    }
    const _x = ONE >> N_96;
    const _y = a % _x;

    const _z = Number(_y);

    if (_z === 0) {
        return a >> N_96;
    }

    const _r = a >> N_96;
    return _r + ONE;

}


// Arithmetic
export const addQ96 = (a: Q96, b: Q96): Q96 => a + b

export const subQ96 = (a: Q96, b: Q96): Q96 => {
    if (a >= b) {
        return a - b;
    }

    return BigInt(0); //To discuss

}

export const mulQ96 = (a: Q96, b: Q96): Q96 => {
    const _x: bigint = a * b;
    return _x >> N_96;
}

export const divQ96 = (a: Q96, b: Q96): Q96 => {
    const _x: bigint = a >> N_96;
    return _x / b;
}

export const mulDivQ96 = (a: Q96, b: Q96, c: Q96): Q96 => {
    const _x: bigint = a * b;
    const _y: bigint = _x >> N_96;
    const _z: bigint = _y / c;

    return roundDownQ96(_z);
}

export const mulDivRoundUpQ96 = (a: Q96, b: Q96, c: Q96): Q96 => {
    const _x: bigint = a * b;
    const _y: bigint = _x >> N_96;
    const _z: bigint = _y / c;

    return roundUpQ96(_z)
}

export const q96ToInt = (a: Q96): bigint => roundDownQ96(a)

export const q96ToIntRoundUp = (a: Q96): bigint => roundUpQ96(a)

export const invQ96 = (a: Q96): Q96 => {
    const _x: bigint = ONE >> N_96;
    return divQ96(_x, a);
}


// Q96 Encoding and Decoding
export const bytesToQ96 = (numberBytes: Buffer): Q96 => {
    if (numberBytes.length > MAX_NUM_BYTES_Q96) {
        throw new Error();
    }

    const _hex: string[] = [];

    for (let i = 0; i < numberBytes.length; i++) {
        let current = numberBytes[i] < 0 ? numberBytes[i] + 256 : numberBytes[i];
        _hex.push((current >>> 4).toString(16));
        _hex.push((current & 0xF).toString(16));
    }

    const _hex_bi = _hex.join("");

    //return big-endian decoding of bytes
    return BigInt(`0x${_hex_bi}`);
}

export const q96ToBytes = (numberQ96: Q96): Buffer => {

    const _hex: string = numberQ96.toString(16);
    let _byteArr: number[] = [];

    for (let c = 0; c < _hex.length; c += 2) {
        _byteArr.push(parseInt(_hex.substring(c, 2), 16));
    }

    if (_byteArr.length > MAX_NUM_BYTES_Q96) {
        throw new Error("Overflow when serializing a Q96 number")
    }

    // return result padded to length NUM_BYTES_Q96 with zero bytes
    return toBufferBE(BigInt(`0x${_hex}`), MAX_NUM_BYTES_Q96) //big-endian encoding of numberQ96 as integer
}