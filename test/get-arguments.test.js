const ga = require('../lib/getArguments.js');
const test = require('tape');

test('getArguments: arguments for a function', t => {
  t.deepEqual(ga(function (a, b, c) { return c; }), [ 'a', 'b', 'c' ], 'found args for anon function');
  t.deepEqual(ga(function (c, b, a) { return a; }), [ 'c', 'b', 'a' ], 'found args for anon function (order preserved)');
  t.end();
});

test('getArguments: arguments for an arrow function', t => {
  t.deepEqual(ga((a, b, c) => c), [ 'a', 'b', 'c' ], 'found args for anon function');
  t.deepEqual(ga((c, b, a) => a), [ 'c', 'b', 'a' ], 'found args for anon function (order preserved)');
  t.end();
});

test('getArguments: arguments for a class', t => {
  t.deepEqual(ga(class T { constructor(a, b, c) { return c; } }), [ 'a', 'b', 'c' ], 'found args for class');
  t.deepEqual(ga(class T { constructor(c, b, a) { return a; } }), [ 'c', 'b', 'a' ], 'found args for class (in order)');
  t.end();
});
