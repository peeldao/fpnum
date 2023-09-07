import SuperInt, { DiscountRate, ReservedRate } from "./superint";

describe("SuperInt", () => {
  describe("format", () => {
    it.each`
      value                         | decimals | expected
      ${1}                          | ${0}     | ${"1"}
      ${1}                          | ${1}     | ${"0.1"}
      ${1_000_000_000_000_000_000n} | ${18}    | ${"1"}
    `("formats", ({ value, decimals, expected }) => {
      const superInt = new SuperInt(value, {
        decimals,
      });
      expect(superInt.format()).toEqual(expected);
    });
  });

  describe("jb", () => {
    it("reserved rate", () => {
      const reservedRateRaw = 2_345n; // 12.345%
      const reservedRate = new ReservedRate(reservedRateRaw);
      expect(reservedRate.format()).toEqual("0.2345");
      expect(reservedRate.formatFloat()).toEqual(0.2345);

      reservedRate.setPercentage(".5");
      expect(reservedRate.format()).toEqual("0.5");
    });

    it("discount rate", () => {
      const discountRateRaw = 200_000_000n; // 20%
      const discountRate = new DiscountRate(discountRateRaw);
      expect(discountRate.format()).toEqual("0.2");
      expect(discountRate.formatFloat()).toEqual(0.2);

      discountRate.setPercentage(".5123");
      expect(discountRate.format()).toEqual("0.5123");
      expect(discountRate.toPercentage()).toEqual(51.23);
      expect(discountRate.value).toEqual(512_300_000n);
    });
  });
});
