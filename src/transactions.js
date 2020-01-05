/** 
 * This module provides functions for constructing and validating
 * multisig transactions.
 * 
 * @module transactions
 */

import BigNumber from 'bignumber.js';

import {ZERO} from "./utils";
import {networkData} from  "./networks";
import {P2SH} from "./p2sh";
import {P2SH_P2WSH} from "./p2sh_p2wsh";
import {P2WSH} from "./p2wsh";
import {
  multisigPublicKeys,
  multisigAddressType,
  multisigRedeemScript,
  multisigWitnessScript,
  generateMultisigFromRedeemScript,
} from "./multisig";
import {scriptToHex} from './script';
import {signatureNoSighashType} from "./signatures";
const bitcoin = require('bitcoinjs-lib');

 /**
 * Represents an input (UTXO) in a transaction.
 *
 * The [`Multisig`]{@link module:multisig.MULTISIG} object represents
 * the address the UTXO belongs to.
 * 
 * @typedef module:transactions.UTXO
 * @type {Object}
 * @property {string} txid - The transaction ID where funds were received
 * @property {number} index - The index in the transaction referred to by {txid}
 * @property {module:multisig.Multisig} multisig - The multisig object encumbering this UTXO
 * 
 */

 /**
 * Represents an output in a transaction.
 *
 * @typedef module:transactions.TransactionOutput
 * @type {Object}
 * @property {string} address - the output address
 * @property {BigNumber} amountSats - output amount in Satoshis
 * 
 */

/**
 * Lowest acceptable output amount in Satoshis.
 * 
 * @constant
 * @type {BigNumber}
 * @default 546 Satoshis
 * 
 */
const DUST_LIMIT_SATS = BigNumber(546);

/**
 * Sorts the given inputs according to the [BIP69 standard]{@link https://github.com/bitcoin/bips/blob/master/bip-0069.mediawiki#transaction-inputs}: ascending lexicographic order.
 * 
 * @param {module:transactions.UTXO[]} inputs - inputs to sort
 * @returns {module:transactions.UTXO[]} inputs sorted according to BIP69
 */
export function sortInputs(inputs) {
  return inputs.sort((input1, input2) => {
    if (input1.txid > input2.txid) { return 1; }
    else {
      if (input1.txid < input2.txid) { return -1; }
      else {
        return ((input1.index < input2.index) ? -1 : 1);
      }
    }
  });
}


/**
 * Validate the given output amount (in Satoshis).
 * 
 * - Must be a parseable as a number.
 *
 * - Cannot be negative (zero is OK).
 *
 * - Cannot exceed the total input amount.
 *
 * - Cannot be smaller than the limit set by `DUST_LIMIT_SATS`.
 * 
 * @param {string|number|BigNumber} amountSats - output amount in Satoshis
 * @param {string|number|BigNumber} inputsTotalSats - total input amount in Satoshis
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {validateOutputAmount} from "unchained-bitcoin";
 * console.log(validateOutputAmount(-100, 1000000) // "Output amount must be positive."
 * console.log(validateOutputAmount(0, 1000000) // "Output amount must be positive."
 * console.log(validateOutputAmount(10, 1000000) // "Output amount is too small."
 * console.log(validateOutputAmount(1000000, 100000) // "Output amount is too large."
 * console.log(validateOutputAmount(100000, 1000000) // ""
 */
export function validateOutputAmount(amountSats, inputsTotalSats) {
  let a, its;
  try {
    a = BigNumber(amountSats);
  } catch(e) {
    return "Invalid output amount.";
  }
  if (!a.isFinite()) {
    return "Invalid output amount.";
  }
  try {
    its = BigNumber(inputsTotalSats);
  } catch(e) {
    return "Invalid total input amount.";
  }
  if (!its.isFinite()) {
    return "Invalid total input amount.";
  }
  if (a.isLessThanOrEqualTo(ZERO)) {
    return "Output amount must be positive.";
  }
  if (a.isLessThanOrEqualTo(DUST_LIMIT_SATS)) {
    return "Output amount is too small.";
  }
  if (its.isLessThanOrEqualTo(ZERO)) {
    return "Total input amount must be positive.";
  }
  if (a.isGreaterThan(its)) {
    return "Output amount is too large.";
  }
  return '';
}

/**
 * Create an unsigned bitcoin transaction based on the network, inputs
 * and outputs.
 *
 * Returns a [`Transaction`]{@link https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/types/transaction.d.ts|Transaction} object from bitcoinjs-lib.
 *
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {module:transactions.UTXO[]} inputs - transaction inputs
 * @param {module:transactions.TransactionOutput[]} outputs - transaction outputs
 * @returns {Transaction} an unsigned bitcoinjs-lib Transaction object
 * @example
 * import {
 *   generateMultisigFromPublicKeys, TESTNET, P2SH,
 *   unsignedMultisigTransaction,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(TESTNET, P2SH, 2, "03a...", "03b...");
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
 * 
 */
