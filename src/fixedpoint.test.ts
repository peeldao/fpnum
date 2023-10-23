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
      expect(fixedInt.val).toEqual(1n);
      expect(fixedInt.decimals).toEqual(0);
    });

    test("get and set val correctly", () => {
      const fixedInt = new FixedInt(1n, 0);
      expect(fixedInt.val).toEqual(1n);
      fixedInt.val = 2n;
      expect(fixedInt.val).toEqual(2n);
    });

    test("converts to float correctly", () => {
      const fixedInt = new FixedInt(100n, 2);
      expect(fixedInt.toFloat()).toEqual(1.0);
    });
  });

  describe("FixedPortion", () => {
    describe("value", () => {
      test("throws if greater than max", () => {
        const fixedInt = new FixedPortion(1n, 18, 1n);

        expect(() => {
          fixedInt.val = 2n;
        }).toThrow("value 2 is greater than max 1");
      });

      test("does not throw if less than max", () => {
        const fixedInt = new FixedPortion(1n, 18, 2n);
        expect(() => {
          fixedInt.val = 1n;
        }).not.toThrow();
        expect(fixedInt.val).toEqual(1n);
      });

      test("does not throw if equal to max", () => {
        const fixedInt = new FixedPortion(1n, 18, 1n);
        expect(() => {
          fixedInt.val = 1n;
        }).not.toThrow();
        expect(fixedInt.val).toEqual(1n);
      });

      test("formats percentage correctly", () => {
        const fixedPortion = new FixedPortion(50n, 2, 100n);
        expect(fixedPortion.formatPercentage()).toEqual(50);
      });
    });
  });
});
