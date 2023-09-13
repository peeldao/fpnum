import {
  FixedInt,
  DiscountRate,
  ReservedRate,
  FixedPortion,
} from "./fixedpoint";

describe("FixedPoint.js", () => {
  describe("format", () => {
    it.each`
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
      it("throws if greater than max", () => {
        const fixedInt = new FixedPortion(1n, 18, 1n);

        expect(() => {
          fixedInt.val = 2n;
        }).toThrow("value 2 is greater than max 1");
      });

      it("does not throw if less than max", () => {
        const fixedInt = new FixedPortion(1n, 18, 2n);
        expect(() => {
          fixedInt.val = 1n;
        }).not.toThrow();
        expect(fixedInt.val).toEqual(1n);
      });
    });
  });

  describe("jb", () => {
    it("reserved rate", () => {
      const reservedRateRaw = 2_345n; // 23.45%
      const reservedRate: ReservedRate = new ReservedRate(reservedRateRaw);
      expect(reservedRate.format()).toEqual("0.2345");
      expect(reservedRate.toFloat()).toEqual(0.2345);

      reservedRate.setPercentage(0.5);
      expect(reservedRate.format()).toEqual("0.5");
      expect(reservedRate.toPercentage()).toEqual(50);
      expect(reservedRate.val).toEqual(5_000n);
    });

    it("discount rate", () => {
      const discountRateRaw = 200_000_000n; // 20%
      const discountRate = new DiscountRate(discountRateRaw);
      expect(discountRate.format()).toEqual("0.2");
      expect(discountRate.toFloat()).toEqual(0.2);

      discountRate.setPercentage(0.5123);
      expect(discountRate.format()).toEqual("0.5123");
      expect(discountRate.toPercentage()).toEqual(51.23);
      expect(discountRate.val).toEqual(512_300_000n);
    });
  });
});
