import { bench, describe } from "vite-plus/test";

import { createClientSet } from "./ecosystem/create-client-set.js";
import { payloadTiers } from "./ecosystem/data.js";

type Scenario = {
  name: string;
  run: () => Promise<unknown>;
};

describe("@zap-studio/fetch | core | api", () => {
  for (const tier of payloadTiers) {
    const clients = createClientSet(tier.response);
    const rawBody = JSON.stringify(tier.body);
    const scenarios: Scenario[] = [
      { name: "zap | primitive | get | raw-response-json", run: clients.zap.primitiveGetJson },
      {
        name: "zap | primitive | post | json-convenience",
        run: async () => await clients.zap.primitivePostJson(tier.body),
      },
      {
        name: "zap | primitive | post | raw-body",
        run: async () => await clients.zap.primitivePostRawBody(rawBody),
      },
      { name: "zap | api-method | get | schema", run: clients.zap.apiGetValidated },
      {
        name: "zap | api-method | post | json-convenience+schema",
        run: async () => await clients.zap.apiPostJsonValidated(tier.body),
      },
      {
        name: "zap | createFetch | api.get | defaults+schema",
        run: clients.zap.createFetchApiGetValidated,
      },
      {
        name: "zap | createFetch | primitive | defaults+raw-response-json",
        run: clients.zap.createFetchPrimitiveGetJson,
      },
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
