import { networkData, NETWORKS } from './networks';
import { validateHex, toHexString, satoshisToBitcoins, bitcoinsToSatoshis } from './utils';
import BigNumber from 'bignumber.js';
import { estimateMultisigP2SHTransactionLength } from './p2sh'
import { estimateMultisigP2SHP2WSHTransactionLength } from './p2sh_p2wsh'
import { estimateMultisigP2WSHTransactionLength } from './p2wsh'
const bitcoin = require('bitcoinjs-lib');

describe("Test network", () => {
    describe("Test networkData", () => {
        it("should properly return testnet as the default network object", () => {
            const net = networkData();
            expect(net).toEqual(bitcoin.networks.testnet);
        });

        it("should properly return the mainnet network object", () => {
            const net = networkData(NETWORKS.MAINNET);
            expect(net).toEqual(bitcoin.networks.bitcoin);
        });

        it("should properly return the testnet network object", () => {
            const net = networkData(NETWORKS.TESTNET);
            expect(net).toEqual(bitcoin.networks.testnet);
        });
    });
});

describe("test utils", () => {
    describe('Test validateHex', () => {
        it("should not provide a validation message for a valid hex string", () => {
            const hex = validateHex('00112233');
            expect(hex).toBe('')
        });

        it("should properly report the validation of a hex string with odd number of characters", () => {
            const hex = validateHex('001122334');
            expect(hex).toBe('invalid hex - odd-length string')
        });

        it("should properly report the validation of a hex string with invalid characters", () => {
            ['00112233gg', '-0001122', '0xffff'].forEach(h => {
                const hex = validateHex(h);
                expect(hex).toBe('invalid hex - invalid characters')
            })
        });
    })

    describe('Test toHexString', () => {
        it('should properly convert a buffer of bytes to hex string', () => {
            [
                {buff: [0, 1, 2, 3], string: '00010203'},
                {buff: [15, 31, 47, 63], string: '0f1f2f3f'},
                {buff: [16, 32, 48, 64], string: '10203040'},
                {buff: [255, 0, 15, 16, 31, 32], string: 'ff000f101f20'},
            ].forEach(h => {
                const hex = toHexString(h.buff);
                expect(hex).toBe(h.string);
            })
        })
    });

    const conversionValues =[
        { btc: 1.2345, sats: 123450000},
        { btc: 0.00000001, sats: 1},
        { btc: BigNumber(0.00000001), sats: BigNumber(1)},
        { btc: BigNumber(21000000), sats: BigNumber('2100000000000000') }
    ]
    describe('Test satoshisToBitcoins', () => {
        it('should properly convert a satoshi value to the corresponding value in bitcoin', () => {
            conversionValues.forEach(val => {
                const btc = satoshisToBitcoins(val.sats);
                expect(btc.eq(val.btc)).toBe(true)
            })
        });
    });

    describe('Test bitcoinsToSatoshis', () => {
        it('should properly convert a bitcoin value to the corresponding value in satoshis', () => {
            conversionValues.forEach(val => {
                const sats = bitcoinsToSatoshis(val.btc);
                expect(sats.eq(val.sats)).toBe(true)
            })
        });
    });

});

describe('Test transaction length calculations', () => {
    describe('Test estimateMultisigP2SHTransactionLength', () => {
        it('should properly estimate the transaction size in bytes for P2SH', () => {
            const config = {numInputs:1, numOutputs: 1, m: 1, n: 1};
            const est = estimateMultisigP2SHTransactionLength(config);
            expect(est).toBe(216)
        });
    });

    describe('Test estimateMultisigP2WSHTransactionLength', () => {
        it.skip('should properly estimate the transaction size in bytes for P2WSH', () => {
            const config = {numInputs:1, numOutputs: 1, m: 1, n: 1}
            const est = estimateMultisigP2WSHTransactionLength(cofig);
            expect(est).toBe(113) // actual value from bitcoin core for P2PKH out
        });
    });

    describe('Test estimateMultisigP2SHP2WSHTransactionLength', () => {
        it.skip('should properly estimate the transaction size in bytes for P2SH-P2WSH', () => {
            const config = {numInputs:1, numOutputs: 1, m: 1, n: 1}
            const est = estimateMultisigP2SHP2WSHTransactionLength(config);
            expect(est).toBe(148) // actual value from bitcoin core for P2PKH out
        });
    });
});
