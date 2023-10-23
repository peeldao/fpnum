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
    });
  });
});
