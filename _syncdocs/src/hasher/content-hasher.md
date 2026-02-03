---
title: ContentHasher
generated: 2026-02-03T11:38:00.149Z
dependencies:
  - path: /Users/fredrivett/code/FR/syncdocs/src/hasher/index.ts
    symbol: ContentHasher
    hash: 6bf2acdd6eadbec3589bf9e03a1b6c71ab4e5a012b8b697514d242981278106f
---
# ContentHasher

A utility class for generating cryptographic hashes of symbol content to detect meaningful changes in code symbols. The hasher focuses on functional content (parameters and body) while ignoring cosmetic changes like names, formatting, and export modifiers to prevent false positives in change detection.

<details>
<summary>Methods</summary>

## hashSymbol(symbol: SymbolInfo): string

Generates a SHA256 hash of the symbol's content, excluding the symbol name to allow renames without triggering staleness detection.

**Parameters:**
- `symbol: SymbolInfo` - The symbol object containing params, body, and other metadata

**Returns:** A hexadecimal string representing the SHA256 hash of the symbol's content.

## getHashableContent(symbol: SymbolInfo): string

Extracts and normalizes the content that should be included in the hash calculation.

**Parameters:**
- `symbol: SymbolInfo` - The symbol object to extract content from

**Returns:** A normalized string containing the symbol's parameters and body with standardized whitespace.

**Includes in hash:**
- Function/method parameters
- Function/method body

**Excludes from hash:**
- Symbol name
- Export keywords
- Visibility modifiers

## hash(content: string): string

Computes a SHA256 hash of the provided content string.

**Parameters:**
- `content: string` - The content to hash

**Returns:** A hexadecimal string representation of the SHA256 hash.

## normalizeWhitespace(content: string): string (private)

Normalizes whitespace in content to prevent formatting changes from affecting the hash.

**Parameters:**
- `content: string` - The content to normalize

**Returns:** A string with normalized whitespace formatting.

**Normalizations applied:**
- Converts `\r\n` to `\n` (normalize line endings)
- Converts tabs to double spaces
- Collapses multiple consecutive spaces to single spaces
- Removes leading and trailing whitespace

## hasChanged(oldSymbol: SymbolInfo, newSymbol: SymbolInfo): boolean

Compares two symbols to determine if their functional content has changed.

**Parameters:**
- `oldSymbol: SymbolInfo` - The previous version of the symbol
- `newSymbol: SymbolInfo` - The current version of the symbol

**Returns:** `true` if the symbols have different content hashes, `false` if they are identical.

## shortHash(hash: string): string

Creates a shortened version of a hash for display purposes.

**Parameters:**
- `hash: string` - The full hash string to shorten

**Returns:** The first 8 characters of the provided hash.

</details>

<details>
<summary>Usage Examples</summary>

```typescript
const hasher = new ContentHasher();

// Hash a symbol
const symbol: SymbolInfo = {
  name: 'calculateTotal',
  params: '(items: Item[], tax: number)',
  body: '{ return items.reduce((sum, item) => sum + item.price, 0) * (1 + tax); }'
};

const hash = hasher.hashSymbol(symbol);
console.log(hash); // "a1b2c3d4e5f6..."

// Check if symbol content changed
const oldSymbol = { ...symbol };
const newSymbol = { 
  ...symbol, 
  name: 'computeTotal' // Name change only
};

console.log(hasher.hasChanged(oldSymbol, newSymbol)); // false - name changes ignored

// Functional change detection
const modifiedSymbol = {
  ...symbol,
  body: '{ return items.reduce((sum, item) => sum + item.price, 0) * (1 + tax + 0.01); }'
};

console.log(hasher.hasChanged(oldSymbol, modifiedSymbol)); // true - body changed

// Get short hash for logging
const shortHash = hasher.shortHash(hash);
console.log(shortHash); // "a1b2c3d4"
```

</details>

<details>
<summary>Implementation Details</summary>

The `ContentHasher` uses SHA256 cryptographic hashing to generate consistent, collision-resistant hashes of symbol content. The implementation prioritizes:

1. **Change Detection Accuracy**: Only hashes functional content (params + body) to avoid false positives from cosmetic changes
2. **Formatting Resilience**: Normalizes whitespace to prevent code formatting from affecting hashes
3. **Rename Tolerance**: Excludes symbol names from hash calculations to allow refactoring without triggering staleness

The whitespace normalization process ensures that code reformatting, different indentation styles, or line ending differences don't create new hashes for functionally identical code.

Hash generation follows this pipeline:
1. Extract parameters and body from symbol
2. Concatenate params and body strings
3. Normalize whitespace in the combined content
4. Generate SHA256 hash of normalized content
5. Return hexadecimal representation

</details>

<details>
<summary>Edge Cases</summary>

- **Empty Content**: Symbols with empty params and body will hash to the same value
- **Whitespace-Only Changes**: Formatting changes (spaces, tabs, line endings) are normalized and won't affect the hash
- **Unicode Content**: The hasher properly handles Unicode characters in symbol content
- **Large Content**: No size limits imposed, but very large symbol bodies may impact performance
- **Null/Undefined Fields**: If `symbol.params` or `symbol.body` are undefined, they will be converted to "undefined" strings in the hash

</details>

<details>
<summary>Related</summary>

- `SymbolInfo` - The interface/type that defines the structure of symbols being hashed
- Node.js `crypto.createHash()` - The underlying cryptographic function used for SHA256 hashing
- Change detection systems that use content hashing for cache invalidation
- Code analysis tools that need to track meaningful changes in source code

</details>