# Changelog

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
