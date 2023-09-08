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
  private _value: bigint = 0n;
  private _decimals: T;
  private _max: bigint | undefined;

  constructor(value: bigint, opts?: { decimals?: T; max?: bigint }) {
    // set max first, if it exists.
    this._max = opts?.max;
    this.value = value;
    if (opts?.decimals && opts.decimals < 0) {
      throw new Error("decimals must be greater than or equal to 0");
    }
    this._decimals = opts?.decimals ?? (0 as T);
  }

  get value() {
    return this._value;
  }
  set value(value: bigint) {
    if (typeof this.max !== "undefined" && value > this.max) {
      throw new Error(`value ${value} is greater than max ${this.max}`);
    }

    this._value = value;
  }

  get decimals() {
    return this._decimals;
  }
  get max() {
    return this._max;
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

  setPercentage(percentage: number): void {
    if (typeof this.max === "undefined")
      throw new Error("SuperInt.max is required");

    this.value = parseUnits(percentage.toString(), this.decimals);
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

export class Ether extends SuperInt<18> {
  constructor(value: bigint) {
    super(value, { decimals: 18 });
  }
}

export default SuperInt;
