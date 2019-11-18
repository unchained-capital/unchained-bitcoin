/**
 * This module a message signature validation function that also exposes the public key used to sign
 * the message.
 *
 * bitcoinjs-message does not export a way to extract the
 * public key from a signed message, even though it obtains
 * the public key during the regular course of events of
 * verifying a signature. Several of the following definitions
 * are lifted verbatim from that module to support the verify
 * implementation below that DOES expose the public key.

 * @module message
 */

import {ECPair, payments, address, networks} from "bitcoinjs-lib";
import {magicHash} from 'bitcoinjs-message';
import createHash from 'create-hash';
import bs58check from 'bs58check';
import bufferEquals from 'buffer-equals';
import bech32 from 'bech32';
import secp256k1 from 'secp256k1';

const toOutputScript = address.toOutputScript;
const base64re=/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

const SEGWIT_TYPES = {
  P2WPKH: 'p2wpkh',
  P2SH_P2WPKH: 'p2sh(p2wpkh)'
};

function sha256 (b) {
  return createHash('sha256')
    .update(b)
    .digest();
}

function hash160 (buffer) {
  return createHash('ripemd160')
    .update(sha256(buffer))
    .digest();
}

function decodeSignature (buffer) {
  if (buffer.length !== 65) throw new Error('Invalid signature length')

  const flagByte = buffer.readUInt8(0) - 27;
  if (flagByte > 15 || flagByte < 0) {
    throw new Error('Invalid signature parameter');
  }

  return {
    compressed: !!(flagByte & 12),
    segwitType: !(flagByte & 8)
      ? null
      : !(flagByte & 4)
        ? SEGWIT_TYPES.P2SH_P2WPKH
        : SEGWIT_TYPES.P2WPKH,
    recovery: flagByte & 3,
    signature: buffer.slice(1)
  };
}


/**
 * Check to see if a message was signed by the pubkey associated
 * with a given address, and return the pubkey if it was.
 * @param {string} message - message signed
 * @param {string} address - address associated with the private key that signed the message
 * @param {string} signature - base64 encoded bitcoin message signature
 * @returns hex encoded public key if the signature is valid, null otherwise
 */
export function verifyPublicKey(message, address, signature, messagePrefix) {
  if (!Buffer.isBuffer(signature)) signature = Buffer.from(signature, 'base64')

  const parsed = decodeSignature(signature);
  const hash = magicHash(message, messagePrefix);
  const publicKey = secp256k1.recover(
    hash,
    parsed.signature,
    parsed.recovery,
    parsed.compressed
  );
  const publicKeyHash = hash160(publicKey)
  let actual, expected;

  if (parsed.segwitType) {
    if (parsed.segwitType === SEGWIT_TYPES.P2SH_P2WPKH) {
      const redeemScript = Buffer.concat([
        Buffer.from('0014', 'hex'),
        publicKeyHash
      ]);
      const redeemScriptHash = hash160(redeemScript)
      actual = redeemScriptHash;
      expected = bs58check.decode(address).slice(1);
    } else if (parsed.segwitType === SEGWIT_TYPES.P2WPKH) {
      const result = bech32.decode(address);
      const data = bech32.fromWords(result.words.slice(1));
      actual = publicKeyHash;
      expected = Buffer.from(data);
    }
  } else {
    actual = publicKeyHash
    expected = bs58check.decode(address).slice(1);
  }

  if(bufferEquals(actual, expected)) {
  	return publicKey.toString('hex');
  } else {
    return null;
  }
}

