import { isStandardSchema, type StandardSchemaV1 } from "@zap-studio/validation";

import type { $Fetch, ExtendedRequestInit } from "./types.js";

/**
 * Creates an HTTP method helper bound to a fetch function.
 */
export function createMethod<TFetch extends $Fetch>(fetchFn: TFetch, method: string): $Fetch {
  function methodFetch<TSchema extends StandardSchemaV1>(
    resource: RequestInfo,
    schema: TSchema,
    options: Omit<ExtendedRequestInit, "method"> & {
      throwOnValidationError: false;
    },
  ): Promise<StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>>;

  function methodFetch<TSchema extends StandardSchemaV1>(
    resource: RequestInfo,
    schema: TSchema,
    options?: Omit<ExtendedRequestInit, "method"> & {
      throwOnValidationError?: true | undefined;
    },
  ): Promise<StandardSchemaV1.InferOutput<TSchema>>;

  function methodFetch(
    resource: RequestInfo,
    options?: Omit<ExtendedRequestInit, "method">,
  ): Promise<Response>;

  function methodFetch(
    resource: RequestInfo,
    schemaOrOptions?: StandardSchemaV1 | Omit<ExtendedRequestInit, "method">,
    optionsOrUndefined?: Omit<ExtendedRequestInit, "method">,
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
