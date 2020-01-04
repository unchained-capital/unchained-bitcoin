import {
  multisigPublicKeys,
} from './multisig';
import {
  validateMultisigSignature,
} from './signatures';
import {
  unsignedMultisigTransaction,
} from './transactions';
import {
  TEST_MULTISIGS,
  TEST_TRANSACTIONS,
} from "./test_constants";

const bitcoin = require('bitcoinjs-lib');

describe('signatures', () => {

  describe('validateMultisigSignature', () => {


    it("throws an error on an invalid signature", () => {
      const unsignedTransaction = unsignedMultisigTransaction(TEST_MULTISIGS[0].network, TEST_MULTISIGS[0].utxos, TEST_MULTISIGS[0].transaction.outputs);
      expect(() => {validateMultisigSignature(unsignedTransaction, 0, TEST_MULTISIGS[0].utxos[0], "");}).toThrow(/is too short/i);
      expect(() => {validateMultisigSignature(unsignedTransaction, 0, TEST_MULTISIGS[0].utxos[0], "foobar");}).toThrow(/is too short/i);
    });


    TEST_MULTISIGS.forEach((test) => {

      describe(`validating signatures for a transaction which ${test.description}`, () => {

        const pubkeys = multisigPublicKeys(test.multisig);

        const unsignedTransaction = unsignedMultisigTransaction(test.network, test.utxos, test.transaction.outputs);

        it("returns the public key corresponding to a valid input signature", () => {
          test.utxos.forEach((utxo, inputIndex) => {
            const pubkey = validateMultisigSignature(unsignedTransaction, inputIndex, utxo, test.transaction.signature[inputIndex]);
            expect(pubkey).not.toEqual(false);
            expect(pubkeys).toContain(pubkey);
          });
        });

        it("returns false for a valid signature for a different input", () => {
          const pubkey = validateMultisigSignature(unsignedTransaction, 0, test.utxos[0], test.transaction.signature[1]);
          expect(pubkey).toEqual(false);
        });

      });

    });

    TEST_TRANSACTIONS.forEach((test) => {

      describe(`validating signatures for a transaction which ${test.description}`, () => {

        const unsignedTransaction = unsignedMultisigTransaction(test.network, test.utxos, test.outputs);

        it("returns the public key corresponding to a valid input signature", () => {
          test.utxos.forEach((utxo, inputIndex) => {
            const pubkey = validateMultisigSignature(unsignedTransaction, inputIndex, utxo, test.signature[inputIndex]);
            const pubkeys = multisigPublicKeys(utxo.multisig);
            expect(pubkey).not.toEqual(false);
            expect(pubkeys).toContain(pubkey);
          });
        });

        it("returns false for a valid signature for a different input", () => {
          const pubkey = validateMultisigSignature(unsignedTransaction, 0, test.utxos[0], test.signature[1]);
          expect(pubkey).toEqual(false);
        });

      });

    });
    
  });

});
