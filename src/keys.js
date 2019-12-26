/**
 * This module provides functions for validating & deriving public
 * keys and extended public keys.
 *
 * @module keys
 */

import {ECPair} from "bitcoinjs-lib";

import {validateHex, toHexString} from "./utils";
import {TESTNET, networkData} from "./networks";

const bip32 = require('bip32');
const bs58check = require('bs58check');

export const extendedPublicKeyVersions = {
  xpub: "0488b21e",
  ypub: "049d7cb2",
  zpub: "04b2430c",
  Ypub: "0295b43f",
  Zpub: "02aa7ed3",
  tpub: "043587cf",
  upub: "044a5262",
  vpub: "045f1cf6",
  Upub: "024289ef",
  Vpub: "02575483"
}

function validatePrefix(prefix, prefixType) {
  if (!~Object.keys(extendedPublicKeyVersions).indexOf(prefix)) {
    return `Invalid ${prefixType} version for extended public key conversion`;
  }
  return null;
}

/**
 * Convert an extended public key between formats
 * @param {string} extendedPublicKey - the extended public key to convert
 * @param {string} targetPrefix - the target format to convert to
 * @example
 * const tpub = extendedPublicKeyConvert("xpub6CCH...", "tpub");
 * if (tpub.error) {
 *   // handle
 * } else if (tpub.message === '') {
 *   // no conversion was needed
 * } else {
 *   console.log(tpub.extendedPublicKey, tpub.message)
 *   // tpubDCZv...
 *   // Your extended public key has been converted from xpub to tpub
 * }
 * @returns {module:keys.ConvertedExtendedPublicKey}
 */
export function extendedPublicKeyConvert(extendedPublicKey, targetPrefix) {
  const targetError = validatePrefix(targetPrefix, 'target')
  if (targetError !== null) return {extendedPublicKey, error:targetError};

  const sourcePrefix = extendedPublicKey.slice(0, 4);
  const sourceError = validatePrefix(sourcePrefix, 'source')
  if (sourceError !== null) return {extendedPublicKey, error:sourceError};

  try {
    const decodedExtendedPublicKey = bs58check.decode(extendedPublicKey.trim());
    const extendedPublicKeyNoPrefix = decodedExtendedPublicKey.slice(4);
    const extendedPublicKeyNewPrefix = Buffer.concat([Buffer.from(extendedPublicKeyVersions[targetPrefix],'hex'), extendedPublicKeyNoPrefix]);
    return {
      extendedPublicKey: bs58check.encode(extendedPublicKeyNewPrefix),
      message: `Your extended public key has been converted from ${sourcePrefix} to ${targetPrefix}`,
      error: ""
    }
  } catch (err) {
    return {
      extendedPublicKey,
      error: "Unable to convert extended public key: "+err.message
    };
  }
}

/**
 * Perform conversion to xpub or tpub based on the bitcoin network
 * additional validation is performed on the converted extended public key
 * @param {string} extendedPublicKey - the extended public key to convert
 * @param {string} network - the bitcoin network
 * @example
 * const xpub = convertAndValidateExtendedPublicKey('tpubDCZv...', MAINNET)
 * if (xpub.error) {
 *   // handle
 * } else if (xpub.message === '') {
 *   // no conversion was needed
 * } else {
 *   console.log(xpub.extendedPublicKey, xpub.message)
 *   // tpubDCZv...
 *   // Your extended public key has been converted from tpub to xpub
 * }
 * @returns {module:keys.ConvertedExtendedPublicKey}
 */
export function convertAndValidateExtendedPublicKey(extendedPublicKey, network) {
  const targetPrefix = network === TESTNET ? 'tpub' : 'xpub'
  const preliminaryErrors = preExtendedPublicKeyValidation(extendedPublicKey, network);
  if (preliminaryErrors !== '') {
    return {extendedPublicKey, error: preliminaryErrors};
  } else {
    const networkError = extendedPublicKeyNetworkValidateion(extendedPublicKey, network)
    if (networkError === '') {
      const extendedPublicKeyValidation = validateExtendedPublicKey(extendedPublicKey, network);
      if (extendedPublicKeyValidation === '')
        return {extendedPublicKey, message:"", error: ""}; // valid for network, use it
      // else convert and validate below
    }
  }

  const convertedExtendedPublicKey = extendedPublicKeyConvert(extendedPublicKey, targetPrefix);
  if (convertedExtendedPublicKey.extendedPublicKey !== extendedPublicKey) { // a conversion happended
    const extendedPublicKeyValidation = validateExtendedPublicKey(convertedExtendedPublicKey.extendedPublicKey, network);
    if (extendedPublicKeyValidation === '') return convertedExtendedPublicKey;
    else return {extendedPublicKey, error: extendedPublicKeyValidation}
  } else return convertedExtendedPublicKey;

}

function extendedPublicKeyNetworkValidateion(extendedPublicKey, network) {
  let requiredPrefix = "'xpub'";
  if (network === TESTNET) {
    requiredPrefix += " or 'tpub'";
  }
  const notXpubError = `Extended public key must begin with ${requiredPrefix}.`;
  const prefix = extendedPublicKey.slice(0, 4);
  if (! (prefix === 'xpub' || (network === TESTNET && prefix === 'tpub'))) {
    return notXpubError;
  }
  return '';
}

function preExtendedPublicKeyValidation(extendedPublicKey, network) {
  if (extendedPublicKey === null || extendedPublicKey === undefined || extendedPublicKey === '') {
    return "Extended public key cannot be blank.";
  }

  if (extendedPublicKey.length < 111) {
    return "Extended public key length is too short.";
  }

  return '';

}

