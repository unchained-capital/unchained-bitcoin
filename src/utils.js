/**
 * This module provides various utility conversion and validation functions.
 * @module utils
 */

 import BigNumber from "bignumber.js";

/**
 * Converts a byte array to its hex representation.
 * @param {number[]} byteArray - array of bytes to convert
 * @returns {string} hex representation of bytes
 */
export function toHexString(byteArray) {
  return Array.prototype.map.call(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/**
 * Provide validation messages for a hex string.
 * @param {string} inputString - hex string to validate
 * @returns {string} empty if valid or corresponding validation message
 */
export function validateHex(inputString) {
  if (inputString.length % 2) {
    return 'invalid hex - odd-length string';
  }
  const re = /^[0-9A-Fa-f]*$/;
  if (!re.test(inputString)) {
    return 'invalid hex - invalid characters';
  }
  return '';
}

/**
 * Convert a value in satoshis to corresponding value in BTC.
 * @param {BigNumber} num - value in satoshis
 * @returns {BigNumber} value in BTC
 */
export function satoshisToBitcoins(num) {
  return new BigNumber(num).shiftedBy(-8);
}

/**
 * Convert a value in BTC to corresponding value in satoshis.
 * @param {BigNumber} num - value in BTC
 * @returns {BigNumber} value in satoshis
 */
export function bitcoinsToSatoshis(num) {
  return new BigNumber(num).shiftedBy(8);
}
