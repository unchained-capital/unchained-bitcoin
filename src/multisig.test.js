import {P2SH} from "./p2sh";
import {P2WSH} from "./p2wsh";
import {scriptToHex} from './script';
import {
  generateMultisigFromHex,
  generateMultisigFromPublicKeys,
  multisigAddressType,
  multisigRequiredSigners,
  multisigTotalSigners,
  multisigScript,
  multisigRedeemScript,
  multisigWitnessScript,
  multisigPublicKeys,
  multisigAddress,
  braidDetails,
  getBip32Derivation,
} from './multisig';
import {TEST_FIXTURES} from './fixtures';
import {braidConfig} from './braid';

const MULTISIGS = TEST_FIXTURES.multisigs;

describe("multisig", () => {

  describe("generateMultisigFromPublicKeys", () => {

    const badone = {...MULTISIGS[0]};
    badone.type = 'foo';
    const badMultisig = generateMultisigFromPublicKeys(badone.network, badone.type, 2, ...badone.publicKeys);
    expect(badMultisig).toBe(null);

    MULTISIGS.forEach((test) => {
      it(`can generate an ${test.network} 2-of-2 ${test.type} address from public keys`, () => {
        const multisig = generateMultisigFromPublicKeys(test.network, test.type, 2, ...test.publicKeys);
        expect(multisigAddressType(multisig)).toEqual(test.type);
        expect(multisigRequiredSigners(multisig)).toEqual(2);
        expect(multisigTotalSigners(multisig)).toEqual(2);
        expect(multisigPublicKeys(multisig)).toEqual(test.publicKeys);
        expect(scriptToHex(multisigScript(multisig))).toEqual(test.type === P2SH ? test.redeemScriptHex : test.witnessScriptHex);
      });
    });

  });


  describe("generateMultisigFromHex", () => {

    MULTISIGS.forEach((test) => {
      it(`can generate an ${test.network} 2-of-2 ${test.type} address from public keys`, () => {
        const multisig = generateMultisigFromHex(test.network, test.type, test.type === P2SH ? test.redeemScriptHex : test.witnessScriptHex);
        expect(multisigAddressType(multisig)).toEqual(test.type);
        expect(multisigRequiredSigners(multisig)).toEqual(2);
        expect(multisigTotalSigners(multisig)).toEqual(2);
        expect(multisigPublicKeys(multisig)).toEqual(test.publicKeys);
        expect(scriptToHex(multisigScript(multisig))).toEqual(test.multisigScriptHex);
      });
    });

  });


  describe("multisigAddressType", () => {

    MULTISIGS.forEach((test) => {
      it(`returns the address type for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(multisigAddressType(test.multisig)).toEqual(test.type);
      });
    });

  });

  describe("multisigRequiredSigners", () => {

    MULTISIGS.forEach((test) => {
      it(`returns 2 for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(multisigRequiredSigners(test.multisig)).toEqual(2);
      });
    });

  });

  describe("multisigTotalSigners", () => {

    MULTISIGS.forEach((test) => {
      it(`returns 2 for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(multisigTotalSigners(test.multisig)).toEqual(2);
      });
    });

  });

  describe("multisigScript", () => {

    MULTISIGS.forEach((test) => {
      it(`returns the multisig script for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(scriptToHex(multisigScript(test.multisig))).toEqual(test.multisigScriptHex);
      });
    });

  });

  describe("multisigRedeemScript", () => {

    MULTISIGS.forEach((test) => {
      if (test.type === P2WSH) {
        it(`returns null for a ${test.network} 2-of-2 ${test.type} address`, () => {
          expect(multisigRedeemScript(test.multisig)).toBeNull();
        });
      } else {
        it(`returns the redeem script for a ${test.network} 2-of-2 ${test.type} address`, () => {
          expect(scriptToHex(multisigRedeemScript(test.multisig))).toEqual(test.redeemScriptHex);
        });
      }
    });

  });

  describe("multisigWitnessScript", () => {

    MULTISIGS.forEach((test) => {
      if (test.type === P2SH) {
        it(`returns null for a ${test.network} 2-of-2 ${test.type} address`, () => {
          expect(multisigWitnessScript(test.multisig)).toBeNull();
        });
      } else {
        it(`returns the witness script for a ${test.network} 2-of-2 ${test.type} address`, () => {
          expect(scriptToHex(multisigWitnessScript(test.multisig))).toEqual(test.witnessScriptHex);
        });
      }
    });

  });


  describe("multisigPublicKeys", () => {

    MULTISIGS.forEach((test) => {
      it(`returns the public keys for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(multisigPublicKeys(test.multisig)).toEqual(test.publicKeys);
      });
    });

  });

  describe("multisigAddress", () => {

    MULTISIGS.forEach((test) => {
      it(`returns the address for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(multisigAddress(test.multisig)).toEqual(test.address);
      });
    });

  });

  describe("braidDetails", () => {

    it(`fails to return the braidDetails for a braid-unaware multisig`, () => {
      const badone = JSON.parse(JSON.stringify(MULTISIGS[0])).multisig;
      badone.braidDetails = null;
      expect(braidDetails(badone)).toBe(null);
    });
    MULTISIGS.forEach((test) => {
      it(`returns the braidDetails for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(braidDetails(test.multisig)).toBe(braidConfig(test.braidDetails));
      });
    });

  });

  describe("bip32Derivation", () => {

    it(`fails to return the bip32Derivation for a braid-unaware multisig`, () => {
      const badone = JSON.parse(JSON.stringify(MULTISIGS[0])).multisig;
      badone.braidDetails = null;
      badone.bip32Derivation = null;
      expect(getBip32Derivation(badone, 0)).toBe(null);
    });

    it(`returns the generated bip32Derivation for a braid-aware multisig without sending in an index`, () => {
      const missingDerivation = JSON.parse(JSON.stringify(MULTISIGS[0])).multisig;
      missingDerivation.bip32Derivation = null;
      expect(getBip32Derivation(missingDerivation)).toEqual(MULTISIGS[0].bip32Derivation);
    });

    MULTISIGS.forEach((test) => {
      it(`returns the bip32Derivation for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(getBip32Derivation(test.multisig, 0)).not.toBe(null);
      });
    });

  });
});
