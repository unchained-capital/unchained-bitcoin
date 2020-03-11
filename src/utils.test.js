import BigNumber from "bignumber.js";
import {
  validateHex,
  toHexString,
  satoshisToBitcoins,
  bitcoinsToSatoshis,
  hash160
} from './utils';
import crypto from 'crypto'

describe("utils", () => {

  describe('validateHex', () => {

    it("returns the empty string on valid hex", () => {
      expect(validateHex('deadbeef02')).toBe('');
    });

    it("returns an error message on an odd number of characters", () => {
      expect(validateHex('deadbeef0')).toMatch(/invalid hex.+odd/i);
    });

    it("return an error message on invalid characters", () => {
      ['dead  beef', 'dead--beef', 'dead__beef'].forEach(hex => {
        expect(validateHex(hex)).toMatch(/invalid hex.+only characters/i);
      });
    });

  });

  describe('toHexString', () => {
    it('converts a buffer of bytes to a hex string', () => {
      expect(toHexString([0, 1, 2, 3])).toEqual('00010203');
      expect(toHexString([15, 31, 47, 63])).toEqual('0f1f2f3f');
      expect(toHexString([16, 32, 48, 64])).toEqual('10203040');
      expect(toHexString([255, 0, 15, 16, 31, 32])).toEqual('ff000f101f20');
    });
  });

  describe('satoshisToBitcoins', () => {

    it('rounds absolute values less than one Satoshi to zero', () => {
      expect(satoshisToBitcoins(0.5)).toEqual(BigNumber(0));
      expect(satoshisToBitcoins('0.5')).toEqual(BigNumber(0));
      expect(satoshisToBitcoins(-0.5)).toEqual(BigNumber(-0));
      expect(satoshisToBitcoins('-0.5')).toEqual(BigNumber(-0));
    });

    it('can convert a single Satoshi in absolute value', () => {
      expect(satoshisToBitcoins(1)).toEqual(BigNumber('0.00000001'));
      expect(satoshisToBitcoins('1')).toEqual(BigNumber('0.00000001'));
      expect(satoshisToBitcoins(-1)).toEqual(BigNumber('-0.00000001'));
      expect(satoshisToBitcoins('-1')).toEqual(BigNumber('-0.00000001'));
    });

    it("rounds inputs down to the nearest Satoshi", () => {
      expect(satoshisToBitcoins(1.5)).toEqual(BigNumber('0.00000001'));
      expect(satoshisToBitcoins('1.5')).toEqual(BigNumber('0.00000001'));
      expect(satoshisToBitcoins(-1.5)).toEqual(BigNumber('-0.00000001'));
      expect(satoshisToBitcoins('-1.5')).toEqual(BigNumber('-0.00000001'));

      expect(satoshisToBitcoins(100000000.5)).toEqual(BigNumber('1.0'));
      expect(satoshisToBitcoins('100000000.5')).toEqual(BigNumber('1.0'));
      expect(satoshisToBitcoins(-100000000.5)).toEqual(BigNumber('-1.0'));
      expect(satoshisToBitcoins('-100000000.5')).toEqual(BigNumber('-1.0'));

      expect(satoshisToBitcoins(100000001)).toEqual(BigNumber('1.00000001'));
      expect(satoshisToBitcoins('100000001')).toEqual(BigNumber('1.00000001'));
      expect(satoshisToBitcoins(-100000001)).toEqual(BigNumber('-1.00000001'));
      expect(satoshisToBitcoins('-100000001')).toEqual(BigNumber('-1.00000001'));
    });

    it("accepts amounts larger than the theoretical maximum absolute value", () => {
      expect(satoshisToBitcoins(2200000000000000)).toEqual(BigNumber('22000000.0'));
      expect(satoshisToBitcoins('2200000000000000')).toEqual(BigNumber('22000000.0'));
      expect(satoshisToBitcoins(-2200000000000000)).toEqual(BigNumber('-22000000.0'));
      expect(satoshisToBitcoins('-2200000000000000')).toEqual(BigNumber('-22000000.0'));
    });
  });

  describe('bitcoinsToSatoshis', () => {

    it('rounds outputs less than one Satoshi to zero', () => {
      expect(bitcoinsToSatoshis(0.000000001)).toEqual(BigNumber(0));
      expect(bitcoinsToSatoshis('0.000000001')).toEqual(BigNumber(0));
      expect(bitcoinsToSatoshis(-0.000000001)).toEqual(BigNumber(-0));
      expect(bitcoinsToSatoshis('-0.000000001')).toEqual(BigNumber(-0));
    });


    it('can convert a single Satoshi in absolute value', () => {
      expect(bitcoinsToSatoshis(0.00000001)).toEqual(BigNumber(1));
      expect(bitcoinsToSatoshis('0.00000001')).toEqual(BigNumber(1));
      expect(bitcoinsToSatoshis(-0.00000001)).toEqual(BigNumber(-1));
      expect(bitcoinsToSatoshis('-0.00000001')).toEqual(BigNumber(-1));
    });


    it('rounds outputs down to the nearest Satoshi', () => {
      expect(bitcoinsToSatoshis(1.000000019)).toEqual(BigNumber('100000001'));
      expect(bitcoinsToSatoshis('1.000000019')).toEqual(BigNumber('100000001'));
      expect(bitcoinsToSatoshis(-1.000000019)).toEqual(BigNumber('-100000001'));
      expect(bitcoinsToSatoshis('-1.000000019')).toEqual(BigNumber('-100000001'));
    });

    it('accepts amounts largerr than the theoretical absolute value', () => {
      expect(bitcoinsToSatoshis(22000000)).toEqual(BigNumber('2200000000000000'));
      expect(bitcoinsToSatoshis('22000000')).toEqual(BigNumber('2200000000000000'));
      expect(bitcoinsToSatoshis(-22000000)).toEqual(BigNumber('-2200000000000000'));
      expect(bitcoinsToSatoshis('-22000000')).toEqual(BigNumber('-2200000000000000'));
    });

  });

  describe('hash160', () => {
    it('should take a buffer and hash it with sha256 and ripemd160', () => {
      const val = Buffer.from('a2bc6de234a4b2fe10fe582f29c39de52b8161624ef310ca6cccff5d6d7d591a', 'hex')
      const expected = Buffer.from('d06d0dadca1f9cf3aedd5514e0669c2fffa7bc81', 'hex')
      expect(hash160(val)).toEqual(expected)
    })
  })
});


