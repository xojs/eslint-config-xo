import globals from 'globals';
import confusingBrowserGlobals from 'confusing-browser-globals';
import stylistic from '@stylistic/eslint-plugin';
import css from '@eslint/css';
import json from '@eslint/json';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginImport, {createNodeResolver} from 'eslint-plugin-import-x';
import pluginN from 'eslint-plugin-n';
import pluginComments from '@eslint-community/eslint-plugin-eslint-comments';
/// import pluginPromise from 'eslint-plugin-promise';
import pluginAva from 'eslint-plugin-ava';
import {fixupPluginRules} from '@eslint/compat';
import {javascriptRules} from './source/javascript-rules.js';
import {pluginsRules} from './source/plugins-rules.js';
import {jsonConfig, json5Config, jsoncConfig} from './source/json.js';
import {getHtmlConfig} from './source/html.js';
import {getMarkdownConfig} from './source/markdown.js';
import {getRegexpConfig} from './source/regexp.js';
import {getJsdocConfigs} from './source/jsdoc.js';
import noUseExtendNativeRule from './source/rules/no-use-extend-native.js';
import importSpecifierNewlineRule from './source/rules/import-specifier-newline.js';

// Dynamically import TypeScript-related packages so that `typescript` is not
// required when users don't have it installed (JavaScript-only projects).
let ts;
try {
	ts = await import('./source/typescript.js');
} catch (error) {
	if (!isMissingTypeScriptError(error)) {
		throw error;
	}
}

export const tsExtensions = [
	'ts',
	'tsx',
	'mts',
	'cts',
];

export const jsExtensions = [
	'js',
	'jsx',
	'mjs',
	'cjs',
];

export const frameworkExtensions = [
	'vue',
	'svelte',
	'astro',
];

export const htmlExtensions = [
	'html',
];

export const mdExtensions = [
	'md',
];

export const allExtensions = [
	...jsExtensions,
	...tsExtensions,
	...frameworkExtensions,
	...htmlExtensions,
	...mdExtensions,
];
const baseExtensions = [
	...jsExtensions,
	...frameworkExtensions,
];

export const jsFilesGlob = `**/*.{${jsExtensions.join(',')}}`;
export const tsFilesGlob = `**/*.{${tsExtensions.join(',')}}`;
export const allFilesGlob = `**/*.{${allExtensions.join(',')}}`;

export const typescriptParser = ts?.parser;

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

const pluginXo = {
	rules: {
		'import-specifier-newline': importSpecifierNewlineRule,
	},
};

const missingTypeScriptParser = {
	parse() {
		throw new Error('Install `typescript` to lint TypeScript files with eslint-config-xo.');
	},
};

function isMissingTypeScriptError(error) {
	return error instanceof Error
		&& (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'MODULE_NOT_FOUND')
		&& /'typescript'/v.test(error.message);
}

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
	const lintedExtensions = ts ? [...baseExtensions, ...tsExtensions] : baseExtensions;

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
			...(ts ? {'@typescript-eslint': ts.plugin} : {}),
			unicorn: pluginUnicorn,
			'import-x': pluginImport,
			'@eslint-community/eslint-comments': pluginComments,
			'no-use-extend-native': pluginNoUseExtendNative,
			xo: pluginXo,
			ava: pluginAva,
			// TODO: Remove `fixupPluginRules` wrapping when this plugin supports ESLint 10 natively.
			n: fixupPluginRules(pluginN),
			/// promise: fixupPluginRules(pluginPromise),
		},
		files: [
			`**/*.{${lintedExtensions.join(',')}}`,
		],
		settings: {
			'import-x/extensions': lintedExtensions,
			'import-x/core-modules': [
				'electron',
				'atom',
			],
			'import-x/parsers': {
				espree: jsExtensions,
				...(ts ? {'@typescript-eslint/parser': tsExtensions} : {}),
			},
			'import-x/resolver-next': [
				createNodeResolver(),
				...(ts ? [ts.createTypeScriptImportResolver()] : []),
			],
		},
		rules: {
			...pluginsRules,
			...javascriptRules,
			// TODO: When bumping `eslint-plugin-unicorn` to a version that includes `unicorn/no-unnecessary-global-this` (added in https://github.com/sindresorhus/eslint-plugin-unicorn/pull/3161), this will conflict with it. The `confusing-browser-globals` list forces `globalThis.` prefixes for many globals, which `no-unnecessary-global-this` then flags as unnecessary. Narrow this down to only the genuinely confusing globals (`name`, `event`, `closed`, `length`, …) or disable one of the two.
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

	const typescriptConfigs = ts?.getConfigs({
		optionRules: getOptionRules({space, semicolon, typescript: true}),
		tsExtensions,
	}) ?? [];
	const missingTypeScriptConfig = [];
	if (!ts) {
		missingTypeScriptConfig.push({
			name: 'xo/missing-typescript',
			files: [
				tsFilesGlob,
			],
			ignores: [
				'**/*.d.ts',
				'**/*.d.mts',
				'**/*.d.cts',
			],
			languageOptions: {
				parser: missingTypeScriptParser,
			},
		});
	}

	// `eslint-plugin-ava` bundles its own `@eslint/json` copy for its `**/package.json` config, which clashes with our `json` plugin registration on the same files (ESLint forbids defining the same plugin name with two different objects). Reuse our `json` instance so the references match.
	const avaConfigs = pluginAva.configs.recommended.map(avaConfig => avaConfig.plugins?.json
		? {...avaConfig, plugins: {...avaConfig.plugins, json}}
		: avaConfig);

	return [
		{
			ignores: defaultIgnores,
		},
		...avaConfigs,
		config,
		jsonConfig,
		json5Config,
		jsoncConfig,
		getRegexpConfig({files: [`**/*.{${lintedExtensions.join(',')}}`]}),
		...getJsdocConfigs({
			files: [`**/*.{${lintedExtensions.join(',')}}`],
			tsFiles: ts ? [tsFilesGlob] : undefined,
		}),
		getHtmlConfig({space}),
		getMarkdownConfig(),
		...missingTypeScriptConfig,

		{
			plugins: {
				css,
			},
			files: [
				'**/*.css',
			],
			language: 'css/css',
			rules: {
				'css/font-family-fallbacks': 'error',
				'css/no-duplicate-imports': 'error',
				'css/no-duplicate-keyframe-selectors': 'error',
				'css/no-empty-blocks': 'error',
				'css/no-invalid-at-rule-placement': 'error',
				'css/no-invalid-at-rules': 'error',
				'css/no-invalid-named-grid-areas': 'error',
				// TODO: Enable when false positives with CSS variables are fixed: https://github.com/eslint/css/issues/199
				// 'css/no-invalid-properties': 'error',
				'css/no-unmatchable-selectors': 'error',
			},
		},

		...typescriptConfigs,
		{
			files: ['xo.config.{js,ts}'],
			rules: {
				'import-x/no-anonymous-default-export': 'off',
			},
		},
	];
}
