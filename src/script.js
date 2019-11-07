/**
 * This module provides script conversion functions.
 * @module script
 */

 const bitcoin = require('bitcoinjs-lib');

/**
 * Extracts the asm representation of a script from a Multisig object.
 * @param {Multisig} script - Multisig object to parse
 * @example
 * const redeemMultisig = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, redeemScript)
 * console.log(scriptToOps(redeemMultisig)) // OP_0 81aaef2af523f8b269ea9c8337d4fdcc3f982a668c54f63bf2d0d9dda6a662e6
 * @returns {string} asm representation of script
 */
export function scriptToOps(script) {
  return bitcoin.script.toASM(script.output);
}

/**
 * Extracts the hex representation of a script from a Multisig object.
 * @param {Multisig} script - Multisig object to parse
 * @example
 * const redeemMultisig = multisigRedeemScript(multisig)
 * console.log(scriptToHex(redeemMultisig)) // 522102e326263c35e...
 * @returns {string} hex representation of script
 */
export function scriptToHex(script) {
  return script.output.toString('hex');
}

