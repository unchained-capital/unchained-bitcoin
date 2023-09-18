/**
 * This module provides functions for creating URLs for Blockstream's
 * [block explorer]{@link https://blockstream.info}.
 *
 * This module does NOT provide implementations of HTTP requests which
 * fetch data from these URLs.
 */

import { Network } from "./networks";

const BASE_URL_MAINNET = "https://blockstream.info";
const BASE_URL_TESTNET = "https://blockstream.info/testnet";

function blockExplorerBaseURL(network) {
  return network === Network.TESTNET ? BASE_URL_TESTNET : BASE_URL_MAINNET;
}

/**
 * Returns the block explorer URL for the given path and network.
 */
export function blockExplorerURL(path, network) {
  return `${blockExplorerBaseURL(network)}${path}`;
}

/**
 * Returns the block explorer API URL for the given path and network.
 */
export function blockExplorerAPIURL(path, network) {
  return `${blockExplorerBaseURL(network)}/api${path}`;
}

/**
 * Return the block explorer URL for the given transaction ID and network.
 */
export function blockExplorerTransactionURL(txid, network) {
  return blockExplorerURL(`/tx/${txid}`, network);
}

/**
 * Return the block explorer URL for the given address and network.
 */
export function blockExplorerAddressURL(address, network) {
  return blockExplorerURL(`/address/${address}`, network);
}
