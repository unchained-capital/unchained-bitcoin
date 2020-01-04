import {
  TESTNET,
  MAINNET,
  networkLabel,
  networkData,
} from "./networks";

const bitcoin = require('bitcoinjs-lib');

describe("networks", () => {

  describe("networkLabel", () => {

    it("returns a human-readable network name", () => {
      expect(networkLabel(MAINNET)).toBe("Mainnet");
      expect(networkLabel(TESTNET)).toBe("Testnet");
      expect(networkLabel("foobar")).toBe("Testnet");
    });

  });

  describe("networkLabel", () => {

    it("returns a human-readable network name", () => {
      expect(networkData(MAINNET)).toBe(bitcoin.networks.bitcoin);
      expect(networkData(TESTNET)).toBe(bitcoin.networks.testnet);
      expect(networkData("foobar")).toBe(bitcoin.networks.testnet);
    });

  });
  
});
