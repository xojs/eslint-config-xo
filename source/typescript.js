import typescriptEslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import {typescriptRules, getNamingConventionRule} from './typescript-rules.js';

export const {plugin} = typescriptEslint;
export const {parser} = typescriptEslint;

export function getConfigs({optionRules, tsExtensions}) {
	return [
		{
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
			rules: {
				...typescriptRules,
				'unicorn/import-style': 'off',
				'n/file-extension-in-import': 'off',
				// Disabled because it doesn't work correctly with TypeScript.
				'import-x/export': 'off',
				// Does not work when the TS definition exports a default const.
				'import-x/default': 'off',
				// Disabled as it doesn't work with TypeScript.
				'import-x/named': 'off',
				...optionRules,
			},
		},
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

export {createTypeScriptImportResolver} from 'eslint-import-resolver-typescript';
