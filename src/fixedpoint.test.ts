import { FixedInt, FixedPortion } from "./fixedpoint";
import { describe, expect, test } from "vitest";

describe("fpnum", () => {
  describe("FixedInt", () => {
    test.each`
      value                         | decimals | expected
      ${1}                          | ${0}     | ${"1"}
      ${1}                          | ${1}     | ${"0.1"}
      ${1_000_000_000_000_000_000n} | ${18}    | ${"1"}
    `("formats", ({ value, decimals, expected }) => {
      const fixedInt = new FixedInt(value, decimals);
      expect(fixedInt.format()).toEqual(expected);
    });

    test("should throw an error when decimals are negative", () => {
      expect(() => new FixedInt(-1n, -1)).toThrow("decimals must be greater than or equal to 0");
    });
  
    test("constructor initializes correctly", () => {
      const fixedInt = new FixedInt(1n, 0);
      expect(fixedInt.value).toEqual(1n);
      expect(fixedInt.decimals).toEqual(0);
    });

    test("get and set val correctly", () => {
      const fixedInt = new FixedInt(1n, 0);
      expect(fixedInt.value).toEqual(1n);
      fixedInt.value = 2n;
      expect(fixedInt.value).toEqual(2n);
    });

    test.each`
      value      | decimals | expected
      ${100n}    | ${2}     | ${1.0}
      ${1000n}   | ${3}     | ${1.0}
      ${10n}     | ${1}     | ${1.0}
      ${1n}      | ${0}     | ${1.0}
      ${12345n}  | ${5}     | ${0.12345}
    `("converts to float correctly", ({ value, decimals, expected }) => {
      const fixedInt = new FixedInt(value, decimals);
      expect(fixedInt.toFloat()).toEqual(expected);
    });
  });

  describe("FixedPortion", () => {
    describe("value", () => {
      test("throws if greater than max", () => {
        const fixedInt = new FixedPortion(1n, 18, 1n);

        expect(() => {
          fixedInt.value = 2n;
        }).toThrow("value 2 is greater than max 1");
      });

      test("does not throw if less than max", () => {
        const fixedInt = new FixedPortion(1n, 18, 2n);
        expect(() => {
          fixedInt.value = 1n;
        }).not.toThrow();
        expect(fixedInt.value).toEqual(1n);
      });
      test("does not throw if equal to max", () => {
        const fixedInt = new FixedPortion(1n, 18, 1n);
        expect(() => {
          fixedInt.value = 1n;
        }).not.toThrow();
        expect(fixedInt.value).toEqual(1n);
      });

      test("formats percentage correctly", () => {
        const fixedPortion = new FixedPortion(50n, 2, 100n);
        expect(fixedPortion.formatPercentage()).toEqual(50);
      });

      test("formats percentage correctly", () => {
        const fixedPortion = new FixedPortion(5500n, 4, 10000n);
        expect(fixedPortion.formatPercentage()).toEqual(55);
      });
    });
  });
});
