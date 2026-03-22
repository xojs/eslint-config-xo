export const getNamingConventionRule = ({isTsx}) => ({
	'@typescript-eslint/naming-convention': [
		'error',
		{
			/// selector: ['variableLike', 'memberLike', 'property', 'method'],
			// Note: Leaving out `parameter` and `typeProperty` because of the mentioned known issues.
			// Note: We are intentionally leaving out `enumMember` as it's usually pascal-case or upper-snake-case.
			selector: ['variable', 'function', 'classProperty', 'objectLiteralProperty', 'parameterProperty', 'classMethod', 'objectLiteralMethod', 'typeMethod', 'accessor'],
			format: [
				'strictCamelCase',
				isTsx && 'StrictPascalCase',
			].filter(Boolean),
			// We allow double underscore because of GraphQL type names and some React names.
			leadingUnderscore: 'allowSingleOrDouble',
			trailingUnderscore: 'allow',
			// Ignore `{'Retry-After': retryAfter}` type properties.
			filter: {
				regex: '[- ]',
				match: false,
			},
		},
		{
			selector: 'typeLike',
			format: [
				'StrictPascalCase',
			],
		},
		{
			selector: 'variable',
			types: [
				'boolean',
			],
			format: [
				'StrictPascalCase',
			],
			prefix: [
				'is',
				'has',
				'can',
				'should',
				'will',
				'did',
			],
		},
		{
			// Interface name should not be prefixed with `I`.
			selector: 'interface',
			filter: /^(?!I)[A-Z]/v.source,
			format: [
				'StrictPascalCase',
			],
		},
		{
			// Type parameter name should either be `T` or a descriptive name.
			selector: 'typeParameter',
			filter: /^T$|^[A-Z][a-zA-Z]+$/v.source,
			format: [
				'StrictPascalCase',
			],
		},
		// Allow these in non-camel-case when quoted.
		{
			selector: [
				'classProperty',
				'objectLiteralProperty',
			],
			format: null,
			modifiers: [
				'requiresQuotes',
			],
		},
	],
});

