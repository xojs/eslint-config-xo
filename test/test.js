import test from 'ava';
import {ESLint} from 'eslint';
import configXoNode from '../index.js';
import configXoBrowser from '../browser.js';
import configXoSpaceNode from '../space.js';
import configXoSpaceBrowser from '../space-browser.js';

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
	for (const config of [configXoNode, configXoSpaceNode]) {
		t.true(Array.isArray(config));

		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint('\'use strict\';\nconsole.log("unicorn")\n', config);
		t.true(hasRule(errors, '@stylistic/quotes'), JSON.stringify(errors));
	}
});

test('browser', async t => {
	for (const config of [configXoBrowser, configXoSpaceBrowser]) {
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
				config: configXoSpaceNode,
				expected: true,
			},
			{
				config: configXoSpaceBrowser,
				expected: true,
			},
			{
				config: configXoNode,
				expected: false,
			},
			{
				config: configXoBrowser,
				expected: false,
			},
		]) {
		// eslint-disable-next-line no-await-in-loop
		const errors = await runEslint(fixture, config);
		t.is(hasRule(errors, '@stylistic/indent'), expected, JSON.stringify(errors));
	}
});
