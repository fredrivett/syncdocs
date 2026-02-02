#!/usr/bin/env node
import { cac } from "cac";

//#region package.json
var version = "0.0.1";

//#endregion
//#region src/cli/commands/init.ts
function registerInitCommand(cli) {
	cli.command("init", "Initialize syncdocs in your project").action(async () => {
		console.log("init command - TODO");
	});
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