/**
 * This module provides useful test fixtures.
 *
 * All test fixtures are derived from the same BIP39 seed phrase
 * (which is also included as a fixture).
 *
 * Test transactions are multisig which allows them to have one of the
 * keys be the open source (private) key above and another be private
 * (private key).  This doubly-private key is held by Unchained
 * Capital.
 *
 * Multisig addresses built from both keys have the advantage that
 * they are open enough to test most aspects of transaction authoring
 * & signing while remaining impossible to spend from without having
 * the private (private) key.  This enables robust public tests of
 * multisig addresses in testnet and mainnet.
 *
 * All the fixtures in this module are accessible through the
 * `TEST_FIXTURES` constant.
 *
 * @module fixtures
 */


import BigNumber from 'bignumber.js';
import {
  generateMultisigFromPublicKeys,
  multisigRedeemScript,
  multisigWitnessScript,
} from './multisig';
import {sortInputs} from "./inputs";
import {P2SH} from "./p2sh";
import {P2SH_P2WSH} from "./p2sh_p2wsh";
import {P2WSH} from "./p2wsh";
import { TESTNET, MAINNET } from './networks';

const RECEIVING_ADDRESSES = {};
RECEIVING_ADDRESSES[MAINNET] = "3DRVz9YUhoXSMgBngvv2JkNReBHvkeJwLs";
RECEIVING_ADDRESSES[TESTNET] = "2NE1LH35XT4YrdnEebk5oKMmRpGiYcUvpNR";

const BIP39_PHRASE = ['merge', 'alley', 'lucky', 'axis', 'penalty', 'manage', 'latin', 'gasp', 'virus', 'captain', 'wheel', 'deal', 'chase', 'fragile', 'chapter', 'boss', 'zero', 'dirt', 'stadium', 'tooth', 'physical', 'valve', 'kid', 'plunge'];

const NODES = {
  "m/45'/0'/0'": {
    xpub: "xpub6CCHViYn5VzKFqrKjAzSSqP8XXSU5fEC6ZYSncX5pvSKoRLrPDcF8cEaZkrQvvnuwRUXeKVjoGmAqvbwVkNBFLaRiqcdVhWPyuShUrbcZsv",
    tpub: "tpubDCZv1xNTnmwmXe3BBMyXekiVreY853jFeC8k9AaEAqCDYi1ZTSTLH3uQonwCTRk9jL1SFu1cLNbDY76YtcDR8n2inSMwBEAdZs37EpYS9px",
  },
  "m/45'/0'/0'/0/0": {
    pub: "03102f0df5e34ffa1178a5310952221b8e26b3e761a9e328832c750a2de252f21a",
    xpub: "xpub6FjSpitFpSJB9BpSVwp3eJzhpaQFLbLefD1f3qaGRmok2Z2FDeSNsy5CL9TLwM3HpcV2kAyTNf2W1uUXs1jbeXGWjdWnsaqnUQ9PyWAYVhQ",
    tpub: "tpubDG75LxhwXiFdQz1Hx8o8rEL59hVuKyqiCqbxQPdQmgZdmqgxHsHU2Qk2aBY8TqzXcX1wMkVKukrYi5y9FsaqXxiooEG6Z7W24MjojRNcVtA"
  },
  "m/45'/0'/4'": {
    xpub: "xpub6CCHViYn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab",
    tpub: "tpubDCZv1xNTnmwmiZW4boJEY6YmKH2qKscsV9tuimmwaN8pT8NCxwtFLEAJUTSw6yxf4N44AQVFpt26vwVMBhxhTLAAN1w2Cgidnc7n3JVnBDH",
  },
  "m/45'/0'/4'/0/0": {
    pub: "021a0b6eb37bd9d2767a364601e41635a11c1dbbbb601efab8406281e210336ace",
    xpub: "xpub6GYTTMaaN8bSEhicdKq7ji9H7B2SL4un33obThv9aekop4J7L7B3snYMnJUuwXJiUmsbSVSyZydbqLC97JMWnj3R4MHz6JNunMJhjEBKovS",
    tpub: "tpubDGv5ybQG5QYtWVuU5WpCwdUeSJ86KTQqagPtpFyHvZWhZLxpQL292EDC2LZhU2FxGgQW44xr75TeXWgkWACkgAVi7x3Hmq39NJu7VBdS42V"
  },
  "m/45'/0'/4'/6/2": {
    pub: "021bb3e8d7e2ded6301478457de6b651f5f7b4b20dad28ddfee70c746719443ff8",
    xpub: "xpub6HBwGjhNzvy16npAQ2y53kpWcaaohBZCjh3HvPwngWwEVjT5hUtVeg8YPr11DpZgcb4DWsAH273Z7Jxo1fSMXkQemLrBWRxjERqHz12L2K1",
    tpub: "tpubDHZZnyX4iCvTNb11rDxAFg9swhgTga4GHKdbGwzw2Rh8F27nmhjao7oNdt5nkKWvQVb88Sg9ZCsboVTQQXHbRBrwpwbVBxcxpPRhk4NnLYN"
  },
  "m/45'/0'/4'/99'": {
    xpub: "xpub6DYRpdguLMw7gRvTn4Qo3VBU7k6ucyauGyR4chHftSQVoX5M5ArP4qgfyGWFzrURBmXyebFDg7TLh82cbk7KEsL2Es74hS24bxoEduYyDDq",
    tpub: "tpubDDv4LsWb3dtZxE7KEFPtFQWqSsCZcN5xpc1MyFLpEMAPYok49PhUDHMWDJb3XMReyg4tGAm6DDHPPJXDzbxZ8JnKJTrNNxgJBvPePy4Px6s",
  },
  "m/45'/0'/4'/99'/0/0": {
    pub: "030d661b96bd1dbb22f6eacabb94905bca5694eb3af5d699c1b2d8de5427496f42",
    xpub: "xpub6JfuzV9Yo9m1L9nBcMVVjgg3kmkCr7rkjAS5cTy2Dny4bjFS5m4Rvdrj71hAHR8qmhUN7mRbxgoBZjP93EdNQiiLM2XnDPPTBFYUEfRaiz3",
    tpub: "tpubDK3YWiyEWRiTbwy34YUawc1R5tqrqWMpGo2Ny22AZhixM1v99yuX55XZM3mwov65Zc1GjLwUVndEFuskS6UcJAAdQdH5tv3gmD8szggjEA4"
  },
  "m/45'/0'/4'/99'/2147483647/3/1": {
    pub: "0211aa5c03e290dc0110103c3d3f817500e76061d35ea89072286cb6f7962eda81",
    xpub: "xpub6LCRwXBN9moqsJKhToW6K5qfBfTguMXuZw67q1BUuaWRyYD56P1zhqbyXsHqoo4WPsjUfeiJPu4JXnhtUz6cHbYgX6AFfDhUnPfCvbZD3JZ",
    tpub: "tpubDLa4Tm13s3mJ96WYuzVBX1B2WnZLtk2y7ZgRBZEdFVGKipsnAbs5rHGomuNdLJ1kBnGPHEEAvztMDyCVsqwrB2zyaguZLkMiNMFcgX4e2rG"
  },

  "m/45'/1'/0'/0/0": {
    pub: "037226e92491b2cf9691152fc2e9a0a7cff8f9ab7ad1b24b6f6506d7c8bf18911b",
  },

  "m/48'/0'/0'/1'/0/0": {
    pub: "02c63c7ae511c9902e885da3e2fbb4a8f227eefc7f53eda3cad4d8f9389331b5be",
  },

  "m/48'/1'/0'/1'/0/0": {
    pub: "03ff8a79f5016243a3959e2216e51cf90034cf510b379a34e6fdf565b19852baa2",
  },

  "m/48'/0'/0'/2'/0/0": {
    pub: "032817ba5e2b76f6e2fab1d985224516f2b77a9c181e210def81ec2be8e17007c9"
  },

  "m/48'/1'/0'/2'/0/0": {
    pub: "03ecf349ecf63fcd0ece9de7eb1abfb8f8b243fecc443bd62ef47744f0f6b7eef6",
  }
};

