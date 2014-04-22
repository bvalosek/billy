module.exports = ConfigStore;

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
}

/**
 * @param {string} key
 * @return {any}
 */
ConfigStore.prototype.get = function(key)
{
  var _ref = this._resolve(key);
  return _ref.root[_ref.key];
};

/**
 * @param {string} key
 * @param {any} value
 * @return {any}
 */
ConfigStore.prototype.set = function(key, value)
{
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


