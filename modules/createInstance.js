'use strict';

const Instance = require('./instance');

let spawn = function createInstance(options, instances, callback) {
  return new Promise((resolve, reject) => {
    // check to make sure it doesn't already exist in the instances array.
    if (options.startCommand) {
      instances[options.instanceName] = new Instance({
        dir: (options.dir) ? options.dir : false,
        yolk: options.yolk,
        startCommand: options.startCommand,
        startOptions: (options.startOptions) ? options.startOptions : false,
        stopCommand: (options.stopCommand) ? options.stopCommand : false,
        out: data => {
          if (instances[options.instanceName].consoleOutput) {
            instances[options.instanceName].consoleOutput.push(data.data);
            callback(instances);
          } else {
            instances[options.instanceName].consoleOutput = [data.data];
            callback(instances);
          }

          if (data.code === 0) {
            reject({
              data: data.data,
              status: 500
            });
          } else {
            resolve({
              data: 'New instance has been started.',
              status: 200
            });
          }
        }
      }).start();

      callback(instances);
    } else {
      reject({
        data: 'Missing start command.',
        status: 500
      });
    }
  });
};

module.exports = spawn;
