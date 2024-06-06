import test from 'ava';
import isPlainObj from 'is-plain-obj';
import {ESLint} from 'eslint';
import eslintConfigXoNode from '../index.js';
import eslintConfigXoBrowser from '../browser.js';

const hasRule = (errors, ruleId) => errors.some(error => error.ruleId === ruleId);

async function runEslint(string, config) {
	const eslint = new ESLint({
		overrideConfigFile: true,
		overrideConfig: config,
	});

	const [firstResult] = await eslint.lintText(string);

	return firstResult.messages;
}

test('main', async t => {
	t.true(isPlainObj(eslintConfigXoNode));
	t.true(isPlainObj(eslintConfigXoNode.rules));

	const errors = await runEslint('\'use strict\';\nconsole.log("unicorn")\n', eslintConfigXoNode);
	t.true(hasRule(errors, 'quotes'), JSON.stringify(errors));
});

test('browser', async t => {
	t.true(isPlainObj(eslintConfigXoBrowser));

	const errors = await runEslint('\'use strict\';\nprocess.exit();\n', eslintConfigXoBrowser);
	t.true(hasRule(errors, 'no-undef'), JSON.stringify(errors));
});
