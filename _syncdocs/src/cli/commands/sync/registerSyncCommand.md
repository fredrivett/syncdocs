---
title: registerSyncCommand
generated: 2026-02-21T14:29:22.443Z
graphNode: src/cli/commands/sync.ts:registerSyncCommand
dependencies:
  - path: src/cli/commands/sync.ts
    symbol: registerSyncCommand
    hash: 0b4c6589b32724fb59d642e1339d4761873875b8efb2020bdc9fd9ee99b5a731
---

# registerSyncCommand

`exported`

`function` in `src/cli/commands/sync.ts:9-127`

Register the `syncdocs sync` CLI command.

Finds source files, builds the dependency graph, and generates static
markdown documentation for every node. Optionally filters to a target path.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| cli | `CAC` | Yes |  |

**Calls:**

| Symbol | File | Type |
|---|---|---|
| `loadConfig` | `src/cli/utils/config.ts` | direct-call |
| `findSourceFiles` | `src/cli/utils/next-suggestion.ts` | direct-call |
| `entryPoints` | `src/graph/graph-query.ts` | direct-call |
