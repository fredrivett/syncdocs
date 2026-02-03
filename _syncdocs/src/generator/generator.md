---
title: Generator
generated: 2026-02-03T11:35:25.515Z
dependencies:
  - path: /Users/fredrivett/code/FR/syncdocs/src/generator/index.ts
    symbol: Generator
    hash: 87c5819f181b9be8cf3d5c58f916cb907990b08e99c0286e598def9f3b04082f
---
# Generator

The Generator class is the main orchestrator for AI-powered documentation generation in TypeScript projects. It coordinates symbol extraction, content hashing, AI-powered documentation generation, and file output with dependency tracking and frontmatter metadata.

<details>
<summary>Parameters</summary>

**Constructor Parameters:**
- `config` (GeneratorConfig) - Configuration object containing API settings and generation options
  - `apiKey` - API key for the AI service
  - `model` - AI model to use for generation
  - `style` - Documentation style preference
  - `outputDir` - Directory where generated documentation will be written

</details>

<details>
<summary>Methods</summary>

**`generate(request: GenerateRequest): Promise<GenerationResult>`**
Generates documentation for a single symbol. Handles the complete generation pipeline including AI content generation, dependency tracking, and file output.

**`generateForFile(filePath: string): Promise<GenerationResult[]>`**
Extracts all symbols from a TypeScript file and generates documentation for each one. Returns an array of generation results.

**`generateDoc(request: GenerateRequest): Promise<GeneratedDoc>` (private)**
Core documentation generation logic. Coordinates AI content generation, dependency resolution, and file path creation.

**`writeDoc(doc: GeneratedDoc): void` (private)**
Writes the generated documentation to disk with YAML frontmatter containing metadata and dependencies.

**`generateFrontmatter(doc: GeneratedDoc): string` (private)**
Creates YAML frontmatter with title, generation timestamp, and dependency information.

**`generateFilePath(symbol: SymbolInfo, fileName: string): string` (private)**
Creates the output file path while preserving the source directory structure relative to the project root.

**`generateFileName(symbol: SymbolInfo): string` (private)**
Converts symbol names to kebab-case markdown filenames (e.g., `MyClass` becomes `my-class.md`).

**`extractTitle(content: string): string | null` (private)**
Parses generated markdown content to extract the title from the first h1 heading.

**`getGitCommit(): Promise<string | undefined>`**
Retrieves the current git commit hash for dependency tracking. Returns undefined if not in a git repository or if git is unavailable.

</details>

<details>
<summary>Usage Examples</summary>

**Basic symbol generation:**
```typescript
const generator = new Generator({
  apiKey: 'your-api-key',
  model: 'gpt-4',
  style: 'technical',
  outputDir: './docs'
});

const result = await generator.generate({
  symbol: symbolInfo
});

if (result.success) {
  console.log(`Documentation written to: ${result.filePath}`);
} else {
  console.error(`Generation failed: ${result.error}`);
}
```

**Generate for entire file:**
```typescript
const results = await generator.generateForFile('./src/utils/helper.ts');

for (const result of results) {
  if (result.success) {
    console.log(`Generated: ${result.filePath}`);
  } else {
    console.error(`Failed: ${result.error}`);
  }
}
```

**With context and custom prompt:**
```typescript
const result = await generator.generate({
  symbol: symbolInfo,
  context: {
    projectContext: 'This is a utility library for data processing',
    relatedSymbols: [relatedSymbol1, relatedSymbol2]
  },
  customPrompt: 'Focus on performance considerations and usage patterns'
});
```

</details>

<details>
<summary>Implementation Details</summary>

The Generator class uses a dependency injection pattern, creating instances of TypeScriptExtractor, ContentHasher, and AIClient during construction. The generation pipeline follows these steps:

1. **Symbol Processing**: Extracts or receives symbol information
2. **AI Generation**: Sends symbol data and context to AI service for content generation
3. **Dependency Tracking**: Creates hash-based dependency entries for change detection
4. **File Path Resolution**: Preserves source directory structure in output paths
5. **Content Assembly**: Combines generated content with YAML frontmatter
6. **File Output**: Ensures directory structure exists and writes final documentation

The class maintains separation of concerns by delegating specific tasks to specialized components while orchestrating the overall workflow. Error handling is centralized in the main `generate` method, providing consistent result structures.

</details>

<details>
<summary>Edge Cases</summary>

**Empty symbol extraction:**
- When `generateForFile` finds no extractable symbols, returns a single failure result rather than an empty array

**File system operations:**
- Automatically creates missing directory structures using `mkdirSync` with recursive option
- Handles both absolute and relative file paths when calculating output locations

**Git integration:**
- Gracefully handles non-git repositories and missing git executable by returning undefined

**Title extraction:**
- Falls back to symbol name if no h1 heading is found in generated content
- Uses regex matching to find the first h1 heading in markdown

**Path normalization:**
- Strips current working directory from absolute paths to create relative paths
- Handles both Windows and Unix path separators through Node.js path utilities

</details>

<details>
<summary>Related</summary>

- `TypeScriptExtractor` - Extracts symbol information from TypeScript files
- `ContentHasher` - Creates hashes for dependency change detection  
- `AIClient` - Handles communication with AI services for content generation
- `GeneratorConfig` - Configuration interface for generator settings
- `GenerateRequest` - Request structure for single symbol generation
- `GenerationResult` - Result structure indicating success/failure with details
- `SymbolInfo` - TypeScript symbol metadata structure

</details>