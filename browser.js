import globals from 'globals';
import confusingBrowserGlobals from 'confusing-browser-globals';
import eslintConfigXo from './index.js';

const [config] = eslintConfigXo;

export default [
	{
		...config,
		languageOptions: {
			...config.languageOptions,
			globals: {
				...globals.es2021,
				...globals.browser,
			},
		},
		rules: {
			...config.rules,
			'no-restricted-globals': [
				'error',
				...confusingBrowserGlobals,
			],
		},
	},
];
