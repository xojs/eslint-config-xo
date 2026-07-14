import {type Linter} from 'eslint';

export const tsExtensions: string[];
export const jsExtensions: string[];
export const frameworkExtensions: string[];
export const htmlExtensions: string[];
export const mdExtensions: string[];
export const allExtensions: string[];

export const tsFilesGlob: string;
export const jsFilesGlob: string;
export const allFilesGlob: string;

export const defaultIgnores: string[];

export const typescriptParser: Linter.Parser | undefined;

export type Options = {
	/**
	Use browser globals instead of Node.js globals.

	@default false
	*/
	browser?: boolean;

	/**
	Use spaces for indentation instead of tabs.

	Set to `true` for 2 spaces, or a number for a custom count.

	@default false
	*/
	space?: boolean | number;

	/**
	Use semicolons at the end of statements.

	@default true
	*/
	semicolon?: boolean;

	/**
	Integrate [Prettier](https://prettier.io).

	- `true` — Run Prettier as an ESLint rule using XO's Prettier style, and disable the stylistic rules that would conflict with it. Requires `prettier` to be installed.
	- `'compat'` — Only disable the stylistic rules that conflict with Prettier, for when you run Prettier separately (for example, from your editor or a script).

	Prettier options you set in a `.prettierrc` still apply for anything XO does not configure (like `printWidth` or plugins), but XO's own style settings take precedence.

	@default false
	*/
	prettier?: boolean | 'compat';

	/**
	Ignore paths listed in your project's `.gitignore` file.

	Pass `import.meta.url` from your ESLint config file so the `.gitignore` is resolved relative to it. It is a no-op if the file does not exist.

	Not needed when using the [XO CLI](https://github.com/xojs/xo), which already respects `.gitignore`.

	@example
	```
	import eslintConfigXo from 'eslint-config-xo';
	import {defineConfig} from 'eslint/config';

	export default defineConfig([
		...eslintConfigXo({gitignore: import.meta.url}),
	]);
	```
	*/
	gitignore?: string;
};

/**
ESLint shareable config for XO with support for JavaScript and TypeScript.

@returns An array of ESLint flat config objects.
*/
export default function eslintConfigXo(options?: Options): Linter.Config[];

/**
Build the ESLint flat config object that integrates [Prettier](https://prettier.io), or `undefined` when `prettier` is falsy.

Mainly intended for the `xo` package to reuse XO's Prettier integration. When `files` is omitted, the config applies to all files.
*/
export function getPrettierConfig(options: {
	prettier?: boolean | 'compat';
	space?: boolean | number;
	semicolon?: boolean;
	files?: Linter.Config['files'];
}): Linter.Config | undefined;
