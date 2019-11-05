/**
 * This module provides script conversion functions.
 * @module script
 */

 const bitcoin = require('bitcoinjs-lib');

/**
 * Extracts the asm representation of a script from a Multisig object.
 * @param {Multisig} script - Multisig object to parse
 * @returns {string} asm representation of script
 */
export function scriptToOps(script) {
  return bitcoin.script.toASM(script.output);
}

/**
 * Extracts the hex representation of a script from a Multisig object.
 * @param {Multisig} script - Multisig object to parse
 * @returns {string} hex representation of script
 */
export function scriptToHex(script) {
  return script.output.toString('hex');
}

