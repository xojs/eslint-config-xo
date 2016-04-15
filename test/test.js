import test from 'ava';
import isPlainObj from 'is-plain-obj';
import eslint from 'eslint';
import tempWrite from 'temp-write';

function runEslint(str, conf) {
	const linter = new eslint.CLIEngine({
		useEslintrc: false,
		configFile: tempWrite.sync(JSON.stringify(conf))
	});

	return linter.executeOnText(str).results[0].messages;
}

test('main', t => {
	const conf = require('../');

	t.true(isPlainObj(conf));
	t.true(isPlainObj(conf.rules));

	const errors = runEslint('\'use strict\';\nconsole.log("unicorn")\n', conf);
	t.is(errors[0].ruleId, 'quotes');
});

test('esnext', t => {
	const conf = require('../esnext');

	t.true(isPlainObj(conf));
	t.true(isPlainObj(conf.rules));

	const errors = runEslint('var foo = true;\n', conf);
	t.is(errors[0].ruleId, 'no-var');
});

test('esnext es2016', t => {
	const conf = require('../esnext');

	t.true(isPlainObj(conf));
	t.true(isPlainObj(conf.rules));

	const errors = runEslint('let unused; const x = async () => {\n\tawait Promise.resolve({b: 1, ...x});\n};\n', conf);
	t.is(errors[0].ruleId, 'no-unused-vars');
});

test('browser', t => {
	const conf = require('../browser');

	t.true(isPlainObj(conf));

	const errors = runEslint('\'use strict\';\nprocess.exit();\n', conf);
	t.is(errors[0].ruleId, 'no-undef');
});
