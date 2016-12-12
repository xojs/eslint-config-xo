'use strict';
const path = require('path');

module.exports = {
	extends: path.join(__dirname, 'index.js'),
	rules: {
		'no-var': 'error',
		'object-shorthand': ['error', 'always'],
		'prefer-arrow-callback': 'error',
		'prefer-const': ['error', {
			destructuring: 'all'
		}],
		'prefer-numeric-literals': 2

		// Disabled since latest Node.js LTS doesn't yet support it
		// 'prefer-reflect': ['error', {exceptions: ['delete']}],

		// 'prefer-rest-params': 'error',

		// disabled because of https://github.com/eslint/eslint/issues/6572
		// 'prefer-template': 'error',

		// 'prefer-spread': 'error',
	}
};
