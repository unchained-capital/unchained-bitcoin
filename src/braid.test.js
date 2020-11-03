import {TEST_FIXTURES} from "./fixtures";
import {
  Braid,
  braidAddressType,
  braidChroot,
  braidConfig,
  braidExtendedPublicKeys,
  braidNetwork,
  braidRequiredSigners, deriveMultisigByIndex, deriveMultisigByPath,
  generateBip32DerivationByIndex, generateBip32DerivationByPath,
  generateBraid,
  generatePublicKeysAtIndex,
  generatePublicKeysAtPath, validateBip32PathForBraid,
} from './braid';

const BRAIDS = TEST_FIXTURES.braids;
const MULTISIGS = TEST_FIXTURES.multisigs;

describe("braids", () => {

  describe("Braid", () => {
    const {pubKeySets, bip32Derivations} = BRAIDS[0];

    let defaultBraid;
    beforeEach(() => {
      // runs before each test in this block
      const {network, addressType, extendedPublicKeys, requiredSigners, chroot} = BRAIDS[0];
      defaultBraid = new Braid({
        network,
        addressType,
        extendedPublicKeys,
        requiredSigners,
        chroot,
      });
    });

    it("blank braid", () => {
      const braid = new Braid();
      braidConfig(braid);
    });

    it("encodes and decodes a braid", () => {
      const {network, addressType, extendedPublicKeys, requiredSigners, chroot} = BRAIDS[0];
      expect(braidConfig(defaultBraid)).toBe(JSON.stringify({
        network,
        addressType,
        extendedPublicKeys,
        requiredSigners,
        chroot,
      }));

      expect(braidNetwork(defaultBraid)).toBe(defaultBraid.network);
      expect(braidAddressType(defaultBraid)).toBe(defaultBraid.addressType);
      expect(braidExtendedPublicKeys(defaultBraid)).toBe(defaultBraid.extendedPublicKeys);
      expect(braidRequiredSigners(defaultBraid)).toBe(defaultBraid.requiredSigners);
      expect(braidChroot(defaultBraid)).toBe(defaultBraid.chroot);

      expect(Braid.fromData({
        network,
        addressType,
        extendedPublicKeys,
        requiredSigners,
        chroot,
      })).toStrictEqual(defaultBraid);
    });

    it('should exercise successfully validateBip32PathForBraid', () => {
      expect(validateBip32PathForBraid(defaultBraid, '0'));
      expect(validateBip32PathForBraid(defaultBraid, '0/0'));
      expect(validateBip32PathForBraid(defaultBraid, 'm/0/0'));
      expect(() => validateBip32PathForBraid(defaultBraid, '/0/0')).toThrow();
    });

    it('should exercise base58string xpub paths', () => {
      const {network, addressType, stringExtendedPublicKeys, requiredSigners, chroot} = BRAIDS[0];
      const stringBraid = new Braid({
        network,
        addressType,
        extendedPublicKeys: stringExtendedPublicKeys,
        requiredSigners,
        chroot,
      });

      expect(generatePublicKeysAtIndex(stringBraid, 0)).toEqual(pubKeySets.index[0]);
    });

    it('should generate pubkeys at an index', () => {
      expect(generatePublicKeysAtIndex(defaultBraid, 0)).toEqual(pubKeySets.index[0]);
      expect(generatePublicKeysAtIndex(defaultBraid, 1)).toEqual(pubKeySets.index[1]);
      expect(generatePublicKeysAtIndex(defaultBraid, 48349)).toEqual(pubKeySets.index[48349]);
    });

    it('should generate pubkeys at path', () => {
      expect(generatePublicKeysAtPath(defaultBraid, '0/0')).toEqual(pubKeySets.path["0/0"]);
      expect(generatePublicKeysAtPath(defaultBraid, 'm/0/0')).toEqual(pubKeySets.path["0/0"]);
      // expect(generatePublicKeysAtPath(defaultBraid, '0/1/0')).toEqual(pubKeySets.path["0/1/0"]);
      // expect(generatePublicKeysAtPath(defaultBraid, '0/48349/0/0/0')).toEqual(pubKeySets.path["0/48349/0/0/0"]);
    });

    it('should fail to generate pubkeys at path', () => {
      expect(() => generatePublicKeysAtPath(defaultBraid, '1/0')).toThrow(/Cannot derive paths outside of the chroot/i);
      expect(() => generatePublicKeysAtPath(defaultBraid, '48349/0/0/0')).toThrow(/Cannot derive paths outside of the chroot/i);
    });

    it('should generate getBip32Derivation at index', () => {
      expect(generateBip32DerivationByIndex(defaultBraid, 0)).toEqual(bip32Derivations.index[0]);
      expect(generateBip32DerivationByIndex(defaultBraid, 1)).toEqual(bip32Derivations.index[1]);
      expect(generateBip32DerivationByIndex(defaultBraid, 48349)).toEqual(bip32Derivations.index[48349]);
    });

    it('should generate getBip32Derivation at path', () => {
      expect(generateBip32DerivationByPath(defaultBraid, '0/0')).toEqual(bip32Derivations.path["0/0"]);
    });

    it('should fail to generate getBip32Derivation at path', () => {
      expect(() => generateBip32DerivationByPath(defaultBraid, '1/0')).toThrow(/Cannot derive paths outside of the chroot/i);
      expect(() => generateBip32DerivationByPath(defaultBraid, '48349/0/0/0')).toThrow(/Cannot derive paths outside of the chroot/i);
    });

    it('should generate braid-aware multisig at index 0', () => {
      expect(deriveMultisigByIndex(defaultBraid, 0)).toEqual(
        expect.objectContaining(MULTISIGS[0].multisig)
      );
    });

    it('should generate braid-aware multisig at path 0/0', () => {
      expect(deriveMultisigByPath(defaultBraid, '0/0')).toEqual(
        expect.objectContaining(MULTISIGS[0].multisig)
      );
    });

    it("generate a braid", () => {
      const { network, addressType, extendedPublicKeys, requiredSigners, chroot } = BRAIDS[0];
      expect(generateBraid(
        network,
        addressType,
        extendedPublicKeys,
        requiredSigners,
        chroot,
      )).toStrictEqual(defaultBraid);
    });
  });
});
