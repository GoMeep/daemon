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

    this.server = null;
    this.closed = false;
  }

  start() {
    // Spawn a new instance with the option to execute a file from a directory
    // report output, errors and close.
    this.server = spawn(
      this.startCommand,
      this.startOptions,
      {
        cwd: this.dir
      }
    );

    console.log(`cd ${this.dir} && ${this.startCommand}`);
    this.server.stdout.setEncoding('utf8');

    this.server.stdout.on('data', data => {
      this.output(data);
    });

    this.server.stderr.on('data', data => {
      this.output(data);
    });

    this.server.on('close', code => {
      this.connectionClosed = true;
      this.done(code);
    });
  }

  command(command) {
    // Issue command by writing to stdin unless the instance is not active.
    if (this.server.closed) {
      this.out({
        data: `Tried to execute ${command} on a closed instance.`,
        code: 1
      });
    } else {
      this.server.stdin.write(`${command}\n`);
    }
  }

  output(data) {
    this.out({
      data: data,
      code: 1
    });
  }

  stop() {
    // Halt the server, if it has a shutdown command, use it. If the command
    // fails to shutdown the server after 15s halt it by killing it.
    if (this.stopCommand) {
      this.command(this.stopCommand);
      setTimeout(() => {
        if (!this.closed) {
          this.output({
            data: 'Failed to stop with stop command after 15s, force killing.',
            code: 1
          });
          this.server.kill();
        }
      }, 15000);
    } else {
      this.server.kill();
    }
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
