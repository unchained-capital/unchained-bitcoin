import {
    bip32PathToSequence, bip32SequenceToPath, validateBIP32Path,
    deriveChildPublicKey, deriveChildExtendedPublicKey, HARDENING_OFFSET
} from './bip32';
import { NETWORKS } from './networks';
import { emptyValues } from './test_constants'

const validPaths = [
    { path: "m/0/0/0", sequence: [0, 0, 0] },
    { path: "m/0'/0'/0", sequence: [0 + HARDENING_OFFSET, 0 + HARDENING_OFFSET, 0] },
    { path: "m/45'/1/99", sequence: [45 + HARDENING_OFFSET, 1, 99] },
    { path: "m/45'/63'/7", sequence: [45 + HARDENING_OFFSET, 63 + HARDENING_OFFSET, 7] },
    { path: "m/41/2147483647/0", sequence: [41, 2147483647, 0] }
]

describe("Test BIP32 library", () => {
    describe("Test bip32PathToSequence", () => {
        it('should properly convert a BIP32 path to a sequence of integers', () => {
            validPaths.forEach(p => {
                const sequence = bip32PathToSequence(p.path)
                expect(sequence).toEqual(p.sequence);
            })
        });
    })

    describe("Test bip32SequenceToPath", () => {
        it('should properly convert a BIP32 sequence of integers to a BIP32 path', () => {
            validPaths.forEach(p => {
                const path = bip32SequenceToPath(p.sequence);
                expect(path).toEqual(p.path);
            });
        });
    })

    describe("Test validateBIP32Path", () => {
        describe("Validate BIP32 paths with no options", () => {
            it('should properly report empty values used as a BIP32 path', () => {
                emptyValues.forEach(b => {
                    const result = validateBIP32Path(b);
                    expect(result).toBe("BIP32 path cannot be blank.");
                });
            });

            it('should properly report invalid BIP32 paths', () => {
                const bad = ["n/0/0", 'm/0"/0', "m'/0"]
                bad.forEach(b => {
                    const result = validateBIP32Path(b);
                    expect(result).toBe("BIP32 path is invalid.");
                });
            });

            it('should not provide a validation message for a valid BIP32 path', () => {
                validPaths.forEach(p => {
                    const result = validateBIP32Path(p.path);
                    expect(result).toEqual("");
                });
            });

            it('should properly report a path segment that is out of range', () => {
                const result = validateBIP32Path(`m/0/${HARDENING_OFFSET * 2}`);
                expect(result).toEqual("BIP32 index is too high.");
            });
        })

        describe("Validate BIP32 paths with options", () => {
            it('should properly report the use of unhardened paths with "hardened" option', () => {
                const hard = ["m/45'/0", "m/45/0'"]
                hard.forEach(b => {
                    const result = validateBIP32Path(b, { mode: "hardened" });
                    expect(result).toBe("BIP32 path must be fully-hardened.");
                });
            });

            it('should properly report the use of hardened paths with "unhardened" option', () => {
                const hard = ["m/45'/0", "m/45/0'"]
                hard.forEach(b => {
                    const result = validateBIP32Path(b, { mode: "unhardened" });
                    expect(result).toBe("BIP32 path cannot include hardened segments.");
                });
            });
        })
    })

    // "BIP32 path segment cannot be blank." seems unreachable
    // "Invalid BIP32 path segment." unreachable

    // merge alley lucky axis penalty manage latin gasp virus captain wheel deal chase fragile chapter boss zero dirt stadium tooth physical valve kid plunge
    const keys = [
        // m/45'/0'/4'
        {
            xpub: "xpub6CCHViYn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab",
            tpub: "tpubDCZv1xNTnmwmiZW4boJEY6YmKH2qKscsV9tuimmwaN8pT8NCxwtFLEAJUTSw6yxf4N44AQVFpt26vwVMBhxhTLAAN1w2Cgidnc7n3JVnBDH",
            main: [
                {
                    path: "m/0/0",
                    pub: "021a0b6eb37bd9d2767a364601e41635a11c1dbbbb601efab8406281e210336ace",
                    xpub: "xpub6GYTTMaaN8bSEhicdKq7ji9H7B2SL4un33obThv9aekop4J7L7B3snYMnJUuwXJiUmsbSVSyZydbqLC97JMWnj3R4MHz6JNunMJhjEBKovS",
                    tpub: "tpubDGv5ybQG5QYtWVuU5WpCwdUeSJ86KTQqagPtpFyHvZWhZLxpQL292EDC2LZhU2FxGgQW44xr75TeXWgkWACkgAVi7x3Hmq39NJu7VBdS42V"
                },
                {
                    path: "m/6/2",
                    pub: "021bb3e8d7e2ded6301478457de6b651f5f7b4b20dad28ddfee70c746719443ff8",
                    xpub: "xpub6HBwGjhNzvy16npAQ2y53kpWcaaohBZCjh3HvPwngWwEVjT5hUtVeg8YPr11DpZgcb4DWsAH273Z7Jxo1fSMXkQemLrBWRxjERqHz12L2K1",
                    tpub: "tpubDHZZnyX4iCvTNb11rDxAFg9swhgTga4GHKdbGwzw2Rh8F27nmhjao7oNdt5nkKWvQVb88Sg9ZCsboVTQQXHbRBrwpwbVBxcxpPRhk4NnLYN"
                },
            ]
        },
        // m/45'/0'/0''
        {
            xpub: "xpub6CCHViYn5VzKFqrKjAzSSqP8XXSU5fEC6ZYSncX5pvSKoRLrPDcF8cEaZkrQvvnuwRUXeKVjoGmAqvbwVkNBFLaRiqcdVhWPyuShUrbcZsv",
            tpub: "tpubDCZv1xNTnmwmXe3BBMyXekiVreY853jFeC8k9AaEAqCDYi1ZTSTLH3uQonwCTRk9jL1SFu1cLNbDY76YtcDR8n2inSMwBEAdZs37EpYS9px",
            main: [
                {
                    path: "m/0/0",
                    pub: "03102f0df5e34ffa1178a5310952221b8e26b3e761a9e328832c750a2de252f21a",
                    xpub: "xpub6FjSpitFpSJB9BpSVwp3eJzhpaQFLbLefD1f3qaGRmok2Z2FDeSNsy5CL9TLwM3HpcV2kAyTNf2W1uUXs1jbeXGWjdWnsaqnUQ9PyWAYVhQ",
                    tpub: "tpubDG75LxhwXiFdQz1Hx8o8rEL59hVuKyqiCqbxQPdQmgZdmqgxHsHU2Qk2aBY8TqzXcX1wMkVKukrYi5y9FsaqXxiooEG6Z7W24MjojRNcVtA"
                },
            ]
        },
        // m/45'/0'/4'/99'
        {
            xpub: "xpub6DYRpdguLMw7gRvTn4Qo3VBU7k6ucyauGyR4chHftSQVoX5M5ArP4qgfyGWFzrURBmXyebFDg7TLh82cbk7KEsL2Es74hS24bxoEduYyDDq",
            tpub: "tpubDDv4LsWb3dtZxE7KEFPtFQWqSsCZcN5xpc1MyFLpEMAPYok49PhUDHMWDJb3XMReyg4tGAm6DDHPPJXDzbxZ8JnKJTrNNxgJBvPePy4Px6s",
            main: [
                {
                    path: "m/0/0",
                    pub: "030d661b96bd1dbb22f6eacabb94905bca5694eb3af5d699c1b2d8de5427496f42",
                    xpub: "xpub6JfuzV9Yo9m1L9nBcMVVjgg3kmkCr7rkjAS5cTy2Dny4bjFS5m4Rvdrj71hAHR8qmhUN7mRbxgoBZjP93EdNQiiLM2XnDPPTBFYUEfRaiz3",
                    tpub: "tpubDK3YWiyEWRiTbwy34YUawc1R5tqrqWMpGo2Ny22AZhixM1v99yuX55XZM3mwov65Zc1GjLwUVndEFuskS6UcJAAdQdH5tv3gmD8szggjEA4"
                },
                {
                    path: "m/2147483647/3/1",
                    pub: "0211aa5c03e290dc0110103c3d3f817500e76061d35ea89072286cb6f7962eda81",
                    xpub: "xpub6LCRwXBN9moqsJKhToW6K5qfBfTguMXuZw67q1BUuaWRyYD56P1zhqbyXsHqoo4WPsjUfeiJPu4JXnhtUz6cHbYgX6AFfDhUnPfCvbZD3JZ",
                    tpub: "tpubDLa4Tm13s3mJ96WYuzVBX1B2WnZLtk2y7ZgRBZEdFVGKipsnAbs5rHGomuNdLJ1kBnGPHEEAvztMDyCVsqwrB2zyaguZLkMiNMFcgX4e2rG"
                },

            ]
        },
    ];

    describe("Test deriveChildPublicKey", () => {
        it('should properly derive child public keys for mainnet', () => {
            keys.forEach(key => {
                key.main.forEach(main => {
                    const result = deriveChildPublicKey(key.xpub, main.path, NETWORKS.MAINNET);
                    expect(result).toBe(main.pub);
                })
            })
        });

        it('should properly derive child public keys for testnet', () => {
            keys.forEach(key => {
                key.main.forEach(main => {
                    const result = deriveChildPublicKey(key.tpub, main.path, NETWORKS.TESTNET);
                    expect(result).toBe(main.pub);
                })
            })
        });
    })

    describe("Test deriveChildExtendedPublicKey", () => {
        it('should properly derive child extended public keys for mainnet', () => {
            keys.forEach(key => {
                key.main.forEach(main => {
                    const result = deriveChildExtendedPublicKey(key.xpub, main.path, NETWORKS.MAINNET);
                    expect(result).toBe(main.xpub);
                })
            })
        });

        it('should properly derive child extended public keys for testnet', () => {
            keys.forEach(key => {
                key.main.forEach(main => {
                    const result = deriveChildExtendedPublicKey(key.tpub, main.path, NETWORKS.TESTNET);
                    expect(result).toBe(main.tpub);
                });
            });
        });
    });

});
