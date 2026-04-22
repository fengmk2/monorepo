# @zap-studio/retry

Composable retry policy primitives for HTTP clients and async workflows.

## Installation

```bash
npm install @zap-studio/retry
```

## Usage

```ts
import { FixedDelay } from "@zap-studio/retry/fixed-delay";
import { ExponentialBackoff } from "@zap-studio/retry/exponential-backoff";

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

## Types

```ts
import type { RetryDecisionInput, RetryPolicy } from "@zap-studio/retry";

const run = (policy: RetryPolicy, input: RetryDecisionInput) => policy.next(input);
```

`RetryDecisionInput` includes:

- `attempt` current attempt number
- `error` optional previous thrown error
- `response` optional previous response-like value
- `maxAttempts` optional orchestrator hint
- `method` optional HTTP method hint
- `url` optional request URL hint

`RetryDecision` includes:

- `shouldRetry` whether to schedule another attempt
- `delayMs` delay before the next attempt
- `reason` optional decision tag (`retry`, `max-attempts-reached`, `policy-declined`)

## RetryError

Use `RetryError` when an orchestrator exhausts retries and needs to surface final context.

```ts
import { RetryError } from "@zap-studio/retry/error";

throw new RetryError("Retry policy exhausted all attempts.", {
  attempts: attempt,
  lastError: error,
  lastResponse: response,
});
```

## License

MIT
