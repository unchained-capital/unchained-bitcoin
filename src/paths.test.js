import {
  hardenedBIP32Index,
  bip32PathToSequence,
  bip32SequenceToPath,
  validateBIP32Path,
  multisigBIP32Root,
  multisigBIP32Path,
  getParentPath,
} from './paths';
import {P2SH} from "./p2sh";
import {P2SH_P2WSH} from "./p2sh_p2wsh";
import {P2WSH} from "./p2wsh";
import {
  TESTNET,
  MAINNET,
} from "./networks";

describe('paths', () => {

  describe('hardenedBIP32Index', () => {
    it("returns the hardened version of the given index", () => {
      expect(hardenedBIP32Index('0')).toEqual(2147483648);
      expect(hardenedBIP32Index('44')).toEqual(2147483692);
    });
  });

  describe('bip32PathToSequence', () => {

    it("converts a path to a sequence, including hardening", () => {
      expect(bip32PathToSequence("m/45'/1/99")).toEqual([2147483693, 1, 99]);
    });

    it("assumes the path includes the prefix 'm/'", () => {
      expect(bip32PathToSequence("45'/1/99")).toEqual([1, 99]);
    });

    it("returns an empty sequence on empty input", () => {
      expect(bip32PathToSequence("")).toEqual([]);
      expect(bip32PathToSequence("m")).toEqual([]);
    });

  });

  describe('bip32SequenceToPath', () => {

    it("converts a sequence to a path, including hardening", () => {
      expect(bip32SequenceToPath([2147483693, 1, 99])).toBe("m/45'/1/99");
    });

    it("returns an empty path on empty input", () => {
      expect(bip32SequenceToPath([])).toBe("m/");
    });

  });

  describe('validateBIP32Path', () => {

    it("returns an error message on invalid paths", () => {
      expect(validateBIP32Path("")).toMatch(/cannot be blank/i);
      expect(validateBIP32Path("foo")).toMatch(/is invalid/i);
      expect(validateBIP32Path("/45")).toMatch(/is invalid/i);
      expect(validateBIP32Path("m//45")).toMatch(/is invalid/i);
      expect(validateBIP32Path("m/45''")).toMatch(/is invalid/i);
      expect(validateBIP32Path("m/-45")).toMatch(/is invalid/i);
      expect(validateBIP32Path("m/4.5")).toMatch(/is invalid/i);
      expect(validateBIP32Path("m/4f")).toMatch(/is invalid/i);
    });

    it("returns an error message when a derivation index is too high", () => {
      expect(validateBIP32Path("m/8589934592")).toMatch(/index is too high/i);
      expect(validateBIP32Path("m/45/8589934592")).toMatch(/index is too high/i);
    });

    it("returns an empty string on valid paths", () => {
      expect(validateBIP32Path("m/45")).toEqual("");
      expect(validateBIP32Path("m/45'")).toEqual("");
      expect(validateBIP32Path("m/45/0")).toEqual("");
      expect(validateBIP32Path("m/44'/0'")).toEqual("");
      expect(validateBIP32Path("m/45'/0'/0'/0/0")).toEqual("");
      expect(validateBIP32Path("m/448/1'/1'/23/45638")).toEqual("");
    });

    it("enforces mode=hardened if asked", () => {
      expect(validateBIP32Path("m/45'/0")).toEqual("");
      expect(validateBIP32Path("m/45'/0", { mode: "hardened" })).toMatch(/fully-hardened/i);
    });

    it("enforces mode=unhardened if asked", () => {
      expect(validateBIP32Path("m/45'/0")).toEqual("");
      expect(validateBIP32Path("m/45'/0", { mode: "unhardened" })).toMatch(/cannot include hardened/i);
    });

  });

  describe('multisigBIP32Root', () => {

    it("returns the correct root BIP32 path for each combination of address type and network", () => {
      expect(multisigBIP32Root(P2SH, MAINNET)).toEqual("m/45'/0'/0'");
      expect(multisigBIP32Root(P2SH, TESTNET)).toEqual("m/45'/1'/0'");
      expect(multisigBIP32Root(P2SH_P2WSH, MAINNET)).toEqual("m/48'/0'/0'/1'");
      expect(multisigBIP32Root(P2SH_P2WSH, TESTNET)).toEqual("m/48'/1'/0'/1'");
      expect(multisigBIP32Root(P2WSH, MAINNET)).toEqual("m/48'/0'/0'/2'");
      expect(multisigBIP32Root(P2WSH, TESTNET)).toEqual("m/48'/1'/0'/2'");
    });

    it("defaults to testnet for invalid networks", () => {
      expect(multisigBIP32Root(P2SH, "foobar")).toEqual("m/45'/1'/0'");
      expect(multisigBIP32Root(P2SH_P2WSH, "foobar")).toEqual("m/48'/1'/0'/1'");
      expect(multisigBIP32Root(P2WSH, "foobar")).toEqual("m/48'/1'/0'/2'");
    });

    it("returns null for invalid address types", () => {
      expect(multisigBIP32Root("foobar", MAINNET)).toBeNull();
      expect(multisigBIP32Root("foobar", TESTNET)).toBeNull();
    });

  });

  describe('multisigBIP32Path', () => {

    it("returns a BIP32 path with the correct root for each combination of address type, network, and relative path", () => {
      expect(multisigBIP32Path(P2SH, MAINNET, "1")).toEqual("m/45'/0'/0'/1");
      expect(multisigBIP32Path(P2SH, TESTNET, "1'/2'")).toEqual("m/45'/1'/0'/1'/2'");
      expect(multisigBIP32Path(P2SH_P2WSH, MAINNET, 0)).toEqual("m/48'/0'/0'/1'/0");
      expect(multisigBIP32Path(P2WSH, TESTNET, 3)).toEqual("m/48'/1'/0'/2'/3");
    });

    it("defaults to the relative path 0", () => {
      expect(multisigBIP32Path(P2SH, MAINNET)).toEqual("m/45'/0'/0'/0");
      expect(multisigBIP32Path(P2SH, TESTNET)).toEqual("m/45'/1'/0'/0");
    });

  });

  describe('getParentPath', () => {
    it("validates and returns the correct BIP32 parent path for each given path", () => {
      expect(getParentPath("")).toMatch(/cannot be blank/i);
      expect(getParentPath("foo")).toMatch(/is invalid/i);
      expect(getParentPath("/45")).toMatch(/is invalid/i);
      const validPaths = ["m/45'", "m/45'/0'", "m/45'/0'/0'", "m/45'/0'/0'/0", "m/45'/0'/0'/0/0"]
      for (let i = validPaths.length - 1; i > 0; i--) {
        const expected = validPaths[i - 1]
        const actual = getParentPath(validPaths[i])
        expect(actual).toMatch(expected)
      }
    })
  })
});
