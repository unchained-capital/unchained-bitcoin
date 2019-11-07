/**
 * This module provides validation of public keys and extended public keys.  Also it provides public key compression.
 * @module keys
 */

import {validateHex} from "./utils";
import {NETWORKS, networkData} from "./networks";
import {ECPair} from "bitcoinjs-lib"

const bip32 = require('bip32');

/**
 * Provide validation messages for an extended public key.
 * @param {string} inputString - base58 encoded extended public key
 * @param {module:networks.NETWORKS} network  - bitcoin network
 * @example
 * const key = "apub6CCHViYn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab";
 * const validationError = validateExtendedPublicKey(key, NETWORKS.TESTNET);
 * console.log(validationError); // Extended public key must begin with 'xpub' or 'tpub'."
 * @returns {string} empty if valid or corresponding validation message
 */
export function validateExtendedPublicKey(inputString, network) {
  if (inputString === null || inputString === undefined || inputString === '') {
    return "Extended public key cannot be blank.";
  }

  let requiredPrefix = "'xpub'";
  if (network === NETWORKS.TESTNET) {
    requiredPrefix += " or 'tpub'";
  }
  const notXpubError = `Extended public key must begin with ${requiredPrefix}.`;

  if (inputString.length < 111) {
    return "Extended public key length is too short.";
  }

  const prefix = inputString.slice(0, 4);
  if (! (prefix === 'xpub' || (network === NETWORKS.TESTNET && prefix === 'tpub'))) {
    return notXpubError;
  }

  try {
    bip32.fromBase58(inputString, networkData(network));
  } catch (e) {
    return `Invalid extended public key: ${e}`;
  }

  return '';

}

/**
 * Provide validation messages for a public key.
 * @param {string} inputString - hex public key string
 * @example
 * const validationError = validatePublicKey("03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee"); // result empty, valid key
 * @returns {string} empty if valid or corresponding validation message
 */
export function validatePublicKey(inputString) {
  if (inputString === null || inputString === undefined || inputString === '') {
    return "Public key cannot be blank.";
  }

  const error = validateHex(inputString);
  if (error !== '') { return error; }

  try {
    ECPair.fromPublicKey(Buffer.from(inputString, 'hex'));
  } catch (e) {
    return `Invalid public key ${e}.`;
  }

  return '';
}

/**
 * Compresses a public key.
 * @param {string} publicKey - the hex public key to compress
 * @example
 * const compressed = compressPublicKey("04b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee6e43c09d025c2ad322382347ec0f69b4e78d8e23c8ff9aa0dd0cb93665ae83d5");
 * console.log(compressed); // 03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee
 * @returns {string} compressed public key
 */
export function compressPublicKey(publicKey) {
  // validate Public Key Length
  // validate Public Key Structure
  const pubkeyBuffer = Buffer.from(publicKey, 'hex');
  // eslint-disable-next-line no-bitwise
  const prefix = (pubkeyBuffer[64] & 1) !== 0 ? 0x03 : 0x02;
  const prefixBuffer = Buffer.alloc(1);
  prefixBuffer[0] = prefix;
  return Buffer.concat([prefixBuffer, pubkeyBuffer.slice(1, 1 + 32)]).toString('hex');
}
