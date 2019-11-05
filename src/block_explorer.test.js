import { blockExplorerURL, blockExplorerAPIURL, blockExplorerTransactionURL, blockExplorerAddressURL } from './block_explorer'
import { NETWORKS } from './networks';

describe("Test block_explorer library", () => {
    describe("Test blockExplorerURL", () => {
        it('should properly return the base mainnet block explorer url for empty path', () => {
            const url = blockExplorerURL("", NETWORKS.MAINNET);
            expect(url).toBe("https://blockstream.info");
        });

        it('should properly return the mainnet block explorer url for a given path path', () => {
            const path = "/block/00000000000000000011341d69792271766e4683e29b3ea169eacc59bde10a57";
            const url = blockExplorerURL(path, NETWORKS.MAINNET);
            expect(url).toBe(`https://blockstream.info${path}`);
        });

        it('should properly return the base testnet block explorer url for empty path', () => {
            const url = blockExplorerURL("", NETWORKS.TESTNET);
            expect(url).toBe("https://blockstream.info/testnet");
        });

        it('should properly return the testnet block explorer url for a given path path', () => {
            const path = "/tx/4f0ef69f88829bd2f6b7793e32dd8bfcfbc87ddb9a2de3d8ef3f2aabbaff0be3";
            const url = blockExplorerURL(path, NETWORKS.TESTNET);
            expect(url).toBe(`https://blockstream.info/testnet${path}`);
        });
    });

    describe("Test blockExplorerAPIURL", () => {
        it('should properly return the mainnet block explorer api url for path', () => {
            const path = "/tx/1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0";
            const url = blockExplorerAPIURL(path, NETWORKS.MAINNET);
            expect(url).toBe(`https://blockstream.info/api${path}`);
        });

        it('should properly return the testnet block explorer api url for path', () => {
            const path = "/tx/4f0ef69f88829bd2f6b7793e32dd8bfcfbc87ddb9a2de3d8ef3f2aabbaff0be3";
            const url = blockExplorerAPIURL(path, NETWORKS.TESTNET);
            expect(url).toBe(`https://blockstream.info/testnet/api${path}`);
        });
    });

    describe("Test blockExplorerTransactionURL", () => {
        it('should properly return the mainnet block explorer transaction url for a given path', () => {
            const path = "1814a10fb22e9551a17a94a1e68971e19b4f59eaf1689e0af85b97929b3b9ae0";
            const url = blockExplorerTransactionURL(path, NETWORKS.MAINNET);
            expect(url).toBe(`https://blockstream.info/tx/${path}`);
        });

        it('should properly return the testnet block explorer transaction url for a given path', () => {
            const path = "4f0ef69f88829bd2f6b7793e32dd8bfcfbc87ddb9a2de3d8ef3f2aabbaff0be3";
            const url = blockExplorerTransactionURL(path, NETWORKS.TESTNET);
            expect(url).toBe(`https://blockstream.info/testnet/tx/${path}`);
        });

    });

    describe("Test blockExplorerAddressURL", () => {
        it('should properly return the mainnet block explorer address url for a given path', () => {
            const path = "39YqNoLULDpbjmeCTdGJ42DQhrQLzRcMdX";
            const url = blockExplorerAddressURL(path, NETWORKS.MAINNET);
            expect(url).toBe(`https://blockstream.info/address/${path}`);
        });

        it('should properly return the testnet block explorer address url for a given path', () => {
            const path = "2N16oE62ZjAPup985dFBQYAuy5zpDraH7Hk";
            const url = blockExplorerAddressURL(path, NETWORKS.TESTNET);
            expect(url).toBe(`https://blockstream.info/testnet/address/${path}`);
        });
    });

});

