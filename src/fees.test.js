import BigNumber from 'bignumber.js';

import {
  validateFeeRate, 
  validateFee,
  estimateMultisigTransactionFee,
  estimateMultisigTransactionFeeRate,
} from './fees';
import {P2SH} from "./p2sh";
import {P2SH_P2WSH} from "./p2sh_p2wsh";
import {P2WSH} from "./p2wsh";

describe("fees", () => {

  describe("validateFeeRate", () => {

    it("should return an error message for an unparseable fee rate", () => {
      BigNumber.DEBUG = true;
      expect(validateFeeRate(null)).toMatch(/invalid fee rate/i);
      BigNumber.DEBUG = false;
    });

    it("should return an error message for an unparseable fee rate", () => {
      expect(validateFeeRate('foo')).toMatch(/invalid fee rate/i);
    });

    it("should return an error message for a negative fee rate", () => {
      expect(validateFeeRate(-1)).toMatch(/cannot be negative/i);
    });

    it("should return an empty string for a zero fee rate", () => {
      expect(validateFeeRate(0)).toBe("");
    });

    it("should return an error message when the fee rate is too high", () => {
      expect(validateFeeRate(10000)).toMatch(/too high/i);
    });
    
    it("return an empty string for an acceptable fee rate", () => {
      expect(validateFeeRate(100)).toBe("");
    });
  });

  describe("validateFee", () => {

    it("should return an error message for an unparseable fee", () => {
      // If BigNumber.DEBUG is set true then an error will be thrown if this BigNumber constructor receives an invalid value
      // see https://mikemcl.github.io/bignumber.js/#debug
      BigNumber.DEBUG = true;
      expect(validateFee(null, 1000000)).toMatch(/invalid fee/i);
      BigNumber.DEBUG = false;
    });

    it("should return an error message for an unparseable inputTotalSats", () => {
      BigNumber.DEBUG = true;
      expect(validateFee(10000, null)).toMatch(/invalid total input amount/i);
      BigNumber.DEBUG = false;
    });

    it("should return an error message for an unparseable fee", () => {
      expect(validateFee('foo', 1000000)).toMatch(/invalid fee/i);
    });

    it("should return an error message for an unparseable total input amount", () => {
      expect(validateFee(10000, 'foo')).toMatch(/invalid total input amount/i);
    });

    it("should return an error message for a negative fee", () => {
      expect(validateFee(-1, 1000000)).toMatch(/cannot be negative/i);
    });

    it("should return an error message for a negative total input amount", () => {
      expect(validateFee(10000, -1)).toMatch(/must be positive/i);
    });

    it("should return an error message for a zero total linput amount", () => {
      expect(validateFee(10000, 0)).toMatch(/must be positive/i);
    });

    it("should return an empty string for a zero fee", () => {
      expect(validateFee(0, 1000000)).toBe("");
    });

    it("should return an error message when the fee is too high", () => {
      expect(validateFee(2500001, 10000000)).toMatch(/too high/i);
    });

    it("should return an error message when the fee higher than the total input amount", () => {
      expect(validateFee(100001, 100000)).toMatch(/too high/i);
    });

    it("should return an empty string for an acceptable fee", () => {
      expect(validateFee(10000, 1000000)).toBe("");
    });

  });

  describe("estimating multisig transaction fees and fee rates", () => {

    it("should estimate null for bad addressType", () => {
      const params = {
        addressType: 'foo',
        feesPerByteInSatoshis: "10",
      };
      const fee = estimateMultisigTransactionFee(params);
      expect(isNaN(fee)).toBe(true);
    });

    it("should estimate for P2SH transactions", () => {
      const params = {
        addressType: P2SH,
        numInputs: 2,
        numOutputs: 3,
        m: 2,
        n: 3,
        feesInSatoshis: "7180",
        feesPerByteInSatoshis: "10",
      };
      const fee = estimateMultisigTransactionFee(params);
      const feeRate = estimateMultisigTransactionFeeRate(params);
      expect(fee).toEqual(BigNumber(params.feesInSatoshis));
      expect(feeRate).toEqual(BigNumber(params.feesPerByteInSatoshis));
    });

    it("should estimate for P2SH-P2WSH transactions", () => {
      const params = {
        addressType: P2SH_P2WSH,
        numInputs: 2,
        numOutputs: 3,
        m: 2,
        n: 3,
        feesInSatoshis: "4090",
        feesPerByteInSatoshis: "10",
      };
      const fee = estimateMultisigTransactionFee(params);
      const feeRate = estimateMultisigTransactionFeeRate(params);
      expect(fee).toEqual(BigNumber(params.feesInSatoshis));
      expect(feeRate).toEqual(BigNumber(params.feesPerByteInSatoshis));
    });

    it("should estimate for P2WSH transactions", () => {
      // fee amounts from real tbtc tx
      // 0c18cb0ac72a3bd610bc3cd9c79a6fc5d3786a8d9777c26a3a264a3181862db2
      const params = {
        addressType: P2WSH,
        numInputs: 3,
        numOutputs: 3,
        m: 2,
        n: 3,
        feesInSatoshis: "4550",
        feesPerByteInSatoshis: "10"
      };
      const fee = estimateMultisigTransactionFee(params);
      const feeRate = estimateMultisigTransactionFeeRate(params);
      expect(fee).toEqual(BigNumber(params.feesInSatoshis));
      expect(feeRate).toEqual(BigNumber(params.feesPerByteInSatoshis));
    });

  });

});
