import {validateFeeRate, validateFeeBTC, validateOutputAmountBTC} from './transactions'
import BigNumber from 'bignumber.js';

describe("Test fees and rates", () => {
    describe("Test validateFeeRate", () => {
        it("should properly report the validation of a negative fee rate", () => {
            const feerate = -1;
            const msg = validateFeeRate(feerate);
            expect(msg).toBe("Fee rate must be positive.");
        });

        it("should properly report the validation of an excessive fee rate", () => {
            const feerate = BigNumber(1001);
            const msg = validateFeeRate(feerate);
            expect(msg).toBe("Fee rate is too high.");
        });

        it("should not provide a validation message for a valid fee rate", () => {
            const feerate = BigNumber(5);
            const msg = validateFeeRate(feerate);
            expect(msg).toBe("");
        });
    });

    describe("Test validateFeeBTC", () => {
        it("should properly report the validation of a negative fee", () => {
            const fee = "-1";
            const msg = validateFeeBTC(fee, BigNumber(0));
            expect(msg).toBe("Fee cannot be negative.");
        });

        it("should properly report the validation of an excessive fee", () => {
            let fee = "0.001";
            let msg = validateFeeBTC(fee, BigNumber(0.0009));
            expect(msg).toBe("Fee is too high.");

            fee = "0.03";
            msg = validateFeeBTC(fee, BigNumber("100000000"));
            expect(msg).toBe("Fee is too high.");
        });

        it("should not provide a validation message for a valid fee", () => {
            const fee = "0.00001";
            const msg = validateFeeBTC(fee, BigNumber(1000000));
            expect(msg).toBe("");
        });
    });

    describe('Test validateOutputAmountBTC', () => {
        describe("Test validation with inputs provided", () => {
            it("should properly report the validation of a negative output amount", () => {
                const out = "-1";
                const msg = validateOutputAmountBTC(out, BigNumber(1000000));
                expect(msg).toBe("Output amount must be positive.");
            });

            it("should properly report the validation of amounts below the dust limit", () => {
                const out = "0.00000500";
                const msg = validateOutputAmountBTC(out, BigNumber(1000000));
                expect(msg).toBe("Output amount is too small.");
            });

            it("should properly report the validation of a fraction of a satoshi", () => {
                const out = "1.000000001";
                const msg = validateOutputAmountBTC(out, BigNumber("1000000000"));
                expect(msg).toBe("Invalid output amount.");
            });

            it("should properly report the validation of spending more than the input amount provided", () => {
                const out = "1.00000000";
                const msg = validateOutputAmountBTC(out, BigNumber("10000000"));
                expect(msg).toBe("Output amount is too large.");
            });

            it("should not provide a validation message for a valid output amount", () => {
                const out = "0.00090000";
                const msg = validateOutputAmountBTC(out, BigNumber(1000000));
                expect(msg).toBe("");
            });
        })

        describe("Test validation with no inputs provided", () => {
            it("should ignore output larger than input if input not provided", () => {
                const out = "1.00000000";
                const msg = validateOutputAmountBTC(out);
                expect(msg).toBe("");
            })

            it("should properly report the validation of a negative output amount", () => {
                const out = "-1";
                const msg = validateOutputAmountBTC(out);
                expect(msg).toBe("Output amount must be positive.");
            });

            it("should properly report the validation of amounts below the dust limit", () => {
                const out = "0.00000500";
                const msg = validateOutputAmountBTC(out);
                expect(msg).toBe("Output amount is too small.");
            });

            it("should properly report the validation of a fraction of a satoshi", () => {
                const out = "1.000000001";
                const msg = validateOutputAmountBTC(out);
                expect(msg).toBe("Invalid output amount.");
            });

            it("should not provide a validation message for a valid output amount", () => {
                const out = "0.00090000";
                const msg = validateOutputAmountBTC(out);
                expect(msg).toBe("");
            });
        });

    });
});
