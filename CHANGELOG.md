# Changelog

## [0.5.1](https://github.com/unchained-capital/unchained-bitcoin/compare/unchained-bitcoin-v0.5.0...unchained-bitcoin-v0.5.1) (2023-05-30)


### Bug Fixes

* **braid:** allow for regtest braids ([06b05fb](https://github.com/unchained-capital/unchained-bitcoin/commit/06b05fb8b70feed7f6ecc1b9bf333746f9f9cf9d))

## [0.5.0](https://github.com/unchained-capital/unchained-bitcoin/compare/unchained-bitcoin-v0.4.1...unchained-bitcoin-v0.5.0) (2023-04-06)


### Features

* add minSats to the validateOutputAmount function. Fix missing package ([52b3c60](https://github.com/unchained-capital/unchained-bitcoin/commit/52b3c6091b9656fbd1ae86587a054b1551d6c621))


### Bug Fixes

* add test ([31ab2de](https://github.com/unchained-capital/unchained-bitcoin/commit/31ab2de309360fa5824b1cddeba8e2910838767b))

## [0.4.1](https://github.com/unchained-capital/unchained-bitcoin/compare/unchained-bitcoin-v0.4.0...unchained-bitcoin-v0.4.1) (2023-03-31)


### Bug Fixes

* **keys:** include regtest for tpub validation ([a298eb8](https://github.com/unchained-capital/unchained-bitcoin/commit/a298eb8a618dddd2823b30f5c6e933db1dff1b5e))

## Changelog

## Version 0.0.12

### Added

- ExtendedPublicKey class for encoding and decoding xpubs

### Changed

- Basic linting fixes

## Version 0.0.11

### Added

- Support for conversion between different xpub prefixes/versions
- Test fixtures for different extended public key versions

## Version 0.0.9

### Changed

Include Bech32 outputs for P2WSH fixtures & tests.

## Version 0.0.8

### Added

- Utilities for working with extended public keys, useful for
  extracting xpubs from Ledger devices.

### Changed

- `docs` tree is now in its own `gh-pages` branch

## Version 0.0.7

### Changed

Major refactoring of documentation and API.

## Version 0.0.6

### Added

- `CHANGELOG.md` file

### Changed

- Input & output amounts are forced to BigNumber

### Removed

- Unused arguments in some block explorer functions
