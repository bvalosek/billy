const Container = require('../lib/Container.js');
const test = require('tape');

test('Container: works with no deps', t => {
  const c = new Container();

  class T { }
  const foo = c.new(T);
  t.ok(foo instanceof T, 'class with no deps is instantiated');

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
