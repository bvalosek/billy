var test        = require('tape');
var Promise     = require('bluebird');
var Application = require('../lib/Application.js');


test('config setting', function(t) {
  t.plan(3);
  var app = new Application();

  app.config('a', 1);
  t.strictEqual(app.config('a'), 1);

  app.config('b.c.e', 2);
  t.strictEqual(app.config('b.c.e'), 2);

  t.deepEqual(app.config('b'), { c: { e: 2 } });
});

test('config setting shared', function(t) {
  t.plan(4);
  var app = new Application();

  app.config('ns.a', 1);
  t.strictEqual(app.config('ns').a, 1);

  app.config('ns.b', 2);
  t.strictEqual(app.config('ns.b'), 2);

  app.config('ns.c.d.e.f.g', 3);
  t.strictEqual(app.config.ns.c.d.e.f.g, 3);

  t.strictEqual(app.config('does.not.exist'), undefined);
});

test('new and not new instanshe', function(t) {
  t.plan(2);
  var app = new Application();
  t.ok(app instanceof Application);

  var billy = Application;
  app = billy();
  t.ok(app instanceof Application);
});

test('auto registers', function(t) {
  t.plan(2);

  var app = new Application();
  app.start();

  t.strictEqual(app.make('app'), app);
  t.strictEqual(app.make('config'), app.config);
});

test('services called in order after start', function(t) {
  t.plan(2);

  var started = [];

  var app = new Application();

  app.service(function() {
    started.push('a');
  });

  app.service(function() {
    started.push('b');
  });

  t.deepEqual(started, []);

  app.start();
  t.deepEqual(started, ['a', 'b']);

});

test('Service as promise waits during starts', function(t) {
  t.plan(3);
  var app = new Application();

  var created = [];
  var started = [];

  app.service(function() {
    created.push('a');
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        started.push('a');
        resolve();
      }, 50);
    });
  });

  app.service(function() {
    created.push('b');
    return {
      start: function() {
        started.push('b');
      }
    };
  });

  app.start().then(function() {
    t.pass();
    t.deepEqual(started, ['a', 'b']);
  });
  t.deepEqual(created, ['a', 'b']);

});

test('deps available to services', function(t) {
  t.plan(3);

  var app = new Application();

  app.service(function(app) {
    app.register('a', 1);
  });

  app.service(function(app, a) {
    t.strictEqual(a, 1);
    app.register('b', 2);
  });

  app.service(function(app, a, b) {
    t.strictEqual(a, 1);
    t.strictEqual(b, 2);
  });

  app.start();

});

test('throw in service fails on start sync', function(t) {
  t.plan(1);

  var app = new Application();

  app.service(function() { throw 123; });

  t.throws(function() { app.start(); }, 123);

});

test('throw in service start async fails the promise', function(t) {
  t.plan(1);

  var app = new Application();

  app.service(function() {
    return {
      start: function() {
        throw 123;
      }
    };
  });

  app.start().then(null, function(err) {
    t.strictEqual(err, 123);
  });

});

test('Stopping', function(t) {
  t.plan(2);

  var app = new Application();

  var stopped = [];

  app.service(function a() {
    return {
      stop: function() {
        stopped.push('a');
        setTimeout(function() { return Promise.resolve(); }, 50);
      }
    };
  });

  app.service(function b() {
    return {
      stop: function() {
        stopped.push('b');
        setTimeout(function() { return Promise.resolve(); }, 25);
      }
    };
  });

  app.start();
  app.stop().then(function() {
    t.deepEqual(stopped, ['b', 'a']);
  });

  // async
  t.deepEqual(stopped, []);

});

test('convenience functions', function(t) {
  t.plan(3);

  var app = new Application();

  var T = function() { };

  app.registerSingleton('singleton', T);

  t.strictEqual(app.make('singleton'), app.make('singleton'));

  t.ok(app.make('singleton') instanceof T);

  app.registerInstance('instance', T);

  t.strictEqual(app.make('instance'), T);
});

test('register default instance', function(t) {
  t.plan(2);

  var app = new Application();

  var Config = function() { };
  var config = new Config();

  app.registerDefaultInstance('config', config);

  t.strictEqual(app.make('config'), config);

  var abc = {};
  app.registerInstance('config', abc);
  t.strictEqual(app.make('config'), abc);

});


