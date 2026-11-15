import markdown from '@eslint/markdown';
import pluginUnicorn from 'eslint-plugin-unicorn';

const markdownRules = {
	...pluginUnicorn.configs['recommended-markdown'].rules,
	// GitHub requires names like `.github/pull_request_template.md` and `.github/ISSUE_TEMPLATE/`.
	// TODO: Enable again when using `eslint-plugin-unicorn` v81. It also rejects GitHub's required `pull_request_template.md` filenames in the root and `docs` directories.
	'unicorn/filename-case': 'off',
	// Allow files with only a comment, like a pull request template with instructions that should not show in the pull request.
	'unicorn/no-empty-file': [
		'error',
		{
			allowComments: true,
		},
	],
	// Not in `eslint-plugin-unicorn`'s Markdown config.
	'unicorn/no-javascript-url': 'error',
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
		name: 'xo/markdown',
		plugins: {
			markdown,
			unicorn: pluginUnicorn,
		},
		files: [
			'**/*.md',
		],
		language: 'markdown/gfm',
		rules: markdownRules,
	};
}
