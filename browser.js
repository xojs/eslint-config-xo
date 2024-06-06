import globals from 'globals';
import confusingBrowserGlobals from 'confusing-browser-globals';
import eslintConfigXo from './index.js';

const [nodeConfig] = eslintConfigXo;

const config = {
	...nodeConfig,
	languageOptions: {
		...nodeConfig.languageOptions,
		globals: {
			...globals.es2021,
			...globals.browser,
		},
	},
	rules: {
		...nodeConfig.rules,
		'no-restricted-globals': [
			'error',
			...confusingBrowserGlobals,
		],
	},
};

export default [config];
