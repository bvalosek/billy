module.exports = Application;

var Promise     = require('es6-promise').Promise;
var Container   = require('sack').Container;
var IoCBinding  = require('sack').IoCBinding;
var ConfigStore = require('./ConfigStore.js');
var debug       = require('debug')('billy:Application');
var getName     = require('typedef').getName;

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
  debug('registered service %s', getName(T));
  this._services.push(T);
};

/**
 * Delegate registering things to to underlying IoC container.
 * @param {string} name
 * @param {Function|object} thing
 * @return {IoCBinding}
 */
Application.prototype.register = function(name, thing)
{
  if (typeof name !== 'string')
    throw new TypeError('name');

  return this._container.register(name, thing);
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

  // s => s or s.start() value if available
  function startOrNot(s) {
    return function() { return s.start ? s.start() : s; };
  }

  function message(s) {
    return function() {
      debug('starting service %s', getName(s.constructor));
    };
  }

  // Start them (if we can) in order. If the service has a start() method, it
  // can return a promise to delay the rest of the services from getting
  // started until it finishes. The service itself could simply be a function
  // that returns a promise as well.
  var seq = Promise.resolve();
  for (var m = 0; m < this._running.length; m++) {
    var s = this._running[m];
    seq = seq.then(message(s)).then(startOrNot(s));
  }

  // Resolve the final started promise
  return seq.then(function() {
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

};