const MULTISIGS_BASE = [

  {
    network: TESTNET,
    type: P2SH,
    bip32Path: "m/45'/1'/100'/0/0",
    publicKey: "02a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d4",
    publicKeys: ["02a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d4", "03938dd09bf3dd29ddf41f264858accfa40b330c98e0ed27caf77734fac00139ba",],
    redeemScriptOps: "OP_2 02a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d4 03938dd09bf3dd29ddf41f264858accfa40b330c98e0ed27caf77734fac00139ba OP_2 OP_CHECKMULTISIG",
    redeemScriptHex: "522102a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d42103938dd09bf3dd29ddf41f264858accfa40b330c98e0ed27caf77734fac00139ba52ae",
    scriptOps: "OP_HASH160 8479072d5a550ee0900b5af7e70af575527a879d OP_EQUAL",
    scriptHex: "a9148479072d5a550ee0900b5af7e70af575527a879d87",
    address: "2N5KgAnFFpmk5TRMiCicRZDQS8FFNCKqKf1",
    utxos:[
      {
        txid: "65e7ef764030dabfb46e3ae1c357b0666d0dda722c9809fb73245d6d68665284",
        index: 1,
        amountSats: '100000',	// 0.001 BTC
        transactionHex: "0200000000010149c912d0e5e46f6ef933038c7fb7e1d665db9ae56b67fa57fe4c3476a95cf954000000001716001400e2f78f987a5a4493cf062994dbde49d040a922feffffff02631418000000000017a914c7ab6d103180a48181847d35732e93e0ce9ab07387a08601000000000017a9148479072d5a550ee0900b5af7e70af575527a879d870247304402202f538752e408b4817e7751ef243eee67d2242ca2061e8e6c9f22873247f10a8d02205b4622314efd733f12fc6557bc2f323ff2cbc1604ad97a351807e1be80875bc8012102e92335f6ecb1862f0eea0b99297f21bdb9beb9a1e8f41113788f5add306ca9fcee9b1800",
      },
      {
        txid: "ae9e1aa8312e102e806fa11d8e65965a624f88459e6bb5bcf48156a0c53e022a",
        index: 1,
        amountSats: '100000',	// 0.001 BTC
        transactionHex: "0200000000010101745e1daa28c1705dbf73edd183e5ef91ad0918d97ad3e2ec2c69b548086f4d00000000171600142b0b522ba87db1646898118860449fcb2c69dae3feffffff02329642000000000017a9140f894f7e3b70b8741f830e066b6ef508a9f7479d87a08601000000000017a9148479072d5a550ee0900b5af7e70af575527a879d870247304402202dc887e5d623bd974968285e9c8165cfa9facd943caf0f8472e7acef632fb94302205c60434061e6a4e45360d3b3c901a9c1dd148b38dd6c9623cd8fa2677587e632012102366538692ffb9622e75a05dc2004d85efa0ebc27b99961e694d88f9ede2b57cae49b1800",
      },
      {
        txid: "f243c1fbb85dd49da91477b89c76636202721be9c7df5ee6eee0c6a10861ae44",
        index: 0,
        amountSats: '100000',	// 0.001 BTC
        transactionHex: "02000000000101e5d6a0ffc5f8387a90c463bf614ae53609b72988c44afc6a577f22666bc971a7000000001716001428386489d15b1cddfd245b506b8ff2d909b18d36feffffff02a08601000000000017a9148479072d5a550ee0900b5af7e70af575527a879d8786ce18050000000017a914d2fb0a8958e55d4c6c3ff58f970fdbba3006ec078702473044022007a7186e6afb93de749b3a905d1c7437f470f97095ea410538b6ac33d15a947802205a66118c7dc2e14d7325a122eb0021f54e1dbd5dfb8fd56b253fa3782716af3d012103f5951ccccf00964d54eefa78280ae083e0f0f0cc6382fd27b3fbfdfeda8dd2c7b29b1800",
      },
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES[TESTNET],
          amountSats: '291590',
        }
      ],
      hex: "0100000003845266686d5d2473fb09982c72da0d6d66b057c3e13a6eb4bfda304076efe7650100000000ffffffff2a023ec5a05681f4bcb56b9e45884f625a96658e1da16f802e102e31a81a9eae0100000000ffffffff44ae6108a1c6e0eee65edfc7e91b72026263769cb87714a99dd45db8fbc143f20000000000ffffffff01067304000000000017a914e3ba1151b75effbf7adc4673c83c8feec3ddc3678700000000",
      signature: ["304402205397795a8b6e0b8d1c5a0b2b5b8fb8e49afb6dd150d1a186604fa9e71e23aaa20220514b7b7ed9ec43d983d7be5ea4ece5a55b29efa2193d90bf1fd087356fcbd54b","304402200ffcb2331655f1f24bf2f7e16984d81310e55d47c405b45e327abde524c8d31e022036460b70a665d1756ea91e131a1ed1022544dfdd2232f64117230d22f9deeb08","30440220167a35bccf4bb13073e8c66a1b094906d5c7879d6cdac730e435aef196d2f3eb02205a39e05763e511dc15deff56fa29eead850623076fda8a5e173dd0942197aaf4"],
    },
  },

  {
    network: TESTNET,
    type: P2SH_P2WSH,
    bip32Path: "m/48'/1'/100'/1'/0/0",
    publicKey: "026aaa7c4697ff439bfd6c7a70abf66253b4e329654b41ee2ad21d68b854e4a422",
    publicKeys: ["025566585b3a8066b7d0bba4d2b24c3c59a5f527d62c100bbb7073a7cb2565418c", "026aaa7c4697ff439bfd6c7a70abf66253b4e329654b41ee2ad21d68b854e4a422"],
    witnessScriptOps: "OP_2 025566585b3a8066b7d0bba4d2b24c3c59a5f527d62c100bbb7073a7cb2565418c 026aaa7c4697ff439bfd6c7a70abf66253b4e329654b41ee2ad21d68b854e4a422 OP_2 OP_CHECKMULTISIG",
    witnessScriptHex: "5221025566585b3a8066b7d0bba4d2b24c3c59a5f527d62c100bbb7073a7cb2565418c21026aaa7c4697ff439bfd6c7a70abf66253b4e329654b41ee2ad21d68b854e4a42252ae",
    redeemScriptOps: "OP_0 deeb888c0a0a1871a3da4c2e75ffab5eb17e9d27fccd41bc3d683a2674f93aa1",
    redeemScriptHex: "0020deeb888c0a0a1871a3da4c2e75ffab5eb17e9d27fccd41bc3d683a2674f93aa1",
    scriptOps: "OP_HASH160 dac0270cbf87a65c0cf4fd2295eb44c756b288ec OP_EQUAL",
    scriptHex: "a914dac0270cbf87a65c0cf4fd2295eb44c756b288ec87",
    address: "2NDBsV6VBe4d2Ukp2XB644dg2xZ2SuWGkyG",
    utxos:[
      {
        txid: "429da41d05db69d7c006e91b15031e6d47faab15adba3c97059eeea093c36a23",
        index: 0,
        amountSats: '100000',	// 0.001 BTC
        transactionHex: "02000000000101845266686d5d2473fb09982c72da0d6d66b057c3e13a6eb4bfda304076efe7650000000017160014a89baf1e6b16698bf34927d4a1f71270a57972d6feffffff02a08601000000000017a914dac0270cbf87a65c0cf4fd2295eb44c756b288ec871d8d16000000000017a91471e39bcec3aead7b1d45ad04aea8ad231be756768702473044022067dbe8b2623bd3948bfca811f934c1b512d7add1a09ff70a5b0e083edccbee780220325924a596ce2b567797b53eaa7eec3f6a989427829479ea5619ed72aaeffea40121023251e686167dbea8774b3510a78caa67550d566bd078c1285aa69ec0c561f767ee9b1800",
      },
      {
        txid: "d8edcd3ef4293a2554a147f048442d735fb54b901c1e39ffdb59448c1abae812",
        index: 0,
        amountSats: '100000',	// 0.001 BTC
        transactionHex: "02000000000101236ac393a0ee9e05973cbaad15abfa476d1e03151be906c0d769db051da49d4201000000171600149df8fa8c17c034dd0e4f96c1eb0110113037ff71feffffff02a08601000000000017a914dac0270cbf87a65c0cf4fd2295eb44c756b288ec87d70515000000000017a9144b1d195a2cf70e3233aaf8e229d9d2a2da1b7845870247304402205c2e3d2cb7c8aa461aabb5c74210f795ec018db703910c9556f8b222012bb3ad02200f8c63fd859b575a6a762df0019f18ad917cf9de1e128e33bc540c4e5356b9ea012103280eb7fdde76317c63664c46bfe7602f6ff64a0dc22695c7e7093f34b40c5536ee9b1800",
      },
      {
        txid: "ff43f4cc8473341ce9effb91d715a4deb4e8a8cb669dd1d119a3a30552a829d1",
        index: 0,
        amountSats: '100000',	// 0.001 BTC
        transactionHex: "02000000000101eef67cc41c10722be710952296866ea13ed1608acdf15e453e8d874e6a15c6d50000000017160014a989c1c6a3dbbf44d508d5f36df2d08c97e9fca4feffffff02a08601000000000017a914dac0270cbf87a65c0cf4fd2295eb44c756b288ec87a5b90d000000000017a914d0324b98895786d859ae3ee3df0c384249f1a4ab870247304402200621a08b242b807a0c39b6e0bf302e503b9a2596acdd218b176cb62afba31824022027bb2cc91b5ae57500a2e3c440d4d45cc42617f4db665a1b25974122b3789ddd01210209bb437e2e4658c6eb92c20a1ef459a2d1da50757dfba0c49a19dd3dbd621d87e09b1800",
      },
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES[TESTNET],
          amountSats: '291590',
        }
      ],
      hex: "0100000003236ac393a0ee9e05973cbaad15abfa476d1e03151be906c0d769db051da49d420000000000ffffffff12e8ba1a8c4459dbff391e1c904bb55f732d4448f047a154253a29f43ecdedd80000000000ffffffffd129a85205a3a319d1d19d66cba8e8b4dea415d791fbefe91c347384ccf443ff0000000000ffffffff01067304000000000017a914e3ba1151b75effbf7adc4673c83c8feec3ddc3678700000000",
      signature: ["30440220571b44fea349bb6d41698269f47a3b481186b5823457f50e5836f3674d78aee802206730c2d4366c83dc57afa1f2d31a70b6a5ef5345555025fb0245f03393275ae201","30450221008152abafaef773821816e9e84254a1f6f1794024d22320a0689297961d627716022014ee4a8b254dbaa9765aa86a43aa2a2fd52abde009a9ad9b315dc9f557f869c301","30440220163c8fe5e09a7c5a2750f6cd98325cb57e8523ace74431fc748144365f32cfd50220372eefd2dd119c84b27a0b215609e9e1323ae1045c35eee3bc849eb2dd6b4c6701"],
    },
  },

  {
    network: TESTNET,
    type: P2WSH,
    bip32Path: "m/48'/1'/100'/2'/0/0",
    publicKey: "03bc34c50cf768f802290269c2ddabd086c73514c880cecb6db3f67676a4b72469",
    publicKeys: ["035a763e0480f858ef626b649fa0efe9eb647abbf77db54f3af904d2de50c4342d", "03bc34c50cf768f802290269c2ddabd086c73514c880cecb6db3f67676a4b72469"],
    witnessScriptOps: "OP_2 035a763e0480f858ef626b649fa0efe9eb647abbf77db54f3af904d2de50c4342d 03bc34c50cf768f802290269c2ddabd086c73514c880cecb6db3f67676a4b72469 OP_2 OP_CHECKMULTISIG",
    witnessScriptHex: "5221035a763e0480f858ef626b649fa0efe9eb647abbf77db54f3af904d2de50c4342d2103bc34c50cf768f802290269c2ddabd086c73514c880cecb6db3f67676a4b7246952ae",
    scriptOps: "OP_0 ba2514cdd3a3c202eb4394e550a0fc116cb834f34662a019be8a52c62351d068",
    scriptHex: "0020ba2514cdd3a3c202eb4394e550a0fc116cb834f34662a019be8a52c62351d068",
    address: "tb1qhgj3fnwn50pq966rjnj4pg8uz9ktsd8nge32qxd73ffvvg636p5q54g7m0",
    utxos:[
      {
        txid: "84df8dcc9b86e8c7bb39ce0ba9f577ec750f0b64df97a5c9559cf39243a1f501",
        index: 0,
        amountSats: '100000',	// 0.001 BTC
        transactionHex: "020000000001018342873aa48ba6b2e5a796f34b7431bb56f9c569a6bd8f7e539cb3147a86b3f80000000000feffffff02a086010000000000220020ba2514cdd3a3c202eb4394e550a0fc116cb834f34662a019be8a52c62351d068a9873f0000000000160014208e4178e48f2d270a06475ad8caeb2e01f55ae80247304402205369dedb14963e0bfa22748a546e03e47fcf994c85944ae0d6b507d15ebba57d022073cdd6c8af057aabac652ec438de7fc7e201d6a3b8619e54a2db5c1b509865e9012103ba504ae1099d8f38163c90540fa10e09cac4fa2df95b8b91bc2aba01571c27d9ee9b1800",
      },
      {
        txid: "f010998e033355636c2ba34af753cd6d5f198889a379bc30625bb38f646f3d72",
        index: 0,
        amountSats: '100000',	// 0.001 BTC
        transactionHex: "0200000000010144ae6108a1c6e0eee65edfc7e91b72026263769cb87714a99dd45db8fbc143f201000000171600142ff3a6303add9138957b880c73a331cf718a418ffeffffff02a086010000000000220020ba2514cdd3a3c202eb4394e550a0fc116cb834f34662a019be8a52c62351d068364717050000000016001403f4d726aec3c06aa8a31b230e9997288faea72a02473044022032368bd2b2441840850b62f86bfa4434854b5e83da1e5cac43cd613a88f91839022042b2f9f7ea20c97d889a89b0f7cb649b8bb3acc20c4207b5665e235b340766a101210216bb0c99eb498379d5c7b7ad0f3afb9ff3eec9be622fffe821c5456003f22c02ee9b1800",
      },
      {
        txid: "f8b3867a14b39c537e8fbda669c5f956bb31744bf396a7e5b2a68ba43a874283",
        index: 1,
        amountSats: '100000',	// 0.001 BTC
        transactionHex: "020000000001012a023ec5a05681f4bcb56b9e45884f625a96658e1da16f802e102e31a81a9eae0000000017160014c4733d80022a7a3dde9a7e3112b39e390500713cfeffffff02e20e410000000000160014060213b00b3d902d2bd7e90c4b7e9e34830d2f9da086010000000000220020ba2514cdd3a3c202eb4394e550a0fc116cb834f34662a019be8a52c62351d0680247304402201504b1dbf14cf216c7de1fa78dd649a319b2274361034aaa9bc82473632650d1022013da0cb0bb740a95010821e451e7fc699bb2489e71c20093d8d3cd3f4e8c2efc012102db49c46b1a64061d15d0faa234e8da59defe0f4164009e73be9be540265cf0caee9b1800",
      },
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES[TESTNET],
          amountSats: '291590',
        }
      ],
      hex: "010000000301f5a14392f39c55c9a597df640b0f75ec77f5a90bce39bbc7e8869bcc8ddf840000000000ffffffff723d6f648fb35b6230bc79a38988195f6dcd53f74aa32b6c635533038e9910f00000000000ffffffff8342873aa48ba6b2e5a796f34b7431bb56f9c569a6bd8f7e539cb3147a86b3f80100000000ffffffff01067304000000000017a914e3ba1151b75effbf7adc4673c83c8feec3ddc3678700000000",
      signature: ["3044022006af7cbad3b34ca8b7ba0b72e2424b918ce57798603e5473a05d83abaad697b4022014696327ff1c17cdf1af27460e5b196ebdb4fa0f4650289696642ecea5399c0301","3045022100b8cf09c3abecaa59a677f3633375a3c608031b827497d6476beaae15b4641732022036156d23d4adcc32424c8ea08ba8fcf171f82b947f1b3f09f95b0731ea4e898301","304402204971879ff546217adafafa0f2fdf0a351c304af8bd32bb1241b2eb0043d45e8102202cebfab10ba08156a8165fec341af12635a204cbeb07cb0deb16d2726d744bc501"],
    },
  },

  {
    network: MAINNET,
    type: P2SH,
    bip32Path: "m/45'/0'/100'/0/0",
    publicKey: "02583c4776b51691f4e036c8e0eb160f3464a2de9ae4c6818b7945c78fc6bace79",
    publicKeys: ["02583c4776b51691f4e036c8e0eb160f3464a2de9ae4c6818b7945c78fc6bace79", "02b024e76d6c2d8c22d9550467e97ced251ead5592529f9c813c1d818f7e89a35a"],
    redeemScriptOps: "OP_2 02583c4776b51691f4e036c8e0eb160f3464a2de9ae4c6818b7945c78fc6bace79 02b024e76d6c2d8c22d9550467e97ced251ead5592529f9c813c1d818f7e89a35a OP_2 OP_CHECKMULTISIG",
    redeemScriptHex: "522102583c4776b51691f4e036c8e0eb160f3464a2de9ae4c6818b7945c78fc6bace792102b024e76d6c2d8c22d9550467e97ced251ead5592529f9c813c1d818f7e89a35a52ae",
    scriptOps: "OP_HASH160 f18bcbf45f7805fe663339d838d5c8a086d79e53 OP_EQUAL",
    scriptHex: "a914f18bcbf45f7805fe663339d838d5c8a086d79e5387",
    address: "3PiCF26aq57Wo5DJEbFNTVwD1bLCUEpAYZ",
    utxos:[
      {
        txid: "456813be8389d17e945c0b91b5112938a7268bb7c6721147bce6521eeabde7b0",
        index: 0,
        amountSats: '10000',	// 0.0001 BTC
        transactionHex: "0200000000010216ac0943cd43bb8168c591016a0a5439b3124427bf5df0582f68f2ae52fc86560000000017160014f827ea2db54a62d5027b411ff9d2d6e9234796a8feffffffd9bde17e907b90631edc22f83a4f849d9527e4a3d3b3096fdfc8131eeb8c4c8201000000171600141aabdcba4979e2772ad5da60e757f6d992c09d41feffffff02102700000000000017a914f18bcbf45f7805fe663339d838d5c8a086d79e5387ac0700000000000017a914df0aa2a92361822c637c0e44fb1cae2f1a22f0df870247304402204f91360c63c8ce6c98ebec06a6710e5f016cac8d8733c3855401f821f437c5650220611c87d76c2e72accb892cff110f0837d6d60942fdaea2edf86098af355016570121033c5f5b6c028649dedbe089033d6736788199041567b510d88448d0d1bcd5675d024730440220296ce4c551c6945176d8f057c9d05d7a21aa7ccb4c1d8d692c8937b00e3a9be4022024a514a72e4c52ee9c7bcf5c60dd7fb8ee4e83059d0869d85a6659e4d6737535012103c86c2e648f8e34be880b5f12d33bfd712c552ebf68fe01a1daebf2a24a44cbfa99490900",
      },
      {
        txid: "5bbf64e036e46bf93dadc770f0415f6566453b9ae2d932df00fd5b5e49bdbbd5",
        index: 1,
        amountSats: '10000',	// 0.0001 BTC
        transactionHex: "0200000000010133f0ca4e94d7ad6673a3777ed56fbcf0d2ebc5f6578578746c989ba2ec20cfaa0300000017160014c530831acb421c9ac89d1a83113acf4b46b3a2affeffffff02f00602000000000017a914939b4923002a1f44854a671be64cf55846d4f5f887102700000000000017a914f18bcbf45f7805fe663339d838d5c8a086d79e5387024730440220044dac81ef05b655fb6e72a21423f2db9fd4fc938243ba8293f7f0f24c7e56e202201fa946e11c0be1eeae81fe2418a8d30bf39048fc110e6aaf253149ef47dc8d28012103fb20014d5c613fc2d5a588cf6ea9292afa843a8e5f14dfe9d4e18e5cb158ecee99490900",
      },
      {
        txid: "74c11de1a3f1a5daa06441d78d7fb45609b3415721466c6256bffd881451cda5",
        index: 0,
        amountSats: '10000',	// 0.0001 BTC
        transactionHex: "02000000000101d748779bd254dce3523c691a9ce1bf8836d524ba97d26cc24127e3367a2027f600000000171600141aabdcba4979e2772ad5da60e757f6d992c09d41feffffff02102700000000000017a914f18bcbf45f7805fe663339d838d5c8a086d79e5387025b00000000000017a9145d0e078b76ff5e990bf628bf28f593d217caaeb9870247304402206b99e2475b2424db1e47fdb9689036fa44d5c9dea3e5419f26759eed86920c91022011c38e5e69280e62353088d5bf28ecf15a3ff348edcad8c31e441f9f57da172a012103c86c2e648f8e34be880b5f12d33bfd712c552ebf68fe01a1daebf2a24a44cbfa99490900",
      },
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES[MAINNET],
          amountSats: '21590',
        }
      ],
      hex: "0100000003b0e7bdea1e52e6bc471172c6b78b26a7382911b5910b5c947ed18983be1368450000000000ffffffffd5bbbd495e5bfd00df32d9e29a3b4566655f41f070c7ad3df96be436e064bf5b0100000000ffffffffa5cd511488fdbf56626c46215741b30956b47f8dd74164a0daa5f1a3e11dc1740000000000ffffffff01565400000000000017a91480b2477411a78b2a939d7da08bfa1939a871a4b98700000000",
      signature: ["30440220093e19b884411f941ccebe9a175e3e36a91c60b469ad1b8b9983017943b6e2550220583fde25a48ee2627c1c2496cf46784f2a12803378c443969b3779fea62e23ae","30440220697b840a3b42ba50b5911b5830c3b75817dfe8d42f6c8d12e7532d4e19539a3202204d3655a3d4db9c57cb2522de739630270822ea23d044df7343eb489b5fe2dfec","304502210080ad474a50c50047efc34eeae1c3acc0bb214424878b723de95abd33edd7a76a022049b4fdc82d026ba1dae2641c54b9d3468298800a5e4dc4988b6b1dbb3ac54bc5"],
    },
  },


  {
    network: MAINNET,
    type: P2SH_P2WSH,
    bip32Path: "m/48'/0'/100'/1'/0/0",
    publicKey: "0342997f6fcd7fa4a3c7e290c8867148992e6194742120985c664d9e214461af7c",
    publicKeys: ["0328b57c2f65c98ed7cde4bca54cc3a13afa4d47117fd9dae06663a4169e05ef86", "0342997f6fcd7fa4a3c7e290c8867148992e6194742120985c664d9e214461af7c"],
    witnessScriptOps: "OP_2 0328b57c2f65c98ed7cde4bca54cc3a13afa4d47117fd9dae06663a4169e05ef86 0342997f6fcd7fa4a3c7e290c8867148992e6194742120985c664d9e214461af7c OP_2 OP_CHECKMULTISIG",
    witnessScriptHex: "52210328b57c2f65c98ed7cde4bca54cc3a13afa4d47117fd9dae06663a4169e05ef86210342997f6fcd7fa4a3c7e290c8867148992e6194742120985c664d9e214461af7c52ae",
    redeemScriptOps: "OP_0 049d6e945074525b03e0487759368ff663f10bb88976017bdd9d3cce849085e5",
    redeemScriptHex: "0020049d6e945074525b03e0487759368ff663f10bb88976017bdd9d3cce849085e5",
    scriptOps: "OP_HASH160 1abcf8cea321ca874de4beb4f975077fe864a54a OP_EQUAL",
    scriptHex: "a9141abcf8cea321ca874de4beb4f975077fe864a54a87",
    address: "348PsXezZAHcW7RjmCoMJ8PHWx1QBTXJvm",
    utxos:[
      {
        txid: "2062282a8c6644740d4a5c85a74ad21c6a0fda8d753e8a4bdfba09a26d20eb40",
        index: 1,
        amountSats: '10000',	// 0.0001 BTC
        transactionHex: "02000000000104e7f99e90ef69f7bf577cc34c695469d1ef2e021320f4f5d312a439fa5119214c010000001716001458ff1cdc218f9baaf9a5ac278206e8f8cc2d55a2feffffffb0e7bdea1e52e6bc471172c6b78b26a7382911b5910b5c947ed18983be13684501000000171600144245d8387278181e8f5d61e35427fa055f891ccefeffffffb68f87f28f11710b7005426340c4c4d9795c331f027549bd383b6f179d709a280000000000feffffff79d037447d0706083212ec168a5b3e24f97bd7a9e0099b105b042781853780810000000017160014ec62a1ca200abdc755c8b34faae78202b6dd3fc3feffffff02920500000000000017a91449e9133aaffa9192d802655f2db8fa1db9eec00887102700000000000017a9141abcf8cea321ca874de4beb4f975077fe864a54a8702473044022069c0985164d17c746fb818179f969740e39d6569ec5a144a83c72de2473b6b8002204f62217bbb2b34efedda454c85dfa960788d4c7f538c7fdf22c5074f5a2c78bb012103e74f757ceb0288ac7c051b7db87fb059a19eac05a480c65c913068a6f80d23b80247304402200f827b64e5feb6071f5d4278e4fa3643e164316ab897f53df0482658e753110202201143f4348812122322876aa29a7285cc8ea51a3e32fb0392fd2e6422d63793f501210350de53693c9da7f849cab9479304ee2b2af317f28ee00ed1e112cd95bc200bd2024730440220025e0eff09b09817e8d595c01bfd2fdba6082e2c4f8f286545f9a2a2e9f148ba02205725704e14c2969a1afcf0084dd29bdbc5136b75438158ecf76992e3c24b561f012102e24e7df260cb56ffbcdb52bea6f8c8bc267d849f5799cf919e32574568ed85d602473044022011bbd9ec6338f174fa0a386acb1fb4dfe348343b2eed5017b11e96151ad214ca02207e7bb5443f34d33147f28fafb4cd661dccc7c6993ad7c58ed47197c85b48c849012102587990c5f71d9e4c894069589845c5f2649b83006160b9d1b8f31bab54133a9399490900",
      },
      {
        txid: "4c211951fa39a412d3f5f42013022eefd16954694cc37c57bff769ef909ef9e7",
        index: 0,
        amountSats: '10000',	// 0.0001 BTC
        transactionHex: "02000000000101a5cd511488fdbf56626c46215741b30956b47f8dd74164a0daa5f1a3e11dc1740100000017160014eeeff0e10da2973449331a9e48f246b18488e965feffffff02102700000000000017a9141abcf8cea321ca874de4beb4f975077fe864a54a87bd2a00000000000017a91445a77947cf42db7fec41cec25c28af0b73becf2e8702473044022044858a87117fd8af2fa92db123935019d76ee9157fb9a48a9cd97ee085b128f90220572b799eae6f3f8cf6aa287450ff46b21588840dabeeb63e57c6f3f320f49eea0121025abd982f0c9ebbb7238900326af437c393eb2c5e875f5bd63152ddd756e5049a99490900",
      },
      {
        txid: "c5d0e548e2332450057ce5bd2a6fb720b2c8bd6f595ed11fdba71488b1bf7b31",
        index: 1,
        amountSats: '10000',	// 0.0001 BTC
        transactionHex: "02000000000101d5bbbd495e5bfd00df32d9e29a3b4566655f41f070c7ad3df96be436e064bf5b00000000171600140e021c1c3313ef991acd0c5d9f63ca12ce110005feffffff02abd601000000000017a9145d27db58f13d4851260174d9dc9eacdf62074a4e87102700000000000017a9141abcf8cea321ca874de4beb4f975077fe864a54a8702473044022077b4f0f2d1480443f8b29ed68a29b606b83a3ebbda4349bf813c33330b7f4aa902202061823fd25330b6c0adb68afce4546ada193eb63982f28a7562bc605ea6b0e5012102930a7b8a6fd51a8ce36039bacf160239cfb7dbc72dc1a051aaac333bc7f8e7924e490900",
      },
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES[MAINNET],
          amountSats: '21590',
        }
      ],
      hex: "010000000340eb206da209badf4b8a3e758dda0f6a1cd24aa7855c4a0d7444668c2a2862200100000000ffffffffe7f99e90ef69f7bf577cc34c695469d1ef2e021320f4f5d312a439fa5119214c0000000000ffffffff317bbfb18814a7db1fd15e596fbdc8b220b76f2abde57c05502433e248e5d0c50100000000ffffffff01565400000000000017a91480b2477411a78b2a939d7da08bfa1939a871a4b98700000000",
      signature: ["304402207da18a5f73e691fcd2451252919cada67c47f267fbc48cc729d4809c5ec9bcbe0220428d5ead8e9654586946dbd2e10e2a0f3677e405708f82c139be7adcccc36d1c01","3045022100f33793cdd3848f51527c9fdd2c0f44408ccea4a3890f17f1409a054f59b7e8b2022001f26bd9180e598cae0a32c94e4f49b1a145062ef4612cd69054b3e3b130403401","304402207931f66347d8573346eac0ec817c47dffc3af6ea2d7f354d60f1b73caa85ea9c02201062ee14b856737e6040c591e7a80fc684ec67d26ccb7e86eddf68572072416801"],
    },
  },

  {
    network: MAINNET,
    type: P2WSH,
    bip32Path: "m/48'/0'/100'/2'/0/0",
    publicKey: "0369e74fc954355b6f7acf9bbec5b861c186852b759a85f92558e420a0202047f4",
    publicKeys: ["02e21b7318cfbd482bdbb66441420b9018e5b440bf9b0cdedd427626d81f32605b", "0369e74fc954355b6f7acf9bbec5b861c186852b759a85f92558e420a0202047f4"],
    witnessScriptOps: "OP_2 02e21b7318cfbd482bdbb66441420b9018e5b440bf9b0cdedd427626d81f32605b 0369e74fc954355b6f7acf9bbec5b861c186852b759a85f92558e420a0202047f4 OP_2 OP_CHECKMULTISIG",
    witnessScriptHex: "522102e21b7318cfbd482bdbb66441420b9018e5b440bf9b0cdedd427626d81f32605b210369e74fc954355b6f7acf9bbec5b861c186852b759a85f92558e420a0202047f452ae",
    scriptOps: "OP_0 497b026c3d3547a30e6d8006e385e0366af5eca2b5b455d8783875941e5c7fa9",
    scriptHex: "0020497b026c3d3547a30e6d8006e385e0366af5eca2b5b455d8783875941e5c7fa9",
    address: "bc1qf9asympax4r6xrndsqrw8p0qxe40tm9zkk69tkrc8p6eg8ju075sjeekkt",
    utxos:[
      {
        txid: "4ab356fef8b8205a3b96b4924e8e94f18c4b8ecdefa0bb1ee28ce19f091c3f58",
        index: 0,
        amountSats: '10000',	// 0.0001 BTC
        transactionHex: "020000000001011aa35769284e2822b65a98ac46472bb5c455831927da993dbe9ad1959c296eaf0100000000feffffff021027000000000000220020497b026c3d3547a30e6d8006e385e0366af5eca2b5b455d8783875941e5c7fa94c76010000000000160014553e9be0af92386ae6b4065262dc97fdee9979170247304402206407b5c1fa2fd49b92e6f1802a0eed9e75f55c3db1ea179f077072d0c6e9031602205823ba8d01a6b96db9334affcb9b1e7dfb434cfdc1389287016d6b68c5c2cf0c0121029de99c2fec6fad0a90fb5a7792775477b8d82fa4f213903a2f67d3e2c1d802eb99490900",
      },
      {
        txid: "a21b384dc72b9ef2559339cecd5ad2652171589b1e479497817b617734859d90",
        index: 1,
        amountSats: '10000',	// 0.0001 BTC
        transactionHex: "02000000000101583f1c099fe18ce21ebba0efcd8e4b8cf1948e4e92b4963b5a20b8f8fe56b34a0100000000feffffff02c04601000000000016001416d8412d77ae6d6280c60091a7197a3f98546c911027000000000000220020497b026c3d3547a30e6d8006e385e0366af5eca2b5b455d8783875941e5c7fa90247304402204fada6ffa61f578f647ace8c8d02b678ff95ed0feca83b3a4750a97c5aa3ddca02203dc438b53e7aef6bd4f9152e37d6cbce4e64306932cc27f7e2072d764990cb530121020b500126d56d6f17b28e90f254b4b38c260ecd8e941b65c557b8af6c767027dd99490900",
      },
      {
        txid: "af6e299c95d19abe3d99da27198355c4b52b4746ac985ab622284e286957a31a",
        index: 0,
        amountSats: '10000',	// 0.0001 BTC
        transactionHex: "02000000000101317bbfb18814a7db1fd15e596fbdc8b220b76f2abde57c05502433e248e5d0c500000000171600147e88fb2bc740d5efffef8b6f53d5eb68b83317b6feffffff021027000000000000220020497b026c3d3547a30e6d8006e385e0366af5eca2b5b455d8783875941e5c7fa9d8a50100000000001600144ddfedfd823ee5dc953f4792a855b262a85ed77c0247304402202fc8347a8801fbbd13db5bd2694cdabb2c3428b6cfa6edda02ff16bc6cacb6b8022054604d07510ede500197deefe9d39abe277fb97a837ae40ea815b6aa38f0329701210247348c03f596b52730429ea89df4b3d75b219fd3c30cbcb66dae04779e0de6d236490900",
      },
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES[MAINNET],
          amountSats: '21590',
        }
      ],
      hex: "0100000003583f1c099fe18ce21ebba0efcd8e4b8cf1948e4e92b4963b5a20b8f8fe56b34a0000000000ffffffff909d853477617b819794471e9b58712165d25acdce399355f29e2bc74d381ba20100000000ffffffff1aa35769284e2822b65a98ac46472bb5c455831927da993dbe9ad1959c296eaf0000000000ffffffff01565400000000000017a91480b2477411a78b2a939d7da08bfa1939a871a4b98700000000",
      signature: ["304402207e9ed7746415d01ebf54e84367f5767fdcd36834b24a09518209689c2ca77b6502207123faaa61953f1c3f7b723bc8cff43bb3a007ec46079b46c4f260d2c1c998db01","3045022100d8d052f50b1a996e1738a94a28d762bcd6ec26d3658ed9a66aeb39b41688154d02206cc815d5b7ef6f14647856fc5481f12a32abc077c51c60a4b19a545e072a5cf301","3045022100f26c0ab42123f342c878894d496d62d154f10fffa0949d4356f0bb134d80ae3302207c5aa6892da2e3392b8488c999b76df31633e31209c34b3eb847fccb70a0b6e101"],
    },
  },

];

