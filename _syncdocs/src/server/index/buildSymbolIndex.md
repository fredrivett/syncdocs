---
title: buildSymbolIndex
generated: 2026-02-21T13:51:58.719Z
graphNode: src/server/index.ts:buildSymbolIndex
dependencies:
  - path: src/server/index.ts
    symbol: buildSymbolIndex
    hash: 65d7a1015d99286b6a20b67bf43e1e46f197b43a3808dae3dff4f3db6dc10904
---

# buildSymbolIndex

`function` in `src/server/index.ts:23-64`

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| outputDir | `string` | Yes |  |

**Returns:** `SymbolIndex`

**Calls:**

| Symbol | File | Type |
|---|---|---|
| `findMarkdownFiles` | `src/cli/utils/next-suggestion.ts` | direct-call |
| `extractOverview` | `src/server/index.ts` | direct-call |
| `extractRelatedSymbols` | `src/server/index.ts` | direct-call |

**Called by:**

| Symbol | File | Type |
|---|---|---|
| `startServer` | `src/server/index.ts` | direct-call |
