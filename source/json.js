import json from '@eslint/json';

const jsonRules = {
	'json/no-duplicate-keys': 'error',
	'json/no-empty-keys': 'error',
	'json/no-unsafe-values': 'error',
	'json/no-unnormalized-keys': 'error',
};

// `jsonConfig` must come before `jsoncConfig` so that files matching both (e.g. `tsconfig.json`) end up with `language: 'json/jsonc'` instead of `'json/json'`, which would reject the JSONC-only `allowTrailingCommas` option.
export const jsonConfig = {
	plugins: {
		json,
	},
	files: [
		'**/*.json',
	],
	language: 'json/json',
	rules: jsonRules,
};

export const jsoncConfig = {
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

export const json5Config = {
	plugins: {
		json,
	},
	files: [
		'**/*.json5',
	],
	language: 'json/json5',
	rules: jsonRules,
};
