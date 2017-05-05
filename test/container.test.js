const Container = require('../lib/Container.js');
const test = require('tape');

test('Container: works with no deps', t => {
  const c = new Container();

  class T { }
  const foo = c.new(T);
  t.ok(foo instanceof T, 'class with no deps is instantiated');

  const S = Symbol('S');
  const factory = () => S;
  t.strictEqual(c.call(factory), S, 'call with no deps works');

  t.end();
});

test('Container: works with locals', t => {
  const c = new Container();

  const factory = function (b, a) { return [ a, b ]; };

  t.throws(() => c.call(factory), 'throws when missing deps');

  const A = Symbol('A');
  const B = Symbol('B');
  t.deepEqual(c.call(factory, { a: A, b: B }), [ A, B ], 'locals passed for call()');

  class T { constructor(b, a) { this.a = a; this.b = b; } }

  t.throws(() => c.new(T), 'throws when missing deps');

  const instance = c.new(T, { a: A, b: B });
  t.strictEqual(instance.a, A, 'injected dep');
  t.strictEqual(instance.b, B, 'injected dep');

  t.end();
});

test('Container: basic value deps', t => {
  const c = new Container();

  const A = Symbol('a');
  const B = Symbol('b');

  c.registerValue('a', A);
  c.registerValue('b', B);

  {
    class T { }
    const foo = c.new(T);
    t.ok(foo instanceof T, 'class with no params is instantiated');
  }

  {
    let d1, d2;
    class T { constructor(b, a) { d1 = a; d2 = b; } }
    c.new(T);
    t.strictEqual(d1, A, 'registerd value was injected');
    t.strictEqual(d2, B, 'registerd value was injected');
  }

  t.end();
});

test('Container: basic class deps', t => {
  t.end();
});
