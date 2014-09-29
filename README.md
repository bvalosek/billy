# billy

[![Build Status](https://travis-ci.org/bvalosek/billy.png?branch=master)](https://travis-ci.org/bvalosek/billy)
[![NPM version](https://badge.fury.io/js/billy.png)](http://badge.fury.io/js/billy)

A minimal application harness that stays out of your way and out of your code.

[![browser support](https://ci.testling.com/bvalosek/billy.png)](https://ci.testling.com/bvalosek/billy)

## Installation

```
$ npm install billy
```

## Usage

```javascript
var Application = require('billy');
var app = new Application();

app.service(function main() {
  console.log('Hello, World!');
});

app.start();
```

## Links

* [Billy services on npm](https://www.npmjs.org/browse/keyword/billy-service)
* [API documentation](http://docs.billy.technology)

## Features

* [Dependency injection / inversion-of-control container](https://github.com/bvalosek/sack)
* Generic configuration store
* Asynchronous promise-based service stack
* Extremely minimal
* Service-oriented design
* Compatible in all browsers and NodeJS

## Overview

The primary goal and driving philosophy of Billy is to provide a cohesive and
useful set of patterns for building an application that doesn't creep its way
into your business logic and domain code.

It is flexible and generic enough to work great for building server apps,
browser apps, javascript games, or even CLI utilities.

Much like [express](https://github.com/visionmedia/express), Billy strives not
to be a framework that permeates all parts of your codebase, but rather the
scaffolding that allows you to roll your own application architecture stack.

## Services

Billy views your application as the composition of several dependency-injected
Services. When the application is started via `app.start()`, all registered
services will be instantiated in turn and be given a chance to startup.

A service should be used to create various run-time objects and register them
as dependencies with the IoC container via the `app` dependency for other parts
of the application to use.

Services are effectively the place where all the various pieces of your
application are booted, configured, and wired together.

### Registering a service

Your application entry point will register a series of services that will power
your app. Services can either be a simple closure or a class constructor, and
can optionally use promises to signal an asynchronous startup.

### Using closures as a Service

The simplest example of a service is a function:

```javascript
app.service(function main() {
  console.log('service created');
});
```

If our service took some time to startup, we could return a `Promise` to ensure
during the service start phase, the application would wait.

```javascript
app.service(function main() {
  console.log('service created');

  return someAsyncTask()
    .then(function() {
      console.log('service started');
    });
});
```

Note that all services are first *created* all at once (by calling the provided
function), synchronously. Then, all of the services are *started* (by waiting
on any promises returned in the service function).

#### Using Class Constructors as a Service

A simple class constructor can be passed to the `app.service()` method as well.

```javascript
// MyService.js
module.exports = MyService;

function MyService()
{
  console.log('service created');
}
```

In our startup file:

```javascript
// main.js
var Application = require('billy');
var MyService = require('./MyService.js');

var app = new Application();

app.service(MyService);
app.start();
```

If this service requires some additional setup after all services have been
created, or requires an asynchronous startup, we can implement a `start`
method:

```javascript
MyService.prototype.start = function()
{
  return someAsyncTask()
    .then(function() {
      console.log('service started');
    });
};
```

Any promise return is waited on until it resolves before attempting to start
any subsequent services.

This is useful for things like downloading external data, verifying
credentials, bootstrapping external connections, etc. The application startup
process will block until the service resolves, guaranteeing a deterministic
boot up.

## Testing

```
$ npm test
```

## Documentation

This will generate the HTML documentation under `./doc`:

```
$ npm run doc
```

## License

MIT
