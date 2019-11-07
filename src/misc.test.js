import { networkData, NETWORKS } from './networks';
import { validateHex, toHexString, satoshisToBitcoins, bitcoinsToSatoshis } from './utils';
import { estimateMultisigP2SHTransactionLength } from './p2sh'
import { estimateMultisigP2SHP2WSHTransactionLength } from './p2sh_p2wsh'
import { estimateMultisigP2WSHTransactionLength } from './p2wsh'
import { buffString, bitcoinValues } from './test_constants'
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
            buffString.forEach(h => {
                const hex = toHexString(h.buff);
                expect(hex).toBe(h.string);
            })
        })
    });

    
    describe('Test satoshisToBitcoins', () => {
        it('should properly convert a satoshi value to the corresponding value in bitcoin', () => {
            bitcoinValues.forEach(val => {
                const btc = satoshisToBitcoins(val.sats);
                expect(btc.eq(val.btc)).toBe(true)
            })
        });
    });

    describe('Test bitcoinsToSatoshis', () => {
        it('should properly convert a bitcoin value to the corresponding value in satoshis', () => {
            bitcoinValues.forEach(val => {
                const sats = bitcoinsToSatoshis(val.btc);
                expect(sats.eq(val.sats)).toBe(true)
            })
        });
    });

});

describe('Test transaction length calculations', () => {
    describe('Test estimateMultisigP2SHTransactionLength', () => {
        it('should properly estimate the transaction size in bytes for P2SH', () => {
            const nin = 1;
            const nout = 1;
            const est = estimateMultisigP2SHTransactionLength({
                numInputs: 1, 
                numOutputs: 2,
                m: 2,
                n: 3});
            expect(est).toBe(391)
        });
    });

    describe('Test estimateMultisigP2WSHTransactionLength', () => {
        it('should properly estimate the transaction size in bytes for P2WSH', () => {
            const est = estimateMultisigP2WSHTransactionLength({
                numInputs: 1, 
                numOutputs: 2,
                m: 2,
                n: 3
            });
            expect(est).toBe(202) // actual value from bitcoin core for P2PKH out
        });
    });

    describe('Test estimateMultisigP2SHP2WSHTransactionLength', () => {
        it('should properly estimate the transaction size in bytes for P2SH-P2WSH', () => {
            const est = estimateMultisigP2SHP2WSHTransactionLength({
                numInputs: 2,
                numOutputs: 2,
                m: 3,
                n: 5
            });
            expect(est).toBe(444) // actual value from bitcoin core for P2PKH out
        });
    });
});
