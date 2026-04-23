---
name: zap-permit-policy-authoring
description: Use @zap-studio/permit in an application. Use when defining authorization resource schemas, Actions, Resources, PermitConfig, createPolicy rules, allow/deny/when helpers, and/or/not conditions, has/hasRole role checks, role hierarchies, mergePolicies, mergePoliciesAny, or type-safe permission strings like "post:read".
---

# Zap Permit Policy Authoring

Use this skill when consuming `@zap-studio/permit`.

## Authoring Workflow

1. Define Standard Schema resource validators.
2. Define actions with `as const satisfies Actions<typeof resources>`.
3. Define an application context type.
4. Use `createPolicy<TContext>({ resources, actions, rules })`.
5. Express rules with `allow`, `deny`, `when`, and condition helpers.
6. Check permissions with typed strings like `"post:read"`.

```ts
import { z } from "zod";
import { allow, createPolicy, deny, when } from "@zap-studio/permit";
import type { Actions, Resources } from "@zap-studio/permit/types";

const resources = {
  post: z.object({
    id: z.string(),
    authorId: z.string(),
    visibility: z.enum(["public", "private"]),
  }),
} satisfies Resources;

const actions = {
  post: ["read", "write", "delete"],
} as const satisfies Actions<typeof resources>;

type AppContext = { user: { id: string; role: "guest" | "admin" } };

const policy = createPolicy<AppContext>({
  resources,
  actions,
  rules: {
    post: {
      read: when((_ctx, _action, post) => post.visibility === "public"),
      write: when((ctx, _action, post) => ctx.user.id === post.authorId),
      delete: deny(),
    },
  },
});

await policy.can({ user: { id: "u1", role: "guest" } }, "post:read", post);
```

## Conditions and Roles

Use condition helpers when rules should stay composable.

```ts
import { and, hasRole, when } from "@zap-studio/permit";

const hierarchy = {
  guest: [],
  user: ["guest"],
  admin: ["user"],
} as const;

const isAdminOrOwner = and(
  hasRole("user", hierarchy),
  (ctx, _action, resource) => ctx.user.id === resource.authorId,
);

rules: {
  post: {
    write: when(isAdminOrOwner),
  },
}
```

## Merge Strategies

- `mergePolicies(...policies)` is deny-overrides: every policy must allow.
- `mergePoliciesAny(...policies)` is allow-overrides: any policy may allow.
- Empty merges deny.

## Gotchas

- Invalid resource validation returns `false`; validation exceptions are logged and denied.
- Missing action, missing rule, malformed permission, and unknown resource all return `false`.
- Rule exceptions are caught, logged, and denied. Keep policy functions pure and deterministic.
- The permission string is exactly `${resource}:${action}`; extra separators return `false`.
- Keep `Resources`, `Actions`, and rules aligned with `satisfies` to preserve inference.

## References

- Package docs: https://zapstudio.dev/packages/permit
- llms.txt: https://zapstudio.dev/llms.txt
- llms-full.txt: https://zapstudio.dev/llms-full.txt
