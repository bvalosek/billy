const Application = require('../lib');
const test = require('tape');

test('service instantiation order', async t => {
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

test('service startup order', async t => {
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

test('service method asserts', async t => {
  const app = new Application();

  t.throws(() => app.service(), 'missing param throws');
  t.throws(() => app.service('fart'), 'bad param type throws');

  class T { }

  app.service(T);

  t.throws(() => app.service(T), 'registering same service twice throws');

  await app.start();

  t.throws(() => app.service(class U { }), 'adding service after start throws');

  t.end();
});


