import bs58check from "bs58check";
import bs58 from "bs58";

import {
  validateExtendedPublicKey,
  validatePublicKey,
  compressPublicKey,
  deriveChildPublicKey,
  deriveChildExtendedPublicKey,
  isKeyCompressed,
  getFingerprintFromPublicKey,
  deriveExtendedPublicKey,
  convertExtendedPublicKey,
  validatePrefix,
  EXTENDED_PUBLIC_KEY_VERSIONS,
  ExtendedPublicKey,
  fingerprintToFixedLengthHex,
} from "./keys";

import { TESTNET, MAINNET } from "./networks";

import { TEST_FIXTURES } from "./fixtures";

const NODES = TEST_FIXTURES.nodes;
const extendedPubKeyNode = TEST_FIXTURES.nodes["m/45'/0'/0'"];

describe("keys", () => {
  describe("validateExtendedPublicKey", () => {
    const validXpub =
      "xpub6CCHViYn5VzKFqrKjAzSSqP8XXSU5fEC6ZYSncX5pvSKoRLrPDcF8cEaZkrQvvnuwRUXeKVjoGmAqvbwVkNBFLaRiqcdVhWPyuShUrbcZsv";
    const validTpub =
      "tpubDCZv1xNTnmwmXe3BBMyXekiVreY853jFeC8k9AaEAqCDYi1ZTSTLH3uQonwCTRk9jL1SFu1cLNbDY76YtcDR8n2inSMwBEAdZs37EpYS9px";

    it("returns an error message on an empty value", () => {
      expect(validateExtendedPublicKey(undefined, TESTNET)).toMatch(
        /cannot be blank/i
      );
      expect(validateExtendedPublicKey("", TESTNET)).toMatch(
        /cannot be blank/i
      );
      expect(validateExtendedPublicKey(null, TESTNET)).toMatch(
        /cannot be blank/i
      );
    });

    it("returns an error message when the prefix does not match the network", () => {
      expect(validateExtendedPublicKey("foo", TESTNET)).toMatch(
        /must begin with/i
      );
      expect(validateExtendedPublicKey("tpub", MAINNET)).toMatch(
        /must begin with/i
      );
      expect(validateExtendedPublicKey(validTpub, MAINNET)).toMatch(
        /must begin with/i
      );
      expect(validateExtendedPublicKey(validXpub, TESTNET)).toMatch(
        /must begin with/i
      );
    });

    it("returns an error message when the value is too short", () => {
      expect(validateExtendedPublicKey("tpub123", TESTNET)).toMatch(
        /is too short/i
      );
      expect(validateExtendedPublicKey("xpub123", MAINNET)).toMatch(
        /is too short/i
      );
    });

    it("returns an error message when the value is too short", () => {
      expect(validateExtendedPublicKey("tpub123", TESTNET)).toMatch(
        /is too short/i
      );
      expect(validateExtendedPublicKey("xpub123", MAINNET)).toMatch(
        /is too short/i
      );
    });

    it("returns an error message when the value is not valid", () => {
      // they both have 'n' in them
      expect(
        validateExtendedPublicKey(validTpub.replace("n", "p"), TESTNET)
      ).toMatch(/invalid/i);
      expect(
        validateExtendedPublicKey(validXpub.replace("n", "p"), MAINNET)
      ).toMatch(/invalid/i);
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
      expect(
        validatePublicKey(
          "03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee"
        )
      ).toBe("");
    });

    it("returns an empty string when the value is a valid uncompressed public key", () => {
      expect(
        validatePublicKey(
          "04b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee6e43c09d025c2ad322382347ec0f69b4e78d8e23c8ff9aa0dd0cb93665ae83d5"
        )
      ).toBe("");
    });
  });

  describe("compressPublicKey", () => {
    it("compresses public keys", () => {
      expect(
        compressPublicKey(
          "04b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee6e43c09d025c2ad322382347ec0f69b4e78d8e23c8ff9aa0dd0cb93665ae83d5"
        )
      ).toBe(
        "03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee"
      );
      expect(
        compressPublicKey(
          "04f7946511e5f5c2697ed1a6c7f1fb7cfa6c03c74ac123b3d2d0c19ad25899baa6bd72af01ea2a58460fe34c2a2d48527f91da977a45a224f50028d937feb68660"
        )
      ).toBe(
        "02f7946511e5f5c2697ed1a6c7f1fb7cfa6c03c74ac123b3d2d0c19ad25899baa6"
      );
      expect(
        compressPublicKey(
          "04d87003b52cc497a6ca9a72fd610bcbfb2fe1430ffc4c9d89c2b25b501e04d677ee43c602a902993757d479d89b004f70a944de6db953594be98f397921b20162"
        )
      ).toBe(
        "02d87003b52cc497a6ca9a72fd610bcbfb2fe1430ffc4c9d89c2b25b501e04d677"
      );
      expect(
        compressPublicKey(
          "040354bd30fed4d431ee2acb51391128c72af8ee2bec8a303d977a40c85ba82e7b0456f8717352c5cb95fef87671109a66243e0b6d4917b3c33eb6aa5f33e5c09d"
        )
      ).toBe(
        "030354bd30fed4d431ee2acb51391128c72af8ee2bec8a303d977a40c85ba82e7b"
      );
    });
  });

  describe("deriveChildPublicKey", () => {
    it("derives child public keys for unhardened paths on mainnet", () => {
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/0'"].xpub, "m/0/0", MAINNET)
      ).toBe(NODES["m/45'/0'/0'/0/0"].pub);
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/0'"].xpub, "0/0", MAINNET)
      ).toBe(NODES["m/45'/0'/0'/0/0"].pub);
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "m/0/0", MAINNET)
      ).toBe(NODES["m/45'/0'/4'/0/0"].pub);
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "0/0", MAINNET)
      ).toBe(NODES["m/45'/0'/4'/0/0"].pub);
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "m/6/2", MAINNET)
      ).toBe(NODES["m/45'/0'/4'/6/2"].pub);
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "6/2", MAINNET)
      ).toBe(NODES["m/45'/0'/4'/6/2"].pub);
    });

    it("derives child public keys for unhardened paths on testnet", () => {
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/0'"].tpub, "m/0/0", TESTNET)
      ).toBe(NODES["m/45'/0'/0'/0/0"].pub);
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/0'"].tpub, "0/0", TESTNET)
      ).toBe(NODES["m/45'/0'/0'/0/0"].pub);
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/4'"].tpub, "m/0/0", TESTNET)
      ).toBe(NODES["m/45'/0'/4'/0/0"].pub);
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/4'"].tpub, "0/0", TESTNET)
      ).toBe(NODES["m/45'/0'/4'/0/0"].pub);
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/4'"].tpub, "m/6/2", TESTNET)
      ).toBe(NODES["m/45'/0'/4'/6/2"].pub);
      expect(
        deriveChildPublicKey(NODES["m/45'/0'/4'"].tpub, "6/2", TESTNET)
      ).toBe(NODES["m/45'/0'/4'/6/2"].pub);
    });

    it("throws an error when asked to derive down a hardened path", () => {
      expect(() => {
        deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "m/99'", MAINNET);
      }).toThrow(/missing private key/i);
      expect(() => {
        deriveChildPublicKey(NODES["m/45'/0'/4'"].xpub, "m/99'/0/0", MAINNET);
      }).toThrow(/missing private key/i);
    });

    it("throws an error when passed a mismatch extended public key and network", () => {
      expect(() => {
        deriveChildPublicKey(NODES["m/45'/0'/0'"].xpub, "m/0/0", TESTNET);
      }).toThrow(/invalid network/i);
      expect(() => {
        deriveChildPublicKey(NODES["m/45'/0'/0'"].tpub, "m/0/0", MAINNET);
      }).toThrow(/invalid network/i);
    });
  });

  describe("deriveChildExtendedPublicKey", () => {
    it("derives child extended public keys for unhardened paths on mainnet", () => {
      expect(
        deriveChildExtendedPublicKey(
          NODES["m/45'/0'/0'"].xpub,
          "m/0/0",
          MAINNET
        )
      ).toBe(NODES["m/45'/0'/0'/0/0"].xpub);
      expect(
        deriveChildExtendedPublicKey(NODES["m/45'/0'/0'"].xpub, "0/0", MAINNET)
      ).toBe(NODES["m/45'/0'/0'/0/0"].xpub);

      expect(
        deriveChildExtendedPublicKey(
          NODES["m/45'/0'/4'"].xpub,
          "m/0/0",
          MAINNET
        )
      ).toBe(NODES["m/45'/0'/4'/0/0"].xpub);
      expect(
        deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].xpub, "0/0", MAINNET)
      ).toBe(NODES["m/45'/0'/4'/0/0"].xpub);
      expect(
        deriveChildExtendedPublicKey(
          NODES["m/45'/0'/4'"].xpub,
          "m/6/2",
          MAINNET
        )
      ).toBe(NODES["m/45'/0'/4'/6/2"].xpub);
      expect(
        deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].xpub, "6/2", MAINNET)
      ).toBe(NODES["m/45'/0'/4'/6/2"].xpub);
    });

    it("derives child extended public keys for unhardened paths on testnet", () => {
      expect(
        deriveChildExtendedPublicKey(
          NODES["m/45'/0'/0'"].tpub,
          "m/0/0",
          TESTNET
        )
      ).toBe(NODES["m/45'/0'/0'/0/0"].tpub);
      expect(
        deriveChildExtendedPublicKey(NODES["m/45'/0'/0'"].tpub, "0/0", TESTNET)
      ).toBe(NODES["m/45'/0'/0'/0/0"].tpub);

      expect(
        deriveChildExtendedPublicKey(
          NODES["m/45'/0'/4'"].tpub,
          "m/0/0",
          TESTNET
        )
      ).toBe(NODES["m/45'/0'/4'/0/0"].tpub);
      expect(
        deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].tpub, "0/0", TESTNET)
      ).toBe(NODES["m/45'/0'/4'/0/0"].tpub);
      expect(
        deriveChildExtendedPublicKey(
          NODES["m/45'/0'/4'"].tpub,
          "m/6/2",
          TESTNET
        )
      ).toBe(NODES["m/45'/0'/4'/6/2"].tpub);
      expect(
        deriveChildExtendedPublicKey(NODES["m/45'/0'/4'"].tpub, "6/2", TESTNET)
      ).toBe(NODES["m/45'/0'/4'/6/2"].tpub);
    });

    it("throws an error when asked to derive down a hardened path", () => {
      expect(() => {
        deriveChildExtendedPublicKey(
          NODES["m/45'/0'/4'"].xpub,
          "m/99'",
          MAINNET
        );
      }).toThrow(/missing private key/i);
      expect(() => {
        deriveChildExtendedPublicKey(
          NODES["m/45'/0'/4'"].xpub,
          "m/99'/0/0",
          MAINNET
        );
      }).toThrow(/missing private key/i);
    });

    it("throws an error when passed a mismatch extended public key and network", () => {
      expect(() => {
        deriveChildExtendedPublicKey(
          NODES["m/45'/0'/0'"].xpub,
          "m/0/0",
          TESTNET
        );
      }).toThrow(/invalid network/i);
      expect(() => {
        deriveChildExtendedPublicKey(
          NODES["m/45'/0'/0'"].tpub,
          "m/0/0",
          MAINNET
        );
      }).toThrow(/invalid network/i);
    });
  });

  describe("validatePrefix", () => {
    it("should return null if valid or throw otherwise", () => {
      Object.keys(EXTENDED_PUBLIC_KEY_VERSIONS).forEach((prefix) => {
        expect(validatePrefix(prefix)).toBe(null);
      });

      function invalidPrefix() {
        validatePrefix("jpub");
      }

      expect(invalidPrefix).toThrow();
    });
  });

  describe("Test convertExtendedPublicKey", () => {
    Object.keys(EXTENDED_PUBLIC_KEY_VERSIONS).forEach((convertTo) => {
      describe(`Test converting to ${convertTo}`, () => {
        Object.keys(EXTENDED_PUBLIC_KEY_VERSIONS).forEach((convertFrom) => {
          if (
            convertFrom === convertTo ||
            !extendedPubKeyNode[convertFrom] ||
            !extendedPubKeyNode[convertTo]
          ) {
            return;
          }
          it(`should properly convert extended public key from ${convertFrom} to ${convertTo}`, () => {
            const converted = convertExtendedPublicKey(
              extendedPubKeyNode[convertFrom],
              convertTo
            );
            expect(converted).toBe(extendedPubKeyNode[convertTo]);
          });
        });
      });
    });
  });

  describe("isKeyCompressed", () => {
    it("checks if a key is compressed or uncompressed", () => {
      const uncompressedPubkey =
        "0487cb4929c287665fbda011b1afbebb0e691a5ee11ee9a561fcd6adba266afe03f7c55f784242305cfd8252076d038b0f3c92836754308d06b097d11e37bc0907";
      expect(isKeyCompressed(uncompressedPubkey)).toBeFalsy();
      expect(
        isKeyCompressed(compressPublicKey(uncompressedPubkey))
      ).toBeTruthy();
    });
  });

  describe("getFingerprintFromPublicKey", () => {
    it("derives the correct fingerprint from a given key", () => {
      const node = NODES["m/45'/0'/0'/0"];
      const parentNode = NODES["m/45'/0'/0'"];

      const fingerprint = getFingerprintFromPublicKey(parentNode.pub);
      const decodedXpub = bs58.decode(node.xpub).toString("hex");

      // the child node should have its parent's fingerprint in the xpub
      expect(node.parentFingerprint).toEqual(fingerprint);
      // we should also be able to find the fingerprint in the decoded xpub
      expect(decodedXpub).toContain(fingerprint.toString(16));
    });
  });

  describe("fingerprintToFixedLengthHex", () => {
    it("returns 4-byte zero-padded hex string", () => {
      const hexOutputs = {
        '00000007': 7,
        '0000007b': 123,
        '00000943': 2371,
        '0000d2bb': 53947,
        '0004ec4f': 322639,
        '00f4a5bc': 16033212,
        '01808a52': 25201234,
        '32a7ae1c': 849849884,
        'fa8cae68': 8498490984, // should be 1fa8cae68 but truncated front 1
      };

      for (const [xfpHex, xfpNumber] of Object.entries(hexOutputs)) {
        const hexFingerprint = fingerprintToFixedLengthHex(xfpNumber);
        expect(hexFingerprint.length).toEqual(8);
        expect(hexFingerprint).toEqual(xfpHex)
      }
    })
  })

  describe("deriveExtendedPublicKey", () => {
    it("derives a valid bip32 node with all matching HD wallet properties", () => {
      const paths = ["m/45'/0'/0'", "m/45'/0'/0'/0"];
      for (const path of paths) {
        const { parentFingerprint, chaincode, xpub, pub, tpub } = NODES[path];
        const derivedXpub = deriveExtendedPublicKey(
          path,
          pub,
          chaincode,
          parentFingerprint,
          MAINNET
        );
        const derivedTpub = deriveExtendedPublicKey(
          path,
          pub,
          chaincode,
          parentFingerprint,
          TESTNET
        );
        expect(derivedXpub).toEqual(xpub);
        expect(derivedTpub).toEqual(tpub);
      }
    });
  });

  describe("ExtendedPublicKey", () => {
    it("encodes and decodes an extended public key", () => {
      const paths = ["m/45'/0'/0'", "m/45'/0'/0'/0"];
      for (const path of paths) {
        const { parentFingerprint, chaincode, xpub, pub: pubkey, tpub } = NODES[
          path
        ];
        const extendedPubkey = new ExtendedPublicKey({
          path,
          pubkey,
          chaincode,
          parentFingerprint,
        });

        expect(extendedPubkey.toBase58()).toEqual(xpub);
        extendedPubkey.setNetwork(TESTNET);
        expect(extendedPubkey.toBase58()).toEqual(tpub);

        // test fromBase58
        expect(ExtendedPublicKey.fromBase58(xpub).toBase58()).toEqual(xpub);
        expect(ExtendedPublicKey.fromBase58(tpub).toBase58()).toEqual(tpub);

        // test decoding (same as fromBase58)
        const decodedXpub = ExtendedPublicKey.decode(bs58check.decode(xpub));
        const decodedTestnetXpub = ExtendedPublicKey.decode(
          bs58check.decode(tpub)
        );

        expect(decodedXpub.version).toEqual(EXTENDED_PUBLIC_KEY_VERSIONS.xpub);
        expect(decodedTestnetXpub.version).toEqual(
          EXTENDED_PUBLIC_KEY_VERSIONS.tpub
        );
        expect(decodedXpub.parentFingerprint).toEqual(parentFingerprint);
        expect(decodedTestnetXpub.parentFingerprint).toEqual(parentFingerprint);

        expect(decodedXpub.pubkey).toEqual(pubkey);
        expect(decodedTestnetXpub.pubkey).toEqual(pubkey);

        expect(decodedTestnetXpub.chaincode).toEqual(chaincode);
        expect(decodedTestnetXpub.chaincode).toEqual(chaincode);
      }
    });
  });
});
