import globals from 'globals';
import confusingBrowserGlobals from 'confusing-browser-globals';
import stylistic from '@stylistic/eslint-plugin';
import json from '@eslint/json';
import css from '@eslint/css';
import typescriptEslint from 'typescript-eslint';
import {javascriptRules} from './source/javascript-rules.js';
import {typescriptRules, getNamingConventionRule} from './source/typescript-rules.js';

const TYPESCRIPT_EXTENSION = [
	'ts',
	'tsx',
	'mts',
	'cts',
];

const DEFAULT_EXTENSION = [
	'js',
	'jsx',
	'mjs',
	'cjs',
	...TYPESCRIPT_EXTENSION,
];

const nodeRestrictedGlobals = [
	'error',
	{
		globals: [
			'event',
			// TODO: Enable this in 2028.
			// {
			// 	name: 'Buffer',
			// 	message: 'Use Uint8Array instead. See: https://sindresorhus.com/blog/goodbye-nodejs-buffer',
			// },
			{
				name: 'atob',
				message: 'This API is deprecated. Use https://github.com/sindresorhus/uint8array-extras instead.',
			},
			{
				name: 'btoa',
				message: 'This API is deprecated. Use https://github.com/sindresorhus/uint8array-extras instead.',
			},
		],
		checkGlobalObject: true,
	},
];

const spaceIndentRules = {
	'@stylistic/indent': [
		'error',
		2,
		{
			SwitchCase: 1,
		},
	],
};

const jsonRules = {
	'json/no-duplicate-keys': 'error',
	'json/no-empty-keys': 'error',
	'json/no-unsafe-values': 'error',
	'json/no-unnormalized-keys': 'error',
};

const jsonConfig = {
	plugins: {
		json,
	},
	files: [
		'**/*.json',
	],
	language: 'json/json',
	rules: jsonRules,
};

const jsoncConfig = {
	plugins: {
		json,
	},
	files: [
		'**/*.jsonc',
		'**/tsconfig.json',
		'.vscode/*.json',
	],
	language: 'json/jsonc',
	languageOptions: {
		allowTrailingCommas: true,
	},
	rules: jsonRules,
};

const json5Config = {
	plugins: {
		json,
	},
	files: [
		'**/*.json5',
	],
	language: 'json/json5',
	rules: jsonRules,
};

const cssRules = {
	'css/font-family-fallbacks': 'error',
	'css/no-duplicate-imports': 'error',
	'css/no-duplicate-keyframe-selectors': 'error',
	'css/no-empty-blocks': 'error',
	'css/no-invalid-at-rule-placement': 'error',
	'css/no-invalid-at-rules': 'error',
	'css/no-invalid-named-grid-areas': 'error',
	'css/no-invalid-properties': 'error',
	'css/no-unmatchable-selectors': 'error',
};

// eslint-disable-next-line no-unused-vars
const cssConfig = {
	plugins: {
		css,
	},
	files: [
		'**/*.css',
	],
	language: 'css/css',
	rules: cssRules,
};

export default function eslintConfigXo({browser = false, space = false} = {}) {
	const config = {
		languageOptions: {
			globals: {
				...globals.es2021,
				...(browser ? globals.browser : globals.nodeBuiltin),
			},
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: 'error',
			reportUnusedInlineConfigs: 'error',
		},
		plugins: {
			'@stylistic': stylistic,
		},
		files: [
			`**/*.{${DEFAULT_EXTENSION.join(',')}}`,
		],
		rules: {
			...javascriptRules,
			'no-restricted-globals': browser
				? ['error', ...confusingBrowserGlobals]
				: nodeRestrictedGlobals,
			...(space ? spaceIndentRules : {}),
		},
	};

	const spaces = typeof space === 'number'
		? space
		: 2;

	const typescriptConfig = {
		files: [`**/*.{${TYPESCRIPT_EXTENSION.join(',')}}`],
		plugins: {
			'@typescript-eslint': typescriptEslint.plugin,
			'@stylistic': stylistic,
		},
		languageOptions: {
			sourceType: 'module',
			parser: typescriptEslint.parser,
			parserOptions: {
				projectService: true,
				warnOnUnsupportedTypeScriptVersion: false,
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		// Disabled temporarily.
		// settings: {
		// 	'import/resolver': {
		// 		node: {
		// 			extensions: [
		// 				'.js',
		// 				'.jsx',
		// 				'.ts',
		// 				'.tsx'
		// 			]
		// 		}
		// 	},
		// 	'import/parsers': {
		// 		[require.resolve('@typescript-eslint/parser')]: [
		// 			'.ts',
		// 			'.tsx'
		// 		]
		// 	}
		// },
		rules: {
			...typescriptRules,
			...(space
				? {
					'@stylistic/indent': [
						'error',
						spaces,
						{
							SwitchCase: 1,
						},
					],
				}
				: {}),
		},
	};

	return [
		config,
		// `jsonConfig` must come before `jsoncConfig` so that files matching both (e.g. `tsconfig.json`) end up with `language: 'json/jsonc'` instead of `'json/json'`, which would reject the JSONC-only `allowTrailingCommas` option.
		jsonConfig,
		json5Config,
		jsoncConfig,

		// Disabled for now until it becomes more stable.
		// cssConfig,

		typescriptConfig,
		{
			files: ['**/*.d.ts'],
			rules: {
				'@typescript-eslint/no-unused-vars': 'off',
			},
		},
		{
			files: ['**/*.test-d.ts'],
			rules: {
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-confusing-void-expression': 'off', // Conflicts with `expectError` assertion.
			},
		},
		{
			files: ['**/*.tsx'],
			rules: {
				...getNamingConventionRule({isTsx: true}),
			},
		},
	];
}
