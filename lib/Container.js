const getArguments = require('./getArguments.js');

/*

  Dependency injection container

*/
module.exports = class Container
{
  constructor()
  {
    this._deps = new Map();
  }

  /*

    Simply store a value under a tag in the container

  */
  registerValue(tag, value = null)
  {
    const _tag = this._checkTag(tag);
    this._deps.set(_tag, { value });
  }

  /*

    Resolve a string tag into a thing from the containeer

  */
  resolve(tag_, locals = { })
  {
    if (!tag_) {
      throw new Error('Missing tag parameter');
    }

    const tag = `${tag_}`;

    if (!this._deps.has(tag)) {
      throw new Error(`Dependency not found: ${tag}`);
    }

    const { value, factory } = this._deps.get(tag);

    if (value) {
      return value;
    }
    else {
      return factory(locals);
    }
  }

  /*

    Instantiate a class, with injection

  */
  new(T)
  {
    if (!T || typeof T !== 'function') {
      throw new Error('Parameter must be class constructor');
    }

    const tags = getArguments(T);

    const args = tags.map(t => this.resolve(t));

    return new T(...args);
  }

  /*

    Call a function, with in injection

  */
  call(f)
  {
    return f();
  }

  _checkTag(tag)
  {
    if (!tag) {
      throw new Error('Missing tag parameter');
    }

    const sTag = `${tag}`;

    if (this._deps.has(sTag)) {
      throw new Error(`Duplicate dependency tag: ${sTag}`);
    }

    return sTag;
  }

};
