---
title: Generator
generated: 2026-02-03T10:28:25.933Z
dependencies:
  - path: /Users/fredrivett/code/FR/syncdocs/src/generator/index.ts
    symbol: Generator
    hash: 2aeeb2950c242662c97c71d6f3b627853b495e21d933d3422c780de3a2e3256b
---
# Generator

The `Generator` class is the core orchestrator for AI-powered TypeScript documentation generation. It coordinates symbol extraction, content hashing, AI content generation, and file output to produce comprehensive markdown documentation with dependency tracking.

## Overview

This class provides both individual symbol documentation generation and batch processing capabilities for entire files. It automatically generates markdown files with YAML frontmatter containing metadata about dependencies and generation timestamps, enabling incremental updates and change tracking.

## Constructor

### `new Generator(config: GeneratorConfig)`

Creates a new Generator instance with the specified configuration.

**Parameters:**
- `config: GeneratorConfig` - Configuration object containing:
  - `apiKey: string` - API key for the AI service
  - `model: string` - AI model identifier to use for generation
  - `outputDir: string` - Directory path for generated documentation files
  - `style: string` - Documentation style preference

**Example:**
```typescript
const generator = new Generator({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  outputDir: './docs',
  style: 'technical'
});
```

## Methods

### `generate(request: GenerateRequest): Promise<GenerationResult>`

Generates documentation for a single symbol with optional context and customization.

**Parameters:**
- `request: GenerateRequest` - Generation request containing:
  - `symbol: SymbolInfo` - The TypeScript symbol to document
  - `context?: { projectContext?: string, relatedSymbols?: SymbolInfo[] }` - Optional contextual information
  - `customPrompt?: string` - Optional custom prompt for AI generation

**Returns:**
- `Promise<GenerationResult>` - Result object with:
  - `success: boolean` - Whether generation succeeded
  - `filePath?: string` - Path to generated file (on success)
  - `error?: string` - Error message (on failure)

**Example:**
```typescript
const result = await generator.generate({
  symbol: extractedSymbol,
  context: {
    projectContext: 'REST API documentation system',
    relatedSymbols: [userModel, authService]
  }
});

if (result.success) {
  console.log(`Documentation written to ${result.filePath}`);
} else {
  console.error(`Generation failed: ${result.error}`);
}
```

### `generateForFile(filePath: string): Promise<GenerationResult[]>`

Processes all exportable symbols in a TypeScript file and generates documentation for each.

**Parameters:**
- `filePath: string` - Path to the TypeScript file to process

**Returns:**
- `Promise<GenerationResult[]>` - Array of generation results, one per symbol found

**Example:**
```typescript
const results = await generator.generateForFile('./src/models/user.ts');
const successful = results.filter(r => r.success).length;
console.log(`Generated docs for ${successful}/${results.length} symbols`);
```

### `getGitCommit(): Promise<string | undefined>`

Retrieves the current Git commit hash for dependency tracking purposes.

**Returns:**
- `Promise<string | undefined>` - The current commit SHA, or undefined if not in a Git repository

## File Output Format

Generated documentation files include:

1. **YAML Frontmatter** containing:
   - `title` - Extracted from content or symbol name
   - `generated` - ISO timestamp of generation
   - `dependencies` - Array of source dependencies with content hashes

2. **Markdown Content** - AI-generated documentation formatted according to the specified style

**Example Output:**
```markdown
---
title: UserService
generated: 2024-01-15T10:30:00.000Z
dependencies:
  - path: src/services/user.ts
    symbol: UserService
    hash: abc123def456
---

# UserService

A service class for managing user operations...
```

## File Naming Convention

Generated files use kebab-case naming derived from symbol names:
- `UserService` → `user-service.md`
- `APIClient` → `api-client.md`
- `validateEmail` → `validate-email.md`

## Error Handling

The class implements comprehensive error handling:
- Network failures during AI generation
- File system errors during output
- Missing or invalid symbols
- Git repository access issues

All errors are captured and returned in `GenerationResult` objects rather than throwing exceptions, enabling graceful batch processing.

## Dependencies

This class integrates with several internal components:
- `TypeScriptExtractor` - For parsing TypeScript source files
- `ContentHasher` - For generating content-based hashes
- `AIClient` - For interfacing with AI documentation services

The generated documentation includes dependency tracking to enable incremental regeneration when source code changes.