'use strict';

const request = require('request');
const { masterAddr, authKey, refreshRate, myAddress } = require('../meepConfig.js').hawk;
const getReport = require('./modules/getReport.js');

const reporter = function(){
  
  getReport((payload) => {
    // Post data to master server.
    request.post(masterAddr, {
      form: {
        payload,
        authKey,
        address: myAddress
      }
    },
    function(err, httpResponse, body) {
      if (err) console.error(err);
    });

    // Update database every ${refreshRate} seconds with new report.
    setTimeout(reporter, refreshRate);
  });
};

reporter();
console.log('meep-hawk reporting service active.');
