/**
 * This module provides utility functions for abstracting away the underlying library.  
 * By using the functions in this module, you can extract the information contained in
 * the underlying objects, without knowing the object structure.  The underlying object
 * is generically referred to as "Multisig".  This object is complex, and this module
 * removes the complexities so you should not obtain information directly from the
 * "Multisig" object but instead call the module functions to extract its values.
 * @module multisig
 */

import BigNumber from 'bignumber.js';
import {
  networkData,
  NETWORKS
} from  "./networks";
import {
  estimateMultisigP2SHTransactionLength,
} from "./p2sh";
import {
  estimateMultisigP2SHP2WSHTransactionLength,
} from "./p2sh_p2wsh";
import {
  estimateMultisigP2WSHTransactionLength,
} from "./p2wsh";
import {toHexString} from "./utils";
import bip66 from "bip66";
import { scriptToHex } from './script';

const bitcoin = require('bitcoinjs-lib');

/**
 * Address type constant for "pay to script hash" address type.
 * @type {string}
 */
export const P2SH = "P2SH";

/**
 * Address type constant for "pay to script hash - pay to witness script hash" address type.
 * @type {string}
 */
export const P2SH_P2WSH = "P2SH-P2WSH";

/**
 * Address type constant for "pay to witness script hash" address type.
 * @type {string}
 */
export const P2WSH = "P2WSH";

/**
 * Enumeration of possible multisig address types ([P2SH]{@link module:multisig.P2SH}|[P2SH_P2WSH]{@link module:multisig.P2SH_P2WSH}|[P2WSH]{@link module:multisig.P2WSH}).
 * @enum {string} 
 */
export const MULTISIG_ADDRESS_TYPES = {
  P2SH,
  P2SH_P2WSH,
  P2WSH,
};

/**
 * Retrieve the standard derivation path for a given multisig address type and network.
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} addressType - type from which to create the root path
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @example
 * const p2sh_root = multisigBIP32Root(MULTISIG_ADDRESS_TYPES.P2SH, NETWORKS.MAINNET); // m/45'/0'/0'
 * const p2sh_p2wsh_root = multisigBIP32Root(MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, NETWORKS.MAINNET); // m/48'/0'/0'/1'
 * const p2wsh_root = multisigBIP32Root(MULTISIG_ADDRESS_TYPES.P2SH, NETWORKS.MAINNET); // m/48'/0'/0'/2'
 * @returns {string} full root derivation path
 */
export function multisigBIP32Root(addressType, network) {
  const coinPath = (network === NETWORKS.MAINNET ? "0'" : "1'");
  switch (addressType) {
  case MULTISIG_ADDRESS_TYPES.P2SH:
    return `m/45'/${coinPath}/0'`;
  case MULTISIG_ADDRESS_TYPES.P2SH_P2WSH:
    return `m/48'/${coinPath}/0'/1'`;
  case MULTISIG_ADDRESS_TYPES.P2WSH:
    return `m/48'/${coinPath}/0'/2'`;
  default:
    return null;
  }
}

/**
 * Retrieve the standard derivation path for a given multisig address type and network at a given index.
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} addressType - type from which to create the child path
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {number} index - completes the derivation path
 * @example
 * const p2sh_path = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2SH, NETWORKS.MAINNET, 0); // m/45'/0'/0'/0
 * const p2sh_p2wsh_path = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, NETWORKS.MAINNET, 0); // m/48'/0'/0'/1'/0
 * const p2wsh_path = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2WSH, NETWORKS.MAINNET, 0); // m/48'/0'/0'/2'/0
 * @returns {string} full child derivation path
 */
export function multisigBIP32Path(addressType, network, index) {
  const root = multisigBIP32Root(addressType, network);
  if (root) {
    return root + `/${index || "0"}`;
  }
  return null;
}

