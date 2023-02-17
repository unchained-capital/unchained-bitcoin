/**
 * This module provides an API around the multisig capabilities of the
 * bitcoinjs-lib library.  The API is functional but requires you
 * creating and passing around a [`Multisig`]{@link module:multisig.MULTISIG} object.
 *
 * This `Multisig` object represents the combination of:
 *
 * 1) a sequence of N public keys
 * 2) the number of required signers (M)
 * 3) the address type  (P2SH, P2SH-P2WSH, P2WSH)
 * 4) the bitcoin network
 *
 * This corresponds to a unique bitcoin multisig address.  Note that
 * since (3) & (4) can change without changing (1) & (2), different
 * `Multisig` objects (and their corresponding bitcoin addresses) can
 * have different representations but the same security rules as to
 * who can sign.
 *
 * You can create `Multisig` objects yourself using the following
 * functions:
 *
 * - `generateMultisigFromPublicKeys` which takes public keys as input
 * - `generateMultisigFromHex` which takes a redeem/witness script as input
 *
 * Once you have a `Multisig` object you can pass it around in your
 * code and then ask questions about it using the other functions
 * defined in this module.
 *
 * You can manipulate `Multisig` objects directly but it's better to
 * use the functions from API provided by this module.
 *
 * @module multisig
 * @example
 * import {
 *   generateMultisigFromPublicKeys, MAINNET, P2SH,
 *   multisigRequiredSigners, multisigTotalSigners,
 *   multisigAddressType,
 *   multisigPublicKeys,
 * } from "unchained-bitcoin";
 * const pubkey1 = "03a...";
 * const pubkey2 = "03b...";
 * // A mainnet 1-of-2 P2SH multisig
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2SH, 1, pubkey1, pubkey2);
 *
 * console.log(multisigRequiredSigners(multisig)); // 1
 * console.log(multisigTotalSigners(multisig)); // 2
 * console.log(multisigAddressType(multisig)); // "P2SH"
 * console.log(multisigPublicKeys(multisig)); // ["03a...", "03b..."]
 *
 */

import { networkData } from "./networks";
import { P2SH } from "./p2sh";
import { P2SH_P2WSH } from "./p2sh_p2wsh";
import { P2WSH } from "./p2wsh";
import { toHexString } from "./utils";

import { payments } from "bitcoinjs-lib";

/**
 * Describes the return type of several functions in the
 * `payments` module of bitcoinjs-lib.
 *
 * The following functions in this module will return objects of this
 * type:
 *
 * - `generateMultisigFromPublicKeys` which takes public keys as input
 * - `generateMultisigFromHex` which takes a redeem/witness script as input
 *
 * The remaining functions accept these objects as arguments.
 *
 * @typedef Multisig
 * @type {Object}
 * @property {string} address - The multisig address
 * @property {Object} redeem - the redeem object from p2ms
 * @property {Object} multisigBraidDetails - details about the braid (addressType, network, requiredSigners, xpubs, index)
 * @property {Object[]} getBip32Derivation - Array of objects for every key in this multisig address
 *
 */

/**
 * Enumeration of possible multisig address types ([P2SH]{@link module:p2sh.P2SH}|[P2SH_P2WSH]{@link module:p2sh_p2wsh.P2SH_P2WSH}|[P2WSH]{@link module:p2wsh.P2WSH}).
 *
 * @constant
 * @enum {string}
 * @default
 */
export const MULTISIG_ADDRESS_TYPES = {
  P2SH,
  P2SH_P2WSH,
  P2WSH,
};

/**
 * Return an M-of-N [`Multisig`]{@link module:multisig.MULTISIG}
 * object by specifying the total number of signers (M) and the public
 * keys (N total).
 *
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} addressType - address type
 * @param {number} requiredSigners - number of signers required needed to spend funds (M)
 * @param  {...string} publicKeys - list of public keys, 1 per possible signer (N)
 * @returns {Multisig} the corresponding `Multisig` object
 * @example
 * // A 2-of-3 P2SH mainnet multisig built from 3 public keys.
 * import {
 *   generateMultisigFromPublicKeys, MAINNET, P2SH, P2WSH,
 * } from "unchained-bitcoin";
 * const multisigP2SH = generateMultisigFromPublicKeys(MAINNET, P2SH, 2, "03a...", "03b...", "03c...");
 * const multisigP2WSH = generateMultisigFromPublicKeys(MAINNET, P2WSH, 2, "03a...", "03b...", "03c...");
 */
export function generateMultisigFromPublicKeys(
  network,
  addressType,
  requiredSigners,
  ...publicKeys
) {
  const multisig = payments.p2ms({
    m: requiredSigners,
    pubkeys: publicKeys.map((hex) => Buffer.from(hex, "hex")),
    network: networkData(network),
  });
  return generateMultisigFromRaw(addressType, multisig);
}

