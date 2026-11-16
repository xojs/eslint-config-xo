import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {includeIgnoreFile} from 'eslint/config';
import globals from 'globals';
import confusingBrowserGlobals from 'confusing-browser-globals';
import stylistic from '@stylistic/eslint-plugin';
import css from '@eslint/css';
import json from '@eslint/json';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginImport, {createNodeResolver} from 'eslint-plugin-import-x';
import pluginN from 'eslint-plugin-n';
import pluginComments from '@eslint-community/eslint-plugin-eslint-comments';
import pluginNodeTest from 'eslint-node-test';
import pluginPackageJson from 'eslint-package-json';
import pluginCssicorn from 'eslint-cssicorn';
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
];

export const jsExtensions = [
	'js',
	'jsx',
	'mjs',
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

export const jsonExtensions = [
	'json',
	'jsonc',
	'json5',
];

export const cssExtensions = [
	'css',
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
	'**/*.min.css',
	'vendor/**',
	'dist/**',
	'tap-snapshots/*.{cjs,js}',
	'**/package-lock.json',
	'**/npm-shrinkwrap.json',
];

const pluginNoUseExtendNative = {
	rules: {
		'no-use-extend-native': noUseExtendNativeRule,
	},
};

const missingTypeScriptParser = {
	parse() {
		throw new Error('Install `typescript` to lint TypeScript files with eslint-config-xo.');
	},
};

const missingTypeScriptConfig = {
	name: 'xo/missing-typescript',
	files: [
		tsFilesGlob,
	],
	ignores: [
		'**/*.d.ts',
		'**/*.d.mts',
	],
	languageOptions: {
		parser: missingTypeScriptParser,
	},
};

function isMissingTypeScriptError(error) {
	return error instanceof Error
		&& (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'MODULE_NOT_FOUND')
		&& /'typescript'/v.test(error.message);
}

function getGitignoreConfig(configUrl) {
	if (!configUrl) {
		return;
	}

	if (!configUrl.startsWith('file://')) {
		throw new TypeError('The `gitignore` option must be a `file://` URL. Pass `import.meta.url` from your ESLint config file.');
	}

	// `includeIgnoreFile` requires an absolute path, so the `file://` URL cannot be passed directly.
	const gitignorePath = fileURLToPath(new URL('.gitignore', configUrl));

	// Skip silently when there is no `.gitignore`, so opting in never crashes.
	return fs.existsSync(gitignorePath) ? includeIgnoreFile(gitignorePath, {name: 'xo/gitignore', gitignoreResolution: true}) : undefined;
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
	'prefer-arrow-callback': ['error', {allowNamedFunctions: true}],
	'arrow-body-style': 'error',
};

/**
Stylistic rules that conflict with Prettier but are not turned off by `eslint-config-prettier` yet.
*/
const prettierConflictingRules = {
	'@stylistic/list-style': 'off',
};

export function getPrettierConfig({prettier, space, semicolon, files}) {
	if (!prettier) {
		return;
	}

	// `'compat'` only disables stylistic rules that conflict with Prettier, for users who run Prettier separately.
	if (prettier === 'compat') {
		return {
			name: 'xo/prettier-compat',
			...(files && {files}),
			rules: {
				...eslintConfigPrettier.rules,
				...prettierConflictingRules,
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
			...prettierConflictingRules,
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
	gitignore,
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
			n: pluginN,
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
			// `import-x/extensions` resolves imports to the real `.ts` target and demands a `.ts` extension, breaking TypeScript ESM's `.js`-for-`.ts` convention. Disable it for all file types (including framework files like `.vue`/`.svelte`/`.astro`) whenever TypeScript resolution is active. Extension enforcement is handled by `n/file-extension-in-import` instead.
			...(ts && {'import-x/extensions': 'off'}),
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
	const nodeTestConfig = {
		...pluginNodeTest.configs.recommended,
		files: [`**/*.{${lintedExtensions.join(',')}}`],
	};

	// `eslint-package-json` bundles its own `@eslint/json` copy for its `**/package.json` config, which clashes with our `json` plugin registration on the same files (ESLint forbids defining the same plugin name with two different objects). Reuse our `json` instance so the references match.
	const packageJsonConfig = {
		...pluginPackageJson.configs.recommended,
		name: 'xo/package-json',
		plugins: {
			...pluginPackageJson.configs.recommended.plugins,
			json,
		},
		rules: {
			...pluginPackageJson.configs.recommended.rules,
			'package-json/no-exact-peer-dependencies': 'error',
			'package-json/no-local-dependencies': 'error',
			'package-json/no-redundant-repository-fields': 'error',
			'package-json/restrict-fields-when-private': 'error',
		},
	};

	// Must come last so it overrides the stylistic rules from the base and TypeScript configs.
	const prettierConfig = getPrettierConfig({
		prettier,
		space,
		semicolon,
		files: [`**/*.{${lintedExtensions.join(',')}}`],
	});

	const gitignoreConfig = getGitignoreConfig(gitignore);

	return [
		{
			name: 'xo/ignores',
			ignores: defaultIgnores,
		},
		...(gitignoreConfig ? [gitignoreConfig] : []),
		nodeTestConfig,
		config,
		jsonConfig,
		json5Config,
		jsoncConfig,
		packageJsonConfig,
		getRegexpConfig({files: [`**/*.{${lintedExtensions.join(',')}}`]}),
		...getJsdocConfigs({
			files: [`**/*.{${lintedExtensions.join(',')}}`],
			tsFiles: ts ? [tsFilesGlob] : undefined,
		}),
		getHtmlConfig({space, prettier}),
		getMarkdownConfig(),
		...(ts ? [] : [missingTypeScriptConfig]),

		{
			name: 'xo/css',
			plugins: {
				css,
				cssicorn: pluginCssicorn,
				unicorn: pluginUnicorn,
			},
			files: [
				'**/*.css',
			],
			language: 'css/css',
			rules: {
				...pluginUnicorn.configs['recommended-css'].rules,
				// Only check filenames. Class and custom property names often come from third-party stylesheets, like Bootstrap's `.btn`, which users cannot rename.
				'unicorn/name-replacements': [
					'error',
					{
						checkVariables: false,
					},
				],
				// It only checks class and other names in CSS, which often come from third-party stylesheets, like WordPress's `.sub-menu`.
				'unicorn/consistent-compound-words': 'off',
				// Not in `eslint-plugin-unicorn`'s CSS config. Catches numbers that cannot be represented exactly.
				'unicorn/no-loss-of-precision': 'error',
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
				...pluginCssicorn.configs.recommended.rules,
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
