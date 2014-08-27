module.exports = Application;

var Promise     = require('bluebird');
var Container   = require('sack').Container;
var IoCBinding  = require('sack').IoCBinding;
var debug       = require('debug')('billy:Application');
var getName     = require('typedef').getName;
var ConfigStore = require('./ConfigStore.js');

/**
 * @constructor
 */
function Application()
{
  if (!(this instanceof Application))
    return new Application();

  this._services  = [];
  this._running   = [];
  this._container = new Container();

  this.config = new ConfigStore().getStore();
}

/**
 * Change the IoC container instance.
 * @deprecated
 * @param {{register:function(name:string,thing:object): IocBinding}} container
 * @return {object} Old container.
 */
Application.prototype.container = function(container)
{
  if (typeof container.make !== 'function')
    throw new TypeError('container.make');

  if (typeof container.register !== 'function')
    throw new TypeError('container.register');

  var old = this._container;
  this._container = container;
  return old;
};

/**
 * Load up application information from a manifest hash.
 * @deprecated
 * @param {{config:object, services:array<any>}} hash
 * @return {Application} This object.
 */
Application.prototype.manifest = function(hash)
{
  // Add services one by one
  if (hash.services) {
    for (var n = 0; n < hash.services.length; n++) {
      this.service(hash.services[n]);
    }
  }

  // Iterate over keys
  if (hash.config) {
    for (var key in hash.config) {
      var value = hash.config[key];
      this.config(key, value);
      debug('added config %s', key);
    }
  }

  return this;
};

/**
 * Add a service to the application.
 * @param {Function} T
 */
Application.prototype.service = function(T)
{
  this._services.push(T);
  debug('registered service %s', getName(T));
};

/**
 * Delegate registering things to to underlying IoC container.
 * @param {string} tag
 * @param {Function|object} thing
 * @return {IoCBinding}
 */
Application.prototype.register = function(tag, thing)
{
  if (typeof tag !== 'string')
    throw new TypeError('tag');

  debug('registering dependency with tag %s', tag);
  return this._container.register(tag, thing);
};

/**
 * Delegate object creation to our IoC container.
 * @param {Function|string} thing
 * @return {object}
 */
Application.prototype.make = function(thing)
{
  return this._container.make(thing);
};

/**
 * Start all of the services in turn, eventually signalling the start of the
 * application.
 * @return {Promise}
 */
Application.prototype.start = function()
{
  debug('starting app');

  // Default stuff registered as weak so another service could override it if
  // needed
  this.register('config', this.config).asInstance().asWeak();
  this.register('app', this).asInstance().asWeak();

  // Instantiate all services in order -- this works equally well if a class
  // constructor was passed to service() or just a normal function.
  for (var n = 0; n < this._services.length; n++) {
    var T = this._services[n];
    debug('creating service %s', getName(T));
    var service = this.make(T);
    this._running.push(service);
  }

  // Start in order and async
  var sequence = Promise.resolve();
  for (var m = 0; m < this._running.length; m++) {
    var s = this._running[m];
    sequence = sequence.then(start(s));
  }

  // Resolve the final started promise
  return sequence.then(function() {
    debug('app started successfully');
  },
  function(err) {
    debug('error starting app: %s', err);
    throw err;
  });
};

/**
 * Reverse and unwind all started services
 * @return {Promise} when we've stopped all services
 */
Application.prototype.stop = function()
{
  debug('stopping app');

  // Loop through all services in reverse, allowing them to customize stop
  // behavior if needed
  var sequence = Promise.resolve();
  for (var n = this._running.length - 1; n >= 0; n--) {
    var service = this._running[n];
    sequence = sequence.then(stop(service));
  }

  return sequence.then(function() {
    debug('app stopped successfully');
  },
  function(err) {
    debug('error stopping app: %s', err);
  });
};

function start(s) {
  return function() {
    debug('starting service %s', getName(s.constructor));
    return s.start ? s.start() : s;
  };
}

function stop(s) {
  return function() {
    debug('stopping service %s', getName(s.constructor));
    return s.stop ? s.stop() : s;
  };
}

