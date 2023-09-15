/**
 * This module provides functions for validating transaction
 * output and amounts.
 */

import BigNumber from "bignumber.js";

import { ZERO } from "./utils";
import { validateAddress } from "./addresses";

/**
 * Represents an output in a transaction.
 */

/**
 * Validates the given transaction outputs.
 *
 * Returns an error message if there are no outputs.  Passes each output to [`validateOutput`]{@link module:transactions.validateOutput}.
 */
export function validateOutputs(network, outputs, inputsTotalSats?) {
  if (!outputs || outputs.length === 0) {
    return "At least one output is required.";
  }
  for (let outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
    const output = outputs[outputIndex];
    const error = validateOutput(network, output, inputsTotalSats);
    if (error) {
      return error;
    }
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
 */
export function validateOutput(network, output, inputsTotalSats?) {
  if (output.amountSats !== 0 && !output.amountSats) {
    return `Does not have an 'amountSats' property.`;
  }
  let error = validateOutputAmount(output.amountSats, inputsTotalSats);
  if (error) {
    return error;
  }
  if (!output.address) {
    return `Does not have an 'address' property.`;
  }
  error = validateAddress(output.address, network);
  if (error) {
    return `Has an invalid 'address' property: ${error}.`;
  }
  return "";
}

/**
 * Lowest acceptable output amount in Satoshis.
 */
const DUST_LIMIT_SATS = new BigNumber(546);

/**
 * Validate the given output amount (in Satoshis).
 *
 * - Must be a parseable as a number.
 *
 * - Cannot be negative (zero is OK).
 *
 * - Cannot be smaller than the limit set by `DUST_LIMIT_SATS`.
 *
 * - Cannot exceed the total input amount (this check is only run if
 *   `inputsTotalSats` is passed.
 */
export function validateOutputAmount(
  amountSats,
  maxSats?,
  minSats = DUST_LIMIT_SATS
) {
  let a, its;
  try {
    a = new BigNumber(amountSats);
  } catch (e) {
    return "Invalid output amount.";
  }
  if (!a.isFinite()) {
    return "Invalid output amount.";
  }
  if (a.isLessThanOrEqualTo(ZERO)) {
    return "Output amount must be positive.";
  }
  if (a.isLessThanOrEqualTo(minSats)) {
    return "Output amount is too small.";
  }
  if (maxSats !== undefined) {
    try {
      its = new BigNumber(maxSats);
    } catch (e) {
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
  return "";
}
