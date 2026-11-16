# Custom rules

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
