/**
 * Error primitives for policy evaluation and configuration failures.
 *
 * @module @zap-studio/permit/errors
 */

/**
 * Represents an error that occurs during policy evaluation or enforcement.
 * Use this error to indicate issues related to policy logic, configuration, or execution.
 */
export class PolicyError extends Error {
  /**
   * Creates a policy error with a human-readable message.
   *
   * @param message - Error message describing the policy failure.
   */
  constructor(message: string) {
    super(message);
    this.name = "PolicyError";
  }
}
