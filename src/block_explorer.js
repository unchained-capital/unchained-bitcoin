/**
 * This module provides functions for creating URLs for Blockstream's
 * [block explorer]{@link https://blockstream.info}.
 *
 * This module does NOT provide implementations of HTTP requests which
 * fetch data from these URLs.
 * 
 * @module block_explorer
 */

import {TESTNET} from "./networks";

const BASE_URL_MAINNET = 'https://blockstream.info';
const BASE_URL_TESTNET = 'https://blockstream.info/testnet';

function blockExplorerBaseURL(network) {
  return (network === TESTNET ? BASE_URL_TESTNET : BASE_URL_MAINNET);
}

/**
 * Returns the block explorer URL for the given path and network.
 * 
 * @param {string} path - the explorer path
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} the block explorer url
 * @example
 * import {MAINNET, TESTNET, blockExplorerURL} from "unchained-bitcoin";
 * const path = "/block/00000000000000000011341d69792271766e4683e29b3ea169eacc59bde10a57";
 * console.log(blockExplorerURL(path, MAINNET)) // https://blockstream.info/block/00000000000000000011341d69792271766e4683e29b3ea169eacc59bde10a57
 * console.log(blockExplorerURL(path, TESTNET)) // https://blockstream.info/block/testnet/00000000000000000011341d69792271766e4683e29b3ea169eacc59bde10a57
 */
export function blockExplorerURL(path, network) {
  return `${blockExplorerBaseURL(network)}${path}`;
}

/**
 * Returns the block explorer API URL for the given path and network.
 * 
 * @param {string} path - the API path
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} the full block explorer url
 * @example
 * import {MAINNET, TESTNET, blockExplorerAPIURL} from "unchained-bitcoin";
 * const path = "/tx/1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0";
 * console.log(blockExplorerAPIURL(path, MAINNET)); // https://blockstream.info/api/tx/1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0
 * console.log(blockExplorerAPIURL(path, TESTNET)); // https://blockstream.info/testnet/api/tx/1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0
 */
export function blockExplorerAPIURL(path, network) {
  return `${blockExplorerBaseURL(network)}/api${path}`;
}

/**
 * Return the block explorer URL for the given transaction ID and network.
 * 
 * @param {string} txid - the transaction id
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} the full transaction URL
 * @example
 * import {MAINNET, TESTNET, blockExplorerTransactionURL} from "unchained-bitcoin";
 * const txid = "1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0";
 * console.log(blockExplorerTransactionURL(txid, MAINNET)); // https://blockstream.info/tx/1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0
 * console.log(blockExplorerTransactionURL(txid, TESTNET)); // https://blockstream.info/testnet/tx/1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0
 */
export function blockExplorerTransactionURL(txid, network) {
  return blockExplorerURL(`/tx/${txid}`, network);
}

/**
 * Return the block explorer URL for the given address and network.
 * 
 * @param {string} address - the address
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} full URL for address lookup
 * @example
 * import {MAINNET, TESTNET, blockExplorerAddressURL} from "unchained-bitcoin";
 * const address = "39YqNoLULDpbjmeCTdGJ42DQhrQLzRcMdX";
 * console.log(blockExplorerAddressURL(address, MAINNET)); // https://blockstream.info/address/39YqNoLULDpbjmeCTdGJ42DQhrQLzRcMdX
 * console.log(blockExplorerAddressURL(address, TESTNET)); // https://blockstream.info/testnet/address/39YqNoLULDpbjmeCTdGJ42DQhrQLzRcMdX
 */
export function blockExplorerAddressURL(address, network) {
  return blockExplorerURL(`/address/${address}`, network);
}
