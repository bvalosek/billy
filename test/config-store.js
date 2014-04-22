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
