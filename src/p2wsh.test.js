import { estimateMultisigP2WSHTransactionVSize } from './p2wsh';

describe("p2wsh", () => {

  describe('estimateMultisigP2WSHTransactionVSize', () => {

    it('estimates the transaction size in vbytes', () => {
      expect(estimateMultisigP2WSHTransactionVSize({
        numInputs: 1,
        numOutputs: 2,
        m: 2,
        n: 3})).toBe(202); // actual value from bitcoin core for P2PKH out
    });
  });
});
