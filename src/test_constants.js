import BigNumber from 'bignumber.js';
import { unsignedMultisigTransaction } from './multisig'
import { NETWORKS } from './networks'
import { HARDENING_OFFSET } from './bip32'

let nodef
export const emptyValues = ["", null, nodef]

export const redeemscripts = [
    // 2 of 3
    "522103a90d10bf3794352bb1fa533dbd4ea75a0ffc98e0d05124938fcc3e10cdbe1a4321030d60e8d497fa8ce59a2b3203f0e597cd0182e1fe0cc3688f73497f2e99fbf64b2102b79dc8fda9d447f1928d64f95d61dc1f51a440f3c36650e5da74e5d6a98ea58653ae",

    // 1 of 2
    "512103a90d10bf3794352bb1fa533dbd4ea75a0ffc98e0d05124938fcc3e10cdbe1a4321030d60e8d497fa8ce59a2b3203f0e597cd0182e1fe0cc3688f73497f2e99fbf64b52ae",

    // 3 of 5
    "53210295cdbdadb83c706fc24024a882cabdb042a8d163d7ea57f48787e5dc8660e2ac2102b79dc8fda9d447f1928d64f95d61dc1f51a440f3c36650e5da74e5d6a98ea58621030d60e8d497fa8ce59a2b3203f0e597cd0182e1fe0cc3688f73497f2e99fbf64b2103a90d10bf3794352bb1fa533dbd4ea75a0ffc98e0d05124938fcc3e10cdbe1a432103b5d07fd61915bf8de1972bef407377b7a09dd0a0e10cbc2d2998d5eefbf155dc55ae",

    // 2 of 2
    "52210295cdbdadb83c706fc24024a882cabdb042a8d163d7ea57f48787e5dc8660e2ac2102b79dc8fda9d447f1928d64f95d61dc1f51a440f3c36650e5da74e5d6a98ea58652ae"
];

export const hashes = [
    "81aaef2af523f8b269ea9c8337d4fdcc3f982a668c54f63bf2d0d9dda6a662e6",
    "99fe3698ce9317dc634867616a9a3c5ed933d2bc9c66021d56dcbacedd39500b",
    "3ca73de7726d8c40b6c43a98e45b3c565893636bdf09cc08386a8add312a7935",
    "1f7ed8d53fce15c4b5196fd0bb3f584c128776e7f2d4099662e7e252eb987e11"
]

const TWO_OF_THREE = 0;
const ONE_OF_TWO = 1;
const THREE_OF_FIVE = 2;
const TWO_OF_TWO = 3;

export const required = {
    [TWO_OF_THREE]: 2,
    [ONE_OF_TWO]: 1,
    [THREE_OF_FIVE]: 3,
    [TWO_OF_TWO]: 2
};
export const total_signers = {
    [TWO_OF_THREE]: 3,
    [ONE_OF_TWO]: 2,
    [THREE_OF_FIVE]: 5,
    [TWO_OF_TWO]: 2
};

