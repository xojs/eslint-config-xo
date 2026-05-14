const importSpecifierNewlineRule = {
	meta: {
		type: 'layout',
		docs: {
			description: 'Enforce each import specifier to be on its own line when the import spans multiple lines',
		},
		fixable: 'whitespace',
		messages: {
			specifierOnNewline: 'Each import specifier should be on its own line.',
		},
		schema: [],
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				const specifiers = node.specifiers.filter(specifier => specifier.type === 'ImportSpecifier');

				if (specifiers.length < 2) {
					return;
				}

				const {sourceCode} = context;
				const openBrace = sourceCode.getTokenBefore(specifiers[0]);
				const closeBrace = sourceCode.getTokenAfter(specifiers.at(-1), token => token.value === '}');

				if (!openBrace || !closeBrace || openBrace.loc.start.line === closeBrace.loc.start.line) {
					return;
				}

				for (let index = 1; index < specifiers.length; index++) {
					const current = specifiers[index];
					const previous = specifiers[index - 1];

					if (current.loc.start.line === previous.loc.start.line) {
						context.report({
							node: current,
							messageId: 'specifierOnNewline',
							fix(fixer) {
								const comma = sourceCode.getTokenAfter(previous, token => token.value === ',');
								if (!comma || sourceCode.commentsExistBetween(comma, current)) {
									return undefined;
								}

								const previousLine = sourceCode.lines[previous.loc.start.line - 1];
								const indent = previousLine.match(/^\s*/v)[0];

								return fixer.replaceTextRange(
									[comma.range[1], current.range[0]],
									'\n' + indent,
								);
							},
						});
					}
				}
			},
		};
	},
};

export default importSpecifierNewlineRule;
