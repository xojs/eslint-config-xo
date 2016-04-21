'use strict';
var path = require('path');

module.exports = {
	extends: path.join(__dirname, 'index.js'),
	parser: 'babel-eslint',
	plugins: ['babel'],
	rules: {
		'no-var': 2,
		'prefer-arrow-callback': 2,
		'prefer-const': [2, {destructuring: 'all'}],

		// disabled since latest Node.js LTS doesn't yet support it
		// 'prefer-reflect': [2, {exceptions: ['delete']}],
		// 'prefer-rest-params': 2,
		'prefer-template': 2,
		// 'prefer-spread': 2,

		// disable builtin rules that are incompatible with Babel plugin ones
		'generator-star-spacing': 0,
		'new-cap': 0,
		'array-bracket-spacing': 0,
		'object-curly-spacing': 0,
		'object-shorthand': 0,
		'arrow-parens': 0,

		'babel/generator-star-spacing': [2, 'both'],
		'babel/new-cap': [2, {newIsCap: true, capIsNew: true}],
		'babel/array-bracket-spacing': [2, 'never'],
		'babel/object-curly-spacing': [2, 'never'],
		'babel/object-shorthand': [2, 'always'],
		'babel/arrow-parens': [2, 'as-needed'],
		'babel/no-await-in-loop': 2
	}
};
