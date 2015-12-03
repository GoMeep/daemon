const exec = require('child_process').exec;

// works off the response of 'lscpu'
const cpu = function(callback) {
  var info = {};
  //top -bn 2 | grep -F '%Cpu' | tail -n 4 | awk '{print $2 $3}' | tr -s '\n\:\,[:alpha:]' ' '
  exec('lscpu', function(err, out, code) {
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

module.exports = cpu;