const MULTISIGS = MULTISIGS_BASE.map((test) => {
  const multisig = generateMultisigFromPublicKeys(test.network, test.type, 2, ...test.publicKeys);
  return {
    ...test,
    ...{
      description: `${test.network} ${test.type} 2-of-2 multisig address`,
      utxos: test.utxos.map((utxo) => ({
        ...utxo,
        ...{
          amountSats: BigNumber(utxo.amountSats),
          multisig,
        }})),
      transaction: {
        ...test.transaction,
        ...{outputs: test.transaction.outputs.map((output) => ({
          ...output,
          ...{amountSats: BigNumber(output.amountSats)},
        }))}},
      multisig,
      multisigScript: (test.type === P2SH ? multisigRedeemScript(multisig) : multisigWitnessScript(multisig)),
      multisigScriptOps: (test.type === P2SH ? test.redeemScriptOps : test.witnessScriptOps),
      multisigScriptHex: (test.type === P2SH ? test.redeemScriptHex : test.witnessScriptHex),
    },
  };
});

function selectFirstUTXOFromEach(tests) {
  let unsortedUTXOs = [];
  let unsortedBIP32Paths = [];
  let unsortedPublicKeys = [];
  tests.forEach((test) => {
    unsortedUTXOs.push(test.utxos[0]);
    unsortedBIP32Paths.push(test.bip32Path);
    unsortedPublicKeys.push(test.publicKey);
  });
  const sortedUTXOs = sortInputs(unsortedUTXOs);
  const sortedBIP32Paths = [];
  const sortedPublicKeys = [];
  sortedUTXOs.forEach((utxo) => {
    const unsortedIndex = unsortedUTXOs.findIndex((otherUTXO) => (otherUTXO.txid === utxo.txid && otherUTXO.index === utxo.index));
    sortedBIP32Paths.push(unsortedBIP32Paths[unsortedIndex]);
    sortedPublicKeys.push(unsortedPublicKeys[unsortedIndex]);
  });
  return {
    inputs: sortedUTXOs,
    bip32Paths: sortedBIP32Paths,
    publicKeys: sortedPublicKeys,
  };
}

