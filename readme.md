# eslint-config-xo

> ESLint [shareable config](https://eslint.org/docs/developer-guide/shareable-configs.html) for [XO](https://github.com/xojs/xo) with support for JavaScript, TypeScript, HTML, and Markdown

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
import {defineConfig} from 'eslint/config';

export default defineConfig([
	...eslintConfigXo(),
]);
```

### Options

#### browser

Type: `boolean`\
Default: `false`

Use browser globals instead of Node.js globals.

```js
export default defineConfig([
	...eslintConfigXo({browser: true}),
]);
```

#### space

Type: `boolean | number`\
Default: `false`

Use spaces for indentation instead of tabs. Set to `true` for 2 spaces, or a number for a custom count.

```js
export default defineConfig([
	...eslintConfigXo({space: true}),
]);
```

#### semicolon

Type: `boolean`\
Default: `true`

Use semicolons at the end of statements. Set to `false` to enforce no semicolons.

```js
export default defineConfig([
	...eslintConfigXo({semicolon: false}),
]);
```

#### prettier

Type: `boolean | 'compat'`\
Default: `false`

Integrate [Prettier](https://prettier.io).

- `true` — Run Prettier as an ESLint rule using XO's Prettier style, and disable the stylistic rules that would conflict with it. Requires `prettier` to be installed.
- `'compat'` — Only disable the stylistic rules that conflict with Prettier, for when you run Prettier separately (for example, from your editor or a script).

```js
export default defineConfig([
	...eslintConfigXo({prettier: true}),
]);
```

Prettier options you set in a `.prettierrc` still apply for anything XO does not configure (like `printWidth` or plugins), but XO's own style settings take precedence.

## TypeScript

TypeScript is supported out of the box. If [`typescript`](https://github.com/microsoft/TypeScript) is installed, TypeScript rules are automatically enabled. For JavaScript-only projects, `typescript` is not required.

## HTML

HTML files (`*.html`) are linted automatically using [`@html-eslint/eslint-plugin`](https://github.com/yeonjuan/html-eslint), covering best practices, accessibility, SEO, and style.

## Markdown

Markdown files (`*.md`) are linted automatically using [`@eslint/markdown`](https://github.com/eslint/markdown), covering link/image correctness, heading structure, and more.

## Custom rules

### xo/import-specifier-newline

When an import spans multiple lines, each specifier must be on its own line. Autofixable.

```js
// Bad
import {
	foo, bar, baz,
} from 'x';

// Good
import {
	foo,
	bar,
	baz,
} from 'x';

// Single-line imports are not affected
import {foo, bar} from 'x';
```

## Included plugins

- [`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn)
- [`eslint-node-test`](https://github.com/sindresorhus/eslint-node-test)
- [`eslint-package-json`](https://github.com/sindresorhus/eslint-package-json)
- [`eslint-plugin-ava`](https://github.com/avajs/eslint-plugin-ava)
- [`eslint-plugin-import-x`](https://github.com/un-ts/eslint-plugin-import-x)
- [`eslint-plugin-n`](https://github.com/eslint-community/eslint-plugin-n)
- [`@eslint-community/eslint-plugin-eslint-comments`](https://github.com/eslint-community/eslint-plugin-eslint-comments)
- [`@stylistic/eslint-plugin`](https://github.com/eslint-stylistic/eslint-stylistic)
- [`typescript-eslint`](https://github.com/typescript-eslint/typescript-eslint)
- [`@html-eslint/eslint-plugin`](https://github.com/yeonjuan/html-eslint)
- [`@eslint/markdown`](https://github.com/eslint/markdown)
- [`eslint-plugin-regexp`](https://github.com/ota-meshi/eslint-plugin-regexp)
- [`eslint-plugin-jsdoc`](https://github.com/gajus/eslint-plugin-jsdoc)
- [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier) *(only when the [`prettier`](#prettier) option is enabled)*

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
