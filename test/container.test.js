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
  const C = null;

  c.registerValue('a', A);
  c.registerValue('b', B);
  c.registerValue('c', C);

  {
    class T { }
    const foo = c.new(T);
    t.ok(foo instanceof T, 'class with no params is instantiated');
  }

  {
    let d1, d2, d3;
    class T { constructor(b, a, c) { d1 = a; d2 = b; d3 = c; } }
    c.new(T);
    t.strictEqual(d1, A, 'registerd value was injected');
    t.strictEqual(d2, B, 'registerd value was injected');
    t.strictEqual(d3, C, 'registerd value was injected');
  }

  t.end();
});

test('Container: basic class deps', t => {
  t.end();
});

test('Container: singleton', t => {

  const c = new Container();

  let count = 0;

  class Foo { constructor() { count++; } };

  c.registerSingleton('foo', Foo);

  t.strictEqual(count, 0, 'singletons are lazily built');

  const foo = c.resolve('foo');
  t.strictEqual(foo instanceof Foo, true, 'singletons resolve to instance of the class');
  t.strictEqual(count, 1, 'constructor called once');

  c.resolve('foo');
  c.resolve('foo');
  c.resolve('foo');
  t.strictEqual(count, 1, 'constructor called once STILL');

  t.end();
});

test('Container: singleton and locals', t => {

  const c = new Container();

  class Foo { constructor(a) { this.a = a; } };

  const A = Symbol('a');
  const A1 = Symbol('a1');

  c.registerClass('foo1', Foo);
  c.registerSingleton('foo2', Foo);
  c.registerValue('a', A);

  {
    const foo = c.resolve('foo1');
    t.strictEqual(foo.a, A, 'normal registered dep injected');
  }

  {
    const foo = c.resolve('foo1', { a: A1 });
    t.strictEqual(foo.a, A1, 'locals passed to non singleton class');
  }

  {
    const foo = c.resolve('foo2');
    t.strictEqual(foo.a, A, 'normal registered dep injected');
  }

  {
    const foo = c.resolve('foo2', { a: A1 });
    t.strictEqual(foo.a, A, 'locals NOT passed to non singleton class');
  }

  t.end();
});

test('Container: utility return object', t => {
  const c = new Container();

  class Foo { }

  const instance = c.registerSingleton('foo', Foo).resolve();

  t.strictEqual(instance instanceof Foo, true, 'register and resolve in one line');

  t.end();
});

test('Container: injecting an async function', async t => {
  const c = new Container();

  const A = c.registerValue('a', Symbol('a')).resolve();
  const B = c.registerValue('b', Symbol('b')).resolve();
  const C = Symbol('c');
  const R = Symbol('r');

  {
    const f = async (a, b) => {
      t.strictEqual(a, A, 'param a injected');
      t.strictEqual(b, B, 'param b injected');
      return R;
    };

    t.strictEqual(await c.call(f), R, 'func called and return value worked');
  }

  {
    const f = async function (a, b) {
      t.strictEqual(a, A, 'param a injected (non arrow)');
      t.strictEqual(b, B, 'param b injected (non arrow)');
      return R;
    };

    t.strictEqual(await c.call(f), R, 'func called and return value worked (non arrow)');
  }

  {
    const f = async function (a, b, c) {
      t.strictEqual(a, A, 'param a injected (non arrow)');
      t.strictEqual(b, B, 'param b injected (non arrow)');
      t.strictEqual(c, C, 'param c (local) injected (non arrow)');
      return R;
    };

    t.strictEqual(await c.call(f, { c: C }), R, 'func called and return value worked (non arrow with locals)');
  }

  t.end();
});
