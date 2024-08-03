# eslint-config-xo

> ESLint [shareable config](https://eslint.org/docs/developer-guide/shareable-configs.html) for [XO](https://github.com/xojs/xo)

This is for advanced users. [You probably want to use XO directly.](#use-the-xo-cli-instead)

See [eslint-plugin-unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn) for some additional useful rules.

**Use the [XO issue tracker](https://github.com/xojs/xo/issues) instead of this one.**

## Install

```sh
npm install --save-dev eslint-config-xo
```

## Usage

```js
// eslint.config.js
import xo from 'eslint-config-xo';

export default [
	...xo,
];
```

This package also exposes [`eslint-config-xo/browser`](browser.js) if you're in the browser:

```js
import xoBrowser from 'eslint-config-xo/browser';

export default [
	...xoBrowser,
];
```

This package also exposes [`eslint-config-xo/space`](space.js) if you're in favor of 2-space indent:

```js
import xoSpace from 'eslint-config-xo/space';

export default [
	...xoSpace,
];
```

This package also exposes [`eslint-config-xo/space/browser`](space-browser.js) if you're in favor of 2-space indent and in browser:

```js
import xoSpaceBrowser from 'eslint-config-xo/space/browser';

export default [
	...xoSpaceBrowser,
];
```

## Use the XO CLI instead

XO is an ESLint wrapper with great defaults.

Here are some reason why you should use the [XO CLI](https://github.com/xojs/xo) instead of this config:

- XO comes bundled with this config.
- [Beautiful output.](https://github.com/sindresorhus/eslint-formatter-pretty)
- Bundles many useful plugins, like [`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn), [`eslint-plugin-import`](https://github.com/benmosher/eslint-plugin-import), [`eslint-plugin-ava`](https://github.com/avajs/eslint-plugin-ava), and more.
- No need to specify file paths to lint. It will lint all JS files except [commonly ignored paths](https://github.com/xojs/xo#ignores).
- Super simple to add XO to a project with [`$ npm init xo`](https://github.com/xojs/create-xo).
- Specify `indent` and `semicolon` preferences easily without messing with the rule config.
- Config/rule overrides per files/globs.
- Can open all files with errors at the correct line in your editor. *(See the `--open` flag)*
- The [editor plugins](https://github.com/xojs/xo#editor-plugins) are IMHO better than the ESLint ones. *(Subjective)*

tl;dr You miss out on a lot by just using this config.

## Related

- [eslint-config-xo-space](https://github.com/xojs/eslint-config-xo-space) - ESLint shareable config for XO with 2-space indent
- [eslint-config-xo-typescript](https://github.com/xojs/eslint-config-xo-typescript) - ESLint shareable config for TypeScript to be used with this config
- [eslint-config-xo-react](https://github.com/xojs/eslint-config-xo-react) - ESLint shareable config for React to be used with this config