function singleMultisigTransaction(test) {
  return {
    ...{
      name: `Sign ${test.description}`,
      description: `spends multiple UTXOs from a single ${test.description}`,
      network: test.network,
      inputs: sortInputs(test.utxos),
      bip32Paths: test.utxos.map((utxo) => test.bip32Path),
      publicKeys: test.utxos.map((utxo) => test.publicKey),
      segwit: (test.type !== P2SH),
    },
    ...test.transaction,
  };
}

const TRANSACTIONS = MULTISIGS.map((test) => singleMultisigTransaction(test)).concat([
  {
    ...selectFirstUTXOFromEach(MULTISIGS.filter((test) => test.network === TESTNET)),
    ...{
      name: `Sign across ${TESTNET} 2-of-2 multisig address types`,
      description: `spends a UTXO from each ${TESTNET} 2-of-2 address type`,
      network: TESTNET,
      segwit: true,
      outputs: [
        {
          address: RECEIVING_ADDRESSES[TESTNET],
          amountSats: BigNumber('291590'),
        }
      ],
    },
    hex: "0100000003236ac393a0ee9e05973cbaad15abfa476d1e03151be906c0d769db051da49d420000000000ffffffff845266686d5d2473fb09982c72da0d6d66b057c3e13a6eb4bfda304076efe7650100000000ffffffff01f5a14392f39c55c9a597df640b0f75ec77f5a90bce39bbc7e8869bcc8ddf840000000000ffffffff01067304000000000017a914e3ba1151b75effbf7adc4673c83c8feec3ddc3678700000000",
    signature: ["30440220583a0f9f0dec594d16cee927dc10d10e99b075c2cbdaad75daf1adf1a9f34900022058311ae12f952a4707f8c4966a50ed96b21e049ef35afc91e77c9a1b991f93b801","304502210084f12880a76b33e4bbf7bc896e76ccd726f59e24876261d1f9c999a2203d10c70220327e7daf28cf6dca83ff24c2b1dbded308e71f11941c14fa2b3bb1623d240b7201","3045022100aeeaa8c07be892ff1dcbbcf76ab6f202fa3f6b3f41e0476294f8df2d0afb457f02206d7eecc49e1ff32f1f25b7649a127e4334c0f9272aa92051364f5094b3d796ad01"],
  },
  {
    ...selectFirstUTXOFromEach(MULTISIGS.filter((test) => test.network === MAINNET)),
    ...{
      name: `Sign across ${TESTNET} 2-of-2 multisig address types`,
      description: `spends a UTXO from each ${MAINNET} 2-of-2 address type`,
      network: MAINNET,
      segwit: true,
      outputs: [
        {
          address: RECEIVING_ADDRESSES[MAINNET],
          amountSats: BigNumber('21590'),
        }
      ],
      hex: "010000000340eb206da209badf4b8a3e758dda0f6a1cd24aa7855c4a0d7444668c2a2862200100000000ffffffffb0e7bdea1e52e6bc471172c6b78b26a7382911b5910b5c947ed18983be1368450000000000ffffffff583f1c099fe18ce21ebba0efcd8e4b8cf1948e4e92b4963b5a20b8f8fe56b34a0000000000ffffffff01565400000000000017a91480b2477411a78b2a939d7da08bfa1939a871a4b98700000000",
      signature: ["304502210088188fe088e22872e06ddad13c2586f6abb5d8040b2bb919bf00f6a855e3788902202517f77ae39ac37c0522864dfb996dc86272f328ee4d7b614cad17899f5bbc3a01","3044022078e151ce21dab691a35f8aa2a080478cd15369653bc8ecd250019e62f2d1557102204349f260f9233558b8a71c9e2dc9888b6666451de97ea12b890ee7526f9f404001","3044022005e44b81d321ce6cc27e7d64cf482844e0dd30220a776c62199d2fac33c6a41502201beacca9c4d4f00d31c797b9441222e67ada8d4e0706d1cd29805af363de615c01"],
    }
  },
]);

