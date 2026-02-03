---
title: ContentHasher
generated: 2026-02-03T10:23:15.630Z
dependencies:
  - path: /Users/fredrivett/code/FR/syncdocs/src/hasher/index.ts
    symbol: ContentHasher
    hash: 072d8482db0529622d5618cdb7a1c285558ff0c72d81ff856b4f936be994eea1
---
# ContentHasher

A utility class for generating stable content hashes of code symbols. The `ContentHasher` class creates SHA256 hashes based on symbol parameters and body content while excluding naming and formatting details that shouldn't trigger content change detection.

## Overview

The `ContentHasher` class is designed to detect meaningful changes in code symbols by hashing their functional content (parameters and body) while ignoring cosmetic changes like renaming, whitespace formatting, and visibility modifiers. This is particularly useful for cache invalidation, change detection, and determining when documentation or analysis needs to be updated.

## Methods

### hashSymbol(symbol: SymbolInfo): string

Generates a SHA256 hash of the symbol's content, excluding the symbol name to allow renames without triggering staleness detection.

**Parameters:**
- `symbol` (SymbolInfo): The symbol object containing `params`, `body`, and other metadata

**Returns:**
- `string`: A 64-character hexadecimal SHA256 hash

### getHashableContent(symbol: SymbolInfo): string

Extracts and normalizes the content that should be included in the hash calculation.

**Parameters:**
- `symbol` (SymbolInfo): The symbol object to extract content from

**Returns:**
- `string`: Normalized content string combining parameters and body

**Content Inclusion:**
- ✅ Parameters
- ✅ Function/method body
- ❌ Symbol name
- ❌ Export keywords
- ❌ Visibility modifiers

### hash(content: string): string

Creates a SHA256 hash of the provided content string.

**Parameters:**
- `content` (string): The content to hash

**Returns:**
- `string`: 64-character hexadecimal SHA256 hash

### hasChanged(oldSymbol: SymbolInfo, newSymbol: SymbolInfo): boolean

Compares two symbols to determine if their functional content has changed.

**Parameters:**
- `oldSymbol` (SymbolInfo): The previous version of the symbol
- `newSymbol` (SymbolInfo): The current version of the symbol

**Returns:**
- `boolean`: `true` if content has changed, `false` if identical

### shortHash(hash: string): string

Returns a shortened version of a hash for display purposes.

**Parameters:**
- `hash` (string): The full hash string

**Returns:**
- `string`: First 8 characters of the hash

## Usage Examples

### Basic Symbol Hashing

```typescript
const hasher = new ContentHasher();
const symbol: SymbolInfo = {
  name: 'calculateTotal',
  params: '(items: Item[], tax: number)',
  body: '{ return items.reduce((sum, item) => sum + item.price, 0) * (1 + tax); }'
};

const hash = hasher.hashSymbol(symbol);
console.log(hash); // "a1b2c3d4e5f6..."
```

### Change Detection

```typescript
const hasher = new ContentHasher();

const originalSymbol: SymbolInfo = {
  name: 'processData',
  params: '(data: string[])',
  body: '{ return data.map(item => item.toUpperCase()); }'
};

// Renamed but same functionality
const renamedSymbol: SymbolInfo = {
  name: 'transformData', // Changed name
  params: '(data: string[])',
  body: '{ return data.map(item => item.toUpperCase()); }'
};

// Modified functionality
const modifiedSymbol: SymbolInfo = {
  name: 'processData',
  params: '(data: string[])',
  body: '{ return data.map(item => item.toLowerCase()); }' // Changed logic
};

console.log(hasher.hasChanged(originalSymbol, renamedSymbol)); // false - rename ignored
console.log(hasher.hasChanged(originalSymbol, modifiedSymbol)); // true - logic changed
```

### Display Hash for Logging

```typescript
const hasher = new ContentHasher();
const fullHash = hasher.hashSymbol(symbol);
const displayHash = hasher.shortHash(fullHash);

console.log(`Symbol hash: ${displayHash}`); // "Symbol hash: a1b2c3d4"
```

## Important Notes

### Whitespace Normalization

The class automatically normalizes whitespace to prevent formatting changes from affecting hash values:

- Line endings are normalized to `\n`
- Tabs are converted to double spaces
- Multiple consecutive spaces are collapsed to single spaces
- Leading and trailing whitespace is removed

### Hash Stability

Hashes remain stable across:
- Symbol renames
- Whitespace and formatting changes
- Comment modifications (if not included in body)
- Export keyword changes

Hashes will change when:
- Parameter types or names change
- Function/method body logic changes
- Parameter order changes

### Dependencies

This class requires Node.js's built-in `crypto` module for SHA256 hashing:

```typescript
import { createHash } from 'crypto';
```