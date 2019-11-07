import {
    bip32PathToSequence, bip32SequenceToPath, validateBIP32Path,
    deriveChildPublicKey, deriveChildExtendedPublicKey, HARDENING_OFFSET
} from './bip32';
import { NETWORKS } from './networks';
import { emptyValues, bip32TestKeys, validPaths, badBIP32paths, badUnhardened, badHardened } from './test_constants'

describe("Test BIP32 library", () => {
    describe("Test bip32PathToSequence", () => {
        it('should properly convert a BIP32 path to a sequence of integers', () => {
            validPaths.forEach(p => {
                const sequence = bip32PathToSequence(p.path)
                expect(sequence).toEqual(p.sequence);
            })
        });
    })

    describe("Test bip32SequenceToPath", () => {
        it('should properly convert a BIP32 sequence of integers to a BIP32 path', () => {
            validPaths.forEach(p => {
                const path = bip32SequenceToPath(p.sequence);
                expect(path).toEqual(p.path);
            });
        });
    })

    describe("Test validateBIP32Path", () => {
        describe("Validate BIP32 paths with no options", () => {
            it('should properly report empty values used as a BIP32 path', () => {
                emptyValues.forEach(b => {
                    const result = validateBIP32Path(b);
                    expect(result).toBe("BIP32 path cannot be blank.");
                });
            });

            it('should properly report invalid BIP32 paths', () => {
                badBIP32paths.forEach(b => {
                    const result = validateBIP32Path(b);
                    expect(result).toBe("BIP32 path is invalid.");
                });
            });

            it('should not provide a validation message for a valid BIP32 path', () => {
                validPaths.forEach(p => {
                    const result = validateBIP32Path(p.path);
                    expect(result).toEqual("");
                });
            });

            it('should properly report a path segment that is out of range', () => {
                const result = validateBIP32Path(`m/0/${HARDENING_OFFSET * 2}`);
                expect(result).toEqual("BIP32 index is too high.");
            });
        })

        describe("Validate BIP32 paths with options", () => {
            it('should properly report the use of unhardened paths with "hardened" option', () => {
                badUnhardened.forEach(b => {
                    const result = validateBIP32Path(b, { mode: "hardened" });
                    expect(result).toBe("BIP32 path must be fully-hardened.");
                });
            });

            it('should properly report the use of hardened paths with "unhardened" option', () => {
                badHardened.forEach(b => {
                    const result = validateBIP32Path(b, { mode: "unhardened" });
                    expect(result).toBe("BIP32 path cannot include hardened segments.");
                });
            });
        })
    })

    // "BIP32 path segment cannot be blank." seems unreachable
    // "Invalid BIP32 path segment." unreachable


    describe("Test deriveChildPublicKey", () => {
        it('should properly derive child public keys for mainnet', () => {
            bip32TestKeys.forEach(key => {
                key.main.forEach(main => {
                    const result = deriveChildPublicKey(key.xpub, main.path, NETWORKS.MAINNET);
                    expect(result).toBe(main.pub);
                })
            })
        });

        it('should properly derive child public keys for testnet', () => {
            bip32TestKeys.forEach(key => {
                key.main.forEach(main => {
                    const result = deriveChildPublicKey(key.tpub, main.path, NETWORKS.TESTNET);
                    expect(result).toBe(main.pub);
                })
            })
        });
    })

    describe("Test deriveChildExtendedPublicKey", () => {
        it('should properly derive child extended public keys for mainnet', () => {
            bip32TestKeys.forEach(key => {
                key.main.forEach(main => {
                    const result = deriveChildExtendedPublicKey(key.xpub, main.path, NETWORKS.MAINNET);
                    expect(result).toBe(main.xpub);
                })
            })
        });

        it('should properly derive child extended public keys for testnet', () => {
            bip32TestKeys.forEach(key => {
                key.main.forEach(main => {
                    const result = deriveChildExtendedPublicKey(key.tpub, main.path, NETWORKS.TESTNET);
                    expect(result).toBe(main.tpub);
                });
            });
        });
    });

});
