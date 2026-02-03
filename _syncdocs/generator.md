---
title: Generator
generated: 2026-02-03T10:36:48.475Z
dependencies:
  - path: /Users/fredrivett/code/FR/syncdocs/src/generator/index.ts
    symbol: Generator
    hash: e98e60962f71b5b8839c7dbf0ff44a4e6666651905cd846ddccb07c11516f07c
---
# Generator

The `Generator` class is the core engine for automated technical documentation generation. It orchestrates the entire documentation workflow by extracting TypeScript symbols, generating AI-powered documentation content, and managing output with dependency tracking and change detection.

## Overview

This class combines multiple components to provide a complete documentation generation solution:

- **Symbol Extraction**: Uses `TypeScriptExtractor` to parse TypeScript files and identify documentable symbols
- **AI Generation**: Leverages `AIClient` to generate human-readable documentation content
- **Content Hashing**: Employs `ContentHasher` to track changes and dependencies
- **File Management**: Handles output directory creation, file writing, and frontmatter generation

## Constructor

```typescript
constructor(config: GeneratorConfig)
```

### Parameters

- `config: GeneratorConfig` - Configuration object containing:
  - `apiKey: string` - API key for the AI service
  - `model: string` - AI model identifier to use for generation
  - `style: string` - Documentation style/format preference
  - `outputDir: string` - Target directory for generated documentation files

## Methods

### generate

```typescript
async generate(request: GenerateRequest): Promise<GenerationResult>
```

Generates documentation for a single symbol.

**Parameters:**
- `request: GenerateRequest` - Contains:
  - `symbol: SymbolInfo` - The TypeScript symbol to document
  - `context?: GenerationContext` - Optional context including related symbols and project information
  - `customPrompt?: string` - Optional custom prompt to guide AI generation

**Returns:** `Promise<GenerationResult>` with either:
- `{ success: true, filePath: string }` on successful generation
- `{ success: false, error: string }` on failure

### generateForFile

```typescript
async generateForFile(filePath: string): Promise<GenerationResult[]>
```

Processes an entire TypeScript file and generates documentation for all discovered symbols.

**Parameters:**
- `filePath: string` - Path to the TypeScript file to process

**Returns:** `Promise<GenerationResult[]>` - Array of results, one per symbol found in the file

### getGitCommit

```typescript
async getGitCommit(): Promise<string | undefined>
```

Retrieves the current Git commit hash for dependency tracking purposes.

**Returns:** `Promise<string | undefined>` - The commit hash if in a Git repository, otherwise `undefined`

## Usage Examples

### Basic Documentation Generation

```typescript
const config: GeneratorConfig = {
  apiKey: 'your-api-key',
  model: 'gpt-4',
  style: 'technical',
  outputDir: './docs'
};

const generator = new Generator(config);

// Generate docs for a specific symbol
const result = await generator.generate({
  symbol: {
    name: 'UserService',
    type: 'class',
    filePath: './src/services/user.ts',
    // ... other symbol properties
  }
});

if (result.success) {
  console.log(`Documentation written to: ${result.filePath}`);
} else {
  console.error(`Generation failed: ${result.error}`);
}
```

### Processing Entire Files

```typescript
const generator = new Generator(config);

// Generate documentation for all symbols in a file
const results = await generator.generateForFile('./src/models/user.ts');

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Symbol ${index + 1}: Generated successfully`);
  } else {
    console.error(`Symbol ${index + 1}: ${result.error}`);
  }
});
```

### With Context and Custom Prompts

```typescript
const result = await generator.generate({
  symbol: mySymbol,
  context: {
    projectContext: 'This is a REST API for user management',
    relatedSymbols: [userModelSymbol, authServiceSymbol]
  },
  customPrompt: 'Focus on security considerations and error handling'
});
```

## Output Format

Generated documentation files include:

1. **YAML Frontmatter**: Contains metadata including:
   - `title`: Extracted from content or symbol name
   - `generated`: ISO timestamp of generation
   - `dependencies`: Array of source files and their content hashes

2. **Markdown Content**: AI-generated documentation formatted according to the configured style

## Important Notes

- **Directory Creation**: The generator automatically creates the output directory structure if it doesn't exist
- **Dependency Tracking**: Content hashes are stored in frontmatter to enable change detection and incremental updates
- **Error Handling**: All public methods use result objects instead of throwing exceptions for predictable error handling
- **File Naming**: Symbol names are automatically converted to kebab-case for consistent file naming (e.g., `UserService` → `user-service.md`)
- **Git Integration**: The class can optionally integrate with Git repositories for enhanced dependency tracking

## Edge Cases

- **No Symbols Found**: `generateForFile()` returns a single error result when no documentable symbols are discovered
- **Git Repository Detection**: `getGitCommit()` gracefully handles non-Git directories by returning `undefined`
- **Title Extraction**: Falls back to symbol name if no H1 heading is found in generated content
- **File System Permissions**: File writing operations may fail silently if the process lacks write permissions to the output directory