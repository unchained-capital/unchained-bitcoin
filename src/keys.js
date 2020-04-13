/**
 * This module provides functions for validating & deriving public
 * keys and extended public keys.
 *
 * @module keys
 */

import {ECPair} from "bitcoinjs-lib";
import bip32 from "bip32";
import bs58check from 'bs58check'

import {validateHex, toHexString, hash160} from "./utils";
import {bip32PathToSequence} from "./paths"
import {TESTNET, networkData, MAINNET} from "./networks";

export const EXTENDED_PUBLIC_KEY_VERSIONS = {
  xpub: "0488b21e",
  ypub: "049d7cb2",
  zpub: "04b24746",
  Ypub: "0295b43f",
  Zpub: "02aa7ed3",
  tpub: "043587cf",
  upub: "044a5262",
  vpub: "045f1cf6",
  Upub: "024289ef",
  Vpub: "02575483"
}

/**
 * Validate whether or not a string is a valid extended public key prefix
 * @param {string} prefix string to be tested
 * @returns {null} returns null if valid
 * @throws Error with message indicating the invalid prefix.
 */
export function validatePrefix(prefix) {
  if (!EXTENDED_PUBLIC_KEY_VERSIONS[prefix]) throw new Error(`Invalid prefix "${prefix}" for extended public key.`);
  return null;
}

/**
 * Convert an extended public key between formats
 * @param {string} extendedPublicKey - the extended public key to convert
 * @param {string} targetPrefix - the target format to convert to
 * @example
 * import {convertExtendedPublicKey} from "unchained-bitcoin";
 * const tpub = convertExtendedPublicKey("xpub6CCH...", "tpub");
 * console.log(tpub.extendedPublicKey, tpub.message)
 * // tpubDCZv...
 * @returns {(string|object)} converted extended public key or error object
 * with the failed key and error message
 */
export function convertExtendedPublicKey(extendedPublicKey, targetPrefix) {
  try {
    const sourcePrefix = extendedPublicKey.slice(0, 4);
    validatePrefix(targetPrefix)
    validatePrefix(sourcePrefix)
    const decodedExtendedPublicKey = bs58check.decode(extendedPublicKey.trim());
    const extendedPublicKeyNoPrefix = decodedExtendedPublicKey.slice(4);
    const extendedPublicKeyNewPrefix = Buffer.concat(
      [Buffer.from(EXTENDED_PUBLIC_KEY_VERSIONS[targetPrefix],'hex'), 
      extendedPublicKeyNoPrefix]
    );
    return bs58check.encode(extendedPublicKeyNewPrefix)
  } catch (err) {
    throw new Error("Unable to convert extended public key: "+err.message)
  }
}


/**
 * Check to see if an extended public key is of the correct prefix for the network
 * this can be used in conjuction with convertExtendedPublicKey to attempt to automatically convert
 * @param {string} extendedPublicKey - the extended public key to check
 * @param {string} network - thie bitcoin network
 * @example
 * import {validateExtendedPublicKeyForNetwork} from "unchained-bitcoin";
 * console.log(validateExtendedPublicKeyForNetwork('xpub...', MAINNET)) // empty
 * console.log(validateExtendedPublicKeyForNetwork('tpub...', MAINNET)) // "Extended public key must begin with ...."
 * @returns {string} a validation message or empty if valid
 */
export function validateExtendedPublicKeyForNetwork(extendedPublicKey, network) {
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

/**
 * Check if a given pubkey is compressed or not by checking its length
 * and the possible prefixes
 * @param {string | Buffer} _pubkey pubkey to check
 * @returns {boolean} true if compressed, otherwise false
 * @example
 * import {isKeyCompressed} from "unchained-bitcoin"
 * const uncompressed = "0487cb4929c287665fbda011b1afbebb0e691a5ee11ee9a561fcd6adba266afe03f7c55f784242305cfd8252076d038b0f3c92836754308d06b097d11e37bc0907"
 * const compressed = "0387cb4929c287665fbda011b1afbebb0e691a5ee11ee9a561fcd6adba266afe03"
 * console.log(isKeyCompressed(uncompressed)) // false
 * console.log(isKeyCompressed(compressed)) // true
 */
export function isKeyCompressed(_pubkey) {
  let pubkey = _pubkey
  if (!Buffer.isBuffer(_pubkey)) pubkey = Buffer.from(_pubkey, 'hex')

  if (pubkey.length === 33 && (pubkey[0] === 2 || pubkey[0] === 3)) return true
  return false
}

/**
 * Get fingerprint for a given pubkey. This is useful for generating xpubs
 * which need the fingerprint of the parent pubkey. If not a compressed key
 * then this function will attempt to compress it.
 * @param {string} _pubkey - pubkey to derive fingerprint from
 * @returns {string} fingerprint
 * @example
 * import {getFingerprintFromPublicKey, compressPublicKey} from "unchained-bitcoin"
 * const pubkey = "03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee"
 * console.log(getFingerprintFromPublicKey(pubkey)) // 2213579839
 */
export function getFingerprintFromPublicKey(_pubkey) {
  let pubkey = _pubkey
  // compress the key if it is not compressed
  if (!isKeyCompressed(_pubkey)) {
    pubkey = compressPublicKey(_pubkey) 
  }
  const pubkeyBuffer = Buffer.from(pubkey, 'hex')
  const hash = hash160(pubkeyBuffer)
  return ((hash[0] << 24) | (hash[1] << 16) | (hash[2] << 8) | hash[3]) >>> 0;
}

/**
 * Derive base58 encoded xpub given known information about
 * BIP32 Wallet Node
 * @param {string} bip32Path e.g. m/45'/0'/0
 * @param {string} _pubkey pubkey to derive from 
 * @param {string} chaincode chaincode corresponding to pubkey and path
 * @param {string} fingerprint - fingerprint of parent public key
 * @param {string} network - mainnet or testnet
 * @returns {string} base58 encoded extended public key (xpub or tpub)
 */
export function deriveExtendedPublicKey(bip32Path, _pubkey, chaincode, fingerprint, network = MAINNET) {
  let pubkey = _pubkey
  if (!isKeyCompressed(pubkey)) pubkey = compressPublicKey(_pubkey)
  
  // get the hd wallet node and fill in missing properties
  const node = bip32.fromPublicKey(Buffer.from(pubkey, 'hex'),
    Buffer.from(chaincode, 'hex'), networkData(network));
  
   // extended key fingerprint is from the parent pubkey
  node.parentFingerprint = fingerprint
  node.depth = bip32Path.split("/").length - 1;
  const sequence = bip32PathToSequence(bip32Path);
  node.index = sequence.slice(-1)[0];
  node.path = bip32Path;
  return node.toBase58()
}