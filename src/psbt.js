import {Psbt, Transaction} from "bitcoinjs-lib";
import {toHexString} from './utils';
import {
  multisigAddressType,
  multisigBraidDetails,
  multisigRedeemScript,
  multisigWitnessScript,
} from './multisig';
import {bip32PathToSequence} from './paths';
import BigNumber from 'bignumber.js';
import {P2SH} from './p2sh';
import {P2WSH} from './p2wsh';
import {P2SH_P2WSH} from './p2sh_p2wsh';
import {generateBip32DerivationByIndex, generateBraid} from './braid';

/**
 * This module provides functions for interacting with PSBTs, see BIP174
 * https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
 *
 * @module psbt
 */

/**
 * Represents a transaction PSBT input.
 *
 * The [`Multisig`]{@link module:multisig.MULTISIG} object represents
 * the address the corresponding UTXO belongs to.
 *
 * @typedef module:inputs.MultisigTransactionPSBTInput
 * @type {Object}
 * @property {string} hash - The transaction ID where funds were received
 * @property {number} index - The index in the transaction referred to by {txid}
 * @property {Buffer|Object} utxoToVerify - The UTXO to verify
 * @property {Multisig} multisigScript - Locking script(s) for the multisig address
 * @property {Object} bip32Derivation - the set of (rootFingerprints && pubkeys && bip32paths) for this Multisig
 *
 */

/**
 * Represents an output in a PSBT transaction.
 *
 * @typedef module:outputs.TransactionPSBTOutput
 * @type {Object}
 * @property {string} address - the output address
 * @property {number} value - output amount in Satoshis
 * @property {Object} [redeemScript] For change addresses - Locking script(s) for the multisig address
 * @property {Object} [witnessScript] For change addresses - Locking script(s) for the multisig address
 * @property {Object} [bip32Derivation] For change addresses - the set of (rootFingerprints && pubkeys && bip32paths) for this Multisig
 *
 */

export const PSBT_MAGIC_HEX = "70736274ff";
export const PSBT_MAGIC_B64 = "cHNidP8"; 

/**
 * Return the getBip32Derivation (if known) for a given `Multisig` object.
 *
 * @param {module:multisig.Multisig} multisig the `Multisig` object
 * @param {number} [index] the index to generate at
 * @returns {Object[]} the getBip32Derivation includes all paths/root fingerprints to all pubkeys in the multisig object
 * @example
 * import {
 *   getBip32Derivation,
 *   generateBraidFromExtendedPublicKeys,
 *   generateMultisigFromPublicKeys, MAINNET, P2SH,
 *   braidConfig,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2SH, 2, "03a...", "03b...", "03c...");
 * console.log(getBip32Derivation(multisig, 0)); // null, Multisig object isn't aware of its braid.
 *
 * const braid = generateBraidFromExtendedPublicKeys(MAINNET, P2SH, {{'xpub...', bip32path: "m/45'/0'/0'"}, {'xpub...', bip32path: "m/45'/0/0"}, {'xpub...', bip32path: "m/45'/0/0"}}, 2);
 * const multisig = braid.deriveMultisigByIndex("0");
 * console.log(getBip32Derivation(multisig, 0)); // {
 *   {masterFingerprint: Buffer('1234..', 'hex'), path: "m/45'/0'/0'/0/0", pubkey: Buffer.from("02...", 'hex')}
 *   {masterFingerprint: Buffer('3453..', 'hex'), path: "m/45'/0/0/0/0", pubkey: Buffer.from("03...", 'hex')}
 *   {masterFingerprint: Buffer('1533..', 'hex'), path: "m/45'/0/0/0/0", pubkey: Buffer.from("02...", 'hex')}
 * }
 */
function getBip32Derivation(multisig, index= 0) {
  // Already have one, return it
  if (multisig.bip32Derivation) {
    return multisig.bip32Derivation;
  }
  // Otherwise generate it
  const config = JSON.parse(multisigBraidDetails(multisig));
  const braid = generateBraid(
    config.network,
    config.addressType,
    config.extendedPublicKeys,
    config.requiredSigners,
    config.index,
  );
  return generateBip32DerivationByIndex(braid, index);
}

