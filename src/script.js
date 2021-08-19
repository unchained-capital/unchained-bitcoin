/**
 * This module provides functions for converting generic bitcoin
 * scripts to hex or opcodes.
 * 
 * @module script
 */

import {script} from "bitcoinjs-lib";

/**
 * Extracts the ASM (opcode) representation of a script from a
 * `Multisig` object.
 * 
 * @param {Multisig} multisig - Multisig object
 * @returns {string} ASM representation of script
 * @example
 * import {
 *   generateMultisigFromPublicKeys, MAINNET, P2SH,
 *   scriptToOps,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2SH, 1, "03a...", "03b...");
 * console.log(scriptToOps(multisig)) // "OP_1 03a... 03b... OP_2 OP_CHECKMULTISIG"
 * 
 */
export function scriptToOps(multisig) {
  return script.toASM(multisig.output);
}

/**
 * Extracts the hex representation of a script from a `Multisig`
 * object.
 * 
 * @param {Multisig} multisigScript - Multisig object
 * @returns {string} hex representation of script
 * @example
 * import {
 *   generateMultisigFromPublicKeys, MAINNET, P2SH,
 *   scriptToHex,
 * } from "unchained-bitcoin";
 * const multisig = generateMultisigFromPublicKeys(MAINNET, P2SH, 1, "03a...", "03b...");
 * console.log(scriptToHex(multisig)) // "5121024f355bdcb...5871aa52ae"
 * 
 */
export function scriptToHex(multisigScript) {
  return multisigScript.output.toString('hex');
}
