import type { ExtendedRequestInit, FetchDefaults } from "./types.js";

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

function resolveSearchParams(
  url: string,
  defaultSearchParams: FetchDefaults["searchParams"] | undefined,
  searchParams: ExtendedRequestInit["searchParams"] | undefined,
): string {
  const [urlWithoutHash = "", hash] = url.split("#", 2);
  const [pathname = "", urlSearchParams] = urlWithoutHash.split("?", 2);
  const resolvedSearchParams = new URLSearchParams();

  mergeSearchParams(resolvedSearchParams, defaultSearchParams);
  mergeSearchParams(resolvedSearchParams, urlSearchParams);
  mergeSearchParams(resolvedSearchParams, searchParams);

  const resolvedSearch = resolvedSearchParams.toString();

  if (!resolvedSearch) {
    return [pathname, hash].filter(Boolean).join("#");
  }

  return `${pathname}?${resolvedSearch}${hash ? `#${hash}` : ""}`;
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

function mergeSearchParams(
  target: URLSearchParams,
  source: ExtendedRequestInit["searchParams"] | undefined,
): void {
  for (const [key, value] of new URLSearchParams(source)) {
    target.set(key, value);
  }
}
