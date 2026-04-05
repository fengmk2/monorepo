---
"@zap-studio/permit": minor
---

Change `policy.can()` to use a single permission string plus the resource object.

`policy.can(ctx, "read", "post", post)` is replaced by
`policy.can(ctx, "post:read", post)`.

This is a breaking API change in the `0.x` line. Docs and examples now use the
new permission-string format consistently.
