import {generateMultisigFromHex} from "./multisig";
import {
  unsignedMultisigTransaction,
  signedMultisigTransaction,
} from './transactions';
import {toHexString} from "./utils";
import {P2SH} from "./p2sh";
import {networkData, TESTNET} from "./networks";
import {
  TEST_FIXTURES,
} from "./fixtures";

const bitcoin = require('bitcoinjs-lib');

describe("transactions", () => {

  describe("unsignedMultisigTransaction", () => {

    describe("validating arguments", () => {

      const fixture = TEST_FIXTURES.transactions[0];

      it("throws an error when there are no inputs", () => {
        expect(() => { unsignedMultisigTransaction(fixture.network, [], fixture.outputs); }).toThrow(/at least one input/i);
      });

      it("throws an error when there an input is invalid", () => {
        expect(() => { unsignedMultisigTransaction(fixture.network, [{}], fixture.outputs); }).toThrow(/does not have.*txid/i);
      });

      it("throws an error when there are no outputs", () => {
        expect(() => { unsignedMultisigTransaction(fixture.network, fixture.inputs, []); }).toThrow(/at least one output/i);
      });

      it("throws an error when there an output is invalid", () => {
        expect(() => { unsignedMultisigTransaction(fixture.network, fixture.inputs, [{}]); }).toThrow(/does not have.*amount/i);
      });
      
    });


    TEST_FIXTURES.transactions.forEach((fixture) => {
      it(`can construct an unsigned multisig transaction which ${fixture.description}`, () => {
        const transaction = unsignedMultisigTransaction(fixture.network, fixture.inputs, fixture.outputs);
        expect(transaction.ins.length).toEqual(fixture.inputs.length);
        expect(transaction.outs.length).toEqual(fixture.outputs.length);
        fixture.inputs.forEach((input, inputIndex) => {
          expect(transaction.ins[inputIndex].index).toEqual(input.index);
          // TXIDs are displayed in reversed order
          const reversedTXIDBuffer = transaction.ins[inputIndex].hash;
          // Don't want to modify buffer in place so use Buffer.from
          expect(toHexString(Buffer.from(reversedTXIDBuffer).reverse())).toEqual(input.txid);
        });
        fixture.outputs.forEach((output, outputIndex) => {
          expect(transaction.outs[outputIndex].value).toEqual(output.amountSats.toNumber());
          expect(bitcoin.address.fromOutputScript(transaction.outs[outputIndex].script, networkData(fixture.network))).toEqual(output.address);
        });
        expect(transaction.toHex()).toEqual(fixture.hex);
      });
    });

  });

  describe("signedMultisigTransaction", () => {

    const fixture = TEST_FIXTURES.transactions[0];

    it("throws an error when there are no inputs", () => {
      expect(() => { signedMultisigTransaction(fixture.network, [], fixture.outputs); }).toThrow(/at least one input/i);
    });

    it("throws an error when there an input is invalid", () => {
      expect(() => { signedMultisigTransaction(fixture.network, [{}], fixture.outputs); }).toThrow(/does not have.*txid/i);
    });

    it("throws an error when there are no outputs", () => {
      expect(() => { signedMultisigTransaction(fixture.network, fixture.inputs, []); }).toThrow(/at least one output/i);
    });

    it("throws an error when there an output is invalid", () => {
      expect(() => { signedMultisigTransaction(fixture.network, fixture.inputs, [{}]); }).toThrow(/does not have.*amount/i);
    });

    it("throws an error when there are no transaction signatures", () => {
      expect(() => { signedMultisigTransaction(fixture.network, fixture.inputs, fixture.outputs); }).toThrow(/at least one transaction signature/i);
      expect(() => { signedMultisigTransaction(fixture.network, fixture.inputs, fixture.outputs,  []); }).toThrow(/at least one transaction signature/i);
    });

    it("throws an error when there a transaction signature doesn't contain enough input signatures", () => {
      expect(() => { signedMultisigTransaction(fixture.network, fixture.inputs, fixture.outputs, [[]]); }).toThrow(/insufficient input signatures/i);
      expect(() => { signedMultisigTransaction(fixture.network, fixture.inputs, fixture.outputs, [fixture.signature, []]); }).toThrow(/insufficient input signatures/i);
    });

    it("throws an error when too few input signatures are given", () => {
      expect(() => { signedMultisigTransaction(fixture.network, fixture.inputs, fixture.outputs, [fixture.signature]); }).toThrow(/insufficient signatures for input/i);
    });

    it("throws an error when an invalid input signature is given", () => {
      expect(() => { signedMultisigTransaction(fixture.network, fixture.inputs, fixture.outputs, [fixture.signature, ["foo", "bar", "baz"]]); }).toThrow(/invalid signature for input/i);
    });

    it("throws an error when a duplicate input signature is given", () => {
      expect(() => { signedMultisigTransaction(fixture.network, fixture.inputs, fixture.outputs, [fixture.signature, fixture.signature]); }).toThrow(/duplicate signature for input/i);
    });
    
    it("can construct a valid signed transaction", () => {

      const redeemScriptHex = "522103684f6787d61cc6af5ea660129f97e312ce0e5276abaf569e842f167c4630126021030c58cc16013c7fdf510ab2b68be808e0de2b25d0f36bb17c60bafd11bb052d9e21020cc7153dd76284f35f8caa86a7d1cae228b10f1bb94dcdbc34ce579b2ea08e1053ae";
      const multisig = generateMultisigFromHex(TESTNET, P2SH, redeemScriptHex);

      // This transaction has already been broadcast as
      // 57a87bfa6283f0d0f50da5205c5392a7a0ba27a888164920983e7bdd9f716ca6,
      // but no matter.
      const inputs = [
        {
          txid: "916d6c481237dfa78beaf0d931095bf0ce66a9d3d92a8c62a0f187f39f673ed7",
          index: 1,
          multisig,
        }
      ];
      const outputs = [
        {
          address: "tb1quzdlt9ytvg8z7rprn08shrtucnnju5zhf7jlsf",
          amountSats: 100000,
        },
        {
          address: "tb1qf8xhpmszkvpkjnelq76up4hnfn8qep8406safy",
          amountSats: 999318,
        },
      ];

      const transactionSignature1 = ["30440220564e4623beaed42fb0302a2ee2e78e1e7cbee5ed256285b831450b70e8dbc2fa022018a29525a2deccbf397a4952d64a9b317bbd926d44418ec3f6cff4b2001b474c"];
      const transactionSignature2 = ["30440220707beb7625cb4b9925bbae2668d34d44de78879728e14bc40d0c84ea7947c9860220230dcbde54882b481e287d852d2545bb0d955af13984d06ff62ba4bd1de6cd59"];
      const signedTransactionHex = "0100000001d73e679ff387f1a0628c2ad9d3a966cef05b0931d9f0ea8ba7df3712486c6d9101000000fc004730440220564e4623beaed42fb0302a2ee2e78e1e7cbee5ed256285b831450b70e8dbc2fa022018a29525a2deccbf397a4952d64a9b317bbd926d44418ec3f6cff4b2001b474c014730440220707beb7625cb4b9925bbae2668d34d44de78879728e14bc40d0c84ea7947c9860220230dcbde54882b481e287d852d2545bb0d955af13984d06ff62ba4bd1de6cd59014c69522103684f6787d61cc6af5ea660129f97e312ce0e5276abaf569e842f167c4630126021030c58cc16013c7fdf510ab2b68be808e0de2b25d0f36bb17c60bafd11bb052d9e21020cc7153dd76284f35f8caa86a7d1cae228b10f1bb94dcdbc34ce579b2ea08e1053aeffffffff02a086010000000000160014e09bf5948b620e2f0c239bcf0b8d7cc4e72e5057963f0f000000000016001449cd70ee02b303694f3f07b5c0d6f34cce0c84f500000000";

      const signedTransaction = signedMultisigTransaction(TESTNET, inputs, outputs, [transactionSignature1, transactionSignature2]);
      
      expect(signedTransaction.toHex()).toEqual(signedTransactionHex);
    });

  });

});