/**
 * Return an M-of-N [`Multisig`]{@link module.multisig:Multisig}
 * object by passing a script in hex.
 *
 * If the `addressType` is `P2SH` then the script hex being passed is
 * the redeem script.  If the `addressType` is P2SH-wrapped SegWit
 * (`P2SH_P2WSH`) or native SegWit (`P2WSH`) then the script hex being
 * passed is the witness script.
 *
 * In practice, the same script hex can be thought of as any of
 * several address types, depending on context.
 *
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} addressType - address type
 * @param {string} multisigScriptHex - hex representation of the redeem/witness script
 * @returns {Multisig} object for further parsing
 * @example
 * import {
 *   generateMultisigFromHex, MAINNET, P2SH, P2WSH,
 * } from "unchained-bitcoin";
 * const multisigScript = "512103a90d10bf3794352bb1fa533dbd4ea75a0ffc98e0d05124938fcc3e10cdbe1a4321030d60e8d497fa8ce59a2b3203f0e597cd0182e1fe0cc3688f73497f2e99fbf64b52ae";
 * const multisigP2SH = generateMultisigFromHex(MAINNET, P2SH, multisigScript);
 * const multisigP2WSH = generateMultisigFromHex(MAINNET, P2WSH, multisigScript);
 */
export function generateMultisigFromHex(
  network,
  addressType,
  multisigScriptHex
) {
  const multisig = payments.p2ms({
    output: Buffer.from(multisigScriptHex, "hex"),
    network: networkData(network),
  });
  return generateMultisigFromRaw(addressType, multisig);
}

/**
 * Return an M-of-N [`Multisig`]{@link module.multisig:Multisig}
 * object by passing in a raw P2MS multisig object (from bitcoinjs-lib).
 *
 * This function is only used internally, do not call it directly.
 *
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} addressType - address type
 * @param {object} multisig - P2MS multisig object
 * @returns {Multisig} object for further parsing
 * @ignore
 *
 */
export function generateMultisigFromRaw(addressType, multisig) {
  switch (addressType) {
    case P2SH:
      return payments.p2sh({ redeem: multisig });
    case P2SH_P2WSH:
      return payments.p2sh({
        redeem: payments.p2wsh({ redeem: multisig }),
      });
    case P2WSH:
      return payments.p2wsh({ redeem: multisig });
    default:
      return null;
  }
}

/**
 * Return the [address type]{@link module:multisig.MULTISIG_ADDRESS_TYPES} of the given `Multisig` object.
 *
 * @param {module:multisig.Multisig} multisig the `Multisig` object
 * @returns {module:multisig.MULTISIG_ADDRESS_TYPES|String} the address type
 * @example
 * import {
 *   multisigAddressType, P2SH, P2SH_P2WSH, P2WSH,
 * } from "unchained-bitcoin";
 * function doSomething(multisig) {
 *   switch (multisigAddressType(multisig)) {
 *   case P2SH:
 *     // handle P2SH here
 *   case P2SH_P2WSH:
 *     // handle P2SH-P2WSH here
 *   case P2WSH:
 *     // handle P2WSH here
 *   default:
 *     // shouldn't reach here
 * }
 */
export function multisigAddressType(multisig) {
  if (multisig.redeem.redeem) {
    return P2SH_P2WSH;
  } else {
    // FIXME why is multisig.witness null?
    // if (multisig.witness) {
    if (multisig.address.match(/^(tb|bc)/)) {
      return P2WSH;
    } else {
      return P2SH;
    }
  }
}

/**
 * Return the number of required signers of the given `Multisig`
 * object.
 *
 * @param {module:multisig.Multisig} multisig the `Multisig` object
 * @returns {number} number of required signers
 * @example
 * import {
 *   generateMultisigFromPublicKeys, MAINNET, P2SH,
 *   multisigRequiredSigners,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2SH, 2, "03a...", "03b...", "03c...");
 * console.log(multisigRequiredSigners(multisig)); // 2
 */
export function multisigRequiredSigners(multisig) {
  return multisigAddressType(multisig) === P2SH_P2WSH
    ? multisig.redeem.redeem.m
    : multisig.redeem.m;
}

/**
 * Return the number of total signers (public keys) of the given
 * `Multisig` object.
 *
 * @param {module:multisig.Multisig} multisig the `Multisig` object
 * @returns {number} number of total signers
 * @example
 * import {
 *   generateMultisigFromPublicKeys, MAINNET, P2SH,
 *   multisigTotalSigners,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2SH, 2, "03a...", "03b...", "03c...");
 * console.log(multisigTotalSigners(multisig)); // 3
 */
export function multisigTotalSigners(multisig) {
  return multisigAddressType(multisig) === P2SH_P2WSH
    ? multisig.redeem.redeem.n
    : multisig.redeem.n;
}

