---
name: zap-retry-policies
description: >
  Implement retry orchestration with @zap-studio/retry using BaseRetryPolicy.run(),
  ExponentialBackoff and FixedDelay policy classes, and generic contracts
  from @zap-studio/retry/types.
type: core
library: "@zap-studio/retry"
library_version: "0.1.0"
sources:
  - "zap-studio/monorepo:packages/retry/README.md"
  - "zap-studio/monorepo:packages/retry/src/index.ts"
  - "zap-studio/monorepo:packages/retry/src/error.ts"
  - "zap-studio/monorepo:packages/retry/src/types.ts"
  - "zap-studio/monorepo:packages/retry/src/exponential-backoff.ts"
  - "zap-studio/monorepo:packages/retry/src/fixed-delay.ts"
---

# @zap-studio/retry — Retry Policies

## Setup

```ts
import { ExponentialBackoff } from "@zap-studio/retry/exponential-backoff";
import { FixedDelay } from "@zap-studio/retry/fixed-delay";
import type {
  RetryDecisionInput,
  RetryDecision,
  RetryExhaustedInput,
} from "@zap-studio/retry/types";

const policy = new ExponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});

const fallback = new FixedDelay({
  maxAttempts: 3,
  delayMs: 250,
});

const sampleDecision: RetryDecision = {
  shouldRetry: true,
  delayMs: 100,
  reason: "retry",
};

const exhausted: RetryExhaustedInput = {
  attempts: 5,
  error: new Error("network"),
};
```

## Core Patterns

### Use `policy.run()` to run policies

```ts
import { $fetch } from "@zap-studio/fetch";

const data = await policy.run(async () => {
  const response = await $fetch("https://api.example.com/users", {
    throwOnFetchError: true,
  });
  return await response.json();
});
```

### Handle exhausted retries with `RetryError`

```ts
import { RetryError } from "@zap-studio/retry/error";

try {
  const data = await policy.run(async () => {
    const response = await $fetch("https://api.example.com/users", {
      throwOnFetchError: true,
    });
    return await response.json();
  });
  console.log(data);
} catch (error) {
  if (error instanceof RetryError) {
    console.error(error.attempts);
    console.error(error.lastError);
  } else {
    throw error;
  }
}
```

### Handle exhausted retries without throwing

```ts
const result = await policy.run(
  async () => {
    const response = await $fetch("https://api.example.com/users", {
      throwOnFetchError: true,
    });
    return await response.json();
  },
  { throwOnExhausted: false },
);

if (!result.ok) {
  console.error(result.attempts);
  console.error(result.error.lastError);
}
```

### Choose exponential backoff for unstable networks

```ts
import { ExponentialBackoff } from "@zap-studio/retry/exponential-backoff";

const retry = new ExponentialBackoff({
  maxAttempts: 6,
  baseDelayMs: 100,
  maxDelayMs: 5_000,
});
```

### Choose fixed delay for predictable retry cadence

```ts
import { FixedDelay } from "@zap-studio/retry/fixed-delay";

const retry = new FixedDelay({
  maxAttempts: 4,
  delayMs: 300,
});
```

## Common Mistakes

### HIGH Treating `attempt` as zero-based

Wrong:

```ts
policy.next({ attempt: 0, error });
```

Correct:

```ts
policy.next({ attempt: 1, error });
```

Policies in this package expect attempts to start at `1`.

Source: zap-studio/monorepo:packages/retry/src/exponential-backoff.ts

### MEDIUM Ignoring `shouldRetry` before delaying

Wrong:

```ts
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const decision = policy.next({ attempt, error });
if (decision.shouldRetry) {
  await sleep(decision.delayMs);
}
```

Correct:

```ts
const decision = policy.next({ attempt, error });
if (!decision.shouldRetry) throw error;
await sleep(decision.delayMs);
```

Always branch on `shouldRetry`; terminal decisions return `delayMs: 0`.

Source: zap-studio/monorepo:packages/retry/src/fixed-delay.ts

### MEDIUM Skipping `policy.run()` and duplicating orchestration boilerplate

Wrong:

```ts
let attempt = 1;
while (true) {
  try {
    return await execute();
  } catch (error) {
    const decision = policy.next({ attempt, error });
    if (!decision.shouldRetry) throw policy.onExhausted({ attempts: attempt, error });
    await sleep(decision.delayMs);
    attempt += 1;
  }
}
```

Correct:

```ts
return await policy.run(execute);
```

Use `policy.run()` as the default orchestration API and reserve low-level `next()` usage for custom runners.

Source: zap-studio/monorepo:packages/retry/src/index.ts

See also: zap-fetch-typed-http/SKILL.md — fetch integration patterns with request options.
