#!/usr/bin/env node
/*
Lint every project in a directory with this config and report which rules fire.

Useful for spotting noisy rules and false positives across many real codebases (for
example after a dependency bump that pulls in new rules).

Usage:
	node scripts/lint-projects.js <directory>
	node scripts/lint-projects.js <directory> --rule <ruleId>

Examples:
	node scripts/lint-projects.js ~/dev/oss
	node scripts/lint-projects.js ~/dev/oss --rule unicorn/no-invalid-argument-count

A project counts as lintable when it has a `package.json` and one of `index.js`,
`index.ts`, or a `source/` directory. TypeScript files are linted from inside each
project so `projectService` can find the project's `tsconfig.json`.
*/
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {ESLint} from 'eslint';
import eslintConfigXo from '../index.js';

const projectGlobs = [
	'index.{js,ts,mjs,cjs}',
	'source/**/*.{js,ts,tsx,mjs,cjs}',
	'test/**/*.{js,ts,tsx,mjs,cjs}',
	'*.{js,mjs,cjs}',
];

function parseArguments(argv) {
	let directory;
	let rule;

	for (let index = 0; index < argv.length; index++) {
		if (argv[index] === '--rule') {
			rule = argv[++index];
		} else {
			directory ??= argv[index];
		}
	}

	return {directory, rule};
}

const {directory, rule} = parseArguments(process.argv.slice(2));

if (!directory) {
	console.error('Usage: node scripts/lint-projects.js <directory> [--rule <ruleId>]');
	process.exit(1);
}

const baseDirectory = path.resolve(directory);

const isLintableProject = projectPath =>
	fs.existsSync(path.join(projectPath, 'package.json'))
	&& ['index.js', 'index.ts', 'source'].some(entry => fs.existsSync(path.join(projectPath, entry)));

const projectDirectories = fs.readdirSync(baseDirectory, {withFileTypes: true})
	.filter(entry => entry.isDirectory())
	.map(entry => path.join(baseDirectory, entry.name))
	.filter(projectPath => isLintableProject(projectPath));

console.error(`Linting ${projectDirectories.length} projects from ${baseDirectory}…`);

async function lintProject(projectDirectory) {
	const eslint = new ESLint({
		cwd: projectDirectory,
		overrideConfigFile: true,
		overrideConfig: eslintConfigXo(),
		errorOnUnmatchedPattern: false,
	});

	try {
		return await eslint.lintFiles(projectGlobs);
	} catch {
		// Skip projects ESLint cannot load (for example an unparseable config in the tree).
		return [];
	}
}

const stats = new Map();
const occurrences = [];

for (const projectDirectory of projectDirectories) {
	const projectName = path.basename(projectDirectory);
	// eslint-disable-next-line no-await-in-loop
	const results = await lintProject(projectDirectory);

	for (const result of results) {
		for (const message of result.messages) {
			const ruleId = message.fatal || !message.ruleId ? '(parse/fatal)' : message.ruleId;

			let entry = stats.get(ruleId);
			if (!entry) {
				entry = {count: 0, projects: new Set()};
				stats.set(ruleId, entry);
			}

			entry.count++;
			entry.projects.add(projectName);

			if (rule === ruleId) {
				const relativePath = path.relative(baseDirectory, result.filePath);
				occurrences.push(`${projectName} | ${relativePath}:${message.line} :: ${message.message}`);
			}
		}
	}
}

if (rule) {
	console.log(`\n${occurrences.length} occurrences of ${rule}:\n`);
	console.log(occurrences.join('\n'));
} else {
	const rows = [];
	for (const [ruleId, {count, projects}] of stats) {
		rows.push({ruleId, count, projects: projects.size});
	}

	const sortedRows = rows.toSorted((a, b) => b.projects - a.projects || b.count - a.count);

	console.log(`\n${'RULE'.padEnd(54)} PROJ TOTAL`);
	for (const {ruleId, count, projects} of sortedRows) {
		console.log(`${ruleId.padEnd(54)} ${String(projects).padStart(4)} ${String(count).padStart(5)}`);
	}
}
