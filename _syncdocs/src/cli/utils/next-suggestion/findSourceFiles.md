---
title: findSourceFiles
generated: 2026-02-21T13:51:58.714Z
graphNode: src/cli/utils/next-suggestion.ts:findSourceFiles
dependencies:
  - path: src/cli/utils/next-suggestion.ts
    symbol: findSourceFiles
    hash: a53de60c0a3087b5f14e6c23c98d8c634d2b393cf94eaa525222f0772c7d8e38
---

# findSourceFiles

`exported`

`function` in `src/cli/utils/next-suggestion.ts:291-319`

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| rootDir | `string` | Yes |  |
| scope | `SyncdocsConfig['scope']` | Yes |  |

**Returns:** `string[]`

**Calls:**

| Symbol | File | Type |
|---|---|---|
| `walk` | `src/cli/utils/next-suggestion.ts` | direct-call |

**Called by:**

| Symbol | File | Type |
|---|---|---|
| `registerSyncCommand` | `src/cli/commands/sync.ts` | direct-call |
| `scanProject` | `src/cli/utils/next-suggestion.ts` | direct-call |
