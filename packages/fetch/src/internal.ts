/**
 * Internal request execution and option preparation utilities.
 *
 * @module
 */

import type { StandardSchemaV1 } from "@zap-studio/validation";
import { standardValidate } from "@zap-studio/validation";

import { FetchError } from "./errors.js";
import { mergeHeaders } from "./headers.js";
import { normalizeRequest } from "./request.js";
import type { ExtendedRequestInit, FetchDefaults } from "./types.js";
import { resolveRequestUrl } from "./url.js";

/**
 * Internal fetch implementation used by both $fetch and createFetch.
 *
 * This function normalizes request input, resolves final URL + query params,
 * executes `fetch`, optionally throws `FetchError`, and optionally validates
 * JSON response payloads using Standard Schema.
 *
 * @param resource - Request URL, path, or Request object.
 * @param schema - Optional Standard Schema for response validation.
 * @param options - Optional request options and package-specific flags.
 * @param defaults - Effective client defaults.
 * @returns Raw `Response` when no schema is provided; otherwise validated output.
 */
export async function fetchInternal(
  resource: RequestInfo,
  schema: StandardSchemaV1 | undefined,
  options: ExtendedRequestInit | undefined,
  defaults: FetchDefaults,
): Promise<unknown> {
  const request = normalizeRequest(resource, options);
  const { init, searchParams, throwOnFetchError, throwOnValidationError } = prepareRequestInit(
    request.options,
    defaults,
  );
  const url = resolveRequestUrl(request.url, defaults, searchParams);
  const response = request.request
    ? await fetch(new Request(url, request.request), init)
    : await fetch(url, init);

  if (throwOnFetchError && !response.ok) {
    throw new FetchError(`HTTP ${response.status}: ${response.statusText}`, response);
  }

  if (!schema) {
    return response;
  }

  const raw = await response.json();
  if (throwOnValidationError) {
    return standardValidate(schema, raw, { throwOnError: true });
  }
  return standardValidate(schema, raw, { throwOnError: false });
}

/**
 * Normalizes request-level options into a final RequestInit payload and runtime flags.
 *
 * @param options - Request-level options.
 * @param defaults - Client-level defaults.
 * @returns Fully merged request init payload and effective runtime flags.
 */
function prepareRequestInit(
  options: ExtendedRequestInit,
  defaults: FetchDefaults,
): {
  init: RequestInit;
  searchParams: ExtendedRequestInit["searchParams"] | undefined;
  throwOnFetchError: boolean;
  throwOnValidationError: boolean;
} {
  const {
    headers,
    json,
    searchParams,
    throwOnFetchError = defaults.throwOnFetchError,
    throwOnValidationError = defaults.throwOnValidationError,
    ...rest
  } = options;

  const init = {
    ...rest,
    headers: mergeHeaders(defaults.headers, headers),
  } as RequestInit;

  if (json !== undefined) {
    if (init.body != null) {
      throw new TypeError("Cannot provide both `body` and `json`.");
    }

    init.body = JSON.stringify(json);
    const headers = new Headers(init.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    init.headers = headers;
  }

  return {
    init,
    searchParams,
    throwOnFetchError,
    throwOnValidationError,
  };
}
