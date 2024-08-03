import eslintConfigXo from './index.js';

const [config] = eslintConfigXo;

export default [
	{
		...config,
		rules: {
			...config.rules,
			'@stylistic/indent': [
				'error',
				2,
				{
					SwitchCase: 1,
				},
			],
		},
	},
];
