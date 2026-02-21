---
title: registerCheckCommand
generated: 2026-02-21T13:51:58.711Z
graphNode: src/cli/commands/check.ts:registerCheckCommand
dependencies:
  - path: src/cli/commands/check.ts
    symbol: registerCheckCommand
    hash: 02537eebcd3d17c8111f45f843ca596236ec94c27effc4f52c56042d78459f2b
---

# registerCheckCommand

`exported`

`function` in `src/cli/commands/check.ts:6-84`

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| cli | `CAC` | Yes |  |

**Calls:**

| Symbol | File | Type |
|---|---|---|
| `loadConfig` | `src/cli/utils/config.ts` | direct-call |
| `getRelativePath` | `src/cli/commands/check.ts` | conditional-call |
| `formatStaleReason` | `src/cli/commands/check.ts` | conditional-call |
