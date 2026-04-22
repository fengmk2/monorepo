import type { StandardSchemaV1 } from "@zap-studio/validation";

type URLSearchParamsInput = ConstructorParameters<typeof URLSearchParams>[0];

/**
 * Extended RequestInit type to include custom fetch options
 */
export type ExtendedRequestInit = RequestInit & {
  /**
   * Per-request query/search params
   * @default undefined
   */
  searchParams?: URLSearchParamsInput | undefined;
  /**
   * Whether to throw a FetchError on HTTP errors (non-2xx responses)
   * @default true
   */
  throwOnFetchError?: boolean | undefined;
  /**
   * Whether to throw a ValidationError on validation errors
   * @default true
   */
  throwOnValidationError?: boolean | undefined;
};

/**
 * Internal defaults used by fetchInternal
 */
export interface FetchDefaults {
  /**
   * Base URL to prepend to all requests
   * @default ""
   */
  baseURL: string;
  /**
   * Default headers to include in all requests (can be overridden per request)
   * @default undefined
   */
  headers?: HeadersInit | undefined;
  /**
   * Default query/search params applied to every request (can be overridden per request)
   * @default undefined
   */
  searchParams?: URLSearchParamsInput | undefined;
  /**
   * Whether to throw a `FetchError` on HTTP errors (non-2xx responses)
   * @default true
   */
  throwOnFetchError: boolean;
  /**
   * Whether to throw a `ValidationError` on validation errors
   * @default true
   */
  throwOnValidationError: boolean;
}

/**
 * Type-safe fetch function with Standard Schema validation support
 */
export interface $Fetch {
  /**
   * Fetch with schema validation and throwOnValidationError: false
   * @param resource - URL or path to fetch
   * @param schema - Standard Schema for response validation
   * @param options - Extended request options with throwOnValidationError: false
   * @returns Standard Schema Result object with value or issues
   */
  <TSchema extends StandardSchemaV1>(
    resource: RequestInfo,
    schema: TSchema,
    options: ExtendedRequestInit & { throwOnValidationError: false },
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  /**
   * Fetch with schema validation and throwOnValidationError: true or undefined (default)
   * @param resource - URL or path to fetch
   * @param schema - Standard Schema for response validation
   * @param options - Extended request options
   * @returns Validated data of type TSchema
   */
  <TSchema extends StandardSchemaV1>(
    resource: RequestInfo,
    schema: TSchema,
    options?: ExtendedRequestInit & {
      throwOnValidationError?: true | undefined;
    },
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  /**
   * Fetch without schema validation
   * @param resource - URL or path to fetch
   * @param options - Extended request options
   * @returns Raw Response object
   */
  (resource: RequestInfo, options?: ExtendedRequestInit): Promise<Response>;
}

/**
 * API HTTP method-specific fetch functions
 */
export interface ApiMethods {
  /**
   * DELETE method fetch function
   */
  delete: $Fetch;
  /**
   * GET method fetch function
   */
  get: $Fetch;
  /**
   * PATCH method fetch function
   */
  patch: $Fetch;
  /**
   * POST method fetch function
   */
  post: $Fetch;
  /**
   * PUT method fetch function
   */
  put: $Fetch;
}
