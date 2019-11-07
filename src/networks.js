const bitcoin = require('bitcoinjs-lib');

/**
 * This module provides network constant enumerations and utility function.
 * @module networks
 */

/**
 * @constant {string} - Constant for selection of the bitcoin mainnet network.
 */
export const MAINNET = "mainnet";

/**
 * @constant {string} - Constant for selection of the bitcoin testnet netwrok.
 */
export const TESTNET = "testnet";

/**
 * @enum {string} Enumeration of possible values for bitcoin networks ([MAINET]{@link module:networks.MAINNET}|[TESTNET]{@link module:networks.TESTNET}).
 */
export const NETWORKS = {
  MAINNET,
  TESTNET,
};

/**
 * Returns network configuration object for the specified network for internal use.
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @example
 * const key = bip32.fromBase58(extendedPublicKey, networkData(NETWORKS.MAINNET));
 * const child = key.derivePath("m/0/0");
 * @returns {Network} network object for use as a parameter to other functions where needed, do not access directly
 */
export function networkData(network) {
  switch (network) {
    case NETWORKS.MAINNET:
      return bitcoin.networks.bitcoin;
    case NETWORKS.TESTNET:
      return bitcoin.networks.testnet;
    default:
      return bitcoin.networks.testnet;
  }
}

/**
 * Returns human-readable network label for the specified network.
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} network label
 */
export function networkLabel(network) {
  switch (network) {
    case NETWORKS.MAINNET:
      return "Mainnet";
    case NETWORKS.TESTNET:
      return "Testnet";
    default:
      return "Testnet";
  }
}
