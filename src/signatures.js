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

/**
 * This function takes a DER encoded signature and returns it without the SIGHASH_BYTE
 * @param {string} signature inputSignature which includes DER encoding bytes and may include SIGHASH byte
 * @return {string} signature_no_sighash with sighash_byte removed
 */
export function signatureNoSighashType(signature) {
  const len = parseInt(signature.slice(2,4), 16);
  if (len === (signature.length - 4) / 2) return signature;
  else return signature.slice(0, -2);
}

/**
 * Returns the multisig Signature Hash for an input at inputIndex
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {module:inputs.MultisigTransactionInput[]} inputs - multisig transaction inputs
 * @param {module:outputs.TransactionOutput[]} outputs - transaction outputs
 * @param {number} inputIndex - the index where the input appears in the transaction
 * @return {Buffer} unsignedTransaction hash in a Buffer for consumption by ECPair.verify
 */
function multisigSignatureHash(network, inputs, outputs, inputIndex) {
  const unsignedTransaction = unsignedMultisigTransaction(network, inputs, outputs);
  const input = inputs[inputIndex];
  if (multisigAddressType(input.multisig) === P2WSH || multisigAddressType(input.multisig) === P2SH_P2WSH) {
    return unsignedTransaction.hashForWitnessV0(inputIndex, multisigWitnessScript(input.multisig).output, BigNumber(input.amountSats).toNumber(), bitcoin.Transaction.SIGHASH_ALL);
  } else {
    return unsignedTransaction.hashForSignature(inputIndex, multisigRedeemScript(input.multisig).output, bitcoin.Transaction.SIGHASH_ALL);
  }
}

/**
 * Create a signature buffer that can be passed to ECPair.verify
 * @param {string} signature - a DER encoded signature string
 * @return {Buffer} signatureBuffer - correctly allocated buffer with relevant r, S information from the encoded signature
 */
function multisigSignatureBuffer(signature) {
  const encodedSignerInputSignatureBuffer = Buffer.from(signature, 'hex');
  const decodedSignerInputSignatureBuffer = bip66.decode(encodedSignerInputSignatureBuffer);
  const {r, s} = decodedSignerInputSignatureBuffer;
  // The value returned from the decodedSignerInputSignatureBuffer has
  // a few edge cases that need to be handled properly. There exists a mismatch between the
  // DER serialization and the ECDSA requirements, namely:
  //   DER says that its highest bit states polarity (positive/negative)
  //   ECDSA says no negatives, only positives.
  // So in the case where DER would result in a negative, a one-byte 0x00 is added to the value
  // NOTE: this can happen on r and on S.

  // See https://transactionfee.info/charts/bitcoin-script-ecdsa-length/ for more information

  // Truncate the leading 0x00 if r or S is 33 bytes long
  let rToUse = r.byteLength > 32 ? r.slice(1) : r;
  // Technically, this could be done but extremely unlikely in the current era.
  // let sToUse = s.byteLength > 32 ? s.slice(1) : s;

  const signatureBuffer = Buffer.alloc(64);
  // r/s bytelength could be < 32, in which case, zero padding needed
  signatureBuffer.set(Buffer.from(rToUse), 32 - rToUse.byteLength);
  signatureBuffer.set(Buffer.from(s), 64 - s.byteLength);
  return signatureBuffer;
}
