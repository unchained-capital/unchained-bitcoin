/**
 * This module provides various helper functions for the Blockstream block explorer and associated API.
 * Use this to easily access the block explorer links and API endpoint URLs
 * @module block_explorer
 */

import {NETWORKS} from "./networks";

const BASE_URL_MAINNET = 'https://blockstream.info';
const BASE_URL_TESTNET = 'https://blockstream.info/testnet';

 function blockExplorerBaseURL(network, api) {
  return (network === NETWORKS.TESTNET ? BASE_URL_TESTNET : BASE_URL_MAINNET);
}

/**
 * Formats the proper URL based on the block explorer path and network.
 * @param {string} path - the explorer path
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} the full block explorer url
 */
export function blockExplorerURL(path, network) {
  return `${blockExplorerBaseURL(network, false)}${path}`;
}

/**
 * Formats the proper API URL based on the api path and network.
 * @param {string} path - the api path
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} the full block explorer url
 */
export function blockExplorerAPIURL(path, network) {
  return `${blockExplorerBaseURL(network, false)}/api${path}`;
}

/**
 * Formats the proper URL for a transaction on a given network.
 * @param {string} txid - the transaction id to look up
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} the full transaction URL
 */
export function blockExplorerTransactionURL(txid, network) {
  return blockExplorerURL(`/tx/${txid}`, network);
}

/**
 * Formats the proper URL for an address on a given network.
 * @param {string} address the address to look up
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} full URL for address lookup
 */
export function blockExplorerAddressURL(address, network) {
  return blockExplorerURL(`/address/${address}`, network);
}
