import { validateAddress } from './addresses';
import { NETWORKS } from './networks';

const mainnetAddresses = ["3LRW7jeCvQCRdPF8S3yUCfRAx4eqXFmdcr", "1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH", "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4", "bc1pw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7k7grplx"]
const testnetAddresses = ["mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r", "2NByiBUaEXrhmqAsg7BbLpcQSAQs1EDwt5w", "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7"]

describe("Test address validation library", () => {
    describe("Test validateAddress", () => {
        describe("Validate empty strings", () => {
            it('should properly report the validation of using an empty address string on mainnet', () => {
                const address = "";
                const result = validateAddress(address, NETWORKS.MAINNET);
                expect(result).toBe('Address cannot be blank.');
            });

            it('should properly report the validation of using an empty address string on testnet', () => {
                const address = "";
                const result = validateAddress(address, NETWORKS.TESTNET);
                expect(result).toBe('Address cannot be blank.');
            });
        })

        describe("Validate addresses on the wrong network", () => {
            it('should properly report the validation of using a mainnet address on testnet', () => {
                mainnetAddresses.forEach(address => {
                    const result = validateAddress(address, NETWORKS.TESTNET);
                    expect(result).toBe("Address must start with one of 'tb1', 'm', 'n', or '2' followed by letters or digits.");
                })
            });

            it('should properly report the validation of using a testnet address on mainnet', () => {
                testnetAddresses.forEach(address => {
                    const result = validateAddress(address, NETWORKS.MAINNET);
                    expect(result).toBe("Address must start with either of 'bc1', '1' or '3' followed by letters or digits.");
                })
            });
        })

        describe("Validate valid adresses", () => {
            it('should not provide a validation message for a valid mainnet addresses', () => {
                mainnetAddresses.forEach(address => {
                    const result = validateAddress(address, NETWORKS.MAINNET);
                    expect(result).toBe('');
                })
            });

            it('should not provide a validation message for a valid testnet addresses', () => {
                testnetAddresses.forEach(address => {
                    const result = validateAddress(address, NETWORKS.TESTNET);
                    expect(result).toBe('');
                })
            });
        })

        describe("Validate invalid adresses", () => {
            it('should properly report the validation of using an invalid addresses on testnet', () => {
                const addresses = testnetAddresses.map(a => a.slice(0, -3) + 'zzz')
                addresses.forEach(address => {
                    const result = validateAddress(address, NETWORKS.TESTNET);
                    expect(result).toBe('Address is invalid.');
                })
            });

            it('should properly report the validation of using an invalid addresses on mainnet', () => {
                const addresses = mainnetAddresses.map(a => a.slice(0, -3) + 'zzz')
                addresses.forEach(address => {
                    const result = validateAddress(address, NETWORKS.MAINNET);
                    expect(result).toBe('Address is invalid.');
                });
            });
        });
    });

    /*
    observations

    * I don't think we can reach this code???

    if (network === NETWORKS.TESTNET && (!result.testnet)) {
      return `This is a ${NETWORKS.MAINNET} address.`;
    }
    if (network === NETWORKS.MAINNET && result.testnet) {
      return `This is a ${NETWORKS.TESTNET} address.`;
    }

    * validateAddress is inconsistent, does not check null or undefined

    * "must begin with" errors can be confusing, here, keys.js

    */


});


