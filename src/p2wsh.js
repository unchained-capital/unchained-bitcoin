/**
 * This module provides a utility function for P2WSH address type.
 * @module p2wsh
 */

/**
 * Estimate the transaction vsize for P2WSH address type.
 * @param {Object} config - configuration for the calculation
 * @param {number} config.numInputs - input count used for calculation
 * @param {number} config.numOutputs - output count used for calculation
 * @param {number} config.m - number of required signers for the quorum
 * @param {number} config.n - number of total signers for the quorum
 * @returns {number} estimated transaction vsize in bytes
 */
export function estimateMultisigP2WSHTransactionLength(config) {
  const baseSize = 41 * config.numInputs + 34 * config.numOutputs + 30
  const signatureLength = 72
  const overhead = 6
  const keylength = 33
  const witnessSize = signatureLength*config.m*config.numInputs + keylength*config.n*config.numInputs + overhead*config.numInputs 
  const vsize = Math.ceil(0.75*baseSize + 0.25*(baseSize + witnessSize))

  return vsize
  
}