// merge alley lucky axis penalty manage latin gasp virus captain wheel deal chase fragile chapter boss zero dirt stadium tooth physical valve kid plunge
export const bip32TestKeys = [
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

export const pubkeys = [
    "0295cdbdadb83c706fc24024a882cabdb042a8d163d7ea57f48787e5dc8660e2ac",
    "02b79dc8fda9d447f1928d64f95d61dc1f51a440f3c36650e5da74e5d6a98ea586",
    "030d60e8d497fa8ce59a2b3203f0e597cd0182e1fe0cc3688f73497f2e99fbf64b",
    "03a90d10bf3794352bb1fa533dbd4ea75a0ffc98e0d05124938fcc3e10cdbe1a43",
    "03b5d07fd61915bf8de1972bef407377b7a09dd0a0e10cbc2d2998d5eefbf155dc"
];

export const addresses = {
    p2sh: {
        mainnet: {
            [TWO_OF_THREE]: "3QjbZNYzqhfAzE5vxF9jUU9DGGrHkGEchy",
            [ONE_OF_TWO]: "3GKw4VaBS8QVrJdENRJavVA6B9YbyqW5V3",
            [THREE_OF_FIVE]: "3BZibTzmfkTV1MHQCfNVzP4L2ofS2vDphW",
            [TWO_OF_TWO]: "33uEjMzvBxXNKLzBqHCUrpY8qY9C1qsm1i"
        },
        testnet: {
            [TWO_OF_THREE]: "2NGHod7V2TAAXC1iUdNmc6R8UUd4TVTuBmp",
            [ONE_OF_TWO]: "2N7t98EWD3aur46Fn3YvTYS9MPVkmoLkqUE",
            [THREE_OF_FIVE]: "2N37vfCvoHCxqD8uwsnzNcL3bF9sbmwTvgF",
            [TWO_OF_TWO]: "2MuTSo6vwoR2iX8cjWQpMUmXQ3tMMoiBWZT"
        }
    },
    p2shP2swh: {
        mainnet: {
            [TWO_OF_THREE]: "3L2DYfwBmbfGdbvD7ejeYeK9R6XMFh7344",
            [ONE_OF_TWO]: "3EGsZjJMBGfEQzjwqi6L4u6iZJm9fi8vMa",
            [THREE_OF_FIVE]: "3AAu26iCv2zKEy3wWVjk1X1qrF5fWUYQag",
            [TWO_OF_TWO]: "381NrStBf66ngvnXvhPtCxnqL2hnzQmeYC"
        },
        testnet: {
            [TWO_OF_THREE]: "2NBaRcQsDP4AcqPYknnMXAbJQdSjWz1uBWM",
            [ONE_OF_TWO]: "2N5q5dUENnjAacnNVWqiCgr5ymeyKX2pT1B",
            [THREE_OF_FIVE]: "2N1j75qeEXVVfSkgVBdMcdU174bHqEKFHp7",
            [TWO_OF_TWO]: "2MyZavBpDGYc8tiR5bq1kpun6YNuxmZhYdV"
        }
    },
    p2wsh: {
        mainnet: {
            [TWO_OF_THREE]: "bc1qsx4w72h4y0uty602njpn048aesles2nx3320vwlj6rvamf4xvtnq7f5sdy",
            [ONE_OF_TWO]: "bc1qn8lrdxxwjvtacc6gvask4x3utmvn854un3nqy82kmjavahfe2q9sra38fj",
            [THREE_OF_FIVE]: "bc1q8jnnmemjdkxypdky82vwgkeu2evfxcmtmuyuczpcd29d6vf20y6se4ntz7",
            [TWO_OF_TWO]: "bc1qrald34flec2ufdgedlgtk06cfsfgwah87t2qn9nzul3996uc0cgsvv2td9"
        },
        testnet: {
            [TWO_OF_THREE]: "tb1qsx4w72h4y0uty602njpn048aesles2nx3320vwlj6rvamf4xvtnqfpzlht",
            [ONE_OF_TWO]: "tb1qn8lrdxxwjvtacc6gvask4x3utmvn854un3nqy82kmjavahfe2q9s548gna",
            [THREE_OF_FIVE]: "tb1q8jnnmemjdkxypdky82vwgkeu2evfxcmtmuyuczpcd29d6vf20y6swa9yc3",
            [TWO_OF_TWO]: "tb1qrald34flec2ufdgedlgtk06cfsfgwah87t2qn9nzul3996uc0cgsmyuyh2"
        }
    },
}

export const testTxs = [
    {
        inputs: [
            {
                txid: "916d6c481237dfa78beaf0d931095bf0ce66a9d3d92a8c62a0f187f39f673ed7",
                index: 1
            }
        ],
        outputs: [
            {
                address: "tb1quzdlt9ytvg8z7rprn08shrtucnnju5zhf7jlsf",
                amountSats: BigNumber(100000)
            },
            {
                address: "tb1qf8xhpmszkvpkjnelq76up4hnfn8qep8406safy",
                amountSats: BigNumber(999318)
            }
        ]
    },
    {
        inputs: [
            {
                txid: "19e354df0b3d98071ec70b2035aa376727021e7f6befe569c4a648d25215f263",
                index: 0,
                amountSats: BigNumber(112233)
            }
        ],
        outputs: [
            {
                address: "2N64Na46fGcbdbSso9aCoyE6Ruc5hvoGagP",
                amountSats: BigNumber(111892)
            }
        ]
    }
]

export function getUnsigned(index) {
    return unsignedMultisigTransaction(NETWORKS.TESTNET, testTxs[index].inputs, testTxs[index].outputs);
}

export function getUnsignedWithAmount(index) {
    const tx = testTxs[index]
    const unsigned = unsignedMultisigTransaction(NETWORKS.TESTNET, tx.inputs, tx.outputs);
    const amountSats = tx.inputs[0].amountSats
    return { unsigned: unsigned, amountSats: amountSats }
}

export const unsigned = "0100000001d73e679ff387f1a0628c2ad9d3a966cef05b0931d9f0ea8ba7df3712486c6d910100000000ffffffff02a086010000000000160014e09bf5948b620e2f0c239bcf0b8d7cc4e72e5057963f0f000000000016001449cd70ee02b303694f3f07b5c0d6f34cce0c84f500000000"

export const redeemMulti = "522103684f6787d61cc6af5ea660129f97e312ce0e5276abaf569e842f167c4630126021030c58cc16013c7fdf510ab2b68be808e0de2b25d0f36bb17c60bafd11bb052d9e21020cc7153dd76284f35f8caa86a7d1cae228b10f1bb94dcdbc34ce579b2ea08e1053ae";
export const sig1 = "30440220564e4623beaed42fb0302a2ee2e78e1e7cbee5ed256285b831450b70e8dbc2fa022018a29525a2deccbf397a4952d64a9b317bbd926d44418ec3f6cff4b2001b474c";
export const sig2 = "30440220707beb7625cb4b9925bbae2668d34d44de78879728e14bc40d0c84ea7947c9860220230dcbde54882b481e287d852d2545bb0d955af13984d06ff62ba4bd1de6cd59";
export const signed = "0100000001d73e679ff387f1a0628c2ad9d3a966cef05b0931d9f0ea8ba7df3712486c6d9101000000b4004730440220564e4623beaed42fb0302a2ee2e78e1e7cbee5ed256285b831450b70e8dbc2fa022018a29525a2deccbf397a4952d64a9b317bbd926d44418ec3f6cff4b2001b474c014c69522103684f6787d61cc6af5ea660129f97e312ce0e5276abaf569e842f167c4630126021030c58cc16013c7fdf510ab2b68be808e0de2b25d0f36bb17c60bafd11bb052d9e21020cc7153dd76284f35f8caa86a7d1cae228b10f1bb94dcdbc34ce579b2ea08e1053aeffffffff02a086010000000000160014e09bf5948b620e2f0c239bcf0b8d7cc4e72e5057963f0f000000000016001449cd70ee02b303694f3f07b5c0d6f34cce0c84f500000000";
export const p2shkey1 = "03684f6787d61cc6af5ea660129f97e312ce0e5276abaf569e842f167c46301260"
export const p2shkey2 = "030c58cc16013c7fdf510ab2b68be808e0de2b25d0f36bb17c60bafd11bb052d9e"
export const p2shkey3 = "020cc7153dd76284f35f8caa86a7d1cae228b10f1bb94dcdbc34ce579b2ea08e10"

export const p2wshredeem = "522103e5f18951d941bee110d3ae370811a2b8427d9045e850dc02c338115ccf5f392d2102a0d3826e6c71e5d609cc3787f581c8562a93a969668481d4a579aa5666e6e2342102e1085e3fb4acb21042dab6425efc84639140bdab42d99f9e5638123df9a83f9553ae"
export const p2wshsig1 = "3044022062aa154a5be4ab5a1b1933113b02033fb3355df65e4b78b26dce63153fdbe2d6022019517d6c9236e134ff8e4346db940f55c1f434bc4510ceb56d60ca3ec23a2b9e"
export const p2wshsig2 = "30440220450671101860159e47553aaef3a4fe798d0c9b90237b35882f45846e822ca753022020a7037a302eaf45efbe83c4c9f26f4e69a230b38be8812725d27bebc7c734c1"
export const p2wshpub1 = "03e5f18951d941bee110d3ae370811a2b8427d9045e850dc02c338115ccf5f392d"
export const p2wshpub2 = "02a0d3826e6c71e5d609cc3787f581c8562a93a969668481d4a579aa5666e6e234"
export const p2wshsigned = "0100000000010163f21552d248a6c469e5ef6b7f1e02276737aa35200bc71e07983d0bdf54e3190000000000ffffffff0114b501000000000017a9148c8c3944e78c8cff399fcdf379e5aa2e00e22ec5870400473044022062aa154a5be4ab5a1b1933113b02033fb3355df65e4b78b26dce63153fdbe2d6022019517d6c9236e134ff8e4346db940f55c1f434bc4510ceb56d60ca3ec23a2b9e014730440220450671101860159e47553aaef3a4fe798d0c9b90237b35882f45846e822ca753022020a7037a302eaf45efbe83c4c9f26f4e69a230b38be8812725d27bebc7c734c10169522103e5f18951d941bee110d3ae370811a2b8427d9045e850dc02c338115ccf5f392d2102a0d3826e6c71e5d609cc3787f581c8562a93a969668481d4a579aa5666e6e2342102e1085e3fb4acb21042dab6425efc84639140bdab42d99f9e5638123df9a83f9553ae00000000";

export const badSig = "30440220564e4623beaed42fb0302a2ee2e78e1e7cbee5edee6285b831450b70e8dbc2fa022018a29525a2deccbf397a4952d64a9b317bbd926d44418ec3f6cff4b2001b474c";

export const validPaths = [
    { path: "m/0/0/0", sequence: [0, 0, 0] },
    { path: "m/0'/0'/0", sequence: [0 + HARDENING_OFFSET, 0 + HARDENING_OFFSET, 0] },
    { path: "m/45'/1/99", sequence: [45 + HARDENING_OFFSET, 1, 99] },
    { path: "m/45'/63'/7", sequence: [45 + HARDENING_OFFSET, 63 + HARDENING_OFFSET, 7] },
    { path: "m/41/2147483647/0", sequence: [41, 2147483647, 0] }
]

export const badBIP32paths = ["n/0/0", 'm/0"/0', "m'/0"]
export const badUnhardened = ["m/45'/0", "m/45/0'"]
export const badHardened = ["m/45'/0", "m/45/0'"]

export const mainnetAddresses = ["3LRW7jeCvQCRdPF8S3yUCfRAx4eqXFmdcr", "1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH", "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4", "bc1pw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7k7grplx"]
export const testnetAddresses = ["mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r", "2NByiBUaEXrhmqAsg7BbLpcQSAQs1EDwt5w", "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7"]

// merge alley lucky axis penalty manage latin gasp virus captain wheel deal chase fragile chapter boss zero dirt stadium tooth physical valve kid plunge
// m/45'/0'/0'
// first 4 keys
export const keysCompressedUncompressed = [
    {
        compressed: "03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee",
        uncompressed: "04b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee6e43c09d025c2ad322382347ec0f69b4e78d8e23c8ff9aa0dd0cb93665ae83d5"
    },
    {
        compressed: "02f7946511e5f5c2697ed1a6c7f1fb7cfa6c03c74ac123b3d2d0c19ad25899baa6",
        uncompressed: "04f7946511e5f5c2697ed1a6c7f1fb7cfa6c03c74ac123b3d2d0c19ad25899baa6bd72af01ea2a58460fe34c2a2d48527f91da977a45a224f50028d937feb68660"
    },
    {
        compressed: "02d87003b52cc497a6ca9a72fd610bcbfb2fe1430ffc4c9d89c2b25b501e04d677",
        uncompressed: "04d87003b52cc497a6ca9a72fd610bcbfb2fe1430ffc4c9d89c2b25b501e04d677ee43c602a902993757d479d89b004f70a944de6db953594be98f397921b20162"
    },
    {
        compressed: "030354bd30fed4d431ee2acb51391128c72af8ee2bec8a303d977a40c85ba82e7b",
        uncompressed: "040354bd30fed4d431ee2acb51391128c72af8ee2bec8a303d977a40c85ba82e7b0456f8717352c5cb95fef87671109a66243e0b6d4917b3c33eb6aa5f33e5c09d"
    },
]

// merge alley lucky axis penalty manage latin gasp virus captain wheel deal chase fragile chapter boss zero dirt stadium tooth physical valve kid plunge
// m/45'/0'/0'
export const validTpub = "tpubDCZv1xNTnmwmXe3BBMyXekiVreY853jFeC8k9AaEAqCDYi1ZTSTLH3uQonwCTRk9jL1SFu1cLNbDY76YtcDR8n2inSMwBEAdZs37EpYS9px";
export const validXpub = "xpub6CCHViYn5VzKFqrKjAzSSqP8XXSU5fEC6ZYSncX5pvSKoRLrPDcF8cEaZkrQvvnuwRUXeKVjoGmAqvbwVkNBFLaRiqcdVhWPyuShUrbcZsv"

export const buffString = [
    {buff: [0, 1, 2, 3], string: '00010203'},
    {buff: [15, 31, 47, 63], string: '0f1f2f3f'},
    {buff: [16, 32, 48, 64], string: '10203040'},
    {buff: [255, 0, 15, 16, 31, 32], string: 'ff000f101f20'},
]

export const bitcoinValues = [
    { btc: BigNumber(1.2345), sats: BigNumber(123450000)},
    { btc: BigNumber(0.00000001), sats: BigNumber(1)},
    { btc: BigNumber(0.00000001), sats: BigNumber(1)},
    { btc: BigNumber(21000000), sats: BigNumber('2100000000000000') }
]

export const opsP2sh = [
    "OP_HASH160 fcc7cd50dab21fd624279844a94dd761aeaa2c47 OP_EQUAL",
    "OP_HASH160 a08d17996171332b216824d9860032ee9c998663 OP_EQUAL",
    "OP_HASH160 6c4fe1723e4b9283515f54044199cf6b18446c82 OP_EQUAL",
    "OP_HASH160 183fef1d6f47d6e9da881270d2fa6d6e4ebcdafa OP_EQUAL"
]
export const opsP2shP2wsh = [
    "OP_HASH160 c913dea428a311413e439e899cfafbd527333454 OP_EQUAL",
    "OP_HASH160 8a08acab06ac20ec48d32bb7018b854b486ab463 OP_EQUAL",
    "OP_HASH160 5d06e3cd5272a4a20863bb6036f395540747a87f OP_EQUAL",
    "OP_HASH160 4549b685445f5c473565ffc274429ee05a01aa40 OP_EQUAL"
]

