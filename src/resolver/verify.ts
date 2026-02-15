/**
 * Verify AI-discovered connections against the actual codebase
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { TypeScriptExtractor } from '../extractor/typescript-extractor.js';
import type { SymbolInfo } from '../extractor/types.js';
import type { DiscoveredConnection, VerifiedConnection } from './types.js';

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.next', 'build', 'coverage', '.turbo']);

/**
 * Recursively find all .ts/.tsx files in a directory.
 * Skips node_modules, dist, .git, and other non-source directories.
 */
export function findTypeScriptFiles(rootDir: string): string[] {
  const results: string[] = [];

  function walk(dir: string) {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
          results.push(fullPath);
        }
      } catch {
        continue;
      }
    }
  }

  walk(resolve(rootDir));
  return results;
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Search for a task definition by its string ID.
 * Looks for patterns like: id: "task-id" or id: 'task-id'
 */
export function findTaskDefinition(taskId: string, tsFiles: string[]): string | null {
  const pattern = new RegExp(`id:\\s*["']${escapeRegex(taskId)}["']`);

  for (const filePath of tsFiles) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      if (pattern.test(content)) {
        return filePath;
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Resolve the specific symbol from a file that contains the task definition.
 * Finds the symbol whose fullText contains the task id pattern.
 */
export function resolveTaskSymbol(
  filePath: string,
  taskId: string,
  extractor: TypeScriptExtractor,
): SymbolInfo | null {
  const symbols = extractor.extractSymbols(filePath).symbols;
  const pattern = new RegExp(`id:\\s*["']${escapeRegex(taskId)}["']`);
  return symbols.find((s) => pattern.test(s.fullText)) || null;
}

/**
 * Verify a single discovered connection against the codebase.
 * Dispatches to type-specific verifiers. Returns null if unverified.
 */
export type VerifyResult =
  | { verified: true; connection: DiscoveredConnection; targetSymbol: SymbolInfo; targetFilePath: string }
  | { verified: false; connection: DiscoveredConnection; reason: string };

const TASK_DISPATCH_TYPES = new Set([
  'trigger-task',
  'task-dispatch',
  'task-trigger',
  'trigger-dev-task',
  'queue-dispatch',
]);

export function verifyConnection(
  connection: DiscoveredConnection,
  tsFiles: string[],
  extractor: TypeScriptExtractor,
): VerifyResult {
  const normalizedType = connection.type.toLowerCase().replace(/_/g, '-');

  if (TASK_DISPATCH_TYPES.has(normalizedType)) {
    const targetFile = findTaskDefinition(connection.targetHint, tsFiles);
    if (!targetFile) {
      return { verified: false, connection, reason: `no file defines id "${connection.targetHint}"` };
    }

    const targetSymbol = resolveTaskSymbol(targetFile, connection.targetHint, extractor);
    if (!targetSymbol) {
      return { verified: false, connection, reason: `found id "${connection.targetHint}" in ${targetFile} but could not extract symbol` };
    }

    return {
      verified: true,
      connection,
      targetSymbol,
      targetFilePath: targetFile,
    };
  }

  // Unknown connection type — no verifier available
  return { verified: false, connection, reason: `unknown connection type "${connection.type}"` };
}
