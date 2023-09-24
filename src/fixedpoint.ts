import { formatUnits, parseUnits } from "./utils";

export class FixedInt<T extends number> {
  _value: bigint;
  decimals: T;

  constructor(val: bigint, decimals: T) {
    if (decimals < 0) {
      throw new Error("decimals must be greater than or equal to 0");
    }

    this._value = val;
    this.decimals = decimals;
  }

  get val() {
    return this._value;
  }
  set val(value: bigint) {
    this._value = value;
  }

  static parse<T extends number>(value: string, decimals: T) {
    return new FixedInt<T>(parseUnits(value, decimals), decimals);
  }

  format(decimals?: number): string {
    const formatted = formatUnits(this.val, this.decimals);
    if (typeof decimals === "undefined") return formatted;

    // parse float again to trim trailing 0s
    return parseFloat(parseFloat(formatted).toFixed(decimals)).toString();
  }

  toFloat(): number {
    return parseFloat(this.format());
  }
}

export class FixedPortion<T extends number> extends FixedInt<T> {
  max: bigint;

  constructor(val: bigint, decimals: T, max: bigint) {
    if (typeof max !== "undefined" && val > max) {
      throw new Error(`value ${val} is greater than max ${max}`);
    }
    super(val, decimals);
    this.max = max;
  }

  set val(value: bigint) {
    if (value > this.max) {
      throw new Error(`value ${value} is greater than max ${this.max}`);
    }

    this._value = value;
  }
  get val() {
    return this._value;
  }

  formatPercentage(): number {
    return this.toFloat() * 100;
  }

  setPercentage(percentage: number): void {
    this.val = parseUnits(percentage.toString(), this.decimals);
  }
}
