import html from '@html-eslint/eslint-plugin';

const {languageOptions} = html.configs['flat/recommended'];

// Style rules that conflict with Prettier's HTML formatting. Disabled when the `prettier` option is enabled. `eslint-config-prettier` does not yet cover `@html-eslint`: https://github.com/prettier/eslint-config-prettier/issues/248
const prettierConflictingRules = [
	'@html-eslint/attrs-newline',
	'@html-eslint/class-spacing',
	'@html-eslint/element-newline',
	'@html-eslint/indent',
	'@html-eslint/lowercase',
	'@html-eslint/no-extra-spacing-tags',
	'@html-eslint/no-extra-spacing-text',
	'@html-eslint/no-multiple-empty-lines',
	'@html-eslint/no-trailing-spaces',
	'@html-eslint/quotes',
	'@html-eslint/require-closing-tags',
];

export function getHtmlConfig({space = false, prettier = false} = {}) {
	const indent = space ? (typeof space === 'number' ? space : 2) : 'tab';

	return {
		plugins: {
			'@html-eslint': html,
		},
		files: [
			'**/*.html',
		],
		languageOptions,
		rules: {
			// Best Practice
			'@html-eslint/css-no-empty-blocks': 'error',
			'@html-eslint/head-order': 'error',
			'@html-eslint/no-duplicate-attrs': 'error',
			'@html-eslint/no-duplicate-class': 'error',
			'@html-eslint/no-duplicate-id': 'error',
			'@html-eslint/no-duplicate-in-head': 'error',
			'@html-eslint/no-ineffective-attrs': 'error',
			'@html-eslint/no-inline-styles': 'error',
			'@html-eslint/no-invalid-attr-value': 'error',
			'@html-eslint/no-invalid-entity': 'error',
			'@html-eslint/no-nested-interactive': 'error',
			'@html-eslint/no-obsolete-attrs': 'error',
			'@html-eslint/no-obsolete-tags': 'error',
			'@html-eslint/no-script-style-type': 'error',
			'@html-eslint/no-target-blank': 'error',
			'@html-eslint/no-whitespace-only-children': 'error',
			'@html-eslint/prefer-https': 'error',
			'@html-eslint/require-button-type': 'error',
			'@html-eslint/require-closing-tags': 'error',
			'@html-eslint/require-content': 'error',
			'@html-eslint/require-details-summary': 'error',
			'@html-eslint/require-doctype': 'error',
			'@html-eslint/require-explicit-size': 'error',
			'@html-eslint/require-li-container': 'error',
			'@html-eslint/require-meta-charset': 'error',
			'@html-eslint/svg-require-viewbox': 'error',
			'@html-eslint/use-baseline': 'error',

			// SEO
			'@html-eslint/no-multiple-h1': 'error',
			'@html-eslint/require-lang': 'error',
			'@html-eslint/require-meta-description': 'error',
			'@html-eslint/require-open-graph-protocol': 'error',
			'@html-eslint/require-title': 'error',

			// Accessibility
			'@html-eslint/no-abstract-roles': 'error',
			'@html-eslint/no-accesskey-attrs': 'error',
			'@html-eslint/no-aria-hidden-body': 'error',
			'@html-eslint/no-aria-hidden-on-focusable': 'error',
			'@html-eslint/no-empty-headings': 'error',
			'@html-eslint/no-heading-inside-button': 'error',
			'@html-eslint/no-invalid-role': 'error',
			'@html-eslint/no-non-scalable-viewport': 'error',
			'@html-eslint/no-positive-tabindex': 'error',
			'@html-eslint/no-redundant-role': 'error',
			'@html-eslint/no-skip-heading-levels': 'error',
			'@html-eslint/require-form-method': 'error',
			'@html-eslint/require-frame-title': 'error',
			'@html-eslint/require-img-alt': 'error',
			'@html-eslint/require-input-label': 'error',
			'@html-eslint/require-meta-viewport': 'error',

			// Style
			'@html-eslint/attrs-newline': 'error',
			'@html-eslint/class-spacing': 'error',
			'@html-eslint/element-newline': [
				'error',
				{
					inline: [
						'$inline',
					],
				},
			],
			'@html-eslint/id-naming-convention': 'off', // Requires project-specific config (camelCase/kebab-case/etc.)
			'@html-eslint/indent': ['error', indent],
			'@html-eslint/lowercase': 'error',
			'@html-eslint/no-extra-spacing-tags': 'error',
			'@html-eslint/no-extra-spacing-text': 'error',
			'@html-eslint/no-multiple-empty-lines': [
				'error',
				{
					max: 1,
				},
			],
			'@html-eslint/no-trailing-spaces': 'error',
			'@html-eslint/quotes': [
				'error',
				'double',
			],
			'@html-eslint/sort-attrs': 'error',
			...(prettier && Object.fromEntries(prettierConflictingRules.map(rule => [rule, 'off']))),
		},
	};
}
