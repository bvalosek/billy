var test        = require('tape');
var Application = require('../lib/Application.js');

test('Services are booted', function(t) {
  t.plan(1);

  var app = new Application();

  function A()
  {
    t.pass('fired');
  }

  app.manifest({
    services: [A]
  });

  app.start();

});

test('Configs are merged', function(t) {
  t.plan(2);

  var app = new Application();

  app.manifest({
    config: {
      a: 1,
      b: { c: 2 }
    }
  });

  t.strictEqual(app.config('a'), 1);
  t.strictEqual(app.config('b.c'), 2);
});


