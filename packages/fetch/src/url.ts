/**
 * URL resolution and query merging utilities.
 *
 * @module @zap-studio/fetch/url
 */

import type { ExtendedRequestInit, FetchDefaults } from "./types.js";

/**
 * Resolves final request URL by applying baseURL and layered search params.
 *
 * Search param precedence:
 * 1. `defaults.searchParams`
 * 2. search params already present in `resourceUrl`
 * 3. per-request `searchParams`
 *
 * @example
 * const finalUrl = resolveRequestUrl(
 *   "/users?page=2",
 *   { ...defaults, baseURL: "https://api.example.com", searchParams: { locale: "en" } },
 *   { page: "3" },
 * );
 * // https://api.example.com/users?locale=en&page=3
 *
 * @throws {TypeError} When `baseURL` and `resourceUrl` cannot be resolved by
 *   `URL`, or when default/per-request search params cannot be converted by
 *   `URLSearchParams`.
 */
export function resolveRequestUrl(
  resourceUrl: string,
  defaults: FetchDefaults,
  searchParams: ExtendedRequestInit["searchParams"] | undefined,
): string {
  const url = defaults.baseURL
    ? new URL(resourceUrl, ensureTrailingSlash(defaults.baseURL)).toString()
    : resourceUrl;

  return resolveSearchParams(url, defaults.searchParams, searchParams);
}

/**
 * Resolves search params by applying default params, URL params, then request params.
 */
function resolveSearchParams(
  url: string,
  defaultSearchParams: FetchDefaults["searchParams"] | undefined,
  searchParams: ExtendedRequestInit["searchParams"] | undefined,
): string {
  const hasFragment = url.includes("#");
  const [urlWithoutHash = "", hash = ""] = url.split("#", 2);
  const [pathname = "", urlSearchParams] = urlWithoutHash.split("?", 2);
  const resolvedSearchParams = new URLSearchParams();

  mergeSearchParams(resolvedSearchParams, defaultSearchParams);
  mergeSearchParams(resolvedSearchParams, urlSearchParams);
  mergeSearchParams(resolvedSearchParams, searchParams);

  const resolvedSearch = resolvedSearchParams.toString();
  const fragmentSuffix = hasFragment ? `#${hash}` : "";

  if (!resolvedSearch) {
    return `${pathname}${fragmentSuffix}`;
  }

  return `${pathname}?${resolvedSearch}${fragmentSuffix}`;
}

/**
 * Ensures a URL has a trailing slash for relative URL resolution.
 */
function ensureTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

/**
 * Copies search params into target, overriding duplicate keys.
 */
function mergeSearchParams(
  target: URLSearchParams,
  source: ExtendedRequestInit["searchParams"] | undefined,
): void {
  for (const [key, value] of new URLSearchParams(source)) {
    target.set(key, value);
  }
}
