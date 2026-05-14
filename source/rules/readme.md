# Custom rules

## xo/import-specifier-newline

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
```

Single-line imports are not affected.

## no-use-extend-native/no-use-extend-native

Disallow relying on non-standard properties on native objects.

```js
// Bad
[].foo();
'hello'.bar;

// Good
[].push(1);
'hello'.length;
```
