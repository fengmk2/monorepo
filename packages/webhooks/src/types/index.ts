import type { StandardSchemaV1 } from "@zap-studio/validation";

/** Framework-agnostic request shape consumed by the webhook router. */
export type NormalizedRequest = {
  /** The headers of the request (e.g. { "Authorization": "Bearer token" }) */
  headers: Headers;
  /** The HTTP method of the request */
  method: Request["method"];
  /** The path of the request you registered in the router (e.g. "payment", "subscription") */
  path: string;
  /** The raw body of the request (for signature) */
  rawBody: Uint8Array<ArrayBufferLike>;
} & Partial<
  Record<"json", unknown | undefined> &
    Record<"params", Record<string, string> | undefined> &
    Record<"query", Record<string, string | string[]> | undefined> &
    Record<"text", string | undefined>
>;

/** Framework-agnostic response shape returned by the webhook router. */
export type NormalizedResponse<TBody = unknown> = {
  /** The HTTP status code of the response */
  status: number;
} & Partial<
  /** The body of the response */
  Record<"body", TBody | undefined> & Record<"headers", Headers | undefined>
>;

/** Route registration options for a webhook handler. */
export type RegisterOptions<T> = {
  /** The handler function to process the webhook */
  handler: WebhookHandler<T>;
} & Partial<
  /** Hooks that run after successful processing (before global after hooks) */
  Record<"after", AfterHook | AfterHook[] | undefined> &
    /** Hooks that run before request processing (after global before hooks) */
    Record<"before", BeforeHook | BeforeHook[] | undefined> &
    /** Optional Standard Schema validator to validate the webhook payload */
    Record<"schema", StandardSchemaV1<unknown, T> | undefined>
>;

/**
 * Infers the output type from a Standard Schema instance.
 *
 * @template TSchema - A Standard Schema type.
 */
export type InferSchemaOutput<TSchema> =
  TSchema extends StandardSchemaV1<unknown, infer TOutput> ? TOutput : never;

/**
 * Route options where schema is required and handler payload is inferred.
 *
 * @template TSchema - Schema used to infer handler payload type.
 */
export type SchemaRouteOptions<TSchema extends StandardSchemaV1<unknown, unknown>> = Omit<
  RegisterOptions<InferSchemaOutput<TSchema>>,
  "schema"
> & {
  schema: TSchema;
};

type RouteLike = Partial<
  Record<"after", AfterHook | AfterHook[] | undefined> &
    Record<"before", BeforeHook | BeforeHook[] | undefined>
> & {
  handler: WebhookHandler<unknown>;
  schema: StandardSchemaV1<unknown, unknown>;
};

/**
 * Applies schema-driven payload inference to each route entry.
 *
 * @template TRoutes - Route dictionary keyed by webhook path.
 */
export type SchemaRoutes<TRoutes extends Record<string, RouteLike>> = {
  [P in keyof TRoutes]: SchemaRouteOptions<TRoutes[P]["schema"]>;
};

/** The webhook handler function, responsible for processing incoming webhook events. */
export type WebhookHandler<TPayload = unknown> = (ctx: {
  req: NormalizedRequest;
  payload: TPayload;
  ack: (
    ...args: [] | [res: Partial<NormalizedResponse> | undefined]
  ) => Promise<NormalizedResponse>;
}) => Promise<NormalizedResponse | undefined> | NormalizedResponse | undefined;

/** Maps route keys to their payload-specific webhook handlers. */
export type HandlerMap<TMap extends Record<string, unknown>> = {
  [P in keyof TMap]: WebhookHandler<TMap[P]>;
};

/**
 * Builds a webhook payload map from a schema-based route dictionary.
 *
 * @template TRoutes - Route dictionary keyed by webhook path.
 */
export type InferWebhookMapFromRoutes<TRoutes extends Record<string, RouteLike>> = {
  [P in keyof TRoutes]: InferSchemaOutput<TRoutes[P]["schema"]>;
};

/** Verification function for incoming requests */
export type VerifyFn = (req: NormalizedRequest) => Promise<void> | void;

/** Hook function that runs before request processing */
export type BeforeHook = (req: NormalizedRequest) => Promise<void> | void;

/** Hook function that runs after successful request processing */
export type AfterHook = (req: NormalizedRequest, res: NormalizedResponse) => Promise<void> | void;

/** Hook function that runs when an error occurs */
export type ErrorHook = (
  error: Error,
  req: NormalizedRequest,
) => Promise<NormalizedResponse | undefined> | NormalizedResponse | undefined;
