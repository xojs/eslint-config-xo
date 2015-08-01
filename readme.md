# eslint-config-xo [![Build Status](https://travis-ci.org/sindresorhus/eslint-config-xo.svg?branch=master)](https://travis-ci.org/sindresorhus/eslint-config-xo)

> ESLint [shareable config](http://eslint.org/docs/developer-guide/shareable-configs.html) for [XO](https://github.com/sindresorhus/xo)

This is for advanced users. You probably want to use XO directly.


## Install

```
$ npm install --save-dev eslint-config-xo
```


## Usage

Add some ESLint config to your `package.json`:

```json
{
	"name": "my-awesome-project",
	"eslintConfig": {
		"extends": "xo"
	}
}
```

Or to `.eslintrc`:

```json
{
	"extends": "xo"
}
```

This package also exposes [`xo/esnext`](esnext.js) if you want ES2015 support and rules:

```json
{
	"extends": "xo/esnext"
}
```

And [`xo/browser`](browser.js) if you're in the browser:

```json
{
	"extends": "xo/browser"
}
```


## Related

- [eslint-config-xo-space](https://github.com/sindresorhus/eslint-config-xo-space) - ESLint shareable config for XO with 2-space indent
- [eslint-config-react](https://github.com/sindresorhus/eslint-config-react) - ESLint shareable config for React to be used with this config


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
