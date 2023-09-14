// JB-specific below
import { FixedInt, FixedPortion } from "./fixedpoint";

export const MAX_DISCOUNT_RATE = 1_000_000_000n;
export const MAX_REDEMPTION_RATE = 10_000n;
export const MAX_RESERVED_RATE = 10_000n;

export class ReservedRate extends FixedPortion<4> {
  constructor(value: bigint) {
    super(value, 4, MAX_RESERVED_RATE);
  }
}

export class RedemptionRate extends FixedPortion<4> {
  constructor(value: bigint) {
    super(value, 4, MAX_REDEMPTION_RATE);
  }
}

export class DiscountRate extends FixedPortion<9> {
  constructor(value: bigint) {
    super(value, 9, MAX_DISCOUNT_RATE);
  }
}

export class Ether extends FixedInt<18> {
  constructor(value: bigint) {
    super(value, 18);
  }
}

export class JBToken extends FixedInt<18> {
  constructor(value: bigint) {
    super(value, 18);
  }
}
