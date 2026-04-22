import { isStandardSchema, type StandardSchemaV1 } from "@zap-studio/validation";

import type { $Fetch, ExtendedRequestInit } from "./types.js";

/**
 * Creates an HTTP method helper bound to a fetch function.
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
