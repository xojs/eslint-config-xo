import {type Linter} from 'eslint';

export const tsExtensions: string[];
export const jsExtensions: string[];
export const frameworkExtensions: string[];
export const allExtensions: string[];

export const tsFilesGlob: string;
export const jsFilesGlob: string;
export const allFilesGlob: string;

export const defaultIgnores: string[];

export const typescriptParser: Linter.Parser;

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
};

/**
ESLint shareable config for XO with support for JavaScript and TypeScript.

@returns An array of ESLint flat config objects.
*/
export default function eslintConfigXo(options?: Options): Linter.Config[];
