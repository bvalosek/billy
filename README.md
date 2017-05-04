# billy

A minimal application harness that stays out of your way and out of your code.

> This is the v2 branch, which has back-compat breaking changes from v1, see
> [billy v1](https://github.com/bvalosek/billy/tree/v1) for the old version

## Installation

```
$ npm install billy
```

## Usage

## Overview

The primary goal and driving philosophy of Billy is to provide a cohesive and
useful set of patterns for building an application that doesn't creep its way
into your business logic and domain code.

It is flexible and generic enough to work great for building server apps,
browser apps, Javascript games, or even CLI utilities.

Much like [express](https://github.com/visionmedia/express), Billy strives not
to be a framework that permeates all parts of your codebase, but rather the
scaffolding that allows you to roll your own application architecture stack.

## Services

Billy views your application as the composition of several dependency-injected
Services. When the application is started via `app.start()`, all added
services will be instantiated in turn and be given a chance to startup.

A service should be used to create various run-time objects and register them
as dependencies with the IoC container via the `app` dependency for other parts
of the application to use.

Services are effectively the place where all the various pieces of your
application are booted, configured, and wired together. The should stay very
lean and not contain any business logic-- keep that in your billy-unaware layer
of the application.

## Testing

```
$ npm test
```

## License

MIT

