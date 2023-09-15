/**
 * This module provides validation messages related to addresses.
 */

import bitcoinAddressValidation from "bitcoin-address-validation";

import { Networks } from "./networks";

const MAINNET_ADDRESS_MAGIC_BYTE_PATTERN = "^(bc1|[13])";
const TESTNET_ADDRESS_MAGIC_BYTE_PATTERN = "^(tb1|bcrt1|[mn2])";
const ADDRESS_BODY_PATTERN = "[A-HJ-NP-Za-km-z1-9]+$";
const BECH32_ADDRESS_MAGIC_BYTE_REGEX = /^(tb|bc)/;
const BECH32_ADDRESS_BODY_PATTERN = "[ac-hj-np-z02-9]+$";

/**
 * Validate a given bitcoin address.
 *
 * Address must be a valid address on the given bitcoin network.
 */
export function validateAddress(address: string, network) {
  if (!address || address.trim() === "") {
    return "Address cannot be blank.";
  }

  const magic_byte_regex =
    network === Networks.TESTNET
      ? TESTNET_ADDRESS_MAGIC_BYTE_PATTERN
      : MAINNET_ADDRESS_MAGIC_BYTE_PATTERN;
  const isBech32 = address.match(BECH32_ADDRESS_MAGIC_BYTE_REGEX);
  const address_body_regex = isBech32
    ? BECH32_ADDRESS_BODY_PATTERN
    : ADDRESS_BODY_PATTERN;
  const address_regex = magic_byte_regex + address_body_regex;
  // This tests whether you've got the network lined up with address type or not
  if (!address.match(address_regex)) {
    if (network === Networks.TESTNET) {
      return "Address must start with one of 'tb1', 'm', 'n', or '2' followed by letters or digits.";
    } else {
      return "Address must start with either of 'bc1', '1' or '3' followed by letters or digits.";
    }
  }

  return bitcoinAddressValidation(address) ? "" : "Address is invalid.";
}
