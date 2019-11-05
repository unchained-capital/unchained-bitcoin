import { validateExtendedPublicKey, validatePublicKey, compressPublicKey } from './keys'
import { NETWORKS } from './networks';

import { emptyValues } from './test_constants';

describe('Test key validation library', () => {
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
            expect(result).toBe("Extended public key must begin with 'xpub'.");
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
                const xpub = "xpub6CCHViYn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab";
                const result = validateExtendedPublicKey(xpub, NETWORKS.MAINNET);
                expect(result).toBe("");
            });

            it('should not provide a validation message for a valid tpub key on testnet', () => {
                const tpub = "tpubDCZv1xNTnmwmiZW4boJEY6YmKH2qKscsV9tuimmwaN8pT8NCxwtFLEAJUTSw6yxf4N44AQVFpt26vwVMBhxhTLAAN1w2Cgidnc7n3JVnBDH";
                const result = validateExtendedPublicKey(tpub, NETWORKS.TESTNET);
                expect(result).toBe("");
            });
        });

    });

    const keys = [
        {
            compressed: "030a0513acdd7f4c45c358eca732561034b528bee85b1497069aab56e1e2cd6f6e",
            uncompressed: "040a0513acdd7f4c45c358eca732561034b528bee85b1497069aab56e1e2cd6f6e8ed22e70d1a2cccda7783077bf153f4880f7545c05cb9e3784d5492086ac5879"
        },
        {
            compressed: "02a1b2b00fa97df424faa787eefa685d63c469c03baa072f2fc06d9f295394201d",
            uncompressed: "04a1b2b00fa97df424faa787eefa685d63c469c03baa072f2fc06d9f295394201d25551797099aaadab14a30883a88251b1ee12568888128be102fd9e7d16366cc"
        },
        {
            compressed: "022c84eb50b39aae1e8c7836c72167dfd006c65e11bf388d7b7d0224dd18cccf5d",
            uncompressed: "042c84eb50b39aae1e8c7836c72167dfd006c65e11bf388d7b7d0224dd18cccf5db0b9560aa95be1705ed0ef0da9b25d62fdf1a38bc4920b696a255d4d75b4c92c"
        },
        {
            compressed: "035f62875769c542af11068b481bc5bd88f8348de911addcd305dbf42920c22612",
            uncompressed: "045f62875769c542af11068b481bc5bd88f8348de911addcd305dbf42920c22612b4ea0004f7de33db7f810f0199bded335041a9588b8a5afdab4f787d05f18ec5"
        },
    ]
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

        it('should not provide a validation message for a valid compressed public key', () => {
            keys.forEach(key => {
                const result = validatePublicKey(key.compressed);
                expect(result).toBe("")
            })
        });

        it('should not provide a validation message for a valid uncompressed public key', () => {
            keys.forEach(key => {
                const result = validatePublicKey(key.uncompressed);
                expect(result).toBe("")
            })
        });
    });

    describe("Test compressPublicKey", () => {
        it("should properly compress public key", () => {
            keys.forEach(k => {
                const result = compressPublicKey(k.uncompressed);
                expect(result).toBe(k.compressed)
            });
        });
    })
});