export const restrictedImports = [
	'domain',
	'freelist',
	'smalloc',
	'punycode',
	'sys',
	'querystring',
	'colors',
	// TODO: Enable this in 2028.
	// {
	// 	name: 'buffer',
	// 	message: 'Use Uint8Array instead. See: https://sindresorhus.com/blog/goodbye-nodejs-buffer',
	// },
	// {
	// 	name: 'node:buffer',
	// 	message: 'Use Uint8Array instead. See: https://sindresorhus.com/blog/goodbye-nodejs-buffer',
	// },
	{
		name: 'mkdirp',
		message: 'Use `fs.mkdir` with `{recursive: true}` instead.',
	},
	{
		name: 'rimraf',
		message: 'Use `fs.rm` with `{recursive: true}` instead.',
	},
	{
		name: 'object-assign',
		message: 'Use `Object.assign()` or object spread instead.',
	},
	{
		name: 'xtend',
		message: 'Use `Object.assign()` or object spread instead.',
	},
	{
		name: 'extend-shallow',
		message: 'Use `Object.assign()` or object spread instead.',
	},
	{
		name: 'left-pad',
		message: 'Use `String.prototype.padStart()` instead.',
	},
	{
		name: 'pad-left',
		message: 'Use `String.prototype.padStart()` instead.',
	},
	{
		name: 'right-pad',
		message: 'Use `String.prototype.padEnd()` instead.',
	},
	{
		name: 'pad-right',
		message: 'Use `String.prototype.padEnd()` instead.',
	},
	{
		name: 'safe-buffer',
		message: 'Use `Buffer.alloc()` or `Buffer.from()` instead.',
	},
	{
		name: 'safer-buffer',
		message: 'Use `Buffer.alloc()` or `Buffer.from()` instead.',
	},
	{
		name: 'buffer-alloc',
		message: 'Use `Buffer.alloc()` instead.',
	},
	{
		name: 'array-flatten',
		message: 'Use `Array.prototype.flat()` instead.',
	},
	{
		name: 'concat-map',
		message: 'Use `Array.prototype.flatMap()` instead.',
	},
	{
		name: 'pad',
		message: 'Use `String.prototype.padStart()` / `String.prototype.padEnd()` instead.',
	},
	{
		name: 'co',
		message: 'Use async/await instead.',
	},
	{
		name: 'inherits',
		message: 'Use `class extends` instead.',
	},
	{
		name: 'windows-1252',
		message: 'Use `TextDecoder` instead.',
	},
	{
		name: 'string_decoder',
		message: 'Use `TextDecoder` instead.',
	},
	{
		name: 'isarray',
		message: 'Use `Array.isArray()` instead.',
	},
	{
		name: 'object-keys',
		message: 'Use `Object.keys()` instead.',
	},
	{
		name: 'object.assign',
		message: 'Use `Object.assign()` or object spread instead.',
	},
	{
		name: 'globalthis',
		message: 'Use the `globalThis` global instead.',
	},
	{
		name: 'es6-promise',
		message: 'Use `Promise` instead.',
	},
	{
		name: 'abort-controller',
		message: 'Use the native `AbortController` instead.',
	},
	{
		name: 'queue-microtask',
		message: 'Use `queueMicrotask()` instead.',
	},
	{
		name: 'buffer-from',
		message: 'Use `Buffer.from()` instead.',
	},
	{
		name: 'has',
		message: 'Use `Object.hasOwn()` instead.',
	},
	{
		name: 'hasown',
		message: 'Use `Object.hasOwn()` instead.',
	},
	{
		name: 'repeat-string',
		message: 'Use `String.prototype.repeat()` instead.',
	},
	{
		name: 'path-parse',
		message: 'Use `path.parse()` instead.',
	},
	{
		name: 'node.extend',
		message: 'Use `Object.assign()` or object spread instead.',
	},
	{
		name: 'aggregate-error',
		message: 'Use the native `AggregateError` instead.',
	},
	{
		name: 'is-nan',
		message: 'Use `Number.isNaN()` instead.',
	},
	{
		name: 'is-finite',
		message: 'Use `Number.isFinite()` instead.',
	},
	{
		name: 'object-is',
		message: 'Use `Object.is()` instead.',
	},
	{
		name: 'defaults',
		message: 'Use `Object.assign()` instead.',
	},
	{
		name: 'whatwg-url',
		message: 'Use the native `URL` API instead.',
	},
	// TODO: Enable when targeting Node.js 24+.
	// {
	// 	name: 'escape-string-regexp',
	// 	message: 'Use `RegExp.escape()` instead.',
	// },
];
