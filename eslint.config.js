import eslintConfigXo from './index.js';

export default [
	...eslintConfigXo(),
	{
		ignores: ['test/fixture.ts', 'index.d.ts'],
	},
	{
		files: ['eslint.config.js'],
		rules: {
			'import-x/no-anonymous-default-export': 'off',
		},
	},
	{
		files: ['index.js'],
		rules: {
			'n/prefer-global/process': 'off',
		},
	},
];
