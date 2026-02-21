---
title: registerInitCommand
generated: 2026-02-21T14:13:44.220Z
graphNode: src/cli/commands/init.ts:registerInitCommand
dependencies:
  - path: src/cli/commands/init.ts
    symbol: registerInitCommand
    hash: 387d2390ee339b3c4e661c3c2381fbaf2a5d2c82d1e2d963b579665440f6530e
---

# registerInitCommand

`exported`

`function` in `src/cli/commands/init.ts:15-118`

Register the `syncdocs init` CLI command.

Runs an interactive setup wizard that prompts for output directory,
include/exclude patterns, and writes a `config.yaml` file.

**Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| cli | `CAC` | Yes |  |

**Calls:**

| Symbol | File | Type |
|---|---|---|
| `generateConfigYAML` | `src/cli/commands/init.ts` | direct-call |
