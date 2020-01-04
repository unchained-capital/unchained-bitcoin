import {P2SH} from "./p2sh";
import {P2WSH} from "./p2wsh";
import { scriptToHex } from './script';
import {
  generateMultisigFromHex, generateMultisigFromPublicKeys,
  multisigAddressType, multisigRequiredSigners, multisigTotalSigners,
  multisigScript, multisigRedeemScript, multisigWitnessScript,
  multisigPublicKeys, multisigAddress,
} from './multisig';
import { TEST_MULTISIGS } from './test_constants';

describe("multisig", () => {

  describe("generateMultisigFromPublicKeys", () =>  {

    TEST_MULTISIGS.forEach((test) => {
      it(`can generate an ${test.network} 2-of-2 ${test.type} address from public keys`, () => {
        const multisig = generateMultisigFromPublicKeys(test.network, test.type, 2, ...test.publicKeys);
        expect(multisigAddressType(multisig)).toEqual(test.type);
        expect(multisigRequiredSigners(multisig)).toEqual(2);
        expect(multisigTotalSigners(multisig)).toEqual(2);
        expect(multisigPublicKeys(multisig)).toEqual(test.publicKeys);
        expect(scriptToHex(multisigScript(multisig))).toEqual(test.type ===  P2SH ? test.redeemScriptHex : test.witnessScriptHex);
      });
    });    

  });


  describe("generateMultisigFromHex", () =>  {

    TEST_MULTISIGS.forEach((test) => {
      it(`can generate an ${test.network} 2-of-2 ${test.type} address from public keys`, () => {
        const multisig = generateMultisigFromHex(test.network, test.type, test.type ===  P2SH ? test.redeemScriptHex : test.witnessScriptHex);
        expect(multisigAddressType(multisig)).toEqual(test.type);
        expect(multisigRequiredSigners(multisig)).toEqual(2);
        expect(multisigTotalSigners(multisig)).toEqual(2);
        expect(multisigPublicKeys(multisig)).toEqual(test.publicKeys);
        expect(scriptToHex(multisigScript(multisig))).toEqual(test.multisigScriptHex);
      });
    });    

  });


  describe("multisigAddressType", () => {

    TEST_MULTISIGS.forEach((test) => {
      it(`returns the address type for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(multisigAddressType(test.multisig)).toEqual(test.type);
      });
    });

  });

  describe("multisigRequiredSigners", () => {

    TEST_MULTISIGS.forEach((test) => {
      it(`returns 2 for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(multisigRequiredSigners(test.multisig)).toEqual(2);
      });
    });

  });

  describe("multisigTotalSigners", () => {

    TEST_MULTISIGS.forEach((test) => {
      it(`returns 2 for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(multisigTotalSigners(test.multisig)).toEqual(2);
      });
    });

  });

  describe("multisigScript", () => {

    TEST_MULTISIGS.forEach((test) => {
      it(`returns the multisig script for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(scriptToHex(multisigScript(test.multisig))).toEqual(test.multisigScriptHex);
      });
    });

  });

  describe("multisigRedeemScript", () => {

    TEST_MULTISIGS.forEach((test) => {
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

    TEST_MULTISIGS.forEach((test) => {
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

    TEST_MULTISIGS.forEach((test) => {
      it(`returns the public keys for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(multisigPublicKeys(test.multisig)).toEqual(test.publicKeys);
      });
    });

  });

  describe("multisigAddress", () => {

    TEST_MULTISIGS.forEach((test) => {
      it(`returns the address for a ${test.network} 2-of-2 ${test.type} address`, () => {
        expect(multisigAddress(test.multisig)).toEqual(test.address);
      });
    });

  });
});
