---
title: Generator
generated: 2026-02-03T11:37:36.000Z
dependencies:
  - path: /Users/fredrivett/code/FR/syncdocs/src/generator/index.ts
    symbol: Generator
    hash: 87c5819f181b9be8cf3d5c58f916cb907990b08e99c0286e598def9f3b04082f
---
# Generator

A comprehensive documentation generator that extracts TypeScript symbols and uses AI to create markdown documentation. This class orchestrates the entire documentation generation workflow, from symbol extraction through AI-powered content creation to file output with dependency tracking.

<details>
<summary>Parameters</summary>

**Constructor Parameters:**

- `config: GeneratorConfig` - Configuration object containing:
  - `apiKey: string` - API key for the AI service
  - `model: string` - AI model identifier to use for generation
  - `outputDir: string` - Directory path where documentation files will be written
  - `style: string` - Documentation style preference passed to the AI

</details>

<details>
<summary>Methods</summary>

### `generate(request: GenerateRequest): Promise<GenerationResult>`

Generates documentation for a single symbol with error handling and result wrapping.

**Parameters:**
- `request: GenerateRequest` - Contains symbol information, optional context, and custom prompts

**Returns:** `Promise<GenerationResult>` - Success/failure result with file path or error message

### `generateForFile(filePath: string): Promise<GenerationResult[]>`

Extracts all symbols from a TypeScript file and generates documentation for each one.

**Parameters:**
- `filePath: string` - Path to the TypeScript file to process

**Returns:** `Promise<GenerationResult[]>` - Array of generation results, one per symbol found

### `getGitCommit(): Promise<string | undefined>`

Retrieves the current Git commit hash for versioning purposes.

**Returns:** `Promise<string | undefined>` - Git commit hash if available, undefined if not in a Git repository

</details>

<details>
<summary>Usage Examples</summary>

```typescript
// Basic usage with configuration
const config: GeneratorConfig = {
  apiKey: 'your-api-key',
  model: 'gpt-4',
  outputDir: './docs',
  style: 'technical'
};

const generator = new Generator(config);

// Generate documentation for a single symbol
const result = await generator.generate({
  symbol: symbolInfo,
  context: {
    projectContext: 'This is a REST API service',
    relatedSymbols: [relatedSymbol1, relatedSymbol2]
  },
  customPrompt: 'Focus on security considerations'
});

if (result.success) {
  console.log(`Documentation written to ${result.filePath}`);
} else {
  console.error(`Generation failed: ${result.error}`);
}
```

```typescript
// Generate documentation for all symbols in a file
const results = await generator.generateForFile('./src/api/users.ts');

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Symbol ${index + 1}: ${result.filePath}`);
  } else {
    console.error(`Symbol ${index + 1} failed: ${result.error}`);
  }
});
```

```typescript
// Batch processing multiple files
const files = ['./src/models/', './src/services/', './src/controllers/'];
const allResults: GenerationResult[] = [];

for (const file of files) {
  const results = await generator.generateForFile(file);
  allResults.push(...results);
}

const successful = allResults.filter(r => r.success).length;
console.log(`Generated ${successful}/${allResults.length} documentation files`);
```

</details>

<details>
<summary>Implementation Details</summary>

The `Generator` class coordinates four main components:

1. **TypeScriptExtractor**: Parses TypeScript files to extract symbol information including types, signatures, and metadata
2. **ContentHasher**: Creates content hashes for dependency tracking and change detection
3. **AIClient**: Interfaces with AI services to generate human-readable documentation content
4. **File System Operations**: Handles directory creation and file writing with YAML frontmatter

**Documentation Generation Flow:**
1. Symbol extraction from TypeScript source
2. AI-powered content generation with context and style preferences
3. Dependency hash calculation for related symbols
4. File path generation preserving source directory structure
5. YAML frontmatter creation with metadata and dependencies
6. File system output with automatic directory creation

**File Naming Convention:**
- Symbol names converted to kebab-case (e.g., `UserService` → `user-service.md`)
- Output files preserve source directory structure under the configured output directory
- All generated files use `.md` extension

**Dependency Tracking:**
- Each generated document includes dependency metadata in YAML frontmatter
- Dependencies include file paths, symbol names, and content hashes
- Related symbols specified in context are automatically tracked as dependencies

</details>

<details>
<summary>Edge Cases</summary>

**File System Issues:**
- Automatically creates missing output directories recursively
- Handles file paths on different operating systems through Node.js path utilities
- Overwrites existing documentation files without warning

**Symbol Extraction Failures:**
- Returns error result when no symbols found in target file
- Continues processing other symbols if one fails during batch generation
- Gracefully handles TypeScript parsing errors through the extractor

**AI Generation Failures:**
- Wraps all AI client errors in result objects rather than throwing
- Converts non-Error exceptions to string messages for consistent error handling
- Does not retry failed generations automatically

**Git Integration:**
- Git commit retrieval fails silently if not in a Git repository
- Handles cases where Git is not installed or accessible
- Does not block documentation generation if Git operations fail

**Content Parsing:**
- Falls back to symbol name if title extraction from content fails
- Handles markdown content without h1 headings gracefully
- Does not validate or sanitize AI-generated content before writing

</details>

<details>
<summary>Related</summary>

- `TypeScriptExtractor` - Symbol extraction from TypeScript files
- `ContentHasher` - Content hashing for dependency tracking  
- `AIClient` - AI service integration for content generation
- `GeneratorConfig` - Configuration interface for generator setup
- `GenerateRequest` - Request structure for single symbol generation
- `GenerationResult` - Result wrapper for generation operations
- `SymbolInfo` - TypeScript symbol metadata structure
- `GeneratedDoc` - Internal document representation with metadata

</details>