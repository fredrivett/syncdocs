---
title: ContentHasher
generated: 2026-02-03T11:35:00.655Z
dependencies:
  - path: /Users/fredrivett/code/FR/syncdocs/src/hasher/index.ts
    symbol: ContentHasher
    hash: 6bf2acdd6eadbec3589bf9e03a1b6c71ab4e5a012b8b697514d242981278106f
---
# ContentHasher

The `ContentHasher` class provides content-based hashing functionality for code symbols, enabling change detection while ignoring formatting differences and symbol renames. It generates SHA256 hashes of symbol parameters and body content, with whitespace normalization to prevent spurious change detection from code formatting.

<details>
<summary>Methods</summary>

## hashSymbol(symbol: SymbolInfo): string

Generates a hash of the symbol's content, excluding the symbol name to allow renames without triggering staleness detection.

**Parameters:**
- `symbol: SymbolInfo` - The symbol to hash

**Returns:** A SHA256 hash string (64 hexadecimal characters)

## getHashableContent(symbol: SymbolInfo): string

Extracts and normalizes the content that should be included in the hash calculation. Combines symbol parameters and body while excluding name, export keywords, and visibility modifiers.

**Parameters:**
- `symbol: SymbolInfo` - The symbol to extract content from

**Returns:** Normalized string containing parameters and body content

## hash(content: string): string

Generates a SHA256 hash of the provided content string.

**Parameters:**
- `content: string` - The content to hash

**Returns:** SHA256 hash as a hexadecimal string

## hasChanged(oldSymbol: SymbolInfo, newSymbol: SymbolInfo): boolean

Compares two symbols to determine if their content has changed by comparing their hashes.

**Parameters:**
- `oldSymbol: SymbolInfo` - The previous version of the symbol
- `newSymbol: SymbolInfo` - The current version of the symbol

**Returns:** `true` if the content has changed, `false` otherwise

## shortHash(hash: string): string

Creates a shortened version of a hash for display purposes.

**Parameters:**
- `hash: string` - The full hash string

**Returns:** The first 8 characters of the hash

</details>

<details>
<summary>Usage Examples</summary>

```typescript
const hasher = new ContentHasher();

// Hash a symbol
const symbol: SymbolInfo = {
  name: 'myFunction',
  params: '(x: number, y: string)',
  body: '{ return x + y.length; }'
};

const hash = hasher.hashSymbol(symbol);
console.log(hash); // "a1b2c3d4e5f6..."

// Check if symbols have changed
const oldSymbol = { name: 'func', params: '(a: number)', body: '{ return a * 2; }' };
const newSymbol = { name: 'renamedFunc', params: '(a: number)', body: '{ return a * 2; }' };

const changed = hasher.hasChanged(oldSymbol, newSymbol);
console.log(changed); // false (only name changed, content is same)

// Get short hash for display
const fullHash = hasher.hashSymbol(symbol);
const short = hasher.shortHash(fullHash);
console.log(short); // "a1b2c3d4"

// Direct content hashing
const content = hasher.getHashableContent(symbol);
const directHash = hasher.hash(content);
```

</details>

<details>
<summary>Implementation Details</summary>

The class implements a content-focused hashing strategy with the following key features:

- **Whitespace Normalization**: The `normalizeWhitespace` method standardizes formatting by:
  - Converting CRLF line endings to LF
  - Converting tabs to 2 spaces
  - Collapsing multiple consecutive spaces to single spaces
  - Trimming leading and trailing whitespace

- **Content Selection**: Only symbol parameters and body are included in the hash, deliberately excluding:
  - Symbol names (to allow renames)
  - Export keywords
  - Visibility modifiers (public, private, protected)

- **Hash Algorithm**: Uses Node.js's built-in `crypto.createHash` with SHA256 for cryptographically secure hashing.

- **Deterministic Output**: The normalization process ensures consistent hashes regardless of code formatting variations.

</details>

<details>
<summary>Edge Cases</summary>

- **Empty Content**: Symbols with empty parameters and body will produce a hash of an empty string after normalization
- **Whitespace-Only Changes**: Formatting changes (indentation, spacing, line breaks) will not affect the hash due to normalization
- **Unicode Content**: The hasher handles Unicode characters in symbol content correctly
- **Large Content**: No size limits are imposed, but extremely large symbol bodies may impact performance
- **Hash Collisions**: While theoretically possible with SHA256, collisions are cryptographically unlikely in practice

</details>

<details>
<summary>Related</summary>

- `SymbolInfo` interface - The input type containing symbol metadata
- `crypto.createHash` - Node.js crypto module used for hashing
- Change detection systems that track code modifications
- Code analysis tools that need to identify meaningful changes vs. formatting changes

</details>