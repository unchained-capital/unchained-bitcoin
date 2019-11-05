/**
 * This module contains various utility functions for converting and validating BIP32 derivation paths.
 * It also provides functions for deriving child public keys and child extended public keys for a given BIP32 derivation path.
 * @module bip32
 */

import {toHexString} from "./utils";
import {networkData} from "./networks";

const bip32 = require('bip32');

export const HARDENING_OFFSET = Math.pow(2, 31);
const BIP32_PATH_REGEX = /^(m\/)?(\d+'?\/)*\d+'?$/;
const BIP32_HARDENED_PATH_REGEX = /^(m\/)?(\d+'\/)*\d+'$/;
const BIP32_UNHARDENED_PATH_REGEX = /^(m\/)?(\d+\/)*\d+$/;
const MAX_BIP32_HARDENED_NODE_INDEX = Math.pow(2, 31) - 1;
const MAX_BIP32_NODE_INDEX = Math.pow(2, 32) - 1;

/**
 * Convert derivation path to an array of integer values representing the derivation sequence.
 * @param {string} pathString - BIP32 derivation path string
 * @returns {number[]} the segments of the derivation path sequence as integer values
 */
export function bip32PathToSequence(pathString) {
  const pathSegments = pathString.split("/").splice(1);
  return pathSegments.map(pathSegment => {
    if (pathSegment.substr(-1) === "'") {
      return parseInt(pathSegment.slice(0, -1), 10) + HARDENING_OFFSET;
    } else {
      return parseInt(pathSegment, 10);
    }
  });
}

/**
 * Convert an array of integers representaing a derivation sequence to derivation path string.
 * @param {number[]} sequence -the segments of the derivation path sequence as integer values
 * @returns {string} BIP32 derivation path
 */
export function bip32SequenceToPath(sequence) {
  return "m/" + sequence.map((index) => {
    if (index >= HARDENING_OFFSET) {
      return `${(index - HARDENING_OFFSET)}'`;
    } else {
      return index.toString();
    }
  }).join('/');
}

/**
 * Provide validation messages for a BIP32 derivation path string.
 * @param {string} pathString - BIP32 derivation path string
 * @param {Object} [options] - additional options
 * @param {string} [options.mode] - "hardened" and "unhardened" verify respectively
 * @returns {string} empty if valid or corresponding validation message
 */
export function validateBIP32Path(pathString, options) {
  if (pathString === null || pathString === undefined || pathString === '') {
    return "BIP32 path cannot be blank.";
  }

  if (! pathString.match(BIP32_PATH_REGEX)) {
    return "BIP32 path is invalid.";
  }

  if (options && options.mode === 'hardened') {
    if (! pathString.match(BIP32_HARDENED_PATH_REGEX)) {
      return "BIP32 path must be fully-hardened.";
    }
  }

  if (options && options.mode === 'unhardened') {
    if (! pathString.match(BIP32_UNHARDENED_PATH_REGEX)) {
      return "BIP32 path cannot include hardened segments.";
    }
  }
  
  const segmentStrings = pathString.toLowerCase().split('/');

  return validateBIP32PathSegments(segmentStrings.slice(1));
}

function validateBIP32PathSegments(segmentStrings) {
  for (let i=0; i<segmentStrings.length; i++) {
    const segmentString = segmentStrings[i];
    const error = validateBIP32PathSegment(segmentString);
    if (error !== '') { return error; }
  }
  return '';
}

function validateBIP32PathSegment(segmentString) {
  if (segmentString === null || segmentString === undefined || segmentString === '') {
    return "BIP32 path segment cannot be blank.";
  }
  
  let numberString, hardened;
  if (segmentString.substr(segmentString.length - 1) === "'") {
    numberString = segmentString.substr(0, segmentString.length - 1);
    hardened = true;
  } else {
    numberString = segmentString;
    hardened = false;
  }

  // We should never actually wind up throwing this error b/c of an
  // earlier check against BIP32_PATH_REGEX.
  const numberError = "Invalid BIP32 path segment.";
  let number;
  try {
    number = parseInt(numberString, 10);
  } catch(parseError) {
    // shouldn't reach here b/c we already applied a regex check
    return numberError;
  }
  if (Number.isNaN(number) || number.toString().length !== numberString.length) {
    return numberError;
  }
  if (number < 0) {
    return numberError;
  }

  if (number > (hardened ? MAX_BIP32_HARDENED_NODE_INDEX : MAX_BIP32_NODE_INDEX)) {
    return "BIP32 index is too high.";
  }

  return '';
}

/**
 * Derive a hex representation of a child public key for derivation path.
 * @param {string} extendedPublicKey - base58 encoded extended public key
 * @param {string} bip32Path - BIP32 derivation path string
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} hex string representation of the derived public key
 */
export function deriveChildPublicKey(extendedPublicKey, bip32Path, network) {
  if (bip32Path.slice(0, 2) === 'm/') {
    return deriveChildPublicKey(extendedPublicKey, bip32Path.slice(2), network);
  }
  const node = bip32.fromBase58(extendedPublicKey, networkData(network));
  const child = node.derivePath(bip32Path);
  return toHexString(child.publicKey);
}

/**
 * Derive a base58 encoded representation fo a child extended public key.
 * @param {string} extendedPublicKey - base58 encoded extended public key
 * @param {string} bip32Path - BIP32 derivation path string
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} base58 encoded representation of the derived child extended public key
 */
export function deriveChildExtendedPublicKey(extendedPublicKey, bip32Path, network) {
  if (bip32Path.slice(0, 2) === 'm/') {
    return deriveChildExtendedPublicKey(extendedPublicKey, bip32Path.slice(2), network);
  }
  const node = bip32.fromBase58(extendedPublicKey, networkData(network));
  const child = node.derivePath(bip32Path);
  return child.toBase58();
}
