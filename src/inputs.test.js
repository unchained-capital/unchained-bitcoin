import {
  sortInputs,
  validateMultisigInputs,
  validateMultisigInput,
  validateTransactionID,
  validateTransactionIndex,
} from './inputs';

describe("inputs", () => {

  describe("sortInputs", () => {

    it("sorts inputs in ascending lexicographic order by txid and index", () => {
      const unsortedInputs = [
        {
          txid: "def123",
          index: 0,
        },
        {
          txid: "0123",
          index: 2,
        },
        {
          txid: "abc123",
          index: 1,
        },
        {
          txid: "abc123",
          index: 0,
        },
      ];
      const sortedInputs = sortInputs(unsortedInputs);
      expect(sortedInputs[0].txid).toEqual("0123");
      expect(sortedInputs[0].index).toEqual(2);
      expect(sortedInputs[1].txid).toEqual("abc123");
      expect(sortedInputs[1].index).toEqual(0);
      expect(sortedInputs[2].txid).toEqual("abc123");
      expect(sortedInputs[2].index).toEqual(1);
      expect(sortedInputs[3].txid).toEqual("def123");
      expect(sortedInputs[3].index).toEqual(0);
    });

  });

  describe("validateMultisigInputs", () => {

    it("should return an error message if one of the inputs is invalid", () => {
      expect(
        validateMultisigInputs(
          [
            {txid: "deadbeef", index: 0},
            {txid: "deadbeef", index: 1, multisig: true},
          ]
        )
      ).toMatch(/not have a multisig.+property/i);
    });

    it("should return an error message the UTXOs are duplicative", () => {
      expect(
        validateMultisigInputs(
          [
            {txid: "deadbeef", index: 0, multisig: true},
            {txid: "deadbeef", index: 0, multisig: true},
          ]
        )
      ).toMatch(/duplicate input/i);
    });

    it("should return an empty string if all inputs are valid", () => {
      expect(
        validateMultisigInputs(
          [
            {txid: "deadbeef", index: 0, multisig: true},
            {txid: "deadbeef", index: 1, multisig: true},
          ]
        )
      ).toEqual("");
    });

  });

  describe("validateMultisigInput", () => {

    it("should return an error message for a missing txid", () => {
      expect(validateMultisigInput({index: 0, multisig: true})).toMatch(/does not have.+txid/i);
    });

    it("should return an error message for an invalid txid", () => {
      expect(validateMultisigInput({index: 0, multisig: true, txid: "hi there"})).toMatch(/txid is invalid/i);
    });

    it("should return an error message for a missing index", () => {
      expect(validateMultisigInput({txid: "deadbeef", multisig: true})).toMatch(/does not have.+index/i);
    });

    it("should return an error message for an invalid index", () => {
      expect(validateMultisigInput({txid: "deadbeef", index: -1, multisig: true})).toMatch(/index cannot be negative/i);
    });

    it("should return an error message for a missing multisig", () => {
      expect(validateMultisigInput({txid: "deadbeef", index: 0})).toMatch(/does not have.+multisig/i);
    });

  });

  describe("validateTransactionID", () => {

    it("should return an error message for invalid TXIDs", () => {
      expect(validateTransactionID()).toMatch(/cannot be blank/i);
      expect(validateTransactionID("")).toMatch(/cannot be blank/i);
      expect(validateTransactionID("hi there")).toMatch(/invalid hex/i);
    });

    it("should return an empty string for a valid TXID", () => {
      expect(validateTransactionID("deadbeef")).toEqual("");
    });
    
  });

  describe("validateTransactionIndex", () => {

    it("should return an error message for invalid TXIDs", () => {
      expect(validateTransactionIndex()).toMatch(/cannot be blank/i);
      expect(validateTransactionIndex("")).toMatch(/cannot be blank/i);
      expect(validateTransactionIndex("foo")).toMatch(/index is invalid/i);
      expect(validateTransactionIndex("-1")).toMatch(/cannot be negative/i);
    });

    it("should return an empty string for a valid index", () => {
      expect(validateTransactionIndex(1)).toEqual("");
      expect(validateTransactionIndex(0)).toEqual("");
    });

  });

});
