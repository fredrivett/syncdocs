import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as p from '@clack/prompts';
import type { CAC } from 'cac';
import { GraphBuilder } from '../../graph/graph-builder.js';
import { entryPoints } from '../../graph/graph-query.js';
import { GraphStore } from '../../graph/graph-store.js';
import { findSourceFiles } from '../utils/next-suggestion.js';

export function registerGraphCommand(cli: CAC) {
  cli.command('graph', 'Build the project call graph').action(async () => {
    p.intro('Building call graph');

    try {
      const config = loadConfig();
      if (!config) {
        p.cancel('Config not found. Run: syncdocs init');
        process.exit(1);
      }

      const spinner = p.spinner();
      spinner.start('Finding source files');

      const sourceFiles = findSourceFiles(process.cwd());
      spinner.message(`Analyzing ${sourceFiles.length} files`);

      const builder = new GraphBuilder();
      const graph = builder.build(sourceFiles);

      spinner.message('Writing graph.json');

      const store = new GraphStore(config.outputDir);
      store.write(graph);

      spinner.stop('Graph built');

      // Report stats
      const entries = entryPoints(graph);
      const edgesByType = new Map<string, number>();
      for (const edge of graph.edges) {
        edgesByType.set(edge.type, (edgesByType.get(edge.type) || 0) + 1);
      }

      const stats = [
        `Nodes: ${graph.nodes.length}`,
        `Edges: ${graph.edges.length}`,
        `Entry points: ${entries.length}`,
      ];

      if (edgesByType.size > 0) {
        stats.push('');
        for (const [type, count] of edgesByType) {
          stats.push(`  ${type}: ${count}`);
        }
      }

      if (entries.length > 0) {
        stats.push('');
        stats.push('Entry points:');
        for (const entry of entries) {
          const meta = entry.metadata;
          const detail = meta?.httpMethod
            ? `${meta.httpMethod} ${meta.route || ''}`
            : meta?.eventTrigger || meta?.taskId || '';
          stats.push(`  ${entry.entryType}: ${entry.name}${detail ? ` (${detail})` : ''}`);
        }
      }

      p.log.message(stats.join('\n'));
      p.outro('Graph saved to _syncdocs/graph.json');
    } catch (error) {
      p.cancel(`Failed to build graph: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });
}

function loadConfig(): { outputDir: string } | null {
  const configPath = resolve(process.cwd(), '_syncdocs/config.yaml');

  if (!existsSync(configPath)) {
    return null;
  }

  const content = readFileSync(configPath, 'utf-8');
  const outputDirMatch = content.match(/outputDir:\s*(.+)/);

  return {
    outputDir: outputDirMatch ? outputDirMatch[1].trim() : '_syncdocs',
  };
}
