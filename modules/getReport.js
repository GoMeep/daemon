'use strict';

const { cpu, mem, hdd } = require('./parsers');

const getReport = function(callback) {
  mem((mem_report) => {
    cpu((cpu_report) => {
      hdd((hdd_report) => {
        let report = {
          mem: mem_report,
          cpu: cpu_report,
          hdd: hdd_report
        }
        callback(report); 
      });
    });
  });
}

getReport((report) => console.log(report));
module.exports = getReport;
