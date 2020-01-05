/**
 * This module provides validation messages related to addresses.
 * 
 * @module address
 */

import bitcoinAddressValidation from "bitcoin-address-validation";

import { TESTNET, MAINNET } from "./networks";

const MAINNET_ADDRESS_MAGIC_BYTE_PATTERN = "^(bc1|[13])";
const TESTNET_ADDRESS_MAGIC_BYTE_PATTERN = "^(tb1|bcrt1|[mn2])";
const ADDRESS_BODY_PATTERN = "[A-HJ-NP-Za-km-z1-9]+$";
const BECH32_ADDRESS_MAGIC_BYTE_REGEX = /^(tb|bc)/;
const BECH32_ADDRESS_BODY_PATTERN = "[ac-hj-np-z02-9]+$";

/**
 * Validate a given bitcoin address.
 *
 * Address must be a valid address on the given bitcoin network.
 * 
 * @param {string} address - the address to validate
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {MAINNET, TESTNET, validateAddress} from "unchained-bitcoin";
 * console.log(validateAddress('', MAINNET)); // "Address cannot be blank"
 * console.log(validateAddress('2Mx6Y8VRj8rmSdLfwrvnpBR7ctjctPLzpWs', MAINNET)); // "Address must start with either of 'bc1', '1' or '3' followed by letters or digits."
 * console.log(validateAddress('2Mx6Y8VRj8rmSdLfwrvnpBR7ctjctPLzpWs', TESTNET)); // ""
 * 
 */
export function validateAddress(address, network) {
  if ((! address) || address.trim() === '') {
    return 'Address cannot be blank.';
  }

  const magic_byte_regex = (network === TESTNET ? TESTNET_ADDRESS_MAGIC_BYTE_PATTERN : MAINNET_ADDRESS_MAGIC_BYTE_PATTERN);
  const isBech32 = address.match(BECH32_ADDRESS_MAGIC_BYTE_REGEX);
  const address_body_regex = (isBech32 ? BECH32_ADDRESS_BODY_PATTERN : ADDRESS_BODY_PATTERN);
  const address_regex = magic_byte_regex + address_body_regex;
  if (! address.match(address_regex)) {
    if (network === TESTNET) {
      return "Address must start with one of 'tb1', 'm', 'n', or '2' followed by letters or digits.";
    } else {
      return "Address must start with either of 'bc1', '1' or '3' followed by letters or digits.";
    }
  }

  // try {
  //   // FIXME does this support Bech32 addresses?
  //   bitcoin.address.toOutputScript(address, network);
  // } catch (e) {
  //   return `Address is invalid: ${e}`;
  // }

  const result = bitcoinAddressValidation(address);
  if (result) {
    if (network === TESTNET && (!result.testnet)) {
      return `This is a ${MAINNET} address.`;
    }
    if (network === MAINNET && result.testnet) {
      return `This is a ${TESTNET} address.`;
    }
  } else {
    return "Address is invalid.";
  }

  return '';
}
