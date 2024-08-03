import eslintConfigXoBrowser from './browser.js';

const [config] = eslintConfigXoBrowser;

export default [
	{
		...config,
		rules: {
			...config.rules,
			indent: [
				'error',
				2,
				{
					SwitchCase: 1,
				},
			],
		},
	},
];
