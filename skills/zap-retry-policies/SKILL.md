---
name: zap-retry-policies
description: Use @zap-studio/retry in an application. Use when adding retries to async operations, choosing FixedDelay or ExponentialBackoff, handling RetryError, using RetryRunResult, configuring throwOnExhausted modes, supplying custom sleep functions, or creating custom BaseRetryPolicy next/onExhausted behavior.
---

# Zap Retry Policies

Use this skill when consuming `@zap-studio/retry`.

## Core Model

- The `RetryPolicy` interface requires both `next(input)` and `onExhausted(input)` (object literals must supply both). Extend `BaseRetryPolicy` to implement `next` only; the base class provides a default `onExhausted` you can override.
- `BaseRetryPolicy.run(execute, options)` owns orchestration.
- Attempts are one-based; the first call to `execute` receives `1`.
- `FixedDelay` returns a constant delay until `maxAttempts`.
- `ExponentialBackoff` computes `min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1))`.

## Usage

```ts
import { ExponentialBackoff } from "@zap-studio/retry/exponential-backoff";

const policy = new ExponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});

const data = await policy.run(async () => {
  const response = await fetch("https://api.example.com/users");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
});
```

## Exhaustion Modes

Throw mode returns `T` or throws the terminal `RetryError`.

```ts
import { RetryError } from "@zap-studio/retry/error";

try {
  return await policy.run(doWork);
} catch (error) {
  if (error instanceof RetryError) {
    return { attempts: error.attempts, cause: error.lastError };
  }
  throw error;
}
```

Non-throw mode returns a discriminated result.

```ts
const result = await policy.run(doWork, { throwOnExhausted: false });

if (!result.ok) {
  return { attempts: result.attempts, cause: result.error.lastError };
}

return result.value;
```

## Gotchas

- Exhausted operation failures are stored as `RetryError.lastError`; the original error is
  not rethrown by the default terminal path.
- `throwOnExhausted: false` only converts exhaustion to `{ ok: false }`; errors thrown by
  `next`, `onExhausted`, or custom `sleep` still propagate.
- Use custom `sleep` in application tests to avoid real timers.
- Do not treat attempt numbers as zero-based.

## References

- Package docs: https://zapstudio.dev/packages/retry
- llms.txt: https://zapstudio.dev/llms.txt
- llms-full.txt: https://zapstudio.dev/llms-full.txt
