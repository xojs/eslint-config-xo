import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {pathToFileURL} from 'node:url';
import test from 'ava';
import {ESLint} from 'eslint';
import eslintConfigXo, {allExtensions, allFilesGlob} from '../index.js';

const hasRule = (errors, ruleId) => errors.some(error => error.ruleId === ruleId);
const missingTypeScriptSource = `
const error = new Error("Cannot find package 'typescript' imported from temporary/typescript.js");
error.code = 'MODULE_NOT_FOUND';
throw error;
`;

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

test('node', async t => {
	for (const config of [eslintConfigXo(), eslintConfigXo({space: true})]) {
		t.true(Array.isArray(config));

		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint('\'use strict\';\nconsole.log("unicorn")\n', config);
		t.true(hasRule(errors, '@stylistic/quotes'));
	}
});

test('browser', async t => {
	for (const config of [eslintConfigXo({browser: true}), eslintConfigXo({browser: true, space: true})]) {
		t.true(Array.isArray(config));

		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint('\'use strict\';\nprocess.exit();\n', config);
		t.true(hasRule(errors, 'no-undef'));
	}
});

test('typescript', async t => {
	const errors = await runEslint('const foo: number = 5;\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	t.true(hasRule(errors, '@typescript-eslint/no-inferrable-types'));
});

test('typescript - eslint-recommended rules are disabled', async t => {
	const errors = await runEslint('export function foo(): number {\n\treturn 1;\n\t2;\n}\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	t.false(hasRule(errors, 'no-unreachable'));
});

test('jsdoc file pragmas do not fail check-tag-names', async t => {
	for (const [filePath, code] of [
		['index.js', '/** @ts-check */\nconst value = 1;\nvoid value;\n'],
		['index.jsx', '/** @jsxImportSource react */\nconst value = <div />;\nvoid value;\n'],
		['index.js', '/** @jest-environment jsdom */\nconst value = 1;\nvoid value;\n'],
		['index.js', '/** @vitest-environment jsdom */\nconst value = 1;\nvoid value;\n'],
	]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(code, eslintConfigXo(), {filePath});
		t.false(errors.some(error => error.fatal));
		t.false(hasRule(errors, 'jsdoc/check-tag-names'));
	}
});

test('typescript supports tsdoc typeParam tags', async t => {
	const errors = await runEslint(
		'/**\n * @typeParam T - Value type.\n * @param value - Input value.\n * @returns The input value.\n */\nexport function identity<T>(value: T): T {\n\treturn value;\n}\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.false(hasRule(errors, 'jsdoc/check-tag-names'));
});

test('typescript supports standard tsdoc tags', async t => {
	const errors = await runEslint(
		'/**\n * @defaultValue 1\n * @param value - Input value.\n * @returns The input value.\n */\nexport function identity(value = 1): number {\n\treturn value;\n}\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.false(errors.some(error => error.fatal));
	t.false(hasRule(errors, 'jsdoc/check-tag-names'));
});

test('javascript supports standard tsdoc tags', async t => {
	const errors = await runEslint(
		'/**\n * @defaultValue 1\n * @returns {number} The input value.\n */\nexport function identity(value = 1) {\n\treturn value;\n}\n',
		eslintConfigXo(),
		{filePath: 'index.js'},
	);
	t.false(errors.some(error => error.fatal));
	t.false(hasRule(errors, 'jsdoc/check-tag-names'));
});

test('standard multiline jsdoc style is allowed', async t => {
	const errors = await runEslint(
		'/**\nDescription.\n@returns {number} The value.\n*/\nexport function foo() {\n\treturn 1;\n}\n',
		eslintConfigXo(),
		{filePath: 'index.js'},
	);
	t.false(errors.some(error => error.fatal));
	t.false(hasRule(errors, 'jsdoc/require-asterisk-prefix'));
});

test('typescript jsx pragmas do not fail check-tag-names', async t => {
	for (const [filePath, code] of [
		['test/fixture.ts', '/** @jsxImportSource react */\nconst value = 1;\nvoid value;\n'],
		['test/fixture.ts', '/** @jsxRuntime automatic */\nconst value = 1;\nvoid value;\n'],
	]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(code, eslintConfigXo(), {filePath});
		t.false(errors.some(error => error.fatal));
		t.false(hasRule(errors, 'jsdoc/check-tag-names'));
	}
});

test('typescript does not require throws or yields types', async t => {
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
	t.false(throwsErrors.some(error => error.fatal));
	t.false(hasRule(throwsErrors, 'jsdoc/require-throws-type'));

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
	t.false(yieldsErrors.some(error => error.fatal));
	t.false(hasRule(yieldsErrors, 'jsdoc/require-yields-type'));
});

test('typescript overload signatures do not require returns docs', async t => {
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
	t.false(errors.some(error => error.fatal));
	t.false(hasRule(errors, 'jsdoc/require-returns'));
});

test('typescript overload signatures do not require param docs', async t => {
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
	t.false(errors.some(error => error.fatal));
	t.false(hasRule(errors, 'jsdoc/require-param'));
});

test('typescript implementations still require returns docs', async t => {
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
	t.false(errors.some(error => error.fatal));
	t.true(hasRule(errors, 'jsdoc/require-returns'));
});

test('typescript method implementations still require returns docs', async t => {
	const classMethodErrors = await runEslint(
		'class Foo {\n\t/**\n\t * @param value - Input value.\n\t */\n\tbar(value: string): string {\n\t\treturn value;\n\t}\n}\nvoid Foo;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.false(classMethodErrors.some(error => error.fatal));
	t.true(hasRule(classMethodErrors, 'jsdoc/require-returns'));

	const objectMethodErrors = await runEslint(
		'const foo = {\n\t/**\n\t * @param value - Input value.\n\t */\n\tbar(value: string): string {\n\t\treturn value;\n\t},\n};\nvoid foo;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.false(objectMethodErrors.some(error => error.fatal));
	t.true(hasRule(objectMethodErrors, 'jsdoc/require-returns'));
});

test('jsdoc allows ambient type namespaces in javascript', async t => {
	for (const [filePath, code] of [
		['index.js', '/** @type {NodeJS.ProcessEnv} */\nconst environment = process.env;\nvoid environment;\n'],
		['index.jsx', '/** @returns {JSX.Element} */\nexport function Foo() {\n\treturn <div />;\n}\n'],
		['index.jsx', '/** @returns {React.JSX.Element} */\nexport function Foo() {\n\treturn <div />;\n}\n'],
		['index.jsx', '/** @returns {Preact.JSX.Element} */\nexport function Foo() {\n\treturn <div />;\n}\n'],
		['index.js', '/** @returns {AsyncGenerator<string, void, unknown>} */\nexport async function *foo() {\n\tyield \'value\';\n}\n'],
	]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(code, eslintConfigXo(), {filePath});
		t.false(errors.some(error => error.fatal));
		t.false(hasRule(errors, 'jsdoc/no-undefined-types'));
	}
});

test('jsdoc allows browser ambient lib types in javascript', async t => {
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
	t.false(errors.some(error => error.fatal));
	t.false(hasRule(errors, 'jsdoc/no-undefined-types'));
});

test('restricted imports', async t => {
	const errors = await runEslint('import objectAssign from \'object-assign\';\n', eslintConfigXo());
	t.true(hasRule(errors, 'no-restricted-imports'));
});

test('restricted imports - typescript', async t => {
	const errors = await runEslint('import objectAssign from \'object-assign\';\n', eslintConfigXo(), {filePath: 'test/fixture.ts'});
	t.true(hasRule(errors, '@typescript-eslint/no-restricted-imports'));
});

test('typescript - UPPER_CASE module-level const is allowed', async t => {
	const errors = await runEslint(
		'export const SECONDS_PER_DAY = 86_400;\nexport const IS_READY = true;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.false(hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - camelCase module-level const is still allowed', async t => {
	const errors = await runEslint(
		'export const secondsPerDay = 86_400;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.false(hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - non-exported UPPER_CASE module-level const is allowed', async t => {
	const errors = await runEslint(
		'const SECONDS_PER_DAY = 86_400;\nvoid SECONDS_PER_DAY;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.false(hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - single-word UPPER_CASE module-level const is allowed', async t => {
	const errors = await runEslint(
		'export const TIMEOUT = 5000;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.false(hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - UPPER_CASE static readonly class property is allowed', async t => {
	const errors = await runEslint(
		'class Foo {\n\tprivate static readonly PRIME = 16_777_619;\n\tstatic readonly OFFSET = 2_166_136_261;\n}\nvoid Foo;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.false(hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - UPPER_CASE non-static class property is rejected', async t => {
	const errors = await runEslint(
		'class Foo {\n\treadonly MAX_VALUE = 100;\n}\nvoid Foo;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.true(hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('typescript - UPPER_CASE is rejected for local const and non-const', async t => {
	const localConst = await runEslint(
		'export function foo() {\n\tconst MAX_VALUE = 100;\n\treturn MAX_VALUE;\n}\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.true(hasRule(localConst, '@typescript-eslint/naming-convention'));

	const letVariable = await runEslint(
		'export let MAX_VALUE = 100;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.true(hasRule(letVariable, '@typescript-eslint/naming-convention'));
});

test('typescript - quoted/exotic property names are allowed', async t => {
	const errors = await runEslint(
		'const proxy = {\'/api\': {target: \'http://localhost\'},\n\t\'Content-Type\': \'text/html\',\n};\nvoid proxy;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.false(hasRule(errors, '@typescript-eslint/naming-convention'));
});

test('capitalized-comments - does not flag commented-out code keywords', async t => {
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
		t.false(hasRule(errors, 'capitalized-comments'), `Expected no capitalized-comments error for: ${code.trim()}`);
	}
});

test('capitalized-comments - still flags regular lowercase comments', async t => {
	const errors = await runEslint('// this is a regular lowercase comment\n', eslintConfigXo());
	t.true(hasRule(errors, 'capitalized-comments'));
});

test('space', async t => {
	const fixture = `
export function foo() {
\treturn true;
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
		t.is(hasRule(errors, '@stylistic/indent'), expected);
	}
});

test('no TypeScript install skips TypeScript files and omits the parser export', async t => {
	const {temporaryDirectory, configModule} = await loadConfigWithoutTypeScript();
	t.teardown(async () => {
		await fs.rm(temporaryDirectory, {recursive: true, force: true});
	});

	t.is(configModule.typescriptParser, undefined);

	const baseConfig = configModule.default().find(config => config.name === 'xo/base');
	t.deepEqual(baseConfig.files, ['**/*.{js,jsx,mjs,cjs,vue,svelte,astro}']);
	t.deepEqual(baseConfig.settings['import-x/extensions'], ['js', 'jsx', 'mjs', 'cjs', 'vue', 'svelte', 'astro']);

	const errors = await runEslint(
		'const foo: number = 1;\n',
		configModule.default(),
		{filePath: 'test/fixture.ts'},
	);
	t.true(errors[0].fatal);
	t.regex(errors[0].message, /install `typescript` to lint typescript files/iv);

	const declarationErrors = await runEslint(
		'export type Foo = string;\n',
		configModule.default(),
		{filePath: 'index.d.ts'},
	);
	t.is(declarationErrors[0].message, 'File ignored because no matching configuration was supplied.');

	for (const filePath of ['index.d.mts', 'index.d.cts']) {
		// eslint-disable-next-line no-await-in-loop
		const declarationVariantErrors = await runEslint(
			'export type Foo = string;\n',
			configModule.default(),
			{filePath},
		);
		t.is(declarationVariantErrors[0].message, 'File ignored because no matching configuration was supplied.');
	}
});

test('markdown - lints md files', async t => {
	// Fenced code block without a language specifier should trigger fenced-code-language
	const errors = await runEslint(
		'```\ncode\n```\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.md'},
	);
	t.true(hasRule(errors, 'markdown/fenced-code-language'));
});

test('markdown - no-multiple-h1 triggers', async t => {
	const errors = await runEslint(
		'# First\n\n# Second\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.md'},
	);
	t.true(hasRule(errors, 'markdown/no-multiple-h1'));
});

test('markdown - inline disable directives still work', async t => {
	const errors = await runEslint(
		'# First\n\n<!-- eslint-disable-next-line markdown/no-multiple-h1 -->\n# Second\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.md'},
	);
	t.deepEqual(errors, []);
});

test('html - lints html files', async t => {
	// Uppercase tags should trigger the lowercase rule
	const errors = await runEslint(
		'<HTML></HTML>\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.html'},
	);
	t.true(hasRule(errors, '@html-eslint/lowercase'));
});

test('html - indent respects space option', async t => {
	// Fixture uses 2-space indentation
	const fixture = '<!doctype html>\n<html>\n  <body></body>\n</html>\n';

	// Tab config should report an indent error for the 2-space-indented fixture
	const tabErrors = await runEslint(fixture, eslintConfigXo(), {filePath: 'test/fixture.html'});
	t.true(hasRule(tabErrors, '@html-eslint/indent'));

	// Space config (2 spaces) should not report an indent error
	const spaceErrors = await runEslint(fixture, eslintConfigXo({space: true}), {filePath: 'test/fixture.html'});
	t.false(hasRule(spaceErrors, '@html-eslint/indent'));
});

test('regexp - flags a non-optimal character class', async t => {
	// [0-9] should use \d instead
	const errors = await runEslint(
		'export const regex = /[0-9]+/;\n',
		eslintConfigXo(),
	);
	t.true(hasRule(errors, 'regexp/prefer-d'));
});

test('regexp - applies to typescript files', async t => {
	const errors = await runEslint(
		'export const regex = /[0-9]+/;\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	t.true(hasRule(errors, 'regexp/prefer-d'));
});

test('jsdoc - flags missing param description', async t => {
	const errors = await runEslint(
		'/**\n * Does something.\n * @param {string} name\n */\nexport function foo(name) {\n\treturn name;\n}\n',
		eslintConfigXo(),
	);
	t.true(hasRule(errors, 'jsdoc/require-param-description'));
});

test('jsdoc - applies to typescript files', async t => {
	const errors = await runEslint(
		'/**\n * Does something.\n * @param {string} name\n */\nexport function foo(name: string): string {\n\treturn name;\n}\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	// In TypeScript, types in JSDoc should not be used.
	t.true(hasRule(errors, 'jsdoc/no-types'));
});

test('jsdoc - typescript overrides disable type requirements', async t => {
	const errors = await runEslint(
		'/**\n * Does something.\n * @param name - The name.\n * @returns The name.\n */\nexport function foo(name: string): string {\n\treturn name;\n}\n',
		eslintConfigXo(),
		{filePath: 'test/fixture.ts'},
	);
	// TypeScript config should not require @param type or @returns type.
	t.false(hasRule(errors, 'jsdoc/require-param-type'));
	t.false(hasRule(errors, 'jsdoc/require-returns-type'));
});

test('jsdoc - does not require jsdoc on functions', async t => {
	const errors = await runEslint(
		'export function foo() {\n\treturn true;\n}\n',
		eslintConfigXo(),
	);
	t.false(hasRule(errors, 'jsdoc/require-jsdoc'));
});

test('exported file globs include html and md', t => {
	t.true(allExtensions.includes('html'));
	t.true(allExtensions.includes('md'));
	t.is(allFilesGlob, '**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,vue,svelte,astro,html,md}');
});

test('empty braces do not conflict between curly-newline and empty-brace-spaces', async t => {
	const errors = await runEslint('console.log(() => {});\n', eslintConfigXo());
	t.false(hasRule(errors, '@stylistic/curly-newline'));
	t.false(hasRule(errors, 'unicorn/empty-brace-spaces'));
});

test('non-typescript import failures are rethrown', async t => {
	const error = await t.throwsAsync(loadConfigWithoutTypeScript({
		typescriptSource: `
const error = new Error("Cannot find package 'missing-dependency' imported from temporary/typescript.js");
error.code = 'ERR_MODULE_NOT_FOUND';
throw error;
`,
	}));
	t.is(error.code, 'ERR_MODULE_NOT_FOUND');
	t.regex(error.message, /missing-dependency/v);
});
