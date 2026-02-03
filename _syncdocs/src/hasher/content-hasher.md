---
title: ContentHasher
generated: 2026-02-03T11:05:55.034Z
dependencies:
  - path: /Users/fredrivett/code/FR/syncdocs/src/hasher/index.ts
    symbol: ContentHasher
    hash: 6bf2acdd6eadbec3589bf9e03a1b6c71ab4e5a012b8b697514d242981278106f
---
# ContentHasher

A utility class for generating content-based hashes of code symbols to detect meaningful changes while ignoring cosmetic modifications like renames and formatting.

## Overview

The `ContentHasher` class provides functionality to hash the meaningful content of code symbols (functions, methods, classes, etc.) by focusing on their parameters and implementation while excluding elements like names, export keywords, and visibility modifiers. This approach allows the system to detect actual code changes without triggering false positives from refactoring operations like renaming or code formatting.

## Methods

### hashSymbol(symbol: SymbolInfo): string

Generates a SHA256 hash of the symbol's meaningful content.

**Parameters:**
- `symbol` (SymbolInfo) - The symbol object containing code information

**Returns:**
- `string` - A hexadecimal SHA256 hash representing the symbol's content

**Example:**
```typescript
const hasher = new ContentHasher();
const symbol = { 
  name: 'calculateTotal', 
  params: 'price: number, tax: number', 
  body: '{ return price + (price * tax); }' 
};
const hash = hasher.hashSymbol(symbol);
// Returns: "a1b2c3d4e5f6..."
```

### getHashableContent(symbol: SymbolInfo): string

Extracts and normalizes the content that should be included in the hash calculation.

**Parameters:**
- `symbol` (SymbolInfo) - The symbol object to process

**Returns:**
- `string` - Normalized content string combining parameters and body

**Includes:**
- Function/method parameters
- Function/method body

**Excludes:**
- Symbol name
- Export keywords
- Visibility modifiers

### hash(content: string): string

Generates a SHA256 hash of the provided content string.

**Parameters:**
- `content` (string) - The content to hash

**Returns:**
- `string` - Hexadecimal SHA256 hash

### hasChanged(oldSymbol: SymbolInfo, newSymbol: SymbolInfo): boolean

Compares two symbols to determine if their meaningful content has changed.

**Parameters:**
- `oldSymbol` (SymbolInfo) - The previous version of the symbol
- `newSymbol` (SymbolInfo) - The current version of the symbol

**Returns:**
- `boolean` - `true` if content has changed, `false` otherwise

**Example:**
```typescript
const hasher = new ContentHasher();
const oldSymbol = { name: 'add', params: 'a, b', body: '{ return a + b; }' };
const newSymbol = { name: 'sum', params: 'a, b', body: '{ return a + b; }' };

// Returns false - only name changed, content is identical
const changed = hasher.hasChanged(oldSymbol, newSymbol);
```

### shortHash(hash: string): string

Creates a shortened version of a hash for display purposes.

**Parameters:**
- `hash` (string) - The full hash string

**Returns:**
- `string` - First 8 characters of the hash

## Private Methods

### normalizeWhitespace(content: string): string

Normalizes whitespace in content to prevent formatting changes from affecting hash values.

**Normalization rules:**
- Converts Windows line endings (`\r\n`) to Unix (`\n`)
- Converts tabs to double spaces
- Collapses multiple consecutive spaces to single spaces
- Removes leading and trailing whitespace

## Usage Examples

### Basic Symbol Hashing
```typescript
const hasher = new ContentHasher();
const symbol = {
  name: 'processData',
  params: 'data: any[], options?: ProcessOptions',
  body: '{ return data.map(item => transform(item, options)); }'
};

const contentHash = hasher.hashSymbol(symbol);
const displayHash = hasher.shortHash(contentHash);
console.log(`Symbol hash: ${displayHash}`);
```

### Change Detection
```typescript
const hasher = new ContentHasher();

// Original implementation
const original = {
  name: 'validate',
  params: 'input: string',
  body: '{ return input.length > 0; }'
};

// After renaming (no meaningful change)
const renamed = {
  name: 'validateInput',
  params: 'input: string', 
  body: '{ return input.length > 0; }'
};

// After logic change
const modified = {
  name: 'validate',
  params: 'input: string',
  body: '{ return input.length > 5; }'
};

console.log(hasher.hasChanged(original, renamed));  // false
console.log(hasher.hasChanged(original, modified)); // true
```

## Important Notes

- The class relies on the `crypto` module's `createHash` function for SHA256 generation
- Whitespace normalization prevents formatting tools from causing false change detection
- Symbol names and access modifiers are intentionally excluded to support refactoring operations
- The `SymbolInfo` type must contain at least `params` and `body` properties
- Hash comparison is case-sensitive after normalization

## Dependencies

- Node.js `crypto` module (specifically `createHash`)