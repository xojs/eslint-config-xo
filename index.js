import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import json from '@eslint/json';
import css from '@eslint/css';

const rules = {
	'@stylistic/comma-dangle': [
		'error',
		'always-multiline',
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
			allowEmptyCatch: true,
		},
	],
	'no-empty-static-block': 'error',
	'no-ex-assign': 'error',
	'no-extra-boolean-cast': 'error',
	// Disabled because of https://github.com/xojs/eslint-config-xo/pull/87
	// 'no-extra-boolean-cast': [
	// 	'error',
	// 	{
	// 		enforceForInnerExpressions: true
	// 	},
	// ],
	// Disabled because of https://github.com/eslint/eslint/issues/6028
	// '@stylistic/no-extra-parens': [
	// 	'error',
	// 	'all',
	// 	{
	// 		conditionalAssign: false,
	// 		nestedBinaryExpressions: false,
	// 		ignoreJSX: 'multi-line'
	// 	}
	// ],
	'@stylistic/no-extra-semi': 'error',
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
			enforceForOrderingRelations: true,
		},
	],
	'no-unsafe-optional-chaining': [
		'error',
		{
			disallowArithmeticOperators: true,
		},
	],
	'no-useless-backreference': 'error',
	'use-isnan': 'error',
	'valid-typeof': [
		'error',
		{
			requireStringLiterals: false,
		},
	],
	'no-unexpected-multiline': 'error',
	'accessor-pairs': [
		'error',
		{
			enforceForClassMembers: true,
		},
	],
	'array-callback-return': [
		'error',
		{
			allowImplicit: true,
		},
	],
	'block-scoped-var': 'error',
	complexity: 'warn',
	curly: 'error',
	'default-case': 'error',
	'default-case-last': 'error',
	'dot-notation': 'error',
	'@stylistic/curly-newline': [
		'error',
		'always',
	],
	'@stylistic/dot-location': [
		'error',
		'property',
	],
	eqeqeq: 'error',
	'grouped-accessor-pairs': [
		'error',
		'getBeforeSet',
	],
	'guard-for-in': 'error',
	'no-alert': 'error',
	'no-caller': 'error',
	'no-case-declarations': 'error',
	'no-constructor-return': 'error',
	'no-else-return': [
		'error',
		{
			allowElseIf: false,
		},
	],
	'no-empty-pattern': 'error',
	'no-eq-null': 'error',
	'no-eval': 'error',
	'no-extend-native': 'error',
	'no-extra-bind': 'error',
	'no-extra-label': 'error',
	'no-fallthrough': 'error',
	'@stylistic/no-floating-decimal': 'error',
	'no-global-assign': 'error',
	'no-implicit-coercion': 'error',
	'no-implicit-globals': 'error',
	'no-implied-eval': 'error',
	'no-iterator': 'error',
	'no-labels': 'error',
	'no-lone-blocks': 'error',
	'@stylistic/no-multi-spaces': 'error',
	'no-multi-str': 'error',
	'no-new-func': 'error',
	'no-new-wrappers': 'error',
	'no-nonoctal-decimal-escape': 'error',
	'no-object-constructor': 'error',
	'no-new': 'error',
	'no-octal-escape': 'error',
	'no-octal': 'error',
	'no-proto': 'error',
	'no-redeclare': 'error',
	'no-return-assign': [
		'error',
		'always',
	],
	'no-return-await': 'error',
	'no-script-url': 'error',
	'no-self-assign': [
		'error',
		{
			props: true,
		},
	],
	'no-self-compare': 'error',
	'no-sequences': 'error',
	'no-throw-literal': 'error',
	'no-unmodified-loop-condition': 'error',
	'no-unused-expressions': [
		'error',
		{
			enforceForJSX: true,
		},
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
			allowEmptyReject: true,
		},
	],
	'prefer-regex-literals': [
		'error',
		{
			disallowRedundantWrapping: true,
		},
	],
	radix: 'error',

	// Disabled for now as it causes too much churn
	// TODO: Enable it in the future when I have time to deal with
	// the churn and the rule is stable and has an autofixer.
	// Still doesn't have a fixer as of ESLint 7.24.0.
	// 'require-unicode-regexp': 'error',

	'@stylistic/wrap-iife': [
		'error',
		'inside',
		{
			functionPrototypeMethods: true,
		},
	],
	yoda: 'error',
	'no-delete-var': 'error',
	'no-label-var': 'error',
	'no-restricted-globals': [
		'error',
		'event',
		// TODO: Enable this in 2025.
		// {
		// 	name: 'Buffer',
		// 	message: 'Use Uint8Array instead. See: https://sindresorhus.com/blog/goodbye-nodejs-buffer',
		// },
		{
			name: 'atob',
			message: 'This API is deprecated. Use https://github.com/sindresorhus/uint8array-extras instead.',
		},
		{
			name: 'btoa',
			message: 'This API is deprecated. Use https://github.com/sindresorhus/uint8array-extras instead.',
		},
	],
	'no-shadow-restricted-names': 'error',
	'no-undef-init': 'error',
	'no-undef': [
		'error',
		{
			typeof: true,
		},
	],
	'no-unused-vars': [
		'error',
		{
			vars: 'all',
			varsIgnorePattern: /^_/.source,
			args: 'after-used',
			ignoreRestSiblings: true,
			argsIgnorePattern: /^_/.source,
			caughtErrors: 'all',
			caughtErrorsIgnorePattern: /^_$/.source,
		},
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
		'colors',
		// TODO: Enable this in 2025.
		// {
		// 	name: 'buffer',
		// 	message: 'Use Uint8Array instead. See: https://sindresorhus.com/blog/goodbye-nodejs-buffer',
		// },
		// {
		// 	name: 'node:buffer',
		// 	message: 'Use Uint8Array instead. See: https://sindresorhus.com/blog/goodbye-nodejs-buffer',
		// },
	],
	'@stylistic/array-bracket-newline': [
		'error',
		'consistent',
	],
	'@stylistic/array-bracket-spacing': [
		'error',
		'never',
	],
	'@stylistic/array-element-newline': [
		'error',
		'consistent',
	],
	'@stylistic/brace-style': [
		'error',
		'1tbs',
		{
			allowSingleLine: false,
		},
	],
	camelcase: [
		'error',
		{
			properties: 'always',
		},
	],
	'capitalized-comments': [
		'error',
		'always',
		{
			// You can also ignore this rule by wrapping the first word in quotes.
			// c8 => https://github.com/bcoe/c8
			ignorePattern: /pragma|ignore|prettier-ignore|biome-ignore|webpack\w+:|c8|v8|type-coverage:/.source,
			ignoreInlineComments: true,
			ignoreConsecutiveComments: true,
		},
	],
	'@stylistic/comma-spacing': [
		'error',
		{
			before: false,
			after: true,
		},
	],
	'@stylistic/comma-style': [
		'error',
		'last',
	],
	'@stylistic/computed-property-spacing': [
		'error',
		'never',
		{
			enforceForClassMembers: true,
		},
	],
	'@stylistic/eol-last': 'error',
	'@stylistic/function-call-spacing': [
		'error',
		'never',
	],
	'@stylistic/function-paren-newline': [
		'error',
		'multiline',
	],
	'func-name-matching': [
		'error',
		{
			considerPropertyDescriptor: true,
		},
	],
	'func-names': [
		'error',
		'never',
	],
	'@stylistic/function-call-argument-newline': [
		'error',
		'consistent',
	],
	'@stylistic/indent': [
		'error',
		'tab',
		{
			SwitchCase: 1,
		},
	],
	'@stylistic/jsx-quotes': [
		'error',
		'prefer-single',
	],
	'@stylistic/key-spacing': [
		'error',
		{
			beforeColon: false,
			afterColon: true,
		},
	],
	'@stylistic/keyword-spacing': 'error',
	'@stylistic/linebreak-style': [
		process.platform === 'win32' ? 'off' : 'error',
		'unix',
	],
	'@stylistic/lines-between-class-members': [
		'error',
		{
			enforce: [
				{
					blankLine: 'always',
					prev: '*',
					next: 'method',
				},
				{
					blankLine: 'always',
					prev: 'method',
					next: 'field',
				},
				{
					blankLine: 'never',
					prev: 'field',
					next: 'field',
				},
			],
		},
	],
	'logical-assignment-operators': [
		'error',
		'always',
		{
			enforceForIfStatements: true,
		},
	],
	'max-depth': 'warn',
	'@stylistic/max-len': [
		'warn',
		{
			code: 200,
			ignoreComments: true,
			ignoreUrls: true,
		},
	],
	'max-lines': [
		'warn',
		{
			max: 1500,
			skipComments: true,
		},
	],
	'max-nested-callbacks': [
		'warn',
		4,
	],
	'max-params': [
		'warn',
		{
			max: 4,
		},
	],
	'@stylistic/max-statements-per-line': 'error',
	'new-cap': [
		'error',
		{
			newIsCap: true,
			capIsNew: true,
		},
	],
	'@stylistic/multiline-ternary': [
		'error',
		'always-multiline',
	],
	'@stylistic/new-parens': 'error',
	'no-array-constructor': 'error',
	'no-bitwise': 'error',
	'no-lonely-if': 'error',
	'@stylistic/no-mixed-operators': 'error',
	'@stylistic/no-mixed-spaces-and-tabs': 'error',
	'no-multi-assign': 'error',
	'@stylistic/no-multiple-empty-lines': [
		'error',
		{
			max: 1,
		},
	],
	'no-negated-condition': 'error',
	'@stylistic/no-whitespace-before-property': 'error',
	'@stylistic/no-trailing-spaces': 'error',
	'no-unneeded-ternary': 'error',
	'@stylistic/object-curly-spacing': [
		'error',
		'never',
	],
	'@stylistic/object-curly-newline': [
		'error',
		{
			ObjectExpression: {
				multiline: true,
				minProperties: 4,
				consistent: true,
			},
			ObjectPattern: {
				multiline: true,
				consistent: true,
			},
			ImportDeclaration: {
				multiline: true,
				minProperties: 4,
				consistent: true,
			},
			ExportDeclaration: {
				multiline: true,
				minProperties: 4,
				consistent: true,
			},
		},
	],
	'one-var': [
		'error',
		'never',
	],
	'@stylistic/one-var-declaration-per-line': 'error',
	'operator-assignment': [
		'error',
		'always',
	],
	'@stylistic/operator-linebreak': [
		'error',
		'before',
	],
	'@stylistic/padded-blocks': [
		'error',
		'never',
		{
			allowSingleLineBlocks: false,
		},
	],
	'@stylistic/padding-line-between-statements': [
		'error',
		{
			blankLine: 'always',
			prev: 'multiline-block-like',
			next: '*',
		},
	],
	'prefer-exponentiation-operator': 'error',
	'prefer-object-spread': 'error',
	'@stylistic/quote-props': [
		'error',
		'as-needed',
	],
	'@stylistic/quotes': [
		'error',
		'single',
	],
	'@stylistic/semi-spacing': [
		'error',
		{
			before: false,
			after: true,
		},
	],
	'@stylistic/semi-style': [
		'error',
		'last',
	],
	'@stylistic/semi': [
		'error',
		'always',
	],
	'@stylistic/space-before-blocks': [
		'error',
		'always',
	],
	'@stylistic/space-before-function-paren': [
		'error',
		{
			anonymous: 'always',
			named: 'never',
			asyncArrow: 'always',
		},
	],
	'@stylistic/space-in-parens': [
		'error',
		'never',
	],
	'@stylistic/space-infix-ops': 'error',
	'@stylistic/space-unary-ops': 'error',
	'@stylistic/spaced-comment': [
		'error',
		'always',
		{
			line: {
				exceptions: [
					'-',
					'+',
					'*',
				],
				markers: [
					'!',
					'/',
					'=>',
				],
			},
			block: {
				exceptions: [
					'-',
					'+',
					'*',
				],
				markers: [
					'!',
					'*',
				],
				balanced: true,
			},
		},
	],
	'@stylistic/switch-colon-spacing': [
		'error',
		{
			after: true,
			before: false,
		},
	],
	'@stylistic/template-tag-spacing': [
		'error',
		'never',
	],
	'unicode-bom': [
		'error',
		'never',
	],
	'arrow-body-style': 'error',
	'@stylistic/arrow-parens': [
		'error',
		'as-needed',
	],
	'@stylistic/arrow-spacing': [
		'error',
		{
			before: true,
			after: true,
		},
	],
	'@stylistic/block-spacing': [
		'error',
		'never',
	],
	'constructor-super': 'error',
	'@stylistic/generator-star-spacing': [
		'error',
		'both',
	],
	'no-class-assign': 'error',
	'no-const-assign': 'error',
	'no-constant-binary-expression': 'error',
	'no-dupe-class-members': 'error',
	'no-new-native-nonconstructor': 'error',
	'no-this-before-super': 'error',
	'no-useless-computed-key': [
		'error',
		{
			enforceForClassMembers: true,
		},
	],
	'no-useless-constructor': 'error',
	'no-useless-rename': 'error',
	'no-var': 'error',
	'object-shorthand': [
		'error',
		'always',
		{
			avoidExplicitReturnArrows: true,
		},
	],
	'prefer-arrow-callback': [
		'error',
		{
			allowNamedFunctions: true,
		},
	],
	'prefer-const': [
		'error',
		{
			destructuring: 'all',
		},
	],
	'prefer-destructuring': [
		'error',
		{
			// `array` is disabled because it forces destructuring on
			// stupid stuff like `foo.bar = process.argv[2];`
			// TODO: Open ESLint issue about this
			VariableDeclarator: {
				array: false,
				object: true,
			},
			AssignmentExpression: {
				array: false,

				// Disabled because object assignment destructuring requires parens wrapping:
				// `let foo; ({foo} = object);`
				object: false,
			},
		},
		{
			enforceForRenamedProperties: false,
		},
	],
	'prefer-numeric-literals': 'error',
	'prefer-object-has-own': 'error',
	'prefer-rest-params': 'error',
	'prefer-spread': 'error',
	'require-yield': 'error',
	'@stylistic/rest-spread-spacing': [
		'error',
		'never',
	],
	'symbol-description': 'error',
	'@stylistic/template-curly-spacing': 'error',
	'@stylistic/yield-star-spacing': [
		'error',
		'both',
	],
	'@stylistic/indent-binary-ops': [
		'error',
		'tab',
	],
};

