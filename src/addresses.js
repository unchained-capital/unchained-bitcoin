/**
 * This modulde provides validation messages related to addresses.
 * @module address
 */

import bitcoinAddressValidation from "bitcoin-address-validation";
import { NETWORKS } from "./networks";

const MAINNET_ADDRESS_MAGIC_BYTE_PATTERN = "^(bc1|[13])";
const TESTNET_ADDRESS_MAGIC_BYTE_PATTERN = "^(tb1|bcrt1|[mn2])";
const ADDRESS_BODY_PATTERN = "[A-HJ-NP-Za-km-z1-9]+$";
const BECH32_ADDRESS_MAGIC_BYTE_REGEX = /^(tb|bc)/;
const BECH32_ADDRESS_BODY_PATTERN = "[ac-hj-np-z02-9]+$";

/**
 * Provide a validation messages for a given address.
 * @param {string} address - the address to validate
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @example
 * const validationError = validateAddress('2Mx6Y8VRj8rmSdLfwrvnpBR7ctjctPLzpWs', NETWORKS.MAINNET);
 * console.log(validationError); // Address must start with either of 'bc1', '1' or '3' followed by letters or digits.
 * @returns {string} empty if valid or corresponding validation message
 */
export function validateAddress(address, network) {
  if ((! address) || address.trim() === '') {
    return 'Address cannot be blank.';
  }

  const magic_byte_regex = (network === NETWORKS.TESTNET ? TESTNET_ADDRESS_MAGIC_BYTE_PATTERN : MAINNET_ADDRESS_MAGIC_BYTE_PATTERN);
  const isBech32 = address.match(BECH32_ADDRESS_MAGIC_BYTE_REGEX);
  const address_body_regex = (isBech32 ? BECH32_ADDRESS_BODY_PATTERN : ADDRESS_BODY_PATTERN);
  const address_regex = magic_byte_regex + address_body_regex;
  if (! address.match(address_regex)) {
    if (network === NETWORKS.TESTNET) {
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
    if (network === NETWORKS.TESTNET && (!result.testnet)) {
      return `This is a ${NETWORKS.MAINNET} address.`;
    }
    if (network === NETWORKS.MAINNET && result.testnet) {
      return `This is a ${NETWORKS.TESTNET} address.`;
    }
  } else {
    return "Address is invalid.";
  }

  return '';
}
