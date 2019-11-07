import { validateAddress } from './addresses';
import { NETWORKS } from './networks';
import { mainnetAddresses, testnetAddresses } from './test_constants'

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