/**
 * Grabs appropriate bip32Derivation based on the input's last index
 *
 * @param {module:inputs.MultisigTransactionInput} input - input you are requesting bip32Derivation from
 * @return {Object[]} array of objects containing (rootFingerprints && pubkeys && bip32paths) for this Multisig
 */
function psbtInputDerivation(input) {
  // Multi-address inputs will have different bip32Derivations per address (index/path),
  // so specify the index ... If the input is missing a path, assume you want index = 0.
  const index = input.bip32Path ? bip32PathToSequence(input.bip32Path).slice(-1)[0] : 0;
  return getBip32Derivation(input.multisig, index);
}

/**
 * Grabs appropriate bip32Derivation for a change output
 *
 * @param {module:outputs.TransactionOutput} output - output you are requesting bip32Derivation from
 * @return {Object[]} array of objects containing (rootFingerprints && pubkeys && bip32paths) for this Multisig
 */
function psbtOutputDerivation(output) {
  return getBip32Derivation(output.multisig);
}

/**
 * Gets the Witness script from the ouput that generated the input
 * @param {module:inputs.MultisigTransactionInput} input - input you are requesting output's script from
 * @return {Output} bitcoinjs-lib Output object (amount+script)
 */
function getWitnessOutputScriptFromInput(input) {
  // We have the transactionHex - use bitcoinjs to pluck out the witness script
  // return format is:
  //  {
  //    script: Buffer.from(out.script, 'hex'),
  //    amount: out.value,
  //  }
  // See https://github.com/bitcoinjs/bitcoinjs-lib/issues/1282
  const tx = Transaction.fromHex(input.transactionHex);
  return tx.outs[input.index];
}

/**
 * Return the locking script for the given `Multisig` object in a PSBT consumable format
 *
 * @param {module:multisig.Multisig} multisig the `Multisig` object
 * @return {Object} returns an object with proper parameters attached that are needed to validate spending
 */
function psbtMultisigLock(multisig) {
  const multisigLock = {};

  // eslint-disable-next-line default-case
  switch (multisigAddressType(multisig)) {
    case P2SH:
      multisigLock.redeemScript = multisigRedeemScript(multisig).output;
      break;
    case P2WSH:
      multisigLock.witnessScript = multisigWitnessScript(multisig).output;
      break;
    case P2SH_P2WSH: // need both
      multisigLock.witnessScript = multisigWitnessScript(multisig).output;
      multisigLock.redeemScript = multisigRedeemScript(multisig).output;
      break;
  }

  return multisigLock;
}

/**
 * Take a MultisigTransactionInput and turn it into a MultisigTransactionPSBTInput
 *
 * @param {module:inputs.MultisigTransactionInput} input - to decorate for PSBT
 * @return {module:inputs.MultisigTransactionPSBTInput} outputs the PSBT-ready Transaction Input
 */
export function psbtInputFormatter(input) {
  // In this function we're decorating the MultisigTransactionInput appropriately based
  // on its address type.
  //
  // Essentially we need to define a couple parameters to make the whole thing work.
  //   1) Either a Witness UTXO or Non-Witness UTXO pointing to where this input originated
  //   2) multisigScript (spending lock) which can be either a redeemScript, a witnessScript, or both.
  //
  // For more info see https://github.com/bitcoinjs/bitcoinjs-lib/blob/v5.1.10/test/integration/transactions.spec.ts#L680

  // For SegWit inputs, you need an object with the output script buffer and output value
  const witnessUtxo = getWitnessOutputScriptFromInput(input);
  // For non-SegWit inputs, you must pass the full transaction buffer
  const nonWitnessUtxo = Buffer.from(input.transactionHex, 'hex');

  // FIXME - this makes the assumption that the funding transaction used the same transaction type as the current input
  //   we dont have isSegWit info on our inputs at the moment, so we don't know for sure.
  //   This assumption holds in our fixtures, but it may need to be remedied in the future.
  const isSegWit = multisigWitnessScript(input.multisig) !== null;
  const utxoToVerify = isSegWit ? {witnessUtxo} : {nonWitnessUtxo};
  const multisigScripts = psbtMultisigLock(input.multisig);

  const bip32Derivation = psbtInputDerivation(input);
  return {
    hash: input.txid,
    index: input.index,
    ...utxoToVerify,
    ...multisigScripts,
    bip32Derivation,
  };
}

