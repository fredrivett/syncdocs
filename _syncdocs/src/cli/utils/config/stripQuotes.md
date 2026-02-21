---
title: stripQuotes
generated: 2026-02-21T14:17:38.721Z
graphNode: src/cli/utils/config.ts:stripQuotes
dependencies:
  - path: src/cli/utils/config.ts
    symbol: stripQuotes
    hash: f8a587abb15d6654b8ee0c83aafe38cb2fb8ce14f969b8452518b9a9f7a8baf4
---

# stripQuotes

`function` in `src/cli/utils/config.ts:62-73`

Remove surrounding single or double quotes from a string value.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| value | `string` | Yes |  |

**Returns:** `string`

**Called by:**

| Symbol | File | Type |
|---|---|---|
| `loadConfig` | `src/cli/utils/config.ts` | conditional-call |
| `parseYamlList` | `src/cli/utils/config.ts` | conditional-call |
