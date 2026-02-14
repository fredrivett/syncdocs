---
title: generateConfigYAML
generated: 2026-02-14T17:53:48.465Z
dependencies:
  - path: src/cli/commands/init.ts
    symbol: generateConfigYAML
    hash: 6a457704ef31619aa77717d6635cd37f766aa44584f2dbebc89ea44e5812b172
---
# generateConfigYAML

Generates a YAML configuration string from an `InitConfig` object for the syncdocs documentation tool. This function creates a formatted YAML configuration file with inline comments and proper indentation for multi-line values.

<details>
<summary>Visual Flow</summary>

```mermaid
flowchart TD
    A[Start: `generateConfigYAML(config)`] --> B[Create YAML header with comments]
    B --> C[Add `output.dir` configuration]
    C --> D[Process `scope.include` array]
    D --> E[Map include paths with indentation]
    E --> F[Process `scope.exclude` array]
    F --> G[Map exclude paths with indentation]
    G --> H[Add `generation.aiProvider` setting]
    H --> I[Process multi-line `generation.prompt`]
    I --> J[Split prompt by newlines]
    J --> K[Indent each line with 4 spaces]
    K --> L[Add `git.includeCommitMessages` boolean]
    L --> M[Add `git.commitDepth` number]
    M --> N[Return complete YAML string]
```

</details>

<details>
<summary>Parameters</summary>

- `config`: `InitConfig` - Configuration object containing all necessary settings for generating the YAML output
  - `config.output.dir`: `string` - Directory path where documentation will be stored
  - `config.scope.include`: `string[]` - Array of file patterns to include in documentation
  - `config.scope.exclude`: `string[]` - Array of file patterns to exclude from documentation
  - `config.generation.aiProvider`: `string` - Name of the AI provider to use for generation
  - `config.generation.prompt`: `string` - Multi-line prompt text for documentation generation
  - `config.git.includeCommitMessages`: `boolean` - Whether to include commit messages in regeneration
  - `config.git.commitDepth`: `number` - Number of commits to analyze for context

</details>

<details>
<summary>Return Value</summary>

Returns a `string` containing the complete YAML configuration with:
- Header comments explaining the configuration purpose
- Properly indented nested structures
- Inline comments for each section
- Multi-line string formatting for the prompt field
- Array formatting for include/exclude patterns

</details>

<details>
<summary>Usage Examples</summary>

```typescript
const config: InitConfig = {
  output: {
    dir: './docs'
  },
  scope: {
    include: ['**/*.ts', '**/*.js'],
    exclude: ['node_modules/**', '**/*.test.ts']
  },
  generation: {
    aiProvider: 'openai',
    prompt: 'Generate comprehensive documentation\nInclude code examples\nFocus on clarity'
  },
  git: {
    includeCommitMessages: true,
    commitDepth: 10
  }
};

const yamlConfig = generateConfigYAML(config);
console.log(yamlConfig);
```

Example output:
```yaml
# syncdocs configuration
# Learn more: https://github.com/fredrivett/syncdocs

output:
  # Where generated documentation will be stored
  dir: ./docs

scope:
  # Files to include in documentation
  include:
    - **/*.ts
    - **/*.js

  # Files to exclude from documentation
  exclude:
    - node_modules/**
    - **/*.test.ts

generation:
  # AI provider to use for generation
  aiProvider: openai

  # How documentation should be written
  prompt: |
    Generate comprehensive documentation
    Include code examples
    Focus on clarity

git:
  # Include commit messages when regenerating docs
  includeCommitMessages: true

  # How many commits back to analyze for context
  commitDepth: 10
```

</details>

<details>
<summary>Implementation Details</summary>

The function uses template literal syntax to construct the YAML string with embedded expressions. Key implementation aspects:

- **Array Processing**: Uses `map()` to transform include/exclude arrays into indented YAML list items
- **Multi-line Handling**: Splits the prompt string by newlines and adds 4-space indentation to each line for proper YAML formatting
- **Template Interpolation**: Direct property access with `${config.property}` for simple values
- **YAML Syntax**: Follows YAML conventions with proper indentation (2 spaces for nesting, 4 spaces for multi-line content)
- **Static Comments**: Includes helpful inline comments to guide users in configuration

The function assumes the `InitConfig` object is well-formed and does not perform validation or error handling.

</details>

<details>
<summary>Edge Cases</summary>

- **Empty Arrays**: If `include` or `exclude` arrays are empty, will generate empty YAML lists
- **Multi-line Prompts**: Handles prompts with various line endings and preserves formatting
- **Special Characters**: Does not escape YAML special characters in values - assumes input is pre-validated
- **Undefined Properties**: Will output `undefined` as string if any required config properties are missing
- **Boolean Conversion**: Relies on JavaScript's string interpolation for boolean values (`true`/`false`)

</details>

<details>
<summary>Related</summary>

- `InitConfig` interface - Defines the structure of the configuration object
- YAML parsing functions that would consume this generated output
- Configuration validation utilities for the syncdocs tool
- File system operations for writing the generated YAML to disk

</details>