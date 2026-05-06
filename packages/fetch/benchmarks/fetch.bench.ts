import { bench, describe } from "vitest";

import { createClientSet } from "./ecosystem/create-client-set.js";
import { payloadTiers } from "./ecosystem/data.js";

describe("@zap-studio/fetch | core | api", () => {
  for (const tier of payloadTiers) {
    const clients = createClientSet(tier.response);
    const rawBody = JSON.stringify(tier.body);

    describe(`tier:${tier.name}`, () => {
      describe("primitive", () => {
        bench("get | raw-response-json", async () => {
          await clients.zap.primitiveGetJson();
        });
        bench("post | json-convenience", async () => {
          await clients.zap.primitivePostJson(tier.body);
        });
        bench("post | raw-body", async () => {
          await clients.zap.primitivePostRawBody(rawBody);
        });
      });

      describe("api-method | schema", () => {
        bench("get", async () => {
          await clients.zap.apiGetValidated();
        });
        bench("post | json-convenience", async () => {
          await clients.zap.apiPostJsonValidated(tier.body);
        });
      });

      describe("createFetch", () => {
        bench("primitive | defaults+raw-response-json", async () => {
          await clients.zap.createFetchPrimitiveGetJson();
        });
        bench("api.get | defaults+schema", async () => {
          await clients.zap.createFetchApiGetValidated();
        });
      });
    });
  }
});
