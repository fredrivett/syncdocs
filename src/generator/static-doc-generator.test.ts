/**
 * Tests for static documentation generator markdown rendering
 */

import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FlowGraph, GraphNode } from '../graph/types.js';
import { StaticDocGenerator } from './static-doc-generator.js';

const TEST_DIR = join(process.cwd(), '.test-tmp-docs');

function makeNode(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id: 'src/test.ts:testFunc',
    name: 'testFunc',
    kind: 'function',
    filePath: 'src/test.ts',
    isAsync: false,
    hash: 'abc123',
    lineRange: [1, 10],
    ...overrides,
  };
}

function makeGraph(nodes: GraphNode[] = [], edges: FlowGraph['edges'] = []): FlowGraph {
  return {
    version: '1.0',
    generatedAt: '2026-01-01T00:00:00.000Z',
    nodes,
    edges,
  };
}

function generateAndRead(node: GraphNode, graph?: FlowGraph): string {
  const generator = new StaticDocGenerator(TEST_DIR);
  const g = graph ?? makeGraph([node]);
  generator.generateForNode(node, g);
  const docPath = join(TEST_DIR, 'src/test/testFunc.md');
  return readFileSync(docPath, 'utf-8');
}

describe('StaticDocGenerator', () => {
  beforeEach(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    try {
      if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
    } catch (_e) {
      // Ignore cleanup errors
    }
  });

  describe('Description rendering', () => {
    it('should render description after kind/location line', () => {
      const node = makeNode({ description: 'Adds two numbers together.' });
      const content = generateAndRead(node);
      expect(content).toContain('Adds two numbers together.');
      // Description should come after the kind+location line
      const kindLine = '`function` in `src/test.ts:1-10`';
      const kindIndex = content.indexOf(kindLine);
      const descIndex = content.indexOf('Adds two numbers together.');
      expect(descIndex).toBeGreaterThan(kindIndex);
    });

    it('should not render description section when undefined', () => {
      const node = makeNode();
      const content = generateAndRead(node);
      // Content between kind/location and end should not contain a freestanding paragraph
      // (description would be a plain text line after the kind line)
      const kindLine = '`function` in `src/test.ts:1-10`';
      const afterKind = content.split(kindLine)[1];
      // There should be no plain-text paragraph after the kind line
      // (only markdown formatting like **Calls:**, *async*, etc. or empty lines)
      const nonEmptyLines = afterKind.split('\n').filter((l) => l.trim() !== '');
      for (const line of nonEmptyLines) {
        // Every non-empty line should be markdown formatting, not a plain description
        const isMarkdown =
          line.startsWith('*') ||
          line.startsWith('|') ||
          line.startsWith('#') ||
          line.startsWith('>') ||
          line.startsWith('`') ||
          line.startsWith('-') ||
          line.startsWith('```');
        expect(isMarkdown || line.trim() === '').toBe(true);
      }
    });
  });

  describe('Export badge rendering', () => {
    it('should render exported badge when isExported is true', () => {
      const node = makeNode({ isExported: true });
      const content = generateAndRead(node);
      expect(content).toContain('`exported`');
    });

    it('should not render exported badge when isExported is false', () => {
      const node = makeNode({ isExported: false });
      const content = generateAndRead(node);
      expect(content).not.toContain('`exported`');
    });

    it('should not render exported badge when isExported is undefined', () => {
      const node = makeNode();
      const content = generateAndRead(node);
      expect(content).not.toContain('`exported`');
    });
  });

  describe('Deprecated notice rendering', () => {
    it('should render deprecated notice without reason', () => {
      const node = makeNode({ deprecated: true });
      const content = generateAndRead(node);
      expect(content).toContain('> **Deprecated**');
    });

    it('should render deprecated notice with reason', () => {
      const node = makeNode({ deprecated: 'Use newFunc instead' });
      const content = generateAndRead(node);
      expect(content).toContain('> **Deprecated**: Use newFunc instead');
    });

    it('should not render deprecated notice when not set', () => {
      const node = makeNode();
      const content = generateAndRead(node);
      expect(content).not.toContain('Deprecated');
    });
  });

  describe('Parameters table rendering', () => {
    it('should render parameters table with all columns', () => {
      const node = makeNode({
        structuredParams: [
          { name: 'name', type: 'string', isOptional: false, isRest: false },
          { name: 'age', type: 'number', isOptional: true, isRest: false },
        ],
      });
      const content = generateAndRead(node);
      expect(content).toContain('**Parameters:**');
      expect(content).toContain('| Name | Type | Required | Description |');
      expect(content).toContain('| name | `string` | Yes |');
      expect(content).toContain('| age | `number` | No |');
    });

    it('should render rest param with ... prefix', () => {
      const node = makeNode({
        structuredParams: [{ name: 'items', type: 'number[]', isOptional: false, isRest: true }],
      });
      const content = generateAndRead(node);
      expect(content).toContain('| ...items | `number[]` | Yes |');
    });

    it('should render default value in description', () => {
      const node = makeNode({
        structuredParams: [
          {
            name: 'currency',
            type: 'string',
            isOptional: true,
            isRest: false,
            defaultValue: "'USD'",
          },
        ],
      });
      const content = generateAndRead(node);
      expect(content).toContain("(default: `'USD'`)");
    });

    it('should render JSDoc description in description column', () => {
      const node = makeNode({
        structuredParams: [
          {
            name: 'name',
            type: 'string',
            isOptional: false,
            isRest: false,
            description: 'The user name',
          },
        ],
      });
      const content = generateAndRead(node);
      expect(content).toContain('The user name');
    });

    it('should not render parameters section when structuredParams is empty', () => {
      const node = makeNode({ structuredParams: [] });
      const content = generateAndRead(node);
      expect(content).not.toContain('**Parameters:**');
    });

    it('should not render parameters section when structuredParams is undefined', () => {
      const node = makeNode();
      const content = generateAndRead(node);
      expect(content).not.toContain('**Parameters:**');
    });
  });

  describe('Return type rendering', () => {
    it('should render return type', () => {
      const node = makeNode({ returnType: 'number' });
      const content = generateAndRead(node);
      expect(content).toContain('**Returns:** `number`');
    });

    it('should not render return type when undefined', () => {
      const node = makeNode();
      const content = generateAndRead(node);
      expect(content).not.toContain('**Returns:**');
    });
  });

  describe('Examples rendering', () => {
    it('should render examples as fenced code blocks', () => {
      const node = makeNode({ examples: ['add(1, 2) // returns 3'] });
      const content = generateAndRead(node);
      expect(content).toContain('**Examples:**');
      expect(content).toContain('```typescript');
      expect(content).toContain('add(1, 2) // returns 3');
      expect(content).toContain('```');
    });

    it('should render multiple examples', () => {
      const node = makeNode({ examples: ['add(1, 2)', 'add(3, 4)'] });
      const content = generateAndRead(node);
      expect(content).toContain('add(1, 2)');
      expect(content).toContain('add(3, 4)');
      // Should have two fenced blocks
      const matches = content.match(/```typescript/g);
      expect(matches).toHaveLength(2);
    });

    it('should not render examples when empty', () => {
      const node = makeNode({ examples: [] });
      const content = generateAndRead(node);
      expect(content).not.toContain('**Examples:**');
    });
  });

  describe('Throws rendering', () => {
    it('should render throws as bullet list', () => {
      const node = makeNode({ throws: ['When input is invalid'] });
      const content = generateAndRead(node);
      expect(content).toContain('**Throws:**');
      expect(content).toContain('- When input is invalid');
    });

    it('should not render throws when empty', () => {
      const node = makeNode({ throws: [] });
      const content = generateAndRead(node);
      expect(content).not.toContain('**Throws:**');
    });
  });

  describe('See also rendering', () => {
    it('should render see as bullet list', () => {
      const node = makeNode({ see: ['otherFunction', 'https://example.com'] });
      const content = generateAndRead(node);
      expect(content).toContain('**See also:**');
      expect(content).toContain('- otherFunction');
      expect(content).toContain('- https://example.com');
    });

    it('should not render see when empty', () => {
      const node = makeNode({ see: [] });
      const content = generateAndRead(node);
      expect(content).not.toContain('**See also:**');
    });
  });

  describe('Backward compatibility', () => {
    it('should produce valid output with no new fields', () => {
      const node = makeNode();
      const content = generateAndRead(node);
      // Should have frontmatter, title, kind+location
      expect(content).toContain('---');
      expect(content).toContain('# testFunc');
      expect(content).toContain('`function` in `src/test.ts:1-10`');
      // Should NOT have any new sections
      expect(content).not.toContain('`exported`');
      expect(content).not.toContain('**Deprecated**');
      expect(content).not.toContain('**Parameters:**');
      expect(content).not.toContain('**Returns:**');
      expect(content).not.toContain('**Examples:**');
      expect(content).not.toContain('**Throws:**');
      expect(content).not.toContain('**See also:**');
    });
  });

  describe('Section ordering', () => {
    it('should render all sections in correct order', () => {
      const node = makeNode({
        isExported: true,
        deprecated: 'Use v2',
        description: 'A test function.',
        structuredParams: [{ name: 'x', type: 'number', isOptional: false, isRest: false }],
        returnType: 'number',
        isAsync: true,
        examples: ['testFunc(1)'],
        throws: ['On error'],
        see: ['otherFunc'],
      });
      const otherNode = makeNode({ id: 'src/test.ts:otherFunc', name: 'otherFunc' });
      const graph = makeGraph(
        [node, otherNode],
        [
          {
            id: 'e1',
            source: node.id,
            target: otherNode.id,
            type: 'direct-call',
            isAsync: false,
          },
        ],
      );

      const generator = new StaticDocGenerator(TEST_DIR);
      generator.generateForNode(node, graph);
      const content = readFileSync(join(TEST_DIR, 'src/test/testFunc.md'), 'utf-8');

      // Verify ordering by finding indices
      const exportedIdx = content.indexOf('`exported`');
      const deprecatedIdx = content.indexOf('> **Deprecated**');
      const kindIdx = content.indexOf('`function` in');
      const descIdx = content.indexOf('A test function.');
      const paramsIdx = content.indexOf('**Parameters:**');
      const returnsIdx = content.indexOf('**Returns:**');
      const callsIdx = content.indexOf('**Calls:**');
      const asyncIdx = content.indexOf('*This symbol is async.*');
      const examplesIdx = content.indexOf('**Examples:**');
      const throwsIdx = content.indexOf('**Throws:**');
      const seeIdx = content.indexOf('**See also:**');

      expect(exportedIdx).toBeLessThan(deprecatedIdx);
      expect(deprecatedIdx).toBeLessThan(kindIdx);
      expect(kindIdx).toBeLessThan(descIdx);
      expect(descIdx).toBeLessThan(paramsIdx);
      expect(paramsIdx).toBeLessThan(returnsIdx);
      expect(returnsIdx).toBeLessThan(callsIdx);
      expect(callsIdx).toBeLessThan(asyncIdx);
      expect(asyncIdx).toBeLessThan(examplesIdx);
      expect(examplesIdx).toBeLessThan(throwsIdx);
      expect(throwsIdx).toBeLessThan(seeIdx);
    });
  });
});
