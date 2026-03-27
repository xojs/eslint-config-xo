import markdown from '@eslint/markdown';

const markdownRules = {
	'markdown/fenced-code-language': 'error',
	'markdown/heading-increment': 'error',
	'markdown/no-bare-urls': 'error',
	'markdown/no-duplicate-definitions': 'error',
	'markdown/no-duplicate-headings': 'error',
	'markdown/no-empty-definitions': 'error',
	'markdown/no-empty-images': 'error',
	'markdown/no-empty-links': 'error',
	'markdown/no-html': 'off', // HTML is sometimes needed for advanced formatting
	'markdown/no-invalid-label-refs': 'error',
	'markdown/no-missing-atx-heading-space': 'error',
	'markdown/no-missing-label-refs': 'error',
	'markdown/no-missing-link-fragments': 'error',
	'markdown/no-multiple-h1': 'error',
	'markdown/no-reference-like-urls': 'error',
	'markdown/no-reversed-media-syntax': 'error',
	'markdown/no-space-in-emphasis': 'error',
	'markdown/no-unused-definitions': 'error',
	'markdown/require-alt-text': 'error',
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
