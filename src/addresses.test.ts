import { validateAddress } from "./addresses";
import * as multisig from "./multisig";
import { Networks } from "./networks";

const P2PKH = "P2PKH";

let ADDRESSES = {};
ADDRESSES[Networks.MAINNET] = {};
ADDRESSES[Networks.MAINNET][P2PKH] = ["1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH"];
ADDRESSES[Networks.MAINNET][(multisig as any).P2SH] = [
  "3LRW7jeCvQCRdPF8S3yUCfRAx4eqXFmdcr",
];
ADDRESSES[Networks.MAINNET][(multisig as any).P2WSH] = [
  "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
  "bc1pw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7k7grplx",
];

ADDRESSES[Networks.TESTNET] = {};
ADDRESSES[Networks.TESTNET][P2PKH] = ["mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r"];
ADDRESSES[Networks.TESTNET][(multisig as any).P2SH] = [
  "2NByiBUaEXrhmqAsg7BbLpcQSAQs1EDwt5w",
];
ADDRESSES[Networks.TESTNET][(multisig as any).P2WSH] = [
  "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7",
];

const ADDRESS_TYPES = [P2PKH, (multisig as any).P2SH, (multisig as any).P2WSH];

describe("addresses", () => {
  describe("validateAddress", () => {
    const invalidAddress = /must start with.+followed by letters or digits/i;

    it("returns an error message on blank addresses", () => {
      Object.values(Networks).forEach((network) => {
        expect(validateAddress("", network)).toMatch(/cannot be blank/i);
        expect(validateAddress(" ", network)).toMatch(/cannot be blank/i);
      });
    });

    it("returns an error message on an invalid address", () => {
      Object.values(Networks).forEach((network) => {
        expect(validateAddress("f", network)).toMatch(invalidAddress);
        expect(validateAddress("--", network)).toMatch(invalidAddress);
      });

      expect(validateAddress("1asdf", Networks.MAINNET)).toMatch(
        /address is invalid/i
      );
      expect(validateAddress("masdf", Networks.TESTNET)).toMatch(
        /address is invalid/i
      );
    });

    it("returns an error message when an address doesn't match the network", () => {
      ADDRESS_TYPES.forEach((addressType) => {
        ADDRESSES[Networks.MAINNET][addressType].forEach((address) => {
          expect(validateAddress(address, Networks.TESTNET)).toMatch(
            invalidAddress
          );
        });
        ADDRESSES[Networks.TESTNET][addressType].forEach((address) => {
          expect(validateAddress(address, Networks.MAINNET)).toMatch(
            invalidAddress
          );
        });
      });
    });

    it("returns an empty string when the address is valid", () => {
      [Networks.MAINNET, Networks.TESTNET].forEach((network) => {
        ADDRESS_TYPES.forEach((addressType) => {
          ADDRESSES[network][addressType].forEach((address) => {
            expect(validateAddress(address, network)).toEqual("");
          });
        });
      });
    });
  });
});
