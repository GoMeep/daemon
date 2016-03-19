'use strict';

const spawn = require('child_process').spawn;
const noop = () => {};

class Instance {
  constructor(options) {
    // Dir to run startup command from
    this.dir = (options.dir) ? options.dir : '~/';

    // Startup command, an example might be 'java -jar MyJar.jar'
    this.startCommand = options.startCommand;

    // Support for an array of flags or options in startup
    this.startOptions = (options.startOptions) ? options.startOptions : [];
    this.stopCommand = (options.stopCommand) ? options.stopCommand : false;
    // Pipe output to noop if not supplied by constructor
    this.out = (options.out) ? options.out : noop;
  
    this.yolk = options.yolk;
    this.server = null;
    this.closed = true;
  }

  command(command) {
    // Issue command by writing to stdin unless the instance is not active.
    if (this.closed) {
      this.out({
        data: `Tried to execute ${command} on a closed instance.`,
        code: 1
      });
    } else {
      this.server.stdin.write(`${command}\n`);
    }
  }

  start() {
    // Spawn a new instance with the option to execute a file from a directory
    // report output, errors and close.
    if (this.closed) {
      this.closed = false;

      this.server = spawn(
        this.startCommand,
        this.startOptions,
        {
          cwd: this.dir
        }
      ).on('error', err => {
        this.out({
          data: err,
          code: 0
        });
      });

      this.server.stdout.setEncoding('utf8');

      this.server.stdout.on('data', data => {
        this.out({
          data: data,
          code: 1
        });
      });

      this.server.stderr.on('data', data => {
        this.out({
          data: data,
          code: 1
        });
      });

      this.server.on('close', code => {
        this.connectionClosed = true;
        this.done(code);
      });
    } else {
      this.out({
        data: `Cannot start instance, instance already running.`,
        code: 1
      });
    }

    return this;
  }

  stop(next) {
    // Halt the server, if it has a shutdown command, use it. If the command
    // fails to shutdown the server after 15s halt it by killing it.
    if (!this.closed) {
      if (this.stopCommand) {
        this.command(this.stopCommand);
        setTimeout(() => {
          if (!this.closed) {
            this.out({
              data: 'Failed to stop with command after 15s, force killing.',
              code: 1
            });
            this.server.kill();
            if (next) {
              next();
            }
          }
        }, 15000);
      } else {
        this.server.kill();
        if (next) {
          next();
        }
      }
    }
  }

  restart() {
    this.stop(() => {
      this.start();
    });
  }

  done(code) {
    this.closed = true;
    this.out({
      data: 'Instance ended with code',
      code: code
    });
  }
}

module.exports = Instance;