const TYPESCRIPT_EXTENSION = [
	'ts',
	'tsx',
	'mts',
	'cts',
];

const DEFAULT_EXTENSION = [
	'js',
	'jsx',
	'mjs',
	'cjs',
	...TYPESCRIPT_EXTENSION,
];

const config = {
	languageOptions: {
		globals: {
			...globals.es2021,
			...globals.nodeBuiltin,
		},
		ecmaVersion: 'latest',
		sourceType: 'module',
		parserOptions: {
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
	linterOptions: {
		reportUnusedDisableDirectives: 'error',
		reportUnusedInlineConfigs: 'error',
	},
	plugins: {
		'@stylistic': stylistic,
	},
	files: [
		`**/*.{${DEFAULT_EXTENSION.join(',')}}`,
	],
	rules,
};

const jsonRules = {
	'json/no-duplicate-keys': 'error',
	'json/no-empty-keys': 'error',
	'json/no-unsafe-values': 'error',
	'json/no-unnormalized-keys': 'error',
};

const jsonConfig = {
	plugins: {
		json,
	},
	files: [
		'**/*.json',
	],
	language: 'json/json',
	rules: jsonRules,
};

const jsoncConfig = {
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

const json5Config = {
	plugins: {
		json,
	},
	files: [
		'**/*.json5',
	],
	language: 'json/json5',
	rules: jsonRules,
};

const cssRules = {
	'css/no-duplicate-imports': 'error',
	'css/no-empty-blocks': 'error',
	'css/no-invalid-at-rules': 'error',
	'cs//no-invalid-at-rules': 'error',
	'css/no-invalid-properties': 'error',
};

// eslint-disable-next-line no-unused-vars
const cssConfig = {
	plugins: {
		css,
	},
	files: [
		'**/*.css',
	],
	language: 'css/css',
	rules: cssRules,
};

export default [
	config,
	jsoncConfig,
	json5Config,
	jsonConfig, // Placed last so non-standard JSONs match first.

	// Disabled for now until it becomes more stable.
	// cssConfig,
];
