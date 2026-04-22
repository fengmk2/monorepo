import type { StandardSchemaV1 } from "@zap-studio/validation";
import { standardValidate } from "@zap-studio/validation";

import { FetchError } from "./errors.js";
import { mergeHeaders } from "./headers.js";
import { normalizeRequest } from "./request.js";
import type { ExtendedRequestInit, FetchDefaults } from "./types.js";
import { resolveRequestUrl } from "./url.js";

/**
 * Internal fetch implementation used by both $fetch and createFetch.
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
    searchParams,
    throwOnFetchError = defaults.throwOnFetchError,
    throwOnValidationError = defaults.throwOnValidationError,
    ...rest
  } = options;

  const init = {
    ...rest,
    headers: mergeHeaders(defaults.headers, headers),
  } as RequestInit;

  return {
    init,
    searchParams,
    throwOnFetchError,
    throwOnValidationError,
  };
}
