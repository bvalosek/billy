# billy

> v2 is currently in progress and is NOT yet shipped / final.

> To install it, you need to run `npm install billy@v2-beta`

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
useful set of patterns for building an application that doesn't creep its way
into your business logic and domain code.

It is flexible and generic enough to work great for building server apps,
browser apps, Javascript games, or even CLI utilities.

Much like [express](https://github.com/visionmedia/express), Billy strives not
to be a framework that permeates all parts of your codebase, but rather the
scaffolding that allows you to roll your own application architecture stack.

### The `Application` instance and the Service Stack

The root of your application is a single instance of the `Application` class:

```javascript
const Application = require('billy');

const app = new Application();
```

An application is composed of several **services**. A service is a class that
sets up and starts the various dependencies in your application. Services
should be free of all business logic, and should be the only parts of the
aplication that are aware of `billy`.

### The `Container` instance and Dependency Injection

> Philosophy behind the IoC container

## Usage

> Code Examples

### Environments

`billy` is written to run in modern Javascript environments (ES2017) that
support the CommonJS module system (e.g, Node 7).

#### Older JS Runtimes

> Examples of requiring the transpiled versions of the lib

## API

### `Application(config)`

#### `Application#service(T)`

#### `Application#start()`

#### `Application#stop()`

#### `Application#container`

### `Container`

#### `Container#registerValue(tag, thing)`

#### `Container#registerFactory(tag, factory)`

#### `Container#registerClass(tag, T)`

#### `Container#registerSingleton(tag, T)`

#### `Container#resolve(tag)`

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

