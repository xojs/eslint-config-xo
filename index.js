import globals from 'globals';
import confusingBrowserGlobals from 'confusing-browser-globals';
import stylistic from '@stylistic/eslint-plugin';
import css from '@eslint/css'; // eslint-disable-line no-unused-vars
import typescriptEslint from 'typescript-eslint';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginImport from 'eslint-plugin-import-x';
import pluginN from 'eslint-plugin-n';
import pluginComments from '@eslint-community/eslint-plugin-eslint-comments';
/// import pluginPromise from 'eslint-plugin-promise';
import pluginAva from 'eslint-plugin-ava';
import {fixupPluginRules} from '@eslint/compat';
import {javascriptRules} from './source/javascript-rules.js';
import {typescriptRules, getNamingConventionRule} from './source/typescript-rules.js';
import {pluginsRules} from './source/plugins-rules.js';
import {jsonConfig, json5Config, jsoncConfig} from './source/json.js';
import noUseExtendNativeRule from './source/rules/no-use-extend-native.js';

export const tsExtensions = ['ts', 'tsx', 'mts', 'cts'];
export const jsExtensions = ['js', 'jsx', 'mjs', 'cjs'];
export const frameworkExtensions = ['vue', 'svelte', 'astro'];
export const allExtensions = [...jsExtensions, ...tsExtensions, ...frameworkExtensions];

export const jsFilesGlob = `**/*.{${jsExtensions.join(',')}}`;
export const tsFilesGlob = `**/*.{${tsExtensions.join(',')}}`;
export const allFilesGlob = `**/*.{${allExtensions.join(',')}}`;

export const typescriptParser = typescriptEslint.parser;

export const defaultIgnores = [
	'**/node_modules/**',
	'**/bower_components/**',
	'flow-typed/**',
	'coverage/**',
	'{tmp,temp}/**',
	'**/*.min.js',
	'vendor/**',
	'dist/**',
	'tap-snapshots/*.{cjs,js}',
];

const pluginNoUseExtendNative = {
	rules: {
		'no-use-extend-native': noUseExtendNativeRule,
	},
};

function getOptionRules({
	space = false,
	semicolon = true,
	typescript = false,
} = {}) {
	const rules = {};

	if (space) {
		const spaces = typeof space === 'number' ? space : 2;
		rules['@stylistic/indent'] = ['error', spaces, {SwitchCase: 1}];
		rules['@stylistic/indent-binary-ops'] = ['error', spaces];
	} else if (space === false) {
		rules['@stylistic/indent'] = ['error', 'tab', {SwitchCase: 1}];
		rules['@stylistic/indent-binary-ops'] = ['error', 'tab'];
	}

	if (semicolon === false) {
		rules['@stylistic/semi'] = ['error', 'never'];
		rules['@stylistic/semi-spacing'] = ['error', {before: false, after: true}];

		if (typescript) {
			rules['@stylistic/member-delimiter-style'] = [
				'error',
				{
					multiline: {delimiter: 'none'},
					singleline: {delimiter: 'comma', requireLast: false},
				},
			];
		}
	}

	return rules;
}

export default function eslintConfigXo({
	browser = false,
	space = false,
	semicolon = true,
} = {}) {
	const config = {
		name: 'xo/base',
		languageOptions: {
			globals: {
				...globals.es2021,
				...(browser ? globals.browser : globals.node),
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
			'@typescript-eslint': typescriptEslint.plugin,
			unicorn: pluginUnicorn,
			'import-x': pluginImport,
			'@eslint-community/eslint-comments': pluginComments,
			'no-use-extend-native': pluginNoUseExtendNative,
			ava: pluginAva,
			// TODO: Remove `fixupPluginRules` wrapping when this plugin supports ESLint 10 natively.
			n: fixupPluginRules(pluginN),
			/// promise: fixupPluginRules(pluginPromise),
		},
		files: [
			`**/*.{${allExtensions.join(',')}}`,
		],
		settings: {
			'import-x/extensions': allExtensions,
			'import-x/core-modules': [
				'electron',
				'atom',
			],
			'import-x/parsers': {
				espree: jsExtensions,
				'@typescript-eslint/parser': tsExtensions,
			},
			'import-x/external-module-folders': [
				'node_modules',
				'node_modules/@types',
			],
			'import-x/resolver': {
				node: allExtensions,
			},
		},
		rules: {
			...pluginsRules,
			...javascriptRules,
			'no-restricted-globals': browser
				? ['error', ...confusingBrowserGlobals]
				: [
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
				],
			...getOptionRules({space, semicolon}),
		},
	};

	const typescriptConfig = {
		files: [`**/*.{${tsExtensions.join(',')}}`],
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
			'unicorn/import-style': 'off',
			'n/file-extension-in-import': 'off',
			// Disabled because of https://github.com/benmosher/eslint-plugin-import-x/issues/1590
			'import-x/export': 'off',
			// Does not work when the TS definition exports a default const.
			'import-x/default': 'off',
			// Disabled as it doesn't work with TypeScript.
			// This issue and some others: https://github.com/benmosher/eslint-plugin-import-x/issues/1341
			'import-x/named': 'off',
			...getOptionRules({space, semicolon, typescript: true}),
		},
	};

	return [
		{
			ignores: defaultIgnores,
		},
		...pluginAva.configs.recommended,
		config,
		jsonConfig,
		json5Config,
		jsoncConfig,

		// Disabled for now until it becomes more stable.
		// {
		// 	plugins: {
		// 		css,
		// 	},
		// 	files: [
		// 		'**/*.css',
		// 	],
		// 	language: 'css/css',
		// 	rules: {
		// 		'css/font-family-fallbacks': 'error',
		// 		'css/no-duplicate-imports': 'error',
		// 		'css/no-duplicate-keyframe-selectors': 'error',
		// 		'css/no-empty-blocks': 'error',
		// 		'css/no-invalid-at-rule-placement': 'error',
		// 		'css/no-invalid-at-rules': 'error',
		// 		'css/no-invalid-named-grid-areas': 'error',
		// 		'css/no-invalid-properties': 'error',
		// 		'css/no-unmatchable-selectors': 'error',
		// 	},
		// },

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
		{
			files: ['xo.config.{js,ts}'],
			rules: {
				'import-x/no-anonymous-default-export': 'off',
			},
		},
	];
}
