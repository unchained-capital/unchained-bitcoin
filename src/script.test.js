import { scriptToOps, scriptToHex } from './script';
import { TEST_MULTISIGS } from './test_constants';
import { 
  MULTISIG_ADDRESS_TYPES,
  generateMultisigFromHex,
  multisigRedeemScript,
  multisigWitnessScript,
} from './multisig';

describe("scripts", () => {

  describe("scriptToOps", () => {

    TEST_MULTISIGS.forEach((test) => {
      it(`returns the opcodes for a 2-of-2 ${test.network} ${test.type} address`, () => {
        expect(scriptToOps(test.multisig)).toEqual(test.scriptOps);
        expect(scriptToOps(test.multisigScript)).toEqual(test.multisigScriptOps);
      });
    });

  });


  describe("scriptToHex", () => {

    TEST_MULTISIGS.forEach((test) => {
      it(`returns the hex for a 2-of-2 ${test.network} ${test.type} address`, () => {
        expect(scriptToHex(test.multisig)).toEqual(test.scriptHex);
        expect(scriptToHex(test.multisigScript)).toEqual(test.multisigScriptHex);
      });
    });

  });

});
