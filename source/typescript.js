import typescriptEslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import {typescriptRules, getNamingConventionRule} from './typescript-rules.js';

export const {plugin} = typescriptEslint;
export const {parser} = typescriptEslint;

export function getConfigs({optionRules, tsExtensions}) {
	return [
		{
			name: 'xo/typescript',
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
				// `import-x/extensions` resolves an import to its real `.ts` file and enforces the extension of
				// that resolved file, so it can't model TypeScript ESM's convention of writing `.js` for `.ts`
				// imports. Disabled until it supports this. `n/file-extension-in-import` (kept enabled) handles
				// the convention via its tsconfig-aware extension mapping.
				'import-x/extensions': 'off',
				// Disabled because it doesn't work correctly with TypeScript.
				'import-x/export': 'off',
				// Does not work when the TS definition exports a default const.
				'import-x/default': 'off',
				// Disabled as it doesn't work with TypeScript.
				'import-x/named': 'off',
				// Allow `=` at end of line for multi-line type definitions like `type Foo =\n  | A\n  | B`.
				'@stylistic/operator-linebreak': [
					'error',
					'before',
					{
						overrides: {
							'=': 'after',
						},
					},
				],
				...optionRules,
			},
		},
		{
			name: 'xo/typescript-declaration',
			files: ['**/*.d.ts'],
			rules: {
				'@typescript-eslint/no-unused-vars': 'off',
			},
		},
		{
			name: 'xo/typescript-test-declaration',
			files: ['**/*.test-d.ts'],
			rules: {
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-confusing-void-expression': 'off', // Conflicts with `expectError` assertion.
				'@typescript-eslint/no-unnecessary-type-arguments': 'off',
				'@typescript-eslint/no-unsafe-argument': 'off',
			},
		},
		{
			name: 'xo/typescript-jsx',
			files: ['**/*.tsx'],
			rules: {
				...getNamingConventionRule({isTsx: true}),
			},
		},
	];
}

export {createTypeScriptImportResolver} from 'eslint-import-resolver-typescript';
