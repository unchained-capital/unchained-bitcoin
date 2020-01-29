import { 
    validateExtendedPublicKey, 
    validatePublicKey, 
    compressPublicKey, 
    deriveChildPublicKey, 
    deriveChildExtendedPublicKey,
} from './keys';

import { TESTNET, MAINNET } from './networks';

import {TEST_FIXTURES} from "./fixtures";

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

});
