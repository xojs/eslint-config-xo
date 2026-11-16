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

test('css', async () => {
	const errors = await runEslint('a {\n\tcolor: #ffffff;\n}\n', eslintConfigXo(), {filePath: 'style.css'});
	assert.ok(hasRule(errors, 'cssicorn/prefer-short-hex-color'));
});

test('package.json', async () => {
	const errors = await runEslint('{\n\t"name": "foo",\n\t"keywords": []\n}\n', eslintConfigXo(), {filePath: 'package.json'});
	assert.ok(hasRule(errors, 'package-json/no-empty-fields'));
});

test('package.json - extra rules', async () => {
	const lint = packageJson => runEslint(`${JSON.stringify(packageJson, undefined, '\t')}\n`, eslintConfigXo(), {filePath: 'package.json'});

	assert.ok(hasRule(await lint({name: 'foo', dependencies: {bar: 'file:../bar'}}), 'package-json/no-local-dependencies'));
	assert.ok(hasRule(await lint({name: 'foo', peerDependencies: {bar: '1.0.0'}}), 'package-json/no-exact-peer-dependencies'));
	assert.ok(hasRule(await lint({name: 'foo', repository: 'sindresorhus/foo', homepage: 'https://github.com/sindresorhus/foo#readme'}), 'package-json/no-redundant-repository-fields'));
	assert.ok(hasRule(await lint({name: 'foo', private: true, publishConfig: {access: 'public'}}), 'package-json/restrict-fields-when-private'));
});

test('jsdoc - method signature style', async () => {
	const lint = code => runEslint(code, eslintConfigXo(), {filePath: 'index.js'});

	assert.ok(hasRule(await lint('/**\n@typedef {{foo(value: string): void}} Foo\n*/\n'), 'jsdoc/ts-method-signature-style'));
	assert.ok(!hasRule(await lint('/**\n@typedef {{foo: (value: string) => void}} Foo\n*/\n'), 'jsdoc/ts-method-signature-style'));
});

