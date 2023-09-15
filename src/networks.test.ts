import {
  TESTNET,
  MAINNET,
  networkLabel,
  networkData,
  getNetworkFromPrefix,
} from "./networks";

import { networks } from "bitcoinjs-lib";

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
      expect(networkData(MAINNET)).toBe(networks.bitcoin);
      expect(networkData(TESTNET)).toBe(networks.testnet);
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
      expect(getNetworkFromPrefix("tpub")).toBe(TESTNET);
      expect(getNetworkFromPrefix("upub")).toBe(TESTNET);
      expect(getNetworkFromPrefix("vpub")).toBe(TESTNET);
      expect(getNetworkFromPrefix("Tpub")).toBe(TESTNET);
      expect(getNetworkFromPrefix("UPub")).toBe(TESTNET);
      expect(getNetworkFromPrefix("VPUB")).toBe(TESTNET);
    });
    it("returns mainnet for mainnet prefixes, case insensitive", () => {
      expect(getNetworkFromPrefix("xpub")).toBe(MAINNET);
      expect(getNetworkFromPrefix("ypub")).toBe(MAINNET);
      expect(getNetworkFromPrefix("zpub")).toBe(MAINNET);
      expect(getNetworkFromPrefix("Xpub")).toBe(MAINNET);
      expect(getNetworkFromPrefix("YPub")).toBe(MAINNET);
      expect(getNetworkFromPrefix("ZPUB")).toBe(MAINNET);
    });
  });
});
