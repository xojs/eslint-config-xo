# eslint-config-xo

> ESLint [shareable config](https://eslint.org/docs/developer-guide/shareable-configs.html) for [XO](https://github.com/xojs/xo) with support for JavaScript and TypeScript

This is for advanced users. [You probably want to use XO directly.](#use-the-xo-cli-instead)

**Use the [XO issue tracker](https://github.com/xojs/xo/issues) instead of this one.**

## Install

```sh
npm install --save-dev eslint-config-xo
```

## Usage

```js
// eslint.config.js
import eslintConfigXo from 'eslint-config-xo';

export default [
	...eslintConfigXo(),
];
```

### Options

#### browser

Type: `boolean`\
Default: `false`

Use browser globals instead of Node.js globals.

```js
export default [
	...eslintConfigXo({browser: true}),
];
```

#### space

Type: `boolean | number`\
Default: `false`

Use spaces for indentation instead of tabs. Set to `true` for 2 spaces, or a number for a custom count.

```js
export default [
	...eslintConfigXo({space: true}),
];
```

#### semicolon

Type: `boolean`\
Default: `true`

Use semicolons at the end of statements. Set to `false` to enforce no semicolons.

```js
export default [
	...eslintConfigXo({semicolon: false}),
];
```

## Included plugins

- [`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn)
- [`eslint-plugin-import-x`](https://github.com/un-ts/eslint-plugin-import-x)
- [`eslint-plugin-n`](https://github.com/eslint-community/eslint-plugin-n)
- [`eslint-plugin-ava`](https://github.com/avajs/eslint-plugin-ava)
- [`@eslint-community/eslint-plugin-eslint-comments`](https://github.com/eslint-community/eslint-plugin-eslint-comments)
- [`@stylistic/eslint-plugin`](https://github.com/eslint-stylistic/eslint-stylistic)
- [`typescript-eslint`](https://github.com/typescript-eslint/typescript-eslint)

## Use the XO CLI instead

XO is an ESLint wrapper with great defaults.

Here are some reason why you should use the [XO CLI](https://github.com/xojs/xo) instead of this config:

- XO comes bundled with this config.
- [Beautiful output.](https://github.com/sindresorhus/eslint-formatter-pretty)
- No need to specify file paths to lint. It will lint all JS files except [commonly ignored paths](https://github.com/xojs/xo#ignores).
- Super simple to add XO to a project with [`$ npm init xo`](https://github.com/xojs/create-xo).
- Config/rule overrides per files/globs.
- [Prettier](https://prettier.io) integration.
- [React](https://github.com/xojs/eslint-config-xo-react) support.
- Can open all files with errors at the correct line in your editor. *(See the `--open` flag)*
- The [editor plugins](https://github.com/xojs/xo#editor-plugins) are IMHO better than the ESLint ones. *(Subjective)*

tl;dr You miss out on a lot by just using this config.

## Related

- [eslint-config-xo-react](https://github.com/xojs/eslint-config-xo-react) - ESLint shareable config for React to be used with this config
