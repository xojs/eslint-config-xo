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
		'prefer-reflect': ['error', {exceptions: ['delete']}],
		'prefer-rest-params': 'error',
		'prefer-spread': 'error',
		'prefer-destructuring': [
			'error',
			{
				array: true,
				object: true
			}
		]
	}
};
