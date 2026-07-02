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
import pluginNodeTest from 'eslint-node-test';
import {fixupPluginRules} from '@eslint/compat';
import pluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
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

// Well-known, unambiguous browser globals that are routinely used bare. We exclude these from `confusing-browser-globals` so `no-restricted-globals` does not force a `globalThis.` prefix on them.
const allowedBrowserGlobals = new Set(['location', 'history', 'confirm', 'screen']);

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
	} else {
		rules['@stylistic/indent'] = ['error', 'tab', {SwitchCase: 1}];
		rules['@stylistic/indent-binary-ops'] = ['error', 'tab'];
	}

	if (!semicolon) {
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

/**
Rules from `eslint-config-prettier`'s "special rules" list that XO configures and are safe to use with Prettier.
@see https://github.com/prettier/eslint-config-prettier#special-rules
*/
const prettierCompatibleSpecialRules = {
	curly: 'error',
	'no-unexpected-multiline': 'error',
	'@stylistic/no-mixed-operators': [
		'error',
		{
			groups: [
				['+', '-', '*', '/', '%', '**', '??'],
				['&', '|', '^', '~', '<<', '>>', '>>>', '??'],
				['==', '!=', '===', '!==', '>', '>=', '<', '<=', '??'],
				['&&', '||', '??'],
				['in', 'instanceof', '??'],
			],
		},
	],
	'prefer-arrow-callback': ['error', {allowNamedFunctions: true}],
	'arrow-body-style': 'error',
};

export function getPrettierConfig({prettier, space, semicolon, files}) {
	if (!prettier) {
		return undefined;
	}

	// `'compat'` only disables stylistic rules that conflict with Prettier, for users who run Prettier separately.
	if (prettier === 'compat') {
		return {
			name: 'xo/prettier-compat',
			...(files && {files}),
			rules: {
				...eslintConfigPrettier.rules,
				...prettierCompatibleSpecialRules,
			},
		};
	}

	return {
		name: 'xo/prettier',
		...(files && {files}),
		plugins: {
			prettier: pluginPrettier,
		},
		rules: {
			...pluginPrettier.configs?.recommended?.rules,
			'prettier/prettier': [
				'error',
				{
					singleQuote: true,
					bracketSpacing: false,
					bracketSameLine: false,
					trailingComma: 'all',
					tabWidth: typeof space === 'number' ? space : 2,
					useTabs: !space,
					semi: semicolon,
				},
			],
			...eslintConfigPrettier.rules,
			...prettierCompatibleSpecialRules,
			// XO controls Prettier here (`singleQuote: true`), so single-quote enforcement stays consistent.
			'@stylistic/quotes': ['error', 'single', {avoidEscape: true}],
		},
	};
}

export default function eslintConfigXo({
	browser = false,
	space = false,
	semicolon = true,
	prettier = false,
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
			...(ts && {'@typescript-eslint': ts.plugin}),
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
				...(ts && {'@typescript-eslint/parser': tsExtensions}),
			},
			'import-x/resolver-next': [
				createNodeResolver(),
				...(ts ? [ts.createTypeScriptImportResolver()] : []),
			],
		},
		rules: {
			...pluginsRules,
			...javascriptRules,
			// In browser mode, `confusing-browser-globals` (via `no-restricted-globals`) forces a `globalThis.` prefix for confusing globals like `name` and `length`, which `unicorn/no-unnecessary-global-this` would otherwise flag as unnecessary. Disable it here to avoid the contradiction. It stays enabled for non-browser code, where it's useful and conflict-free.
			...(browser && {'unicorn/no-unnecessary-global-this': 'off'}),
			'no-restricted-globals': browser
				? ['error', ...confusingBrowserGlobals.filter(name => !allowedBrowserGlobals.has(name))]
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
	const avaConfigs = pluginAva.configs.recommended.map(avaConfig => {
		const namedAvaConfig = {
			...avaConfig,
			name: avaConfig.files?.includes('**/package.json') ? 'xo/ava-package-json' : 'xo/ava',
		};

		return namedAvaConfig.plugins?.json
			? {...namedAvaConfig, plugins: {...namedAvaConfig.plugins, json}}
			: namedAvaConfig;
	});

	const nodeTestConfig = {
		...pluginNodeTest.configs.recommended,
		files: [`**/*.{${lintedExtensions.join(',')}}`],
	};

	// Must come last so it overrides the stylistic rules from the base and TypeScript configs.
	const prettierConfig = getPrettierConfig({
		prettier,
		space,
		semicolon,
		files: [`**/*.{${lintedExtensions.join(',')}}`],
	});

	return [
		{
			name: 'xo/ignores',
			ignores: defaultIgnores,
		},
		...avaConfigs,
		nodeTestConfig,
		config,
		jsonConfig,
		json5Config,
		jsoncConfig,
		getRegexpConfig({files: [`**/*.{${lintedExtensions.join(',')}}`]}),
		...getJsdocConfigs({
			files: [`**/*.{${lintedExtensions.join(',')}}`],
			tsFiles: ts ? [tsFilesGlob] : undefined,
		}),
		getHtmlConfig({space, prettier}),
		getMarkdownConfig(),
		...missingTypeScriptConfig,

		{
			name: 'xo/css',
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
			name: 'xo/config-file',
			files: ['xo.config.{js,ts}'],
			rules: {
				'import-x/no-anonymous-default-export': 'off',
			},
		},
		...(prettierConfig ? [prettierConfig] : []),
	];
}