export const EXTENDED_PUBLIC_KEY_CONVERSIONS = {
  xpub: "xpub6CCHViYn5VzKFqrKjAzSSqP8XXSU5fEC6ZYSncX5pvSKoRLrPDcF8cEaZkrQvvnuwRUXeKVjoGmAqvbwVkNBFLaRiqcdVhWPyuShUrbcZsv",
  ypub: "ypub6X2YoPDhEBXo793SZXn4evUdhVav2HDh1g4fa1QyCvpCrXA5dsmokftiaxozvqSqM4bLPo6JFw7ijDDWDSnC3aG2bBK45cKtFdWLsUKgtyo",
  zpub: "zpub6qrp73tcNs5GxSEZPtZgs1a8sTjMxuDBvnatMQJrawC5ucyJtXwNNjYrcAmavk6kkhi99GgribUGcVq4w9CCqowdTX1UfX9NXMZzG2XWQdj",
  Ypub: "Ypub6hvdvcx8o96AXiCpWCF3UzpSRHdBEduHKwiLVGgWahecUhizQHA5qnkePfmUVGfjaXfKGP6R99WDrNqGWfw9C4NhReRTV1nt9MnDTNALmuh",
  Zpub: "Zpub72kuEHd3wpdeP1PwLZ2fh5uwbFmdBFtnF4EZGfaPxi2VXoYDewKeTrQnQsj4VBKezAn81rgybormjfSqENM9zJ4JHz7t4vcNR5qrqv8qja7",
  tpub: "tpubDCZv1xNTnmwmXe3BBMyXekiVreY853jFeC8k9AaEAqCDYi1ZTSTLH3uQonwCTRk9jL1SFu1cLNbDY76YtcDR8n2inSMwBEAdZs37EpYS9px",
  upub: "upub5DhVaiY2dTMshxGyE6dZpa6d1d18FoFhMDynSRqRguJge7uAdF7ZGRGAW8yewCq9iW87Pti4RHhXC4mFLf88rdXd7pXMjy3wAjFmK6jyHiX",
  vpub: "vpub5YXktPCwn8uMZFU64TRC2fC8Bb9aCRFCGLW1DpjK4ugZhDiPsuH7tUvJXLwEw7V589Ev9NJcsx455MNp4MY9esDDzADnKssRSTKQhgCrtoZ",
  Upub: "Upub5QbahxGUCQvF8XSMAm6YeeSRjR3PU9wHfVdTMh6y4g96GJU5PeVqMY86Jqw8Ve43wyC6GUiBJW62KEP1dtH617eHxHdm9NWw4TXdu1aWzdx",
  Vpub: "Vpub5jRr1cwPM6TiypdU17tArjXvuPBqQmvnac9g95zrSgWyKQHJeJfPybnEL3tiVYhyMcJu1xJjmASaCWzaMah6oMKtpdLBjHLRLBbHHcy3jDH",

}



