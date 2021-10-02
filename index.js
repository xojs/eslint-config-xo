'use strict';

module.exports = {
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true
		}
	},
	env: {
		es2021: true,
		node: true
	},
	reportUnusedDisableDirectives: true,
	rules: {
		'comma-dangle': [
			'error',
			'always-multiline'
		],
		'for-direction': 'error',
		'getter-return': 'error',
		'no-async-promise-executor': 'error',
		'no-await-in-loop': 'error',
		'no-compare-neg-zero': 'error',
		'no-cond-assign': 'error',
		'no-constant-condition': 'error',
		'no-control-regex': 'error',
		'no-debugger': 'error',
		'no-dupe-args': 'error',
		'no-dupe-else-if': 'error',
		'no-dupe-keys': 'error',
		'no-duplicate-case': 'error',
		'no-empty-character-class': 'error',
		'no-empty': [
			'error',
			{
				allowEmptyCatch: true
			}
		],
		'no-ex-assign': 'error',
		'no-extra-boolean-cast': 'error',
		// Disabled because of https://github.com/eslint/eslint/issues/6028
		// 'no-extra-parens': [
		// 	'error',
		// 	'all',
		// 	{
		// 		conditionalAssign: false,
		// 		nestedBinaryExpressions: false,
		// 		ignoreJSX: 'multi-line'
		// 	}
		// ],
		'no-extra-semi': 'error',
		'no-func-assign': 'error',
		'no-import-assign': 'error',
		'no-inner-declarations': 'error',
		'no-invalid-regexp': 'error',
		'no-irregular-whitespace': 'error',
		'no-loss-of-precision': 'error',
		'no-misleading-character-class': 'error',
		'no-obj-calls': 'error',
		'no-promise-executor-return': 'error',
		'no-prototype-builtins': 'error',
		'no-regex-spaces': 'error',
		'no-setter-return': 'error',
		'no-sparse-arrays': 'error',
		'no-template-curly-in-string': 'error',
		'no-unreachable': 'error',
		'no-unreachable-loop': 'error',
		'no-unsafe-finally': 'error',
		'no-unsafe-negation': [
			'error',
			{
				enforceForOrderingRelations: true
			}
		],
		'no-unsafe-optional-chaining': [
			'error',
			{
				disallowArithmeticOperators: true
			}
		],
		'no-useless-backreference': 'error',
		'use-isnan': 'error',
		'valid-typeof': [
			'error',
			{
				requireStringLiterals: false
			}
		],
		'no-unexpected-multiline': 'error',
		'accessor-pairs': [
			'error',
			{
				enforceForClassMembers: true
			}
		],
		'array-callback-return': [
			'error',
			{
				allowImplicit: true
			}
		],
		'block-scoped-var': 'error',
		complexity: 'warn',
		curly: 'error',
		'default-case': 'error',
		'default-case-last': 'error',
		'default-param-last': 'error',
		'dot-notation': 'error',
		'dot-location': [
			'error',
			'property'
		],
		eqeqeq: 'error',
		'grouped-accessor-pairs': [
			'error',
			'getBeforeSet'
		],
		'guard-for-in': 'error',
		'no-alert': 'error',
		'no-caller': 'error',
		'no-case-declarations': 'error',
		'no-constructor-return': 'error',
		'no-else-return': [
			'error',
			{
				allowElseIf: false
			}
		],
		'no-empty-pattern': 'error',
		'no-eq-null': 'error',
		'no-eval': 'error',
		'no-extend-native': 'error',
		'no-extra-bind': 'error',
		'no-extra-label': 'error',
		'no-fallthrough': 'error',
		'no-floating-decimal': 'error',
		'no-global-assign': 'error',
		'no-implicit-coercion': 'error',
		'no-implicit-globals': 'error',
		'no-implied-eval': 'error',
		'no-iterator': 'error',
		'no-labels': 'error',
		'no-lone-blocks': 'error',
		'no-multi-spaces': 'error',
		'no-multi-str': 'error',
		'no-new-func': 'error',
		'no-new-wrappers': 'error',
		'no-nonoctal-decimal-escape': 'error',
		'no-new': 'error',
		'no-octal-escape': 'error',
		'no-octal': 'error',
		'no-proto': 'error',
		'no-redeclare': 'error',
		'no-return-assign': [
			'error',
			'always'
		],
		'no-return-await': 'error',
		'no-script-url': 'error',
		'no-self-assign': [
			'error',
			{
				props: true
			}
		],
		'no-self-compare': 'error',
		'no-sequences': 'error',
		'no-throw-literal': 'error',
		'no-unmodified-loop-condition': 'error',
		'no-unused-expressions': [
			'error',
			{
				enforceForJSX: true
			}
		],
		'no-unused-labels': 'error',
		'no-useless-call': 'error',
		'no-useless-catch': 'error',
		'no-useless-concat': 'error',
		'no-useless-escape': 'error',
		'no-useless-return': 'error',
		'no-void': 'error',
		'no-warning-comments': 'warn',
		'no-with': 'error',

		// Disabled for now as Firefox doesn't support named capture groups and I'm tired of getting issues about the use of named capture groups...
		// 'prefer-named-capture-group': 'error'

		'prefer-promise-reject-errors': [
			'error',
			{
				allowEmptyReject: true
			}
		],
		'prefer-regex-literals': 'error',
		radix: 'error',

		// Disabled for now as it causes too much churn
		// TODO: Enable it in the future when I have time to deal with
		// the churn and the rule is stable and has an autofixer.
		// Still doesn't have a fixer as of ESLint 7.24.0.
		// 'require-unicode-regexp': 'error',

		'wrap-iife': [
			'error',
			'inside',
			{
				functionPrototypeMethods: true
			}
		],
		yoda: 'error',
		'no-delete-var': 'error',
		'no-label-var': 'error',
		'no-restricted-globals': [
			'error',
			'event'
		],
		'no-shadow-restricted-names': 'error',
		'no-undef-init': 'error',
		'no-undef': [
			'error',
			{
				typeof: true
			}
		],
		'no-unused-vars': [
			'error',
			{
				vars: 'all',
				args: 'after-used',
				ignoreRestSiblings: true,
				argsIgnorePattern: /^_/.source,
				caughtErrors: 'all',
				caughtErrorsIgnorePattern: /^_$/.source
			}
		],
		'no-buffer-constructor': 'error',
		'no-restricted-imports': [
			'error',
			'domain',
			'freelist',
			'smalloc',
			'punycode',
			'sys',
			'querystring',
			'colors'
		],
		'array-bracket-newline': [
			'error',
			'consistent'
		],
		'array-bracket-spacing': [
			'error',
			'never'
		],
		'array-element-newline': [
			'error',
			'consistent'
		],
		'brace-style': [
			'error',
			'1tbs',
			{
				allowSingleLine: false
			}
		],
		camelcase: [
			'error',
			{
				properties: 'always'
			}
		],
		'capitalized-comments': [
			'error',
			'always',
			{
				// You can also ignore this rule by wrapping the first word in quotes.
				// c8 => https://github.com/bcoe/c8
				ignorePattern: /pragma|ignore|prettier-ignore|webpack\w+:|c8/.source,
				ignoreInlineComments: true,
				ignoreConsecutiveComments: true
			}
		],
		'comma-spacing': [
			'error',
			{
				before: false,
				after: true
			}
		],
		'comma-style': [
			'error',
			'last'
		],
		'computed-property-spacing': [
			'error',
			'never',
			{
				enforceForClassMembers: true
			}
		],
		'eol-last': 'error',
		'func-call-spacing': [
			'error',
			'never'
		],
		'func-name-matching': [
			'error',
			{
				considerPropertyDescriptor: true
			}
		],
		'func-names': [
			'error',
			'never'
		],
		'function-call-argument-newline': [
			'error',
			'consistent'
		],
		indent: [
			'error',
			'tab',
			{
				SwitchCase: 1
			}
		],
		'jsx-quotes': 'error',
		'key-spacing': [
			'error',
			{
				beforeColon: false,
				afterColon: true
			}
		],
		'keyword-spacing': 'error',
		'linebreak-style': [
			process.platform === 'win32' ? 'off' : 'error',
			'unix'
		],
		'lines-between-class-members': [
			'error',
			'always',
			{
				// Workaround to allow class fields to not have lines between them.
				// TODO: Get ESLint to add an option to ignore class fields.
				exceptAfterSingleLine: true
			}
		],
		'max-depth': 'warn',
		'max-nested-callbacks': [
			'warn',
			4
		],
		'max-params': [
			'warn',
			{
				max: 4
			}
		],
		'max-statements-per-line': 'error',
		'new-cap': [
			'error',
			{
				newIsCap: true,
				capIsNew: true
			}
		],
		'new-parens': 'error',
		'no-array-constructor': 'error',
		'no-bitwise': 'error',
		'no-lonely-if': 'error',
		'no-mixed-operators': 'error',
		'no-mixed-spaces-and-tabs': 'error',
		'no-multi-assign': 'error',
		'no-multiple-empty-lines': [
			'error',
			{
				max: 1
			}
		],
		'no-negated-condition': 'error',
		'no-new-object': 'error',
		'no-whitespace-before-property': 'error',
		'no-trailing-spaces': 'error',
		'no-unneeded-ternary': 'error',
		'object-curly-spacing': [
			'error',
			'never'
		],
		// Disabled because of https://github.com/xojs/eslint-config-xo/issues/27
		// 'object-property-newline': 'error',
		'one-var': [
			'error',
			'never'
		],
		'one-var-declaration-per-line': 'error',
		'operator-assignment': [
			'error',
			'always'
		],
		'operator-linebreak': [
			'error',
			'before'
		],
		'padded-blocks': [
			'error',
			'never',
			{
				allowSingleLineBlocks: false
			}
		],
		'padding-line-between-statements': [
			'error',
			{
				blankLine: 'always',
				prev: 'multiline-block-like',
				next: '*'
			}
		],
		'prefer-exponentiation-operator': 'error',
		'prefer-object-spread': 'error',
		'quote-props': [
			'error',
			'as-needed'
		],
		quotes: [
			'error',
			'single'
		],
		'semi-spacing': [
			'error',
			{
				before: false,
				after: true
			}
		],
		'semi-style': [
			'error',
			'last'
		],
		semi: [
			'error',
			'always'
		],
		'space-before-blocks': [
			'error',
			'always'
		],
		'space-before-function-paren': [
			'error',
			{
				anonymous: 'always',
				named: 'never',
				asyncArrow: 'always'
			}
		],
		'space-in-parens': [
			'error',
			'never'
		],
		'space-infix-ops': 'error',
		'space-unary-ops': 'error',
		'spaced-comment': [
			'error',
			'always',
			{
				line: {
					exceptions: [
						'-',
						'+',
						'*'
					],
					markers: [
						'!',
						'/',
						'=>'
					]
				},
				block: {
					exceptions: [
						'-',
						'+',
						'*'
					],
					markers: [
						'!',
						'*'
					],
					balanced: true
				}
			}
		],
		'switch-colon-spacing': [
			'error',
			{
				after: true,
				before: false
			}
		],
		'template-tag-spacing': [
			'error',
			'never'
		],
		'unicode-bom': [
			'error',
			'never'
		],
		'arrow-body-style': 'error',
		'arrow-parens': [
			'error',
			'as-needed'
		],
		'arrow-spacing': [
			'error',
			{
				before: true,
				after: true
			}
		],
		'constructor-super': 'error',
		'generator-star-spacing': [
			'error',
			'both'
		],
		'no-class-assign': 'error',
		'no-const-assign': 'error',
		'no-dupe-class-members': 'error',
		'no-new-symbol': 'error',
		'no-this-before-super': 'error',
		'no-useless-computed-key': [
			'error',
			{
				enforceForClassMembers: true
			}
		],
		'no-useless-constructor': 'error',
		'no-useless-rename': 'error',
		'no-var': 'error',
		'object-shorthand': [
			'error',
			'always'
		],
		'prefer-arrow-callback': [
			'error',
			{
				allowNamedFunctions: true
			}
		],
		'prefer-const': [
			'error',
			{
				destructuring: 'all'
			}
		],
		'prefer-destructuring': [
			'error',
			{
				// `array` is disabled because it forces destructuring on
				// stupid stuff like `foo.bar = process.argv[2];`
				// TODO: Open ESLint issue about this
				VariableDeclarator: {
					array: false,
					object: true
				},
				AssignmentExpression: {
					array: false,

					// Disabled because object assignment destructuring requires parens wrapping:
					// `let foo; ({foo} = object);`
					object: false
				}
			},
			{
				enforceForRenamedProperties: false
			}
		],
		'prefer-numeric-literals': 'error',
		'prefer-rest-params': 'error',
		'prefer-spread': 'error',
		'require-yield': 'error',
		'rest-spread-spacing': [
			'error',
			'never'
		],
		'symbol-description': 'error',
		'template-curly-spacing': 'error',
		'yield-star-spacing': [
			'error',
			'both'
		]
	}
};
