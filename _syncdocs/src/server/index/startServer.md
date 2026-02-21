---
title: startServer
generated: 2026-02-21T13:51:58.720Z
graphNode: src/server/index.ts:startServer
dependencies:
  - path: src/server/index.ts
    symbol: startServer
    hash: 2745450d26f12744e33ea05982a2d38d04f320cb674556e80a1b44b4b87685ed
---

# startServer

`exported`

`function` in `src/server/index.ts:217-342`

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| outputDir | `string` | Yes |  |
| port | `number` | Yes |  |

**Calls:**

| Symbol | File | Type |
|---|---|---|
| `buildSymbolIndex` | `src/server/index.ts` | direct-call |
| `getTemplate` | `src/server/template.ts` | direct-call |
| `buildIndexResponse` | `src/server/index.ts` | conditional-call |
| `buildDocResponse` | `src/server/index.ts` | conditional-call |

**Called by:**

| Symbol | File | Type |
|---|---|---|
| `registerServeCommand` | `src/cli/commands/serve.ts` | direct-call |

*This symbol is async.*