/**
 * Determine the multisig address type for a Multisig object.
 * @param {Multisig} multisig - derive the address type from this object
 * @example
 * const addressType = multisigAddressType(multisig);
 * if (addressType == MULTISIG_ADDRESS_TYPES.P2SH) {
 *  // handle P2SH here
 * }
 * // check other address types and handle
 * @returns {module:multisig.MULTISIG_ADDRESS_TYPES} the address type
 */
export function multisigAddressType(multisig) {
  if (multisig.redeem.redeem) {
    return MULTISIG_ADDRESS_TYPES.P2SH_P2WSH;
  } else {
    // FIXME why is multisig.witness null?
    // if (multisig.witness) {
    if (multisig.address.match(/^(tb|bc)/)) {
      return MULTISIG_ADDRESS_TYPES.P2WSH;
    } else {
      return MULTISIG_ADDRESS_TYPES.P2SH;
    }
  }
}

/**
 * Extract the number of required signers value from a Multisig object.
 * @param {Multisig} multisig - object to parse
 * @example
 * const m = multisigRequiredSigners(multisig); // m = 2 for a 2 of 3 multisig
 * @returns {number} number of signatures required to spend from a given multisig address
 */
export function multisigRequiredSigners(multisig) {
  return (multisigAddressType(multisig) === MULTISIG_ADDRESS_TYPES.P2SH_P2WSH) ? multisig.redeem.redeem.m : multisig.redeem.m;
}

/**
 * Extract the total number of signers value from a Multisig object.
 * @param {Multisig} multisig - object to parse
 * @example
 * const n = multisigTotalSigners(multisig); // n = 3 for a 2 of 3 multisig
 * @returns {number} number of keys available for signing for a given multisig address
 */
export function multisigTotalSigners(multisig) {
  return (multisigAddressType(multisig) === MULTISIG_ADDRESS_TYPES.P2SH_P2WSH) ? multisig.redeem.redeem.n : multisig.redeem.n;
}

/**
 * Retrieve the Multisig object representing proper redeem script from a base Multisig object.
 * @param {Multisig} multisig - object to parse
 * @example
 * const redeemMultisig = multisigRedeemScript(multisig)
 * console.log(scriptToHex(redeemMultisig)) // 522102e326263c35e...
 * @returns {Multisig|null} object for further parsing
 */
export function multisigRedeemScript(multisig) {
  switch (multisigAddressType(multisig)) {
  case MULTISIG_ADDRESS_TYPES.P2SH:
    return multisig.redeem;
  case MULTISIG_ADDRESS_TYPES.P2SH_P2WSH:
    return multisig.redeem;
  case MULTISIG_ADDRESS_TYPES.P2WSH:
    return null;
  default:
    return null;
  }
}

/**
 * Retrieve the Multisig object representing proper witness script from a base Multisig object.
 * @param {Multisig} multisig - object to parse
 * @example
 * const witnessScript = multisigWitnessScript(multisig)
 * console.log(scriptToHex(witnessScript)) // 522102e326263c35e...
 * @returns {Multisig|null} object for further parsing
 */
export function multisigWitnessScript(multisig) {
  switch (multisigAddressType(multisig)) {
  case MULTISIG_ADDRESS_TYPES.P2SH:
    return null;
  case MULTISIG_ADDRESS_TYPES.P2SH_P2WSH:
    return multisig.redeem.redeem;
  case MULTISIG_ADDRESS_TYPES.P2WSH:
    return multisig.redeem;
  default:
    return null;
  }
}

/**
 * Extract the public keys from a given Multisig object.
 * @param {Multisig} multisig - object to parse
 * @example
 * const pubkeys = multisigPublicKeys(multisig);
 * @returns {string[]} the hex representation of the public keys used in the multisig address
 */
export function multisigPublicKeys(multisig) {
  return ((multisigAddressType(multisig) === P2SH) ? multisigRedeemScript(multisig) : multisigWitnessScript(multisig)).pubkeys.map(toHexString);
}

/**
 * Return the address for a given Multisig object.
 * @param {Multisig} multisig - object to parse
 * @returns {string} the address
 */
export function multisigAddress(multisig) {
  return multisig.address;
}

