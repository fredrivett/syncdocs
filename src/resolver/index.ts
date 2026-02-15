/**
 * Connection resolver — orchestrates AI discovery and verification
 */

import type { SymbolInfo } from '../extractor/types.js';
import type { TypeScriptExtractor } from '../extractor/typescript-extractor.js';
import type { AIClient } from '../generator/ai-client.js';
import { discoverConnections } from './discover.js';
import type { VerifiedConnection } from './types.js';
import { findTypeScriptFiles, type VerifyResult, verifyConnection } from './verify.js';

export type { DiscoveredConnection, VerifiedConnection } from './types.js';

export class ConnectionResolver {
  private aiClient: AIClient;
  private extractor: TypeScriptExtractor;

  constructor(aiClient: AIClient, extractor: TypeScriptExtractor) {
    this.aiClient = aiClient;
    this.extractor = extractor;
  }

  /**
   * Discover and verify runtime connections for a set of symbols.
   * Only runs AI discovery on the provided symbols (root targets), not their callees.
   */
  async resolveConnections(options: {
    symbols: SymbolInfo[];
    projectRoot: string;
    onProgress?: (message: string, type?: 'info' | 'detail' | 'progress') => void;
  }): Promise<VerifiedConnection[]> {
    const { symbols, projectRoot, onProgress } = options;
    const progress = onProgress ?? (() => {});

    // Build the file list once for verification
    progress('Scanning project for task definitions...');
    const tsFiles = findTypeScriptFiles(projectRoot);
    progress(`Scanned ${tsFiles.length} TypeScript files`, 'info');

    const allVerified: VerifiedConnection[] = [];
    const seenTargets = new Set<string>();

    for (const symbol of symbols) {
      progress(`Discovering runtime connections in ${symbol.name}...`);

      const connections = await discoverConnections(this.aiClient, symbol);

      if (connections.length === 0) {
        progress(`No runtime connections found in ${symbol.name}`, 'info');
        continue;
      }

      progress(`AI found ${connections.length} potential connection(s) in ${symbol.name}`, 'info');
      for (const c of connections) {
        progress(`"${c.targetHint}" (${c.type}) — ${c.reason}`, 'detail');
      }

      let verified = 0;
      const discardReasons: string[] = [];
      for (const connection of connections) {
        const result = verifyConnection(connection, tsFiles, this.extractor);
        if (result.verified) {
          const key = `${result.targetSymbol.filePath}:${result.targetSymbol.name}`;
          if (!seenTargets.has(key)) {
            seenTargets.add(key);
            allVerified.push({ ...result, sourceSymbol: symbol });
            verified++;
          }
        } else {
          discardReasons.push(
            `  "${connection.targetHint}" (${connection.type}): ${result.reason}`,
          );
        }
      }

      if (discardReasons.length > 0) {
        progress(
          `Discarded ${discardReasons.length} unverified connection(s) from ${symbol.name}`,
          'info',
        );
        for (const reason of discardReasons) {
          progress(reason, 'detail');
        }
      }
    }

    if (allVerified.length > 0) {
      const names = allVerified.map((v) => v.targetSymbol.name).join(', ');
      progress(`Verified ${allVerified.length} runtime connection(s): ${names}`, 'info');
    }

    return allVerified;
  }
}
