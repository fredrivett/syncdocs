---
title: getRelativePath
generated: 2026-02-21T13:51:58.714Z
graphNode: src/cli/utils/next-suggestion.ts:getRelativePath
dependencies:
  - path: src/cli/utils/next-suggestion.ts
    symbol: getRelativePath
    hash: 193873a035939aa703afb6b94f8902a31b1a01d3d5d6e3fda779861a12eac62f
---

# getRelativePath

`exported`

`function` in `src/cli/utils/next-suggestion.ts:284-291`

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| absolutePath | `string` | Yes |  |

**Returns:** `string`

**Called by:**

| Symbol | File | Type |
|---|---|---|
| `registerStatusCommand` | `src/cli/commands/status.ts` | conditional-call |
| `computeNextCandidate` | `src/cli/utils/next-suggestion.ts` | direct-call |
| `scanProject` | `src/cli/utils/next-suggestion.ts` | direct-call |
| `scanProjectAsync` | `src/cli/utils/next-suggestion.ts` | direct-call |
| `countImports` | `src/cli/utils/next-suggestion.ts` | conditional-call |
