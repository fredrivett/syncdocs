# syncdocs

## 0.1.3

### Patch Changes

- 4c633b9: Add conditional branching awareness to call graph edges

  Detect if/else, else-if chains, switch/case, ternary, and &&/|| guards during AST extraction. Conditional calls produce `conditional-call` edges with a `conditions` array capturing the full chain of ancestor conditions. The graph viewer includes a toggle to show/hide conditional detail. Smart deduplication merges unconditional + conditional calls and collapses both-branch calls to unconditional.

- 3d61e7c: Improve CLI setup and sync behavior for real-world project layouts.

  `syncdocs init` now auto-detects common source directories and suggests matching include patterns. `syncdocs sync` now warns clearly when include patterns match zero files. YAML config parsing is more robust for commented include/exclude lists.

- eca2a3a: Fix docs viewer not loading content when clicking tree items
- 4f15a05: Add graph-based flow visualisation with interactive viewer, config scope filtering, and auto-retry server port
- d6a3a25: Enhance graph viewer with snap-to-grid layout, interactive layout settings, node type filtering, bidirectional highlighting, and loading spinner. Fix trigger.dev matcher for TypeScript generics and TypeScript extractor for call expression initializers. Update CLI hints to reference sync command.
- 53e78ea: Change grid size to 8 and snap ceil to 16 so centered items align to the grid
- 8498c3f: Strip quotes from YAML config values to support both quoted and unquoted glob patterns
- 309be65: Complete TSDoc coverage and expand documentation scope

  Add TSDoc comments to all remaining undocumented functions, classes, and constants across the codebase. Include scripts directory in documentation scope to generate docs for utility scripts. Update CLAUDE.md with TSDoc requirements for all new functions and classes.

- 30f4f0e: Unify sidebar across graph and docs views: bring docs into React SPA with react-router, add persistent sidebar navigation, use portal pattern for graph controls, add lucide icons to nav
- 9ce44cf: Update README to reflect static analysis architecture

## 0.1.2

### Patch Changes

- a15e185: Clarify README for end-users vs contributors, add missing command docs, restrict AI provider to Anthropic only

## 0.1.1

### Patch Changes

- 02f1ece: Fix release workflow build failing by separating build and publish steps

## 0.1.0

### Minor Changes

- 924d444: Add AI-powered runtime connection discovery (--discover) and cross-file depth traversal (--depth)

  New --discover flag uses AI to find runtime dispatch connections (e.g. tasks.trigger("task-id")) that static analysis can't see, verifies them against the codebase, and includes them in generated docs with mermaid diagrams. New --depth flag follows function calls across files and generates docs for each callee. Also makes isDocUpToDate check all dependency hashes so docs are correctly flagged stale when any dependency changes.

### Patch Changes

- 0259776: Add changeset infrastructure and version tracking in generated docs
- 441ae47: Enable automatic npm publishing when changesets release PR is merged
- 8c5087d: Fix status command spinner by using async file I/O and yielding during symbol extraction so the loading animation stays smooth
- 9f86a7f: Fix symbol overcounting by excluding dot-directories and common build output directories from source file discovery
- 87f178b: Auto-expand Visual Flow section in serve viewer and show syncdocs version and generated timestamp in doc metadata
