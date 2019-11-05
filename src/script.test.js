import { scriptToOps, scriptToHex } from './script';
import { redeemscripts, hashes } from './test_constants'
import { generateMultisigFromHex, multisigRedeemScript , MULTISIG_ADDRESS_TYPES } from './multisig'
import { NETWORKS } from './networks'

const opsP2sh = [
    "OP_HASH160 fcc7cd50dab21fd624279844a94dd761aeaa2c47 OP_EQUAL",
    "OP_HASH160 a08d17996171332b216824d9860032ee9c998663 OP_EQUAL",
    "OP_HASH160 6c4fe1723e4b9283515f54044199cf6b18446c82 OP_EQUAL",
    "OP_HASH160 183fef1d6f47d6e9da881270d2fa6d6e4ebcdafa OP_EQUAL"
]
const opsP2shP2wsh = [
    "OP_HASH160 c913dea428a311413e439e899cfafbd527333454 OP_EQUAL",
    "OP_HASH160 8a08acab06ac20ec48d32bb7018b854b486ab463 OP_EQUAL",
    "OP_HASH160 5d06e3cd5272a4a20863bb6036f395540747a87f OP_EQUAL",
    "OP_HASH160 4549b685445f5c473565ffc274429ee05a01aa40 OP_EQUAL"
]

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
            redeemscripts.forEach((r, i) => {
                let multi = generateMultisigFromHex(NETWORKS.MAINNET, MULTISIG_ADDRESS_TYPES.P2SH, r);
                let redeem = multisigRedeemScript(multi);
                const result = scriptToHex(redeem)
                expect(result).toBe(r);
            });
        });
    });
})

