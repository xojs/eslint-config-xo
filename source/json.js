import json from '@eslint/json';
import pluginUnicorn from 'eslint-plugin-unicorn';

const plugins = {
	json,
	unicorn: pluginUnicorn,
};

const jsonRules = {
	...pluginUnicorn.configs['recommended-json'].rules,
	// TODO: Enable again when using `eslint-plugin-unicorn` v81. Its autofix changes the `http:` JSON Schema meta-schema identifiers in `$schema`, which validators look up by the exact URL.
	'unicorn/prefer-https': 'off',
	// Tools and code often require the names of JSON files and their folders, like `locales/en-US.json`, `_locales/zh_CN/messages.json` in browser extensions, and `Contents.json` in Xcode asset catalogs.
	'unicorn/filename-case': 'off',
	// In JSON, it only checks filenames, which tools often require, like `cypress.env.json` and `tsconfig.lib.json`.
	'unicorn/name-replacements': 'off',
	// Not in `eslint-plugin-unicorn`'s JSON config. Catches numbers that parse to a different value, like large IDs.
	'unicorn/no-loss-of-precision': 'error',
	'json/no-duplicate-keys': 'error',
	'json/no-empty-keys': 'error',
	'json/no-unsafe-values': 'error',
	'json/no-unnormalized-keys': 'error',
};

// `jsonConfig` must come before `jsoncConfig` so that files matching both (e.g. `tsconfig.json`) end up with `language: 'json/jsonc'` instead of `'json/json'`, which would reject the JSONC-only `allowTrailingCommas` option.
export const jsonConfig = {
	name: 'xo/json',
	plugins,
	files: [
		'**/*.json',
	],
	language: 'json/json',
	rules: jsonRules,
};

export const jsoncConfig = {
	name: 'xo/jsonc',
	plugins,
	files: [
		'**/*.jsonc',
		'**/{ts,js}config.json',
		'**/{ts,js}config.*.json',
		'**/{,.}dprint.json',
		'.vscode/*.json',
	],
	language: 'json/jsonc',
	languageOptions: {
		allowTrailingCommas: true,
	},
	rules: jsonRules,
};

export const json5Config = {
	name: 'xo/json5',
	plugins,
	files: [
		'**/*.json5',
	],
	language: 'json/json5',
	rules: jsonRules,
};
