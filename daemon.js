'use strict';

// Local
const {masterAddr, myAddress} = require('../meepConfig.js').hawk;
const authKey = require('../authkey.json').authKey;
const getReport = require('./modules/getReport.js');

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

// Accept commands with authKey provided and dispatch if authKey matches locally
app.post('/exec', function(req, res) {
  let exec = new Promise((resolve, reject) => {
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
});

app.post('/spawn', funciton(req, res) {
  let spawn = function createInstance(){
    return new Promise((resolve, reject) => {

    });
  };

  spawn.then((status, response) => {
    res.status(status).jsonp(response);
  });
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
        setTimeout(reporter, 5000);
      }
    });
  });
};

reporter();
