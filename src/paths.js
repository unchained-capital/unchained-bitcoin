/**
 * This module contains various utility functions for converting and
 * validating BIP32 derivation paths.
 * 
 * @module paths
 */

import {MAINNET} from "./networks";
import {P2SH} from "./p2sh";
import {P2SH_P2WSH} from "./p2sh_p2wsh";
import {P2WSH} from "./p2wsh";

const HARDENING_OFFSET = Math.pow(2, 31);

const BIP32_PATH_REGEX = /^(m\/)?(\d+'?\/)*\d+'?$/;
const BIP32_HARDENED_PATH_REGEX = /^(m\/)?(\d+'\/)*\d+'$/;
const BIP32_UNHARDENED_PATH_REGEX = /^(m\/)?(\d+\/)*\d+$/;
const MAX_BIP32_HARDENED_NODE_INDEX = Math.pow(2, 31) - 1;
const MAX_BIP32_NODE_INDEX = Math.pow(2, 32) - 1;

/**
 * Return the hardened version of the given BIP32 index.
 *
 * Hardening is equivalent to adding 2^31.
 * 
 * @param {string|number} index - BIP32 index
 * @returns {number} the hardened index
 * @example
 * import {hardenedBIP32Index} from "unchained-bitcoin";
 * console.log(hardenedBIP32Index(44); // 2147483692
 */
export function hardenedBIP32Index(index) {
  return parseInt(index, 10) + HARDENING_OFFSET;
}

/**
 * Convert BIP32 derivation path to an array of integer values
 * representing the corresponding derivation indices.
 *
 * Hardened path segments will have the [hardening offset]{@link module:paths.HARDENING_OFFSET} added to the index.
 * 
 * @param {string} pathString - BIP32 derivation path string
 * @returns {number[]} the derivation indices
 * @example
 * import {bip32PathToSequence} from "unchained-bitcoin";
 * console.log(bip32PathToSequence("m/45'/1/99")); // [2147483693, 1, 99]
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
 * Convert a sequence of derivation indices into the corresponding
 * BIP32 derivation path.
 *
 * Indices above the [hardening offset]{@link * module:paths.HARDENING_OFFSET} will be represented wiith hardened * path segments (using a trailing single-quote).
 * 
 * @param {number[]} sequence - the derivation indices
 * @returns {string} BIP32 derivation path
 * @example
 * import {bip32SequenceToPath} from "unchained-bitcoin";
 * console.log(bip32SequenceToPath([2147483693, 1, 99])); // m/45'/1/99
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
 * Validate a given BIP32 derivation path string.
 *
 * - Path segments are validated numerically as well as statically
 *   (the value of 2^33 is an invalid path segment).
 * 
 * - The `mode` option can be pass to validate fully `hardened` or
 *   `unhardened` paths.
 * 
 * @param {string} pathString - BIP32 derivation path string
 * @param {Object} [options] - additional options
 * @param {string} [options.mode] - "hardened" or "unhardened"
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {validateBIP32Path} from "unchained-bitcoin";
 * console.log(validateBIP32Path("")); // "BIP32 path cannot be blank."
 * console.log(validateBIP32Path("foo")); // "BIP32 path is invalid."
 * console.log(validateBIP32Path("//45")); // "BIP32 path is invalid."
 * console.log(validateBIP32Path("/45/")); // "BIP32 path is invalid."
 * console.log(validateBIP32Path("/45''")); // "BIP32 path is invalid."
 * console.log(validateBIP32Path('/45"')); // "BIP32 path is invalid."
 * console.log(validateBIP32Path("/-45")); // "BIP32 path is invalid."
 * console.log(validateBIP32Path("/8589934592")); // "BIP32 index is too high."
 * console.log(validateBIP32Path("/45")); // ""
 * console.log(validateBIP32Path("/45/0'")); // ""
 * console.log(validateBIP32Path("/45/0'", {mode: "hardened")); // "BIP32 path must be fully-hardened."
 * console.log(validateBIP32Path("/45'/0'", {mode: "hardened")); // ""
 * console.log(validateBIP32Path("/0'/0", {mode: "unhardened")); // "BIP32 path cannot include hardened segments."
 * console.log(validateBIP32Path("/0/0", {mode: "unhardened")); // ""
 */
export function validateBIP32Path(pathString, options) {
  if (pathString === null || pathString === undefined || pathString === '') {
    return "BIP32 path cannot be blank.";
  }

  if (!pathString.match(BIP32_PATH_REGEX)) {
    return "BIP32 path is invalid.";
  }

  if (options && options.mode === 'hardened') {
    if (!pathString.match(BIP32_HARDENED_PATH_REGEX)) {
      return "BIP32 path must be fully-hardened.";
    }
  }

  if (options && options.mode === 'unhardened') {
    if (!pathString.match(BIP32_UNHARDENED_PATH_REGEX)) {
      return "BIP32 path cannot include hardened segments.";
    }
  }

  const segmentStrings = pathString.toLowerCase().split('/');

  return validateBIP32PathSegments(segmentStrings.slice(1));
}

function validateBIP32PathSegments(segmentStrings) {
  for (let i = 0; i < segmentStrings.length; i++) {
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
  } catch (parseError) {
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
 * Return the default BIP32 root derivation path for the given
 * `addressType` and `network`.
 *
 * - Mainnet:
 *   - P2SH: m/45'/0'/0'
 *   - P2SH-P2WSH: m/48'/0'/0'/1'
 *   - P2WSH: m/48'/0'/0'/2'
 * - Testnet:
 *   - P2SH: m/45'/1'/0'
 *   - P2SH-P2WSH: m/48'/1'/0'/1'
 *   - P2WSH: m/48'/1'/0'/2'
 * 
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} addressType - address type
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} derivation path
 * @example
 * import {multisigBIP32Root} from "unchained-bitcoin";
 * console.log(multisigBIP32Root(P2SH, MAINNET)); // m/45'/0'/0'
 * console.log(multisigBIP32Root(P2SH_P2WSH, TESTNET); // m/48'/1'/0'/1'
 */
export function multisigBIP32Root(addressType, network) {
  const coinPath = (network === MAINNET ? "0'" : "1'");
  switch (addressType) {
  case P2SH:
    return `m/45'/${coinPath}/0'`;
  case P2SH_P2WSH:
    return `m/48'/${coinPath}/0'/1'`;
  case P2WSH:
    return `m/48'/${coinPath}/0'/2'`;
  default:
    return null;
  }
}

/**
 * Returns a BIP32 path at the given `relativePath` under the default
 * BIP32 root path for the given `addressType` and `network`.
 * 
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} addressType - type from which to calculate BIP32 root path
 * @param {module:networks.NETWORKS} network - bitcoin network from which to calculate BIP32 root path
 * @param {number|string} relativePath - the relative BIP32 path (no leading `/`)
 * @returns {string} child BIP32 path
 * @example
 * import {multisigBIP32Path} from "unchained-bitcoin";
 * console.log(multisigBIP32Path(P2SH, MAINNET, 0); // m/45'/0'/0'/0
 * console.log(multisigBIP32Path(P2SH_P2WSH, TESTNET, "3'/4"); // m/48'/1'/0'/1'/3'/4"
 */
export function multisigBIP32Path(addressType, network, relativePath) {
  const root = multisigBIP32Root(addressType, network);
  if (root) {
    return root + `/${relativePath || "0"}`;
  }
  return null;
}

/**
 * Get the path of the parent of the given path
 * @param {string} bip32Path e.g. "m/45'/0'/0'/0"
 * @returns {string} parent path
 * @example
 * import {getParentPath} from "unchained-bitcoin";
 * console.log(getParentPath("m/45'/0'/0'/0"); // m/45'/0'/0'
 */
export function getParentPath(bip32Path) {
  // first validate the input
  let validated = validateBIP32Path(bip32Path)
  if (validated.length) return validated
  // then slice off then last item in the path
  return bip32Path.split("/").slice(0, -1).join("/");
}