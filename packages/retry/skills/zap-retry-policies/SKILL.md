---
name: zap-retry-policies
description: >
  Implement retry policies with @zap-studio/retry module imports using
  ExponentialBackoff and FixedDelay classes with a local RetryPolicy shape
  for transport-agnostic retry orchestration.
type: core
library: "@zap-studio/retry"
library_version: "0.1.0"
sources:
  - "zap-studio/monorepo:packages/retry/README.md"
  - "zap-studio/monorepo:packages/retry/src/exponential-backoff.ts"
  - "zap-studio/monorepo:packages/retry/src/fixed-delay.ts"
---

# @zap-studio/retry — Retry Policies

## Setup

```ts
import { ExponentialBackoff } from "@zap-studio/retry/exponential-backoff";
import { FixedDelay } from "@zap-studio/retry/fixed-delay";
import type { RetryDecisionInput, RetryDecision, RetryPolicy } from "@zap-studio/retry";

const policy: RetryPolicy = new ExponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});

const fallback = new FixedDelay({
  maxAttempts: 3,
  delayMs: 250,
});
```

## Core Patterns

### Use policies as pure decision engines

```ts
const decision = policy.next({
  attempt: 2,
  error: new Error("network"),
});

if (decision.shouldRetry) {
  await new Promise((resolve) => setTimeout(resolve, decision.delayMs));
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

See also: zap-fetch-typed-http/SKILL.md — fetch integration patterns with request options.
