'use strict';
var path = require('path');

module.exports = {
	extends: path.join(__dirname, 'index.js'),
	parser: 'babel-eslint',
	plugins: ['babel'],
	rules: {
		'no-var': 2,
		'prefer-arrow-callback': 2,
		'prefer-const': 2,

		// disabled since latest Node.js LTS doesn't yet support it
		// 'prefer-reflect': [2, {exceptions: ['delete']}],
		// 'prefer-rest-params': 2,
		'prefer-template': 2,
		'prefer-spread': 2,

		// disable builtin rules that are incompatible with Babel plugin ones
		'object-shorthand': 0,
		'generator-star-spacing': 0,
		'arrow-parens': 0,
		'object-curly-spacing': 0,

		'babel/object-shorthand': [2, 'always'],
		'babel/generator-star-spacing': [2, 'both'],
		'babel/arrow-parens': [2, 'as-needed'],
		'babel/object-curly-spacing': [2, 'never']
	}
};
