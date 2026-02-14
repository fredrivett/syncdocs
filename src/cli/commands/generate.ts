import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as p from '@clack/prompts';
import type { CAC } from 'cac';
import { TypeScriptExtractor } from '../../extractor/index.js';
import { Generator } from '../../generator/index.js';

interface GenerateOptions {
  style?: 'technical' | 'beginner-friendly' | 'comprehensive';
  depth?: number;
  force?: boolean;
}

export function registerGenerateCommand(cli: CAC) {
  cli
    .command('generate <target>', 'Generate documentation for a file or symbol')
    .option('--style <type>', 'Documentation style (technical, beginner-friendly, comprehensive)')
    .option('--depth <n>', 'Recursion depth for call-tree traversal (default: 0)')
    .option('--force', 'Regenerate docs even if they already exist and are up-to-date')
    .example('syncdocs generate src/utils.ts')
    .example('syncdocs generate src/utils.ts:myFunction')
    .example('syncdocs generate src/utils.ts --depth 1')
    .action(async (target: string, options: GenerateOptions) => {
      p.intro('📚 Generate Documentation');

      try {
        // Parse target (file or file:symbol)
        const [filePath, symbolName] = target.split(':');
        const resolvedPath = resolve(process.cwd(), filePath);

        // Validate file exists
        if (!existsSync(resolvedPath)) {
          p.cancel(`File not found: ${filePath}`);
          process.exit(1);
        }

        // Load config
        const config = loadConfig();
        if (!config) {
          p.cancel('Config not found. Run: syncdocs init');
          process.exit(1);
        }

        // Validate API key
        if (!process.env.ANTHROPIC_API_KEY) {
          p.cancel('ANTHROPIC_API_KEY not set. Add it to your .env file or export it.');
          process.exit(1);
        }

        // Create generator
        const generator = new Generator({
          apiKey: process.env.ANTHROPIC_API_KEY,
          outputDir: config.outputDir,
          style: options.style || config.style,
          model: config.model,
        });

        const depth = options.depth ? Number(options.depth) : 0;

        // Use depth-aware generation when --depth is provided
        if (depth > 0) {
          await generateWithDepth(generator, resolvedPath, filePath, symbolName, depth, options.force ?? false);
        } else if (symbolName) {
          await generateSymbol(generator, resolvedPath, symbolName, filePath);
        } else {
          await generateFile(generator, resolvedPath, filePath);
        }

        p.outro('✨ Documentation generated successfully!');
      } catch (error) {
        p.cancel(
          `Failed to generate documentation: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });
}

async function generateSymbol(
  generator: Generator,
  filePath: string,
  symbolName: string,
  displayPath: string,
) {
  const spinner = p.spinner();
  spinner.start(`Extracting ${symbolName} from ${displayPath}`);

  // Extract the specific symbol
  const extractor = new TypeScriptExtractor();
  const symbol = extractor.extractSymbol(filePath, symbolName);

  if (!symbol) {
    spinner.stop(`Symbol "${symbolName}" not found in ${displayPath}`);
    process.exit(1);
  }

  spinner.message(`Generating documentation for ${symbolName}`);

  // Generate documentation
  const result = await generator.generate({ symbol });

  if (!result.success) {
    spinner.stop(`Failed: ${result.error}`);
    process.exit(1);
  }

  spinner.stop(`Generated: ${result.filePath}`);
}

async function generateFile(generator: Generator, filePath: string, displayPath: string) {
  const spinner = p.spinner();
  spinner.start(`Extracting symbols from ${displayPath}`);

  // Extract all symbols
  const extractor = new TypeScriptExtractor();
  const extractResult = extractor.extractSymbols(filePath);

  if (extractResult.symbols.length === 0) {
    spinner.stop(`No symbols found in ${displayPath}`);
    process.exit(1);
  }

  const symbolCount = extractResult.symbols.length;
  spinner.message(
    `Found ${symbolCount} symbol${symbolCount === 1 ? '' : 's'}: ${extractResult.symbols.map((s) => s.name).join(', ')}`,
  );

  // Generate docs for each symbol
  let completed = 0;
  const results: string[] = [];

  for (const symbol of extractResult.symbols) {
    completed++;
    spinner.message(`[${completed}/${symbolCount}] Generating documentation for ${symbol.name}`);

    const result = await generator.generate({ symbol });

    if (result.success) {
      results.push(`  ✓ ${symbol.name} → ${result.filePath}`);
    } else {
      results.push(`  ✗ ${symbol.name}: ${result.error}`);
    }
  }

  spinner.stop(`Generated ${completed} document${completed === 1 ? '' : 's'}`);

  // Show results
  console.log('');
  for (const result of results) {
    console.log(result);
  }
}

async function generateWithDepth(
  generator: Generator,
  filePath: string,
  displayPath: string,
  symbolName: string | undefined,
  depth: number,
  force: boolean,
) {
  const spinner = p.spinner();
  spinner.start(`Extracting symbols from ${displayPath} (depth: ${depth})`);

  const results = await generator.generateWithDepth(filePath, {
    symbolName,
    depth,
    force,
    onProgress: (msg) => spinner.message(msg),
  });

  const generated = results.filter((r) => r.success && !r.skipped);
  const skipped = results.filter((r) => r.skipped);
  const failed = results.filter((r) => !r.success);

  spinner.stop(`Generated ${generated.length} document${generated.length === 1 ? '' : 's'}${skipped.length > 0 ? `, skipped ${skipped.length} up-to-date` : ''}`);

  // Show results
  console.log('');
  for (const result of results) {
    if (result.skipped) {
      console.log(`  ⊘ ${result.filePath} (up-to-date)`);
    } else if (result.success) {
      console.log(`  ✓ ${result.filePath}`);
    } else {
      console.log(`  ✗ ${result.error}`);
    }
  }

  if (failed.length > 0) {
    process.exit(1);
  }
}

function loadConfig(): {
  outputDir: string;
  style?: 'technical' | 'beginner-friendly' | 'comprehensive';
  model?: string;
} | null {
  const configPath = resolve(process.cwd(), '_syncdocs/config.yaml');

  if (!existsSync(configPath)) {
    return null;
  }

  const content = readFileSync(configPath, 'utf-8');

  // Simple YAML parser for our config
  const outputDirMatch = content.match(/outputDir:\s*(.+)/);
  const styleMatch = content.match(/style:\s*(.+)/);
  const modelMatch = content.match(/model:\s*(.+)/);

  return {
    outputDir: outputDirMatch ? outputDirMatch[1].trim() : '_syncdocs',
    style: styleMatch ? (styleMatch[1].trim() as any) : undefined,
    model: modelMatch ? modelMatch[1].trim() : undefined,
  };
}