/**
 * Create a Multisig object by specifying the network, address type, total number of signers and the public keys.
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} addressType - address type for determining Multisig object
 * @param {number} requiredSigners - number of signers needed to spend funds
 * @param  {...string} publicKeys - list of hex string representation of public keys
 * @example
 * const multisig = generateMultisigFromSpec(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, 3, pubkey1, pubkey2, ..., pubkeyN);
 * @returns {Multisig} object for further parsing
 */
export function generateMultisigFromPublicKeys(network, addressType, requiredSigners, ...publicKeys) {
  const redeemScript = bitcoin.payments.p2ms({
    m: requiredSigners, 
    pubkeys: publicKeys.map((hex) => Buffer.from(hex, 'hex')),
    network: networkData(network),
  });
  return generateMultisigFromRedeemScript(addressType, redeemScript);
}

/**
 * Create a Multisig object from the hex representation of a redeem script.
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} addressType - address type for object creation
 * @param {string} redeemScriptHex - hex representation of the redeem script
 * @example
 * const redeemScript = "512103a90d10bf3794352bb1fa533dbd4ea75a0ffc98e0d05124938fcc3e10cdbe1a4321030d60e8d497fa8ce59a2b3203f0e597cd0182e1fe0cc3688f73497f2e99fbf64b52ae";
 * const multisig = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, redeemScript);
 * @returns {Multisig} object for further parsing
 */
export function generateMultisigFromHex(network, addressType, redeemScriptHex) {
  const redeemScript = bitcoin.payments.p2ms({
    output: Buffer.from(redeemScriptHex,'hex'),
    network: networkData(network),
  });
  return generateMultisigFromRedeemScript(addressType, redeemScript);
}

function generateMultisigFromRedeemScript(addressType, redeemScript) {
  switch (addressType) {
  case MULTISIG_ADDRESS_TYPES.P2SH:
    return bitcoin.payments.p2sh({redeem: redeemScript});
  case MULTISIG_ADDRESS_TYPES.P2SH_P2WSH:
    return bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wsh({redeem: redeemScript}),
    });
  case MULTISIG_ADDRESS_TYPES.P2WSH:
    return bitcoin.payments.p2wsh({redeem: redeemScript});
  default:
    return null;
  }
}

/**
 * Estimate transaction fee rate based on actual fee and address type, number of inputs and number of outputs.
 * @param {Object} config - configuration for the calculation
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} config.addressType - address type used for estimation
 * @param {number} config.numInputs - number of inputs used in calculation
 * @param {number} config.numOutputs - number of outputs used in calculation
 * @param {number} config.m - number of required signers for the quorum
 * @param {number} config.n - number of total signers for the quorum
 * @param {BigNumber} config.feesInSatoshis - total transaction fee in satoshis
 * @example 
 * // get the fee rate a P2WSH multisig transaction with 2 inputs and 3 outputs with a known fee of 7060
 * const feerate = estimateMultisigTransactionFeeRate({
 *   addressType: MULTISIG_ADDRESS_TYPES.P2WSH, 
 *   numInputs: 2, 
 *   numOutputs: 3, 
 *   m: 2,
 *   n: 3,
 *   feesInSatoshis: 7060
 * });
 * 
 * 
 * @returns {string} estimated fee rate
 */
export function estimateMultisigTransactionFeeRate(config) {
  return (new BigNumber(config.feesInSatoshis)).dividedBy(
    estimateMultisigTransactionLength(config)
  ).toFixed(0);
}

/**
 * Estimate transaction fee based on fee rate, address type, number of inputs and outputs.
 * @param {Object} config - configuration for the calculation
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} config.addressType - address type used for estimation
 * @param {number} config.numInputs - number of inputs used in calculation
 * @param {number} config.numOutputs - number of outputs used in calculation
 * @param {number} config.m - number of required signers for the quorum
 * @param {number} config.n - number of total signers for the quorum
 * @param {string} config.feesPerByteInSatoshis - satoshis per byte fee rate
 * @example
 * // get fee for P2SH multisig transaction with 2 inputs and 3 outputs at 10 satoshis per byte
 * const fee = estimateMultisigTransactionFee({
 *   addressType: MULTISIG_ADDRESS_TYPES.P2SH, 
 *   numInputs: 2, 
 *   numOutputs: 3, 
 *   m: 2,
 *   n: 3,
 *   feesPerByteInSatoshis: 10
 * });
 * @returns {number} estimated transaction fee
 */
