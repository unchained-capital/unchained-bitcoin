/**
 * This module provides functions for calculating & validating
 * transaction fees.
 *
 * @module fees
 */

import BigNumber from "bignumber.js";

import { P2SH, estimateMultisigP2SHTransactionVSize } from "./p2sh";
import {
  P2SH_P2WSH,
  estimateMultisigP2SH_P2WSHTransactionVSize,
} from "./p2sh_p2wsh";
import { P2WSH, estimateMultisigP2WSHTransactionVSize } from "./p2wsh";
import { ZERO } from "./utils";

// Without this, BigNumber will report strings as exponentials. 16 places covers
// all possible values in satoshis.
BigNumber.config({ EXPONENTIAL_AT: 16 });

/**
 * Maxmium acceptable transaction fee rate in Satoshis/vbyte.
 *
 * @constant
 * @type {BigNumber}
 * @default 1000 Satoshis/vbyte
 *
 */
const MAX_FEE_RATE_SATS_PER_VBYTE = new BigNumber(1000); // 1000 Sats/vbyte

/**
 * Maxmium acceptable transaction fee in Satoshis.
 *
 * @constant
 * @type {BigNumber}
 * @default 2500000 Satoshis (=0.025 BTC)
 */
const MAX_FEE_SATS = new BigNumber(2500000); // ~ 0.025 BTC ~ $250 if 1 BTC = $10k

/**
 * Validate the given transaction fee rate (in Satoshis/vbyte).
 *
 * - Must be a parseable as a number.
 *
 * - Cannot be negative (zero is OK).
 *
 * - Cannot be greater than the limit set by
 *   `MAX_FEE_RATE_SATS_PER_VBYTE`.
 *
 * @param {string|number|BigNumber} feeRateSatsPerVbyte - the fee rate in Satoshis/vbyte
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {validateFeeRate} from "unchained-bitcoin";
 * console.log(validateFeeRate(-1)); // "Fee rate must be positive."
 * console.log(validateFeeRate(10000)); // "Fee rate is too high."
 * console.log(validateFeeRate(250)); // ""
 */
export function validateFeeRate(feeRateSatsPerVbyte) {
  let fr;
  try {
    fr = new BigNumber(feeRateSatsPerVbyte);
  } catch (e) {
    return "Invalid fee rate.";
  }
  if (!fr.isFinite()) {
    return "Invalid fee rate.";
  }
  if (fr.isLessThan(ZERO)) {
    return "Fee rate cannot be negative.";
  }
  if (fr.isGreaterThan(MAX_FEE_RATE_SATS_PER_VBYTE)) {
    return "Fee rate is too high.";
  }
  return "";
}

/**
 * Validate the given transaction fee (in Satoshis).
 *
 * - Must be a parseable as a number.
 *
 * - Cannot be negative (zero is OK).
 *
 * - Cannot exceed the total input amount.
 *
 * - Cannot be higher than the limit set by `MAX_FEE_SATS`.
 *
 * @param {string|number|BigNumber} feeSats - fee in Satoshis
 * @param {string|number|BigNumber} inputsTotalSats - total input amount in Satoshis
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {validateFee} from "unchained-bitcoin";
 * console.log(validateFee(3000000, 10000000)) // "Fee is too high."
 * console.log(validateFee(30000, 20000)) // "Fee is too high."
 * console.log(validateFee(-30000)) // "Fee cannot be negative."
 * console.log(validateFee(30000, 10000000)) // ""
 */
export function validateFee(feeSats, inputsTotalSats) {
  let fs, its;
  try {
    fs = new BigNumber(feeSats);
  } catch (e) {
    return "Invalid fee.";
  }
  if (!fs.isFinite()) {
    return "Invalid fee.";
  }
  try {
    its = new BigNumber(inputsTotalSats);
  } catch (e) {
    return "Invalid total input amount.";
  }
  if (!its.isFinite()) {
    return "Invalid total input amount.";
  }
  if (fs.isLessThan(ZERO)) {
    return "Fee cannot be negative.";
  }
  if (its.isLessThanOrEqualTo(ZERO)) {
    return "Total input amount must be positive.";
  }
  if (fs.isGreaterThan(its)) {
    return "Fee is too high.";
  }
  if (fs.isGreaterThan(MAX_FEE_SATS)) {
    return "Fee is too high.";
  }
  return "";
}

/**
 * Estimate transaction fee rate based on actual fee and address type, number of inputs and number of outputs.
 *
 * @param {Object} config - configuration for the calculation
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} config.addressType - address type used for estimation
 * @param {number} config.numInputs - number of inputs used in calculation
 * @param {number} config.numOutputs - number of outputs used in calculation
 * @param {number} config.m - number of required signers for the quorum
 * @param {number} config.n - number of total signers for the quorum
 * @param {BigNumber} config.feesInSatoshis - total transaction fee in satoshis
 * @example
 * import {estimateMultisigP2WSHTransactionFeeRate} from "unchained-bitcoin";
 * // get the fee rate a P2WSH multisig transaction with 2 inputs and 3 outputs with a known fee of 7060
 * const feerate = estimateMultisigTransactionFeeRate({
 *   addressType: P2WSH,
 *   numInputs: 2,
 *   numOutputs: 3,
 *   m: 2,
 *   n: 3,
 *   feesInSatoshis: 7060
 * });
 *
 *
 * @returns {string|null} estimated fee rate or null if vSize is null
 */
export function estimateMultisigTransactionFeeRate(config) {
  const vSize = estimateMultisigTransactionVSize(config);

  if (vSize === null) {
    return null;
  }

  return new BigNumber(config.feesInSatoshis).dividedBy(vSize).toString();
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
 * import {estimateMultisigP2WSHTransactionFee} from "unchained-bitcoin";
 * const fee = estimateMultisigTransactionFee({
 *   addressType: P2SH,
 *   numInputs: 2,
 *   numOutputs: 3,
 *   m: 2,
 *   n: 3,
 *   feesPerByteInSatoshis: 10
 * });
 * @returns {string|null} estimated transaction fee in satoshis or null if vSize is null
 */
export function estimateMultisigTransactionFee(config) {
  const vSize = estimateMultisigTransactionVSize(config);

  if (vSize === null) {
    return null;
  }

  const feeAsNumber = new BigNumber(config.feesPerByteInSatoshis)
    .multipliedBy(vSize)
    .toNumber();

  // In the case that feesPerByteInSatoshis is a float, feeAsNumber might be a
  // float. A fraction of a satoshi is not possible on-chain. Estimate worse
  // case fee and calculate ceil.
  return Math.ceil(feeAsNumber).toString();
}

function estimateMultisigTransactionVSize(config) {
  switch (config.addressType) {
    case P2SH:
      return estimateMultisigP2SHTransactionVSize(config);
    case P2SH_P2WSH:
      return estimateMultisigP2SH_P2WSHTransactionVSize(config);
    case P2WSH:
      return estimateMultisigP2WSHTransactionVSize(config);
    default:
      return null;
  }
}
