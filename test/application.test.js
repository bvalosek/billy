const Application = require('../lib');
const test = require('tape');

test('Application: service instantiation order', async t => {
  const app = new Application();

  const list = [ ];

  app.service(class A { constructor() { list.push('a'); } });
  app.service(class B { constructor() { list.push('b'); } });
  app.service(class C { constructor() { list.push('c'); } });

  t.deepEqual(list, [ ], 'services not instantiated before app start');

  await app.start();

  t.deepEqual(list, [ 'a', 'b', 'c' ], 'services instantiated in correct order');

  t.end();
});

test('Application: service startup order', async t => {
  const app = new Application();

  const list = [ ];

  app.service(class A { async start() { list.push('a'); } });
  app.service(class B { async start() { list.push('b'); } });
  app.service(class C { async start() { list.push('c'); } });

  t.deepEqual(list, [ ], 'services not started before app start');

  await app.start();

  t.deepEqual(list, [ 'a', 'b', 'c' ], 'services started in correct order (and async)');

  t.end();
});

test('Application: service stop order', async t => {
  const app = new Application();

  const list = [ ];

  app.service(class A { async stop() { list.push('a'); } });
  app.service(class B { async stop() { list.push('b'); } });
  app.service(class C { async stop() { list.push('c'); } });

  t.deepEqual(list, [ ], 'services not stopped before app start');

  await app.start();

  t.deepEqual(list, [ ], 'services not stopped after app start');

  await app.stop();

  t.deepEqual(list, [ 'c', 'b', 'a' ], 'services stopped in correct order (and async)');

  t.end();
});

test('Application: stopping service can throw', async t => {
  const app = new Application();

  const list = [ ];

  const ERR = Symbol('oopsies');

  app.service(class A { async stop() { list.push('a'); } });
  app.service(class B { async stop() { throw ERR; } });
  app.service(class C { async stop() { list.push('c'); } });

  await app.start();

  try {
    await app.stop();
  }
  catch (err) {
    t.deepEqual(list, [ 'c', 'a' ], 'services continued to stop after throw');
    t.strictEqual(err, ERR, 'error from stop was rethrown');
    t.end();
  }

});

test('Application: service method asserts', async t => {
  const app = new Application();

  t.throws(() => app.service(), 'missing param throws');
  t.throws(() => app.service('fart'), 'bad param type throws');

  class T { }
  app.service(T);
  t.throws(() => app.service(T), 'registering same service twice throws');

  app.service(class X { });
  app.service(class X { });
  t.pass('register unique classes with same name does not throw');

  await app.start();
  t.throws(() => app.service(class U { }), 'adding service after start throws');

  t.end();
});


