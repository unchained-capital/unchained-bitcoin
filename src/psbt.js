import { Psbt, Transaction } from "bitcoinjs-lib";
import { reverseBuffer } from "bitcoinjs-lib/src/bufferutils";
import { toHexString } from "./utils";
import {
  generateMultisigFromHex,
  multisigAddressType,
  multisigBraidDetails,
  multisigRedeemScript,
  multisigWitnessScript,
} from "./multisig";
import { bip32PathToSequence } from "./paths";
import BigNumber from "bignumber.js";
import { P2SH } from "./p2sh";
import { P2WSH } from "./p2wsh";
import { P2SH_P2WSH } from "./p2sh_p2wsh";
import { generateBip32DerivationByIndex, generateBraid } from "./braid";
import { networkData } from "./networks";

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
 * @typedef MultisigTransactionPSBTInput
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
 * @typedef TransactionPSBTOutput
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
export const PSBT_MAGIC_BYTES = Buffer.from([0x70, 0x73, 0x62, 0x74, 0xff]);

/**
 * Given a string, try to create a Psbt object based on MAGIC (hex or Base64)
 * @param {String} psbtFromFile -  Base64 or hex PSBT
 * @param {Object} [options] -  options, e.g. TESTNET
 * @return {null|Psbt} - Psbt object from bitcoinjs-lib or null if failed to detect
 */
export function autoLoadPSBT(psbtFromFile, options) {
  if (typeof psbtFromFile !== "string") return null;
  // Auto-detect and decode Base64 and Hex.
  if (psbtFromFile.substring(0, 10) === PSBT_MAGIC_HEX) {
    return Psbt.fromHex(psbtFromFile, options);
  } else if (psbtFromFile.substring(0, 7) === PSBT_MAGIC_B64) {
    return Psbt.fromBase64(psbtFromFile, options);
  } else {
    return null;
  }
}

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
function getBip32Derivation(multisig, index = 0) {
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
    config.index
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
  const index = input.bip32Path
    ? bip32PathToSequence(input.bip32Path).slice(-1)[0]
    : 0;
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
  const nonWitnessUtxo = Buffer.from(input.transactionHex, "hex");

  // FIXME - this makes the assumption that the funding transaction used the same transaction type as the current input
  //   we don't have isSegWit info on our inputs at the moment, so we don't know for sure.
  //   This assumption holds in our fixtures, but it may need to be remedied in the future.
  const addressType = multisigAddressType(input.multisig);

  // The PSBT class in bitcoinjs-lib won't accept both nonWitnessUxo and witnessUtxo
  // but ledger v2 needs nonWitnessUtxo data in the PSBT for any transactions that aren't
  // native segwit. So we need to pick which one to give based on the address type
  // https://github.com/bitcoinjs/bitcoinjs-lib/issues/1595
  const utxoToVerify =
    addressType === P2WSH ? { witnessUtxo } : { nonWitnessUtxo };

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
  };
}

/**
 * Create unchained-wallets style transaction input objects from a PSBT
 *
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {String} addressType - address type
 * @param {Object} psbt - Psbt bitcoinjs-lib object
 * @return {Object[]} unchained multisig transaction inputs array
 */
function getUnchainedInputsFromPSBT(network, addressType, psbt) {
  return psbt.txInputs.map((input, index) => {
    const dataInput = psbt.data.inputs[index];

    // FIXME - this is where we're currently only handling P2SH correctly
    const fundingTxHex = dataInput.nonWitnessUtxo.toString("hex");
    const fundingTx = Transaction.fromHex(fundingTxHex);
    const multisig = generateMultisigFromHex(
      network,
      addressType,
      dataInput.redeemScript.toString("hex")
    );

    return {
      amountSats: fundingTx.outs[input.index].value,
      index: input.index,
      transactionHex: fundingTxHex,
      txid: reverseBuffer(input.hash).toString("hex"),
      multisig,
    };
  });
}

/**
 * Create unchained-wallets style transaction output objects from a PSBT
 *
 * @param {Object} psbt - Psbt bitcoinjs-lib object
 * @return {Object[]} unchained multisig transaction outputs array
 */
function getUnchainedOutputsFromPSBT(psbt) {
  return psbt.txOutputs.map((output) => ({
    address: output.address,
    amountSats: output.value,
  }));
}

/**
 * Create unchained-wallets style transaction input objects
 *
 * @param {Object} psbt - Psbt bitcoinjs-lib object
 * @param {Object} signingKeyDetails - Object containing signing key details (Fingerprint + bip32path prefix)
 * @return {Object[]} bip32Derivations - array of signing bip32Derivation objects
 */
function filterRelevantBip32Derivations(psbt, signingKeyDetails) {
  return psbt.data.inputs.map((input) => {
    const bip32Derivation = input.bip32Derivation.filter(
      (b32d) =>
        b32d.path.startsWith(signingKeyDetails.path) &&
        b32d.masterFingerprint.toString("hex") === signingKeyDetails.xfp
    );

    if (!bip32Derivation.length) {
      throw new Error("Signing key details not included in PSBT");
    }
    return bip32Derivation[0];
  });
}

/**
 * Translates a PSBT into inputs/outputs consumable by supported non-PSBT devices in the
 * `unchained-wallets` library.
 *
 * FIXME - Have only confirmed this is working for P2SH addresses on Ledger on regtest
 *
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {String} addressType - address type
 * @param {String} psbt - PSBT as a base64 or hex string
 * @param {Object} signingKeyDetails - Object containing signing key details (Fingerprint + bip32path prefix)
 * @returns {null|Object} returns unchained-wallets transaction object with the format
 * {
 *    inputs: [],
 *    outputs: [],
 *    bip32Derivations: [],
 * }
 */
