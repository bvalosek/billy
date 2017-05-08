const Application = require('../lib');
const Container = require('../lib/Container.js');
const test = require('tape');
const ITERATIONS = 1000;

test('Perf: Raw new', async t => {
  const A = Symbol('a');
  const B = Symbol('b');

  class T { constructor(a, b){} }

  let timer = ElapsedTime.startNew();

  for(let i = 0; i < ITERATIONS; i++){
    let foo = new T(A, B);
  }

  timer.end('Raw new')

  t.end();
});

test('Perf: Container new', async t => {
  const c = new Container();

  const A = Symbol('a');
  const B = Symbol('b');

  c.registerValue('a', A);
  c.registerValue('b', B);
  class T { constructor(a, b){} }

  let timer = ElapsedTime.startNew();

  for(let i = 0; i < ITERATIONS; i++){
    let foo = c.new(T);
  }

  timer.end('Container new')

  t.end();
});


class ElapsedTime {
  constructor(customDebug) {
    this.startTime = null;
  }

  start(message) {
    return this.startTime = process.hrtime();
  }

  end(message) {
    const timeObj = this._getTime();
    if (message) {
      console.log(message + " (" + timeObj.str + ")");
    }
    this.startTime = process.hrtime();
    return timeObj.val;
  }

  static startNew() {
    const et = new ElapsedTime();
    et.start();
    return et;
  }

  _getTime() {
    var precision = 2; // decimal places
    var t = process.hrtime(this.startTime);
    var elapsed = t[1] / 1000000; // nano to milli
    var seconds = t[0] * 1000; // seconds to milli
    var ms = seconds + elapsed;

    return {
      str: "" + ms.toFixed(precision) + " ms",
      val: +(ms.toFixed(precision))
    };
  }
}
