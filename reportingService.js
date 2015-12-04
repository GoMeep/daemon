'use strict';

const request = require('request');
const { masterAddr, authKey, refreshRate, id, name } = require('./hawkConfig.js');
const getReport = require('./modules/getReport.js');

const reporter = function(){
  getReport((payload) => {
    // Post data to master server.
    request.post(masterAddr, {
      form: {
        payload,
        authKey,
        id,
        name
      }
    });
    
    // Update database every ${refreshRate} seconds with new report.
    setTimeout(reporter, refreshRate);
  });
};

reporter();


