'use strict';

const request = require('request');
const { masterAddr, authKey, refreshRate, id, name, instanceType } = require('./hawkConfig.js');
const getReport = require('./modules/getReport.js');

const reporter = function(){
  console.log('meep-hawk reporting service active.');

  getReport((payload) => {
    // Post data to master server.
    request.post(masterAddr, {
      form: {
        payload,
        authKey,
        id,
        name,
        instanceType
      }
    });
    
    // Update database every ${refreshRate} seconds with new report.
    setTimeout(reporter, refreshRate);
  });
};

reporter();


