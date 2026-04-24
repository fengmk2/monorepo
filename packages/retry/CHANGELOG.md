# @zap-studio/retry

## 0.1.2

### Changed

- Expand TSDoc coverage across retry modules and exported contracts for stronger JSR documentation completeness.

## 0.1.1

### Fixed

- 7004e9f: Allow explicit `undefined` in retry runner options and policy configuration typing.

### Changed

- e9903c5: Removed redundant `| undefined` unions from public retry option and decision types.

## 0.1.0

### Added

- Introduced a transport-agnostic `RetryPolicy` contract with `RetryDecisionInput` and `RetryDecision`.
- Added required `onExhausted` hook to `RetryPolicy` for policy-specific terminal error shaping.
- Added shared `BaseRetryPolicy` abstract class to centralize default `onExhausted` behavior.
- Added `BaseRetryPolicy.run(execute, options)` runner method to execute retry policies with minimal boilerplate.
- Added `throwOnExhausted` runner option with non-throw `RetryRunResult<T>` mode.
- Added `ExponentialBackoff` policy with bounded exponential delay via `baseDelayMs`, `maxDelayMs`, and `maxAttempts`.
- Added `FixedDelay` policy with constant delay and bounded attempts.
- Added `RetryError` for exhausted-retry failures with structured attempt/error/data context.

### Documentation

- Documented throwable behavior on `RetryPolicy`, `BaseRetryPolicy.run`, and related contracts with explicit `@throws` tags for policy, exhaustion, and custom `sleep` failures.
