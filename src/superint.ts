// lifted from viem
export function formatUnits(value: bigint, decimals: number) {
  let display = value.toString();

  const negative = display.startsWith("-");
  if (negative) display = display.slice(1);

  display = display.padStart(decimals, "0");

  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals),
  ];
  fraction = fraction.replace(/(0+)$/, "");
  return `${negative ? "-" : ""}${integer || "0"}${
    fraction ? `.${fraction}` : ""
  }`;
}

export function parseUnits(value: string, decimals: number) {
  let [integer, fraction = "0"] = value.split(".");

  const negative = integer.startsWith("-");
  if (negative) integer = integer.slice(1);

  // trim leading zeros.
  fraction = fraction.replace(/(0+)$/, "");

  // round off if the fraction is larger than the number of decimals.
  if (decimals === 0) {
    if (Math.round(Number(`.${fraction}`)) === 1)
      integer = `${BigInt(integer) + 1n}`;
    fraction = "";
  } else if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals),
    ];

    const rounded = Math.round(Number(`${unit}.${right}`));
    if (rounded > 9)
      fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, "0");
    else fraction = `${left}${rounded}`;

    if (fraction.length > decimals) {
      fraction = fraction.slice(1);
      integer = `${BigInt(integer) + 1n}`;
    }

    fraction = fraction.slice(0, decimals);
  } else {
    fraction = fraction.padEnd(decimals, "0");
  }

  return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}

class SuperInt<T extends number> {
  value: bigint;
  decimals: T;
  max: bigint | undefined;

  constructor(value: bigint, opts?: { decimals?: T; max?: bigint }) {
    this.max = opts?.max;
    if (typeof this.max !== "undefined" && value > this.max) {
      throw new Error(`value ${value} is greater than max ${this.max}`);
    }

    this.value = value;
    this.decimals = opts?.decimals ?? 0 as T;
  }

  format(): string {
    return formatUnits(this.value, this.decimals);
  }

  formatFloat(): number {
    return parseFloat(this.format());
  }

  toPercentage(): number {
    return this.formatFloat() * 100;
  }

  setPercentage(percentage: string): void {
    if (typeof this.max === "undefined")
      throw new Error("SuperInt.max is required");

    this.value = parseUnits(percentage, this.decimals);
  }

  setDecimals(decimals: T): void {
    this.decimals = decimals;
  }
}

// JB-specific below

export const MAX_DISCOUNT_RATE = 1_000_000_000n;
export const MAX_REDEMPTION_RATE = 10_000n;
export const MAX_RESERVED_RATE = 10_000n;

export class ReservedRate extends SuperInt<4> {
  constructor(value: bigint) {
    super(value, { decimals: 4, max: MAX_RESERVED_RATE });
  }
}

export class RedemptionRate extends SuperInt<4> {
  constructor(value: bigint) {
    super(value, { decimals: 4, max: MAX_REDEMPTION_RATE });
  }
}

export class DiscountRate extends SuperInt<9> {
  constructor(value: bigint) {
    super(value, { decimals: 9, max: MAX_DISCOUNT_RATE });
  }
}

export default SuperInt;
