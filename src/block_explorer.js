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
 * @example
 * const path = "/block/00000000000000000011341d69792271766e4683e29b3ea169eacc59bde10a57";
 * const url = blockExplorerURL(path, NETWORKS.MAINNET);
 * console.log(url) // https://blockstream.info/block/00000000000000000011341d69792271766e4683e29b3ea169eacc59bde10a57
 * @returns {string} the full block explorer url
 */
export function blockExplorerURL(path, network) {
  return `${blockExplorerBaseURL(network, false)}${path}`;
}

/**
 * Formats the proper API URL based on the api path and network.
 * @param {string} path - the api path
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @example
 * const path = "/tx/1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0";
 * const url = blockExplorerAPIURL(path, NETWORKS.MAINNET);
 * console.log(url); // https://blockstream.info/api/tx/1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0
 * @returns {string} the full block explorer url
 */
export function blockExplorerAPIURL(path, network) {
  return `${blockExplorerBaseURL(network, false)}/api${path}`;
}

/**
 * Formats the proper URL for a transaction on a given network.
 * @param {string} txid - the transaction id to look up
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @example
 * const txid = "1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0";
 * const url = blockExplorerTransactionURL(txid, NETWORKS.MAINNET);
 * console.log(url); // https://blockstream.info/tx/1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0
 * @returns {string} the full transaction URL
 */
export function blockExplorerTransactionURL(txid, network) {
  return blockExplorerURL(`/tx/${txid}`, network);
}

/**
 * Formats the proper URL for an address on a given network.
 * @param {string} address the address to look up
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @example
 * const address = "39YqNoLULDpbjmeCTdGJ42DQhrQLzRcMdX";
 * const url = blockExplorerAddressURL(address, NETWORKS.MAINNET);
 * console.log(url); // https://blockstream.info/address/39YqNoLULDpbjmeCTdGJ42DQhrQLzRcMdX
 * @returns {string} full URL for address lookup
 */
export function blockExplorerAddressURL(address, network) {
  return blockExplorerURL(`/address/${address}`, network);
}
