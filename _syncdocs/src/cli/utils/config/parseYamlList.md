---
title: parseYamlList
generated: 2026-02-21T13:51:58.712Z
graphNode: src/cli/utils/config.ts:parseYamlList
dependencies:
  - path: src/cli/utils/config.ts
    symbol: parseYamlList
    hash: 558bb140bcf6fc293e19e91a39024669ef9145def14e4da1808983b54fc57379
---

# parseYamlList

`function` in `src/cli/utils/config.ts:28-54`

Parse a YAML list under a given key.
Finds `key:` on its own line, then collects subsequent `- value` lines.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| content | `string` | Yes |  |
| key | `string` | Yes |  |

**Returns:** `string[]`

**Calls:**

| Symbol | File | Type |
|---|---|---|
| `stripQuotes` | `src/cli/utils/config.ts` | conditional-call |

**Called by:**

| Symbol | File | Type |
|---|---|---|
| `loadConfig` | `src/cli/utils/config.ts` | direct-call |