export function unsignedMultisigTransaction(network, inputs, outputs) {
  const transactionBuilder = new bitcoin.TransactionBuilder();
  transactionBuilder.setVersion(1); // FIXME this depends on type...
  transactionBuilder.network = networkData(network);
  const sortedInputs = sortInputs(inputs);
  for (let inputIndex = 0; inputIndex < sortedInputs.length; inputIndex += 1) {
    const input = sortedInputs[inputIndex];
    transactionBuilder.addInput(input.txid, input.index);
  }
  for (let outputIndex = 0; outputIndex < outputs.length; outputIndex += 1) {
    const output = outputs[outputIndex];
    transactionBuilder.addOutput(output.address, BigNumber(output.amountSats).toNumber());
  }
  return transactionBuilder.buildIncomplete();
}

/**
 * Create a fully signed multisig transaction based on the unsigned
 * transaction, inputs, and their signatures.
 * 
 * @param {Transaction} unsignedTransaction - generated transaction object from call to unsignedMultisigTransaction
 * @param {module:transactions.UTXO[]} inputs - generated array of inputs to the transaction (blockExplorerGetAddresesUTXOs|bitcoindListUnspent)
 * @param {Object[]} inputsSignaturesByPublicKey - array of mappings from public keys to signatures.
 * @returns {Transaction} a signed {@link https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/types/transaction.d.ts|Transaction} object
 * @example
 * import {
 *   generateMultisigFromPublicKeys, TESTNET, P2SH,
 *   unsignedMultisigTransaction,
 *   signedMultisigTransaction,
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
 * const inputsSignaturesByPublicKey = [
 *   // Each element is a map from public keys in the multisig
 *   // to the corresponding signature for this input.
 *   {
 *     "03a...": "301a...",
 *     "03b...": "301b...",
 *   },
 *   // Add another similar map for each additional input being signed.
 * ];
 * const signedTransaction = signedMultisigTransaction(unsignedTransaction, inputs, inputsSignaturesByPublicKey)
 */
export function signedMultisigTransaction(unsignedTransaction, inputs, inputsSignaturesByPublicKey) {
  const signedTransaction = bitcoin.Transaction.fromHex(unsignedTransaction.toHex()); // FIXME inefficient?

  const sortedInputs = sortInputs(inputs);

  for (let inputIndex=0; inputIndex < sortedInputs.length; inputIndex++) {
    const input = sortedInputs[inputIndex];
    const inputPublicKeys = multisigPublicKeys(input.multisig);

    // Sort the signatures for this input across signers by the index
    // of their public key within this input's redeem script.
    const sortedSignatures = inputPublicKeys.map((publicKey) => (inputsSignaturesByPublicKey[inputIndex][publicKey]))
                                            .filter((signature) => signature ? signatureNoSighashType(signature) : signature);
    if (multisigAddressType(input.multisig) === P2WSH) {
      const witness = multisigWitnessField(input.multisig, sortedSignatures);
      signedTransaction.setWitness(inputIndex, witness);
    } else     if (multisigAddressType(input.multisig) === P2SH_P2WSH) {
      const witness = multisigWitnessField(input.multisig, sortedSignatures);
      signedTransaction.setWitness(inputIndex, witness);
      const scriptSig = multisigRedeemScript(input.multisig);
      signedTransaction.ins[inputIndex].script = Buffer.from([scriptSig.output.length, ...scriptSig.output]);
    } else {
      const scriptSig = multisigScriptSig(input.multisig, sortedSignatures);
      signedTransaction.ins[inputIndex].script = scriptSig.input;
    }
  }

  return signedTransaction;
}

function multisigWitnessField(multisig, sortedSignatures) {
  const witness = [""].concat(sortedSignatures.map(s => signatureNoSighashType(s) +'01'));
  const witnessScript = multisigWitnessScript(multisig);
  witness.push(scriptToHex(witnessScript));
  return witness.map(wit => Buffer.from(wit, 'hex'));
}

function multisigScriptSig(multisig, signersInputSignatures) {
  const signatureOps = signersInputSignatures.map((signature) => (`${signatureNoSighashType(signature)}01`)).join(' '); // 01 => SIGHASH_ALL
  const inputScript = `OP_0 ${signatureOps}`;
  const inputScriptBuffer = bitcoin.script.fromASM(inputScript);
  const redeemScript = bitcoin.payments.p2ms({
    network: multisig.network,
    output: Buffer.from(multisigRedeemScript(multisig).output, 'hex'),
    input: inputScriptBuffer,
  });
  return generateMultisigFromRedeemScript(multisigAddressType(multisig), redeemScript);
}
