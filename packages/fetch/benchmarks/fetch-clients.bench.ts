import { bench, describe } from "vitest";

import { createClientSet } from "./ecosystem/create-client-set.js";
import { payloadTiers } from "./ecosystem/data.js";

describe("@zap-studio/fetch | ecosystem | fetch-clients", () => {
  for (const tier of payloadTiers) {
    const clients = createClientSet(tier.response);
    const rawBody = JSON.stringify(tier.body);

    describe(`tier:${tier.name}`, () => {
      describe("primitive-get", () => {
        bench("native | raw-response-json", async () => {
          await clients.native.getJson();
        });
        bench("ofetch | parsed-json", async () => {
          await clients.ofetch.getJson();
        });
        bench("ky | parsed-json", async () => {
          await clients.ky.getJson();
        });
        bench("axios | parsed-json", async () => {
          await clients.axios.getJson();
        });
        bench("@better-fetch/fetch", async () => {
          await clients.betterFetch.getJson();
        });
        bench("zap | raw-response-json", async () => {
          await clients.zap.primitiveGetJson();
        });
      });

      describe("post-json-convenience", () => {
        bench("native | raw-json-stringification", async () => {
          await clients.native.postJsonRaw(tier.body);
        });
        bench("ofetch", async () => {
          await clients.ofetch.postJson(tier.body);
        });
        bench("ky", async () => {
          await clients.ky.postJson(tier.body);
        });
        bench("axios | body-object", async () => {
          await clients.axios.postJson(tier.body);
        });
        bench("@better-fetch/fetch | body-object", async () => {
          await clients.betterFetch.postBodyObject(tier.body);
        });
        bench("zap", async () => {
          await clients.zap.primitivePostJson(tier.body);
        });
      });

      describe("post-raw-body", () => {
        bench("native", async () => {
          await clients.native.postRawBody(rawBody);
        });
        bench("ofetch", async () => {
          await clients.ofetch.postRawBody(rawBody);
        });
        bench("ky", async () => {
          await clients.ky.postRawBody(rawBody);
        });
        bench("axios", async () => {
          await clients.axios.postRawBody(rawBody);
        });
        bench("@better-fetch/fetch", async () => {
          await clients.betterFetch.postRawBody(rawBody);
        });
        bench("zap", async () => {
          await clients.zap.primitivePostRawBody(rawBody);
        });
      });

      describe("defaults-client", () => {
        bench("ofetch", async () => {
          await clients.ofetch.withDefaultsGetJson();
        });
        bench("ky", async () => {
          await clients.ky.withDefaultsGetJson();
        });
        bench("axios", async () => {
          await clients.axios.withDefaultsGetJson();
        });
        bench("@better-fetch/fetch", async () => {
          await clients.betterFetch.withDefaultsGetJson();
        });
        bench("zap | createFetch", async () => {
          await clients.zap.createFetchPrimitiveGetJson();
        });
      });

      describe("schema-validation", () => {
        bench("zap | api.get", async () => {
          await clients.zap.apiGetValidated();
        });
        bench("native | zod-parse", async () => {
          await clients.zap.schemaOnlyValidate();
        });
      });
    });
  }
});