export const typescriptRules = {
	'@typescript-eslint/adjacent-overload-signatures': 'error',
	'@typescript-eslint/array-type': [
		'error',
		{
			default: 'array-simple',
		},
	],
	'@typescript-eslint/await-thenable': 'error',
	'@typescript-eslint/ban-ts-comment': [
		'error',
		{
			'ts-expect-error': 'allow-with-description',
			minimumDescriptionLength: 4,
		},
	],
	'@typescript-eslint/ban-tslint-comment': 'error',
	'@typescript-eslint/no-restricted-types': [
		'error',
		{
			types: {
				object: {
					message: 'The `object` type is hard to use. Use `Record<string, unknown>` instead. See: https://github.com/typescript-eslint/typescript-eslint/pull/848',
					fixWith: 'Record<string, unknown>',
				},
				null: {
					message: 'Use `undefined` instead. See: https://github.com/sindresorhus/meta/issues/7',
					fixWith: 'undefined',
				},
				Buffer: {
					message: 'Use Uint8Array instead. See: https://sindresorhus.com/blog/goodbye-nodejs-buffer',
					suggest: [
						'Uint8Array',
					],
				},
				'[]': 'Don\'t use the empty array type `[]`. It only allows empty arrays. Use `SomeType[]` instead.',
				'[[]]': 'Don\'t use `[[]]`. It only allows an array with a single element which is an empty array. Use `SomeType[][]` instead.',
				'[[[]]]': 'Don\'t use `[[[]]]`. Use `SomeType[][][]` instead.',
				'[[[[]]]]': 'ur drunk 🤡',
				'[[[[[]]]]]': '🦄💥',
			},
		},
	],
	'@typescript-eslint/class-literal-property-style': [
		'error',
		'getters',
	],
	'@typescript-eslint/consistent-generic-constructors': [
		'error',
		'constructor',
	],
	'@typescript-eslint/consistent-indexed-object-style': 'error',
	'brace-style': 'off',
	'@stylistic/brace-style': [
		'error',
		'1tbs',
		{
			allowSingleLine: false,
		},
	],
	'comma-dangle': 'off',
	'@stylistic/comma-dangle': [
		'error',
		'always-multiline',
	],
	'comma-spacing': 'off',
	'@stylistic/comma-spacing': [
		'error',
		{
			before: false,
			after: true,
		},
	],
	'default-param-last': 'off',
	'@typescript-eslint/default-param-last': 'error',
	'dot-notation': 'off',
	'@typescript-eslint/dot-notation': 'error',
	'@typescript-eslint/consistent-type-assertions': [
		'error',
		{
			assertionStyle: 'as',
			objectLiteralTypeAssertions: 'allow-as-parameter',
		},
	],
	'@typescript-eslint/consistent-type-definitions': [
		'error',
		'type',
	],
	'@typescript-eslint/consistent-type-exports': [
		'error',
		{
			fixMixedExportsWithInlineTypeSpecifier: true,
		},
	],
	'@typescript-eslint/consistent-type-imports': [
		'error',
		{
			fixStyle: 'inline-type-imports',
		},
	],

	// Disabled because it's too annoying. Enable it when it's more mature, smarter, and more flexible.
	// https://github.com/typescript-eslint/typescript-eslint/search?q=%22explicit-function-return-type%22&state=open&type=Issues
	// '@typescript-eslint/explicit-function-return-type': [
	// 	'error',
	// 	{
	// 		allowExpressions: true,
	// 		allowTypedFunctionExpressions: true,
	// 		allowHigherOrderFunctions: true,
	// 		allowConciseArrowFunctionExpressionsStartingWithVoid: false,
	// 		allowIIFE: true
	// 	}
	// ],

	// TODO: This rule should be removed if/when we enable `@typescript-eslint/explicit-function-return-type`.
	// Disabled for now as it has too many false-positives.
	// https://github.com/typescript-eslint/typescript-eslint/search?q=%22explicit-module-boundary-types%22&state=open&type=Issues
	// '@typescript-eslint/explicit-module-boundary-types': [
	// 	'error',
	// 	{
	// 		allowTypedFunctionExpressions: true,
	// 		allowHigherOrderFunctions: true,
	// 		allowDirectConstAssertionInArrowFunctions: true,
	// 		shouldTrackReferences: true
	// 	}
	// ],

	'func-call-spacing': 'off',
	'@stylistic/function-call-spacing': [
		'error',
		'never',
	],
	indent: 'off',
	'@stylistic/indent': [
		'error',
		'tab',
		{
			SwitchCase: 1,
		},
	],
	'keyword-spacing': 'off',
	'@stylistic/keyword-spacing': 'error',
	'lines-between-class-members': 'off',
	'@stylistic/lines-between-class-members': [
		'error',
		'always',
		{
			// Workaround to allow class fields to not have lines between them.
			// TODO: Get ESLint to add an option to ignore class fields.
			exceptAfterSingleLine: true,
		},
	],
	'@stylistic/member-delimiter-style': [
		'error',
		{
			multiline: {
				delimiter: 'semi',
				requireLast: true,
			},
			singleline: {
				delimiter: 'semi',
				requireLast: false,
			},
		},
	],
	'@typescript-eslint/member-ordering': [
		'error',
		{
			default: [
				'signature',

				'public-static-field',
				'public-static-method',

				'protected-static-field',
				'protected-static-method',

				'private-static-field',
				'private-static-method',

				'static-field',
				'static-method',

				'public-decorated-field',
				'public-instance-field',
				'public-abstract-field',
				'public-field',

				'protected-decorated-field',
				'protected-instance-field',
				'protected-abstract-field',
				'protected-field',

				'private-decorated-field',
				'private-instance-field',
				'private-field',

				'instance-field',
				'abstract-field',
				'decorated-field',
				'field',

				'public-constructor',
				'protected-constructor',
				'private-constructor',
				'constructor',

				'public-decorated-method',
				'public-instance-method',
				'public-abstract-method',
				'public-method',

				'protected-decorated-method',
				'protected-instance-method',
				'protected-abstract-method',
				'protected-method',

				'private-decorated-method',
				'private-instance-method',
				'private-method',

				'instance-method',
				'abstract-method',
				'decorated-method',
				'method',
			],
		},
	],

	// Disabled for now as it causes too many weird TypeScript issues. I'm not sure whether the problems are caused by bugs in TS or problems in my types.
	// TODO: Try to re-enable this again in 2026.
	// '@typescript-eslint/method-signature-style': 'error',

	// We use `@typescript-eslint/naming-convention` in favor of `camelcase`.
	camelcase: 'off',
	// Known issues:
	// - https://github.com/typescript-eslint/typescript-eslint/issues/1485
	// - https://github.com/typescript-eslint/typescript-eslint/issues/1484
	// TODO: Prevent `_` prefix on private fields when TypeScript 3.8 is out.
	...getNamingConventionRule({isTsx: false}),
	'@typescript-eslint/no-base-to-string': 'error',
	'no-array-constructor': 'off',
	'@typescript-eslint/no-array-constructor': 'error',
	'@typescript-eslint/no-array-delete': 'error',
	'no-dupe-class-members': 'off',
	'@typescript-eslint/no-dupe-class-members': 'error',
	'@typescript-eslint/no-confusing-void-expression': 'error',
	'@typescript-eslint/no-deprecated': 'error',
	'@typescript-eslint/no-duplicate-enum-values': 'error',
	'@typescript-eslint/no-duplicate-type-constituents': 'error',
	'@typescript-eslint/no-dynamic-delete': 'error',
	'no-empty-function': 'off',
	'@typescript-eslint/no-empty-function': 'error',
	'@typescript-eslint/no-empty-interface': [
		'error',
		{
			allowSingleExtends: true,
		},
	],
	'@typescript-eslint/no-empty-object-type': 'error',

	// TODO: Try to enable this again in 2025.
	// Disabled for now. This is a great rule. It's just that TypeScript is not good enough yet to not use `any` in many places.
	// For example: https://github.com/sindresorhus/refined-github/pull/2391#discussion_r318995182
	// '@typescript-eslint/no-explicit-any': [
	// 	'error',
	// 	{
	// 		fixToUnknown: true,
	// 		ignoreRestArgs: true
	// 	}
	// ],

	'@typescript-eslint/no-extra-non-null-assertion': 'error',

	// Disabled because it's buggy. It transforms `...(personalToken ? {Authorization: `token ${personalToken}`} : {})` into `...personalToken ? {Authorization: `token ${personalToken}`} : {}` which is not valid.
	// https://github.com/typescript-eslint/typescript-eslint/search?q=%22no-extra-parens%22&state=open&type=Issues
	'no-extra-parens': 'off',
	// '@typescript-eslint/no-extra-parens': [
	// 	'error',
	// 	'all',
	// 	{
	// 		conditionalAssign: false,
	// 		nestedBinaryExpressions: false,
	// 		ignoreJSX: 'multi-line',
	// 		nestedConditionalExpressions: false,
	// 	}
	// ],

	'no-extra-semi': 'off',
	'@stylistic/no-extra-semi': 'error',
	'no-loop-func': 'off',
	'@typescript-eslint/no-loop-func': 'error',
	'@typescript-eslint/no-extraneous-class': [
		'error',
		{
			allowConstructorOnly: false,
			allowEmpty: false,
			allowStaticOnly: false,
			allowWithDecorator: true,
		},
	],
	'no-void': [
		'error',
		{
			allowAsStatement: true, // To allow `ignoreVoid` in `@typescript-eslint/no-floating-promises`
		},
	],
	'@typescript-eslint/no-floating-promises': [
		'error',
		{
			checkThenables: true,
			ignoreVoid: true, // Prepend a function call with `void` to mark it as not needing to be await'ed, which silences this rule.
			ignoreIIFE: true,
		},
	],
	'@typescript-eslint/no-for-in-array': 'error',
	'@typescript-eslint/no-inferrable-types': 'error',

	// Disabled for now as it has too many false-positives.
	// '@typescript-eslint/no-invalid-void-type': 'error',

	'@typescript-eslint/no-meaningless-void-operator': 'error',
	'@typescript-eslint/no-misused-new': 'error',
	'@typescript-eslint/no-misused-promises': [
		'error',
		{
			checksConditionals: true,

			// TODO: I really want this to be `true`, but it makes it inconvenient to use
			// async functions as event handlers... I need to find a good way to handle that.
			// https://github.com/sindresorhus/refined-github/pull/2391#discussion_r318990466
			checksVoidReturn: false,
		},
	],
	'@typescript-eslint/no-namespace': 'error',
	'@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
	'@typescript-eslint/no-non-null-asserted-optional-chain': 'error',

	// Disabled for now. There are just too many places where you need to use it because of incorrect types, for example, the Node.js types.
	// TODO: Try to enable this again in 2023.
	// '@typescript-eslint/no-non-null-assertion': 'error',

	'no-redeclare': 'off',
	'@typescript-eslint/no-redeclare': 'error',
	'no-shadow': 'off',
	'@typescript-eslint/no-shadow': [
		'error',
		{
			ignoreOnInitialization: true,
		},
	],
	'no-restricted-imports': 'off',
	'@typescript-eslint/no-restricted-imports': [
		'error',
		{
			paths: [
				'domain',
				'freelist',
				'smalloc',
				'punycode',
				'sys',
				'querystring',
				'colors',
			],
		},
	],

	// The rule is buggy and keeps inferring `any` for types that are not `any`. Just a lot of false-positives.
	// '@typescript-eslint/no-redundant-type-constituents': 'error',

	'@typescript-eslint/no-require-imports': 'error',
	'@typescript-eslint/no-this-alias': [
		'error',
		{
			allowDestructuring: true,
		},
	],
	'no-throw-literal': 'off',
	'@typescript-eslint/only-throw-error': [
		'error',
		{
			// This should ideally be `false`, but it makes rethrowing errors inconvenient. There should be a separate `allowRethrowingUnknown` option.
			allowThrowingUnknown: true,
			allowThrowingAny: false,
		},
	],
	'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',

	// `no-unnecessary-condition` is essentially a stricter version of `no-constant-condition`, but that isn't currently enabled
	'no-constant-condition': 'error',

	// TODO: Try to enable this again in 2025 *if* the following are resolved:
	// - https://github.com/microsoft/TypeScript/issues/36393
	// - The rule needs a way to ignore runtime type-checks: https://github.com/sindresorhus/refined-github/pull/3168
	// - Run the rule on https://github.com/sindresorhus/refined-github and ensure there are no false-positives
	//
	// Also related: https://github.com/typescript-eslint/typescript-eslint/issues/1798
	// Also disable `no-constant-condition` when this is enabled
	// '@typescript-eslint/no-unnecessary-condition': [
	// 	'error',
	// 	{
	// 		checkTypePredicates: true
	// 	}
	// ],

	'@typescript-eslint/no-unnecessary-qualifier': 'error',
	'@typescript-eslint/no-unnecessary-type-arguments': 'error',
	'@typescript-eslint/no-unnecessary-type-assertion': 'error',
	'@typescript-eslint/no-unnecessary-type-constraint': 'error',

	// TODO: Currently documented as flawed. Enable it if fixed in 2026.
	// '@typescript-eslint/no-unnecessary-type-conversion': 'error',

	// TODO: Enable at some point. Currently disabled because it's marked as unstable.
	// https://typescript-eslint.io/rules/no-unnecessary-type-parameters/
	// '@typescript-eslint/no-unnecessary-type-parameters': 'error',

	'@typescript-eslint/no-unsafe-argument': 'error',
	'@typescript-eslint/no-unsafe-assignment': 'error',
	'@typescript-eslint/no-unsafe-call': 'error',
	'@typescript-eslint/no-unsafe-declaration-merging': 'error',
	'@typescript-eslint/no-unsafe-enum-comparison': 'error',
	'@typescript-eslint/no-unsafe-function-type': 'error',
	'@typescript-eslint/no-unsafe-member-access': 'error',
	'@typescript-eslint/no-unsafe-return': 'error',
	'@typescript-eslint/no-unsafe-type-assertion': 'error',
	'@typescript-eslint/no-useless-empty-export': 'error',
	'no-unused-expressions': 'off',
	'no-unused-private-class-members': 'off',
	'@typescript-eslint/no-unused-private-class-members': 'error',
	'@typescript-eslint/no-unused-expressions': 'error',
	'no-unused-vars': 'off',
	// NOTE: TypeScript already catches unused variables. Let us know if there's something this rule catches that TypeScript does not.
	// '@typescript-eslint/no-unused-vars': [
	// 	'error',
	// 	{
	// 		vars: 'all',
	// 		args: 'after-used',
	// 		ignoreRestSiblings: true,
	// 		argsIgnorePattern: /^_/.source,
	// 		caughtErrors: 'all',
	// 		caughtErrorsIgnorePattern: /^_$/.source
	// 	}
	// ],
	'no-useless-constructor': 'off',
	'@typescript-eslint/no-useless-constructor': 'error',
	'@typescript-eslint/no-useless-default-assignment': 'error',
	'object-curly-spacing': 'off',
	'@stylistic/object-curly-spacing': [
		'error',
		'never',
	],
	'padding-line-between-statements': 'off',
	'@stylistic/padding-line-between-statements': [
		'error',
		{
			blankLine: 'always',
			prev: 'multiline-block-like',
			next: '*',
		},
	],
	'@typescript-eslint/no-wrapper-object-types': 'error',
	'@typescript-eslint/non-nullable-type-assertion-style': 'error',
	'@typescript-eslint/prefer-as-const': 'error',
	'@typescript-eslint/prefer-find': 'error',
	'@typescript-eslint/prefer-for-of': 'error',
	'@typescript-eslint/prefer-function-type': 'error',
	'@typescript-eslint/prefer-includes': 'error',
	'@typescript-eslint/prefer-literal-enum-member': 'error',
	'@typescript-eslint/prefer-namespace-keyword': 'error',
	'@typescript-eslint/prefer-nullish-coalescing': [
		'error',
		{
			ignoreTernaryTests: false,
			ignoreConditionalTests: false,
			ignoreMixedLogicalExpressions: false,
		},
	],
	'@typescript-eslint/prefer-optional-chain': 'error',
	'prefer-promise-reject-errors': 'off',
	'@typescript-eslint/prefer-promise-reject-errors': 'error',
	'@typescript-eslint/prefer-readonly': 'error',

	// TODO: Try to enable this again in 2023.
	// Disabled for now as it's too annoying and will cause too much churn. It also has bugs: https://github.com/typescript-eslint/typescript-eslint/search?q=%22prefer-readonly-parameter-types%22+is:issue&state=open&type=issues
	// '@typescript-eslint/prefer-readonly-parameter-types': [
	// 	'error',
	// 	{
	// 		checkParameterProperties: true,
	// 		ignoreInferredTypes: true
	// 	}
	// ],

	'@typescript-eslint/prefer-reduce-type-parameter': 'error',
	'@typescript-eslint/prefer-string-starts-ends-with': 'error',
	'@typescript-eslint/promise-function-async': 'error',
	'@typescript-eslint/related-getter-setter-pairs': 'error',
	quotes: 'off',
	'@stylistic/quotes': [
		'error',
		'single',
	],
	'@typescript-eslint/restrict-plus-operands': [
		'error',
		{
			allowAny: false,
		},
	],
	'@typescript-eslint/restrict-template-expressions': [
		'error',
		{
			allowNumber: true,
		},
	],
	'@typescript-eslint/return-await': 'error',
	'@typescript-eslint/require-array-sort-compare': [
		'error',
		{
			ignoreStringArrays: true,
		},
	],

	// Disabled for now. It's too buggy. It fails to detect when try/catch is used, await inside blocks, etc. It's also common to have async functions without await for various reasons.
	// 'require-await': 'off',
	// '@typescript-eslint/require-await': 'error',

	'space-before-function-paren': 'off',
	'@stylistic/space-before-function-paren': [
		'error',
		{
			anonymous: 'always',
			named: 'never',
			asyncArrow: 'always',
		},
	],
	'space-infix-ops': 'off',
	'@stylistic/space-infix-ops': 'error',
	semi: 'off',
	'@stylistic/semi': [
		'error',
		'always',
	],
	'space-before-blocks': 'off',
	'@stylistic/space-before-blocks': [
		'error',
		'always',
	],

	// TODO: Reconsider enabling it again in 2023.
	// NOTE: The rule was complete redone in typescript-eslint v3, so this config needs to be changed before this is enabled.
	// Disabled for now as it's too strict.
	// Relevant discussion: https://github.com/sindresorhus/refined-github/pull/2521#discussion_r343013852
	// '@typescript-eslint/strict-boolean-expressions': [
	// 	'error',
	// 	{
	// 		allowNullable: true,
	// 		allowSafe: true
	// 	}
	// ],

	'@typescript-eslint/strict-void-return': 'error',
	'default-case': 'off', // It conflicts with `@typescript-eslint/switch-exhaustiveness-check`. It would still be nice to have this rule for non-exhaustive switches though.
	'@typescript-eslint/switch-exhaustiveness-check': [
		'error',
		{
			allowDefaultCaseForExhaustiveSwitch: false,
			requireDefaultForNonUnion: true,
		},
	],
	'@typescript-eslint/triple-slash-reference': [
		'error',
		{
			path: 'never',
			types: 'never',
			lib: 'never',
		},
	],
	'@stylistic/type-annotation-spacing': 'error',

	// Disabled as it crashes on most code.
	// https://github.com/typescript-eslint/typescript-eslint/search?q=%22unbound-method%22&state=open&type=Issues
	// '@typescript-eslint/unbound-method': [
	// 	'error',
	// 	{
	// 		ignoreStatic: true
	// 	}
	// ],

	'@typescript-eslint/prefer-regexp-exec': 'error',
	'@typescript-eslint/prefer-return-this-type': 'error',
	'@typescript-eslint/unified-signatures': [
		'error',
		{
			ignoreDifferentlyNamedParameters: true,
		},
	],
	'@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
	'@stylistic/type-generic-spacing': 'error',
	'@stylistic/type-named-tuple-spacing': 'error',

	// Disabled per typescript-eslint recommendation: https://github.com/typescript-eslint/typescript-eslint/blob/e26e43ffba96f6d46198b22f1c8dd5c814db2652/docs/getting-started/linting/FAQ.md#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
	'no-undef': 'off',

	// TypeScript might have features not supported in a specific Node.js version.
	'n/no-unsupported-features/es-syntax': 'off',
	'n/no-unsupported-features/es-builtins': 'off',

	// Even though we already use `@typescript-eslint/no-restricted-types`, `unicorn/no-null` is useful for catching literal usage.
	// https://github.com/xojs/eslint-config-xo-typescript/issues/69
	// 'unicorn/no-null': 'off',

	// The rule is buggy with TS and it's not needed as TS already enforces valid imports and references at compile-time.
	'import-x/namespace': 'off',

	// TypeScript already does a better job at this.
	'import-x/named': 'off',

	// `import-x/no-duplicates` works better with TypeScript.
	'no-duplicate-imports': 'off',
};
