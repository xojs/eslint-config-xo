import eslintConfigXo from './index.js';

export default [
	...eslintConfigXo(),
	{
		ignores: ['test/fixture.ts'],
	},
];