/**
 * Take a MultisigTransactionOutput and turn it into a MultisigTransactionPSBTOutput
 *
 * @param {module:outputs.TransactionOutput} output output to decorate for PSBT
 * @return {module:outputs.TransactionPSBTOutput} outputs the PSBT-ready Transaction Object
 */
export function psbtOutputFormatter(output) {
  let multisigScripts = {};
  let bip32Derivation = [];

  if (output.multisig) {
    // This indicates that this output is a *change* output, so we include additional information:
    //    Change address bip32Derivation (rootFingerprints && pubkeys && bip32paths)
    //    Change address multisig locking script (redeem || witness || both)
    // With the above information, the device (e.g. Coldcard) can validate that the change address
    // can be signed with the same device. The display will show the output as "Change" instead of
    // a normal external output.
    multisigScripts = psbtMultisigLock(output.multisig);
    bip32Derivation = psbtOutputDerivation(output);
    return {
      address: output.address,
      value: BigNumber(output.amountSats).toNumber(),
      ...multisigScripts,
      bip32Derivation,
    };
  }

  return {
    address: output.address,
    value: BigNumber(output.amountSats).toNumber(),
    ...output, // the output may have come in already decorated with bip32Derivation/multisigScripts
  }
}

/**
 * Extracts the signature(s) from a PSBT.
 * NOTE: there should be one signature per input, per signer.
 *
 * ADDITIONAL NOTE: because of the restrictions we place on braids to march their
 * multisig addresses (slices) forward at the *same* index across each chain of the
 * braid, we do not run into a possible collision with this data structure.
 * BUT - to have this method accommodate the *most* general form of signature parsing,
 * it would be wise to wrap this one level deeper like:
 *
 *                     address: [pubkey : [signature(s)]]
 *
 * that way if your braid only advanced one chain's (member's) index so that a pubkey
 * could be used in more than one address, everything would still function properly.
 *
 * @param {String} psbtFromFile -  base64 or hex
 * @returns {Object} returns an object with signatureSet(s) - an object with format
 * {pubkey : [signature(s)]}
 *
 */
export function parseSignaturesFromPSBT(psbtFromFile) {
  let psbt = {};

  // Auto-detect and decode Base64 and Hex.
  if (psbtFromFile.substring(0, 10) === PSBT_MAGIC_HEX) {
    psbt = Psbt.fromHex(psbtFromFile);
  } else if (psbtFromFile.substring(0, 7) === PSBT_MAGIC_B64) {
    psbt = Psbt.fromBase64(psbtFromFile);
  } else {
    return null;
  }

  const partialSignatures = (
    psbt &&
    psbt.data &&
    psbt.data.inputs &&
    psbt.data.inputs[0]
  ) ? psbt.data.inputs[0].partialSig : undefined;
  const numSigners = partialSignatures === undefined ? 0 : partialSignatures.length;

  const signatureSet = {};
  let pubKey = '';
  const inputs = psbt.data.inputs;
  // Find signatures in the PSBT
  if (numSigners >= 1) {
    // return array of arrays of signatures
    for (let i = 0; i < inputs.length; i++) {
      for (let j = 0; j < numSigners; j++) {
        pubKey = toHexString(Array.prototype.slice.call(inputs[i].partialSig[j].pubkey));
        if (pubKey in signatureSet) {
          signatureSet[pubKey].push(inputs[i].partialSig[j].signature.toString("hex"));
        } else {
          signatureSet[pubKey] = [inputs[i].partialSig[j].signature.toString("hex")];
        }
      }
    }
  } else {
    return null;
  }
  return signatureSet;
}
