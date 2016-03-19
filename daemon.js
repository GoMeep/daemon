'use strict';

// Local
const {masterAddr, myAddress} = require('../meepConfig.js').hawk;
const authKey = require('../authkey.json').authKey;
const getReport = require('./modules/getReport.js');
const spawn = require('./modules/createInstance');

// Tools
const request = require('request');
const childProcess = require('child_process').exec;

// Express
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(
  bodyParser.json()
);

let instances = {};

// Accept commands with authKey provided and dispatch if authKey matches locally
app.post('/exec', function(req, res) {
  if (req.body.instanceName) {
    let options = req.body;
    if (options.authKey === authKey) {
      if (instances[options.instanceName]) {
        res.status(200).jsonp({
          success: `ran command ${options.command}`
        });
        instances[options.instanceName].command(options.command);
      } else {
        res.status(404).jsonp({
          success: `unknown instance provided, ${options.instanceName}`
        });
      }
    } else {
      res.status(401).jsonp({
        error: 'unauthorized to despawn, invalid authKey'
      });
    }
  } else {
    let exec = new Promise(resolve => {
      if (req.body.authKey === authKey) {
        childProcess(req.body.command, (err, stdout, stderr) => {
          if (err) {
            resolve(500, err);
          } else if (stderr) {
            resolve(500, stderr);
          } else {
            resolve(200, {
              message: `Successfully dispatched command ${req.body.command}`,
              output: stdout
            });
          }
        });
      } else {
        resolve(401, {
          error: 'You are unauthorized to issue commands on this nest.'
        });
      }
    });

    exec
      .then((status, response) => {
        res.status(status).jsonp(response);
      });
  }
});

app.post('/spawn', function(req, res) {
  let options = req.body;
  options.startOptions = JSON.parse(options.startOptions);

  if (options.authKey === authKey) {
    if (instances[options.instanceName]) {
      res.status(409).jsonp({
        error: `instance name ${options.instanceName} is already in use.`
      });
    } else {
      spawn(options, instances, (newInstances, rmInstance) => {
        if (newInstances) {
          instances = Object.assign({}, instances, newInstances);
          console.log(instances);
        } else if (rmInstance) {
          delete instances[rmInstance];
        }
      }).then(data => {
        res.status(data.status).jsonp(data.data);
      }).catch(data => {
        res.status(data.status).jsonp(data.data);
      });
    }
  } else {
    res.status(401).jsonp({
      error: 'unauthorized to spawn, invalid authKey'
    });
  }
});

// Should only be used if you do not plan to restart the server.
app.post('/despawn', function(req, res) {
  let options = req.body;
  if (options.authKey === authKey) {
    if (instances[options.instanceName]) {
      instances[options.instanceName].stop();
      delete instances[options.instanceName];
      res.status(200).jsonp({
        success: 'started shutdown procedure'
      });
    } else {
      res.status(404).jsonp({
        success: `unknown instance provided, ${options.instanceName}`
      });
    }
  } else {
    res.status(401).jsonp({
      error: 'unauthorized to despawn, invalid authKey'
    });
  }
});

app.post('/cycle', function(req, res) {
  let options = req.body;
  if (options.authKey === authKey) {
    if (instances[options.instanceName]) {
      if (options.cycle === 'stop') {
        instances[options.instanceName].stop();
        res.status(200).jsonp({
          success: 'started shutdown procedure'
        });
      } else if (options.cycle === 'start') {
        instances[options.instanceName].start();
        res.status(200).jsonp({
          success: 'started start procedure'
        });
      } else if (options.cycle === 'restart') {
        instances[options.instanceName].restart();
        res.status(200).jsonp({
          success: 'started restart procedure'
        });
      } else {
        res.status(404).jsonp({
          success: `unknown procedure ${options.procedure}`
        });
      }
    } else {
      res.status(404).jsonp({
        success: `unknown instance provided, ${options.instanceName}`
      });
    }
  } else {
    res.status(401).jsonp({
      error: 'unauthorized to cycle, invalid authKey'
    });
  }
});

app.post('/instance', function(req, res) {
  let options = req.body;
  if (options.authKey === authKey) {
    if (instances[options.instanceName]) {
      let instance = Object.assign({}, instances[options.instanceName]);
      instance.server = null;

      res.status(200).jsonp({
        success: instance
      });
    } else {
      res.status(404).jsonp({
        success: `unknown instance provided, ${options.instanceName}`
      });
    }
  } else {
    res.status(401).jsonp({
      error: 'unauthorized to view instance, invalid authKey'
    });
  }
});

app.post('/instances', function(req, res) {
  let options = req.body;
  if (options.authKey === authKey) {
    res.status(200).jsonp({
      success: Object.keys(instances)
    });
  } else {
    res.status(401).jsonp({
      error: 'unauthorized to view instance, invalid authKey'
    });
  }
});

app.listen(3000, function() {
  console.log('Daemon listening on http://localhost:3000');
});

// Report usage info to master API every n seconds.
const reporter = function() {
  getReport(payload => {
    request.post(`${masterAddr}/nest/hawk`, {
      form: {
        data: payload,
        authKey,
        address: myAddress
      }
    },
    function(err, httpResponse, body) {
      if (err) {
        console.error(err);
        console.warn(body);
      } else {
        setTimeout(reporter, 500);
      }
    });
  });
};

reporter();
