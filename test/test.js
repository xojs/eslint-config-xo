import test from 'ava';
import isPlainObj from 'is-plain-obj';
import eslint from 'eslint';
import tempWrite from 'temp-write';

const hasRule = (errors, ruleId) => errors.some(x => x.ruleId === ruleId);

function runEslint(str, conf) {
	const linter = new eslint.CLIEngine({
		useEslintrc: false,
		configFile: tempWrite.sync(JSON.stringify(conf)),
	});

	return linter.executeOnText(str).results[0].messages;
}

test('main', t => {
	const conf = require('../');

	t.true(isPlainObj(conf));
	t.true(isPlainObj(conf.rules));

	const errors = runEslint('\'use strict\';\nconsole.log("unicorn")\n', conf);
	t.true(hasRule(errors, 'quotes'));
});

test('browser', t => {
	const conf = require('../browser');

	t.true(isPlainObj(conf));

	const errors = runEslint('\'use strict\';\nprocess.exit();\n', conf);
	t.true(hasRule(errors, 'no-undef'));
});
