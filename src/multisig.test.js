import {
    MULTISIG_ADDRESS_TYPES, multisigBIP32Root, multisigBIP32Path,
    multisigAddressType, multisigRequiredSigners, multisigTotalSigners,
    multisigRedeemScript, multisigWitnessScript, generateMultisigFromHex, generateMultisigFromPublicKeys,
    multisigPublicKeys, estimateMultisigTransactionFeeRate, estimateMultisigTransactionFee,
    unsignedMultisigTransaction, validateMultisigSignature, signedMultisigTransaction,
    multisigAddress,
} from './multisig';
import { NETWORKS } from './networks';
import { scriptToHex } from './script';
const BADADDR = "BADADDR"
import { redeemscripts, hashes, required, total_signers, pubkeys, addresses, badSig,
        unsigned,redeemMulti, sig1, sig2, signed, p2wshsig1, p2wshsig2, p2wshredeem,
        p2wshpub1, p2wshpub2, getUnsigned, getUnsignedWithAmount, p2shkey1, p2shkey2, p2shkey3,
        p2wshsigned} from './test_constants'

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

        describe("Test with unknown address type", () => {
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

        describe("Test with unknown address type", () => {
            it("should return null for an unknown address type on mainnet", () => {
                const result = multisigBIP32Path(BADADDR, NETWORKS.MAINNET);
                expect(result).toEqual(null);
            });
    
            it("should return null for an unknown address type on testnet", () => {
                const result = multisigBIP32Path(BADADDR, NETWORKS.TESTNET);
                expect(result).toEqual(null);
            });
        });
    });

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

    describe("Test multisigPublicKeys", () => {
        describe("Test for P2SH address type", () => {
            it("should properly extract the public keys for P2SH address type on mainnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });

            it("should properly extract the public keys for P2SH address type on testnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should properly extract the public keys for P2SH-P2WSH address type on mainnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });

            it("should properly extract the public keys for P2SH-P2WSH address type on testnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should properly extract the public keys for P2WSH address type on mainnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });

            it("should properly extract the public keys for P2WSH address type on testnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, 3, ...pubkeys);
                expect(multisigPublicKeys(result)).toEqual(pubkeys);
            });
        });
    });

    describe("Test multisigAddress", () => {
        describe("Test for P2SH address type", () => {
            it("should return the address on mainnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, 3, ...pubkeys);
                expect(multisigAddress(result)).toEqual(result.address);
            });

            it("should return the adadress on testnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, 3, ...pubkeys);
                expect(multisigAddress(result)).toEqual(result.address);
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should return the address on mainnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 3, ...pubkeys);
                expect(multisigAddress(result)).toEqual(result.address);
            });

            it("should return the address on testnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 3, ...pubkeys);
                expect(multisigAddress(result)).toEqual(result.address);
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should return the address on mainnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, 3, ...pubkeys);
                expect(multisigAddress(result)).toEqual(result.address);
            });

            it("should return the address on testnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, 3, ...pubkeys);
                expect(multisigAddress(result)).toEqual(result.address);
            });
        });
    });


    function testGenMulti(net, addressType, m, n, address) {
        const result = generateMultisigFromPublicKeys(net, addressType, m, ...pubkeys.slice(0, n));
        expect(multisigRequiredSigners(result)).toBe(m);
        expect(multisigTotalSigners(result)).toBe(n);
        expect(multisigAddressType(result)).toBe(addressType);
        expect(multisigPublicKeys(result)).toEqual(pubkeys.slice(0, n));
        expect(result.address).toBe(address);
    }
    describe("Test generateMultisigFromPublicKeys", () => {
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
                const result = generateMultisigFromPublicKeys(NETWORKS.MAINNET, BADADDR, 2, ...pubkeys.slice(0, 2));
                expect(result).toBe(null)        
            });

            it("should return null with an invalid address for multisig generation on testnet", () => {
                const result = generateMultisigFromPublicKeys(NETWORKS.TESTNET, BADADDR, 2, ...pubkeys.slice(0, 2));
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
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, required[i], total_signers[i], r, addresses.p2sh.mainnet[i]);
                });
            });

            it("should properly generate P2SH Multisig object from hex on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, required[i], total_signers[i], r, addresses.p2sh.testnet[i]);
                });
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should properly generate P2SH-P2WSH Multisig object from hex on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, required[i], total_signers[i], r, addresses.p2shP2swh.mainnet[i]);
                });
            });

            it("should properly generate P2SH-P2WSH Multisig object from hex on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, required[i], total_signers[i], r, addresses.p2shP2swh.testnet[i]);
                });
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should properly generate P2WSH Multisig object from hex on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, required[i], total_signers[i], r, addresses.p2wsh.mainnet[i]);
                });
            });

            it("should properly generate P2WSH Multisig object from hex on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    testGenMultiHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, required[i], total_signers[i], r, addresses.p2wsh.testnet[i]);
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
            const fee = estimateMultisigTransactionFee({
                addressType: MULTISIG_ADDRESS_TYPES.P2SH, 
                numInputs: 2, 
                numOutputs: 3,
                m: 2,
                n: 3,
                feesPerByteInSatoshis: "10"
            }).toNumber();
            expect(fee).toBe(7180);
        });

        it("should properly estimate fee P2SH-P2WSH address type", () => {
            const fee = estimateMultisigTransactionFee({
                addressType: MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 
                numInputs: 2, 
                numOutputs: 3,
                m: 2,
                n: 3,
                feesPerByteInSatoshis: "10"
            }).toNumber();
            expect(fee).toBe(4090);
        });

        it("should properly estimate fee P2WSH address type", () => {
            const fee = estimateMultisigTransactionFee({
                addressType: MULTISIG_ADDRESS_TYPES.P2WSH, 
                numInputs: 2, 
                numOutputs: 3,
                m: 2,
                n: 3,
                feesPerByteInSatoshis: "10"
            }).toNumber();
            expect(fee).toBe(3390);
        });

        // TODO: is this really what we want
        it("this should be NaN(not string) or null?", () => {
            const feerate = estimateMultisigTransactionFee({
                addressType: BADADDR, 
                numInputs: 2, 
                numOutputs: 3,
                m: 2,
                n: 3,
                feesPerByteInSatoshis: "10"
            });
            expect(feerate.toString()).toBe("NaN");
        });
    })

    describe("Test estimateMultisigTransactionFee", () => {
        it("should estimate fee for p2sh", () => {
            const fee = estimateMultisigTransactionFee({
                addressType: MULTISIG_ADDRESS_TYPES.P2SH, 
                numInputs: 2, 
                numOutputs: 3,
                m: 2,
                n: 3,
                feesPerByteInSatoshis: "10"
            }).toNumber();
            expect(fee).toBe(7180);
        });

        it("should estimate fee p2sh-p2wsh", () => {
            const fee = estimateMultisigTransactionFee({
                addressType: MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, 
                numInputs: 2, 
                numOutputs: 3,
                m: 2,
                n: 3,
                feesPerByteInSatoshis: "10"
            }).toNumber();
            expect(fee).toBe(4090);
        });

        it("should estimate fee p2wsh", () => {
            const fee = estimateMultisigTransactionFee({
                addressType: MULTISIG_ADDRESS_TYPES.P2WSH, 
                numInputs: 2, 
                numOutputs: 3,
                m: 2,
                n: 3,
                feesPerByteInSatoshis: "10"
            }).toNumber();
            expect(fee).toBe(3390);
        });

        it("should return NaN for an invalid address type", () => {
            const fee = estimateMultisigTransactionFee({
                addressType: BADADDR, 
                numInputs: 2, 
                numOutputs: 3,
                m: 2,
                n: 3,
                feesPerByteInSatoshis: "10"
            }).toNumber();
            expect(fee).toBe(NaN);
       });
    })

    describe("Test unsignedMultisigTransaction", () => {
        it("should properly create an unsigned transaction", () => {
            expect(getUnsigned(0).toHex()).toBe(unsigned);
        });
    })

    describe("Test signedMultisigTransaction", () => {
        it("should properly create signed transaction from an unsigned transaction and signatures for P2SH", () => {
            const tx = getUnsigned(0);
            const ms = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, redeemMulti);
            const sigtx = signedMultisigTransaction(tx, [{ multisig: ms }], [
                {
                   [p2shkey1]: sig1
                }, {
                   [p2shkey2]: sig2
                }]);
    
            expect(sigtx.toHex()).toBe(signed)
        });

        it("should properly create signed transaction from an unsigned transaction and signatures for P2WSH", () => {
            const tx = getUnsigned(1);
            const ms = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, p2wshredeem);
            const sigtx = signedMultisigTransaction(tx, [{ multisig: ms }], [
                { 
                    [p2wshpub1]: p2wshsig1, 
                    [p2wshpub2]: p2wshsig2
                }
                ]);
    
            expect(sigtx.toHex()).toBe(p2wshsigned)
        });
    })

    describe("Test validateMultisigSignature", () => {
        it("should properly extract the publick key for a valid signature for P2SH address type", () => {
            const ms = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, redeemMulti);
            let pubkey = validateMultisigSignature(getUnsigned(0), 0, { multisig: ms }, sig1);
            expect(pubkey).toBe(p2shkey1)

            pubkey = validateMultisigSignature(getUnsigned(0), 0, { multisig: ms }, sig2);
            expect(pubkey).toBe(p2shkey3)
        });

        it("should return false for invalid signatures", () => {
            const ms = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, redeemMulti);
            let pubkey = validateMultisigSignature(getUnsigned(0), 0, { multisig: ms }, badSig);
            expect(pubkey).toBe(false)
    
        })

        it("should properly extract the public key for a valid signature for P2WSH address type", () => {
            const tx = getUnsignedWithAmount(1)
            const ms = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, p2wshredeem);
            const input = { amountSats: tx.amountSats, multisig: ms }
                
            let pubkey = validateMultisigSignature(tx.unsigned, 0, input, p2wshsig1);
            expect(pubkey).toBe(p2wshpub1);
    
            pubkey = validateMultisigSignature(tx.unsigned, 0, input, p2wshsig2);
            expect(pubkey).toBe(p2wshpub2);
        });

    });    
});
