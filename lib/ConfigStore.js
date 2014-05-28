module.exports = ConfigStore;

var debug = require('debug')('billy:ConfigStore');

/**
 * A just slightly more fancy version of an object hash.
 * @constructor
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
 * @return {any}
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


