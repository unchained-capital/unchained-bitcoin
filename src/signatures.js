/**
 * This module provides functions for validating and handling
 * multisig transaction signatures.
 * 
 * @module signatures
 */

import BigNumber from 'bignumber.js';
import bip66 from "bip66";

import {P2SH_P2WSH} from "./p2sh_p2wsh";
import {P2WSH} from "./p2wsh";
import {
  multisigAddressType,
  multisigRedeemScript,
  multisigWitnessScript,
  multisigPublicKeys,
  multisigTotalSigners,
} from "./multisig";
import {
  unsignedMultisigTransaction,
} from "./transactions";

const bitcoin = require('bitcoinjs-lib');

/**
 * Validate a multisig signature for given input and public key.
 * 
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {module:inputs.MultisigTransactionInput[]} inputs - multisig transaction inputs
 * @param {module:outputs.TransactionOutput[]} outputs - transaction outputs
 * @param {number} inputIndex - the index where the input appears in the transaction
 * @param {string} inputSignature - signature to validate
 * @returns {string|boolean} false if invalid or corresponding public key
 * @example
 * import {
 *   generateMultisigFromPublicKeys, TESTNET, P2SH,
 *   unsignedMultisigTransaction,
 *   validateMultisigSignature,
 * } from "unchained-bitcoin";
 * const pubkey1 = "03a...";
 * const pubkey2 = "03b...";
 * const multisig = generateMultisigFromPublicKeys(TESTNET, P2SH, 2, pubkey1, pubkey2);
 * const inputs = [
 *   {
 *     txid: "ae...",
 *     index: 0,
 *     multisig,
 *   },
 *   // other inputs...
 * ];
 * const outputs = [
 *   {
 *     address: "2N...",
 *     amountSats: 90000,
 *   },
 *   // other outputs...
 * ];
 * const unsignedTransaction = unsignedMultisigTransaction(TESTNET, inputs, outputs);
 * // Use unsignedTransaction to obtain a signature.
 * const transactionSignature = ["304...", // other input signatures...];
 * // Validate signature for input 0
 * const result = validateMultisigSignature(TESTNET, inputs, outputs, 0, transactionSignature[0]);
 * switch (result) {
 *   case false:
 *     // signature was invalid
 *   case pubkey1:
 *     // signature was valid for pubkey1
 *   case pubkey2:
 *     // signature was valid for pubkey2
 *   default:
 *     // ...
 * }
 */
export function validateMultisigSignature(network, inputs, outputs, inputIndex, inputSignature) {
  const hash = multisigSignatureHash(network, inputs, outputs, inputIndex);
  const signatureBuffer = multisigSignatureBuffer(signatureNoSighashType(inputSignature));
  const input = inputs[inputIndex];
  const publicKeys = multisigPublicKeys(input.multisig);
  for (let publicKeyIndex=0; publicKeyIndex < multisigTotalSigners(input.multisig); publicKeyIndex++) {
    const publicKey = publicKeys[publicKeyIndex];
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    const keyPair = bitcoin.ECPair.fromPublicKey(publicKeyBuffer);
    if (keyPair.verify(hash, signatureBuffer)) {
      return publicKey;
    }
  }
  return false;
}

export function signatureNoSighashType(signature) {
  const len = parseInt(signature.slice(2,4), 16);
  if (len === (signature.length - 4) / 2) return signature;
  else return signature.slice(0, -2);
}

function multisigSignatureHash(network, inputs, outputs, inputIndex) {
  const unsignedTransaction = unsignedMultisigTransaction(network, inputs, outputs);
  const input = inputs[inputIndex];
  if (multisigAddressType(input.multisig) === P2WSH || multisigAddressType(input.multisig) === P2SH_P2WSH) {
    return unsignedTransaction.hashForWitnessV0(inputIndex, multisigWitnessScript(input.multisig).output, BigNumber(input.amountSats).toNumber(), bitcoin.Transaction.SIGHASH_ALL);
  } else {
    return unsignedTransaction.hashForSignature(inputIndex, multisigRedeemScript(input.multisig).output, bitcoin.Transaction.SIGHASH_ALL);
  }
}

function multisigSignatureBuffer(signature) {
  const encodedSignerInputSignatureBuffer = Buffer.from(signature, 'hex');
  const decodedSignerInputSignatureBuffer = bip66.decode(encodedSignerInputSignatureBuffer);
  const {r, s} = decodedSignerInputSignatureBuffer;
  // Ignore the leading 0 if r is 33 bytes
  let rToUse = r;
  if (r.byteLength > 32) {
    rToUse = r.slice(1);
  }

  const signatureBuffer = Buffer.alloc(64);
  signatureBuffer.set(Buffer.from(rToUse), 0);
  signatureBuffer.set(Buffer.from(s), 32);
  return signatureBuffer;
}