export function estimateMultisigTransactionFee(config) {
  return (new BigNumber(config.feesPerByteInSatoshis)).multipliedBy(
    estimateMultisigTransactionLength(config));
}

function estimateMultisigTransactionLength(config) {
  switch (config.addressType) {
  case MULTISIG_ADDRESS_TYPES.P2SH:
    return estimateMultisigP2SHTransactionLength(config);
  case MULTISIG_ADDRESS_TYPES.P2SH_P2WSH:
    return estimateMultisigP2SHP2WSHTransactionLength(config);
  case MULTISIG_ADDRESS_TYPES.P2WSH:
    return estimateMultisigP2WSHTransactionLength(config);
  default:
    return null;
  }
}

/**
 * Create an unsigned bitcoin transaction based on the network, inputs and outputs.
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {UTXO[]} inputs - inputs used to create transaction
 * @param {Object[]} outputs - transaction recipients
 * @example
 * const unsignedTransaction = unsignedMultisigTransaction(NETWORKS.MAINNET, inputs, outputs);
 * @returns {Transaction} an unsigned {@link https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/types/transaction.d.ts|Transaction} object
 */
export function unsignedMultisigTransaction(network, inputs, outputs) {
  const transactionBuilder = new bitcoin.TransactionBuilder();
  transactionBuilder.setVersion(1); // FIXME this depends on type...
  transactionBuilder.network = networkData(network);
  for (let inputIndex = 0; inputIndex < inputs.length; inputIndex += 1) {
    const input = inputs[inputIndex];
    transactionBuilder.addInput(input.txid, input.index);
  }
  for (let outputIndex = 0; outputIndex < outputs.length; outputIndex += 1) {
    const output = outputs[outputIndex];
    transactionBuilder.addOutput(output.address, new BigNumber(output.amountSats).toNumber());
  }
  return transactionBuilder.buildIncomplete();
}

/**
 * Validate a signature for a signed transaction input.
 * @param {Transaction} unsignedTransaction - transaction to validate
 * @param {number} inputIndex - the index where the input appears in the transaction
 * @param {UTXO} input - the object representing the input whose signature you wish to validate
 * @param {string} signerInputSignature - signature to validate
 * @example
 * const publicKey = validateMultisigSignature(unsignedTransaction, inputIndex, input, inputSignature);
 * if (publicKey) {
 *   // is valid, do something with publicKey
 * } else {
 *   // not valid, handle here
 * }
 * @returns {string|boolean} false if invalid or corresponding public key
 */
export function validateMultisigSignature(unsignedTransaction, inputIndex, input, signerInputSignature) {
  const hash = multisigSignatureHash(unsignedTransaction, inputIndex, input);
  const signatureBuffer = multisigSignatureBuffer(signatureNoSighashType(signerInputSignature));
  const publicKeys = multisigPublicKeys(input.multisig);
  for (var publicKeyIndex=0; publicKeyIndex < multisigTotalSigners(input.multisig); publicKeyIndex++) {
    const publicKey = publicKeys[publicKeyIndex];
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    const keyPair = bitcoin.ECPair.fromPublicKey(publicKeyBuffer);
    if (keyPair.verify(hash, signatureBuffer)) {
      return publicKey;
    }
  }

  return false;
}

function signatureNoSighashType(signature) {
  const len = parseInt(signature.slice(2,4), 16);
  if (len == (signature.length - 4) / 2) return signature;
  else return signature.slice(0, -2)
}

