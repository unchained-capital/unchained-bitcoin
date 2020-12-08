const bitcoin = require('bitcoinjs-lib');

/**
 * This module exports network constants and provide some utility
 * functions for displaying the network name and passing the network
 * value to bitcoinjs.
 * 
 * @module networks
 */

/**
 * Constant corresponding to the Bitcoin mainnet.
 * 
 * @constant
 * @type {string}
 * @default mainnet
 * 
 */
export const MAINNET = "mainnet";

/**
 * Constant corresponding to the current Bitcoin testnet.
 * 
 * @constant
 * @type {string}
 * @default testnet
 */
export const TESTNET = "testnet";

/**
 * Enumeration of possible values for bitcoin networks ([MAINET]{@link module:networks.MAINNET}|[TESTNET]{@link module:networks.TESTNET}).
 *
 * @constant
 * @enum {string}
 * @default
 */
export const NETWORKS = {
  MAINNET,
  TESTNET,
};

/**
 * Returns bitcoinjs-lib network object corresponding to the given
 * network.
 *
 * This function is for internal use by this library.
 * 
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {Network} bitcoinjs-lib network object
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
 * 
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} network label
 * @example
 * import {MAINNET} from "unchained-bitcoin";
 * console.log(networkLabel(MAINNET)); // "Mainnet"
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

/**
 * @description given a prefix determine the network it indicates
 * @param {string} prefix - extended public key prefix (e.g. xpub, tpub)
 * @returns {string} - string indicating network
 */
export function getNetworkFromPrefix(prefix) {
  switch (prefix.toLowerCase()) {
    case 'xpub':
    case 'ypub':
    case 'zpub':
      return MAINNET;

    case 'tpub':
    case 'upub':
    case 'vpub':
      return TESTNET;

    default:
      throw new Error(`Unrecognized extended public key prefix ${prefix}`)
  }
}
