import BigNumber from "bignumber.js";

import {
  sortInputs,
  validateOutputAmount,
  unsignedMultisigTransaction,
} from './transactions';
import {toHexString} from "./utils";
import {scriptToHex} from "./script";
import {networkData, MAINNET} from "./networks";
import {
  TEST_MULTISIGS,
  TEST_TRANSACTIONS,
} from "./test_constants";

const bitcoin = require('bitcoinjs-lib');

describe("transactions", () => {

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

  describe('validateOutputAmount', () => {

    it("should return an error message for an unparseable output amount", () => {
      expect(validateOutputAmount('foo', 100000)).toMatch(/invalid output amount/i);
    });

    it("should return an error message for an unparseable total input amount", () => {
      expect(validateOutputAmount(100000, 'foo')).toMatch(/invalid total input amount/i);
    });

    it("should return an error message for a negative output amount", () => {
      expect(validateOutputAmount(-10000, 100000)).toMatch(/output amount must be positive/i);
    });

    it("should return an error message for a zero output amount", () => {
      expect(validateOutputAmount(0, 100000)).toMatch(/output amount must be positive/i);
    });

    it("should return an error message for a negative total input amount", () => {
      expect(validateOutputAmount(100000, -1000000)).toMatch(/total input amount must be positive/i);
    });

    it("should return an error message for a zero total input amount", () => {
      expect(validateOutputAmount(100000, 0)).toMatch(/total input amount must be positive/i);
    });

    it("should return an error message when the output is too small", () => {
      expect(validateOutputAmount(100, 1000000)).toMatch(/output amount is too small/i);
    });

    it("should return an error message when the output is larger than the total input amount", () => {
      expect(validateOutputAmount(100001, 100000)).toMatch(/output amount is too large/i);
    });

    it("should return an empty string on an acceptable amount", () => {
      expect(validateOutputAmount(100000, 1000000)).toBe("");
    });

  });


  describe("unsignedMultisigTransaction", () => {

    it("forces BIP69 ordering on inputs", () => {
      // They come sorted, so permute them.
      const unsortedUTXOs = [
        TEST_MULTISIGS[0].utxos[2],
        TEST_MULTISIGS[0].utxos[0],
        TEST_MULTISIGS[0].utxos[1],
      ];
      const transaction = unsignedMultisigTransaction(TEST_MULTISIGS[0].network, unsortedUTXOs, TEST_MULTISIGS[0].transaction.outputs);
      expect(transaction.ins.length).toEqual(unsortedUTXOs.length);

      const reversedTXIDBuffer0 = transaction.ins[0].hash;
      const reversedTXIDBuffer1 = transaction.ins[1].hash;
      const reversedTXIDBuffer2 = transaction.ins[2].hash;
      expect(toHexString(Buffer.from(reversedTXIDBuffer0).reverse())).toEqual(TEST_MULTISIGS[0].utxos[0].txid);
      expect(toHexString(Buffer.from(reversedTXIDBuffer1).reverse())).toEqual(TEST_MULTISIGS[0].utxos[1].txid);
      expect(toHexString(Buffer.from(reversedTXIDBuffer2).reverse())).toEqual(TEST_MULTISIGS[0].utxos[2].txid);
    });


    TEST_MULTISIGS.forEach((test) => {

      it(`can construct an unsigned multisig transaction which ${test.description}`, () => {
        const transaction = unsignedMultisigTransaction(test.network, test.utxos, test.transaction.outputs);
        expect(transaction.ins.length).toEqual(test.utxos.length);
        expect(transaction.outs.length).toEqual(test.transaction.outputs.length);
        test.utxos.forEach((utxo, inputIndex) => {
          expect(transaction.ins[inputIndex].index).toEqual(utxo.index);
          // TXIDs are displayed in reversed order
          const reversedTXIDBuffer = transaction.ins[inputIndex].hash;
          // Don't want to modify buffer in place so use Buffer.from
          expect(toHexString(Buffer.from(reversedTXIDBuffer).reverse())).toEqual(utxo.txid);
        });
        test.transaction.outputs.forEach((output, outputIndex) => {
          expect(transaction.outs[outputIndex].value).toEqual(output.amountSats.toNumber());
          expect(bitcoin.address.fromOutputScript(transaction.outs[outputIndex].script, networkData(test.network))).toEqual(output.address);
        });
        expect(transaction.toHex()).toEqual(test.transaction.hex);
      });
    });

    TEST_TRANSACTIONS.forEach((test) => {
      it(`can construct an unsigned multisig transaction which ${test.description}`, () => {
        const transaction = unsignedMultisigTransaction(test.network, test.utxos, test.outputs);
        expect(transaction.ins.length).toEqual(test.utxos.length);
        expect(transaction.outs.length).toEqual(test.outputs.length);
        test.utxos.forEach((utxo, inputIndex) => {
          expect(transaction.ins[inputIndex].index).toEqual(utxo.index);
          // TXIDs are displayed in reversed order
          const reversedTXIDBuffer = transaction.ins[inputIndex].hash;
          // Don't want to modify buffer in place so use Buffer.from
          expect(toHexString(Buffer.from(reversedTXIDBuffer).reverse())).toEqual(utxo.txid);
        });
        test.outputs.forEach((output, outputIndex) => {
          expect(transaction.outs[outputIndex].value).toEqual(output.amountSats.toNumber());
          expect(bitcoin.address.fromOutputScript(transaction.outs[outputIndex].script, networkData(test.network))).toEqual(output.address);
        });
        expect(transaction.toHex()).toEqual(test.hex);
      });
    });

  });

});


  // describe("Test signedMultisigTransaction", () => {
  //   it("should properly create signed transaction from an unsigned transaction and signatures for P2SH", () => {
  //     const tx = getUnsigned(0);
  //     const ms = generateMultisigFromHex(TESTNET, P2SH, redeemMulti);
  //     const sigtx = signedMultisigTransaction(tx, [{ multisig: ms }], [
  //       {
  //         [p2shkey1]: sig1
  //       }, {
  //         [p2shkey2]: sig2
  //       }]);

  //     expect(sigtx.toHex()).toBe(signed)
  //   });

  //   it("should properly create signed transaction from an unsigned transaction and signatures for P2WSH", () => {
  //     const tx = getUnsigned(1);
  //     const ms = generateMultisigFromHex(TESTNET, P2WSH, p2wshredeem);
  //     const sigtx = signedMultisigTransaction(tx, [{ multisig: ms }], [
  //       {
  //         [p2wshpub1]: p2wshsig1,
  //         [p2wshpub2]: p2wshsig2
  //       }
  //     ]);

  //     expect(sigtx.toHex()).toBe(p2wshsigned)
  //   });
  // })