/**
 * Return the multisig script for the given `Multisig` object.
 *
 * If the address type of the given multisig object is P2SH, the
 * redeem script will be returned.  Otherwise, the witness script will
 * be returned.
 *
 * @param {module:multisig.Multisig} multisig the `Multisig` object
 * @returns {Multisig|null} the corresponding script
 * @example
 * import {
 *   generateMultisigFromPublicKeys, MAINNET, P2SH,
 *   multisigScript,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2SH, 2, "03a...", "03b...", "03c...");
 * console.log(multisigScript(multisig));
 */
export function multisigScript(multisig) {
  switch (multisigAddressType(multisig)) {
    case P2SH:
      return multisigRedeemScript(multisig);
    case P2SH_P2WSH:
      return multisigWitnessScript(multisig);
    case P2WSH:
      return multisigWitnessScript(multisig);
    default:
      /* istanbul ignore next */
      // multisigAddressType only returns one of the 3 above choices
      return null;
  }
}

/**
 * Return the redeem script for the given `Multisig` object.
 *
 * If the address type of the given multisig object is P2WSH, this
 * will return null.
 *
 * @param {module:multisig.Multisig} multisig the `Multisig` object
 * @returns {Multisig|null} the redeem script
 * @example
 * import {
 *   generateMultisigFromPublicKeys, MAINNET, P2SH,
 *   multisigRedeemScript,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2SH, 2, "03a...", "03b...", "03c...");
 * console.log(multisigRedeemScript(multisig));
 */
export function multisigRedeemScript(multisig) {
  switch (multisigAddressType(multisig)) {
    case P2SH:
      return multisig.redeem;
    case P2SH_P2WSH:
      return multisig.redeem;
    case P2WSH:
      return null;
    default:
      /* istanbul ignore next */
      // multisigAddressType only returns one of the 3 above choices
      return null;
  }
}

/**
 * Return the witness script for the given `Multisig` object.
 *
 * If the address type of the given multisig object is P2SH, this will
 * return null.
 *
 * @param {module:multisig.Multisig} multisig the `Multisig` object
 * @returns {Multisig|null} the witness script
 * @example
 * import {
 *   generateMultisigFromPublicKeys, MAINNET, P2WSH,
 *   multisigWitnessScript,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2WSH, 2, "03a...", "03b...", "03c...");
 * console.log(multisigWitnessScript(multisig));
 */
export function multisigWitnessScript(multisig) {
  switch (multisigAddressType(multisig)) {
    case P2SH:
      return null;
    case P2SH_P2WSH:
      return multisig.redeem.redeem;
    case P2WSH:
      return multisig.redeem;
    default:
      /* istanbul ignore next */
      // multisigAddressType only returns one of the 3 above choices
      return null;
  }
}

/**
 * Return the (compressed) public keys in hex for the given `Multisig`
 * object.
 *
 * The public keys are in the order used in the corresponding
 * redeem/witness script.
 *
 * @param {module:multisig.Multisig} multisig the `Multisig` object
 * @returns {string[]} (compressed) public keys in hex
 * @example
 * import {
 *   generateMultisigFromPublicKeys, MAINNET, P2WSH,
 *   multisigPublicKeys,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2WSH, 2, "03a...", "03b...", "03c...");
 * console.log(multisigPublicKeys(multisig)); // ["03a...", "03b...", "03c..."]
 *
 */
export function multisigPublicKeys(multisig) {
  return (
    multisigAddressType(multisig) === P2SH
      ? multisigRedeemScript(multisig)
      : multisigWitnessScript(multisig)
  ).pubkeys.map(toHexString);
}

/**
 * Return the address for a given `Multisig` object.
 *
 * @param {module:multisig.Multisig} multisig the `Multisig` object
 * @returns {string} the address
 * @example
 * import {
 *   generateMultisigFromPublicKeys, MAINNET, P2SH,
 *   multisigAddress,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2SH, 2, "03a...", "03b...", "03c...");
 * console.log(multisigAddress(multisig)); // "3j..."
 *
 */
export function multisigAddress(multisig) {
  return multisig.address;
}

/**
 * Return the braid details (if known) for a given `Multisig` object.
 *
 * @param {module:multisig.Multisig} multisig the `Multisig` object
 * @returns {string} the braid details
 * @example
 * import {
 *   generateBraidFromExtendedPublicKeys,
 *   generateMultisigFromPublicKeys, MAINNET, P2SH,
 *   braidConfig,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2SH, 2, "03a...", "03b...", "03c...");
 * console.log(multisigBraidDetails(multisig)); // null, unknown
 *
 * const braid = generateBraidFromExtenedPublicKeys(MAINNET, P2SH, {{'xpub...', bip32path: "m/45'/0'/0'"}, {'xpub...', bip32path: "m/45'/0/0"}, {'xpub...', bip32path: "m/45'/0/0"}}, 2);
 * const multisig = braid.deriveMultisigByPath("0/0");
 * console.log(multisigBraidDetails(multisig)); // {network: mainnet, addressType: p2sh, extendedPublicKeys: {...}, requiredSigners: 2}}
 */
export function multisigBraidDetails(multisig) {
  return multisig.braidDetails ? multisig.braidDetails : null;
}
