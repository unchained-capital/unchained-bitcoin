import {
  Networks,
  networkLabel,
  networkData,
  getNetworkFromPrefix,
} from "./networks";

import { networks } from "bitcoinjs-lib";

describe("networks", () => {
  describe("networkLabel", () => {
    it("returns a human-readable network name", () => {
      expect(networkLabel(Networks.MAINNET)).toBe("Mainnet");
      expect(networkLabel(Networks.TESTNET)).toBe("Testnet");
      expect(networkLabel("foobar")).toBe("Testnet");
    });
  });

  describe("networkLabel", () => {
    it("returns a human-readable network name", () => {
      expect(networkData(Networks.MAINNET)).toBe(networks.bitcoin);
      expect(networkData(Networks.TESTNET)).toBe(networks.testnet);
      expect(networkData("foobar")).toBe(networks.testnet);
    });
  });

  describe("getNetworkFromPrefix", () => {
    it("throws error on unknown prefix", () => {
      expect(() => getNetworkFromPrefix("foo")).toThrow(
        /Unrecognized extended public key prefix/i
      );
      expect(() => getNetworkFromPrefix("kpub")).toThrow(
        /Unrecognized extended public key prefix/i
      );
    });
    it("returns testnet for testnet prefixes, case insensitive", () => {
      expect(getNetworkFromPrefix("tpub")).toBe(Networks.TESTNET);
      expect(getNetworkFromPrefix("upub")).toBe(Networks.TESTNET);
      expect(getNetworkFromPrefix("vpub")).toBe(Networks.TESTNET);
      expect(getNetworkFromPrefix("Tpub")).toBe(Networks.TESTNET);
      expect(getNetworkFromPrefix("UPub")).toBe(Networks.TESTNET);
      expect(getNetworkFromPrefix("VPUB")).toBe(Networks.TESTNET);
    });
    it("returns mainnet for mainnet prefixes, case insensitive", () => {
      expect(getNetworkFromPrefix("xpub")).toBe(Networks.MAINNET);
      expect(getNetworkFromPrefix("ypub")).toBe(Networks.MAINNET);
      expect(getNetworkFromPrefix("zpub")).toBe(Networks.MAINNET);
      expect(getNetworkFromPrefix("Xpub")).toBe(Networks.MAINNET);
      expect(getNetworkFromPrefix("YPub")).toBe(Networks.MAINNET);
      expect(getNetworkFromPrefix("ZPUB")).toBe(Networks.MAINNET);
    });
  });
});
