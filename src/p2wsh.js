/**
 * This module provides functions and constants for the P2WSH address type.
 * 
 * @module p2wsh
 */

/**
 * Address type constant for "pay-to-witness-script-hash" or (P2WSH)
 * addresses.
 * 
 * @constant
 * @type {string}
 * @default P2WSH
 */
export const P2WSH = "P2WSH";


/**
 * Estimate the transaction virtual size (vsize) when spending inputs
 * from the same multisig P2WSH address.
 *
 * @param {Object} config - configuration for the calculation
 * @param {number} config.numInputs - number of m-of-n multisig P2SH inputs
 * @param {number} config.numOutputs - number of outputs
 * @param {number} config.m - required signers
 * @param {number} config.n - total signers
 * @returns {number} estimated transaction virtual size in bytes
 */
export function estimateMultisigP2WSHTransactionVSize(config) {
  const baseSize = 41 * config.numInputs + 34 * config.numOutputs + 30;
  const signatureLength = 72;
  const overhead = 6;
  const keylength = 33;
  const witnessSize = signatureLength*config.m*config.numInputs + keylength*config.n*config.numInputs + overhead*config.numInputs;
  const vsize = Math.ceil(0.75*baseSize + 0.25*(baseSize + witnessSize));
  return vsize;
}
