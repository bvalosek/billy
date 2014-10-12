module.exports = Application;

var Promise     = require('bluebird');
var Container   = require('sack').Container;
var IoCBinding  = require('sack').IoCBinding;
var debug       = require('debug')('billy:Application');
var getName     = require('typedef').getName;
var ConfigStore = require('./ConfigStore.js');

/**
 * @class
 * Centralized application harness used to register and boot up IoC-injected
 * services.
 *
 * ```
 * var Application = require('billy');
 *
 * var app = new Application();
 *
 * app.service(function() {
 *    ...
 * });
 *
 * app.service(SomeService);
 * app.service(SomeOtherService);
 * app.config('http', {
 *   ...
 * });
 *
 * app.start();
 * ```
 */
function Application()
{
  if (!(this instanceof Application))
    return new Application();

  this._services  = [];
  this._running   = [];
  this._container = new Container();

  /**
   * The convenience function from {@link ConfigStore#getStore}.
   *
   * Also exposed in the app as the `config` dependency.
   * @readonly
   * @example
   * var password = app.config('http.auth.password');
   *
   * app.service(function(config) {
   *
   *   // set a new config
   *   config('new config', 123);
   *
   * });
   * @type {function}
   * @deprecated
   */
  this.config = new ConfigStore().getStore();
}

/**
 * Add a service to the application.
 *
 * Your application entry point will register a series of services that will
 * power your app. Services can either be a simple closure or a class
 * constructor, and can optionally use promises to signal an asynchronous
 * startup.
 * @param {function} T Class constructor or closure
 * @example
 * // Use a closure as a service
 * app.service(function main() {
 *   console.log('service created');
 * });
 * @example
 * // Return a Promise to signal an asynchronous startup
 * app.service(function main() {
 *   console.log('service created');
 *
 *   return someAsyncTask()
 *     .then(function() {
 *       console.log('service started');
 *     });
 * });
 * @example
 * // Use a class constructor
 * var HttpService = require('billy-http-express');
 *
 * app.service(HttpService);
 */
Application.prototype.service = function(T)
{
  this._services.push(T);
  debug('registered service %s', getName(T));
};

/**
 * Delegate registering things to the IoC container.
 *
 * See {@link Container#register}
 * @param {string} tag Tag to register a depedency under
 * @param {function|object} thing A class constructor or object instance
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
 * Register a thing as a singleton dependency.
 *
 * This is a convenience method that is equivalent to:
 *
 * ```
 * app.register('thing', Thing).asSingleton();
 * ```
 *
 * See {@link Container#register}
 * @param {string} tag Tag to register a depedency under
 * @param {function|object} thing A class constructor or object instance
 * @return {IoCBinding}
 */
Application.prototype.registerSingleton = function(tag, thing)
{
  return this.register(tag, thing).asSingleton();
};

/**
 * Register an existing object instance as a dependency.
 *
 * This is a convenience method that is equivalent to:
 *
 * ```
 * app.register('thing', thing).asInstance();
 * ```
 *
 * See {@link Container#register}
 * @param {string} tag Tag to register a depedency under
 * @param {object} thing An object instance
 * @return {IoCBinding}
 */
Application.prototype.registerInstance = function(tag, thing)
{
  return this.register(tag, thing).asInstance();
};

/**
 * Register a weak instance dependency if there isn't already one registered.
 *
 * This effectively checks first if a dependency exists (via
 * {@link Container#tagExists}), and if it doesn't, will register a dependency
 * via the {@link IoCBinding#asWeak} and {@link IoCBinding#asInstance}
 * @param {string} tag
 * @param {object} thing
 */
Application.prototype.registerDefaultInstance = function(tag, thing)
{
  if (this._container.tagExists(tag))
    return;

  this._container.register(tag, thing)
    .asWeak()
    .asInstance();
};

/**
 * Delegate object creation to the IoC container.
 *
 * See {@link Container#make}
 * @param {Function|string} thing
 * @return {object}
 */
Application.prototype.make = function(thing)
{
  return this._container.make(thing);
};

/**
 * Start all of the services in the ordered they were registered.
 *
 * Any service closure that returns a `Promise`, or service class that implements
 * a `start` method that returns a `Promise`, will cause the startup to wait
 * until it has resolved before moving onto the next service.
 * @return {Promise} This promise is resolved when all services have finished
 * starting, and is rejected if there was an error during service start.
 * @example
 * app.start().then(function() {
 *   console.log('app started');
 * });
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
 * Stop all registered services in the reverse order they were registered.
 *
 * This allows for graceful shutdown of any services that are running.
 *
 * If a service class implements a `stop` method, it can return a `Promise` to
 * allow for asynchronous shutdown.
 * @return {Promise} This promise is resolved when all services have finished
 * stopping, and is rejected if there was an error during service shutdown.
 * @example
 * app.stop().then(function() {
 *   console.log('app gracefully shutdown');
 * });
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

/**
 * Change the IoC container instance.
 * @deprecated
 * @param {{register:function}} container
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

