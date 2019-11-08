import { scriptToOps, scriptToHex } from './script';
import { redeemscripts, hashes, opsP2sh, opsP2shP2wsh } from './test_constants'
import { generateMultisigFromHex, multisigRedeemScript , MULTISIG_ADDRESS_TYPES } from './multisig'
import { NETWORKS } from './networks'

describe("Test script library", () => {
    describe("Test scriptToOps", () => {
        describe("Test for P2SH address type", () => {
            it("should properly return the redeem script opcode representation for P2SH on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    expect(scriptToOps(multi)).toBe(opsP2sh[i]);
                });
            });

            it("should properly return the redeem script opcode representation for P2SH on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                    expect(scriptToOps(multi)).toBe(opsP2sh[i]);
                });
            });
        });

        describe("Test for P2SH-P2WSH address type", () => {
            it("should properly return the redeem script opcode representation for P2SH-P2WSH on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    expect(scriptToOps(multi)).toBe(opsP2shP2wsh[i]);
                });
            });

            it("should properly return the redeem script opcode representation for P2SH-P2WSH on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2SH_P2WSH, r);
                    expect(scriptToOps(multi)).toBe(opsP2shP2wsh[i]);
                });
            });
        });

        describe("Test for P2WSH address type", () => {
            it("should properly return the redeem script opcode representation for P2WSH on mainnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    expect(scriptToOps(multi)).toBe(`OP_0 ${hashes[i]}`);
                });
            });

            it("should properly return the redeem script opcode representation for P2WSH on testnet", () => {
                redeemscripts.forEach((r, i) => {
                    let multi = generateMultisigFromHex(NETWORKS.TESTNET, MULTISIG_ADDRESS_TYPES.P2WSH, r);
                    expect(scriptToOps(multi)).toBe(`OP_0 ${hashes[i]}`);
                });
            });
        });
    });
    describe("Test scriptToHex", () => {
        it("should properly return hex string representation of a given script", () => {
            redeemscripts.forEach(r => {
                let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                let redeem = multisigRedeemScript(multi);
                const result = scriptToHex(redeem)
                expect(result).toBe(r);
            });
        });
    });
})

