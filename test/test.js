import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {pathToFileURL} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {ESLint} from 'eslint';
import eslintConfigXo, {
	allExtensions,
	allFilesGlob,
	jsonExtensions,
	cssExtensions,
	defaultIgnores,
} from '../index.js';

/* eslint-disable node-test/no-conditional-assertion, node-test/prefer-test-context-assert -- Every assertion-in-a-loop here runs over a literal fixture list, so none is ever skipped. Assertions go through the imported `assert` so the four tests that need a `t` for their temp-directory cleanup and the other 85 read the same. */

const hasRule = (errors, ruleId) => errors.some(error => error.ruleId === ruleId);
const missingTypeScriptSource = `
const error = new Error("Cannot find package 'typescript' imported from temporary/typescript.js");
error.code = 'MODULE_NOT_FOUND';
throw error;
`;

const configNames = configs => configs.map(config => config.name);

async function runEslint(string, config, {filePath} = {}) {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: config,
	});

	const [firstResult] = await eslint.lintText(string, {filePath});

	return firstResult.messages;
}

async function loadConfigWithoutTypeScript({typescriptSource} = {}) {
	const temporaryDirectory = await fs.mkdtemp(path.join(process.cwd(), 'test', 'no-typescript-'));
	try {
		await Promise.all([
			fs.copyFile('index.js', path.join(temporaryDirectory, 'index.js')),
			fs.cp('source', path.join(temporaryDirectory, 'source'), {recursive: true}),
		]);
		await fs.writeFile(path.join(temporaryDirectory, 'source', 'typescript.js'), typescriptSource ?? missingTypeScriptSource);

		return {temporaryDirectory, configModule: await import(`${pathToFileURL(path.join(temporaryDirectory, 'index.js')).href}?cache-bust=${Date.now()}`)};
	} catch (error) {
		await fs.rm(temporaryDirectory, {recursive: true, force: true});
		throw error;
	}
}

test('node', async () => {
	for (const config of [eslintConfigXo(), eslintConfigXo({space: true})]) {
		assert.ok(Array.isArray(config));

		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint('\'use strict\';\nconsole.log("unicorn")\n', config);
		assert.ok(hasRule(errors, '@stylistic/quotes'));
	}
});

test('package.json', async () => {
	const errors = await runEslint('{\n\t"name": "foo",\n\t"keywords": []\n}\n', eslintConfigXo(), {filePath: 'package.json'});
	assert.ok(hasRule(errors, 'package-json/no-empty-fields'));
});

test('all config objects have unique names', () => {
	const gitignoreUrl = pathToFileURL(path.join(process.cwd(), 'eslint.config.js')).href;

	for (const config of [
		eslintConfigXo(),
		eslintConfigXo({prettier: true}),
		eslintConfigXo({prettier: 'compat'}),
		eslintConfigXo({gitignore: gitignoreUrl}),
	]) {
		const names = configNames(config);
		assert.ok(!names.includes(undefined));
		assert.equal(new Set(names).size, names.length);
	}
});

test('browser', async () => {
	for (const config of [eslintConfigXo({browser: true}), eslintConfigXo({browser: true, space: true})]) {
		assert.ok(Array.isArray(config));

		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint('\'use strict\';\nprocess.exit();\n', config);
		assert.ok(hasRule(errors, 'no-undef'));
	}
});

test('browser - confusing globals do not conflict with unicorn/no-unnecessary-global-this', async () => {
	// `confusing-browser-globals` (via `no-restricted-globals`) forces a `globalThis.` prefix for confusing globals like `name`, which `unicorn/no-unnecessary-global-this` would otherwise flag as unnecessary. The two must not contradict each other.
	const prefixedErrors = await runEslint('export const value = globalThis.name;\n', eslintConfigXo({browser: true}), {filePath: 'index.js'});
	assert.ok(!hasRule(prefixedErrors, 'unicorn/no-unnecessary-global-this'));

	// Bare confusing globals should still be flagged in browser mode.
	const bareErrors = await runEslint('export const value = name;\n', eslintConfigXo({browser: true}), {filePath: 'index.js'});
	assert.ok(hasRule(bareErrors, 'no-restricted-globals'));

	// Well-known, unambiguous globals are allowed bare.
	const allowedErrors = await runEslint('confirm(history.length);\nexport const value = [location.origin, screen.width];\n', eslintConfigXo({browser: true}), {filePath: 'index.js'});
	assert.ok(!hasRule(allowedErrors, 'no-restricted-globals'));

	// In non-browser mode, the rule stays enabled since there is no conflict.
	const nodeErrors = await runEslint('export const value = globalThis.structuredClone;\n', eslintConfigXo(), {filePath: 'index.js'});
	assert.ok(hasRule(nodeErrors, 'unicorn/no-unnecessary-global-this'));
});

