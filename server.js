var sys = require('sys');
var fs = require('fs');

fs.readdir('/media/KEY', function(err, files) {
    files.filter(function(file) { return file.substr(-4) == '.mp3'); })
         .forEach(function(file) { sys.puts(file + "\n") });
});

var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }
exec("ls -la", puts);