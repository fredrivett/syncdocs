# syncdocs

Docs that automatically sync with your code.

syncdocs generates AI-powered documentation for TypeScript/JavaScript symbols and keeps it in sync with your codebase. When code changes, docs get flagged as stale and can be regenerated automatically.

Documentation lives in your repo (in `_syncdocs/` by default), tracks dependencies via content hashes, and includes visual flow diagrams using mermaid.

## Setup

```bash
npm install
cp .env.example .env  # add your ANTHROPIC_API_KEY
```

## Commands

### `syncdocs init`

Initialize syncdocs in your project. Creates a `_syncdocs/config.yaml` with your preferred output directory, file scope, AI provider, and documentation style.

### `syncdocs generate <file> [--style <type>]`

Generate documentation for a specific file or symbol.

```bash
syncdocs generate src/utils.ts              # all symbols in file
syncdocs generate src/utils.ts:myFunction   # single symbol
syncdocs generate src/utils.ts --style beginner-friendly
```

### `syncdocs regenerate`

Regenerate all existing documentation. Scans the output directory for docs, re-extracts symbols from source, and regenerates content via AI.

```bash
syncdocs regenerate
```

### `syncdocs check [--fix]`

Check for stale documentation. Compares current code hashes against stored doc hashes and reports any that are out of sync. Returns exit code 1 if stale docs are found (CI-friendly).

```bash
syncdocs check        # report stale docs
syncdocs check --fix  # auto-regenerate stale docs
```

### `syncdocs status`

Show the current state of documentation coverage.

### `syncdocs validate`

Validate documentation files for structural correctness.

## How it works

1. **Extract** - The TypeScript compiler API parses source files and extracts symbols (functions, classes, arrow functions)
2. **Hash** - Symbol content (params + body) is SHA256 hashed, ignoring names and formatting so renames don't trigger staleness
3. **Generate** - Claude generates markdown documentation with collapsible sections and mermaid flow diagrams
4. **Track** - Each doc file includes YAML frontmatter with dependency hashes linking it to source symbols
5. **Check** - Compare stored hashes against current code to detect when docs are out of sync

## Configuration

`_syncdocs/config.yaml`:

```yaml
output:
  dir: _syncdocs

scope:
  include:
    - src/**/*.{ts,tsx,js,jsx}
  exclude:
    - **/*.test.ts
    - node_modules/**

generation:
  aiProvider: anthropic
  prompt: |
    Document for senior engineers joining the team.
    Focus on why decisions were made, not just what the code does.

git:
  includeCommitMessages: true
  commitDepth: 10
```

## Development

```bash
npm run dev          # watch mode
npm run build        # build to dist/
npm test             # run tests
npm run format       # format with biome
```
