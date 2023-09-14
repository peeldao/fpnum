# fpnum

A tiny lib for working with fixed-point numbers in JS. For Ethereum dApps, financial applications, whatever.

## Getting Started

### Installation

```bash
npm install fpnum
```

## Usage

### FixedInt

Basic conversion to and from a bigint's fixed-point representation. Similar to viem's `parseUnits`, `formatEther` etc.

```ts
// initialize from a bigint with 18 decimals
const oneEther = new FixedInt<18>(1_000_000_000_000_000_000, 18);
const oneGwei: FixedInt<9> = oneEther; // type error! An 18-decimal FixedInt can't be assigned to a 9 decimal one

// initialize from the formatted representation
// "1.1" => FixedInt(1_100_000_000_000_000_000, 18)
const onePointOneEther: FixedInt<18> = FixedInt.parse<18>("1.1", 18);

// 1_100_000_000_000_000_000n: bignumber
console.log(onePointOneEther.val);

// "1.1": string
console.log(onePointOneEther.format());

// 1.1: number
console.log(onePointOneEther.toFloat());

// create a new class for easier reuse
export class Ether extends FixedInt<18> {
  constructor(value: bigint) {
    super(value, 18);
  }
}
// "2" => FixedInt(2_000_000_000_000_000_000, 18)
const twoEther = Ether.parse("2");
```

### FixedPortion

Useful for when a fixed-point number represents a portion of some maximum value. For example: a fee percentage, interest rates, etc.

```ts
const MAXIMUM_FEE = 10_000n; // 100% as a fixed-point number with 4 decimals
// initialize from a bigint with 18 decimals
const onePercent = new FixedPortion<4>(100, 4, MAXIMUM_FEE);

// initialize from the formatted representation
// "0.2" => FixedInt(200, 4)
const fee = FixedPortion.parse<4>(".2", 4, MAXIMUM_FEE);

// 2: number
console.log(fee.formatPercentage());

// update fee from 2% to 3% with the percentage representation (a fixed-point number with 2 decimals)
fee.setPercentage(3);
```
