import test from 'ava';
import {ESLint} from 'eslint';
import eslintConfigXoNode from '../index.js';
import eslintConfigXoBrowser from '../browser.js';
import eslintConfigXoSpaceNode from '../space.js';
import eslintConfigXoSpaceBrowser from '../space-browser.js';

const hasRule = (errors, ruleId) => errors.some(error => error.ruleId === ruleId);

async function runEslint(string, config) {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: config,
	});

	const [firstResult] = await eslint.lintText(string);

	return firstResult.messages;
}

test('node', async t => {
	for (const config of [eslintConfigXoNode, eslintConfigXoSpaceNode]) {
		t.true(Array.isArray(config));

		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint('\'use strict\';\nconsole.log("unicorn")\n', config);
		t.true(hasRule(errors, 'quotes'), JSON.stringify(errors));
	}
});

test('browser', async t => {
	for (const config of [eslintConfigXoBrowser, eslintConfigXoSpaceBrowser]) {
		t.true(Array.isArray(config));

		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint('\'use strict\';\nprocess.exit();\n', config);
		t.true(hasRule(errors, 'no-undef'), JSON.stringify(errors));
	}
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
				config: eslintConfigXoSpaceNode,
				expected: true,
			},
			{
				config: eslintConfigXoSpaceBrowser,
				expected: true,
			},
			{
				config: eslintConfigXoNode,
				expected: false,
			},
			{
				config: eslintConfigXoBrowser,
				expected: false,
			},
		]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(fixture, config);
		t.is(hasRule(errors, 'indent'), expected, JSON.stringify(errors));
	}
});
