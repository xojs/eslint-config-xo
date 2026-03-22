import pluginUnicorn from 'eslint-plugin-unicorn';

export const pluginsRules = {
	...pluginUnicorn.configs?.recommended?.rules,
	'no-use-extend-native/no-use-extend-native': 'error',
	// TODO: Remove this override at some point.
	// It's just here to ease users into readable variable names.
	'unicorn/prevent-abbreviations': [
		'error',
		{
			checkFilenames: false,
			checkDefaultAndNamespaceImports: false,
			checkShorthandImports: false,
			extendDefaultReplacements: false,
			replacements: {
				// https://thenextweb.com/dd/2020/07/13/linux-kernel-will-no-longer-use-terms-blacklist-and-slave/
				whitelist: {
					include: true,
				},
				blacklist: {
					exclude: true,
				},
				master: {
					main: true,
				},
				slave: {
					secondary: true,
				},

				// Not part of `eslint-plugin-unicorn`
				application: {
					app: true,
				},
				applications: {
					apps: true,
				},

				// Part of `eslint-plugin-unicorn`
				arr: {
					array: true,
				},
				e: {
					error: true,
					event: true,
				},
				el: {
					element: true,
				},
				elem: {
					element: true,
				},
				len: {
					length: true,
				},
				msg: {
					message: true,
				},
				num: {
					number: true,
				},
				obj: {
					object: true,
				},
				opts: {
					options: true,
				},
				param: {
					parameter: true,
				},
				params: {
					parameters: true,
				},
				prev: {
					previous: true,
				},
				req: {
					request: true,
				},
				res: {
					response: true,
					result: true,
				},
				ret: {
					returnValue: true,
				},
				str: {
					string: true,
				},
				temp: {
					temporary: true,
				},
				tmp: {
					temporary: true,
				},
				val: {
					value: true,
				},
				err: {
					error: true,
				},
			},
		},
	],
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
	// The character class sorting is a bit buggy at the moment.
	'unicorn/better-regex': [
		'error',
		{
			sortCharacterClasses: false,
		},
	],
	// TODO: Disabled for now until it becomes more stable: https://github.com/sindresorhus/eslint-plugin-unicorn/search?q=consistent-destructuring+is:issue&state=open&type=issues
	'unicorn/consistent-destructuring': 'off',
	// TODO: Disabled for now as I don't have time to deal with the backslash that might come from this. Try to enable this rule in 2021.
	'unicorn/no-null': 'off',
	// We only enforce it for single-line statements to not be too opinionated.
	'unicorn/prefer-ternary': ['error', 'only-single-line'],
	// It will be disabled in the next version of eslint-plugin-unicorn.
	'unicorn/prefer-json-parse-buffer': 'off',
	// TODO: Remove this override when the rule is more stable.
	'unicorn/consistent-function-scoping': 'off',
	// TODO: Temporarily disabled until it becomes more mature.
	'unicorn/no-useless-undefined': 'off',
	// TODO: Temporarily disabled as the rule is buggy.
	'function-call-argument-newline': 'off',
	// Commented out because it's not ready for ESLint 10.
	// 'promise/param-names': 'error',
	// 'promise/no-return-wrap': [
	// 	'error',
	// 	{
	// 		allowReject: true,
	// 	},
	// ],
	// 'promise/no-new-statics': 'error',
	// 'promise/no-return-in-finally': 'error',
	// 'promise/prefer-await-to-then': [
	// 	'error',
	// 	{
	// 		strict: true,
	// 	},
	// ],
	// 'promise/prefer-catch': 'error',
	// 'promise/valid-params': 'error',
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
	// We have this enabled in addition to `import-x/extensions` as this one has an auto-fix.
	'n/file-extension-in-import': [
		'error',
		'always',
		{
			// TypeScript doesn't yet support using extensions and fails with error TS2691.
			'.ts': 'never',
			'.tsx': 'never',
		},
	],
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
};
