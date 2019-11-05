import {
    MULTISIG_ADDRESS_TYPES, multisigBIP32Root, multisigBIP32Path,
    multisigAddressType, multisigRequiredSigners, multisigTotalSigners,
    multisigRedeemScript, multisigWitnessScript, generateMultisigFromHex, generateMultisigFromSpec,
    multisigPublicKeys, estimateMultisigTransactionFeeRate, estimateMultisigTransactionFee,
    unsignedMultisigTransaction, validateMultisigSignature, signedMultisigTransaction
} from './multisig';
import { NETWORKS } from './networks';
import { scriptToHex } from './script';
import BigNumber from 'bignumber.js';
const BADADDR = "BADADDR"
import { redeemscripts, hashes } from './test_constants'

describe("Test multisig library", () => {
    describe("Test multisigBIP32Root", () => {
        describe("Test for P2SH address type", () => {
            it("should properly return the BIP32 P2SH root on mainnet", () => {
                const result = multisigBIP32Root(MULTISIG_ADDRESS_TYPES.P2SH, NETWORKS.MAINNET);
                expect(result).toBe("m/45'/0'/0'");

            });

            it("should properly return the BIP32 P2SH root on testnet", () => {
                const result = multisigBIP32Root(MULTISIG_ADDRESS_TYPES.P2SH, NETWORKS.TESTNET);
                expect(result).toBe("m/45'/1'/0'");
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should properly return the BIP32 P2SH-P2WSH root on mainnet", () => {
                const result = multisigBIP32Root(MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, NETWORKS.MAINNET);
                expect(result).toBe("m/48'/0'/0'/1'");

            });

            it("should properly return the BIP32 P2SH-P2WSH root on testnet", () => {
                const result = multisigBIP32Root(MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, NETWORKS.TESTNET);
                expect(result).toBe("m/48'/1'/0'/1'");
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should properly return the BIP32 MULTISIG_ADDRESS_TYPES.P2WSH root on mainnet", () => {
                const result = multisigBIP32Root(MULTISIG_ADDRESS_TYPES.P2WSH, NETWORKS.MAINNET);
                expect(result).toBe("m/48'/0'/0'/2'");
            });

            it("should properly return the BIP32 P2WSH root on testnet", () => {
                const result = multisigBIP32Root(MULTISIG_ADDRESS_TYPES.P2WSH, NETWORKS.TESTNET);
                expect(result).toBe("m/48'/1'/0'/2'");
            });
        });

        describe("Test with unkown address type", () => {
            it("should return null for an unknown address type on mainnet", () => {
                const result = multisigBIP32Root(BADADDR, NETWORKS.MAINNET);
                expect(result).toEqual(null);
            });

            it("should return null for an unknown address type on testnet", () => {
                const result = multisigBIP32Root(BADADDR, NETWORKS.TESTNET);
                expect(result).toEqual(null);
            });
        });

    });

    describe("Test multisigBIP32Path", () => {
        describe("Test for P2SH address type", () => {
            it("should properly return the BIP32 P2SH path on mainnet", () => {
                for (let i = 0; i < 10; i++) {
                    const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2SH, NETWORKS.MAINNET, i);
                    expect(result).toBe(`m/45'/0'/0'/${i}`);
                }
            });

            it("should properly return the BIP32 P2SH path on testnet", () => {
                for (let i = 0; i < 10; i++) {
                    const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2SH, NETWORKS.TESTNET, i);
                    expect(result).toBe(`m/45'/1'/0'/${i}`);
                }
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should properly return the BIP32 P2SH-P2WSH path on mainnet", () => {
                for (let i = 0; i < 10; i++) {
                    const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, NETWORKS.MAINNET, i);
                    expect(result).toBe(`m/48'/0'/0'/1'/${i}`);
                }
            });

            it("should properly return the BIP32 P2SH-P2WSH path on testnet", () => {
                for (let i = 0; i < 10; i++) {
                    const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, NETWORKS.TESTNET, i);
                    expect(result).toBe(`m/48'/1'/0'/1'/${i}`);
                }
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should properly return the BIP32 P2WSH path on mainnet", () => {
                for (let i = 0; i < 10; i++) {
                    const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2WSH, NETWORKS.MAINNET, i);
                    expect(result).toBe(`m/48'/0'/0'/2'/${i}`);
                }
            });

            it("should properly return the BIP32 P2WSH path on testnet", () => {
                for (let i = 0; i < 10; i++) {
                    const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2WSH, NETWORKS.TESTNET, i);
                    expect(result).toBe(`m/48'/1'/0'/2'/${i}`);
                }
            });
        });

        describe("Test for default index for P2SH address type", () => {
            it("should properly return the default BIP32 P2SH path on mainnet", () => {
                const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2SH, NETWORKS.MAINNET);
                expect(result).toBe(`m/45'/0'/0'/0`);
            });

            it("should properly return the default BIP32 P2SH path on testnet", () => {
                const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2SH, NETWORKS.TESTNET);
                expect(result).toBe(`m/45'/1'/0'/0`);
            });
        });

        describe("Test for default index for P2SH-P2WSH address type", () => {
            it("should properly return the default BIP32 P2SH_P2WSH path on mainnet", () => {
                const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, NETWORKS.MAINNET);
                expect(result).toBe(`m/48'/0'/0'/1'/0`);
            });

            it("should properly return the default BIP32 P2SH_P2WSH path on testnet", () => {
                const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, NETWORKS.TESTNET);
                expect(result).toBe(`m/48'/1'/0'/1'/0`);
            });
        });

        describe("Test for default index for P2WSH address type", () => {
            it("should properly return the default BIP32 P2WSH path on mainnet", () => {
                const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2WSH, NETWORKS.MAINNET);
                expect(result).toBe(`m/48'/0'/0'/2'/0`);
            });

            it("should properly return the default BIP32 P2WSH path on testnet", () => {
                const result = multisigBIP32Path(MULTISIG_ADDRESS_TYPES.P2WSH, NETWORKS.TESTNET);
                expect(result).toBe(`m/48'/1'/0'/2'/0`);
            });
        });
    });

    const TWO_OF_THREE = 0;
    const ONE_OF_TWO = 1;
    const THREE_OF_FIVE = 2;
    const TWO_OF_TWO = 3;
    describe("Test multisigAddressType", () => {
        describe("Test for P2SH address type", () => {
            it("should properly recognize P2SH address type on mainnet", () => {
                redeemscripts.forEach(r => {
                    const multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    const result = multisigAddressType(multi);
                    expect(result).toBe(MULTISIG_ADDRESS_TYPES.P2SH);
                });
            });

            it("should properly recognize P2SH address type on testnet", () => {
                redeemscripts.forEach(r => {
                    const multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    const result = multisigAddressType(multi);
                    expect(result).toBe(MULTISIG_ADDRESS_TYPES.P2SH);
                });
            });
        });

        describe("Test for P2SH_P2WSH address type", () => {
            it("should properly recognize P2SH-P2WSH address type on mainnet", () => {
                redeemscripts.forEach(r => {
                    const multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    const result = multisigAddressType(multi);
                    expect(result).toBe(MULTISIG_ADDRESS_TYPES.P2SH_P2WSH);
                });
            });

            it("should properly recognize P2SH-P2WSH address type on testnet", () => {
                redeemscripts.forEach(r => {
                    const multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    const result = multisigAddressType(multi);
                    expect(result).toBe(MULTISIG_ADDRESS_TYPES.P2SH_P2WSH);
                });
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should properly recognize P2WSH address type on mainnet", () => {
                redeemscripts.forEach(r => {
                    const multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    const result = multisigAddressType(multi);
                    expect(result).toBe(MULTISIG_ADDRESS_TYPES.P2WSH);
                });
            });

            it("should properly recognize P2WSH address type on testnet", () => {
                redeemscripts.forEach(r => {
                    const multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    const result = multisigAddressType(multi);
                    expect(result).toBe(MULTISIG_ADDRESS_TYPES.P2WSH);
                });
            });
        });
    });


    const required = {
        [TWO_OF_THREE]: 2,
        [ONE_OF_TWO]: 1,
        [THREE_OF_FIVE]: 3,
        [TWO_OF_TWO]: 2
    };
    const total_signers = {
        [TWO_OF_THREE]: 3,
        [ONE_OF_TWO]: 2,
        [THREE_OF_FIVE]: 5,
        [TWO_OF_TWO]: 2
    };

    describe("Test multisigRequiredSigners", () => {
        describe("Test for P2SH address type", () => {
            it("should properly determine the required number of signers for P2SH address type on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    let result = multisigRequiredSigners(multi);
                    expect(result).toBe(required[i]);
                });
            });

            it("should properly determine the required number of signers for P2SH address type on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    let result = multisigRequiredSigners(multi);
                    expect(result).toBe(required[i]);
                });
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should properly determine the required number of signers for P2SH-P2WSH address type on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    let result = multisigRequiredSigners(multi);
                    expect(result).toBe(required[i]);
                });
            });

            it("should properly determine the required number of signers for P2SH-P2WSH address type on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    let result = multisigRequiredSigners(multi);
                    expect(result).toBe(required[i]);
                });
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should properly determine the required number of signers for P2WSH address type on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    let result = multisigRequiredSigners(multi);
                    expect(result).toBe(required[i]);
                });
            });

            it("should properly determine the required number of signers for P2WSH address type on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    let result = multisigRequiredSigners(multi);
                    expect(result).toBe(required[i]);
                });
            });
        });
    });

    describe("Test multisigTotalSigners", () => {
        describe("Test for P2SH address type", () => {
            it("should properly determine the total number of signers for P2SH address type on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    let result = multisigTotalSigners(multi);
                    expect(result).toBe(total_signers[i]);
                });
            });

            it("should properly determine the total number of signers for P2SH address type on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    let result = multisigTotalSigners(multi);
                    expect(result).toBe(total_signers[i]);
                });
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should properly determine the total number of signers for P2SH-P2WSH address type on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    let result = multisigTotalSigners(multi);
                    expect(result).toBe(total_signers[i]);
                });
            });

            it("should properly determine the total number of signers for P2SH-P2WSH address type on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    let result = multisigTotalSigners(multi);
                    expect(result).toBe(total_signers[i]);
                });
            });
        });

        describe("Test forP2WSH address type", () => {
            it("should properly determine the total number of signers for P2WSH address type on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    let result = multisigTotalSigners(multi);
                    expect(result).toBe(total_signers[i]);
                });
            });

            it("should properly determine the total number of signers for P2WSH address type on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    let result = multisigTotalSigners(multi);
                    expect(result).toBe(total_signers[i]);
                });
            });
        });
    });

    describe("Test multisigWitnessScript", () => {
        describe("Test for P2SH address type", () => {
            it("should properly return null for P2SH on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    let result = multisigWitnessScript(multi);
                    expect(result).toBe(null);
                });
            });

            it("should properly return null for P2SH on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    let result = multisigWitnessScript(multi);
                    expect(result).toBe(null);
                });
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should properly return the witness script hex representation for P2SH-P2WSH on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    let result = multisigWitnessScript(multi);
                    expect(scriptToHex(result)).toBe(r);
                });
            });

            it("should properly return the witness script hex representation for P2SH-P2WSH on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    let result = multisigWitnessScript(multi);
                    expect(scriptToHex(result)).toBe(r);
                });
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should properly return the witness script hex representation for P2SH-P2WSH on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    let result = multisigWitnessScript(multi);
                    expect(scriptToHex(result)).toBe(r);
                });
            });

            it("should properly return the witness script hex representation for P2SH-P2WSH on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    let result = multisigWitnessScript(multi);
                    expect(scriptToHex(result)).toBe(r);
                });
            });
        });

    });

    describe("Test multisigRedeemScript", () => {
        describe("Test for P2SH address type", () => {
            it("should properly return the redeem script hex representation for P2SH on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    let result = multisigRedeemScript(multi);
                    expect(scriptToHex(result)).toBe(r);
                });
            });

            it("should properly return the redeem script hex representation for P2SH on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    let result = multisigRedeemScript(multi);
                    expect(scriptToHex(result)).toBe(r);
                });
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should properly return the redeem script hex representation for P2SH-P2WSH on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    let result = multisigRedeemScript(multi);
                    expect(scriptToHex(result)).toBe(`0020${hashes[i]}`);
                });
            });

            it("should properly return the redeem script hex representation for P2SH-P2WSH on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    let result = multisigRedeemScript(multi);
                    expect(scriptToHex(result)).toBe(`0020${hashes[i]}`);
                });
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should properly return null for P2WSH on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    let result = multisigRedeemScript(multi);
                    expect(result).toBe(null);
                });
            });

            it("should properly return null for P2WSH on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    let result = multisigRedeemScript(multi);
                    expect(result).toBe(null);
                });
            });
        });
    });

    const pubkeys = [
        "0295cdbdadb83c706fc24024a882cabdb042a8d163d7ea57f48787e5dc8660e2ac",
        "02b79dc8fda9d447f1928d64f95d61dc1f51a440f3c36650e5da74e5d6a98ea586",
        "030d60e8d497fa8ce59a2b3203f0e597cd0182e1fe0cc3688f73497f2e99fbf64b",
        "03a90d10bf3794352bb1fa533dbd4ea75a0ffc98e0d05124938fcc3e10cdbe1a43",
        "03b5d07fd61915bf8de1972bef407377b7a09dd0a0e10cbc2d2998d5eefbf155dc"
    ];

    describe("Test multisigPublicKeys", () => {
        describe("Test for P2SH address type", () => {
            it("should properly extract the public keys for P2SH address type on mainnet", () => {
                const result = generateMultisigFromSpec(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });

            it("should properly extract the public keys for P2SH address type on testnet", () => {
                const result = generateMultisigFromSpec(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should properly extract the public keys for P2SH-P2WSH address type on mainnet", () => {
                const result = generateMultisigFromSpec(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });

            it("should properly extract the public keys for P2SH-P2WSH address type on testnet", () => {
                const result = generateMultisigFromSpec(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should properly extract the public keys for P2WSH address type on mainnet", () => {
                const result = generateMultisigFromSpec(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });

            it("should properly extract the public keys for P2WSH address type on testnet", () => {
                const result = generateMultisigFromSpec(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });
        });
    });

    function testGenMulti(net, addressType, m, n, address) {
        const result = generateMultisigFromSpec(net, addressType, m, ...pubkeys.slice(0, n));
        expect(multisigRequiredSigners(result)).toBe(m);
        expect(multisigTotalSigners(result)).toBe(n);
        expect(multisigAddressType(result)).toBe(addressType);
        expect(multisigPublicKeys(result)).toEqual(pubkeys.slice(0, n));
        expect(result.address).toBe(address);
    }
    describe("Test generateMultisigFromSpec", () => {
        describe("Test for 2 of 3 quorum", () => {
            describe("Test for P2SH address type", () => {
                it("should properly generate 2 of 3 P2SH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, 2, 3, "3Jq4FxkzKkpymBPEsa4yNifcoJuMnGrpQx");
                });

                it("should properly generate 2 of 3 P2SH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, 2, 3, "2NAPGKhh1wDLKxy1nYhgqzfet1f7XZeu3mh");
                });
            });

            describe("Test for P2SH-P2WSH address type", () => {
                it("should properly generate 2 of 3 P2SH-P2WSH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 2, 3, "3DdwtVK6r9XiQyEZYSLfaex8bEdiy45mNZ");
                });

                it("should properly generate 2 of 3 P2SH-P2WSH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 2, 3, "2N5C9xEF8Tc34cks7DZxYCbwPoaqtkTCGBa");
                });
            });

            describe("Test for P2WSH address type", () => {
                it("should properly generate 2 of 3 P2WSH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, 2, 3, "bc1qwv6uvh5m7xj9tts8cvuqvpjr7evvh86m40aey2a3ysl74dx0kgtq0z73m0");
                });

                it("should properly generate 2 of 3 P2WSH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, 2, 3, "tb1qwv6uvh5m7xj9tts8cvuqvpjr7evvh86m40aey2a3ysl74dx0kgtqc2g7pq");
                });
            });
        });

        describe("Test for 1 of 2 quorum", () => {
            describe("Test for P2SH address type", () => {
                it("should properly generate 1 of 2 P2SH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, 1, 2, "3KErVi8Kxbs1tQ7Zvfpo8vPnW7Un2kdnxW");
                });

                it("should properly generate 1 of 2 P2SH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, 1, 2, "2NAo4ZT4Ma4NN6Bk7boSfksP3iTgwrPyFqu");
                });
            });

            describe("Test for P2SH-P2WSH address type", () => {
                it("should properly generate 1 of 2 P2SH-P2WSH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 1, 2, "3ECDJX5Hz2w79vm2b4uWxjnFiAjMwWQZf3");
                });

                it("should properly generate 1 of 2 P2SH-P2WSH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 1, 2, "2N5kRNG1KbVSTMiPaGCXPagmWvWwXohVGh9");
                });
            });

            describe("Test for P2WSH address type", () => {
                it("should properly generate 1 of 2 P2WSH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, 1, 2, "bc1qzqww73x0vdqx4vkj0duqz87ac9gzghj9ynqlwxkegame2yasasysv2c99t");
                });

                it("should properly generate 1 of 2 P2WSH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, 1, 2, "tb1qzqww73x0vdqx4vkj0duqz87ac9gzghj9ynqlwxkegame2yasasysmzw2ly");
                });
            });
        });

        describe("Test for 3 of 5 quorum", () => {
            describe("Test for P2SH address type", () => {
                it("should properly generate 3 of 5 P2SH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, 3, 5, "3BZibTzmfkTV1MHQCfNVzP4L2ofS2vDphW");
                });

                it("should properly generate 3 of 5 P2SH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, 3, 5, "2N37vfCvoHCxqD8uwsnzNcL3bF9sbmwTvgF");
                });
            });

            describe("Test for P2SH-P2WSH address type", () => {
                it("should properly generate 3 of 5 P2SH-P2WSH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 3, 5, "3AAu26iCv2zKEy3wWVjk1X1qrF5fWUYQag");
                });

                it("should properly generate 3 of 5 P2SH-P2WSH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 3, 5, "2N1j75qeEXVVfSkgVBdMcdU174bHqEKFHp7");
                });
            });

            describe("Test for P2WSH address type", () => {
                it("should properly generate 3 of 5 P2WSH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, 3, 5, "bc1q8jnnmemjdkxypdky82vwgkeu2evfxcmtmuyuczpcd29d6vf20y6se4ntz7");
                });

                it("should properly generate 3 of 5 P2WSH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, 3, 5, "tb1q8jnnmemjdkxypdky82vwgkeu2evfxcmtmuyuczpcd29d6vf20y6swa9yc3");
                });
            });
        });

        describe("Test for 2 of 2 quorum", () => {
            describe("Test for P2SH address type", () => {
                it("should properly generate 2 of 2 P2SH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, 2, 2, "33uEjMzvBxXNKLzBqHCUrpY8qY9C1qsm1i");
                });

                it("should properly generate 2 of 2 P2SH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, 2, 2, "2MuTSo6vwoR2iX8cjWQpMUmXQ3tMMoiBWZT");
                });
            });

            describe("Test for P2SH-P2WSH address type", () => {
                it("should properly generate 2 of 2 P2SH-P2WSH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 2, 2, "381NrStBf66ngvnXvhPtCxnqL2hnzQmeYC");
                });

                it("should properly generate 2 of 2 P2SH-P2WSH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 2, 2, "2MyZavBpDGYc8tiR5bq1kpun6YNuxmZhYdV");
                });
            });

            describe("Test for P2WSH address type", () => {
                it("should properly generate 2 of 2 P2WSH Multisig object from spec on mainnet", () => {
                    testGenMulti(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, 2, 2, "bc1qrald34flec2ufdgedlgtk06cfsfgwah87t2qn9nzul3996uc0cgsvv2td9");
                });

                it("should properly generate 2 of 2 P2WSH Multisig object from spec on testnet", () => {
                    testGenMulti(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, 2, 2, "tb1qrald34flec2ufdgedlgtk06cfsfgwah87t2qn9nzul3996uc0cgsmyuyh2");
                });
            });

        });
        describe("Test for invalid address type", () => {
            it("should return null with an invalid address for multisig generation on mainnet", () => {
                const result = generateMultisigFromSpec(NETWORKS.MAINNET, BADADDR, 2, ...pubkeys.slice(0, 2));
                expect(result).toBe(null)
            });

            it("should return null with an invalid address for multisig generation on testnet", () => {
                const result = generateMultisigFromSpec(NETWORKS.TESTNET, BADADDR, 2, ...pubkeys.slice(0, 2));
                expect(result).toBe(null)
            });
        });
    });

    // TODO: this is redundant except for address, maybe reduce here or remove above?
    function testGenMultiHex(net, addressType, m, n, script, address) {
        const result = generateMultisigFromHex(net, addressType, script);
        expect(multisigRequiredSigners(result)).toBe(m);
        expect(multisigTotalSigners(result)).toBe(n);
        expect(multisigAddressType(result)).toBe(addressType);
        expect(result.address).toBe(address);
    }

    describe("Test generateMultisigFromHex", () => {
        describe("Test for P2SH address type", () => {
            it("should properly generate P2SH Multisig object from hex on mainnet", () => {
                const addresses = {
                    [TWO_OF_THREE]: "3QjbZNYzqhfAzE5vxF9jUU9DGGrHkGEchy",
                    [ONE_OF_TWO]: "3GKw4VaBS8QVrJdENRJavVA6B9YbyqW5V3",
                    [THREE_OF_FIVE]: "3BZibTzmfkTV1MHQCfNVzP4L2ofS2vDphW",
                    [TWO_OF_TWO]: "33uEjMzvBxXNKLzBqHCUrpY8qY9C1qsm1i"
                }
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, required[i], total_signers[i], r, addresses[i]);
                });
            });

            it("should properly generate P2SH Multisig object from hex on testnet", () => {
                const addresses = {
                    [TWO_OF_THREE]: "2NGHod7V2TAAXC1iUdNmc6R8UUd4TVTuBmp",
                    [ONE_OF_TWO]: "2N7t98EWD3aur46Fn3YvTYS9MPVkmoLkqUE",
                    [THREE_OF_FIVE]: "2N37vfCvoHCxqD8uwsnzNcL3bF9sbmwTvgF",
                    [TWO_OF_TWO]: "2MuTSo6vwoR2iX8cjWQpMUmXQ3tMMoiBWZT"
                };
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, required[i], total_signers[i], r, addresses[i]);
                });
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should properly generate P2SH-P2WSH Multisig object from hex on mainnet", () => {
                const addresses = {
                    [TWO_OF_THREE]: "3L2DYfwBmbfGdbvD7ejeYeK9R6XMFh7344",
                    [ONE_OF_TWO]: "3EGsZjJMBGfEQzjwqi6L4u6iZJm9fi8vMa",
                    [THREE_OF_FIVE]: "3AAu26iCv2zKEy3wWVjk1X1qrF5fWUYQag",
                    [TWO_OF_TWO]: "381NrStBf66ngvnXvhPtCxnqL2hnzQmeYC"
                }
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, required[i], total_signers[i], r, addresses[i]);
                });
            });

            it("should properly generate P2SH-P2WSH Multisig object from hex on testnet", () => {
                const addresses = {
                    [TWO_OF_THREE]: "2NBaRcQsDP4AcqPYknnMXAbJQdSjWz1uBWM",
                    [ONE_OF_TWO]: "2N5q5dUENnjAacnNVWqiCgr5ymeyKX2pT1B",
                    [THREE_OF_FIVE]: "2N1j75qeEXVVfSkgVBdMcdU174bHqEKFHp7",
                    [TWO_OF_TWO]: "2MyZavBpDGYc8tiR5bq1kpun6YNuxmZhYdV"
                }
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, required[i], total_signers[i], r, addresses[i]);
                });
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should properly generate P2WSH Multisig object from hex on mainnet", () => {
                const addresses = {
                    [TWO_OF_THREE]: "bc1qsx4w72h4y0uty602njpn048aesles2nx3320vwlj6rvamf4xvtnq7f5sdy",
                    [ONE_OF_TWO]: "bc1qn8lrdxxwjvtacc6gvask4x3utmvn854un3nqy82kmjavahfe2q9sra38fj",
                    [THREE_OF_FIVE]: "bc1q8jnnmemjdkxypdky82vwgkeu2evfxcmtmuyuczpcd29d6vf20y6se4ntz7",
                    [TWO_OF_TWO]: "bc1qrald34flec2ufdgedlgtk06cfsfgwah87t2qn9nzul3996uc0cgsvv2td9"
                }
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, required[i], total_signers[i], r, addresses[i]);
                });
            });

            it("should properly generate P2WSH Multisig object from hex on testnet", () => {
                const addresses = {
                    [TWO_OF_THREE]: "tb1qsx4w72h4y0uty602njpn048aesles2nx3320vwlj6rvamf4xvtnqfpzlht",
                    [ONE_OF_TWO]: "tb1qn8lrdxxwjvtacc6gvask4x3utmvn854un3nqy82kmjavahfe2q9s548gna",
                    [THREE_OF_FIVE]: "tb1q8jnnmemjdkxypdky82vwgkeu2evfxcmtmuyuczpcd29d6vf20y6swa9yc3",
                    [TWO_OF_TWO]: "tb1qrald34flec2ufdgedlgtk06cfsfgwah87t2qn9nzul3996uc0cgsmyuyh2"
                }
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, required[i], total_signers[i], r, addresses[i]);
                });
            });
        });
        describe("Test for invalid address type", () => {
            it("should return null with an invalid address for multisig generation on mainnet", () => {
                const result = generateMultisigFromHex(NETWORKS.MAINNET, BADADDR, redeemscripts[0]);
                expect(result).toBe(null)
            })

            it("should return null with an invalid address for multisig generation on testnet", () => {
                const result = generateMultisigFromHex(NETWORKS.TESTNET, BADADDR, redeemscripts[0]);
                expect(result).toBe(null)
            })
        })
    });


    describe("Test estimateMultisigTransactionFeeRate", () => {
        it("should properly estimate fee for P2SH address type", () => {
            const feerate = estimateMultisigTransactionFeeRate({
                addressType: MULTISIG_ADDRESS_TYPES.P2SH,
                n: 2,
                m: 3,
                feesInSatoshis: BigNumber(7060),
                numInputs:1,
                numOutputs:1}
            );
            expect(parseInt(feerate, 10)).toBe(18);
        });

        // FIXME this is just P2SH...
        it("should properly estimate fee P2SH-P2WSH address type", () => {
            const feerate = estimateMultisigTransactionFeeRate({
                addressType: MULTISIG_ADDRESS_TYPES.P2SH_P2WSH,
                n: 2,
                m: 3,
                feesInSatoshis: BigNumber(7060),
                numInputs:1,
                numOutputs:1}
            );

            expect(parseInt(feerate, 10)).toBe(33);
        });

        // FIXME this is just P2SH...
        it("should properly estimate fee P2WSH address type", () => {
            const feerate = estimateMultisigTransactionFeeRate({
                addressType: MULTISIG_ADDRESS_TYPES.P2WSH,
                n: 2,
                m: 3,
                feesInSatoshis: BigNumber(7060),
                numInputs:1,
                numOutputs:1}
            );
            expect(parseInt(feerate, 10)).toBe(40);
        });

        // TODO: is this really what we want
        it.skip("this should be NaN(not string) or null?", () => {
            const feerate = estimateMultisigTransactionFeeRate(BADADDR, 2, 3, 7060);
            expect(feerate).toBe("NaN");
        });
    })

    describe("Test estimateMultisigTransactionFee", () => {
        it("should estimate fee for p2sh", () => {
            const fee = estimateMultisigTransactionFee({
                addressType: MULTISIG_ADDRESS_TYPES.P2SH,
                n: 2,
                m: 3,
                feesPerByteInSatoshis: 10,
                numInputs:1,
                numOutputs:1}
            ).toNumber();
            expect(fee).toBe(3960);
        });

        // FIXME this is just P2SH...
        it("should estimate fee p2sh-p2wsh", () => {
            const fee = estimateMultisigTransactionFee({
                addressType: MULTISIG_ADDRESS_TYPES.P2SH_P2WSH,
                n: 2,
                m: 3,
                feesPerByteInSatoshis: 10,
                numInputs:1,
                numOutputs:1}
            ).toNumber();
            expect(fee).toBe(2120);
        });

        // FIXME this is just P2SH...
        it("should estimate fee p2wsh", () => {
           const fee = estimateMultisigTransactionFee({
                addressType: MULTISIG_ADDRESS_TYPES.P2WSH,
                n: 2,
                m: 3,
                feesPerByteInSatoshis: 10,
                numInputs:1,
                numOutputs:1}
            ).toNumber();
             expect(fee).toBe(1770);
        });

        it("should return NaN for an invalid address type", () => {
            const fee = estimateMultisigTransactionFee(BADADDR, 2, 3, 10).toNumber();
            expect(fee).toBe(NaN);
        });
    })

    const testTxs = [
        {
            inputs: [
                {
                    txid: "916d6c481237dfa78beaf0d931095bf0ce66a9d3d92a8c62a0f187f39f673ed7",
                    index: 1
                }
            ],
            outputs: [
                {
                    address: "tb1quzdlt9ytvg8z7rprn08shrtucnnju5zhf7jlsf",
                    amountSats: BigNumber(100000)
                },
                {
                    address: "tb1qf8xhpmszkvpkjnelq76up4hnfn8qep8406safy",
                    amountSats: BigNumber(999318)
                }
            ]
        },
        {
            inputs: [
                {
                    txid: "8d276c76b3550b145e44d35c5833bae175e0351b4a5c57dc1740387e78f57b11",
                    index: 1
                }
            ],
            outputs: [
                {
                    address: "tb1qjlqhcfy7cva4rwzq3d88rlf754fmk48hsrgl3l",
                    amountSats: BigNumber(1299659)
                }
            ]
        }
    ]
    function getUnsigned(index) {
        return unsignedMultisigTransaction(NETWORKS.TESTNET, testTxs[index].inputs, testTxs[index].outputs);
    }
    const unsigned = "0100000001d73e679ff387f1a0628c2ad9d3a966cef05b0931d9f0ea8ba7df3712486c6d910100000000ffffffff02a086010000000000160014e09bf5948b620e2f0c239bcf0b8d7cc4e72e5057963f0f000000000016001449cd70ee02b303694f3f07b5c0d6f34cce0c84f500000000"

    describe("Test unsignedMultisigTransaction", () => {
        it("should properly create an unsigned transaction", () => {
            expect(getUnsigned(0).toHex()).toBe(unsigned);
        });
    })

    const redeemMulti = "522103684f6787d61cc6af5ea660129f97e312ce0e5276abaf569e842f167c4630126021030c58cc16013c7fdf510ab2b68be808e0de2b25d0f36bb17c60bafd11bb052d9e21020cc7153dd76284f35f8caa86a7d1cae228b10f1bb94dcdbc34ce579b2ea08e1053ae";
    const sig1 = "30440220564e4623beaed42fb0302a2ee2e78e1e7cbee5ed256285b831450b70e8dbc2fa022018a29525a2deccbf397a4952d64a9b317bbd926d44418ec3f6cff4b2001b474c";
    const sig2 = "30440220707beb7625cb4b9925bbae2668d34d44de78879728e14bc40d0c84ea7947c9860220230dcbde54882b481e287d852d2545bb0d955af13984d06ff62ba4bd1de6cd59";
    const signed = "0100000001d73e679ff387f1a0628c2ad9d3a966cef05b0931d9f0ea8ba7df3712486c6d9101000000b4004730440220564e4623beaed42fb0302a2ee2e78e1e7cbee5ed256285b831450b70e8dbc2fa022018a29525a2deccbf397a4952d64a9b317bbd926d44418ec3f6cff4b2001b474c014c69522103684f6787d61cc6af5ea660129f97e312ce0e5276abaf569e842f167c4630126021030c58cc16013c7fdf510ab2b68be808e0de2b25d0f36bb17c60bafd11bb052d9e21020cc7153dd76284f35f8caa86a7d1cae228b10f1bb94dcdbc34ce579b2ea08e1053aeffffffff02a086010000000000160014e09bf5948b620e2f0c239bcf0b8d7cc4e72e5057963f0f000000000016001449cd70ee02b303694f3f07b5c0d6f34cce0c84f500000000";

    describe("Test signedMultisigTransaction", () => {
        it("should properly create signed transaction from an unsigned transaction and signatures", () => {
            const tx = getUnsigned(0);
            const ms = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, redeemMulti);
            const sigtx = signedMultisigTransaction(tx, [{ multisig: ms }], [
                {
                    "03684f6787d61cc6af5ea660129f97e312ce0e5276abaf569e842f167c46301260": sig1
                }, {
                    "030c58cc16013c7fdf510ab2b68be808e0de2b25d0f36bb17c60bafd11bb052d9e": sig2
                }]);

            expect(sigtx.toHex()).toBe(signed)
        });
    })

    const p2wshsig1 = "3045022100e6a78f457953c692d0472afe41f1b7e7bc821ebb059f30676715403f12d175b802204442aebea5a77de2a4093994759f769464d9eae3f2c5f8071d266267995b2b31"
    const p2wshsig2 = "3045022100f9e14286ff2920cf1d6899c9ef8686f2bfe3bdc34a2f5b9283c4c036008223a00220234b9fe910b0e956de2498cfe906cd7b97082206ce200635a7b3901a7fa76753"
    const p2wshredeem = "522102d393457d46d1381b5f22fc0383de23e485ca94073f9f8cba02e15e1077e8047721032c2224ecd101e556eb2cbbb5bac908560f8b1d7d00e58c736fad9b414c87f7af210327354fefa34f9cc0c802f6880737f6008d43a19374a2191ef32c4c9f99db1a1853ae"
    const p2wshpub1 = "02d393457d46d1381b5f22fc0383de23e485ca94073f9f8cba02e15e1077e80477"
    const p2wshpub2 = "032c2224ecd101e556eb2cbbb5bac908560f8b1d7d00e58c736fad9b414c87f7af"

    describe("Test validateMultisigSignature", () => {
        it("should properly extract the publick key for a valid signature for P2SH address type", () => {
            const ms = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, redeemMulti);
            let pubkey = validateMultisigSignature(getUnsigned(0), 0, { multisig: ms }, sig1);
            expect(pubkey).toBe("03684f6787d61cc6af5ea660129f97e312ce0e5276abaf569e842f167c46301260")

            pubkey = validateMultisigSignature(getUnsigned(0), 0, { multisig: ms }, sig2);
            expect(pubkey).toBe("020cc7153dd76284f35f8caa86a7d1cae228b10f1bb94dcdbc34ce579b2ea08e10")
        });

        const badSig = "30440220564e4623beaed42fb0302a2ee2e78e1e7cbee5edee6285b831450b70e8dbc2fa022018a29525a2deccbf397a4952d64a9b317bbd926d44418ec3f6cff4b2001b474c";
        it("should return false for invalid signatures", () => {
            const ms = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, redeemMulti);
            let pubkey = validateMultisigSignature(getUnsigned(0), 0, { multisig: ms }, badSig);
            expect(pubkey).toBe(false)

        })

        it.skip("should properly extract the publick key for a valid signature for P2WSH address type", () => {
            const ms = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, p2wshredeem);
            const tx = getUnsigned(1)

            let pubkey = validateMultisigSignature(tx, 0, { multisig: ms }, p2wshsig1);
            expect(pubkey).toBe(p2wshpub1);

            pubkey = validateMultisigSignature(tx, 0, { multisig: ms }, p2wshsig2);
            expect(pubkey).toBe(p2wshpub2);
        });

    });




});