'use strict';
var def = require('./');

def.ecmaFeatures = {
	arrowFunctions: true,
	binaryLiterals: true,
	blockBindings: true,
	classes: true,
	defaultParams: true,
	destructuring: true,
	experimentalObjectRestSpread: true,
	forOf: true,
	generators: true,
	globalReturn: true,
	modules: true,
	objectLiteralComputedProperties: true,
	objectLiteralDuplicateProperties: true,
	objectLiteralShorthandMethods: true,
	objectLiteralShorthandProperties: true,
	octalLiterals: true,
	regexUFlag: true,
	regexYFlag: true,
	restParams: true,
	spread: true,
	superInFunctions: true,
	templateStrings: true,
	unicodeCodePointEscapes: true
};

def.env.es6 = true;
def.rules['no-var'] = 2;
def.rules['object-shorthand'] = [2, 'always'];
def.rules['prefer-const'] = 2;
def.rules['prefer-reflect'] = 2;
def.rules['prefer-spread'] = 2;

module.exports = def;
