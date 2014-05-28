var test        = require('tape');
var ConfigStore = require('../lib/ConfigStore.js');


test('store + read via direct', function(t) {
  t.plan(6);

  var store = new ConfigStore().getStore();

  store('a', 1);
  t.strictEqual(store.a, 1);
  store('b', 2);
  t.strictEqual(store.b, 2);
  store('c.d.e', 3);
  t.strictEqual(store.c.d.e, 3);
  store('c.d.f', 4);
  t.strictEqual(store.c.d.f, 4);
  t.strictEqual(store.c.d.e, 3);
  t.deepEqual(store.c, { d: { e: 3, f: 4 } });
});

test('Read via dots', function(t) {
  t.plan(5);

  var store = new ConfigStore().getStore();

  store('a', 1);
  t.strictEqual(store('a'), 1);
  store('b', 2);
  t.strictEqual(store('b'), 2);
  store('c.d.e', 3);
  t.strictEqual(store('c.d.e'), 3);
  store('c.d.f', 4);
  t.strictEqual(store('c.d.f'), 4);
  t.strictEqual(store('c.d.e'), 3);
});

test('missing', function(t) {
  t.plan(1);
  t.strictEqual(new ConfigStore().getStore()('wot'), undefined);
});

test('Deep missing returns undef', function(t) {
  t.plan(1);
  t.strictEqual(new ConfigStore().get('a.b.c.d.e'), undefined);
});

test('default values', function(t) {
  t.plan(2);
  var config = new ConfigStore().getStore();
  t.strictEqual(config.get('a.b.c', 1), 1, 'implicit set and return');
  t.strictEqual(config.a.b.c, 1, 'actually set');
});
