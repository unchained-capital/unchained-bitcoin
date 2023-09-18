/**
 * This module provides functions for calculating & validating
 * transaction fees.
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
 */
const MAX_FEE_RATE_SATS_PER_VBYTE = new BigNumber(1000); // 1000 Sats/vbyte

/**
 * Maxmium acceptable transaction fee in Satoshis.
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
