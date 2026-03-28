import pluginRegexp from 'eslint-plugin-regexp';

export function getRegexpConfig({files}) {
	return {
		name: 'xo/regexp',
		plugins: {
			regexp: pluginRegexp,
		},
		files,
		rules: {
			// The plugin provides better versions of these core rules.
			'no-invalid-regexp': 'off',
			'no-useless-backreference': 'off',
			'no-empty-character-class': 'off',

			// Possible Errors
			'regexp/no-contradiction-with-assertion': 'error',
			'regexp/no-control-character': 'error',
			'regexp/no-dupe-disjunctions': 'error',
			'regexp/no-empty-alternative': 'error',
			'regexp/no-empty-capturing-group': 'error',
			'regexp/no-empty-character-class': 'error',
			'regexp/no-empty-group': 'error',
			'regexp/no-empty-lookarounds-assertion': 'error',
			'regexp/no-escape-backspace': 'error',
			'regexp/no-invalid-regexp': 'error',
			'regexp/no-lazy-ends': 'error',
			'regexp/no-misleading-capturing-group': 'error',
			'regexp/no-misleading-unicode-character': 'error',
			'regexp/no-missing-g-flag': 'error',
			'regexp/no-optional-assertion': 'error',
			'regexp/no-potentially-useless-backreference': 'error',
			'regexp/no-super-linear-backtracking': 'error',
			'regexp/no-super-linear-move': 'error',
			'regexp/no-useless-assertions': 'error',
			'regexp/no-useless-backreference': 'error',
			'regexp/no-useless-dollar-replacements': 'error',
			'regexp/strict': 'error',

			// Best Practices
			'regexp/confusing-quantifier': 'error',
			'regexp/control-character-escape': 'error',
			'regexp/negation': 'error',
			'regexp/no-dupe-characters-character-class': 'error',
			'regexp/no-empty-string-literal': 'error',
			'regexp/no-extra-lookaround-assertions': 'error',
			'regexp/no-invisible-character': 'error',
			'regexp/no-legacy-features': 'error',
			'regexp/no-non-standard-flag': 'error',
			'regexp/no-obscure-range': 'error',
			'regexp/no-octal': 'error',
			'regexp/no-standalone-backslash': 'error',
			'regexp/no-trivially-nested-assertion': 'error',
			'regexp/no-trivially-nested-quantifier': 'error',
			'regexp/no-unused-capturing-group': 'error',
			'regexp/no-useless-character-class': 'error',
			'regexp/no-useless-flag': 'error',
			'regexp/no-useless-lazy': 'error',
			'regexp/no-useless-quantifier': 'error',
			'regexp/no-useless-range': 'error',
			'regexp/no-useless-set-operand': 'error',
			'regexp/no-useless-string-literal': 'error',
			'regexp/no-useless-two-nums-quantifier': 'error',
			'regexp/no-zero-quantifier': 'error',
			'regexp/optimal-lookaround-quantifier': 'error',
			'regexp/optimal-quantifier-concatenation': 'error',
			'regexp/prefer-escape-replacement-dollar-char': 'error',
			'regexp/prefer-predefined-assertion': 'error',

			// I needs an option to only activate when at least 3 components.
			// 'regexp/prefer-quantifier': [
			// 	'off',
			// 	{
			// 		allows: [
			// 			'www',
			// 			'\\d\\d',
			// 		],
			// 	},
			// ],

			'regexp/prefer-range': 'error',
			'regexp/prefer-regexp-exec': 'error',
			'regexp/prefer-regexp-test': 'error',
			'regexp/prefer-set-operation': 'error',
			'regexp/require-unicode-regexp': 'off', // Conflicts with `require-unicode-regexp`.
			'regexp/require-unicode-sets-regexp': 'off', // Conflicts with `require-unicode-regexp`.
			'regexp/simplify-set-operations': 'error',
			'regexp/sort-alternatives': 'off', // Too opinionated about ordering.
			'regexp/use-ignore-case': 'error',

			// Stylistic
			'regexp/grapheme-string-literal': 'error',
			'regexp/hexadecimal-escape': [
				'error',
				'never', // We prefer the consistency of Unicode escapes.
			],
			'regexp/letter-case': [
				'error',
				{
					caseInsensitive: 'lowercase',
					unicodeEscape: 'ignore', // `unicorn/escape-case` already handles it.
					hexadecimalEscape: 'uppercase',
					controlEscape: 'uppercase',
				},
			],
			'regexp/match-any': 'error',
			'regexp/no-useless-escape': 'error',
			'regexp/no-useless-non-capturing-group': 'error',
			'regexp/prefer-character-class': 'error',
			'regexp/prefer-d': 'error',
			'regexp/prefer-lookaround': [
				'error',
				{
					lookbehind: true,
					strictTypes: true,
				},
			],
			'regexp/prefer-named-backreference': 'error',
			'regexp/prefer-named-capture-group': 'error',
			'regexp/prefer-named-replacement': 'error',
			'regexp/prefer-plus-quantifier': 'error',
			'regexp/prefer-question-quantifier': 'error',
			'regexp/prefer-result-array-groups': 'error',
			'regexp/prefer-star-quantifier': 'error',
			'regexp/prefer-unicode-codepoint-escapes': 'error',
			'regexp/prefer-w': 'error',
			'regexp/sort-character-class-elements': 'error',
			'regexp/sort-flags': 'error',
			'regexp/unicode-escape': 'error',
			'regexp/unicode-property': [
				'error',
				{
					generalCategory: 'never',
					key: 'ignore',
					property: {
						binary: 'long',
						generalCategory: 'long',
						script: 'long',
					},
				},
			],
		},
	};
}
