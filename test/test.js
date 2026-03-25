import test from 'ava';
import {ESLint} from 'eslint';
import eslintConfigXo from '../index.js';

const hasRule = (errors, ruleId) => errors.some(error => error.ruleId === ruleId);

async function runEslint(string, config, {filePath} = {}) {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: config,
	});

	const [firstResult] = await eslint.lintText(string, {filePath});

	return firstResult.messages;
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
