# billy

[![CircleCI](https://circleci.com/gh/bvalosek/billy/tree/master.svg?style=svg)](https://circleci.com/gh/bvalosek/billy/tree/master)

A minimal application harness that stays out of your way and out of your code.

> This is the v2 branch, which has back-compat breaking changes from v1, see
> [billy v1.7.3](https://github.com/bvalosek/billy/tree/v1.7.3) for the old
> version.

## Installation

```
$ npm install billy
```

## Overview

The primary goal and driving philosophy of Billy is to provide a cohesive and
useful set of utilities for building an complex application, without creeping
its way into your business logic and domain code.

Billy is not an opinionated framework that permeates all parts of your
codebase, but rather the simple scaffolding that allows you to roll your own
application architecture stack, your way.

### The `Application` instance and the Service Stack

The root of your application is a single instance of the `Application` class:

```javascript
const Application = require('billy');

const app = new Application();
```

An application is composed of several **services**. A service is a class that
sets up and starts the various dependencies in your application. Services
should be free of all business logic, and should be the only parts of the
application that are aware of Billy.

```javascript
app.service(AppConfigService);

app.service(PostgresDatabaseService);

app.service(SQSQueueService);

app.service(AuthAPIComponent);
```

If a service implements a `start()` method, it will be called (and `await`-ed)
when you call `app.start()` to boot the application.

```javascript
(async () => {

  await app.start();

  console.log('app booted up');

});
```

All services registered (via `Application#service`) will be instantiated (with
injected constructors, see below) **in the order in which they were
registered**. After all service have been successfully (and synchronously)
instantiated, the `start` method will be called on each one (again, in the
registered order) if implemented. If `start` returns a `Promise`, the app will
wait for it to resolve before continuing.

If any service `throw`s during instantiation or during the `start` method (or
the `Promise` returned is rejected), then the application will abort its
startup.

### The `Container` instance and Dependency Injection

> Philosophy behind the IoC container

#### Registering Dependencies

> The various `container.register*` methods

#### Resolving Dependencies

> Overview of `new` and `call` on the container, and locals

## Environments

Billy is written to run in modern Javascript environments (ES2017) that support
the CommonJS module system and the latest ES2017 Spec (e.g, Node 7.10+). It
uses `async` / `await` from the ES2017 spec, as well as features introduced in
ES2015 (ES6) such as `Promise`, iterables, and `WeakMap`.

### Older JS Runtimes

If you are not on the absolute cutting edge, you'll want to use a transpiled
version of the library.

```javascript

// Transpiled down to ES5 (pre-ES2015 / pre-ES6)
const Application = require('billy/es5');

// Targeting Node v6+
const Application = require('billy/node6');
```

Some notes:

* Even when compiling down to ES5, keep in the mind the code still retains the
  CommonJS module syntax (i.e `require` calls)
* There are no polyfills for the new global classes like `Promise`, `Map`,
  `WeakMap`. If these are not available in your environment, you will need to
  include them first before Billy
* The `es5` target is dependent on a globally-available regenerator polyfill.
* For more information on polyfills and regenerator, see [the official Babel
  docs](http://babeljs.io/docs/usage/polyfill/)

## API

### `Application()`

Root application class.

```javascript
const app = new Application();
```

#### `Application#service(T)`

Register a service class with the application.

```javascript
app.service(PostgresDatabaseService);
```

#### `Application#start()`

Instantiate and start all services in the order they were registered.

```javascript
await app.start();
```

#### `Application#stop()`

Give each service a chance to shut down in reverse order they were started.

```javascript
await app.stop();
```

#### `Application#container`

Reference to the dependency injection container for the application.

### `Container`

The dependency injection container. There is no need to instantiate this
directly as a reference to the application's container is exposed as a property
on the `Application` instance:

```javascript
const container = app.container;
```

#### `Container#registerValue(tag, thing)`

Store a simple value in the container. Every time the `tag` dependency is
resolved, the same value is returned.

```javascript
app.container.registerValue('config', require('./config.json'));
```

#### `Container#registerFactory(tag, factory)`

Store a factory function in the container. Every time the `tag` dependency is
resolved, the factory function will be called with its parameters injected.

```javascript
app.container.registerFactory('currentTime', () => new Date());
```

#### `Container#registerClass(tag, T)`

Store a class in the container. Every time the `tag` dependency is resolved, a
fresh instance of the class is instantiated, with its constructor parameters
injected.

```javascript
app.container.registerClass('logger', ElasticSearchLogger);
```

#### `Container#registerSingleton(tag, T)`

Store a **singleton** class in the container. The first time `tag` dependency
is resolved, the class will be instantiated and cached. Each subsequent
resolution of `tag` will return the original instance after that.

```javascript
app.container.registerSingleton('db', PostgresDatabaseDriver);
```

#### `Container#resolve(tag)`

Resolve a dependency from the container via its string tag. Typically this
method shouldn't be used directly, but rather rely on automatic injection to
get a hold of registered dependencies.

```javascript
const db = app.container.resolve('db');
```

## Contributors

* [Brandon Valosek](https://github.com/bvalosek)
* [Zak Angelle](https://github.com/zakangelle)
* [Dillon Shook](https://github.com/dshook)

## Testing

```
$ npm test
```

## License

[MIT](https://github.com/bvalosek/billy/blob/master/LICENSE)

