/**
 * This module provides conversion and validation functions for units
 * (Satoshis, BTC) and hex strings.
 *
 * @module utils
 */

import BigNumber from "bignumber.js";
import { crypto } from "bitcoinjs-lib";

// Without this, BigNumber will report strings as exponentials. 16 places covers
// all possible values in satoshis.
BigNumber.config({ EXPONENTIAL_AT: 16 });

const VALID_BASE64_REGEX =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
const VALID_HEX_REGEX = /^[0-9A-Fa-f]*$/;

/**
 * Converts a byte array to its hex representation.
 *
 * @param {number[] | Buffer} byteArray - input byte array
 * @returns {string} hex representation of input array
 *
 * @example
 * import {toHexString} from "unchained-bitcoin";
 * const hex = toHexString([255, 0, 15, 16, 31, 32]);
 * console.log(hex) // ff000f101f20
 *
 */
export function toHexString(byteArray: number[] | Buffer) {
  return Array.prototype.map
    .call(byteArray, function (byte) {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    })
    .join("");
}

/**
 * Validate whether the given string is base64.
 *
 * - Valid base64 consists of whole groups of 4 characters containing `a-z`, `A-Z`, 0-9,
 *   `+`, or `/`. The end of the string may be padded with `==` or `=` to
 *   complete the four character group.
 *
 * @param {string} inputString - string to validate
 * @returns {boolean} true if base64, false otherwise.
 */
export function validBase64(inputString: string) {
  return VALID_BASE64_REGEX.test(inputString);
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
export function validateHex(inputString: string) {
  if (inputString.length % 2) {
    return "Invalid hex: odd-length string.";
  }
  if (!VALID_HEX_REGEX.test(inputString)) {
    return "Invalid hex: only characters a-f, A-F and 0-9 allowed.";
  }
  return "";
}

/**
 * Convert a value in Satoshis to BTC.
 *
 * - Accepts both positive and negative input values.
 * - Rounds down (towards zero) input value to the nearest Satoshi.
 *
 * @param {string|number} satoshis - value in Satoshis
 * @returns {string} value in BTC
 *
 * @example
 * import {satoshisToBitcoins} from "unchained-bitcoin";
 * console.log(satoshisToBitcoins(123450000)); // "1.2345"
 * console.log(satoshisToBitcoins('0.5')); // "0"
 * console.log(satoshisToBitcoins('-100000000.5')); // "-1.0"
 *
 */
export function satoshisToBitcoins(satoshis: string | number) {
  const originalValue = new BigNumber(satoshis);
  const roundedValue = originalValue.integerValue(BigNumber.ROUND_DOWN);
  return roundedValue.shiftedBy(-8).toString();
}

/**
 * Convert a value in BTC to Satoshis.
 *
 * - Accepts both positive and negative input values.
 * - Rounds down output value to the nearest Satoshi.
 *
 * @param {string|number} btc - value in BTC
 * @returns {string} value in satoshis
 *
 * @example
 * import {bitcoinsToSatoshis} from "unchained-bitcoin";
 * console.log(bitcoinsToSatoshis(1.2345)); // "123450000"
 * console.log(bitcoinsToSatoshis(-1.2345)); // "-123450000"
 */
export function bitcoinsToSatoshis(btc: string | number) {
  return new BigNumber(btc)
    .shiftedBy(8)
    .integerValue(BigNumber.ROUND_DOWN)
    .toString();
}

export const ZERO = new BigNumber(0);

/**
 * Given a buffer as a digest, pass through sha256 and ripemd160
 * hash functions. Returns the result
 * @param {Buffer} buf - buffer to get hash160 of
 * @returns {Buffer} hash160 of the given buffer
 */
export function hash160(buf: Buffer) {
  return crypto.ripemd160(crypto.sha256(buf));
}
