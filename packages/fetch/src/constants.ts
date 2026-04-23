/**
 * Shared defaults and constants for fetch behavior.
 *
 * @module
 */

import type { FetchDefaults } from "./types.js";

/**
 * Default options for the global $fetch
 *
 * These defaults are used by the top-level `$fetch` export.
 * Use `createFetch(...)` when you need per-client defaults.
 *
 * @example
 * import { GLOBAL_DEFAULTS } from "@zap-studio/fetch/constants";
 *
 * console.log(GLOBAL_DEFAULTS.throwOnFetchError); // true
 */
export const GLOBAL_DEFAULTS: FetchDefaults = {
  baseURL: "",
  throwOnFetchError: true,
  throwOnValidationError: true,
};
