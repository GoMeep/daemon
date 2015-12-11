const exec = require('child_process').exec;

const hdd = function(callback) {
  var info = {};
  exec("df -Pl|grep '^/dev'|awk '{print $6, 100 - $5}'|sed 's/%//'", function(err, out, code) {
    if (err instanceof Error) throw err;
    info.spaceFree = out.split(/\n/g)[0].replace(/[^\d.-]/g, '');
    callback(info);
  });
}

module.exports = hdd;
