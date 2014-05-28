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
var Application = require('billy').Application;

var app = new Application();

app.service(function main() {
  console.log('Hello, World!');
});

app.start();
```

## Features

* Dependency injection
* Generic configuration store
* Asynchronous service bootup
* Extremely minimal
* Service-oriented design
* Compatible in all browsers and NodeJS

## Testing

```
$ npm test
```

## License

MIT
