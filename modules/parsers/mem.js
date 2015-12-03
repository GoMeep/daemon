const exec = require('child_process').exec;

// works off the response of 'cat /proc/meminfo'
const mem = function(callback) {
  var info = {};
  exec('cat /proc/meminfo', function(err, out, code) {
    if (err instanceof Error) throw err;

    out.split(/\n/g).map((item) => {
      if(item.length > 1) {
        var splitItem = item.split(':');
        info[splitItem[0]] = splitItem[1].replace(/\s/g, '');
      }
    });
    callback(info);
  });
}

module.exports = mem;
