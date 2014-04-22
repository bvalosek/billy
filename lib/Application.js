module.exports = Application;

var Promise     = require('es6-promise').Promise;
var Container   = require('sack').Container;
var IoCBinding  = require('sack').IoCBinding;
var ConfigStore = require('./ConfigStore.js');

/**
 * @constructor
 */
function Application()
{
  this._services  = [];
  this._running   = [];
  this._container = new Container();

  this.config = new ConfigStore().getStore();

  this._setupStarted();
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
 * Add a service to the application.
 * @param {Function} T
 */
Application.prototype.service = function(T)
{
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
  this.register('config', this.config).asInstance().asWeak();
  this.register('app', this).asInstance().asWeak();

  // Instantiate all services in order
  for (var n = 0; n < this._services.length; n++) {
    var T = this._services[n];
    var service = this.make(T);
    this._running.push(service);
  }

  // Start them (if we can) in order. If the service has a start() method, it
  // can return a promise to delay the rest of the services from getting
  // started until it finishes. The service itself could simply be a function
  // that returns a promise as well.
  var allStarted = this._running.reduce(function(seq, service) {
    return seq.then(function() {
      return service.start ? service.start() : service;
    });
  }, Promise.resolve());

  // Resolve the final started promise
  var d = this._dStart;
  return allStarted.then(function() {
    d.resolve(this);
  },
  function(err) {
    d.reject(err);
    throw err;
  });
};

/**
 * Create the promise and stash a deferredish.
 * @private
 */
Application.prototype._setupStarted = function()
{
  var _this = this;
  this.started = new Promise(function(resolve, reject) {
    _this._dStart = {
      resolve: resolve,
      reject: reject
    };
  });
};

