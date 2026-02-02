#!/usr/bin/env node
import { cac } from "cac";
import * as p from "@clack/prompts";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

//#region package.json
var version = "0.0.1";

//#endregion
//#region src/cli/commands/init.ts
function registerInitCommand(cli) {
	cli.command("init", "Initialize syncdocs in your project").action(async () => {
		console.clear();
		p.intro("✨ Welcome to syncdocs");
		const configPath = join(process.cwd(), "_syncdocs", "config.yaml");
		if (existsSync(configPath)) {
			const shouldOverwrite = await p.confirm({
				message: "syncdocs is already initialized. Overwrite?",
				initialValue: false
			});
			if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
				p.cancel("Setup cancelled");
				process.exit(0);
			}
		}
		const outputDir = await p.text({
			message: "Where should docs be generated?",
			placeholder: "_syncdocs",
			initialValue: "_syncdocs",
			validate: (value) => {
				if (!value) return "Output directory is required";
			}
		});
		if (p.isCancel(outputDir)) {
			p.cancel("Setup cancelled");
			process.exit(0);
		}
		const includePattern = await p.text({
			message: "Which files should be documented?",
			placeholder: "src/**/*.ts",
			initialValue: "src/**/*.ts"
		});
		if (p.isCancel(includePattern)) {
			p.cancel("Setup cancelled");
			process.exit(0);
		}
		const excludePattern = await p.text({
			message: "Which files should be excluded?",
			placeholder: "**/*.test.ts,**/*.spec.ts",
			initialValue: "**/*.test.ts,**/*.spec.ts"
		});
		if (p.isCancel(excludePattern)) {
			p.cancel("Setup cancelled");
			process.exit(0);
		}
		const aiProvider = await p.select({
			message: "Which AI provider?",
			options: [
				{
					value: "anthropic",
					label: "Anthropic (Claude)"
				},
				{
					value: "openai",
					label: "OpenAI (GPT-4)"
				},
				{
					value: "claude-code",
					label: "Use Claude Code access"
				}
			],
			initialValue: "anthropic"
		});
		if (p.isCancel(aiProvider)) {
			p.cancel("Setup cancelled");
			process.exit(0);
		}
		const docStyle = await p.select({
			message: "How should docs be written?",
			options: [
				{
					value: "senior",
					label: "For senior engineers",
					hint: "Focus on why, edge cases, trade-offs"
				},
				{
					value: "onboarding",
					label: "For new team members",
					hint: "Focus on what, how it works, examples"
				},
				{
					value: "custom",
					label: "Custom prompt",
					hint: "Write your own documentation guidelines"
				}
			],
			initialValue: "senior"
		});
		if (p.isCancel(docStyle)) {
			p.cancel("Setup cancelled");
			process.exit(0);
		}
		let customPrompt = "";
		if (docStyle === "custom") {
			const prompt = await p.text({
				message: "Enter your documentation prompt:",
				placeholder: "Document for...",
				validate: (value) => {
					if (!value) return "Prompt is required";
				}
			});
			if (p.isCancel(prompt)) {
				p.cancel("Setup cancelled");
				process.exit(0);
			}
			customPrompt = prompt;
		}
		const includeCommits = await p.confirm({
			message: "Include git commit messages in generation?",
			initialValue: true
		});
		if (p.isCancel(includeCommits)) {
			p.cancel("Setup cancelled");
			process.exit(0);
		}
		const s = p.spinner();
		s.start("Creating configuration...");
		const config = {
			output: {
				dir: outputDir,
				structure: "mirror"
			},
			scope: {
				include: [includePattern],
				exclude: excludePattern.split(",").map((p) => p.trim()).filter(Boolean)
			},
			generation: {
				prompt: getPromptForStyle(docStyle, customPrompt),
				aiProvider
			},
			git: {
				includeCommitMessages: includeCommits,
				commitDepth: 10
			}
		};
		await mkdir(join(process.cwd(), outputDir), { recursive: true });
		await writeFile(configPath, generateConfigYAML(config), "utf-8");
		const gitignorePath = join(process.cwd(), ".gitignore");
		if (!existsSync(gitignorePath)) await writeFile(gitignorePath, "node_modules\n", "utf-8");
		s.stop("Configuration created!");
		p.note(`Config saved to: ${outputDir}/config.yaml\n\nNext steps:\n  1. Set your API key: export ANTHROPIC_API_KEY=...\n  2. Generate your first doc: syncdocs generate\n  3. Or run: syncdocs check`, "Setup complete!");
		p.outro("Happy documenting! 📝");
	});
}
function getPromptForStyle(style, customPrompt) {
	if (style === "custom") return customPrompt;
	const prompts = {
		senior: `Document for senior engineers joining the team.
Focus on why decisions were made, not just what the code does.
Highlight non-obvious behavior, edge cases, and trade-offs.
Keep explanations concise—link to code for implementation details.`,
		onboarding: `Document for new team members learning the codebase.
Focus on what the code does and how it works together.
Explain the happy path clearly with examples.
Call out important patterns and conventions.`
	};
	return prompts[style] || prompts.senior;
}
function generateConfigYAML(config) {
	return `# syncdocs configuration
# Learn more: https://syncdocs.dev/docs/config

output:
  # Where generated documentation will be stored
  dir: ${config.output.dir}
  # How to organize docs: "mirror" matches source tree, "flat" puts all in one dir
  structure: ${config.output.structure}

scope:
  # Files to include in documentation
  include:
${config.scope.include.map((p) => `    - ${p}`).join("\n")}

  # Files to exclude from documentation
  exclude:
${config.scope.exclude.map((p) => `    - ${p}`).join("\n")}

generation:
  # AI provider to use for generation
  aiProvider: ${config.generation.aiProvider}

  # How documentation should be written
  prompt: |
${config.generation.prompt.split("\n").map((line) => `    ${line}`).join("\n")}

git:
  # Include commit messages when regenerating docs
  includeCommitMessages: ${config.git.includeCommitMessages}

  # How many commits back to analyze for context
  commitDepth: ${config.git.commitDepth}
`;
}

//#endregion
//#region src/cli/commands/check.ts
function registerCheckCommand(cli) {
	cli.command("check", "Check if docs are stale").option("--fix", "Regenerate stale docs").action(async (options) => {
		console.log("check command - TODO", options);
	});
}

//#endregion
//#region src/cli/commands/generate.ts
function registerGenerateCommand(cli) {
	cli.command("generate", "Generate documentation for a symbol").option("--file <path>", "Source file path").option("--symbol <name>", "Symbol name to document").action(async (options) => {
		console.log("generate command - TODO", options);
	});
}

//#endregion
//#region src/cli/commands/status.ts
function registerStatusCommand(cli) {
	cli.command("status", "Show documentation coverage").action(async () => {
		console.log("status command - TODO");
	});
}

//#endregion
//#region src/cli/commands/validate.ts
function registerValidateCommand(cli) {
	cli.command("validate", "Validate syncdocs configuration").action(async () => {
		console.log("validate command - TODO");
	});
}

//#endregion
//#region src/cli/index.ts
const cli = cac("syncdocs");
cli.version(version).help();
registerInitCommand(cli);
registerCheckCommand(cli);
registerGenerateCommand(cli);
registerStatusCommand(cli);
registerValidateCommand(cli);
cli.parse();

//#endregion
export {  };