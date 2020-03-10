/**
 * This module provides conversion and validation functions for units
 * (Satoshis, BTC) and hex strings.
 * 
 * @module utils
 */

import BigNumber from "bignumber.js";
import bitcoin from "bitcoinjs-lib";

/**
 * Converts a byte array to its hex representation.
 * 
 * @param {number[]} byteArray - input byte array
 * @returns {string} hex representation of input array
 * 
 * @example
 * import {toHexString} from "unchained-bitcoin";
 * const hex = toHexString([255, 0, 15, 16, 31, 32]);
 * console.log(hex) // ff000f101f20
 * 
 */
export function toHexString(byteArray) {
  return Array.prototype.map.call(byteArray, function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/**
 * Validate whether the given string is hex.
 *
 * - Valid hex consists of an even number of characters 'a-f`, `A-F`,
 *   or `0-9`.  This is case-insensitive.
 *
 * - The presence of the common prefix `0x` will make the input be
 *   considered invalid (because of the` `x`).
 * 
 * @param {string} inputString - string to validate
 * @returns {string} empty if valid or corresponding validation message if not
 * 
 * @example
 * import {validateHex} from "unchained-bitcoin";
 * console.log(validateHex('00112233gg')) // "Invalid hex: ..."
 * console.log(validateHex('0xdeadbeef')) // "Invalid hex: ..."
 * console.log(validateHex('deadbeef')) // ""
 * console.log(validateHex('DEADbeef')) // ""
 * 
 */
export function validateHex(inputString) {
  if (inputString.length % 2) {
    return 'Invalid hex: odd-length string.';
  }
  const re = /^[0-9A-Fa-f]*$/;
  if (!re.test(inputString)) {
    return 'Invalid hex: only characters a-f, A-F and 0-9 allowed.';
  }
  return '';
}

/**
 * Convert a value in Satoshis to BTC.
 *
 * - Accepts both positive and negative input values.
 * - Rounds down (towards zero) input value to the nearest Satoshi.
 * 
 * @param {BigNumber|string|number} satoshis - value in Satoshis
 * @returns {BigNumber} value in BTC
 * 
 * @example
 * import {satoshisToBitcoins} from "unchained-bitcoin";
 * console.log(satoshisToBitcoins(123450000)); // 1.2345
 * console.log(satoshisToBitcoins('0.5')); // 0
 * console.log(satoshisToBitcoins('-100000000.5')); // -1.0
 * 
 */
export function satoshisToBitcoins(satoshis) {
  const originalValue = BigNumber(satoshis);
  const roundedValue = originalValue.integerValue(BigNumber.ROUND_DOWN);
  return roundedValue.shiftedBy(-8);
}

/**
 * Convert a value in BTC to Satoshis.
 *
 * - Accepts both positive and negative input values.
 * - Rounds down output value to the nearest Satoshi.
 * 
 * @param {BigNumber|string|number} btc - value in BTC
 * @returns {BigNumber} value in satoshis
 * 
 * @example
 * import {bitcoinsToSatoshis} from "unchained-bitcoin";
 * console.log(bitcoinsToSatoshis(1.2345)); // 123450000
 * console.log(bitcoinsToSatoshis(-1.2345)); // -123450000
 */
export function bitcoinsToSatoshis(btc) {
  return BigNumber(btc).shiftedBy(8).integerValue(BigNumber.ROUND_DOWN);
}

export const ZERO = BigNumber(0);

/**
 * Given a buffer as a digest, pass through sha256 and ripemd160
 * hash functions. Returns the result
 * @param {Buffer} buf - buffer to get hash160 of
 * @returns {Buffer}
 */
export function hash160(buf) {
  return bitcoin.crypto.ripemd160(bitcoin.crypto.sha256(buf))
}