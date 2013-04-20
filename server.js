var puts = require('util').puts;
var exec = require('child_process').exec;
var fs = require('fs');
var songs;

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

walk('/media/KEY', function(err, files) {
    songs = files.filter(function(file) { return file.substr(-4) == '.mp3'; });
    puts(songs.length + " songs found.");
});

var curr_song, queue = [];
function next_song() {
var next = queue.shift();
if (next == null)
next = Math.floor(Math.random() * songs.length);
curr_song = songs[next];
puts("Next song: " + curr_song);
return curr_song;
}
function loop() {
exec("mpg123 " + next_song().replace(/ /g, '\\ '), loop);
}

var app = require('http').createServer(handler).listen(8888);
var url = require("url");
var first = true;

function handler (req, res) {
var parsed = url.parse(req.url);
var pathname = parsed.pathname;
puts("Requested: " + pathname);
if (pathname == '/' || pathname == '/app.js')
  fs.readFile(__dirname + pathname,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading ' + pathname);
    }

    res.writeHead(200);
    return res.end(data);
  });
else if (pathname == '/queue') {
res.writeHead(200);
if (!songs[parsed.query]) {
res.writeHead(500);
return res.end('Invalid song id');
}
queue.push(parsed.query);
if (first) { first = false; loop() }
return res.end(parsed.query);
}
else if (pathname == '/now_playing') {
  res.writeHead(200);
return res.end(curr_song);
}
else if (pathname == '/playlist') {
  res.writeHead(200);
return res.end(JSON.stringify({songs: songs, queue: queue, now_playing: curr_song}));
}
 res.writeHead(404);
res.end('Not found ' + pathname);
}