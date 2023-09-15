/**
 * This module provides functions and constants for the P2SH address type.
 *
 * @module p2sh
 */

/**
 * Address type constant for "pay-to-script-hash" (P2SH) addresses.
 */
export const P2SH = "P2SH";

/**
 * Estimate the transaction virtual size (vsize) when spending inputs
 * from the same multisig P2SH address.
 *
 * @param {Object} config - configuration for the calculation
 * @param {number} config.numInputs - number of m-of-n multisig P2SH inputs
 * @param {number} config.numOutputs - number of outputs
 * @param {number} config.m - required signers
 * @param {number} config.n - total signers
 * @returns {number} estimated transaction virtual size in bytes
 */
export function estimateMultisigP2SHTransactionVSize(config) {
  const baseSize = 41 * config.numInputs + 34 * config.numOutputs + 30;
  const signatureLength = 72 + 1; // approx including push byte
  const scriptOverhead = 4;
  const keylength = 33 + 1; // push byte
  const sigSize =
    signatureLength * config.m * config.numInputs +
    keylength * config.n * config.numInputs +
    scriptOverhead * config.numInputs;
  const vsize = baseSize + sigSize;
  return vsize;
}
