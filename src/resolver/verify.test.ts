/**
 * Tests for connection verification
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TypeScriptExtractor } from '../extractor/index.js';
import {
  findTaskDefinition,
  findTypeScriptFiles,
  resolveTaskSymbol,
  verifyConnection,
} from './verify.js';

// Create a real temp directory for filesystem tests
let tempDir: string;

beforeEach(() => {
  tempDir = join(tmpdir(), `syncdocs-test-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

function writeFile(relativePath: string, content: string) {
  const fullPath = join(tempDir, relativePath);
  mkdirSync(join(fullPath, '..'), { recursive: true });
  writeFileSync(fullPath, content, 'utf-8');
  return fullPath;
}

describe('findTypeScriptFiles', () => {
  it('should find .ts files', () => {
    writeFile('src/index.ts', 'export const a = 1;');
    writeFile('src/utils.ts', 'export const b = 2;');

    const files = findTypeScriptFiles(tempDir);
    expect(files).toHaveLength(2);
    expect(files.some((f) => f.endsWith('index.ts'))).toBe(true);
    expect(files.some((f) => f.endsWith('utils.ts'))).toBe(true);
  });

  it('should find .tsx files', () => {
    writeFile('src/App.tsx', 'export default function App() {}');

    const files = findTypeScriptFiles(tempDir);
    expect(files).toHaveLength(1);
    expect(files[0]).toContain('App.tsx');
  });

  it('should skip node_modules', () => {
    writeFile('src/index.ts', 'export const a = 1;');
    writeFile('node_modules/lib/index.ts', 'export const b = 2;');

    const files = findTypeScriptFiles(tempDir);
    expect(files).toHaveLength(1);
    expect(files[0]).toContain('src');
  });

  it('should skip dist directory', () => {
    writeFile('src/index.ts', 'export const a = 1;');
    writeFile('dist/index.ts', 'export const b = 2;');

    const files = findTypeScriptFiles(tempDir);
    expect(files).toHaveLength(1);
  });

  it('should return empty array for empty directory', () => {
    const files = findTypeScriptFiles(tempDir);
    expect(files).toEqual([]);
  });
});

describe('findTaskDefinition', () => {
  it('should find a task by its id with double quotes', () => {
    const file = writeFile(
      'src/trigger/analyze.ts',
      'export const analyzeTask = task({ id: "analyze-image", run: async () => {} });',
    );

    const result = findTaskDefinition('analyze-image', [file]);
    expect(result).toBe(file);
  });

  it('should find a task by its id with single quotes', () => {
    const file = writeFile(
      'src/trigger/sync.ts',
      "export const syncTask = task({ id: 'sync-item', run: async () => {} });",
    );

    const result = findTaskDefinition('sync-item', [file]);
    expect(result).toBe(file);
  });

  it('should return null when task id not found', () => {
    const file = writeFile(
      'src/trigger/analyze.ts',
      'export const analyzeTask = task({ id: "analyze-image", run: async () => {} });',
    );

    const result = findTaskDefinition('nonexistent-task', [file]);
    expect(result).toBeNull();
  });

  it('should handle special regex characters in task id', () => {
    const file = writeFile(
      'src/trigger/test.ts',
      'export const testTask = task({ id: "test.task", run: async () => {} });',
    );

    const result = findTaskDefinition('test.task', [file]);
    expect(result).toBe(file);
  });

  it('should not match substring ids due to closing quote', () => {
    const file = writeFile(
      'src/trigger/analyze.ts',
      'export const analyzeTask = task({ id: "analyze-image-full", run: async () => {} });',
    );

    // "analyze-image" should NOT match "analyze-image-full" because the regex
    // requires a closing quote immediately after the task id
    const result = findTaskDefinition('analyze-image', [file]);
    expect(result).toBeNull();
  });
});

describe('resolveTaskSymbol', () => {
  it('should find the symbol containing the task id', () => {
    // Real Trigger.dev-style task definition (call expression)
    const file = writeFile(
      'src/trigger/analyze.ts',
      `export const analyzeTask = task({
  id: "analyze-image",
  run: async (payload: { url: string }) => {
    const result = processImage(payload.url);
    return result;
  },
});`,
    );

    const extractor = new TypeScriptExtractor();
    const symbol = resolveTaskSymbol(file, 'analyze-image', extractor);

    expect(symbol).not.toBeNull();
    expect(symbol!.name).toBe('analyzeTask');
  });

  it('should return null when no symbol contains the task id', () => {
    const file = writeFile(
      'src/trigger/other.ts',
      'export const otherFunc = (x: number) => { return x * 2; };',
    );

    const extractor = new TypeScriptExtractor();
    const symbol = resolveTaskSymbol(file, 'analyze-image', extractor);

    expect(symbol).toBeNull();
  });
});

describe('verifyConnection', () => {
  it('should verify trigger-task connections', () => {
    // Real Trigger.dev-style task definition (call expression)
    const file = writeFile(
      'src/trigger/analyze.ts',
      `export const analyzeTask = task({
  id: "analyze-image",
  run: async (payload: { url: string }) => {
    const result = processImage(payload.url);
    return result;
  },
});`,
    );

    const extractor = new TypeScriptExtractor();
    const result = verifyConnection(
      { type: 'trigger-task', targetHint: 'analyze-image', reason: 'test' },
      [file],
      extractor,
    );

    expect(result.verified).toBe(true);
    if (result.verified) {
      expect(result.targetSymbol.name).toBe('analyzeTask');
      expect(result.targetFilePath).toBe(file);
    }
  });

  it('should return unverified with reason for unknown connection types', () => {
    const file = writeFile('src/index.ts', 'export function handler() {}');

    const extractor = new TypeScriptExtractor();
    const result = verifyConnection(
      { type: 'websocket-message', targetHint: 'some-event', reason: 'test' },
      [file],
      extractor,
    );

    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.reason).toContain('unknown connection type');
    }
  });

  it('should return unverified with reason when trigger-task target not found', () => {
    const file = writeFile('src/index.ts', 'export function handler() {}');

    const extractor = new TypeScriptExtractor();
    const result = verifyConnection(
      { type: 'trigger-task', targetHint: 'nonexistent-task', reason: 'test' },
      [file],
      extractor,
    );

    expect(result.verified).toBe(false);
    if (!result.verified) {
      expect(result.reason).toContain('no file defines id');
    }
  });
});
