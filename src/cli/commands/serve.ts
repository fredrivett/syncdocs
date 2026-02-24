import { exec } from 'node:child_process';
import * as p from '@clack/prompts';
import type { CAC } from 'cac';
import type { FlowGraph } from '../../graph/types.js';
import { startServer } from '../../server/index.js';
import { loadConfig } from '../utils/config.js';

interface ServeOptions {
  port?: number;
  open?: boolean;
  focus?: string;
}

/**
 * Resolve focus targets to graph node IDs.
 *
 * Each target is matched as an exact node ID first, then as a file path
 * (matching all nodes in that file). Unresolved targets are returned separately.
 *
 * @param targets - Comma-separated focus targets (file:symbol or file)
 * @param graph - The loaded flow graph
 * @returns Resolved node IDs and any unresolved target strings
 */
function resolveFocusTargets(
  targets: string,
  graph: FlowGraph,
): { nodeIds: string[]; unresolved: string[] } {
  const nodeIdSet = new Set(graph.nodes.map((n) => n.id));
  const nodeIds: string[] = [];
  const unresolved: string[] = [];

  for (const target of targets.split(',').map((t) => t.trim()).filter(Boolean)) {
    if (nodeIdSet.has(target)) {
      nodeIds.push(target);
    } else {
      const fileMatches = graph.nodes.filter((n) => n.filePath === target);
      if (fileMatches.length > 0) {
        nodeIds.push(...fileMatches.map((n) => n.id));
      } else {
        unresolved.push(target);
      }
    }
  }

  return { nodeIds, unresolved };
}

/**
 * Register the `syncdocs serve` CLI command.
 *
 * Starts the documentation viewer HTTP server and optionally opens it
 * in the default browser. Supports `--focus` to open with specific
 * symbols or files pre-selected and focused.
 */
export function registerServeCommand(cli: CAC) {
  cli
    .command('serve', 'Start interactive documentation viewer')
    .option('--port <number>', 'Port to run server on (default: 3456)')
    .option('--open', 'Auto-open browser (default: true)')
    .option('--focus <targets>', 'Focus on file:symbol or file targets (comma-separated)')
    .example('syncdocs serve')
    .example('syncdocs serve --port 8080')
    .example('syncdocs serve --focus src/api/users/route.ts:getUserId')
    .action(async (options: ServeOptions) => {
      p.intro('syncdocs viewer');

      const config = loadConfig();
      if (!config) {
        p.cancel('Config not found. Run: syncdocs init');
        process.exit(1);
      }

      const port = options.port ? Number(options.port) : 3456;

      const spinner = p.spinner();
      spinner.start('Building symbol index...');

      try {
        const { url, graph } = await startServer(config.outputDir, port);
        spinner.stop(`Server running at ${url}`);

        // Resolve --focus targets to node IDs and build URL
        let openUrl = url;
        if (options.focus && graph) {
          const { nodeIds, unresolved } = resolveFocusTargets(options.focus, graph);

          if (unresolved.length > 0) {
            p.log.warn(`Could not resolve: ${unresolved.join(', ')}`);
          }

          if (nodeIds.length > 0) {
            const encoded = nodeIds.map(encodeURIComponent).join(',');
            openUrl = `${url}?selected=${encoded}&focused=${encoded}`;
            p.log.info(`Focused on ${nodeIds.length} node${nodeIds.length > 1 ? 's' : ''}`);
          }
        }

        // Auto-open in browser (unless --no-open)
        if (options.open !== false) {
          const openCmd =
            process.platform === 'darwin'
              ? 'open'
              : process.platform === 'win32'
                ? 'start'
                : 'xdg-open';
          exec(`${openCmd} "${openUrl}"`);
        }

        p.log.message('Press Ctrl+C to stop');

        // Keep process alive
        await new Promise(() => {});
      } catch (error) {
        spinner.stop('Failed to start server');
        p.cancel(`Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });
}
