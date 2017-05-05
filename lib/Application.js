const debug = require('debug')('billy:Application');
const Container = require('./Container.js');

/*

  Centralized application harness used to register and boot up IoC-injected
  services.

*/
module.exports = class Application
{
  constructor({ containerTag = 'container' } = { })
  {
    this._started = false;
    this._services = [ ];
    this._running = [ ];

    this._container = new Container();

    if (containerTag) {
      this._container.registerValue('container', this._container);
    }
  }

  /*

    Add a new service class to the application stack

  */
  service(T)
  {
    if (this._started) {
      throw new Error('Cannot add service after application has been started');
    }

    if (!T) {
      throw new Error('Missing parameter T');
    }

    const type = typeof T;

    if (type !== 'function') {
      throw new Error(`Invalid typeof T: ${type}, must be 'function'`);
    }

    const name = T.name;

    if (this._services.includes(T)) {
      throw new Error(`Service already registered: ${name}`);
    }

    this._services.push(T);

    debug(`registered ${name}`);
  }

  /*

    Instantiate and start each registered service

  */
  async start()
  {
    debug('starting application');

    this._started = true;

    for (const T of this._services) {
      const instance = this._container.new(T);
      debug(`creating ${T.name}`);
      this._running.push(instance);
    }

    for (const instance of this._running) {
      debug(`starting ${instance.constructor.name}`);
      if (typeof instance.start === 'function') {
        await instance.start();
      }
    }

    debug('application started');
  }

  /*

    Give each started service a chance to stop in the reverse order they were
    started

  */
  async stop()
  {
    debug('stopping application');

    for (const instance of this._running.reverse()) {

      const name = instance.constructor.name;

      try {
        debug(`stopping ${name}`);
        if (typeof instance.stop === 'function') {
          await instance.stop();
        }
      }
      catch (err) {
        debug(`error stopping ${name}: ${err}`, err);
      }

    }

    debug('application stopped');
  }

};
