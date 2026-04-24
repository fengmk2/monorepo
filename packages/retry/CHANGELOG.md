# @zap-studio/retry

## 0.3.0

### Changed

- Add dedicated `AbortError` and normalize cancellation paths so retry internals throw/return `RetryError` or `AbortError` instead of plain `Error`.
- Expose `defaultSleep` as a public API export.
- Align non-throw abort metadata so `result.attempts` and `result.error.attempts` stay consistent.
- Refactor result-mode internals into smaller helpers for lower complexity and cleaner maintainability.
- Expand docs across README and package docs pages to explain `AbortError` behavior in throw and non-throw modes.

## 0.2.0

### Changed

- Optimize retry runner hot paths by splitting throw/non-throw execution flows and skipping sleep calls when delay is non-positive.
- Add `AbortSignal` support to `run(...)` so retry orchestration can be canceled before or between attempts.
- Add retry benchmarking coverage with core and ecosystem scenarios, including real-world and fair-mode comparisons.
- Add abort-focused ecosystem benchmarks comparing signal overhead and immediate cancellation behavior.
- Expand TSDoc coverage for new runner internals added in this release.

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
