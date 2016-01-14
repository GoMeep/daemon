'use strict';

const request = require('request');
const { masterAddr, myAddress } = require('../meepConfig.js').hawk;
const getReport = require('./modules/getReport.js');
const authKey = require('../authkey.json').authKey;

const reporter = function(){

  getReport((payload) => {
    // Post data to master server.
    request.post(`${masterAddr}/nest/hawk`, {
      form: {
        data,
        authKey,
        address: myAddress
      }
    },
    function(err, httpResponse, body) {
      if (err) console.error(err);
    });

    // Update database every ${refreshRate} seconds with new report.
    setTimeout(reporter, 5000);
  });
};

reporter();
console.log('meep-hawk reporting service active.');
