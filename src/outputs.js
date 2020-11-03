/** 
 * This module provides functions for validating transaction
 * output and amounts.
 * 
 * @module outputs
 */

import BigNumber from 'bignumber.js';

import {ZERO} from "./utils";
import {
  validateAddress,
} from "./addresses";

 /**
 * Represents an output in a transaction.
 *
 * @typedef module:outputs.TransactionOutput
 * @type {Object}
 * @property {string} address - the output address
 * @property {string|number|BigNumber} amountSats - output amount in Satoshis
 * @property {Multisig} [multisig] - output multisig for a change address
 * 
 */

/**
 * Validates the given transaction outputs.
 *
 * Returns an error message if there are no outputs.  Passes each output to [`validateOutput`]{@link module:transactions.validateOutput}.
 *
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {module:outputs.TransactionOutput[]} outputs - outputs to validate
 * @param {string|number|BigNumber} [inputsTotalSats] - (optional) the total input amount in Satoshis
 * @returns {string} empty if valid or corresponding validation message if not
 * 
 */
export function validateOutputs(network, outputs, inputsTotalSats) {
  if (!outputs || outputs.length === 0) { return "At least one output is required."; }
  for (let outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
    const output = outputs[outputIndex];
    const error = validateOutput(network, output, inputsTotalSats);
    if (error) { return error; }
  }
  return "";
}

/**
 * Validate the given transaction output.
 *
 * - Validates the presence and value of `address`.
 * 
 * - Validates the presence and value of `amountSats`.  If `inputsTotalSats`
 *   is also passed, this will be taken into account when validating the
 *   amount.
 *
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @param {module:outputs.TransactionOutput} output - output to validate
 * @param {string|number|BigNumber} inputsTotalSats - (optional) the total input amount in Satoshis
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {validateOutput} from "unchained-bitcoin";
 * console.log(validateOutput(MAINNET, {amountSats: 100000, address: "2..."})); // "...address is invalid..."
 * console.log(validateOutput(MAINNET, {amountSats: 100000, address: "3..."})); // ""
 * console.log(validateOutput(MAINNET, {amountSats: 100000, address: "3..."}, 10000)); // "Amount is too large."
 */
export function validateOutput(network, output, inputsTotalSats) {
  if (output.amountSats !== 0 && (!output.amountSats)) {
    return `Does not have an 'amountSats' property.`;
  }
  let error = validateOutputAmount(output.amountSats, inputsTotalSats);
  if (error) { return error; }
  if (!output.address) {
    return `Does not have an 'address' property.`;
  }
  error = validateAddress(output.address, network);
  if (error) {
    return `Has an invalid 'address' property: ${error}.`;
  }
  return '';
}

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
 * Validate the given output amount (in Satoshis).
 * 
 * - Must be a parseable as a number.
 *
 * - Cannot be negative (zero is OK).
 *
 * - Cannot be smaller than the limit set by `DUST_LIMIT_SATS`.
 * 
 * - Cannot exceed the total input amount (this check is only run if `inputsTotalSats` is passed.
 * 
 * @param {string|number|BigNumber} amountSats - output amount in Satoshis
 * @param {string|number|BigNumber} inputsTotalSats - (optional) total input amount in Satoshis
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
  if (a.isLessThanOrEqualTo(ZERO)) {
    return "Output amount must be positive.";
  }
  if (a.isLessThanOrEqualTo(DUST_LIMIT_SATS)) {
    return "Output amount is too small.";
  }
  if (inputsTotalSats !== undefined) {
    try {
      its = BigNumber(inputsTotalSats);
    } catch(e) {
      return "Invalid total input amount.";
    }
    if (!its.isFinite()) {
      return "Invalid total input amount.";
    }
    if (its.isLessThanOrEqualTo(ZERO)) {
      return "Total input amount must be positive.";
    }
    if (a.isGreaterThan(its)) {
      return "Output amount is too large.";
    }
  }
  return '';
}