/**
 * A set of test fixtures all built from the same [BIP39 seed phrase]{@link https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki}.
 *
 * Initializing your keystore with this seed phrase will allow you to
 * replicate many of the unit tests in this library on your
 * hardware/software.  This is useful for functional testing.
 *
 * Includes the following properties:
 *
 * - `bip39Phrase` -- the BIP39 seed phrase used for all other fixtures
 * - `nodes` -- an object mapping BIP32 paths to the corresponding [HD node]{@link module:fixtures.HDNode} derived from the BIP39 seed phrase above.
 * - `multisigs` -- an array of [multisig addresses]{@link module:fixtures.MultisigAddress} derived from the HD nodes above.
 * - `transactions` -- an array of [transactions]{@link module:fixtures.MultisigTransaction} from the multisig address above.
 *
 * @example
 * import {TEST_FIXTURES} from "unchained-bitcoin";
 * console.log(TEST_FIXTURES.bip39Phrase);
 * // merge alley lucky axis penalty manage latin gasp virus captain wheel deal chase fragile chapter boss zero dirt stadium tooth physical valve kid plunge
 *
 */
export const TEST_FIXTURES = {
  bip39Phrase: BIP39_PHRASE,
  nodes: NODES,
  multisigs: MULTISIGS,
  transactions: TRANSACTIONS,
  extendedPublicKeyConversions: EXTENDED_PUBLIC_KEY_CONVERSIONS,
};

