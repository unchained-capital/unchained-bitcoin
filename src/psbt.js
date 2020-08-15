import {Psbt} from "bitcoinjs-lib";
import {toHexString} from './utils';

/**
 * This module provides functions for interacting with PSBTs, see BIP174
 * https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
 *
 * @module psbt
 */

/**
 * Extracts the signature(s) from a PSBT.
 * NOTE: there should be one signature per input, per signer.
 *
 * @param {String} psbtFromFile -  base64 or hex
 * @returns {Object} returns an object with signatureSet(s) - an object with format
 * {pubkey : [signature(s)]}
 *
 */
export function parseSignaturesFromPSBT(psbtFromFile) {
  let psbt = {};

  // Auto-detect and decode Base64 and Hex.
  if (psbtFromFile.substring(0, 10) === '70736274ff') {
    psbt = Psbt.fromHex(psbtFromFile);
  } else if (psbtFromFile.substring(0, 6) === 'cHNidP') {
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
