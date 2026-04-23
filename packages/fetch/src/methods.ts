/**
 * Method helper factories used to build verb-specific fetch functions.
 *
 * @module
 */

import { isStandardSchema, type StandardSchemaV1 } from "@zap-studio/validation";

import type { $Fetch, ExtendedRequestInit, FetchInput } from "./types.js";

/**
 * Creates an HTTP method helper bound to a fetch function.
 *
 * The returned function mirrors `$Fetch` overloads but forces the provided
 * HTTP method (`GET`, `POST`, etc.) into request options.
 *
 * @param fetchFn - Fetch function to wrap.
 * @param method - HTTP method to enforce.
 * @returns Method-bound fetch function.
 * @throws Any error thrown or rejected by `fetchFn` when the returned method-bound
 *   fetch function is called.
 *
 * @example
 * const get = createMethod($fetch, "GET");
 * const user = await get("/users/1", UserSchema);
 */
export function createMethod<TFetch extends $Fetch>(fetchFn: TFetch, method: string): $Fetch {
  function methodFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    options: ExtendedRequestInit & {
      throwOnValidationError: false;
    },
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  function methodFetch<TSchema extends StandardSchemaV1>(
    input: FetchInput,
    schema: TSchema,
    ...args:
      | []
      | [options: ExtendedRequestInit & Partial<Record<"throwOnValidationError", true | undefined>>]
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  function methodFetch(
    input: FetchInput,
    ...args: [] | [options: ExtendedRequestInit]
  ): Promise<Response>;

  /**
   * Method-bound `$Fetch` implementation.
   *
   * Resolves schema/option overloads and injects the configured HTTP method.
   */
  function methodFetch(
    input: FetchInput,
    ...args:
      | []
      | [schemaOrOptions: StandardSchemaV1 | ExtendedRequestInit | undefined]
      | [
          schemaOrOptions: StandardSchemaV1 | ExtendedRequestInit | undefined,
          optionsOrUndefined: ExtendedRequestInit | undefined,
        ]
  ): Promise<unknown> {
    const [schemaOrOptions, optionsOrUndefined] = args;
    if (isStandardSchema(schemaOrOptions)) {
      if (optionsOrUndefined?.throwOnValidationError === false) {
        return fetchFn(input, schemaOrOptions, {
          ...optionsOrUndefined,
          method,
          throwOnValidationError: false,
        });
      }

      return fetchFn(input, schemaOrOptions, {
        ...optionsOrUndefined,
        method,
        throwOnValidationError: optionsOrUndefined?.throwOnValidationError,
      });
    }

    return fetchFn(input, {
      ...schemaOrOptions,
      method,
    });
  }

  return methodFetch;
}
