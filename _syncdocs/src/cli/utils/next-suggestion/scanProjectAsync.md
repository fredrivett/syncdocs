---
title: scanProjectAsync
generated: 2026-02-21T13:51:58.713Z
graphNode: src/cli/utils/next-suggestion.ts:scanProjectAsync
dependencies:
  - path: src/cli/utils/next-suggestion.ts
    symbol: scanProjectAsync
    hash: 2d4337759704458555fbb396a463ebd39abb07ee0fa25616d519f28ef7f310d4
---

# scanProjectAsync

`exported`

`function` in `src/cli/utils/next-suggestion.ts:132-206`

Async version of scanProject that yields throughout
so spinner animations stay smooth.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| outputDir | `string` | Yes |  |
| scope | `SyncdocsConfig['scope']` | Yes |  |
| onProgress | `(message: string) => void` | No |  |

**Returns:** `Promise<ProjectScan>`

**Calls:**

| Symbol | File | Type |
|---|---|---|
| `findSourceFilesAsync` | `src/cli/utils/next-suggestion.ts` | direct-call |
| `tick` | `src/cli/utils/next-suggestion.ts` | direct-call |
| `findMarkdownFiles` | `src/cli/utils/next-suggestion.ts` | conditional-call |
| `getRelativePath` | `src/cli/utils/next-suggestion.ts` | direct-call |

**Called by:**

| Symbol | File | Type |
|---|---|---|
| `registerStatusCommand` | `src/cli/commands/status.ts` | direct-call |

*This symbol is async.*
