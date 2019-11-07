# Unchained Capital Bitcoin Utilities

[![Build Status](https://travis-ci.com/unchained-capital/unchained-bitcoin.svg?branch=master)](https://travis-ci.com/unchained-capital/unchained-bitcoin)

This library builds on the excellent
[bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib), adding
valuable but missing functionality for validation, HD wallets, block
explorers, and especially multisig.

Full API documentation can be found at
[unchained-bitcoin](https://unchained-capital.github.io/unchained-bitcoin).

This library was built and is maintained by [Unchained
Capital](https://www.unchained-capital.com).

## Installation

`unchained-bitcoin` is distributed as an NPM package.  Add it to your
application's dependencies:

```
$ npm install --save unchained-bitcoin
```

## Usage

The library provides a functional API which builds upon data
structures used by `bitcoinjs-lib`.

In particular, many functions accept a `multisig` argument which is
the kind of object returned by functions such as
`bitcoin.payments.p2ms`, `bitcoin.payments.p2sh`, &c. from
`bitcoinjs-lib`.

The examples below provide an initial idea of how to use this library,
but see the
[API documentation](https://unchained-capital.github.io/unchained-bitcoin)
for full details.

### Interacting with a multisig address.

#### Generating multisigs

Multisignature objects can be generated with two functions:

* `generateMultisigFromPublicKeys` -- useful when directly passing public keys
* `generateMultisigFromHex` -- useful when parsing an existing redeem script

Each of these functions accepts additional arguments which determines
the multisig address type (e.g. P2SH or P2WSH).

```javasacript
import {
	generateMultisigFromPublicKeys,
	P2SH,                      // or: P2SH_P2WSH, P2WSH
	MAINNET,                   // or: TESTNET
} from "unchained-bitcoin";

// Public keys are represented as compressed hex.
const publicKeys = [
	"03d703e0d7622f087f27e18b61b1c131d4a7b868a4960ab66d89c76f9daf1a1569",
	"031c27e952c332fc0630e29d6ec2a10ba18c33cf096ccaeb7620983e0daf625946",
	"03f6eed874ad71db090325dc92ccec9b722187dfd4aac19c9f54b9047bc4fac2b0",
];

// A mainnet P2SH 2-of-3 multisig.
const multisig = generateMultisigFromPublicKeys(MAINNET, P2SH, 2, ...publicKeys);
```

#### Querying multisigs

The `multisig` object above can be passed around and queried with
other functions in the API.

```javascript

multisigAddress(multisig); // Returns public address
multisigAddressType(multisig); // P2SH
multisigRequiredSigners(multisig); // 2
multisigTotalSigners(multisig); // 3
multisigRedeemScript(multisig); // Returns redeem script in hex
multisigWitnessScript(multisig); // Returns witness script in hex (null for P2SH)
multisigPublicKeys(multisig); // Returns publicKeys
```

#### Validation

This library contains several useful functions for validation not
provided by `bitcoinjs-lib` or other libraries.  The validation
functions are designed to return an empty string `''` on valid input
and provide a helpful error message otherwise.

* `validateAddress` -- understands Bech32 addresses and is aware of
  differences in addresses across networks

* `valdiateBIP32Path` -- understands absolute and relative BIP32
  paths, validates maximum BIP32 index values, and can optionally
  check for fully hardened or unhardened paths

* `validateExtendedPublicKey` -- understands network-dependent
  differences in encoding extended public keys

* `validatePublicKey` -- allows any hexadecimal value

* `validateFeeRate` -- implements a reasonable maximum fee rate in
  Satoshis/byte

* `validateFee` -- implements a reasonable maximum fee in BTC

* `validateOutputAmount` -- checks for dust and that amount is less
  than total input amount

* `validateMultisigSignature` -- checks signatures for correctness and
  works across all multisig address types

## Developers

Developers who want to work on this library should clone the source
code and install dependencies:

```
$ git clone https://github.com/unchained-capital/unchained-bitcoin`
...
$ cd unchained-bitcoin
$ npm install
```

### Testing

Unit tests are implemented in Jest and can be run via

```
$ npm test
```

### Contributing

Unchained Capital welcomes bug reports, new features, and better documentation for this library.

If you are fixing a bug or adding a feature, please first check the [GitHub issues page](https://github.com/unchained-capital/unchained-bitcoin/issues) to see if there is any existing discussion about it.

To contribute, create a pull request (PR) on GitHub against the [Unchained Capital fork of unchained-bitcoin](https://github.com/unchained-capital/unchained-bitcoin).

Before you submit your PR, make sure to update and run the test suite!
