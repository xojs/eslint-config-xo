import globals from 'globals';
import confusingBrowserGlobals from 'confusing-browser-globals';
import eslintConfigXo from './index.js';

export default {
	...eslintConfigXo,
	languageOptions: {
		...eslintConfigXo.languageOptions,
		globals: {
			...globals.es2021,
			...globals.browser,
		},
	},
	rules: {
		...eslintConfigXo.rules,
		'no-restricted-globals': [
			'error',
			...confusingBrowserGlobals,
		],
	},
};
