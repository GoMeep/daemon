const exec = require('child_process').exec;

// works off the response of 'lscpu'
const cpu = function(callback) {
  var info = {
    usage: {}
  };
  exec('lscpu', function(err, out, code) {
    if (err instanceof Error) throw err;

    out.split(/\n/g).map((item) => {
      if(item.length > 1) {
        var splitItem = item.split(':');
        info[splitItem[0]] = splitItem[1].replace(/\s/g, '');
      }
    });
    exec("top -bn 2 | grep -F '%Cpu' | tail -n 4 | awk '{print $2 $3}' | tr -s '\n\:\,[:alpha:]' ' '", function(err, out, code) {
      if (err instanceof Error) throw err;
      console.log(out);
      if(!(out.indexOf("us") > -1)){
        info.usage.per_tread = out.split(' ').filter(function(e){return e});
      }
      exec("grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'", function(err, out, code) {
        if (err instanceof Error) throw err;
        info.usage.overall = out.replace('\n', '');
        callback(info);
      });

    });
  });
}

module.exports = cpu;
