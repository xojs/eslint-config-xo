import pluginJsdoc from 'eslint-plugin-jsdoc';

const filePragmaTags = [
	'jest-environment',
	'ts-check',
	'ts-expect-error',
	'ts-expect-no-error',
	'ts-ignore',
	'ts-nocheck',
	'vitest-environment',
];

const typeScriptDocTags = [
	'defaultValue',
];

const unicornDocTags = [
	'isolated', // Used by `unicorn/isolated-functions`.
];

export function getJsdocConfigs({files, tsFiles}) {
	return [
		{
			name: 'xo/jsdoc',
			plugins: {
				jsdoc: pluginJsdoc,
			},
			files,
			rules: {
				// Validation
				'jsdoc/check-access': 'error',
				// Disabled: conflicts with our indented, asterisk-free JSDoc style. In an indented multi-paragraph block, the empty line between paragraphs is reported as misaligned, but indenting it to satisfy the rule would introduce trailing whitespace (itself a violation), so the two requirements cannot both be met.
				'jsdoc/check-alignment': 'off',
				'jsdoc/check-indentation': 'error',
				'jsdoc/check-line-alignment': 'error',
				'jsdoc/check-param-names': 'error',
				'jsdoc/check-property-names': 'error',
				'jsdoc/check-syntax': 'error',
				'jsdoc/check-tag-names': [
					'error',
					{
						definedTags: [
							...filePragmaTags,
							...typeScriptDocTags,
							...unicornDocTags,
						],
						jsxTags: true,
					},
				],
				'jsdoc/check-template-names': 'error',
				'jsdoc/check-types': 'error',
				'jsdoc/check-values': 'error',

				// Formatting
				'jsdoc/convert-to-jsdoc-comments': 'off',
				'jsdoc/empty-tags': 'error',
				'jsdoc/escape-inline-tags': 'error',

				// The rule is dumb and doesn't handle:
				// export type Options = {
				//		/**
				//		Foo
				//		*/
				// 'jsdoc/lines-before-block': 'error',

				'jsdoc/multiline-blocks': 'error',
				'jsdoc/no-bad-blocks': 'error',
				'jsdoc/no-blank-block-descriptions': 'error',
				'jsdoc/no-blank-blocks': 'error',
				// `preventAtMiddleLines` is disabled to allow `**bold**` Markdown at the start of JSDoc content lines, which otherwise gets misinterpreted as a multi-asterisk prefix.
				'jsdoc/no-multi-asterisks': ['error', {preventAtMiddleLines: false}],
				'jsdoc/require-asterisk-prefix': [
					'error',
					'never',
				],
				'jsdoc/sort-tags': 'off', // Too opinionated. Too much churn.
				'jsdoc/tag-lines': ['error', 'any', {startLines: null}],
				'jsdoc/type-formatting': 'off', // It's marked as experimental.

				// Content
				'jsdoc/implements-on-classes': 'error',
				'jsdoc/imports-as-dependencies': 'error',
				// `@default` is excluded because values like `[]` or `{}` contain no word characters, causing the rule to incorrectly flag them as uninformative.
				'jsdoc/informative-docs': ['error', {excludedTags: ['default']}],
				'jsdoc/match-description': 'off',
				'jsdoc/match-name': 'off',
				// It's buggy and seem to apply to getters even when we specify `contexts`.
				// 'jsdoc/no-defaults': [
				// 	'error',
				// 	{
				// 		contexts: [
				// 			'ArrowFunctionExpression',
				// 			'FunctionDeclaration',
				// 			'FunctionExpression',
				// 		],
				// 	},
				// ],
				'jsdoc/no-missing-syntax': 'off',
				'jsdoc/no-restricted-syntax': 'off',
				'jsdoc/no-types': 'off',
				// JavaScript projects commonly rely on ambient platform and lib types from `@ts-check`, DOM libs, and JSX runtimes.
				// These types are valid in JSDoc but often have no lexical binding for `eslint-plugin-jsdoc` to resolve in a shared config.
				// Keeping this off avoids false positives for common cases like `RequestInit`, `NodeListOf`, `AsyncGenerator`, and `React.JSX`.
				'jsdoc/no-undefined-types': 'off',
				'jsdoc/prefer-import-tag': 'off',
				'jsdoc/reject-any-type': 'error',
				'jsdoc/reject-function-type': 'error',
				'jsdoc/text-escaping': 'off',
				'jsdoc/valid-types': 'error',

				// Requirements — these only apply to existing JSDoc comments,
				// except `require-jsdoc` which requires JSDoc to be present.
				'jsdoc/require-description': [
					'error',
					{
						exemptedBy: ['inheritdoc', ...unicornDocTags],
					},
				],

				// It's too naive. Requires dot at the end here:
				// Modifier: Make the text italic. *(Not widely supported)*
				// 'jsdoc/require-description-complete-sentence': 'error',

				'jsdoc/require-example': 'off',
				'jsdoc/require-file-overview': 'off',
				'jsdoc/require-hyphen-before-param-description': 'off',
				'jsdoc/require-jsdoc': 'off',
				'jsdoc/require-next-description': 'off',
				'jsdoc/require-next-type': 'error',
				'jsdoc/require-param': 'error',
				'jsdoc/require-param-description': 'error',
				'jsdoc/require-param-name': 'error',
				'jsdoc/require-param-type': 'error',
				'jsdoc/require-property': 'error',
				'jsdoc/require-property-description': 'error',
				'jsdoc/require-property-name': 'error',
				'jsdoc/require-property-type': 'error',
				'jsdoc/require-rejects': 'off',
				// Doesn't make sense to always force this. Sometimes it's clear from just the return type or from the description.
				// Keep `@returns` on real implementations, but skip declaration signatures such as overloads.
				// 'jsdoc/require-returns': [
				// 	'error',
				// 	{
				// 		publicOnly: true,
				// 	}
				// ],
				'jsdoc/require-returns-check': 'error',
				'jsdoc/require-returns-description': 'error',
				'jsdoc/require-returns-type': 'error',
				'jsdoc/require-tags': 'off',
				'jsdoc/require-template': 'off',
				'jsdoc/require-template-description': 'off',
				'jsdoc/require-throws': 'off',
				'jsdoc/require-throws-description': 'off',
				'jsdoc/require-throws-type': 'error',
				'jsdoc/require-yields': 'error',
				'jsdoc/require-yields-check': 'error',
				'jsdoc/require-yields-description': 'off',
				'jsdoc/require-yields-type': 'error',

				// TypeScript-related
				'jsdoc/ts-method-signature-style': 'off',
				'jsdoc/ts-no-empty-object-type': 'error',
				'jsdoc/ts-no-unnecessary-template-expression': 'off',
				'jsdoc/ts-prefer-function-type': 'off',
			},
		},
		...(tsFiles
			? [{
				name: 'xo/jsdoc-typescript',
				files: tsFiles,
				settings: {
					jsdoc: {
						tagNamePreference: {
							typeParam: 'typeParam',
						},
					},
				},
				rules: {
					// In TypeScript, types are expressed in the code, not in JSDoc.
					'jsdoc/check-tag-names': [
						'error',
						{
							definedTags: [
								...filePragmaTags,
								...typeScriptDocTags,
								...unicornDocTags,
							],
							jsxTags: true,
							typed: true,
						},
					],
					'jsdoc/no-types': 'error',
					'jsdoc/no-undefined-types': 'off',
					'jsdoc/require-param': [
						'error',
						{
							ignoreWhenAllParamsMissing: true,
							contexts: [
								'ArrowFunctionExpression',
								'FunctionDeclaration',
								'FunctionExpression',
							],
						},
					],
					'jsdoc/require-param-type': 'off',
					'jsdoc/require-property-type': 'off',
					'jsdoc/require-returns-type': 'off',
					// In TypeScript, thrown/yielded value types belong in the signature rather than JSDoc.
					'jsdoc/require-throws-type': 'off',
					'jsdoc/require-yields-type': 'off',
				},
			}]
			: []
		),
	];
}
