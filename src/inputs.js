/**
 * This module provides functions for sorting & validating multisig
 * transaction inputs.
 *
 * @module inputs
 */

import {validateHex} from './utils';
import {multisigBraidDetails} from './multisig';

 /**
 * Represents a transaction input.
 *
 * The [`Multisig`]{@link module:multisig.MULTISIG} object represents
 * the address the corresponding UTXO belongs to.
 *
 * @typedef MultisigTransactionInput
 * @type {Object}
 * @property {string} txid - The transaction ID where funds were received
 * @property {number} index - The index in the transaction referred to by {txid}
 * @property {module:multisig.Multisig} multisig - The multisig object encumbering this UTXO
 *
 */

/**
 * Sorts the given inputs according to the [BIP69 standard]{@link https://github.com/bitcoin/bips/blob/master/bip-0069.mediawiki#transaction-inputs}: ascending lexicographic order.
 *
 * @param {module:inputs.MultisigTransactionInput[]} inputs - inputs to sort
 * @returns {module:inputs.MultisigTransactionInput[]} inputs sorted according to BIP69
 */
export function sortInputs(inputs) {
  return inputs.sort((input1, input2) => {
    if (input1.txid > input2.txid) {
      return 1;
    } else {
      if (input1.txid < input2.txid) {
        return -1;
      } else {
        return ((input1.index < input2.index) ? -1 : 1);
      }
    }
  });
}

/**
 * Validates the given transaction inputs.
 *
 * Returns an error message if there are no inputs.  Passes each output to [`validateMultisigInput`]{@link module:transactions.validateOutput}.
 *
 * If the function is called with braidRequired, an additional check is performed
 * on each input's multisig to make sure that it is braid-aware. In other words,
 * does the input know the set of ExtendedPublicKeys it came from?
 *
 * @param {module:inputs.MultisigTransactionInput[]} inputs - inputs to validate
 * @param {boolean} [braidRequired] - inputs need to have braid details attached to them
 * @returns {string} empty if valid or corresponding validation message if not
 */
export function validateMultisigInputs(inputs, braidRequired) {
  if (!inputs || inputs.length === 0) { return "At least one input is required."; }
  let utxoIDs = [];
  for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
    const input = inputs[inputIndex];
    if (braidRequired && input.multisig && !multisigBraidDetails(input.multisig)) {
        return `At least one input cannot be traced back to its set of extended public keys.`;
    }
    const error = validateMultisigInput(input);
    if (error) { return error; }
    const utxoID = `${input.txid}:${input.index}`;
    if (utxoIDs.includes(utxoID)) {
      return `Duplicate input: ${utxoID}`;
    }
    utxoIDs.push(utxoID);
  }
  return "";
}

/**
 * Validates the given transaction input.
 *
 * - Validates the presence and value of the transaction ID (`txid`) property.
 *
 * - Validates the presence and value of the transaction index (`index`) property.
 *
 * - Validates the presence of the `multisig` property.
 *
 * @param {module:inputs.MultisigTransactionInput} input - input to validate
 * @returns {string} empty if valid or corresponding validation message if not
 *
 */
export function validateMultisigInput(input) {
  if (!input.txid) {
    return `Does not have a transaction ID ('txid') property.`;
  }
  let error = validateTransactionID(input.txid);
  if (error) { return error; }
  if (input.index !== 0 && (!input.index)) {
    return `Does not have a transaction index ('index') property.`;
  }
  error = validateTransactionIndex(input.index);
  if (error) { return error; }
  if (!input.multisig) {
    return `Does not have a multisig object ('multisig') property.`;
  }
  return "";
}

const TXID_LENGTH = 64;

/**
 * Validates the given transaction ID.
 *
 * @param {string} txid - transaction ID to validate
 * @returns {string} empty if valid or corresponding validation message if not
 *
 */
export function validateTransactionID(txid) {
  if (txid === null || txid === undefined || txid === '') {
    return "TXID cannot be blank.";
  }
  let error = validateHex(txid);
  if (error) {
    return `TXID is invalid (${error})`;
  }
  if (txid.length !== TXID_LENGTH) {
    return `TXID is invalid (must be ${TXID_LENGTH}-characters)`;
  }
  return '';
}

/**
 * Validates the given transaction index.
 *
 * @param {string|number} indexString - transaction index to validate
 * @returns {string} empty if valid or corresponding validation message if not
 *
 */
export function validateTransactionIndex(indexString) {
  if (indexString === null || indexString === undefined || indexString === '') {
    return "Index cannot be blank.";
  }
  const index = parseInt(indexString, 10);
  if (!isFinite(index)) {
    return "Index is invalid";
  }
  if (index < 0) {
    return "Index cannot be negative.";
  }
  return "";
}
