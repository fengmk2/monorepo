# Zap Studio

[![CI](https://github.com/zap-studio/monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/zap-studio/monorepo/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/zap-studio/monorepo/graph/badge.svg?branch=main)](https://codecov.io/gh/zap-studio/monorepo)
[![License](https://img.shields.io/github/license/zap-studio/monorepo)](https://github.com/zap-studio/monorepo/blob/main/LICENSE)

Type-safe, framework-agnostic TypeScript packages for building modern apps.

Documentation: [zapstudio.dev](https://www.zapstudio.dev)

## Packages

| Package                  | Description                                                     | Badges                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@zap-studio/fetch`      | Type-safe fetch wrapper with runtime schema validation          | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Ffetch?label=npm)](https://www.npmjs.com/package/@zap-studio/fetch) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Ffetch?label=jsr)](https://jsr.io/@zap-studio/fetch) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Ffetch?label=downloads)](https://www.npmjs.com/package/@zap-studio/fetch) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Ffetch?label=size)](https://bundlephobia.com/package/@zap-studio/fetch)                                         |
| `@zap-studio/permit`     | Declarative authorization policies with Standard Schema support | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Fpermit?label=npm)](https://www.npmjs.com/package/@zap-studio/permit) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Fpermit?label=jsr)](https://jsr.io/@zap-studio/permit) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Fpermit?label=downloads)](https://www.npmjs.com/package/@zap-studio/permit) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Fpermit?label=size)](https://bundlephobia.com/package/@zap-studio/permit)                                 |
| `@zap-studio/retry`      | Composable retry policies with fixed and exponential backoff    | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Fretry?label=npm)](https://www.npmjs.com/package/@zap-studio/retry) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Fretry?label=jsr)](https://jsr.io/@zap-studio/retry) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Fretry?label=downloads)](https://www.npmjs.com/package/@zap-studio/retry) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Fretry?label=size)](https://bundlephobia.com/package/@zap-studio/retry)                                         |
| `@zap-studio/validation` | Standard Schema utilities and `ValidationError` helpers         | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Fvalidation?label=npm)](https://www.npmjs.com/package/@zap-studio/validation) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Fvalidation?label=jsr)](https://jsr.io/@zap-studio/validation) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Fvalidation?label=downloads)](https://www.npmjs.com/package/@zap-studio/validation) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Fvalidation?label=size)](https://bundlephobia.com/package/@zap-studio/validation) |
| `@zap-studio/webhooks`   | Type-safe webhook router with verification and lifecycle hooks  | [![npm](https://img.shields.io/npm/v/%40zap-studio%2Fwebhooks?label=npm)](https://www.npmjs.com/package/@zap-studio/webhooks) [![jsr](https://img.shields.io/jsr/v/%40zap-studio%2Fwebhooks?label=jsr)](https://jsr.io/@zap-studio/webhooks) [![downloads](https://img.shields.io/npm/dm/%40zap-studio%2Fwebhooks?label=downloads)](https://www.npmjs.com/package/@zap-studio/webhooks) [![bundle size](https://img.shields.io/bundlephobia/minzip/%40zap-studio%2Fwebhooks?label=size)](https://bundlephobia.com/package/@zap-studio/webhooks)                 |

## Performance

Latest benchmark runs show strong relative performance for `fetch`, `validation`, and `retry`.

| Package                  | Scenario                            | Relative result (`@zap-studio/*`)                                                                                                                                     |
| ------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@zap-studio/fetch`      | Primitive GET (`raw-response-json`) | ~`1.2x-1.3x` faster than `ofetch`, `~2.0x` faster than `@better-fetch/fetch`, `~3.0x` faster than `axios`, `~5.0x` faster than `ky`; within ~`5-8%` of native `fetch` |
| `@zap-studio/fetch`      | Defaults client (`createFetch`)     | ~`1.2x` faster than `ofetch.create`, ~`1.5x` faster than `@better-fetch/fetch` create client, ~`2.2x` faster than `axios.create`, ~`4.0x` faster than `ky.create`     |
| `@zap-studio/fetch`      | Schema validation (`api.get`)       | typically within ~`0-4%` of `native + zod parse`                                                                                                                      |
| `@zap-studio/validation` | Core sync reused validator          | `createSyncStandardValidator` is ~`1.29x` faster than `standardValidateSync`                                                                                          |
| `@zap-studio/validation` | Sync success (ArkType)              | ~`1.8x-2.0x` faster than native standard-schema validate                                                                                                              |
| `@zap-studio/validation` | Sync success (Zod)                  | ~`1.2x-1.6x` faster than native standard-schema validate                                                                                                              |
| `@zap-studio/retry`      | Success-first attempt               | ~`1.1x-1.3x` faster than `p-retry`, ~`2.0x-2.7x` faster than `promise-retry` / `async-retry`, ~`2.7x-3.3x` faster than `exponential-backoff`                          |
| `@zap-studio/retry`      | Success-after-retries               | ~`1.1x` faster than `p-retry` and ~`270x` faster than `async-retry`, `promise-retry`, and `exponential-backoff` in these scenarios                                    |
| `@zap-studio/retry`      | Abort signal overhead               | `zap` exponential no-signal path is ~`1.34x` faster than `p-retry` no-signal and ~`1.55x` faster than `p-retry` with-signal                                           |

## Agent Skills

Skills are focused by workflow and package so AI agents can load only the relevant guidance.

Install them with the following command:

```bash
npx skills add zap-studio/monorepo
```
