/**
 * This module provides a utility function for P2SH address type.
 * @module p2sh
 */

/**
 * Estimate the transaction size for P2SH address type.
 * @param {Object} config - configuration for the calculation
 * @param {number} config.numInputs - input count used for calculation
 * @param {number} config.numOutputs - output count used for calculation
 * @param {number} config.m - number of required signers for the quorum
 * @param {number} config.n - number of total signers for the quorum
 * @returns {number} estimated transaction size in bytes
 */
export function estimateMultisigP2SHTransactionLength(config) {
  const baseSize = 41 * config.numInputs + 34 * config.numOutputs + 30;
  const signatureLength = 72 + 1; // approx including push byte
  const scriptOverhead = 4; 
  const keylength = 33 + 1  // push byte
  const sigSize = signatureLength*config.m*config.numInputs + keylength*config.n*config.numInputs + scriptOverhead*config.numInputs;
  const vsize = baseSize + sigSize;
  return vsize;
}