/**
 * Validate the given extended public key.
 *
 * - Must start with the appropriate (network-dependent) prefix.
 * - Must be a valid BIP32 extended public key
 *
 * @param {string} xpubString - base58 encoded extended public key (`xpub...`)
 * @param {module:networks.NETWORKS} network  - bitcoin network
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {validateExtendedPublicKey} from "unchained-bitcoin";
 * console.log(validateExtendedPublicKey("", MAINNET)); // "Extended public key cannot be blank."
 * console.log(validateExtendedPublicKey("foo", MAINNET)); // "Extended public key must begin with ..."
 * console.log(validateExtendedPublicKey("xpub123", MAINNET)); // "Extended public key is too short."
 * console.log(validateExtendedPublicKey("tpub123...", MAINNET)); // "Extended public key must begin with ...."
 * console.log(validateExtendedPublicKey("xpub123%%!~~...", MAINNET)); // "Invalid extended public key"
 * console.log(validateExtendedPublicKey("xpub123...", MAINNET)); // ""
 */
export function validateExtendedPublicKey(xpubString, network) {
  if (xpubString === null || xpubString === undefined || xpubString === '') {
    return "Extended public key cannot be blank.";
  }

  const requiredPrefix = (network === TESTNET ? "tpub": "xpub");
  const notXpubError = `Extended public key must begin with '${requiredPrefix}'.`;

  if (xpubString.length < 4) {
    return notXpubError;
  }

  const prefix = xpubString.slice(0, 4);
  if (prefix !== requiredPrefix) {
    return notXpubError;
  }

  if (xpubString.length < 111) {
    return "Extended public key is too short.";
  }

  try {
    bip32.fromBase58(xpubString, networkData(network));
  } catch (e) {
    return "Invalid extended public key.";
  }

  return '';

}

/**
 * Validate the given public key.
 *
 * - Must be valid hex.
 * - Must be a valid BIP32 public key.
 *
 * @param {string} pubkeyHex - (compressed) public key in hex
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {validatePublicKey} from "unchained-bitcoin";
 * console.log(validatePublicKey("")); // "Public key cannot be blank."
 * console.log(validatePublicKey("zzzz")); // "Invalid hex..."
 * console.log(validatePublicKey("deadbeef")); // "Invalid public key."
 * console.log(validatePublicKey("03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee")); // ""
 */
export function validatePublicKey(pubkeyHex) {
  if (pubkeyHex === null || pubkeyHex === undefined || pubkeyHex === '') {
    return "Public key cannot be blank.";
  }

  const error = validateHex(pubkeyHex);
  if (error !== '') { return error; }

  try {
    ECPair.fromPublicKey(Buffer.from(pubkeyHex, 'hex'));
  } catch (e) {
    return "Invalid public key.";
  }

  return '';
}

/**
 * Compresses the given public key.
 *
 * @param {string} publicKey - (uncompressed) public key in hex
 * @returns {string} compressed public key in hex
 * @example
 * import {compressPublicKey} from "unchained-bitcoin";
 * console.log(compressPublicKey("04b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee6e43c09d025c2ad322382347ec0f69b4e78d8e23c8ff9aa0dd0cb93665ae83d5"));
 * // "03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee"
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


/**
 * Return the public key at the given BIP32 path below the given
 * extended public key.
 *
 * @param {string} extendedPublicKey - base58 encoded extended public key (`xpub...`)
 * @param {string} bip32Path - BIP32 derivation path string (with or without initial `m/`)
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} (compressed) child public key in hex
 * @example
 * import {deriveChildPublicKey, MAINNET} from "unchained-bitcoin";
 * const xpub = "xpub6CCHViYn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab";
 * console.log(deriveChildPublicKey(xpub, "m/0/0", MAINNET));
 * // "021a0b6eb37bd9d2767a364601e41635a11c1dbbbb601efab8406281e210336ace"
 * console.log(deriveChildPublicKey(xpub, "0/0", MAINNET)); // w/o leading `m/`
 * // "021a0b6eb37bd9d2767a364601e41635a11c1dbbbb601efab8406281e210336ace"
 *
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
 * Return the extended public key at the given BIP32 path below the
 * given extended public key.
 *
 * @param {string} extendedPublicKey - base58 encoded extended public key (`xpub...`)
 * @param {string} bip32Path - BIP32 derivation path string (with or without initial `m/`)
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} child extended public key in base58
 * @example
 * import {deriveChildExtendedPublicKey, MAINNET} from "unchained-bitcoin";
 * const xpub = "xpub6CCHViYn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab";
 * console.log(deriveChildExtendedPublicKey(xpub, "m/0/0", MAINNET));
 * // "xpub6GYTTMaaN8bSEhicdKq7ji9H7B2SL4un33obThv9aekop4J7L7B3snYMnJUuwXJiUmsbSVSyZydbqLC97JMWnj3R4MHz6JNunMJhjEBKovS"
 * console.log(deriveChildExtendedPublicKey(xpub, "0/0", MAINNET)); // without initial `m/`
 * // "xpub6GYTTMaaN8bSEhicdKq7ji9H7B2SL4un33obThv9aekop4J7L7B3snYMnJUuwXJiUmsbSVSyZydbqLC97JMWnj3R4MHz6JNunMJhjEBKovS"

 */
export function deriveChildExtendedPublicKey(extendedPublicKey, bip32Path, network) {
  if (bip32Path.slice(0, 2) === 'm/') {
    return deriveChildExtendedPublicKey(extendedPublicKey, bip32Path.slice(2), network);
  }
  const node = bip32.fromBase58(extendedPublicKey, networkData(network));
  const child = node.derivePath(bip32Path);
  return child.toBase58();
}
