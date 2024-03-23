/**
 * Fixed point number implementation.
 *
 * This is useful for representing token amounts and other big numbers.
 */
export class FixedInt<T extends number> {
  _value: bigint;
  /**
   * The number of decimals to use.
   */
  decimals: T;

  /**
   * Create a new fixed point number.
   *
   * @param value The value of the fixed point number.
   * @param decimals The number of decimals to use.
   */
  constructor(value: bigint, decimals: T) {
    if (decimals < 0) {
      throw new Error("decimals must be greater than or equal to 0");
    }

    this._value = value;
    this.decimals = decimals;
  }

  /**
   * Get the value of the fixed point number.
   */
  get value() {
    return this._value;
  }

  /**
   * Set the value of the fixed point number.
   *
   * Does not change the decimals.
   */
  set value(value: bigint) {
    this._value = value;
  }

  /**
   * Parse a string into a fixed point number.
   *
   * @param value The string to parse.
   * @param decimals The number of decimals to use.
   * @returns A new fixed point number.
   */
  static parse<T extends number>(value: string, decimals: T) {
    return new FixedInt<T>(parseUnits(value, decimals), decimals);
  }

  /**
   * Format the fixed point number as a string.
   *
   * If `decimals` is provided, the number will be rounded to that number of
   * decimals. Otherwise, the number will be formatted as-is.
   *
   * If the underlying value is greater than Number.MAX_VALUE
   * (1.7976931348623157e+308), this will return 'Infinity'.
   *
   * @param decimals The number of decimals to round to.
   * @returns The formatted string.
   */
  format(decimals?: number): string {
    const formatted = formatUnits(this.value, this.decimals);
    if (typeof decimals === "undefined") return formatted;

    // parse float again to trim trailing 0s
    return parseFloat(parseFloat(formatted).toFixed(decimals)).toString();
  }

  /**
   * Format the fixed point number to a float.
   *
   * If the underlying value is greater than Number.MAX_VALUE
   * (1.7976931348623157e+308), this will return 'Infinity'.
   *
   * @returns The fixed point number as a float.
   */
  toFloat(): number {
    return parseFloat(this.format());
  }
}

/**
 * Fixed point number implementation with a maximum value.
 *
 * This is useful for representing percentages.
 */
export class FixedPortion<T extends number> extends FixedInt<T> {
  /**
   * The maximum value of the fixed point number.
   */
  max: bigint;

  /**
   * Create a new fixed point number portion.
   *
   * @param value The value of the fixed point number.
   * @param decimals The number of decimals to use.
   * @param max The maximum value of the fixed point number.
   */
  constructor(value: bigint, decimals: T, max: bigint) {
    if (typeof max !== "undefined" && value > max) {
      throw new Error(`value ${value} is greater than max ${max}`);
    }
    super(value, decimals);
    this.max = max;
  }

  /**
   * Set the value of the fixed point number.
   *
   * Does not change the decimals.
   *
   * If the value is greater than the maximum value, this will throw an error.
   */
  set value(value: bigint) {
    if (value > this.max) {
      throw new Error(`value ${value} is greater than max ${this.max}`);
    }

    this._value = value;
  }

  get value() {
    return this._value;
  }

  /**
   * Represent the fixed point number as a percentage value.
   *
   * If the underlying value is greater than Number.MAX_VALUE
   * (1.7976931348623157e+308), this will return 'Infinity'.
   *
   * @returns The fixed point number as a percentage.
   */
  formatPercentage(): number {
    // subtract 2 decimals to get percentage
    const formatted = formatUnits(this.value, this.decimals - 2);
    return parseFloat(formatted);
  }

  /**
   * TODO: this is a bit confusing as it implies it sets the percentage, which I would assume is based on the max value
   */
  setPercentage(percentage: number): void {
    this.value = parseUnits(percentage.toString(), this.decimals);
  }
}

// lifted from viem
function formatUnits(value: bigint, decimals: number) {
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

function parseUnits(value: string, decimals: number) {
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
