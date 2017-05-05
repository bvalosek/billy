/* eslint no-unused-vars: 0 */

const ga = require('../lib/getArguments.js');
const test = require('tape');

test('getArguments: arguments for a function', t => {
  t.deepEqual(ga(function (a, b, c) {  }), [ 'a', 'b', 'c' ], 'found args for anon function');
  t.deepEqual(ga(function (/* a, */ a, b /* d, */, c) {  }), [ 'a', 'b', 'c' ], 'found args for anon function (comments)');
  t.deepEqual(ga(function (c, b, a) {  }), [ 'c', 'b', 'a' ], 'found args for anon function (order preserved)');
  t.end();
});

test('getArguments: arguments for a function (nested)', t => {
  t.deepEqual(ga(function (a, b, c) { function f(x, y) { return z => z; } }), [ 'a', 'b', 'c' ], 'found args for anon function (with other nested crap)');
  t.deepEqual(ga(function (c, b, a) {  }), [ 'c', 'b', 'a' ], 'found args for anon function (order preserved)');
  t.end();
});

test('getArguments: arguments for an arrow function', t => {
  t.deepEqual(ga((a, b, c) => c), [ 'a', 'b', 'c' ], 'found args for anon function');
  t.deepEqual(ga((c, b, a) => a), [ 'c', 'b', 'a' ], 'found args for anon function (order preserved)');
  t.end();
});

test('getArguments: arguments for a class', t => {
  t.deepEqual(ga(class T { constructor(a, b, c) { } }), [ 'a', 'b', 'c' ], 'found args for class');
  t.deepEqual(ga(class T { constructor(c, b, a) { } }), [ 'c', 'b', 'a' ], 'found args for class (in order)');
  t.end();
});

test('getArguments: arguments for a class, ctor not first', t => {
  t.deepEqual(ga(class T { foo(x, y, z) {  } constructor(a, b, c) { } }), [ 'a', 'b', 'c' ], 'found args for class after method');
  t.deepEqual(ga(class T { static foo(x, y, z) {  } constructor(a, b, c) { } }), [ 'a', 'b', 'c' ], 'found args for class after static method');
  t.deepEqual(ga(class T { get foo() {  } constructor(a, b, c) { } }), [ 'a', 'b', 'c' ], 'found args for class after getter');
  t.deepEqual(ga(class T { set foo(v) {  } constructor(a, b, c) { } }), [ 'a', 'b', 'c' ], 'found args for class after setter');
  t.end();
});
