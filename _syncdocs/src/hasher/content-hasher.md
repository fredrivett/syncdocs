---
title: ContentHasher
generated: 2026-02-03T11:43:56.761Z
dependencies:
  - path: /Users/fredrivett/code/FR/syncdocs/src/hasher/index.ts
    symbol: ContentHasher
    hash: 6bf2acdd6eadbec3589bf9e03a1b6c71ab4e5a012b8b697514d242981278106f
---
# ContentHasher

The `ContentHasher` class provides content-based hashing functionality for code symbols, designed to detect meaningful changes while ignoring cosmetic modifications like renaming or formatting. It generates stable SHA256 hashes by focusing only on function parameters and body content.

<details>
<summary>Methods</summary>

## `hashSymbol(symbol: SymbolInfo): string`

Generates a SHA256 hash of the symbol's meaningful content (parameters and body), excluding the symbol name to allow renames without triggering staleness detection.

**Parameters:**
- `symbol`: `SymbolInfo` - The symbol object containing the code information to hash

**Returns:** `string` - A hexadecimal SHA256 hash of the normalized content

## `getHashableContent(symbol: SymbolInfo): string`

Extracts and normalizes the content that should be included in the hash calculation. Combines the symbol's parameters and body while excluding name, export keywords, and visibility modifiers.

**Parameters:**
- `symbol`: `SymbolInfo` - The symbol object to extract content from

**Returns:** `string` - The normalized, concatenated parameters and body content

## `hash(content: string): string`

Computes a SHA256 hash of the provided string content.

**Parameters:**
- `content`: `string` - The content to hash

**Returns:** `string` - A hexadecimal SHA256 hash

## `hasChanged(oldSymbol: SymbolInfo, newSymbol: SymbolInfo): boolean`

Compares two symbols by their content hashes to determine if meaningful changes occurred.

**Parameters:**
- `oldSymbol`: `SymbolInfo` - The previous version of the symbol
- `newSymbol`: `SymbolInfo` - The current version of the symbol

**Returns:** `boolean` - `true` if the symbols have different content hashes, `false` otherwise

## `shortHash(hash: string): string`

Creates a shortened version of a hash for display purposes by taking the first 8 characters.

**Parameters:**
- `hash`: `string` - The full hash string to truncate

**Returns:** `string` - The first 8 characters of the hash

## `normalizeWhitespace(content: string): string` (private)

Normalizes whitespace in content to prevent formatting changes from affecting hash values. Handles line endings, tabs, and multiple spaces consistently.

**Parameters:**
- `content`: `string` - The content to normalize

**Returns:** `string` - The content with normalized whitespace

</details>

<details>
<summary>Usage Examples</summary>

```typescript
import { ContentHasher } from './ContentHasher';

const hasher = new ContentHasher();

// Hash a symbol
const symbol: SymbolInfo = {
  name: 'calculateTotal',
  params: '(price: number, tax: number)',
  body: '{ return price + (price * tax); }'
};

const hash = hasher.hashSymbol(symbol);
console.log(hash); // "a1b2c3d4e5f6..."

// Check for changes
const oldSymbol: SymbolInfo = {
  name: 'add',
  params: '(a: number, b: number)',
  body: '{ return a + b; }'
};

const newSymbol: SymbolInfo = {
  name: 'sum', // renamed but same logic
  params: '(a: number, b: number)',
  body: '{ return a + b; }'
};

const changed = hasher.hasChanged(oldSymbol, newSymbol);
console.log(changed); // false - only name changed

// Get short hash for display
const shortHash = hasher.shortHash(hash);
console.log(shortHash); // "a1b2c3d4"
```

</details>

<details>
<summary>Implementation Details</summary>

The `ContentHasher` uses a multi-step process to ensure stable hashing:

1. **Content Extraction**: Only `params` and `body` properties from `SymbolInfo` are included in the hash
2. **Whitespace Normalization**: 
   - Line endings are normalized to `\n`
   - Tabs are converted to 2 spaces
   - Multiple consecutive spaces are collapsed to single spaces
   - Leading and trailing whitespace is trimmed
3. **Hashing**: Uses Node.js's built-in `crypto.createHash('sha256')` for consistent hash generation

This approach allows the system to ignore:
- Symbol name changes (renames)
- Export keyword modifications
- Visibility modifier changes
- Formatting and whitespace variations
- Different line ending styles

</details>

<details>
<summary>Edge Cases</summary>

- **Empty Content**: If both `params` and `body` are empty strings, the hash will be computed on an empty string after normalization
- **Unicode Content**: SHA256 handles Unicode content properly, but ensure consistent encoding across different environments
- **Very Large Content**: No size limits are enforced, but extremely large symbol bodies may impact performance
- **Null/Undefined Properties**: The method assumes `symbol.params` and `symbol.body` are defined strings; undefined values will be coerced to `"undefined"`
- **Identical Normalized Content**: Different original formatting that normalizes to identical content will produce the same hash, which is the intended behavior

</details>

<details>
<summary>Related</summary>

- `SymbolInfo` - The interface/type used for symbol information
- Node.js `crypto` module - Used for SHA256 hash generation
- Hash-based change detection systems
- Content-addressable storage patterns

</details>