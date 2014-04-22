# Billy

[![Build Status](https://travis-ci.org/bvalosek/billy.png?branch=master)](https://travis-ci.org/bvalosek/billy)
[![NPM version](https://badge.fury.io/js/billy.png)](http://badge.fury.io/js/billy)

A minimal application harness that stays out of your way and out of your code.

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

## Tern Support

The source files are all decorated with [JSDoc3](http://usejsdoc.org/)-style
annotations that work great with the [Tern](http://ternjs.net/) code inference
system. Combined with the Node plugin (see this project's `.tern-project`
file), you can have intelligent autocomplete for methods in this library.

## Testing

Testing is done with [Tape](http://github.com/substack/tape) and can be run
with the command `npm test`.

Automated CI cross-browser testing is provided by
[Testling](http://ci.testling.com/bvalosek/billy), and server-side testing
is done with [Travis CI](https://travis-ci.org/bvalosek/billy).

## License
Copyright 2014 Brandon Valosek

**Billy** is released under the MIT license.
