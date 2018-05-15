'use strict';
const path = require('path');

module.exports = {
	extends: path.join(__dirname, 'index.js'),
	rules: {
		'no-var': 'error',
		'object-shorthand': ['error', 'always'],
		'prefer-arrow-callback': ['error', {allowNamedFunctions: true}],
		'prefer-const': [
			'error',
			{
				destructuring: 'all'
			}
		],
		'prefer-numeric-literals': 2,
		'prefer-rest-params': 'error',
		'prefer-spread': 'error',
		'prefer-destructuring': [
			'error',
			{
				// Disabled because it forces destructuring on
				// stupid stuff like `foo.bar = process.argv[2];`
				// TODO: Open ESLint issue about this
				// array: true,
				object: true
			}
		]
	}
};
