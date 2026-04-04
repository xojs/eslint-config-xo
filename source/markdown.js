import markdown from '@eslint/markdown';

const markdownRules = {
	'markdown/fenced-code-language': 'error',
	// 'markdown/heading-increment': 'error', // Too strict. Sometimes it makes sense not to have exact increment
	'markdown/no-bare-urls': 'off', // It's fine to write bare URLs
	'markdown/no-duplicate-definitions': 'error',
	'markdown/no-duplicate-headings': [
		'error',
		{
			checkSiblingsOnly: true,
		},
	],
	'markdown/no-empty-definitions': 'error',
	'markdown/no-empty-images': 'error',
	'markdown/no-empty-links': 'error',
	'markdown/no-html': 'off', // HTML is sometimes needed for advanced formatting
	'markdown/no-invalid-label-refs': 'error',
	'markdown/no-missing-atx-heading-space': 'error',
	'markdown/no-missing-label-refs': [
		'error',
		{
			allowLabels: [
				'!NOTE',
				'!TIP',
				'!IMPORTANT',
				'!WARNING',
				'!CAUTION',
			],
		},
	],
	'markdown/no-missing-link-fragments': 'error',
	'markdown/no-multiple-h1': 'error',
	'markdown/no-reference-like-urls': 'error',
	'markdown/no-reversed-media-syntax': 'error',
	'markdown/no-space-in-emphasis': 'error',
	'markdown/no-unused-definitions': 'error',
	// 'markdown/require-alt-text': 'error', // Too much churn for now. Maybe will enable it in the future
	'markdown/table-column-count': 'error',
};

export function getMarkdownConfig() {
	return {
		plugins: {
			markdown,
		},
		files: [
			'**/*.md',
		],
		language: 'markdown/gfm',
		rules: markdownRules,
	};
}
