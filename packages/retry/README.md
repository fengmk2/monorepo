# @zap-studio/retry

Composable retry policy primitives for HTTP clients and async workflows.

## Installation

```bash
npm install @zap-studio/retry
```

## Usage

```ts
import { ExponentialBackoff } from "@zap-studio/retry/exponential-backoff";
import { FixedDelay } from "@zap-studio/retry/fixed-delay";

const exponential = new ExponentialBackoff({
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});

const data = await exponential.run(async () => fetch("https://api.example.com/users"));
```

Use `ExponentialBackoff` for transient network instability and shared upstream services.
Use `FixedDelay` for stable, predictable retry intervals in controlled environments.

```ts
const unstableNetworkPolicy = new ExponentialBackoff({
  maxAttempts: 6,
  baseDelayMs: 100,
  maxDelayMs: 2_000,
});

const predictableIntervalPolicy = new FixedDelay({
  maxAttempts: 4,
  delayMs: 300,
});
```

## Types

All policy types are generic:

- `RetryPolicy<TError, TData>`
- `RetryDecisionInput<TError, TData>`
- `RetryExhaustedInput<TError, TData>`

`BaseRetryPolicy` adds orchestration via `run(execute, options)`.

`RetryDecision` includes:

- `shouldRetry` whether to schedule another attempt
- `delayMs` delay before the next attempt
- `reason` optional decision tag (`retry`, `max-attempts-reached`, `policy-declined`)

`RetryDecisionInput<TError, TData>` includes:

- `attempt` current attempt number
- `error` optional previous thrown error of type `TError`
- `data` optional previous value of type `TData`
- `maxAttempts` optional orchestrator hint

`RetryExhaustedInput<TError, TData>` includes:

- `attempts` total attempts performed before stopping
- `error` optional last thrown error
- `data` optional last value

`BaseRetryPolicy` provides shared default terminal error behavior for `onExhausted(input)`.

`RetryRunOptions` includes:

- `sleep` optional delay implementation override used by `BaseRetryPolicy.run(...)` (useful for tests)

## RetryError

Use `RetryError` when an orchestrator exhausts retries and needs to surface final context.

```ts
import { RetryError } from "@zap-studio/retry/error";

throw new RetryError("Retry policy exhausted all attempts.", {
  attempts: attempt,
  lastError: error,
  lastData: data,
});
```

Policies implement `onExhausted(input)` to return the terminal error used by the built-in runner.

`ExponentialBackoff` and `FixedDelay` inherit the default implementation from `BaseRetryPolicy`.

## License

MIT
