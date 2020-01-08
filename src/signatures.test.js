import {
  validateMultisigSignature,
} from './signatures';
import {
  unsignedMultisigTransaction,
} from './transactions';
import {
  TEST_FIXTURES,
} from "./fixtures";

const bitcoin = require('bitcoinjs-lib');

describe('signatures', () => {

  describe('validateMultisigSignature', () => {

    it("throws an error on an invalid signature", () => {
      const fixture = TEST_FIXTURES.transactions[0];
      const unsignedTransaction = unsignedMultisigTransaction(fixture.network, fixture.inputs, fixture.outputs);
      expect(() => {validateMultisigSignature(unsignedTransaction, 0, fixture.inputs[0], "");}).toThrow(/is too short/i);
      expect(() => {validateMultisigSignature(unsignedTransaction, 0, fixture.inputs[0], "foobar");}).toThrow(/is too short/i);
    });

    TEST_FIXTURES.transactions.forEach((fixture) => {

      describe(`validating signatures for a transaction which ${fixture.description}`, () => {

        const unsignedTransaction = unsignedMultisigTransaction(fixture.network, fixture.inputs, fixture.outputs);

        it("returns the public key corresponding to a valid input signature", () => {
          fixture.inputs.forEach((input, inputIndex) => {
            const publicKey = validateMultisigSignature(unsignedTransaction, inputIndex, input, fixture.signature[inputIndex]);
            expect(publicKey).toEqual(fixture.publicKeys[inputIndex]);
          });
        });

        it("returns false for a valid signature for a different input", () => {
          const publicKey = validateMultisigSignature(unsignedTransaction, 0, fixture.inputs[0], fixture.signature[1]);
          expect(publicKey).toEqual(false);
        });

      });

    });
    
  });

});