function multisigSignatureHash(unsignedTransaction, inputIndex, input) {
  if (multisigAddressType(input.multisig) === MULTISIG_ADDRESS_TYPES.P2WSH || multisigAddressType(input.multisig) === MULTISIG_ADDRESS_TYPES.P2SH_P2WSH) {
    return unsignedTransaction.hashForWitnessV0(inputIndex, multisigWitnessScript(input.multisig).output, new BigNumber(input.amountSats).toNumber(), bitcoin.Transaction.SIGHASH_ALL);
  } else {
    return unsignedTransaction.hashForSignature(inputIndex, multisigRedeemScript(input.multisig).output, bitcoin.Transaction.SIGHASH_ALL);
  }
}

function multisigSignatureBuffer(signature) {
  const encodedSignerInputSignatureBuffer = new Buffer(signature, 'hex');
  const decodedSignerInputSignatureBuffer = bip66.decode(encodedSignerInputSignatureBuffer);
  const {r, s} = decodedSignerInputSignatureBuffer;
  // Ignore the leading 0 if r is 33 bytes
  let rToUse = r;
  if (r.byteLength > 32) {
    rToUse = r.slice(1);
  }

  const signatureBuffer = new Buffer(64);
  signatureBuffer.set(new Buffer(rToUse), 0);
  signatureBuffer.set(new Buffer(s), 32);
  return signatureBuffer;
}

/**
 * Add signatures to an unsigned transaction.
 * @param {Transaction} unsignedTransaction - generated transaction object from call to unsignedMultisigTransaction
 * @param {UTXO[]} inputs - generated array of inputs to the transaction (blockExplorerGetAddresesUTXOs|bitcoindListUnspent)
 * @param {Object[]} inputsSignaturesByPublicKey - input signatures mapped to the pulic key index [{signature: index},...]
 * @example
 * const keysigs = [{[pubkey1]: signature1}, {[pubkey2]: signature2}]
 * const signedTx = signedMultisigTransaction(unsignedTx, inputs, keysigs)
 * console.log(signedTx.toHex()) // 0100000001d73e679f...
 * @returns {Transaction} a signed {@link https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/types/transaction.d.ts|Transaction} object
 */
export function signedMultisigTransaction(unsignedTransaction, inputs, inputsSignaturesByPublicKey) {
  const signedTransaction = bitcoin.Transaction.fromHex(unsignedTransaction.toHex()); // FIXME inefficient?

  for (let inputIndex=0; inputIndex < inputs.length; inputIndex++) {
    const input = inputs[inputIndex];
    const inputPublicKeys = multisigPublicKeys(input.multisig);

    // Sort the signatures for this input across signers by the index
    // of their public key within this input's redeem script.
    const sortedSignatures = inputPublicKeys.map((publicKey) => (inputsSignaturesByPublicKey[inputIndex][publicKey]))
                                            .filter((signature) => signature ? signatureNoSighashType(signature) : signature);
    if (multisigAddressType(input.multisig) === MULTISIG_ADDRESS_TYPES.P2WSH) {
      const witness = multisigWitnessField(input.multisig, sortedSignatures)
      signedTransaction.setWitness(inputIndex, witness);
    } else     if (multisigAddressType(input.multisig) === MULTISIG_ADDRESS_TYPES.P2SH_P2WSH) {
      const witness = multisigWitnessField(input.multisig, sortedSignatures)
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
  return witness.map(wit => Buffer.from(wit, 'hex'))
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

 /**
 * @typedef {'Multisig'} Multisig - IMPORTANT: Always parse this and never use properties directly!
 */

 /**
 * A utxo object for signing with various wallets
 * @typedef {Object} UTXO
 * @property {boolean} confirmed - This is for UI developers and not signing related
 * @property {string} txid - The transaction ID where funds were received
 * @property {number} index - The index in the transaction referred to by {txid}
 * @property {string} amount - String representation of BTC value
 * @property {BigNumber} amountSats - Value in satoshis
 * @property {string} [transactionHex] - Hex representation of the raw transaction referred to by txid
 * @property {Multisig} [multisig] - For parsing only
 */
