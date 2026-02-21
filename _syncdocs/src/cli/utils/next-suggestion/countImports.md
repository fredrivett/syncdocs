---
title: countImports
generated: 2026-02-21T13:51:58.714Z
graphNode: src/cli/utils/next-suggestion.ts:countImports
dependencies:
  - path: src/cli/utils/next-suggestion.ts
    symbol: countImports
    hash: 9bfd59a25e995860a0b8e1dcb7fb22aece46b0fc26a9c3e874e260e835a76282
---

# countImports

`exported`

`function` in `src/cli/utils/next-suggestion.ts:344-371`

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| sourceFiles | `string[]` | Yes |  |

**Returns:** `Map<string, number>`

**Calls:**

| Symbol | File | Type |
|---|---|---|
| `resolveImport` | `src/cli/utils/next-suggestion.ts` | direct-call |
| `getRelativePath` | `src/cli/utils/next-suggestion.ts` | conditional-call |

**Called by:**

| Symbol | File | Type |
|---|---|---|
| `computeNextCandidate` | `src/cli/utils/next-suggestion.ts` | direct-call |
