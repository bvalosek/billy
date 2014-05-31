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

## Features

* Dependency injection / inversion-of-control container
* Generic configuration store
* Asynchronous promise-based service stack
* Extremely minimal
* Service-oriented design
* Compatible in all browsers and NodeJS

## Philosophy

The primary philosophy of Billy is to provide a cohesive and useful set of
patterns for building an application that doesn't creep its way into your
business logic and domain code.

It is flexible and generic enough to work great for building server apps,
browser apps, or even CLI apps.

Billy very much so strives to be the
[express](https://github.com/visionmedia/express) of general application
architecture.

## Testing

```
$ npm test
```

## License

MIT