test('typescript', async () => {
	const errors = await runEslint('const foo: number = 5;\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	assert.ok(hasRule(errors, '@typescript-eslint/no-inferrable-types'));
});

test('typescript - eslint-recommended rules are disabled', async () => {
	const errors = await runEslint('export function foo(): number {\n\treturn 1;\n\t2;\n}\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	assert.ok(!hasRule(errors, 'no-unreachable'));
});

test('typescript - node:test calls are allowed to float', async () => {
	const fixture = [
		'/// <reference types="node" />',
		'import test, {describe, it, suite} from \'node:test\';',
		'test(\'a\', () => {});',
		'test.skip(\'b\', () => {});',
		'test.only(\'c\', () => {});',
		'describe(\'d\', () => {',
		'\tit(\'e\', () => {});',
		'\tit.todo(\'f\');',
		'});',
		'suite(\'g\', () => {});',
		'async function foo() {}',
		'foo();',
		'',
	].join('\n');

	const errors = await runEslint(fixture, eslintConfigXo(), {filePath: 'test/fixture.ts'});
	const floatingPromiseLines = errors.filter(error => error.ruleId === '@typescript-eslint/no-floating-promises').map(error => error.line);
	assert.deepEqual(floatingPromiseLines, [12]);
});

test('jsdoc file pragmas do not fail check-tag-names', async () => {
	for (const [filePath, code] of [
		['index.js', '/** @ts-check */\nconst value = 1;\nvoid value;\n'],
		['index.jsx', '/** @jsxImportSource react */\nconst value = <div />;\nvoid value;\n'],
		['index.js', '/** @jest-environment jsdom */\nconst value = 1;\nvoid value;\n'],
		['index.js', '/** @vitest-environment jsdom */\nconst value = 1;\nvoid value;\n'],
	]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(code, eslintConfigXo(), {filePath});
		assert.ok(errors.every(error => !error.fatal));
		assert.ok(!hasRule(errors, 'jsdoc/check-tag-names'));
	}
});

test('jsdoc allows the @isolated tag used by unicorn/isolated-functions', async () => {
	const errors = await runEslint('/** @isolated */\nfunction doStuff() {}\nvoid doStuff;\n', eslintConfigXo(), {filePath: 'index.js'});
	assert.ok(errors.every(error => !error.fatal));
	assert.ok(!hasRule(errors, 'jsdoc/check-tag-names'));
	assert.ok(!hasRule(errors, 'jsdoc/require-description'));
});

test('jsdoc allows the @isolated tag on a method in a TypeScript file', async () => {
	const errors = await runEslint(
		'export const x = {\n\t/** @isolated */\n\tasync updater(repository: string): Promise<string> {\n\t\treturn repository;\n\t},\n};\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(errors.every(error => !error.fatal));
	assert.ok(!hasRule(errors, 'jsdoc/check-tag-names'));
	assert.ok(!hasRule(errors, 'jsdoc/require-description'));
});

test('typescript supports tsdoc typeParam tags', async () => {
	const errors = await runEslint(
		'/**\n * @typeParam T - Value type.\n * @param value - Input value.\n * @returns The input value.\n */\nexport function identity<T>(value: T): T {\n\treturn value;\n}\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(!hasRule(errors, 'jsdoc/check-tag-names'));
});

test('typescript supports standard tsdoc tags', async () => {
	const errors = await runEslint(
		'/**\n * @defaultValue 1\n * @param value - Input value.\n * @returns The input value.\n */\nexport function identity(value = 1): number {\n\treturn value;\n}\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(errors.every(error => !error.fatal));
	assert.ok(!hasRule(errors, 'jsdoc/check-tag-names'));
});

test('javascript supports standard tsdoc tags', async () => {
	const errors = await runEslint(
		'/**\n * @defaultValue 1\n * @returns {number} The input value.\n */\nexport function identity(value = 1) {\n\treturn value;\n}\n',
		eslintConfigXo(),
		{filePath: 'index.js'},
	);
	assert.ok(errors.every(error => !error.fatal));
	assert.ok(!hasRule(errors, 'jsdoc/check-tag-names'));
});

test('standard multiline jsdoc style is allowed', async () => {
	const errors = await runEslint(
		'/**\nDescription.\n@returns {number} The value.\n*/\nexport function foo() {\n\treturn 1;\n}\n',
		eslintConfigXo(),
		{filePath: 'index.js'},
	);
	assert.ok(errors.every(error => !error.fatal));
	assert.ok(!hasRule(errors, 'jsdoc/require-asterisk-prefix'));
});

test('typescript jsx pragmas do not fail check-tag-names', async () => {
	for (const [filePath, code] of [
		['test/fixture.ts', '/** @jsxImportSource react */\nconst value = 1;\nvoid value;\n'],
		['test/fixture.ts', '/** @jsxRuntime automatic */\nconst value = 1;\nvoid value;\n'],
	]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(code, eslintConfigXo(), {filePath});
		assert.ok(errors.every(error => !error.fatal));
		assert.ok(!hasRule(errors, 'jsdoc/check-tag-names'));
	}
});

test('typescript does not require throws or yields types', async () => {
	const throwsFixture = [
		'/**',
		' * @param value - Input value.',
		' * @returns The input value.',
		' * @throws If the value is invalid.',
		' */',
		'export function validate(value: string): string {',
		'\tif (value.length === 0) {',
		'\t\tthrow new Error(\'Invalid value\');',
		'\t}',
		'',
		'\treturn value;',
		'}',
		'',
	].join('\n');
	const throwsErrors = await runEslint(
		throwsFixture,
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(throwsErrors.every(error => !error.fatal));
	assert.ok(!hasRule(throwsErrors, 'jsdoc/require-throws-type'));

	const yieldsFixture = [
		'/**',
		' * @yields The next value.',
		' */',
		'export function *numbers(): Generator<number> {',
		'\tyield 1;',
		'}',
		'',
	].join('\n');
	const yieldsErrors = await runEslint(
		yieldsFixture,
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(yieldsErrors.every(error => !error.fatal));
	assert.ok(!hasRule(yieldsErrors, 'jsdoc/require-yields-type'));
});

test('typescript overload signatures do not require returns docs', async () => {
	const fixture = [
		'/**',
		' * @param value - Input value.',
		' */',
		'export function foo(value: string): string;',
		'/**',
		' * @param value - Input value.',
		' */',
		'export function foo(value: number): number;',
		'export function foo(value: string | number): string | number {',
		'\treturn value;',
		'}',
		'',
	].join('\n');
	const errors = await runEslint(
		fixture,
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(errors.every(error => !error.fatal));
	assert.ok(!hasRule(errors, 'jsdoc/require-returns'));
});

test('typescript overload signatures do not require param docs', async () => {
	const fixture = [
		'/**',
		' * @overload',
		' */',
		'export function foo(value: string): string;',
		'export function foo(value: string): string {',
		'\treturn value;',
		'}',
		'',
	].join('\n');
	const errors = await runEslint(
		fixture,
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(errors.every(error => !error.fatal));
	assert.ok(!hasRule(errors, 'jsdoc/require-param'));
});

// `jsdoc/require-returns` is currently disabled, so these fixtures go unreported. `node:test` has no equivalent of AVA's `test.failing`, so the known gap is asserted directly: these go red as soon as the rule is enabled.
test('typescript implementations do not require returns docs while jsdoc/require-returns is disabled', async () => {
	const fixture = [
		'/**',
		' * @param value - Input value.',
		' */',
		'export function foo(value: string): string {',
		'\treturn value;',
		'}',
		'',
	].join('\n');
	const errors = await runEslint(
		fixture,
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(errors.every(error => !error.fatal));
	assert.ok(!hasRule(errors, 'jsdoc/require-returns'));
});

// `jsdoc/require-returns` is currently disabled, so these fixtures go unreported, as in the test above.
test('typescript method implementations do not require returns docs while jsdoc/require-returns is disabled', async () => {
	const classMethodErrors = await runEslint(
		'class Foo {\n\t/**\n\t * @param value - Input value.\n\t */\n\tbar(value: string): string {\n\t\treturn value;\n\t}\n}\nvoid Foo;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(classMethodErrors.every(error => !error.fatal));
	assert.ok(!hasRule(classMethodErrors, 'jsdoc/require-returns'));

	const objectMethodErrors = await runEslint(
		'const foo = {\n\t/**\n\t * @param value - Input value.\n\t */\n\tbar(value: string): string {\n\t\treturn value;\n\t},\n};\nvoid foo;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(objectMethodErrors.every(error => !error.fatal));
	assert.ok(!hasRule(objectMethodErrors, 'jsdoc/require-returns'));
});

test('jsdoc allows ambient type namespaces in javascript', async () => {
	for (const [filePath, code] of [
		['index.js', '/** @type {NodeJS.ProcessEnv} */\nconst environment = process.env;\nvoid environment;\n'],
		['index.jsx', '/** @returns {JSX.Element} */\nexport function Foo() {\n\treturn <div />;\n}\n'],
		['index.jsx', '/** @returns {React.JSX.Element} */\nexport function Foo() {\n\treturn <div />;\n}\n'],
		['index.jsx', '/** @returns {Preact.JSX.Element} */\nexport function Foo() {\n\treturn <div />;\n}\n'],
		['index.js', '/** @returns {AsyncGenerator<string, void, unknown>} */\nexport async function *foo() {\n\tyield \'value\';\n}\n'],
	]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(code, eslintConfigXo(), {filePath});
		assert.ok(errors.every(error => !error.fatal));
		assert.ok(!hasRule(errors, 'jsdoc/no-undefined-types'));
	}
});

test('jsdoc allows browser ambient lib types in javascript', async () => {
	const fixture = [
		'/** @returns {NodeListOf<Element>} */',
		'export function queryAll() {',
		'\treturn document.querySelectorAll(\'div\');',
		'}',
		'',
		'/**',
		' * @param {RequestInit} options - Request options.',
		' */',
		'export function request(options) {',
		'\treturn options;',
		'}',
		'',
	].join('\n');
	const errors = await runEslint(
		fixture,
		eslintConfigXo({browser: true}),
		{filePath: 'index.js'},
	);
	assert.ok(errors.every(error => !error.fatal));
	assert.ok(!hasRule(errors, 'jsdoc/no-undefined-types'));
});

test('restricted imports', async () => {
	const errors = await runEslint('import objectAssign from \'object-assign\';\n', eslintConfigXo());
	assert.ok(hasRule(errors, 'no-restricted-imports'));
});

test('restricted imports - typescript', async () => {
	const errors = await runEslint('import objectAssign from \'object-assign\';\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	assert.ok(hasRule(errors, '@typescript-eslint/no-restricted-imports'));
});

test('typescript - UPPER_CASE module-level const is allowed', async () => {
	const errors = await runEslint(
		'export const SECONDS_PER_DAY = 86_400;\nexport const IS_READY = true;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(!hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - camelCase module-level const is still allowed', async () => {
	const errors = await runEslint(
		'export const secondsPerDay = 86_400;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(!hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - non-exported UPPER_CASE module-level const is allowed', async () => {
	const errors = await runEslint(
		'const SECONDS_PER_DAY = 86_400;\nvoid SECONDS_PER_DAY;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(!hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - single-word UPPER_CASE module-level const is allowed', async () => {
	const errors = await runEslint(
		'export const TIMEOUT = 5000;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(!hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - UPPER_CASE static readonly class property is allowed', async () => {
	const errors = await runEslint(
		'class Foo {\n\tprivate static readonly PRIME = 16_777_619;\n\tstatic readonly OFFSET = 2_166_136_261;\n}\nvoid Foo;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(!hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - UPPER_CASE non-static class property is rejected', async () => {
	const errors = await runEslint(
		'class Foo {\n\treadonly MAX_VALUE = 100;\n}\nvoid Foo;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - UPPER_CASE is rejected for local const and non-const', async () => {
	const localConst = await runEslint(
		'export function foo() {\n\tconst MAX_VALUE = 100;\n\treturn MAX_VALUE;\n}\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(hasRule(localConst, '@typescript-eslint/naming-convention'));

	const letVariable = await runEslint(
		'export let MAX_VALUE = 100;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(hasRule(letVariable, '@typescript-eslint/naming-convention'));
});

test('typescript - quoted/exotic property names are allowed', async () => {
	const errors = await runEslint(
		'const proxy = {\'/api\': {target: \'http://localhost\'},\n\t\'Content-Type\': \'text/html\',\n};\nvoid proxy;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(!hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('consistent-boolean-name - enforces boolean prefix in place of naming-convention', async () => {
	const errors = await runEslint(
		'const completed = true;\nvoid completed;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(hasRule(errors, 'unicorn/consistent-boolean-name'));
	assert.ok(!hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('consistent-boolean-name - allows the `had` and `does` prefixes', async () => {
	const errors = await runEslint(
		'const hadError = true;\nconst doesExist = false;\nvoid hadError;\nvoid doesExist;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(!hasRule(errors, 'unicorn/consistent-boolean-name'));
});

test('consistent-boolean-name - ignores destructured boolean bindings', async () => {
	const errors = await runEslint(
		'const {awaitDomReady = false} = loader;\nvoid awaitDomReady;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(!hasRule(errors, 'unicorn/consistent-boolean-name'));
	assert.ok(!hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('capitalized-comments - does not flag commented-out code keywords', async () => {
	const codeKeywords = [
		'// const a = 1;\n',
		'// let foo = bar;\n',
		'// var x = 1;\n',
		'// import foo from \'bar\';\n',
		'// export default foo;\n',
		'// function foo() {}\n',
		'// class Foo {}\n',
		'// if (condition) {}\n',
		'// for (const item of items) {}\n',
		'// while (condition) {}\n',
		'// switch (value) {}\n',
	];

	for (const code of codeKeywords) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(code, eslintConfigXo());
		assert.ok(!hasRule(errors, 'capitalized-comments'), `Expected no capitalized-comments error for: ${code.trim()}`);
	}
});

test('capitalized-comments - ignores tool ignore directives', async () => {
	const directives = [
		'// pragma: no cover\n',
		'// ignore this\n',
		'// prettier-ignore\n',
		'// biome-ignore lint/suspicious/noDuplicateProperties\n',
		'// svelte-ignore custom_element_props_identifier\n',
		'// codespell:ignore\n',
		'// newtool-ignore foo\n',
	];

	for (const code of directives) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(code, eslintConfigXo());
		assert.ok(!hasRule(errors, 'capitalized-comments'), `Expected no capitalized-comments error for: ${code.trim()}`);
	}
});

test('capitalized-comments - still flags regular lowercase comments', async () => {
	const errors = await runEslint('// this is a regular lowercase comment\n', eslintConfigXo());
	assert.ok(hasRule(errors, 'capitalized-comments'));
});

test('space', async () => {
	const fixture = `
export function foo() {
	return true;
}
`.trim();

	for (const {
		expected,
		config,
	} of [
			{
				config: eslintConfigXo({space: true}),
				expected: true,
			},
			{
				config: eslintConfigXo({browser: true, space: true}),
				expected: true,
			},
			{
				config: eslintConfigXo(),
				expected: false,
			},
			{
				config: eslintConfigXo({browser: true}),
				expected: false,
			},
		]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(fixture, config);
		assert.equal(hasRule(errors, '@stylistic/indent'), expected);
	}
});

test('prettier - runs Prettier as a rule and reports misformatted code', async () => {
	const errors = await runEslint('export const foo = {bar: \'baz\'}\n', eslintConfigXo({prettier: true}), {filePath: 'index.js'});
	assert.ok(hasRule(errors, 'prettier/prettier'));
});

test('prettier - does not report well-formatted XO-style code', async () => {
	const errors = await runEslint('export const foo = {bar: \'baz\'};\n', eslintConfigXo({prettier: true}), {filePath: 'index.js'});
	assert.ok(!hasRule(errors, 'prettier/prettier'));
});

test('prettier - reformats indentation to match the space option', async () => {
	const fixture = 'export function foo() {\n  return true;\n}\n';

	// `space: false` (tabs) — the 2-space fixture should be reported.
	const tabErrors = await runEslint(fixture, eslintConfigXo({prettier: true}), {filePath: 'index.js'});
	assert.ok(hasRule(tabErrors, 'prettier/prettier'));

	// `space: true` (2 spaces) — the 2-space fixture matches, so no report.
	const spaceErrors = await runEslint(fixture, eslintConfigXo({prettier: true, space: true}), {filePath: 'index.js'});
	assert.ok(!hasRule(spaceErrors, 'prettier/prettier'));
});

test('prettier - reports semicolons according to the semicolon option', async () => {
	const fixture = 'export const foo = \'bar\';\n';

	// `semicolon: true` (default) — the semicolon matches, so no report.
	const withSemicolon = await runEslint(fixture, eslintConfigXo({prettier: true}), {filePath: 'index.js'});
	assert.ok(!hasRule(withSemicolon, 'prettier/prettier'));

	// `semicolon: false` — the trailing semicolon should be reported.
	const withoutSemicolon = await runEslint(fixture, eslintConfigXo({prettier: true, semicolon: false}), {filePath: 'index.js'});
	assert.ok(hasRule(withoutSemicolon, 'prettier/prettier'));
});

test('prettier - compat disables conflicting stylistic rules without running Prettier', async () => {
	const errors = await runEslint('export function foo() {\n  return true;\n}\n', eslintConfigXo({prettier: 'compat'}), {filePath: 'index.js'});
	assert.ok(!hasRule(errors, 'prettier/prettier'));
	assert.ok(!hasRule(errors, '@stylistic/indent'));
});

test('prettier - compat does not enforce quote style', async () => {
	const errors = await runEslint('export const foo = "bar";\n', eslintConfigXo({prettier: 'compat'}), {filePath: 'index.js'});
	assert.ok(!hasRule(errors, '@stylistic/quotes'));
});

test('prettier - default does not enable Prettier', async () => {
	const errors = await runEslint('export const foo = {bar: \'baz\'}\n', eslintConfigXo(), {filePath: 'index.js'});
	assert.ok(!hasRule(errors, 'prettier/prettier'));
});

test('no TypeScript install skips TypeScript files and omits the parser export', async t => {
	const {temporaryDirectory, configModule} = await loadConfigWithoutTypeScript();
	t.after(async () => {
		await fs.rm(temporaryDirectory, {recursive: true, force: true});
	});

	assert.equal(configModule.typescriptParser, undefined);

	const noTypeScriptConfig = configModule.default();
	const noTypeScriptNames = configNames(noTypeScriptConfig);
	assert.ok(!noTypeScriptNames.includes(undefined));
	assert.equal(new Set(noTypeScriptNames).size, noTypeScriptNames.length);

	const baseConfig = noTypeScriptConfig.find(config => config.name === 'xo/base');
	assert.deepEqual(baseConfig.files, ['**/*.{js,jsx,mjs,cjs,vue,svelte,astro}']);
	assert.deepEqual(baseConfig.settings['import-x/extensions'], ['js', 'jsx', 'mjs', 'cjs', 'vue', 'svelte', 'astro']);

	const errors = await runEslint(
		'const foo: number = 1;\n',
		noTypeScriptConfig,
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(errors[0].fatal);
	assert.match(errors[0].message, /install `typescript` to lint typescript files/iv);

	const declarationErrors = await runEslint(
		'export type Foo = string;\n',
		noTypeScriptConfig,
		{filePath: 'index.d.ts'},
	);
	assert.equal(declarationErrors[0].message, 'File ignored because no matching configuration was supplied.');

	for (const filePath of ['index.d.mts', 'index.d.cts']) {
		// eslint-disable-next-line no-await-in-loop
		const declarationVariantErrors = await runEslint(
			'export type Foo = string;\n',
			noTypeScriptConfig,
			{filePath},
		);
		assert.equal(declarationVariantErrors[0].message, 'File ignored because no matching configuration was supplied.');
	}
});

test('import-x/extensions is disabled in base config when TypeScript is active', () => {
	const config = eslintConfigXo();
	const baseConfig = config.find(c => c.name === 'xo/base');
	assert.equal(baseConfig.rules['import-x/extensions'], 'off');
});

test('import-x/extensions is enabled in base config without TypeScript', async t => {
	const {temporaryDirectory, configModule} = await loadConfigWithoutTypeScript();
	t.after(async () => {
		await fs.rm(temporaryDirectory, {recursive: true, force: true});
	});

	const noTypeScriptConfig = configModule.default();
	const baseConfig = noTypeScriptConfig.find(c => c.name === 'xo/base');
	assert.deepEqual(baseConfig.rules['import-x/extensions'], ['error', 'always', {ignorePackages: true}]);
});

test('import extension rules do not conflict when a JavaScript file imports a TypeScript file', async () => {
	// `test/fixture-typescript-target.ts` is the real file behind the `./fixture-typescript-target.js` specifier.
	const errors = await runEslint(
		'import {foo} from \'./fixture-typescript-target.js\';\n\nconsole.log(foo);\n',
		eslintConfigXo(),
		{filePath: 'test/fixture-typescript-target.test.js'},
	);
	assert.ok(!hasRule(errors, 'import-x/extensions'));
	assert.ok(!hasRule(errors, 'n/file-extension-in-import'));
});

test('n/file-extension-in-import requires the `.js` extension for a TypeScript target', async () => {
	const errors = await runEslint(
		'import {foo} from \'./fixture-typescript-target.ts\';\n\nconsole.log(foo);\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	const error = errors.find(error => error.ruleId === 'n/file-extension-in-import');
	assert.equal(error.message, 'require file extension \'.js\'.');
});

test('markdown - lints md files', async () => {
	// Fenced code block without a language specifier should trigger fenced-code-language
	const errors = await runEslint(
		'```\ncode\n```\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.md'},
	);
	assert.ok(hasRule(errors, 'markdown/fenced-code-language'));
});

test('markdown - no-multiple-h1 triggers', async () => {
	const errors = await runEslint(
		'# First\n\n# Second\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.md'},
	);
	assert.ok(hasRule(errors, 'markdown/no-multiple-h1'));
});

test('markdown - inline disable directives still work', async () => {
	const errors = await runEslint(
		'# First\n\n<!-- eslint-disable-next-line markdown/no-multiple-h1 -->\n# Second\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.md'},
	);
	assert.deepEqual(errors, []);
});

test('html - lints html files', async () => {
	// Uppercase tags should trigger the lowercase rule
	const errors = await runEslint(
		'<HTML></HTML>\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.html'},
	);
	assert.ok(hasRule(errors, '@html-eslint/lowercase'));
});

test('html - prettier disables conflicting style rules', async () => {
	const fixture = '<!doctype html>\n<html>\n      <body><p>x</p></body>\n</html>\n';

	// Without prettier, the HTML style rules fire.
	const baseErrors = await runEslint(fixture, eslintConfigXo(), {filePath: 'test/fixture.html'});
	assert.ok(hasRule(baseErrors, '@html-eslint/indent'));
	assert.ok(hasRule(baseErrors, '@html-eslint/element-newline'));

	for (const prettier of ['compat', true]) {
		// Both `prettier` modes disable the conflicting style rules...
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(fixture, eslintConfigXo({prettier}), {filePath: 'test/fixture.html'});
		assert.ok(!hasRule(errors, '@html-eslint/indent'));
		assert.ok(!hasRule(errors, '@html-eslint/element-newline'));

		// ...but non-conflicting HTML rules stay on.
		assert.ok(hasRule(errors, '@html-eslint/require-lang'));
	}

	// `sort-attrs` is not something Prettier does, so it stays enabled.
	const sortErrors = await runEslint('<meta charset="utf-8" b="2" a="1">\n', eslintConfigXo({prettier: 'compat'}), {filePath: 'test/fixture.html'});
	assert.ok(hasRule(sortErrors, '@html-eslint/sort-attrs'));
});

test('html - indent respects space option', async () => {
	// Fixture uses 2-space indentation
	const fixture = '<!doctype html>\n<html>\n  <body></body>\n</html>\n';

	// Tab config should report an indent error for the 2-space-indented fixture
	const tabErrors = await runEslint(fixture, eslintConfigXo(), {filePath: 'test/fixture.html'});
	assert.ok(hasRule(tabErrors, '@html-eslint/indent'));

	// Space config (2 spaces) should not report an indent error
	const spaceErrors = await runEslint(fixture, eslintConfigXo({space: true}), {filePath: 'test/fixture.html'});
	assert.ok(!hasRule(spaceErrors, '@html-eslint/indent'));
});

test('regexp - flags a non-optimal character class', async () => {
	// [0-9] should use \d instead
	const errors = await runEslint(
		'export const regex = /[0-9]+/;\n',
		eslintConfigXo(),
	);
	assert.ok(hasRule(errors, 'regexp/prefer-d'));
});

test('regexp - applies to typescript files', async () => {
	const errors = await runEslint(
		'export const regex = /[0-9]+/;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(hasRule(errors, 'regexp/prefer-d'));
});

test('regexp - prefer-regexp-exec defers to the typescript version for typescript files', async () => {
	const errors = await runEslint(
		'export const match = "foo".match(/foo/);\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(hasRule(errors, '@typescript-eslint/prefer-regexp-exec'));
	assert.ok(!hasRule(errors, 'regexp/prefer-regexp-exec'));
});

/* eslint-disable no-template-curly-in-string -- The `${…}` is template-literal source code under test, not a placeholder in a regular string. */
test('no-useless-template-literals - defers to the type-aware typescript version for typescript files', async () => {
	const stringErrors = await runEslint(
		'const stringValue = \'x\';\nexport const wrapped = `${stringValue}`;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(hasRule(stringErrors, '@typescript-eslint/no-unnecessary-template-expression'));
	assert.ok(!hasRule(stringErrors, 'unicorn/no-useless-template-literals'));

	const numberErrors = await runEslint(
		'const numberValue = 5;\nexport const wrapped = `${numberValue}`;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	assert.ok(!hasRule(numberErrors, '@typescript-eslint/no-unnecessary-template-expression'));
	assert.ok(!hasRule(numberErrors, 'unicorn/no-useless-template-literals'));
});

test('no-useless-template-literals - applies to javascript files', async () => {
	const errors = await runEslint(
		'const x = 5;\nexport const wrapped = `${x}`;\n',
		eslintConfigXo(),
	);
	assert.ok(hasRule(errors, 'unicorn/no-useless-template-literals'));
});
/* eslint-enable no-template-curly-in-string */

test('jsdoc - flags missing param description', async () => {
	const errors = await runEslint(
		'/**\n * Does something.\n * @param {string} name\n */\nexport function foo(name) {\n\treturn name;\n}\n',
		eslintConfigXo(),
	);
	assert.ok(hasRule(errors, 'jsdoc/require-param-description'));
});

test('jsdoc - applies to typescript files', async () => {
	const errors = await runEslint(
		'/**\n * Does something.\n * @param {string} name\n */\nexport function foo(name: string): string {\n\treturn name;\n}\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	// In TypeScript, types in JSDoc should not be used.
	assert.ok(hasRule(errors, 'jsdoc/no-types'));
});

test('jsdoc - typescript overrides disable type requirements', async () => {
	const errors = await runEslint(
		'/**\n * Does something.\n * @param name - The name.\n * @returns The name.\n */\nexport function foo(name: string): string {\n\treturn name;\n}\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	// TypeScript config should not require @param type or @returns type.
	assert.ok(!hasRule(errors, 'jsdoc/require-param-type'));
	assert.ok(!hasRule(errors, 'jsdoc/require-returns-type'));
});

test('jsdoc - does not require jsdoc on functions', async () => {
	const errors = await runEslint(
		'export function foo() {\n\treturn true;\n}\n',
		eslintConfigXo(),
	);
	assert.ok(!hasRule(errors, 'jsdoc/require-jsdoc'));
});

test('exported file globs include html and md', () => {
	assert.ok(allExtensions.includes('html'));
	assert.ok(allExtensions.includes('md'));
	assert.equal(allFilesGlob, '**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,vue,svelte,astro,html,md}');
});

test('exports json and css extensions separately and ignores lockfiles by default', () => {
	assert.deepEqual(jsonExtensions, ['json', 'jsonc', 'json5']);
	assert.deepEqual(cssExtensions, ['css']);
	assert.ok(!allExtensions.includes('json'));
	assert.ok(!allExtensions.includes('css'));
	assert.ok(defaultIgnores.includes('**/package-lock.json'));
	assert.ok(defaultIgnores.includes('**/npm-shrinkwrap.json'));
	assert.ok(defaultIgnores.includes('**/*.min.css'));
});

test('empty braces do not conflict between curly-newline and empty-brace-spaces', async () => {
	const errors = await runEslint('console.log(() => {});\n', eslintConfigXo());
	assert.ok(!hasRule(errors, '@stylistic/curly-newline'));
	assert.ok(!hasRule(errors, 'unicorn/empty-brace-spaces'));
});

test('import-specifier-newline - flags specifiers on same line in multi-line import', async () => {
	const errors = await runEslint('import {\n\tfoo, bar,\n} from \'x\';\nvoid foo, bar;\n', eslintConfigXo());
	assert.ok(hasRule(errors, 'xo/import-specifier-newline'));
});

test('import-specifier-newline - allows single-line imports', async () => {
	const errors = await runEslint('import {foo, bar} from \'x\';\nvoid foo, bar;\n', eslintConfigXo());
	assert.ok(!hasRule(errors, 'xo/import-specifier-newline'));
});

test('import-specifier-newline - allows each specifier on its own line', async () => {
	const errors = await runEslint('import {\n\tfoo,\n\tbar,\n} from \'x\';\nvoid foo, bar;\n', eslintConfigXo());
	assert.ok(!hasRule(errors, 'xo/import-specifier-newline'));
});

test('import-specifier-newline - allows single specifier', async () => {
	const errors = await runEslint('import {\n\tfoo,\n} from \'x\';\nvoid foo;\n', eslintConfigXo());
	assert.ok(!hasRule(errors, 'xo/import-specifier-newline'));
});

test('import-specifier-newline - flags multiple violations on same line', async () => {
	const errors = await runEslint('import {\n\tfoo, bar, baz,\n} from \'x\';\nvoid foo, bar, baz;\n', eslintConfigXo());
	const violations = errors.filter(error => error.ruleId === 'xo/import-specifier-newline');
	assert.equal(violations.length, 2);
});

test('import-specifier-newline - flags only the grouped specifiers', async () => {
	const errors = await runEslint('import {\n\tfoo, bar,\n\tbaz,\n} from \'x\';\nvoid foo, bar, baz;\n', eslintConfigXo());
	const violations = errors.filter(error => error.ruleId === 'xo/import-specifier-newline');
	assert.equal(violations.length, 1);
});

test('import-specifier-newline - flags renamed imports on same line', async () => {
	const errors = await runEslint('import {\n\tfoo as f, bar as b,\n} from \'x\';\nvoid f, b;\n', eslintConfigXo());
	assert.ok(hasRule(errors, 'xo/import-specifier-newline'));
});

test('import-specifier-newline - flags mixed default and named import', async () => {
	const errors = await runEslint('import def, {\n\tfoo, bar,\n} from \'x\';\nvoid def, foo, bar;\n', eslintConfigXo());
	assert.ok(hasRule(errors, 'xo/import-specifier-newline'));
});

test('import-specifier-newline - autofix preserves indentation', async () => {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslintConfigXo(),
		fix: true,
	});

	const [result] = await eslint.lintText('import {\n\tfoo, bar,\n} from \'x\';\nvoid foo, bar;\n');
	assert.ok(result.output.includes('\tfoo,\n\tbar,'));
});

test('import-specifier-newline - autofix preserves space indentation', async () => {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslintConfigXo({space: true}),
		fix: true,
	});

	const [result] = await eslint.lintText('import {\n  foo, bar,\n} from \'x\';\nvoid foo, bar;\n');
	assert.ok(result.output.includes('  foo,\n  bar,'));
});

test('import-specifier-newline - autofix splits all three specifiers', async () => {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslintConfigXo(),
		fix: true,
	});

	const [result] = await eslint.lintText('import {\n\tfoo, bar, baz,\n} from \'x\';\nvoid foo, bar, baz;\n');
	assert.ok(result.output.includes('\tfoo,\n\tbar,\n\tbaz,'));
});

test('import-specifier-newline - skips fix when comment exists between specifiers', async () => {
	const input = 'import {\n\tfoo, /* comment */ bar,\n} from \'x\';\nvoid foo, bar;\n';
	const errors = await runEslint(input, eslintConfigXo());
	assert.ok(hasRule(errors, 'xo/import-specifier-newline'));

	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslintConfigXo(),
		fix: true,
	});

	const [result] = await eslint.lintText(input);
	assert.ok(hasRule(result.messages, 'xo/import-specifier-newline'));
});

test('import-specifier-newline - flags groups on multiple lines', async () => {
	const errors = await runEslint('import {\n\tfoo, bar,\n\tbaz, qux,\n} from \'x\';\nvoid foo, bar, baz, qux;\n', eslintConfigXo());
	const violations = errors.filter(error => error.ruleId === 'xo/import-specifier-newline');
	assert.equal(violations.length, 2);
});

test('import-specifier-newline - flags type imports in typescript', async () => {
	const errors = await runEslint('import type {\n\tFoo, Bar,\n} from \'x\';\nvoid 0 as unknown as Foo | Bar;\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	assert.ok(hasRule(errors, 'xo/import-specifier-newline'));
});

test('gitignore - ignores paths listed in .gitignore', async t => {
	const temporaryDirectory = await fs.mkdtemp(path.join(process.cwd(), 'test', 'gitignore-'));
	t.after(async () => {
		await fs.rm(temporaryDirectory, {recursive: true, force: true});
	});

	await fs.writeFile(path.join(temporaryDirectory, '.gitignore'), 'ignored.js\n');

	const config = eslintConfigXo({gitignore: pathToFileURL(path.join(temporaryDirectory, 'eslint.config.js')).href});
	assert.ok(config.some(configObject => configObject.name === 'xo/gitignore'));

	const ignoredErrors = await runEslint('const x = 1;\n', config, {filePath: path.join(temporaryDirectory, 'ignored.js')});
	assert.equal(ignoredErrors.length, 1);
	assert.match(ignoredErrors[0].message, /ignored because of a matching ignore pattern/v);

	// A sibling file that is not gitignored is still linted.
	const lintedErrors = await runEslint('const x = 1;\n', config, {filePath: path.join(temporaryDirectory, 'linted.js')});
	assert.ok(hasRule(lintedErrors, 'no-unused-vars'));
});

test('gitignore - not enabled without the option', () => {
	assert.ok(eslintConfigXo().every(configObject => configObject.name !== 'xo/gitignore'));
});

test('gitignore - skips silently when .gitignore is absent', async t => {
	const temporaryDirectory = await fs.mkdtemp(path.join(process.cwd(), 'test', 'gitignore-missing-'));
	t.after(async () => {
		await fs.rm(temporaryDirectory, {recursive: true, force: true});
	});

	const config = eslintConfigXo({gitignore: pathToFileURL(path.join(temporaryDirectory, 'eslint.config.js')).href});
	assert.ok(config.every(configObject => configObject.name !== 'xo/gitignore'));
});

test('gitignore - throws for a non-`file://` URL', () => {
	assert.throws(() => {
		eslintConfigXo({gitignore: '.gitignore'});
	}, {message: /must be a `file:\/\/` URL/v});
});

test('non-typescript import failures are rethrown', async () => {
	await assert.rejects(
		loadConfigWithoutTypeScript({
			typescriptSource: `
const error = new Error("Cannot find package 'missing-dependency' imported from temporary/typescript.js");
error.code = 'ERR_MODULE_NOT_FOUND';
throw error;
`,
		}),
		error => {
			assert.equal(error.code, 'ERR_MODULE_NOT_FOUND');
			assert.match(error.message, /missing-dependency/v);
			return true;
		},
	);
});
/* eslint-enable node-test/no-conditional-assertion, node-test/prefer-test-context-assert */
