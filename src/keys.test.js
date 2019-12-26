import {
  validateExtendedPublicKey,
  validatePublicKey,
  compressPublicKey,
  deriveChildPublicKey,
  deriveChildExtendedPublicKey,
  extendedPublicKeyConvert,
  convertAndValidateExtendedPublicKey,
} from './keys';

import { TESTNET, MAINNET } from './networks';

import { TEST_FIXTURES } from "./fixtures";

const NODES = TEST_FIXTURES.nodes;

describe("keys", () => {

  describe("validateExtendedPublicKey", () => {

    const validXpub = "xpub6CCHViYn5VzKFqrKjAzSSqP8XXSU5fEC6ZYSncX5pvSKoRLrPDcF8cEaZkrQvvnuwRUXeKVjoGmAqvbwVkNBFLaRiqcdVhWPyuShUrbcZsv";
    const validTpub = "tpubDCZv1xNTnmwmXe3BBMyXekiVreY853jFeC8k9AaEAqCDYi1ZTSTLH3uQonwCTRk9jL1SFu1cLNbDY76YtcDR8n2inSMwBEAdZs37EpYS9px";

    it("returns an error message on an empty value", () => {
      expect(validateExtendedPublicKey(undefined, TESTNET)).toMatch(/cannot be blank/i);
      expect(validateExtendedPublicKey("", TESTNET)).toMatch(/cannot be blank/i);
      expect(validateExtendedPublicKey(null, TESTNET)).toMatch(/cannot be blank/i);
    });

    it("returns an error message when the prefix does not match the network", () => {
      expect(validateExtendedPublicKey("foo", TESTNET)).toMatch(/must begin with/i);
      expect(validateExtendedPublicKey("tpub", MAINNET)).toMatch(/must begin with/i);
      expect(validateExtendedPublicKey(validTpub, MAINNET)).toMatch(/must begin with/i);
      expect(validateExtendedPublicKey(validXpub, TESTNET)).toMatch(/must begin with/i);
    });

    it("returns an error message when the value is too short", () => {
      expect(validateExtendedPublicKey("tpub123", TESTNET)).toMatch(/is too short/i);
      expect(validateExtendedPublicKey("xpub123", MAINNET)).toMatch(/is too short/i);
    });

    it("returns an error message when the value is too short", () => {
      expect(validateExtendedPublicKey("tpub123", TESTNET)).toMatch(/is too short/i);
      expect(validateExtendedPublicKey("xpub123", MAINNET)).toMatch(/is too short/i);
    });

    it("returns an error message when the value is not valid", () => {
      // they both have 'n' in them
      expect(validateExtendedPublicKey(validTpub.replace('n', 'p'), TESTNET)).toMatch(/invalid/i);
      expect(validateExtendedPublicKey(validXpub.replace('n', 'p'), MAINNET)).toMatch(/invalid/i);
    });

    it("returns an empty string when the value is valid", () => {
      expect(validateExtendedPublicKey(validTpub, TESTNET)).toBe("");
      expect(validateExtendedPublicKey(validXpub, MAINNET)).toBe("");
    });

  });
  describe("validatePublicKey", () => {

    it("returns an error message on an empty value", () => {
      expect(validatePublicKey(undefined)).toMatch(/cannot be blank/i);
      expect(validatePublicKey("")).toMatch(/cannot be blank/i);
      expect(validatePublicKey(null)).toMatch(/cannot be blank/i);
    });

    it("returns an error message on a non-hex value", () => {
      expect(validatePublicKey("zzzz")).toMatch(/invalid hex/i);
    });

    it("returns an error message on an invalid value", () => {
      expect(validatePublicKey("deadbeef")).toMatch(/invalid public key/i);
    });

    it("returns an empty string when the value is a valid compressed public key", () => {
      expect(validatePublicKey("03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee")).toBe("");
    });

    it("returns an empty string when the value is a valid uncompressed public key", () => {
      expect(validatePublicKey("04b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee6e43c09d025c2ad322382347ec0f69b4e78d8e23c8ff9aa0dd0cb93665ae83d5")).toBe("");
    });

  });

  describe("compressPublicKey", () => {

    it("compresses public keys", () => {
      expect(compressPublicKey(
        "04b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee6e43c09d025c2ad322382347ec0f69b4e78d8e23c8ff9aa0dd0cb93665ae83d5"
      )).toBe("03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee");
      expect(compressPublicKey(
        "04f7946511e5f5c2697ed1a6c7f1fb7cfa6c03c74ac123b3d2d0c19ad25899baa6bd72af01ea2a58460fe34c2a2d48527f91da977a45a224f50028d937feb68660"
      )).toBe("02f7946511e5f5c2697ed1a6c7f1fb7cfa6c03c74ac123b3d2d0c19ad25899baa6");
      expect(compressPublicKey(
        "04d87003b52cc497a6ca9a72fd610bcbfb2fe1430ffc4c9d89c2b25b501e04d677ee43c602a902993757d479d89b004f70a944de6db953594be98f397921b20162"
      )).toBe("02d87003b52cc497a6ca9a72fd610bcbfb2fe1430ffc4c9d89c2b25b501e04d677");
      expect(compressPublicKey(
        "040354bd30fed4d431ee2acb51391128c72af8ee2bec8a303d977a40c85ba82e7b0456f8717352c5cb95fef87671109a66243e0b6d4917b3c33eb6aa5f33e5c09d"
      )).toBe("030354bd30fed4d431ee2acb51391128c72af8ee2bec8a303d977a40c85ba82e7b");
    });
  });

  describe("deriveChildPublicKey", () => {

    it('derives child public keys for unhardened paths on mainnet', () => {
      expect(deriveChildPublicKey(NODES["m/45'/0'/0'"].xpub, "m/0/0", MAINNET)).toBe(NODES["m/45'/0'/0'/0/0"].pub);
      expect(deriveChildPublicKey(NODES["m/45'/0'/0'"].xpub, "0/0", MAINNET)).toBe(NODES["m/45'/0'/0'/0/0"].pub);
      expect(deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "m/0/0", MAINNET)).toBe(NODES["m/45'/0'/4'/0/0"].pub);
      expect(deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "0/0", MAINNET)).toBe(NODES["m/45'/0'/4'/0/0"].pub);
      expect(deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "m/6/2", MAINNET)).toBe(NODES["m/45'/0'/4'/6/2"].pub);
      expect(deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "6/2", MAINNET)).toBe(NODES["m/45'/0'/4'/6/2"].pub);
    });

    it('derives child public keys for unhardened paths on testnet', () => {
      expect(deriveChildPublicKey(NODES["m/45'/0'/0'"].tpub, "m/0/0", TESTNET)).toBe(NODES["m/45'/0'/0'/0/0"].pub);
      expect(deriveChildPublicKey(NODES["m/45'/0'/0'"].tpub, "0/0", TESTNET)).toBe(NODES["m/45'/0'/0'/0/0"].pub);
      expect(deriveChildPublicKey(NODES["m/45'/0'/4'"].tpub, "m/0/0", TESTNET)).toBe(NODES["m/45'/0'/4'/0/0"].pub);
      expect(deriveChildPublicKey(NODES["m/45'/0'/4'"].tpub, "0/0", TESTNET)).toBe(NODES["m/45'/0'/4'/0/0"].pub);
      expect(deriveChildPublicKey(NODES["m/45'/0'/4'"].tpub, "m/6/2", TESTNET)).toBe(NODES["m/45'/0'/4'/6/2"].pub);
      expect(deriveChildPublicKey(NODES["m/45'/0'/4'"].tpub, "6/2", TESTNET)).toBe(NODES["m/45'/0'/4'/6/2"].pub);
    });

    it('throws an error when asked to derive down a hardened path', () => {
      expect(() => { deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "m/99'", MAINNET); }).toThrow(/missing private key/i);
      expect(() => { deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "m/99'/0/0", MAINNET); }).toThrow(/missing private key/i);
    });

    it('throws an error when passed a mismatch extended public key and network', () => {
      expect(() => { deriveChildPublicKey(NODES["m/45'/0'/0'"].xpub, "m/0/0", TESTNET); }).toThrow(/invalid network/i);
      expect(() => { deriveChildPublicKey(NODES["m/45'/0'/0'"].tpub, "m/0/0", MAINNET); }).toThrow(/invalid network/i);

    });
  });

  describe("deriveChildExtendedPublicKey", () => {

    it('derives child extended public keys for unhardened paths on mainnet', () => {
      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/0'"].xpub, "m/0/0", MAINNET)).toBe(NODES["m/45'/0'/0'/0/0"].xpub);
      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/0'"].xpub, "0/0", MAINNET)).toBe(NODES["m/45'/0'/0'/0/0"].xpub);

      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].xpub, "m/0/0", MAINNET)).toBe(NODES["m/45'/0'/4'/0/0"].xpub);
      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].xpub, "0/0", MAINNET)).toBe(NODES["m/45'/0'/4'/0/0"].xpub);
      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].xpub, "m/6/2", MAINNET)).toBe(NODES["m/45'/0'/4'/6/2"].xpub);
      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].xpub, "6/2", MAINNET)).toBe(NODES["m/45'/0'/4'/6/2"].xpub);
    });

    it('derives child extended public keys for unhardened paths on testnet', () => {
      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/0'"].tpub, "m/0/0", TESTNET)).toBe(NODES["m/45'/0'/0'/0/0"].tpub);
      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/0'"].tpub, "0/0", TESTNET)).toBe(NODES["m/45'/0'/0'/0/0"].tpub);

      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].tpub, "m/0/0", TESTNET)).toBe(NODES["m/45'/0'/4'/0/0"].tpub);
      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].tpub, "0/0", TESTNET)).toBe(NODES["m/45'/0'/4'/0/0"].tpub);
      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].tpub, "m/6/2", TESTNET)).toBe(NODES["m/45'/0'/4'/6/2"].tpub);
      expect(deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].tpub, "6/2", TESTNET)).toBe(NODES["m/45'/0'/4'/6/2"].tpub);
    });

    it('throws an error when asked to derive down a hardened path', () => {
      expect(() => { deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].xpub, "m/99'", MAINNET); }).toThrow(/missing private key/i);
      expect(() => { deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].xpub, "m/99'/0/0", MAINNET); }).toThrow(/missing private key/i);
    });

    it('throws an error when passed a mismatch extended public key and network', () => {
      expect(() => { deriveChildExtendedPublicKey(NODES["m/45'/0'/0'"].xpub, "m/0/0", TESTNET); }).toThrow(/invalid network/i);
      expect(() => { deriveChildExtendedPublicKey(NODES["m/45'/0'/0'"].tpub, "m/0/0", MAINNET); }).toThrow(/invalid network/i);
    });

  });

  describe("Test extendedPublicKeyConvert", () => {
    describe("Test converting to xpub", () => {
      it("should properly convert extended public key from tpub to xpub", () => {
        const tpub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.tpub, 'xpub')
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub)
        expect(tpub.message).toBe("Your extended public key has been converted from tpub to xpub")
      });

      it("should properly convert extended public key from ypub to xpub", () => {
        const ypub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.ypub, 'xpub')
        expect(ypub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub)
        expect(ypub.message).toBe("Your extended public key has been converted from ypub to xpub")
      });

      it("should properly convert extended public key from zpub to xpub", () => {
        const zpub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.zpub, 'xpub')
        expect(zpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub)
      });

      it("should properly convert extended public key from Ypub to xpub", () => {
        const Ypub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.Ypub, 'xpub')
        expect(Ypub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub)
      });

      it("should properly convert extended public key from Zpub to xpub", () => {
        const Zpub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.Zpub, 'xpub')
        expect(Zpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub)
      });

      it("should properly convert extended public key from upub to xpub", () => {
        const upub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.upub, 'xpub')
        expect(upub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub)
      });

      it("should properly convert extended public key from vpub to xpub", () => {
        const vpub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.vpub, 'xpub')
        expect(vpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub)
      });

      it("should properly convert extended public key from Upub to xpub", () => {
        const Upub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.Upub, 'xpub')
        expect(Upub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub)
      });

      it("should properly convert extended public key from Vpub to xpub", () => {
        const Vpub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.Vpub, 'xpub')
        expect(Vpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub)
      });

    });

    describe("Test converting to tpub", () => {
      it("should properly convert extended public key from xpub to tpub", () => {
        const xpub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.xpub, 'tpub')
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub)
      });

      it("should properly convert extended public key from ypub to tpub", () => {
        const ypub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.ypub, 'tpub')
        expect(ypub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub)
      });
      it("should properly convert extended public key from zpub to tpub", () => {
        const zpub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.zpub, 'tpub')
        expect(zpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub)
      });

      it("should properly convert extended public key from Ypub to tpub", () => {
        const Ypub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.Ypub, 'tpub')
        expect(Ypub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub)
      });

      it("should properly convert extended public key from Zpub to tpub", () => {
        const Zpub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.Zpub, 'tpub')
        expect(Zpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub)
      });

      it("should properly convert extended public key from upub to tpub", () => {
        const upub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.upub, 'tpub')
        expect(upub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub)
      });

      it("should properly convert extended public key from vpub to tpub", () => {
        const vpub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.vpub, 'tpub')
        expect(vpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub)
      });

      it("should properly convert extended public key from Upub to tpub", () => {
        const Upub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.Upub, 'tpub')
        expect(Upub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub)
      });

      it("should properly convert extended public key from Vpub to tpub", () => {
        const Vpub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.Vpub, 'tpub')
        expect(Vpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub)
      });

    });


    describe("Test conversion prefix format validation", () => {
      it("should properly validate extended public with invalid target format", () => {
        const xpub = extendedPublicKeyConvert(TEST_FIXTURES.extendedPublicKeyConversions.xpub, 'apub')
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub)
        expect(xpub.error).toBe("Invalid target version for extended public key conversion")
      });

      it("should properly validate extended public with invalid source format", () => {
        const bad = 'a' + TEST_FIXTURES.extendedPublicKeyConversions.xpub.slice(1)
        const xpub = extendedPublicKeyConvert(bad, 'tpub')
        expect(xpub.extendedPublicKey).toBe(bad)
        expect(xpub.error).toBe("Invalid source version for extended public key conversion")
      });

    });
  });

  describe("Test convertAndValidateExtendedPublicKey", () => {
    describe("Test converting to xpub for mainnet", () => {
      it("should properly return source xpub when valid for mainnet", () => {
        const xpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.xpub, MAINNET)
        expect(xpub.message).toBe('');
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub);
      });

      it("should properly return converted xpub and message when tpub provided", () => {
        const xpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.tpub, MAINNET)
        expect(xpub.message).toBe("Your extended public key has been converted from tpub to xpub");
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub);
      });

      it("should properly return converted xpub and message when ypub provided", () => {
        const xpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.ypub, MAINNET)
        expect(xpub.message).toBe("Your extended public key has been converted from ypub to xpub");
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub);
      });

      it("should properly return converted xpub and message when zpub provided", () => {
        const xpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.zpub, MAINNET)
        expect(xpub.message).toBe("Your extended public key has been converted from zpub to xpub");
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub);
      });

      it("should properly return converted xpub and message when Ypub provided", () => {
        const xpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.Ypub, MAINNET)
        expect(xpub.message).toBe("Your extended public key has been converted from Ypub to xpub");
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub);
      });

      it("should properly return converted xpub and message when Zpub provided", () => {
        const xpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.Zpub, MAINNET)
        expect(xpub.message).toBe("Your extended public key has been converted from Zpub to xpub");
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub);
      });

      it("should properly return converted xpub and message when upub provided", () => {
        const xpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.upub, MAINNET)
        expect(xpub.message).toBe("Your extended public key has been converted from upub to xpub");
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub);
      });

      it("should properly return converted xpub and message when vpub provided", () => {
        const xpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.vpub, MAINNET)
        expect(xpub.message).toBe("Your extended public key has been converted from vpub to xpub");
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub);
      });

      it("should properly return converted xpub and message when vpub provided", () => {
        const xpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.vpub, MAINNET)
        expect(xpub.message).toBe("Your extended public key has been converted from vpub to xpub");
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub);
      });

      it("should properly return converted xpub and message when Upub provided", () => {
        const xpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.Upub, MAINNET)
        expect(xpub.message).toBe("Your extended public key has been converted from Upub to xpub");
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub);
      });

      it("should properly return converted xpub and message when Vpub provided", () => {
        const xpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.Vpub, MAINNET)
        expect(xpub.message).toBe("Your extended public key has been converted from Vpub to xpub");
        expect(xpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.xpub);
      });
    });

    describe("Test converting to tpub for testnet", () => {
      it("should properly return source tpub when valid for testnet", () => {
        const tpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.tpub, TESTNET)
        expect(tpub.message).toBe('');
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub);
      });

      it("should properly return converted tpub and message when xpub provided", () => {
        const tpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.xpub, TESTNET)
        expect(tpub.message).toBe("Your extended public key has been converted from xpub to tpub");
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub);
      });

      it("should properly return converted tpub and message when ypub provided", () => {
        const tpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.ypub, TESTNET)
        expect(tpub.message).toBe("Your extended public key has been converted from ypub to tpub");
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub);
      });

      it("should properly return converted tpub and message when zpub provided", () => {
        const tpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.zpub, TESTNET)
        expect(tpub.message).toBe("Your extended public key has been converted from zpub to tpub");
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub);
      });

      it("should properly return converted tpub and message when Ypub provided", () => {
        const tpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.Ypub, TESTNET)
        expect(tpub.message).toBe("Your extended public key has been converted from Ypub to tpub");
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub);
      });

      it("should properly return converted tpub and message when Zpub provided", () => {
        const tpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.Zpub, TESTNET)
        expect(tpub.message).toBe("Your extended public key has been converted from Zpub to tpub");
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub);
      });

      it("should properly return converted tpub and message when upub provided", () => {
        const tpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.upub, TESTNET)
        expect(tpub.message).toBe("Your extended public key has been converted from upub to tpub");
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub);
      });

      it("should properly return converted tpub and message when vpub provided", () => {
        const tpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.vpub, TESTNET)
        expect(tpub.message).toBe("Your extended public key has been converted from vpub to tpub");
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub);
      });

      it("should properly return converted tpub and message when vpub provided", () => {
        const tpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.vpub, TESTNET)
        expect(tpub.message).toBe("Your extended public key has been converted from vpub to tpub");
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub);
      });

      it("should properly return converted tpub and message when Upub provided", () => {
        const tpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.Upub, TESTNET)
        expect(tpub.message).toBe("Your extended public key has been converted from Upub to tpub");
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub);
      });

      it("should properly return converted tpub and message when Vpub provided", () => {
        const tpub = convertAndValidateExtendedPublicKey(TEST_FIXTURES.extendedPublicKeyConversions.Vpub, TESTNET)
        expect(tpub.message).toBe("Your extended public key has been converted from Vpub to tpub");
        expect(tpub.extendedPublicKey).toBe(TEST_FIXTURES.extendedPublicKeyConversions.tpub);
      });
    });

    describe("Test validation when attempting to convert to xpub for mainnet", () => {
      it("should properly return validation message when invalid source prefix provided", () => {
        const bad = 'a' + TEST_FIXTURES.extendedPublicKeyConversions.xpub.slice(1)
        const xpub = convertAndValidateExtendedPublicKey(bad, MAINNET)
        expect(xpub.error).toBe("Invalid source version for extended public key conversion");
        expect(xpub.extendedPublicKey).toBe(bad);
      });

      describe("Test pass through validation when attempting to convert to xpub", () => {
        it("should properly validate an invalid extended public key provided", () => {
          const bad = TEST_FIXTURES.extendedPublicKeyConversions.xpub.slice(0, TEST_FIXTURES.extendedPublicKeyConversions.xpub.length - 2) + 'xx'
          const xpub = convertAndValidateExtendedPublicKey(bad, MAINNET)
          expect(xpub.error).toMatch(/^Unable to convert extended public key:.+/); // remainder of message from another lib
          expect(xpub.extendedPublicKey).toBe(bad);
        });

        it('should properly report the validation of an empty key value', () => {
          expect(convertAndValidateExtendedPublicKey(undefined, TESTNET).error).toBe("Extended public key cannot be blank.");
          expect(convertAndValidateExtendedPublicKey("", TESTNET).error).toBe("Extended public key cannot be blank.");
          expect(convertAndValidateExtendedPublicKey(null, TESTNET).error).toBe("Extended public key cannot be blank.");
        });

        it("should properly report the validation of a key of insufficient length", () => {
          const key = "xpub";
          const xpub = convertAndValidateExtendedPublicKey(key, MAINNET);
          expect(xpub.error).toBe("Extended public key length is too short.");
          expect(xpub.extendedPublicKey).toBe(key);
        });

      });
    });


    describe("Test validation when attempting to convert to tpub for testnet", () => {
      it("should properly return validation message when invalid source prefix provided", () => {
        const bad = 'a' + TEST_FIXTURES.extendedPublicKeyConversions.tpub.slice(1)
        const tpub = convertAndValidateExtendedPublicKey(bad, TESTNET)
        expect(tpub.error).toBe("Invalid source version for extended public key conversion");
        expect(tpub.extendedPublicKey).toBe(bad);
      });

      describe("Test pass through validation when attempting to convert to tpub", () => {
        it("should properly validate an invalid extended public key provided", () => {
          const bad = TEST_FIXTURES.extendedPublicKeyConversions.tpub.slice(0, TEST_FIXTURES.extendedPublicKeyConversions.tpub.length - 2) + 'xx'
          const tpub = convertAndValidateExtendedPublicKey(bad, TESTNET)
          expect(tpub.error).toMatch(/^Unable to convert extended public key:.+/); // remainder of message from another lib
          expect(tpub.extendedPublicKey).toBe(bad);
        });

        it('should properly report the validation of an empty key value', () => {
          expect(convertAndValidateExtendedPublicKey(undefined).error).toBe("Extended public key cannot be blank.");
          expect(convertAndValidateExtendedPublicKey("").error).toBe("Extended public key cannot be blank.");
          expect(convertAndValidateExtendedPublicKey(null).error).toBe("Extended public key cannot be blank.");
        });

        it("should properly report the validation of a key of insufficient length", () => {
          const key = "tpub";
          const tpub = convertAndValidateExtendedPublicKey(key, TESTNET);
          expect(tpub.error).toBe("Extended public key length is too short.");
          expect(tpub.extendedPublicKey).toBe(key);
        });

      });
    });
  });

});
