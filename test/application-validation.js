var test        = require('tape');
var Application = require('../lib/Application.js');

test('container interface', function(t) {
  t.plan(4);
  var app = new Application();

  t.throws(function() { app.container(); }, TypeError);
  t.throws(function() { app.container({ make: function() {} }); }, TypeError);
  t.throws(function() { app.container({ register: function() {} }); }, TypeError);

  app.container({ make: function() { }, register: function() {} });
  t.pass();
});

test('register string tag', function(t) {
  t.plan(1);
  var app = new Application();
  t.throws(function() { app.register(4, {}); }, TypeError);
  app.register('asdf', {});
});
