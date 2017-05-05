const ga = require('../lib/getArguments.js');
const test = require('tape');

test('arguments for functions', t => {
  t.deepEqual(ga(function (a, b, c) { return c; }), [ 'a', 'b', 'c' ], 'anon function');
  t.end();
});
