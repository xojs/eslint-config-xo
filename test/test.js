'use strict';
var test = require('ava');
var isPlainObj = require('is-plain-obj');
var eslint = require('eslint');
var tempWrite = require('temp-write');
var clearRequire = require('clear-require');

function runEslint(str, conf) {
	var linter = new eslint.CLIEngine({
		useEslintrc: false,
		configFile: tempWrite.sync(JSON.stringify(conf))
	});

	return linter.executeOnText(str).results[0].messages;
}

test('main', function (t) {
	clearRequire.all();
	var conf = require('../');

	t.assert(isPlainObj(conf));
	t.assert(isPlainObj(conf.env));
	t.assert(isPlainObj(conf.rules));

	var errors = runEslint('\'use strict\';\nconsole.log("unicorn")\n', conf);
	t.assert(errors[0].ruleId === 'quotes');
	t.assert(errors[1].ruleId === 'semi');

	t.end();
});

test('esnext', function (t) {
	clearRequire.all();
	var conf = require('../esnext');

	t.assert(isPlainObj(conf));
	t.assert(isPlainObj(conf.env));
	t.assert(isPlainObj(conf.rules));

	var errors = runEslint('class Foo {}\n', conf);
	t.assert(errors[0].ruleId === 'no-unused-vars');

	t.end();
});

test('browser', function (t) {
	clearRequire.all();
	var conf = require('../browser');

	t.assert(isPlainObj(conf));
	t.assert(isPlainObj(conf.env));
	t.assert(isPlainObj(conf.rules));

	var errors = runEslint('\'use strict\';\nprocess.exit();\n', conf);
	t.assert(errors[0].ruleId === 'no-undef');

	t.end();
});
