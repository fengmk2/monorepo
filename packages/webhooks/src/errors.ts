/**
 * Error primitives for webhook verification failures.
 *
 * @module @zap-studio/webhooks/errors
 */

/**
 * Error thrown when webhook request verification fails.
 *
 * This error is used by verifier helpers such as `createHmacVerifier` so
 * callers can distinguish verification failures from other webhook errors.
 */
export class VerificationError extends Error {
  /**
   * Creates a verification error with a human-readable message.
   *
   * @param message - Error message describing the verification failure.
   */
  constructor(message: string) {
    super(message);
    this.name = "VerificationError";
  }
}
