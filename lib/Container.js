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

    Simply store a value under a tag in the container, the dependency will
    always be === the value

  */
  registerValue(tag, value = null)
  {
    const _tag = this._checkTag(tag);
    this._deps.set(_tag, { value });
  }

  /*

    Store a function that is executed each time it is resolved, with the
    returning value acting as the dependency

  */
  registerFactory(tag, f)
  {
    if (!f || typeof f !== 'function') {
      throw new Error('Parameter f must be a function');
    }

    const _tag = this._checkTag(tag);

    const factory = locals => this.call(f, locals);

    this._deps.set(_tag, { factory });
  }

  /*

    Store a class in the container that is instantiated fresh each time it is
    resolved

  */
  registerClass(tag, T)
  {
    if (!T || typeof T !== 'function') {
      throw new Error('Parameter T must be a class constructor');
    }

    const _tag = this._checkTag(tag);

    const factory = locals => this.new(T, locals);

    this._deps.set(_tag, { factory });
  }

  /*

    Store a class in the container that is (lazily) instantiated once the first
    time it is resolved

  */
  registerSingleton(tag, T)
  {
    if (!T || typeof T !== 'function') {
      throw new Error('Parameter T must be a class constructor');
    }

    const _tag = this._checkTag(tag);

    const entry = {
      value: null,

      // Since when resolving, the entry's value takes precedence over the
      // factory, we use the closure to stash the instance the first time its
      // made
      //
      // No support for locals when using singletons, to avoid leaking
      // context-specific stuff into the singleton

      factory: () => {
        const instance = this.new(T);
        entry.value = instance;
        return instance;
      }
    };

    this._deps.set(_tag, entry);
  }

  /*

    Resolve a string tag into a thing from the container

  */
  resolve(tag_, locals = { })
  {
    if (!tag_) {
      throw new Error('Missing tag parameter');
    }

    const tag = `${tag_}`;

    // Allow locals to override / take precedence over registered deps

    if (locals[ tag ]) {
      return locals[ tag ];
    }

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
  new(T, locals = { })
  {
    if (!T || typeof T !== 'function') {
      throw new Error('Parameter must be class constructor');
    }

    const tags = getArguments(T);

    const args = tags.map(t => this.resolve(t, locals));

    return new T(...args);
  }

  /*

    Call a function, with in injection

  */
  call(f, locals = { })
  {
    if (!f || typeof f !== 'function') {
      throw new Error('Parameter must be a function');
    }

    const tags = getArguments(f);

    const args = tags.map(t => this.resolve(t, locals));


    return f(...args);
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
