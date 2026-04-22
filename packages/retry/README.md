# @zap-studio/retry

Composable retry policy primitives for HTTP clients and async workflows.

## Installation

```bash
npm install @zap-studio/retry
```

## Usage

```ts
import { ExponentialBackoff, FixedDelay } from "@zap-studio/retry";

const exponential = new ExponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});

const fixed = new FixedDelay({
  maxAttempts: 3,
  delayMs: 250,
});
```

## License

MIT
