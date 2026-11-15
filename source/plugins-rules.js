import pluginUnicorn from 'eslint-plugin-unicorn';

export const pluginsRules = {
	...pluginUnicorn.configs?.recommended?.rules,
	'no-use-extend-native/no-use-extend-native': 'error',
	'xo/import-specifier-newline': 'error',
	// TODO: Restore when it becomes safer: https://github.com/sindresorhus/eslint-plugin-unicorn/issues/681
	// 'unicorn/string-content': [
	// 	'error',
	// 	{
	// 		patterns: {
	// 			'': '\u2019',
	// 			[/\.\.\./.source]: '\u2026',
	// 			'->': '\u2192',
	// 			[/^http:\/\//.source]: 'http://'
	// 		}
	// 	}
	// ],
	// We only enforce it for single-line statements to not be too opinionated.
	'unicorn/prefer-ternary': [
		'error',
		'only-single-line',
	],
	// Used in favor of the native `logical-assignment-operators`, which `eslint-plugin-unicorn`'s recommended config disables. The unicorn version has the same options but adds an autofix.
	'unicorn/logical-assignment-operators': [
		'error',
		'always',
		{
			enforceForIfStatements: true,
		},
	],
	// TODO: Remove this override when the rule is more stable.
	'unicorn/consistent-function-scoping': 'off',
	// Too opinionated. Methods with a single return are fine as-is.
	'unicorn/prefer-short-arrow-method': 'off',
	// TODO: Disabled for now to avoid churn. Enable at some point.
	'unicorn/no-this-outside-of-class': 'off',
	// We enable this in favor of the boolean prefix in `@typescript-eslint/naming-convention`, which was too strict (it flagged destructuring bindings) and TypeScript-only.
	'unicorn/consistent-boolean-name': [
		'error',
		{
			prefixes: {
				had: true,
				does: true,
			},
		},
	],
	// TODO: Enable when the rule's "simple iterable" allowlist is broadened. It flags ordinary, readable `for…of` iterables, like method calls with an interpolated template-literal argument (`root.querySelectorAll(`[x=${y}]`)`) or a literal receiver (`'a,b'.split(',')`).
	'unicorn/no-unreadable-for-of-expression': 'off',
	// TODO: Enable when less aggressive. It flags the normal pattern of reassigning a top-level variable from inside a callback (e.g. a counter in `setInterval`).
	'unicorn/no-top-level-assignment-in-function': 'off',
	// TODO: Enable again when using `eslint-plugin-unicorn` v81. It reports a replacement that is a function declared in the same file (`string.replace(regex, replacer)`), which is the safe form the rule recommends.
	'unicorn/no-unsafe-string-replacement': 'off',
	// Not in `eslint-plugin-unicorn`'s recommended config. `import.meta.dirname` and `import.meta.filename` are available in Node.js 20.11 and later.
	// TODO: Enable again when using `eslint-plugin-unicorn` v81. Its autofix removes the trailing path separator from `fileURLToPath(new URL('.', import.meta.url))`.
	'unicorn/prefer-import-meta-properties': 'off',
	// Not in `eslint-plugin-unicorn`'s recommended config. Also enabled for HTML files in `html.js`.
	'unicorn/no-invalid-file-input-accept': 'error',
	// TODO: Temporarily disabled as the rule is buggy.
	'function-call-argument-newline': 'off',
	'import-x/default': 'error',
	'import-x/export': 'error',
	'import-x/extensions': [
		'error',
		'always',
		{
			ignorePackages: true,
		},
	],
	'import-x/first': 'error',

	// Enabled, but disabled on TypeScript (https://github.com/xojs/xo/issues/576)
	'import-x/named': 'error',
	'import-x/namespace': [
		'error',
		{
			allowComputed: true,
		},
	],
	'import-x/no-absolute-path': 'error',
	'import-x/no-anonymous-default-export': 'error',
	'import-x/no-named-default': 'error',
	'import-x/no-webpack-loader-syntax': 'error',
	'import-x/no-self-import': 'error',
	'import-x/no-cycle': [
		'error',
		{
			ignoreExternal: true,
		},
	],
	'import-x/no-useless-path-segments': 'error',
	'import-x/newline-after-import': [
		'error',
		{
			// TODO: Buggy.
			// considerComments: true,
		},
	],
	'import-x/no-amd': 'error',
	'import-x/no-duplicates': [
		'error',
		{
			'prefer-inline': true,
		},
	],
	// We use `unicorn/prefer-module` instead.
	// 'import-x/no-commonjs': 'error',
	// Looks useful, but too unstable at the moment
	// 'import-x/no-deprecated': 'error',
	'import-x/no-empty-named-blocks': 'error',
	'import-x/no-extraneous-dependencies': [
		'error',
		{
			includeTypes: true,
		},
	],
	'import-x/no-mutable-exports': 'error',
	'import-x/no-named-as-default-member': 'error',
	'import-x/no-named-as-default': 'error',
	// Disabled because it's buggy and it also doesn't work with TypeScript
	// 'import-x/no-unresolved': [
	// 	'error',
	// 	{
	// 		commonjs: false
	// 	}
	// ],
	'import-x/order': [
		'error',
		{
			groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
			'newlines-between': 'never',
			warnOnUnassignedImports: true,
		},
	],
	'import-x/no-unassigned-import': [
		'error',
		{
			allow: [
				'@babel/polyfill',
				'**/register',
				'**/register.*',
				'**/register/**',
				'**/register/**.*',
				'**/*.css',
				'**/*.scss',
				'**/*.sass',
				'**/*.less',
			],
		},
	],
	// Redundant with `import-x/no-extraneous-dependencies`.
	'n/no-extraneous-import': 'error',
	// 'n/no-extraneous-require': 'error',
	// Redundant with `import-x/no-unresolved`.
	// 'n/no-missing-import': 'error', // This rule is also buggy and doesn't support `node:`.
	// 'n/no-missing-require': 'error',
	'n/no-unpublished-bin': 'error',
	// Uniquely handles TypeScript's `.js`-for-`.ts` import convention (via its tsconfig-aware
	// extension mapping) and has an auto-fix, so we keep it enabled alongside `import-x/extensions`.
	'n/file-extension-in-import': ['error', 'always'],
	'n/no-mixed-requires': [
		'error',
		{
			grouping: true,
			allowCall: true,
		},
	],
	'n/no-new-require': 'error',
	'n/no-path-concat': 'error',
	'n/process-exit-as-throw': 'error',
	'n/no-deprecated-api': 'error',
	'n/prefer-global/buffer': ['error', 'never'],
	'n/prefer-global/console': ['error', 'always'],
	'n/prefer-global/process': ['error', 'never'],
	'n/prefer-global/text-decoder': ['error', 'always'],
	'n/prefer-global/text-encoder': ['error', 'always'],
	'n/prefer-global/url-search-params': ['error', 'always'],
	'n/prefer-global/url': ['error', 'always'],
	'n/prefer-process-get-builtin-module': 'error',
	'n/prefer-promises/dns': 'error',
	'n/prefer-promises/fs': 'error',
	'@eslint-community/eslint-comments/disable-enable-pair': [
		'error',
		{
			allowWholeFile: true,
		},
	],
	'@eslint-community/eslint-comments/no-aggregating-enable': 'error',
	'@eslint-community/eslint-comments/no-duplicate-disable': 'error',
	// Disabled as it's already covered by the `unicorn/no-abusive-eslint-disable` rule.
	// 'eslint-comments/no-unlimited-disable': 'error',
	'@eslint-community/eslint-comments/no-unused-disable': 'error',
	'@eslint-community/eslint-comments/no-unused-enable': 'error',
	'@eslint-community/eslint-comments/require-description': [
		'error',
		{
			ignore: [
				'eslint-enable',
				'eslint-disable-next-line',
				'eslint-disable-line',
				'eslint-env',
				'exported',
				'global',
				'globals',
			],
		},
	],
};
