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

test('exported file globs include html', t => {
	t.true(allExtensions.includes('html'));
	t.is(allFilesGlob, '**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,vue,svelte,astro,html}');
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
