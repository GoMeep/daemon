'use strict';

const { cpu, mem } = require('./parsers');

const getReport = function(server, callback) {
  mem((mem_report) => {
    cpu((cpu_report) => {
      let report = {
        mem: mem_report,
        cpu: cpu_report
      }
      callback(report);
    });
  });
}
module.exports = getReport;
