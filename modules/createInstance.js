
const Instance = require('./instance');

// Perhapse put this in a flatfile db to prevent loss on crash of daemon
let instances = {};

let spawn = function createInstance(options) {
  return new Promise((resolve, reject) => {
    // check to make sure it doesn't already exist in the instances array.
    instances[options.instanceName] = new Instance({
      dir: (options.dir) ? options.dir : false,
      startCommand: options.startCommand,
      startOptions: (options.startOptions) ? options.startOptions : false,
      stopCommand: (options.stopCommand) ? options.stopCommand : false,
      out: data => {
        // report data to the API or something here.
        console.log(data.data);
      }
    });

  });
};

module.exports = spawn;
