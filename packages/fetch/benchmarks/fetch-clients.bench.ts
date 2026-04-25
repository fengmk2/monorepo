import { bench, describe } from "vite-plus/test";

import { createClientSet } from "./ecosystem/create-client-set.js";
import { payloadTiers } from "./ecosystem/data.js";

type Scenario = {
  name: string;
  run: () => Promise<unknown>;
};

describe("@zap-studio/fetch | ecosystem | fetch-clients", () => {
  for (const tier of payloadTiers) {
    const clients = createClientSet(tier.response);
    const rawBody = JSON.stringify(tier.body);
    const scenarios: Scenario[] = [
      { name: "native | primitive | get | raw-response-json", run: clients.native.getJson },
      { name: "ofetch | primitive | get | parsed-json", run: clients.ofetch.getJson },
      { name: "ky | primitive | get | parsed-json", run: clients.ky.getJson },
      { name: "axios | primitive | get | parsed-json", run: clients.axios.getJson },
      {
        name: "@better-fetch/fetch | primitive | get",
        run: clients.betterFetch.getJson,
      },
      { name: "zap | primitive | get | raw-response-json", run: clients.zap.primitiveGetJson },
      {
        name: "native | post | raw-json-stringification",
        run: async () => await clients.native.postJsonRaw(tier.body),
      },
      {
        name: "ofetch | post | json-convenience",
        run: async () => await clients.ofetch.postJson(tier.body),
      },
      {
        name: "ky | post | json-convenience",
        run: async () => await clients.ky.postJson(tier.body),
      },
      {
        name: "axios | post | body-object",
        run: async () => await clients.axios.postJson(tier.body),
      },
      {
        name: "@better-fetch/fetch | post | body-object",
        run: async () => await clients.betterFetch.postBodyObject(tier.body),
      },
      {
        name: "zap | post | json-convenience",
        run: async () => await clients.zap.primitivePostJson(tier.body),
      },
      {
        name: "native | post | raw-body",
        run: async () => await clients.native.postRawBody(rawBody),
      },
      {
        name: "ofetch | post | raw-body",
        run: async () => await clients.ofetch.postRawBody(rawBody),
      },
      { name: "ky | post | raw-body", run: async () => await clients.ky.postRawBody(rawBody) },
      {
        name: "axios | post | raw-body",
        run: async () => await clients.axios.postRawBody(rawBody),
      },
      {
        name: "@better-fetch/fetch | post | raw-body",
        run: async () => await clients.betterFetch.postRawBody(rawBody),
      },
      {
        name: "zap | post | raw-body",
        run: async () => await clients.zap.primitivePostRawBody(rawBody),
      },
      { name: "ofetch | create-client | defaults", run: clients.ofetch.withDefaultsGetJson },
      { name: "ky | create-client | defaults", run: clients.ky.withDefaultsGetJson },
      { name: "axios | create-client | defaults", run: clients.axios.withDefaultsGetJson },
      {
        name: "@better-fetch/fetch | create-client | defaults",
        run: clients.betterFetch.withDefaultsGetJson,
      },
      { name: "zap | createFetch | defaults", run: clients.zap.createFetchPrimitiveGetJson },
      { name: "zap | schema | api.get", run: clients.zap.apiGetValidated },
      { name: "native | schema | zod-parse", run: clients.zap.schemaOnlyValidate },
    ];

    describe(`tier:${tier.name}`, () => {
      for (const scenario of scenarios) {
        bench(scenario.name, async () => {
          await scenario.run();
        });
      }
    });
  }
});