export function translatePSBT(network, addressType, psbt, signingKeyDetails) {
  if (addressType !== P2SH) throw new Error(
      "Unsupported addressType -- only P2SH is supported right now"
    );
  let localPSBT = autoLoadPSBT(psbt, { network: networkData(network) });
  if (localPSBT === null) return null;

  // The information we need to provide proper unchained-wallets style objects to the supported
  // non-PSBT devices, we need to grab info from different places from within the PSBT.
  //    1. the "data inputs"
  //    2. the "transaction inputs"
  //
  // We'll do that in the functions below.

  // First, we check that we actually do have any inputs to sign:
  const bip32Derivations = filterRelevantBip32Derivations(
    localPSBT,
    signingKeyDetails
  );

  // The shape of these return objects are specific to existing code
  // in unchained-wallets for signing with Trezor and Ledger devices.
  const unchainedInputs = getUnchainedInputsFromPSBT(
    network,
    addressType,
    localPSBT
  );
  const unchainedOutputs = getUnchainedOutputsFromPSBT(localPSBT);

  return {
    unchainedInputs,
    unchainedOutputs,
    bip32Derivations,
  };
}

/**
 * Given a PSBT, an input index, a pubkey, and a signature,
 * update the input inside the PSBT with a partial signature object.
 *
 * Make sure it validates, and then return the PSBT with the partial
 * signature inside.
 *
 * @param {Object} psbt - Psbt Object from bitcoinjs-lib (unsigned or partially signed)
 * @param {number} inputIndex - which input is this signature for
 * @param {Buffer} pubkey - public key associated with signature
 * @param {Buffer} signature - signature of transaction for pubkey
 * @return {Object} - validated PSBT Object with an added signature for given input
 * @private
 */
function addSignatureToPSBT(psbt, inputIndex, pubkey, signature) {
  const partialSig = [
    {
      pubkey,
      signature,
    },
  ];
  psbt.data.updateInput(inputIndex, { partialSig });
  if (!psbt.validateSignaturesOfInput(inputIndex, pubkey)) throw new Error("One or more invalid signatures.");
  return psbt;
}

/**
 * Given an unsigned PSBT, an array of signing public key(s) (one per input),
 * an array of signature(s) (one per input) in the same order as the pubkey(s),
 * adds partial signature object(s) to each input and returns the PSBT with
 * partial signature(s) included.
 *
 * FIXME - maybe we add functionality of sending in a single pubkey as well,
 *         which would assume all of the signature(s) are for that pubkey.
 *
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {String} psbt - PSBT as base64 or hex string
 * @param {Buffer[]} pubkeys - public keys map 1:1 with signature(s)
 * @param {Buffer[]} signatures - transaction signatures map 1:1 with public key(s)
 * @return {null|string} - partially signed PSBT in Base64
 */
export function addSignaturesToPSBT(network, psbt, pubkeys, signatures) {
  let psbtWithSignatures = autoLoadPSBT(psbt, {
    network: networkData(network),
  });
  if (psbtWithSignatures === null) return null;

  signatures.forEach((sig, idx) => {
    const pubkey = pubkeys[idx];
    psbtWithSignatures = addSignatureToPSBT(
      psbtWithSignatures,
      idx,
      pubkey,
      sig
    );
  });
  return psbtWithSignatures.toBase64();
}

/**
 * Get number of signers in the PSBT
 *
 * @param {Psbt} psbt - bitcoinjs-lib object
 * @returns {int} number of signers in the PSBT
 *
 */

function getNumSigners(psbt) {
  const partialSignatures =
    psbt && psbt.data && psbt.data.inputs && psbt.data.inputs[0]
      ? psbt.data.inputs[0].partialSig
      : undefined;
  return partialSignatures === undefined ? 0 : partialSignatures.length;
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
  let psbt = autoLoadPSBT(psbtFromFile);
  if (psbt === null) return null;

  const numSigners = getNumSigners(psbt);

  const signatureSet = {};
  let pubKey = "";
  const inputs = psbt.data.inputs;
  // Find signatures in the PSBT
  if (numSigners >= 1) {
    // return array of arrays of signatures
    for (let i = 0; i < inputs.length; i++) {
      for (let j = 0; j < numSigners; j++) {
        pubKey = toHexString(
          Array.prototype.slice.call(inputs[i].partialSig[j].pubkey)
        );
        if (pubKey in signatureSet) {
          signatureSet[pubKey].push(
            inputs[i].partialSig[j].signature.toString("hex")
          );
        } else {
          signatureSet[pubKey] = [
            inputs[i].partialSig[j].signature.toString("hex"),
          ];
        }
      }
    }
  } else {
    return null;
  }
  return signatureSet;
}

/**
 * Extracts signatures in order of inputs and returns as array (or array of arrays if multiple signature sets)
 *
 * @param {String} psbtFromFile -  base64 or hex
 * @returns {Object} returns an array of arrays of ordered signatures or an array of signatures if only 1 signer
 *
 */
export function parseSignatureArrayFromPSBT(psbtFromFile) {
  let psbt = autoLoadPSBT(psbtFromFile);
  if (psbt === null) return null;

  const numSigners = getNumSigners(psbt);

  const signatureArrays = Array.from(
    Array(numSigners)
      .fill()
      .map(() => [])
  );

  const { inputs } = psbt.data;

  if (numSigners >= 1) {
    for (let i = 0; i < inputs.length; i += 1) {
      for (let j = 0; j < numSigners; j += 1) {
        let signature = inputs[i].partialSig[j].signature.toString("hex");
        signatureArrays[j].push(signature);
      }
    }
  } else {
    return null;
  }
  return numSigners === 1 ? signatureArrays[0] : signatureArrays;
}
