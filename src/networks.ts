import { networks } from "bitcoinjs-lib";

/**
 * This module exports network constants and provide some utility
 * functions for displaying the network name and passing the network
 * value to bitcoinjs.
 */
/* eslint-disable no-shadow */
export enum Networks {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  REGTEST = "regtest",
  SIGNET = "signet",
}

/**
 * Returns bitcoinjs-lib network object corresponding to the given
 * network.
 *
 * This function is for internal use by this library.
 */
export function networkData(network) {
  switch (network) {
    case Networks.MAINNET:
      return networks.bitcoin;
    case Networks.TESTNET:
      return networks.testnet;
    default:
      return networks.testnet;
  }
}

/**
 * Returns human-readable network label for the specified network.
 */
export function networkLabel(network) {
  switch (network) {
    case Networks.MAINNET:
      return "Mainnet";
    case Networks.TESTNET:
      return "Testnet";
    default:
      return "Testnet";
  }
}

/**
 * given a prefix determine the network it indicates
 */
export function getNetworkFromPrefix(prefix) {
  switch (prefix.toLowerCase()) {
    case "xpub":
    case "ypub":
    case "zpub":
      return Networks.MAINNET;

    case "tpub":
    case "upub":
    case "vpub":
      return Networks.TESTNET;

    default:
      throw new Error(`Unrecognized extended public key prefix ${prefix}`);
  }
}