test('common config files are parsed as JSONC', async () => {
	const config = eslintConfigXo();
	const source = '{\n\t// Comment\n\t"foo": true,\n}\n';

	for (const filePath of [
		'tsconfig.json',
		'tsconfig.node.json',
		'packages/foo/tsconfig.build.json',
		'jsconfig.json',
		'.vscode/settings.json',
		'dprint.json',
		'.dprint.json',
		'foo.jsonc',
	]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(source, config, {filePath});
		assert.deepEqual(errors, [], filePath);
	}

	const errors = await runEslint(source, config, {filePath: 'config.json'});
	assert.ok(errors.some(error => error.fatal));
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

test('unicorn/no-useless-undefined does not conflict with other rules', async () => {
	// A getter can return `undefined` with `return undefined;`, since `getter-return` forbids `return;`.
	const getterFixture = [
		'export const object = {',
		'\titems: [],',
		'\tget foo() {',
		'\t\tfor (const item of this.items) {',
		'\t\t\tif (item.isFoo) {',
		'\t\t\t\treturn item;',
		'\t\t\t}',
		'\t\t}',
		'',
		'\t\treturn undefined;',
		'\t},',
		'};',
		'',
	].join('\n');
	const getterErrors = await runEslint(getterFixture, eslintConfigXo(), {filePath: 'index.js'});
	assert.deepEqual(getterErrors, []);

	// A TypeScript no-op function can be `() => undefined` (`@typescript-eslint/no-empty-function`).
	const noopErrors = await runEslint('export const noop = () => undefined;\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	assert.deepEqual(noopErrors, []);

	const functionErrors = await runEslint('export function noop() {\n\treturn undefined;\n}\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	assert.deepEqual(functionErrors, []);
});

test('unicorn/prefer-await allows a promise chain discarded with `void`', async () => {
	const errors = await runEslint('const promise = Promise.resolve(1);\nvoid promise.then(value => {\n\tconsole.log(value);\n});\n', eslintConfigXo(), {filePath: 'index.js'});
	assert.deepEqual(errors, []);
});

test('typescript', async () => {
	const errors = await runEslint('const foo: number = 5;\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	assert.ok(hasRule(errors, '@typescript-eslint/no-inferrable-types'));
});

test('typescript - the `null` type is suggested to be `undefined` but not autofixed', async () => {
	const errors = await runEslint('export type Value = string | null;\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	const message = errors.find(error => error.ruleId === '@typescript-eslint/no-restricted-types');
	assert.ok(message);
	assert.equal(message.fix, undefined);
	assert.deepEqual(message.suggestions.map(suggestion => suggestion.fix.text), ['undefined']);
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

test('importing a helper from the test directory is allowed', async () => {
	const errors = await runEslint('import {test} from \'./_helper.js\';\n\ntest(\'foo\', () => {});\n', eslintConfigXo(), {filePath: 'test/test.js'});
	assert.ok(!hasRule(errors, 'node-test/no-import-test-files'));
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
	assert.ok(hasRule(errors, 'no-restricted-imports'));

	const typeErrors = await runEslint('import type objectAssign from \'object-assign\';\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	assert.ok(hasRule(typeErrors, 'no-restricted-imports'));
});

test('no-loop-func - reports in javascript and typescript', async () => {
	const code = 'export const functions = [];\nfor (var index = 0; index < 3; index++) {\n\tfunctions.push(() => index);\n}\n';
	for (const filePath of ['index.js', 'test/fixture.ts']) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(code, eslintConfigXo(), {filePath});
		assert.ok(hasRule(errors, 'no-loop-func'));
	}
});

test('typescript - strict correctness rules', async () => {
	const lint = code => runEslint(code, eslintConfigXo(), {filePath: 'test/fixture.ts'});

	assert.ok(hasRule(await lint('export enum Foo {\n\tA = 0,\n\tB = \'b\',\n}\n'), '@typescript-eslint/no-mixed-enums'));
	assert.ok(hasRule(await lint('export const negate = (value: string) => -value;\n'), '@typescript-eslint/no-unsafe-unary-minus'));
	assert.ok(hasRule(await lint('export const merge = (items: string[]) => ({...items});\n'), '@typescript-eslint/no-misused-spread'));
	assert.ok(hasRule(await lint('export type Foo = {\n\tbar(value: string): void;\n};\n'), '@typescript-eslint/method-signature-style'));
	assert.ok(!hasRule(await lint('export type Foo = {\n\tbar: (value: string) => void;\n};\n'), '@typescript-eslint/method-signature-style'));
});

test('n/prefer-global - timers and crypto use the globals', async () => {
	const lint = code => runEslint(code, eslintConfigXo(), {filePath: 'index.js'});

	assert.ok(hasRule(await lint('import {setTimeout} from \'node:timers\';\n\nsetTimeout(() => {}, 1);\n'), 'n/prefer-global/timers'));
	assert.ok(!hasRule(await lint('import {setTimeout} from \'node:timers/promises\';\n\nawait setTimeout(1);\n'), 'n/prefer-global/timers'));
	assert.ok(hasRule(await lint('import {webcrypto} from \'node:crypto\';\n\nconsole.log(webcrypto);\n'), 'n/prefer-global/crypto'));
});

test('CommonJS extensions are not linted with XO rules', async () => {
	for (const filePath of ['index.cjs', 'index.cts']) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint('var foo = 1;\nmodule.exports = foo;\n', eslintConfigXo(), {filePath});
		assert.ok(!hasRule(errors, 'no-var'));
	}

	const errors = await runEslint('var foo = 1;\nexport default foo;\n', eslintConfigXo(), {filePath: 'index.js'});
	assert.ok(hasRule(errors, 'no-var'));
});

test('no-useless-assignment - reports an initial value that is always overwritten', async () => {
	const errors = await runEslint('export function foo(a) {\n\tlet value = 0;\n\tvalue = a;\n\treturn value;\n}\n', eslintConfigXo(), {filePath: 'index.js'});
	assert.ok(hasRule(errors, 'no-useless-assignment'));
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

test('typescript - private members do not allow a `_` prefix', async () => {
	const lint = code => runEslint(code, eslintConfigXo(), {filePath: 'test/fixture.ts'});

	for (const member of ['private _foo = 1;', 'private _bar() {\n\t\treturn 1;\n\t}', 'private get _baz() {\n\t\treturn 1;\n\t}', 'constructor(private readonly _qux: number) {}']) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await lint(`export class Foo {\n\t${member}\n}\n`);
		assert.ok(hasRule(errors, '@typescript-eslint/naming-convention'), member);
	}

	for (const member of ['private foo = 1;', '#foo = 1;', '_foo = 1;', 'protected _foo = 1;']) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await lint(`export class Foo {\n\t${member}\n}\n`);
		assert.ok(!hasRule(errors, '@typescript-eslint/naming-convention'), member);
	}
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

test('prettier - does not enforce no-mixed-operators, as Prettier removes the parentheses it asks for', async () => {
	const fixture = 'export const foo = (a, b, c) => a + b / c;\n';

	for (const prettier of ['compat', true]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(fixture, eslintConfigXo({prettier}), {filePath: 'index.js'});
		assert.ok(!hasRule(errors, '@stylistic/no-mixed-operators'));
	}

	const errors = await runEslint(fixture, eslintConfigXo(), {filePath: 'index.js'});
	assert.ok(hasRule(errors, '@stylistic/no-mixed-operators'));
});

test('prettier - does not enforce list-style, as Prettier keeps short objects on one line', async () => {
	const fixture = 'export const foo = {a: 1, b: 2, c: 3, d: 4};\n';

	for (const prettier of ['compat', true]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(fixture, eslintConfigXo({prettier}), {filePath: 'index.js'});
		assert.ok(!hasRule(errors, '@stylistic/list-style'));
		assert.ok(!hasRule(errors, 'prettier/prettier'));
	}

	const errors = await runEslint(fixture, eslintConfigXo(), {filePath: 'index.js'});
	assert.ok(hasRule(errors, '@stylistic/list-style'));
});

test('list-style - checks brackets and braces but not parameters and arguments', async () => {
	const lint = code => runEslint(code, eslintConfigXo(), {filePath: 'index.js'});

	assert.ok(hasRule(await lint('export const foo = {\n\ta: 1, b: 2,\n};\n'), '@stylistic/list-style'));
	assert.ok(hasRule(await lint('export const foo = [ 1 ];\n'), '@stylistic/list-style'));
	assert.ok(hasRule(await lint('export const foo = { a: 1 };\n'), '@stylistic/list-style'));
	assert.ok(!hasRule(await lint('export const foo = {a: 1, b: 2, c: 3};\n'), '@stylistic/list-style'));
	assert.ok(!hasRule(await lint('export const foo = [1, 2, 3, 4, 5];\n'), '@stylistic/list-style'));
	assert.ok(!hasRule(await lint('export const foo = items => items.flatMap(item => item\n\t.map(x => x),\n);\n'), '@stylistic/list-style'));
	assert.ok(hasRule(await lint('import {a, b, c, d} from \'./foo.js\';\n\nexport const foo = [a, b, c, d];\n'), '@stylistic/list-style'));
});

test('list-style - checks TypeScript type bodies and tuple types', async () => {
	const lint = async code => {
		const errors = await runEslint(code, eslintConfigXo(), {filePath: 'test/fixture.ts'});
		return errors.filter(error => ['@stylistic/list-style', '@stylistic/member-delimiter-style'].includes(error.ruleId)).map(error => error.ruleId);
	};

	assert.deepEqual(await lint('export type Foo = { a: string };\n'), ['@stylistic/list-style', '@stylistic/list-style']);
	assert.deepEqual(await lint('export interface Foo { a: string }\n'), ['@stylistic/list-style', '@stylistic/list-style']);
	assert.deepEqual(await lint('export type Foo = {a: string; b: number};\n'), []);
	assert.deepEqual(await lint('export type Foo = {\n\ta: string;\n\tb: number;\n};\n'), []);
	const packedTupleErrors = await lint('export type Foo = [\n\t1, 2, 3,\n\t4, 5, 6,\n];\n');
	assert.ok(packedTupleErrors.includes('@stylistic/list-style'));
	assert.deepEqual(await lint('export type Foo = [ 1, 2 ];\n'), ['@stylistic/list-style', '@stylistic/list-style']);
	assert.deepEqual(await lint('export type Foo = [1, 2];\n'), []);
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
	assert.deepEqual(baseConfig.files, ['**/*.{js,jsx,mjs,vue,svelte,astro}']);
	assert.deepEqual(baseConfig.settings['import-x/extensions'], ['js', 'jsx', 'mjs', 'vue', 'svelte', 'astro']);

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

test('unicorn language presets apply to non-JavaScript files', async () => {
	const cssErrors = await runEslint('.button {\n\ttransition: all 1s;\n}\n', eslintConfigXo(), {filePath: 'test/fixture.css'});
	assert.ok(hasRule(cssErrors, 'unicorn/no-transition-all'));

	const htmlErrors = await runEslint('<script src="https://example.com/script.js" integrity="sha256-invalid"></script>\n', eslintConfigXo(), {filePath: 'test/fixture.html'});
	assert.ok(hasRule(htmlErrors, 'unicorn/no-invalid-integrity'));

	const jsonErrors = await runEslint('{\n\t"value": 1.0\n}\n', eslintConfigXo(), {filePath: 'test/fixture.json'});
	assert.ok(hasRule(jsonErrors, 'unicorn/no-zero-fractions'));

	// eslint-disable-next-line unicorn/prefer-https -- The fixture needs an HTTP URL.
	const markdownErrors = await runEslint('# Title\n\nSee [the website](http://sindresorhus.com).\n', eslintConfigXo(), {filePath: 'test/fixture.md'});
	assert.ok(hasRule(markdownErrors, 'unicorn/prefer-https'));
});

test('unicorn/name-replacements ignores third-party class names in CSS and HTML', async () => {
	const cssErrors = await runEslint('.btn {\n\tcolor: red;\n}\n', eslintConfigXo(), {filePath: 'test/fixture.css'});
	assert.ok(!hasRule(cssErrors, 'unicorn/name-replacements'));

	const htmlErrors = await runEslint('<button type="button" class="btn">Go</button>\n', eslintConfigXo(), {filePath: 'test/fixture.html'});
	assert.ok(!hasRule(htmlErrors, 'unicorn/name-replacements'));
});

test('unicorn rules ignore file and class names that tools require', async () => {
	const requiredPaths = [
		'pull_request_template.md',
		'docs/pull_request_template.md',
		'.github/pull_request_template.md',
		'.github/ISSUE_TEMPLATE/bug_report.md',
		'_locales/zh_CN/messages.json',
		'ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json',
		'locales/en-US.json',
		'cypress.env.json',
		'tsconfig.lib.json',
	];

	for (const filePath of requiredPaths) {
		const code = filePath.endsWith('.md') ? '# Title\n' : '{}\n';
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(code, eslintConfigXo(), {filePath});
		assert.ok(!hasRule(errors, 'unicorn/filename-case'), filePath);
		assert.ok(!hasRule(errors, 'unicorn/name-replacements'), filePath);
	}

	// Class names from third-party stylesheets, like WordPress's `sub-menu`.
	const cssErrors = await runEslint('.sub-menu {\n\tcolor: red;\n}\n', eslintConfigXo(), {filePath: 'test/fixture.css'});
	assert.ok(!hasRule(cssErrors, 'unicorn/consistent-compound-words'));

	const htmlErrors = await runEslint('<ul class="sub-menu"></ul>\n', eslintConfigXo(), {filePath: 'test/fixture.html'});
	assert.ok(!hasRule(htmlErrors, 'unicorn/consistent-compound-words'));

	// Markdown filename checks are temporarily disabled.
	const markdownErrors = await runEslint('# Title\n', eslintConfigXo(), {filePath: 'docs/Guide.md'});
	assert.ok(!hasRule(markdownErrors, 'unicorn/filename-case'));

	// A pull request template with only a comment.
	const templateErrors = await runEslint('<!-- Describe the change. -->\n', eslintConfigXo(), {filePath: '.github/pull_request_template.md'});
	assert.ok(!hasRule(templateErrors, 'unicorn/no-empty-file'));
});

test('unicorn rules that are not in the language presets', async () => {
	const jsonErrors = await runEslint('{\n\t"id": 9007199254740993\n}\n', eslintConfigXo(), {filePath: 'test/fixture.json'});
	assert.ok(hasRule(jsonErrors, 'unicorn/no-loss-of-precision'));

	const cssErrors = await runEslint('.button {\n\twidth: 9007199254740993px;\n}\n', eslintConfigXo(), {filePath: 'test/fixture.css'});
	assert.ok(hasRule(cssErrors, 'unicorn/no-loss-of-precision'));

	const markdownErrors = await runEslint('# Title\n\n[Run](javascript:alert(1))\n', eslintConfigXo(), {filePath: 'test/fixture.md'});
	assert.ok(hasRule(markdownErrors, 'unicorn/no-javascript-url'));
});

test('json - unicorn/prefer-https keeps JSON Schema identifiers', async () => {
	// eslint-disable-next-line unicorn/prefer-https -- The fixture needs the HTTP meta-schema identifier.
	const errors = await runEslint('{\n\t"$schema": "http://json-schema.org/draft-07/schema#"\n}\n', eslintConfigXo(), {filePath: 'test/fixture.json'});
	assert.ok(!hasRule(errors, 'unicorn/prefer-https'));
});

test('html - flags an invalid file input `accept` value', async () => {
	const errors = await runEslint(
		'<input type="file" accept="image/jpg">\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.html'},
	);
	assert.ok(hasRule(errors, 'unicorn/no-invalid-file-input-accept'));
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

test('prefer-regexp-exec - overlapping rules are disabled', async () => {
	for (const filePath of ['test/fixture.js', 'test/fixture.ts']) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(
			'export const match = "foo".match(/foo/);\n',
			eslintConfigXo(),
			{filePath},
		);
		assert.ok(errors.every(error => !error.fatal));
		assert.ok(!hasRule(errors, '@typescript-eslint/prefer-regexp-exec'));
		assert.ok(!hasRule(errors, 'regexp/prefer-regexp-exec'));
	}
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
	assert.equal(allFilesGlob, '**/*.{js,jsx,mjs,ts,tsx,mts,vue,svelte,astro,html,md}');
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

test('list-style - import flags specifiers on same line in multi-line import', async () => {
	const errors = await runEslint('import {\n\tfoo, bar,\n} from \'x\';\nvoid foo, bar;\n', eslintConfigXo());
	assert.ok(hasRule(errors, '@stylistic/list-style'));
});

test('list-style - import allows single-line imports', async () => {
	const errors = await runEslint('import {foo, bar} from \'x\';\nvoid foo, bar;\n', eslintConfigXo());
	assert.ok(!hasRule(errors, '@stylistic/list-style'));
});

test('list-style - import allows each specifier on its own line', async () => {
	const errors = await runEslint('import {\n\tfoo,\n\tbar,\n} from \'x\';\nvoid foo, bar;\n', eslintConfigXo());
	assert.ok(!hasRule(errors, '@stylistic/list-style'));
});

test('list-style - import allows single specifier', async () => {
	const errors = await runEslint('import {\n\tfoo,\n} from \'x\';\nvoid foo;\n', eslintConfigXo());
	assert.ok(!hasRule(errors, '@stylistic/list-style'));
});

test('list-style - import flags multiple violations on same line', async () => {
	const errors = await runEslint('import {\n\tfoo, bar, baz,\n} from \'x\';\nvoid foo, bar, baz;\n', eslintConfigXo());
	const violations = errors.filter(error => error.ruleId === '@stylistic/list-style');
	assert.equal(violations.length, 2);
});

test('list-style - import flags only the grouped specifiers', async () => {
	const errors = await runEslint('import {\n\tfoo, bar,\n\tbaz,\n} from \'x\';\nvoid foo, bar, baz;\n', eslintConfigXo());
	const violations = errors.filter(error => error.ruleId === '@stylistic/list-style');
	assert.equal(violations.length, 1);
});

test('list-style - import flags renamed imports on same line', async () => {
	const errors = await runEslint('import {\n\tfoo as f, bar as b,\n} from \'x\';\nvoid f, b;\n', eslintConfigXo());
	assert.ok(hasRule(errors, '@stylistic/list-style'));
});

test('list-style - import flags mixed default and named import', async () => {
	const errors = await runEslint('import def, {\n\tfoo, bar,\n} from \'x\';\nvoid def, foo, bar;\n', eslintConfigXo());
	assert.ok(hasRule(errors, '@stylistic/list-style'));
});

test('list-style - import autofix preserves indentation', async () => {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslintConfigXo(),
		fix: true,
	});

	const [result] = await eslint.lintText('import {\n\tfoo, bar,\n} from \'x\';\nvoid foo, bar;\n');
	assert.ok(result.output.includes('\tfoo,\n\tbar,'));
});

test('list-style - import autofix preserves space indentation', async () => {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslintConfigXo({space: true}),
		fix: true,
	});

	const [result] = await eslint.lintText('import {\n  foo, bar,\n} from \'x\';\nvoid foo, bar;\n');
	assert.ok(result.output.includes('  foo,\n  bar,'));
});

test('list-style - import autofix splits all three specifiers', async () => {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslintConfigXo(),
		fix: true,
	});

	const [result] = await eslint.lintText('import {\n\tfoo, bar, baz,\n} from \'x\';\nvoid foo, bar, baz;\n');
	assert.ok(result.output.includes('\tfoo,\n\tbar,\n\tbaz,'));
});

test('list-style - import skips fix when comment exists between specifiers', async () => {
	const input = 'import {\n\tfoo, /* comment */ bar,\n} from \'x\';\nvoid foo, bar;\n';
	const errors = await runEslint(input, eslintConfigXo());
	assert.ok(hasRule(errors, '@stylistic/list-style'));

	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: eslintConfigXo(),
		fix: true,
	});

	const [result] = await eslint.lintText(input);
	assert.ok(hasRule(result.messages, '@stylistic/list-style'));
});

test('list-style - import flags groups on multiple lines', async () => {
	const errors = await runEslint('import {\n\tfoo, bar,\n\tbaz, qux,\n} from \'x\';\nvoid foo, bar, baz, qux;\n', eslintConfigXo());
	const violations = errors.filter(error => error.ruleId === '@stylistic/list-style');
	assert.equal(violations.length, 2);
});

test('list-style - import flags type imports in typescript', async () => {
	const errors = await runEslint('import type {\n\tFoo, Bar,\n} from \'x\';\nvoid 0 as unknown as Foo | Bar;\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	assert.ok(hasRule(errors, '@stylistic/list-style'));
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
