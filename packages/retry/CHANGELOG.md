# @zap-studio/retry

## 0.1.0

### Added

- Introduced a transport-agnostic `RetryPolicy` contract with `RetryDecisionInput` and `RetryDecision`.
- Added `ExponentialBackoff` policy with bounded exponential delay via `baseDelayMs`, `maxDelayMs`, and `maxAttempts`.
- Added `FixedDelay` policy with constant delay and bounded attempts.
- Added `RetryError` for exhausted-retry failures with structured attempt/error/response context.
