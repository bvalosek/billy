module.exports = ConfigStore;

var debug = require('debug')('billy:ConfigStore');

/**
 * @class
 * A just slightly more fancy version of an object hash. Supports using
 * stringly-typed "deep object selectors" to avoid NPE problems when looking
 * for deep config paths.
 *
 * Used internally to create the store object on {@link Application#config},
 * probably doesn't need to be instantiated manually ever.
 *
 * ```
 * var ConfigStore = require('billy').ConfigStore;
 *
 * var configStore = new ConfigStore();
 * ```
 *
 * Supports using stringly-typed "deep object selectors" to avoid NPE problems
 * when looking for deep config paths.
 *
 * ```
 * var password = configStore.get('http.auth.password');
 * ```
 */
function ConfigStore()
{
  // Store shit on a function so we can use the magic function if we want
  // e.g: config.some.ething = 3 OR config('some.thing', 3)
  var _this = this;
  this._store = function(key, value) {
    if (value === undefined)
      return _this.get(key);
    else
      return _this.set(key, value);
  };

  // Expose super secret get -- no bind for oldIE support
  this._store.get = function(k, v) { return _this.get(k, v); };
}

/**
 * Get a value from the store.
 * @param {string} key
 * @param {any} defaultValue Will write this value to the store if there is
 * none already there.
 * @return {any}
 * @example
 * var value = configStore.get('my key');
 *
 * // Will be undefined if object path doesn't exist
 * var deepvValue = configStore.get('some.deep.config.ref');
 *
 * // Default values can be used to write to the store on a miss
 * var pubRoot = configStore.get('http.static.root', '/var/www');
 */
ConfigStore.prototype.get = function(key, defaultValue)
{
  debug('get %s', key);
  var _ref = this._resolve(key);
  var value = _ref.root[_ref.key];

  if (value === undefined && defaultValue !== undefined)
    return this.set(key, defaultValue);

  return value;
};

/**
 * Set a value in the store.
 * @param {string} key
 * @param {any} value
 * @return {any} The value that was set
 * @example
 * configStore.set('my key', 123);
 */
ConfigStore.prototype.set = function(key, value)
{
  debug('set %s => %s', key, value);
  var _ref = this._resolve(key);
  _ref.root[_ref.key] = value;
  return value;
};

/**
 * Return a function that can be used to get, set or even directly reference
 * configs.
 * @example
 * var config = new ConfigStore().getStore();
 *
 * // gets value stored with 'key';
 * var value = config('key');
 *
 * // Sets 'key' to 123
 * config('key', 123);
 *
 * // All configs hanging off this object, though probably not ideal to do it
 * // this way as you may have a NPE
 * var value = config.some.key.here;
 *
 * // Safer alternative to above
 * var value = config('some.key.here');
 * @return {function(key:string, value:any): any}
 */
ConfigStore.prototype.getStore = function()
{
  return this._store;
};

/**
 * @param {string} param
 * @return {{root:object, key:string}}
 * @private
 */
ConfigStore.prototype._resolve = function(fullKey)
{
  var parts = fullKey.split('.');
  var root  = this._store;
  var key   = parts[0];

  for (var n = 0; n < parts.length - 1; n++) {
    if (root[key] === undefined)
      root[key] = {};
    root = root[key];
    key = parts[n+1];
  }

  return { root: root, key: key };
};


