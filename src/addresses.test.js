import { validateAddress } from './addresses';
import { P2SH, P2WSH, } from './multisig';
import { NETWORKS } from './networks';

const P2PKH = "P2PKH";

let ADDRESSES = {};
ADDRESSES[NETWORKS.MAINNET] = {};
ADDRESSES[NETWORKS.MAINNET][P2PKH] = ["1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH"];
ADDRESSES[NETWORKS.MAINNET][P2SH] = ["3LRW7jeCvQCRdPF8S3yUCfRAx4eqXFmdcr"];
ADDRESSES[NETWORKS.MAINNET][P2WSH] = ["bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4", "bc1pw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7k7grplx"];

ADDRESSES[NETWORKS.TESTNET] = {};
ADDRESSES[NETWORKS.TESTNET][P2PKH] = ["mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r"];
ADDRESSES[NETWORKS.TESTNET][P2SH] = ["2NByiBUaEXrhmqAsg7BbLpcQSAQs1EDwt5w"];
ADDRESSES[NETWORKS.TESTNET][P2WSH] = ["tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7"];

const ADDRESS_TYPES = [P2PKH, P2SH, P2WSH];

describe('addresses', ()  => {

  describe('validateAddress', () =>  {

    const invalidAddress = /must start with.+followed by letters or digits/i;

    it("returns an error message on blank addresses", ()  => {
      Object.values(NETWORKS).forEach((network) => {
        expect(validateAddress("", network)).toMatch(/cannot be blank/i);
        expect(validateAddress(" ", network)).toMatch(/cannot be blank/i);
      });
    });
    
    it("returns an error message on an invalid address", () => {
      Object.values(NETWORKS).forEach((network) => {
        expect(validateAddress("f", network)).toMatch(invalidAddress);
        expect(validateAddress("--", network)).toMatch(invalidAddress);
      });
    });

    it("returns an error message when an address doesn't match the network",  () => {
      ADDRESS_TYPES.forEach((addressType) => {
        ADDRESSES[NETWORKS.MAINNET][addressType].forEach((address) => {
          expect(validateAddress(address, NETWORKS.TESTNET)).toMatch(invalidAddress);
        });
        ADDRESSES[NETWORKS.TESTNET][addressType].forEach((address) => {
          expect(validateAddress(address, NETWORKS.MAINNET)).toMatch(invalidAddress);
        });
      });
    });

    it("returns an empty string when the address is valid",  () => {
      Object.values(NETWORKS).forEach((network) => {
        ADDRESS_TYPES.forEach((addressType) => {
          ADDRESSES[network][addressType].forEach((address) => {
            expect(validateAddress(address, network)).toEqual("");
          });
        });
      });
    });

  });

});
