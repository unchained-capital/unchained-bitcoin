import { validateExtendedPublicKey, validatePublicKey, compressPublicKey, validateSignaturePublicKey } from './keys'
import { NETWORKS } from './networks';
import {ECPair, payments, address} from "bitcoinjs-lib"
import {sign,magicHash,verify} from 'bitcoinjs-message';

import { emptyValues, keysCompressedUncompressed, validXpub, validTpub } from './test_constants';

const validAddress='115qNHcmBzhwZ7wmUC8BxDPcDN3WAaL9pa';

describe('Test key validation library', () => {
    describe("Test validateSignaturePublicKey", () => {
        it('should properly report the validation of empty message', () => {
            emptyValues.forEach(k => {
                const {error} = validateSignaturePublicKey(k, 'bad', 'AAAA', 'mainnet');
                expect(error).toBe("Message cannot be blank.");
            });
        });

        it('should properly report the validation of empty address', () => {
            emptyValues.forEach(k => {
                const {error} = validateSignaturePublicKey('message', k, 'AAAA', 'mainnet');
                expect(error).toBe("Address cannot be blank.");
            });
        });

        it('should properly report the validation of an invalid address', () => {
            const {error} = validateSignaturePublicKey('message', 'BadAddress', 'AAAA', 'mainnet');
            expect(error).toBe("Address must be valid.");
        });

        it('should properly report the validation of empty signature', () => {
            const pair = ECPair.makeRandom();
            const {address} = payments.p2pkh({pubkey: pair.publicKey});
            emptyValues.forEach(k => {
                const {error} = validateSignaturePublicKey('message', address, k, 'mainnet');
                expect(error).toBe("Signature cannot be blank.");
            });
        });

        it('should properly report the validation of an invalid signature', () => {
          const pair = ECPair.makeRandom();
          const {address} = payments.p2pkh({pubkey: pair.publicKey});
          const {error} = validateSignaturePublicKey('message', address, 'signature', 'mainnet');
          expect(error).toBe("Signature must be a valid base64 string.");
        });

        it('should properly report the validity a canned signed message', () => {
            const message = "nonce:188e13429beb61d2489e4d24";
            const address = "115qNHcmBzhwZ7wmUC8BxDPcDN3WAaL9pa";
            const signature = "Gyx7BbA3TzlgsnepjO9uL2ykcgL+laiTFFZmNyqEaCZD2hm57GFTeEREeWpV6IJLXLAP1+KP0FbAnHUM+7T2gOE=";
            const {publicKey, error} = validateSignaturePublicKey(message, address, signature, 'mainnet');
            expect(error).toBe(undefined);
            expect(publicKey).toBeTruthy();
        });

        it('should properly report the validity a canned signed message 2', () => {
            const message = "The test!";
            const address = "1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH";
            const signature = "IEiQ7kHfGqlxHSOcUftzR4gChjupJbuIIJCiY3LryQ9SXwPeRoBtJYkrNd/rgU7RP9jX6i2IaGGYMLt9bW+/bbI=";
            const {publicKey, error} = validateSignaturePublicKey(message, address, signature, 'mainnet');
            expect(error).toBe(undefined);
            expect(publicKey).toBeTruthy();
        });

        it('should properly report the validity a canned signed message 3', () => {
            const message = "The test!";
            const address = "mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r";
            const signature = "IEiQ7kHfGqlxHSOcUftzR4gChjupJbuIIJCiY3LryQ9SXwPeRoBtJYkrNd/rgU7RP9jX6i2IaGGYMLt9bW+/bbI=";
            const {publicKey, error} = validateSignaturePublicKey(message, address, signature, 'testnet');
            expect(error).toBe(undefined);
            expect(publicKey).toBeTruthy();
        });

        it('should properly report the validity a real signed message', () => {
            const message = 'this is a real message to sign';
            const pair = ECPair.makeRandom();
            const buffer = sign(message, pair.privateKey, pair.compressed);
            const signature = buffer.toString('base64');
            const {address} = payments.p2pkh({pubkey: pair.publicKey});
            const {publicKey, error} = validateSignaturePublicKey(message, address, signature, 'mainnet');
            expect(error).toBe(undefined);
            expect(publicKey).toEqual(pair.publicKey.toString('hex'))
        });
    });
    describe("Test validateExtendedPublicKey", () => {
        it('should properly report the validation of an empty key value', () => {
            emptyValues.forEach(k => {
                const result = validateExtendedPublicKey(k);
                expect(result).toBe("Extended public key cannot be blank.");
            });
        });

        describe("Test invalid prefixes", () =>{
            it('should properly report the validation of an improper key prefix on mainnet', () => {
                const key = "apub6CCHViYn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab";
                const result = validateExtendedPublicKey(key);
                expect(result).toBe("Extended public key must begin with 'xpub'.");
            });

            it('should properly report the validation of an improper key prefix on testnet', () => {
                const key = "apub6CCHViYn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab";
                const result = validateExtendedPublicKey(key, NETWORKS.TESTNET);
                expect(result).toBe("Extended public key must begin with 'xpub' or 'tpub'.");
            });
        });


        it("should properly report the validation of a key of insufficient length", () => {
            const key = "xpub";
            const result = validateExtendedPublicKey(key);
            expect(result).toBe("Extended public key length is too short.");
        });

        describe("Test invalid keys", () =>{
            const invalid = /^Invalid extended public key/
            it("should properly report the validation of an invalid xpub key on mainnet", () => {
                const xpub = "xpub6CCHV1Yn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab";
                const result = validateExtendedPublicKey(xpub, NETWORKS.MAINNET);
                expect(invalid.test(result)).toBe(true);
            });

            it("should properly report the validation of an invalid tpub key on testnet", () => {
                const tpub = "tpubDCZvixNTnmwmiZW4boJEY6YmKH2qKscsV9tuimmwaN8pT8NCxwtFLEAJUTSw6yxf4N44AQVFpt26vwVMBhxhTLAAN1w2Cgidnc7n3JVnBDH";
                const result = validateExtendedPublicKey(tpub, NETWORKS.TESTNET);
                expect(invalid.test(result)).toBe(true);
            });
        });

        describe("Test valid keys", () =>{
            it('should not provide a validation message for a valid xpub key on mainnet', () => {
                const result = validateExtendedPublicKey(validXpub, NETWORKS.MAINNET);
                expect(result).toBe("");
            });

            it('should not provide a validation message for a valid tpub key on testnet', () => {
                const result = validateExtendedPublicKey(validTpub, NETWORKS.TESTNET);
                expect(result).toBe("");
            });
        });

    });

    describe("Test validatePublicKey", () => {
        it('should properly report the validation of using an empty key value', () => {
            emptyValues.forEach(b => {
                const result = validatePublicKey(b);
                expect(result).toBe("Public key cannot be blank.");
            });
        });

        it("shold report invalid hex", () => {
            const bad = ["aaa", "ffaz"]
            bad.forEach(hex => {
                const result = validatePublicKey(hex);
                expect(result).not.toBe(""); // actual values test in utils module
            });
        });

        it("should report invalid key", () => {
            const bad = ["aaaa", "0000000000000000"]
            const invalid = /^Invalid public key/

            bad.forEach(key => {
                const result = validatePublicKey(key);
                console.log(result)
                expect(invalid.test(result)).toBe(true);
            });
        });

        it('should not provide a validation message for a valid compressed public key', () => {
            keysCompressedUncompressed.forEach(key => {
                const result = validatePublicKey(key.compressed);
                expect(result).toBe("")
            })
        });

        it('should not provide a validation message for a valid uncompressed public key', () => {
            keysCompressedUncompressed.forEach(key => {
                const result = validatePublicKey(key.uncompressed);
                expect(result).toBe("")
            })
        });
    });

    describe("Test compressPublicKey", () => {
        it("should properly compress public key", () => {
            keysCompressedUncompressed.forEach(k => {
                const result = compressPublicKey(k.uncompressed);
                expect(result).toBe(k.compressed)
            });
        });
    })
});