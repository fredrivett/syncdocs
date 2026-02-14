/**
 * Documentation generator - creates docs using AI
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { toRelativePath } from '../cli/utils/paths.js';
import { TypeScriptExtractor } from '../extractor/index.js';
import type { SymbolInfo } from '../extractor/types.js';
import { ContentHasher } from '../hasher/index.js';
import { AIClient } from './ai-client.js';
import type {
  DocDependency,
  GeneratedDoc,
  GenerateRequest,
  GenerationResult,
  GeneratorConfig,
} from './types.js';

export class Generator {
  private extractor: TypeScriptExtractor;
  private hasher: ContentHasher;
  private aiClient: AIClient;
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
    this.extractor = new TypeScriptExtractor();
    this.hasher = new ContentHasher();
    this.aiClient = new AIClient({
      apiKey: config.apiKey,
      model: config.model,
    });
  }

  /**
   * Generate documentation for a symbol
   */
  async generate(request: GenerateRequest): Promise<GenerationResult> {
    try {
      const doc = await this.generateDoc(request);
      this.writeDoc(doc);

      return {
        success: true,
        filePath: doc.filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate documentation for all symbols in a file
   */
  async generateForFile(filePath: string): Promise<GenerationResult[]> {
    const result = this.extractor.extractSymbols(filePath);

    if (result.symbols.length === 0) {
      return [
        {
          success: false,
          error: `No symbols found in ${filePath}`,
        },
      ];
    }

    const results: GenerationResult[] = [];

    for (const symbol of result.symbols) {
      const result = await this.generate({ symbol });
      results.push(result);
    }

    return results;
  }

  /**
   * Generate doc content and metadata
   */
  private async generateDoc(request: GenerateRequest): Promise<GeneratedDoc> {
    const { symbol, context, customPrompt } = request;

    // Generate documentation content using AI
    const content = await this.aiClient.generateDoc({
      symbol,
      style: this.config.style,
      projectContext: context?.projectContext,
      customPrompt,
    });

    // Create dependency entry with hash (using relative paths for portability)
    const dependencies: DocDependency[] = [
      {
        path: toRelativePath(symbol.filePath),
        symbol: symbol.name,
        hash: this.hasher.hashSymbol(symbol),
      },
    ];

    // Add related symbols as dependencies if provided
    if (context?.relatedSymbols) {
      for (const relatedSymbol of context.relatedSymbols) {
        dependencies.push({
          path: toRelativePath(relatedSymbol.filePath),
          symbol: relatedSymbol.name,
          hash: this.hasher.hashSymbol(relatedSymbol),
        });
      }
    }

    // Generate file path preserving directory structure
    const fileName = this.generateFileName(symbol);
    const filePath = this.generateFilePath(symbol, fileName);

    // Extract title from content or use symbol name
    const title = this.extractTitle(content) || symbol.name;

    return {
      filePath,
      title,
      content,
      dependencies,
    };
  }

  /**
   * Write documentation to file with frontmatter
   */
  private writeDoc(doc: GeneratedDoc): void {
    const frontmatter = this.generateFrontmatter(doc);
    const fullContent = `${frontmatter}\n${doc.content}`;

    // Ensure output directory exists
    const dir = dirname(doc.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(doc.filePath, fullContent, 'utf-8');
  }

  /**
   * Generate YAML frontmatter
   */
  private generateFrontmatter(doc: GeneratedDoc): string {
    const now = new Date().toISOString();

    let frontmatter = '---\n';
    frontmatter += `title: ${doc.title}\n`;
    frontmatter += `generated: ${now}\n`;
    frontmatter += `dependencies:\n`;

    for (const dep of doc.dependencies) {
      frontmatter += `  - path: ${dep.path}\n`;
      frontmatter += `    symbol: ${dep.symbol}\n`;
      frontmatter += `    hash: ${dep.hash}\n`;
      if (dep.asOf) {
        frontmatter += `    asOf: ${dep.asOf}\n`;
      }
    }

    frontmatter += '---';

    return frontmatter;
  }

  /**
   * Generate file path for a symbol, preserving directory structure
   */
  private generateFilePath(symbol: SymbolInfo, fileName: string): string {
    const relativePath = toRelativePath(symbol.filePath);

    // Get directory path (without filename) and source filename without extension
    const dirPath = dirname(relativePath);
    const sourceBaseName = basename(relativePath).replace(/\.[^.]+$/, '');

    // Combine output dir + source dir structure + source file name + doc filename
    return join(this.config.outputDir, dirPath, sourceBaseName, fileName);
  }

  /**
   * Generate file name for a symbol
   */
  private generateFileName(symbol: SymbolInfo): string {
    // Convert symbol name to kebab-case
    const kebabName = symbol.name
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');

    return `${kebabName}.md`;
  }

  /**
   * Extract title from markdown content
   * Looks for first h1 heading
   */
  private extractTitle(content: string): string | null {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : null;
  }

  /**
   * Resolve the call tree for a symbol up to a given depth
   * Returns all discovered callee symbols (not including the root symbol itself)
   */
  resolveCallTree(symbol: SymbolInfo, depth: number, visited?: Set<string>): SymbolInfo[] {
    if (depth <= 0) return [];

    const key = `${symbol.filePath}:${symbol.name}`;
    visited = visited || new Set<string>();
    if (visited.has(key)) return [];
    visited.add(key);

    const callSites = this.extractor.extractCallSites(symbol.filePath, symbol.name);

    // Get all symbols in the same file to match against
    const fileSymbols = this.extractor.extractSymbols(symbol.filePath).symbols;

    const found: SymbolInfo[] = [];

    for (const call of callSites) {
      const match = fileSymbols.find((s) => s.name === call.name);
      if (match && match.name !== symbol.name) {
        const matchKey = `${match.filePath}:${match.name}`;
        if (!visited.has(matchKey)) {
          found.push(match);
          // Recurse with depth - 1
          const deeper = this.resolveCallTree(match, depth - 1, visited);
          found.push(...deeper);
        }
      }
    }

    return found;
  }

  /**
   * Generate documentation with call-tree traversal
   * Generates docs for the target symbol(s) and their callees up to the given depth
   */
  async generateWithDepth(
    filePath: string,
    options: { symbolName?: string; depth?: number; force?: boolean },
  ): Promise<GenerationResult[]> {
    const depth = options.depth ?? 0;
    const force = options.force ?? false;

    // Extract target symbol(s)
    let targetSymbols: SymbolInfo[];
    if (options.symbolName) {
      const symbol = this.extractor.extractSymbol(filePath, options.symbolName);
      if (!symbol) {
        return [{ success: false, error: `Symbol "${options.symbolName}" not found in ${filePath}` }];
      }
      targetSymbols = [symbol];
    } else {
      const result = this.extractor.extractSymbols(filePath);
      if (result.symbols.length === 0) {
        return [{ success: false, error: `No symbols found in ${filePath}` }];
      }
      targetSymbols = result.symbols;
    }

    // Resolve call trees for all target symbols
    const visited = new Set<string>();
    const allCallees: SymbolInfo[] = [];

    for (const symbol of targetSymbols) {
      const callees = this.resolveCallTree(symbol, depth, visited);
      allCallees.push(...callees);
    }

    // Dedupe callees (exclude any that are also target symbols)
    const targetNames = new Set(targetSymbols.map((s) => `${s.filePath}:${s.name}`));
    const uniqueCallees = allCallees.filter((callee, index) => {
      const key = `${callee.filePath}:${callee.name}`;
      if (targetNames.has(key)) return false;
      return allCallees.findIndex((c) => `${c.filePath}:${c.name}` === key) === index;
    });

    const results: GenerationResult[] = [];

    // Generate for target symbols (always generate)
    for (const symbol of targetSymbols) {
      const callees = this.resolveCallTree(symbol, depth);
      const result = await this.generate({
        symbol,
        context: callees.length > 0 ? { relatedSymbols: callees } : undefined,
      });
      results.push(result);
    }

    // Generate for callees (skip if up-to-date unless --force)
    for (const callee of uniqueCallees) {
      if (!force && this.isDocUpToDate(callee)) {
        results.push({
          success: true,
          filePath: this.getDocPath(callee),
          skipped: true,
        });
        continue;
      }

      const result = await this.generate({ symbol: callee });
      results.push(result);
    }

    return results;
  }

  /**
   * Check if an existing doc for a symbol is up-to-date (hash matches)
   */
  private isDocUpToDate(symbol: SymbolInfo): boolean {
    const docPath = this.getDocPath(symbol);
    if (!existsSync(docPath)) return false;

    const content = readFileSync(docPath, 'utf-8');
    const currentHash = this.hasher.hashSymbol(symbol);

    // Check if the frontmatter contains a matching hash for this symbol
    const hashPattern = new RegExp(`symbol: ${symbol.name}\\n\\s+hash: ([a-f0-9]{64})`);
    const match = content.match(hashPattern);

    return match?.[1] === currentHash;
  }

  /**
   * Get the expected doc file path for a symbol
   */
  private getDocPath(symbol: SymbolInfo): string {
    const fileName = this.generateFileName(symbol);
    return this.generateFilePath(symbol, fileName);
  }

  /**
   * Get current git commit hash (if in git repo)
   */
  async getGitCommit(): Promise<string | undefined> {
    try {
      const { execSync } = await import('node:child_process');
      const commit = execSync('git rev-parse HEAD', {
        encoding: 'utf-8',
      }).trim();
      return commit;
    } catch {
      return undefined;
    }
  }
}

export { AIClient } from './ai-client.js';
export * from './types.js';
