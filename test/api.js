var test = require('tape');

var Application = require('../lib/Application.js');
var ConfigStore = require('../lib/ConfigStore.js');

var billy = require('../index.js');

test('api test', function(t) {
  t.plan(3);
  t.strictEqual(billy.Application, Application);
  t.strictEqual(billy, Application);
  t.strictEqual(billy.ConfigStore, ConfigStore);
});
