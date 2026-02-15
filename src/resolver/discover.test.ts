/**
 * Tests for AI discovery prompt and response parsing
 */

import { describe, expect, it } from 'vitest';
import type { SymbolInfo } from '../extractor/types.js';
import { buildDiscoveryPrompt, parseDiscoveryResponse } from './discover.js';

const testSymbol: SymbolInfo = {
  name: 'classifyUrlTask',
  kind: 'const',
  filePath: 'src/trigger/classify-url.ts',
  params: '',
  body: '{ id: "classify-url", run: async () => { tasks.trigger("analyze-image"); } }',
  fullText:
    'export const classifyUrlTask = task({ id: "classify-url", run: async () => { tasks.trigger("analyze-image"); } });',
  startLine: 1,
  endLine: 5,
};

describe('buildDiscoveryPrompt', () => {
  it('should include the symbol name and kind', () => {
    const prompt = buildDiscoveryPrompt(testSymbol);
    expect(prompt).toContain('classifyUrlTask');
    expect(prompt).toContain('const');
  });

  it('should include the file path', () => {
    const prompt = buildDiscoveryPrompt(testSymbol);
    expect(prompt).toContain('src/trigger/classify-url.ts');
  });

  it('should include the source code', () => {
    const prompt = buildDiscoveryPrompt(testSymbol);
    expect(prompt).toContain(testSymbol.fullText);
  });

  it('should mention runtime dispatch examples', () => {
    const prompt = buildDiscoveryPrompt(testSymbol);
    expect(prompt).toContain('tasks.trigger');
    expect(prompt).toContain('emit(');
    expect(prompt).toContain('fetch(');
  });

  it('should ask for JSON array response', () => {
    const prompt = buildDiscoveryPrompt(testSymbol);
    expect(prompt).toContain('JSON array');
    expect(prompt).toContain('Return [] if no runtime dispatches found');
  });
});

describe('parseDiscoveryResponse', () => {
  it('should parse valid JSON array', () => {
    const response = JSON.stringify([
      { type: 'trigger-task', targetHint: 'analyze-image', reason: 'dispatches via tasks.trigger' },
    ]);
    const result = parseDiscoveryResponse(response);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('trigger-task');
    expect(result[0].targetHint).toBe('analyze-image');
    expect(result[0].reason).toBe('dispatches via tasks.trigger');
  });

  it('should parse JSON wrapped in markdown code fences', () => {
    const response =
      '```json\n[{"type":"trigger-task","targetHint":"analyze-image","reason":"test"}]\n```';
    const result = parseDiscoveryResponse(response);
    expect(result).toHaveLength(1);
    expect(result[0].targetHint).toBe('analyze-image');
  });

  it('should parse JSON wrapped in plain code fences', () => {
    const response =
      '```\n[{"type":"trigger-task","targetHint":"analyze-image","reason":"test"}]\n```';
    const result = parseDiscoveryResponse(response);
    expect(result).toHaveLength(1);
  });

  it('should return empty array for empty JSON array', () => {
    expect(parseDiscoveryResponse('[]')).toEqual([]);
  });

  it('should return empty array for malformed JSON', () => {
    expect(parseDiscoveryResponse('not json at all')).toEqual([]);
  });

  it('should return empty array for non-array JSON', () => {
    expect(parseDiscoveryResponse('{"type":"trigger-task"}')).toEqual([]);
  });

  it('should filter out items missing required fields', () => {
    const response = JSON.stringify([
      { type: 'trigger-task', targetHint: 'analyze-image', reason: 'valid' },
      { type: 'trigger-task', targetHint: 'missing-reason' },
      { type: 'trigger-task', reason: 'missing-targetHint' },
      { targetHint: 'missing-type', reason: 'test' },
    ]);
    const result = parseDiscoveryResponse(response);
    expect(result).toHaveLength(1);
    expect(result[0].targetHint).toBe('analyze-image');
  });

  it('should handle multiple valid connections', () => {
    const response = JSON.stringify([
      { type: 'trigger-task', targetHint: 'analyze-image', reason: 'reason 1' },
      { type: 'trigger-task', targetHint: 'sync-item', reason: 'reason 2' },
      { type: 'api-call', targetHint: '/api/process', reason: 'reason 3' },
    ]);
    const result = parseDiscoveryResponse(response);
    expect(result).toHaveLength(3);
  });

  it('should return empty array for empty string', () => {
    expect(parseDiscoveryResponse('')).toEqual([]);
  });
});
