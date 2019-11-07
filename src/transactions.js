/** 
 * This module provides validation messages related to transactions.
 * @module transactions
 */

import BigNumber from 'bignumber.js';
import {satoshisToBitcoins, bitcoinsToSatoshis} from "./utils";

const ZERO = BigNumber(0);
const MAX_FEE_RATE = new BigNumber(1000);   // 1000 Sats/byte
const MAX_FEE_BTC = new BigNumber(0.025); // ~ $250 if 1 BTC = $10k
const DUST_LIMIT_SATS = BigNumber(546);

/**
 * Provide a validation message for a given fee rate expressed in satoshis per byte.
 * @param {string} feeRateString - a string representation of the fee rate
 * @example
 * const feerate = -1;
 * const validationError = validateFeeRate(feerate);
 * console.log(validationError); // Fee rate must be positive.
 * @returns {string} empty if valid or corresponding validation message
 */
export function validateFeeRate(feeRateString) {
  let feeRate;
  try {
    feeRate = new BigNumber(feeRateString);
  } catch(e) {
    return "Invalid fee rate.";
  }
  if (feeRate.isLessThanOrEqualTo(ZERO)) {
    return "Fee rate must be positive.";
  }
  if (feeRate.isGreaterThan(MAX_FEE_RATE)) {
    return "Fee rate is too high.";
  }
  return '';
}

/**
 * Provide a validation message for a given fee expressed in BTC.
 * @param {string} feeBTCString - total fee in BTC
 * @param {BigNumber} inputsTotalSats - total satoshis
 * @example
 * const fee = "0.03";
 * const validationError = validateFeeBTC(fee, BigNumber("100000"));
 * console.log(validationError) // Fee is too high.
 * @returns {string} empty if valid or corresponding validation message
 */
export function validateFeeBTC(feeBTCString, inputsTotalSats) {
  let fee;
  try {
    fee = new BigNumber(feeBTCString);
  } catch(e) {
    return "Invalid fee.";
  }
  if (fee.isLessThan(ZERO)) {
    return "Fee cannot be negative.";
  }
  if (fee.isGreaterThan(satoshisToBitcoins(inputsTotalSats))) {
    return "Fee is too high.";
  }
  if (fee.isGreaterThan(MAX_FEE_BTC)) {
    return "Fee is too high.";
  }
  return '';
}

/**
 * Provide a validation message for a given BTC output amount
 * @param {string} amountString - BTC output amount
 * @param {BigNumber} inputsTotalSats - total satoshis being spent
 * @example
 * const out = "0.00000500";
 * const validationError = validateOutputAmountBTC(out, BigNumber(1000000));
 * console.log(validationError) // Output amount is too small.
 * @returns {string} empty if valid or corresponding validation message
 */
export function validateOutputAmountBTC(amountString, inputsTotalSats) {
  let amount;
  try {
    amount = new BigNumber(amountString);
  } catch(e) {
    return "Invalid output amount.";
  }

  if (amount.isLessThanOrEqualTo(ZERO)) {
    return "Output amount must be positive.";
  }

  if (amount.isLessThanOrEqualTo(satoshisToBitcoins(DUST_LIMIT_SATS))) {
    return "Output amount is too small.";
  }

  // Check that value does not have a fraction of a satoshi
  if (bitcoinsToSatoshis(amount).dp()) {
    return "Invalid output amount.";
  }

  if (amount.isGreaterThan(satoshisToBitcoins(inputsTotalSats))) {
    return "Output amount is too large.";
  }

  return '';
}