/**
 * An HD node fixture derived from the BIP39 seed phrase fixture.
 *
 * Not all HD node fixtures have all properties below.
 *
 * @typedef module:fixtures.HDNode
 * @type {Object}
 * @property {string} pub - the (compressed) public key in hex
 * @property {string} xpub - the extended public key formatted for mainnet
 * @property {string} tpub - the extended public key formatted for testnet
 */

/**
 * A multisig address fixture.  At least one of the public
 * keys in the redeem/witness script for each address is derived from
 * the BIP39 seed phrase fixture.
 *
 * @typedef module:fixtures.MultisigAddress
 * @type {Object}
 * @property {module:networks.NETWORKS} network - bitcoin network
 * @property {module:multisig.MULTISIG_ADDRESS_TYPES} type - multisig address type
 * @property {string} description - describes the multisig address
 * @property {string} bip32Path - BIP32 derivation path to the public key used in this address from the BIP39 seed phrase fixture
 * @property {string} publicKey - (compressed) public key (in hex) corresponding to BIP32 path
 * @property {string[]} publicKeys - (compressed) public keys (in hex) (order matters)
 * @property {string} multisigScriptHex - multisig script in hex (redeem/witneess script as appropriate)
 * @property {string} multisigScriptOps - multisig script in opcodes (redeem/witneess script as appropriate)
 * @property {string} redeemScriptHex - redeem script in hex (missing for P2WSH)
 * @property {string} redeemScriptOps - redeem script in opcodes (missing for P2WSH)
 * @property {string} witnessScriptHex - witness script in hex (missing for P2SH)
 * @property {string} witnessScriptOps - witness script in opcodes (missing for P2SH)
 * @property {string} address - bitcoin address
 * @property {string} scriptHex - script in hex
 * @property {string} scriptOps - script in opcodes
 * @property {module:multisig.Multisig} multisig - `Multisig` object for address
 * @property {module:transactions.UTXO[]} utxos - UTXOs at this address
 *
 */

/**
 * A transaction fixture with inputs from one or more multisig
 * addresses.
 *
 * Each address contains at least one public key derived from the
 * BIP39 seed phrase fixture.
 *
 * The signatures in these transaction fixtures can therefore be
 * created by any keystore which loads this seed phrase.
 *
 * The inputs to these transactions should survive as the other
 * signature(s) required to spend them cannot be produced publicly
 * (their private keys are held by Unchained Capital).
 *
 * @typedef module:fixtures.MultisigTransaction
 * @type {Object}
 * @property {string} description - describes the transaction
 * @property {module:networks.NETWORKS} network - bitcoin network
 * @property {boolean} segwit - does the transaction have segwit inputs?
 * @property {string[]} bip32Paths - BIP32 paths to the public key derived from the BIP39 seed phrase fixture, one per input
 * @property {string[]} publicKeys - (compressed) public keys  (in hex) corresponding to each BIP32 path, one per input
 * @property {module:transactions.UTXO[]} inputs - transaction inputs
 * @property {module:transactions.TransactionOutput[]} outputs - transaction outputs
 * @property {string} hex - unsigned transaction in hex
 * @property {string[]} signature - one signature for the transaction (consisting of one signature per input)
 *
 */
