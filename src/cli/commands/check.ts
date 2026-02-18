import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as p from '@clack/prompts';
import type { CAC } from 'cac';
import { StaleChecker } from '../../checker/index.js';

export function registerCheckCommand(cli: CAC) {
  cli.command('check', 'Check if docs are stale').action(async () => {
    p.intro('Check Documentation');

    try {
      // Load config
      const config = loadConfig();
      if (!config) {
        p.cancel('Config not found. Run: syncdocs init');
        process.exit(1);
      }

      const docsDir = resolve(process.cwd(), config.outputDir);

      if (!existsSync(docsDir)) {
        p.cancel(`Docs directory not found: ${config.outputDir}`);
        process.exit(1);
      }

      // Check for stale docs
      const spinner = p.spinner();
      spinner.start('Scanning documentation files');

      const checker = new StaleChecker();
      const result = checker.checkDocs(docsDir);

      spinner.stop(`Scanned ${result.totalDocs} document${result.totalDocs === 1 ? '' : 's'}`);

      // Display errors if any
      if (result.errors.length > 0) {
        p.log.error('Errors encountered:');
        p.log.message(result.errors.join('\n'));
      }

      // Display results
      if (result.staleDocs.length === 0) {
        p.log.success(`All ${result.totalDocs} documents are up to date!`);
      } else {
        p.log.warn(
          `Found ${result.staleDocs.length} stale document${result.staleDocs.length === 1 ? '' : 's'}:`,
        );

        const lines: string[] = [];
        for (const staleDoc of result.staleDocs) {
          lines.push(`  ${getRelativePath(staleDoc.docPath)}`);
          for (const dep of staleDoc.staleDependencies) {
            const reason = formatStaleReason(dep.reason);
            lines.push(`   ${reason} ${dep.path}:${dep.symbol}`);
            if (dep.reason === 'changed') {
              lines.push(`     old: ${dep.oldHash.substring(0, 8)}`);
              lines.push(`     new: ${dep.newHash.substring(0, 8)}`);
            }
          }
        }
        p.log.message(lines.join('\n'));

        p.log.message('Run syncdocs sync to regenerate stale docs.');
      }

      p.outro(
        result.staleDocs.length === 0
          ? 'Documentation is fresh!'
          : `${result.staleDocs.length} stale doc${result.staleDocs.length === 1 ? '' : 's'} found`,
      );

      // Exit with error code if stale docs found
      if (result.staleDocs.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      p.cancel(
        `Failed to check documentation: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exit(1);
    }
  });
}

function formatStaleReason(reason: 'changed' | 'not-found' | 'file-not-found'): string {
  switch (reason) {
    case 'changed':
      return 'changed';
    case 'not-found':
      return 'missing';
    case 'file-not-found':
      return 'file deleted';
  }
}

function getRelativePath(absolutePath: string): string {
  const cwd = process.cwd();
  return absolutePath.startsWith(cwd) ? absolutePath.substring(cwd.length + 1) : absolutePath;
}

function loadConfig(): { outputDir: string } | null {
  const configPath = resolve(process.cwd(), '_syncdocs/config.yaml');

  if (!existsSync(configPath)) {
    return null;
  }

  const content = readFileSync(configPath, 'utf-8');
  const dirMatch = content.match(/dir:\s*(.+)/);

  return {
    outputDir: dirMatch ? dirMatch[1].trim() : '_syncdocs',
  };
}
