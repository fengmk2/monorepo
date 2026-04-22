/**
 * Method helper factories used to build verb-specific fetch functions.
 *
 * @module
 */

import { isStandardSchema, type StandardSchemaV1 } from "@zap-studio/validation";

import type { $Fetch, ExtendedRequestInit } from "./types.js";

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
    resource: RequestInfo,
    schema: TSchema,
    options: ExtendedRequestInit & {
      throwOnValidationError: false;
    },
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  function methodFetch<TSchema extends StandardSchemaV1>(
    resource: RequestInfo,
    schema: TSchema,
    options?: ExtendedRequestInit & {
      throwOnValidationError?: true | undefined;
    },
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  function methodFetch(resource: RequestInfo, options?: ExtendedRequestInit): Promise<Response>;

  /**
   * Method-bound `$Fetch` implementation.
   *
   * Resolves schema/option overloads and injects the configured HTTP method.
   */
  function methodFetch(
    resource: RequestInfo,
    schemaOrOptions?: StandardSchemaV1 | ExtendedRequestInit,
    optionsOrUndefined?: ExtendedRequestInit,
  ): Promise<unknown> {
    if (isStandardSchema(schemaOrOptions)) {
      if (optionsOrUndefined?.throwOnValidationError === false) {
        return fetchFn(resource, schemaOrOptions, {
          ...optionsOrUndefined,
          method,
          throwOnValidationError: false,
        });
      }

      return fetchFn(resource, schemaOrOptions, {
        ...optionsOrUndefined,
        method,
        throwOnValidationError: optionsOrUndefined?.throwOnValidationError,
      });
    }

    return fetchFn(resource, {
      ...schemaOrOptions,
      method,
    });
  }

  return methodFetch;
}
