/**
 * Raspberry DJ server
 */

/**
 * Base folder with MP3s
 * @type {String}
 */
var folder = '/media/KEY';

/**
 * Web server port
 * @type {Number}
 */
var port = 8888;

var log = require('util').puts;
var exec = require('child_process').exec;
var fs = require('fs');
var http = require('http');
var url = require("url");

/**
 * Recursively search directory
 * http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
 *
 * @param dir path
 * @param done callback
 */
var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
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

var songs;
log("Scanning " + folder + "...");
walk(folder, function (err, files) {
    songs = files.filter(function (file) {
        return file.substr(-4) == '.mp3';
    });
    log(songs.length + " songs found.");
});

var curr_song, queue = [];
function next_song() {
    var next = queue.shift();
    if (next == null)
        next = Math.floor(Math.random() * songs.length);
    curr_song = songs[next];
    log("Next song: " + curr_song);
    return curr_song;
}

function loop() {
    exec("mpg123 " + next_song().replace(/ /g, '\\ '), loop);
}

var first_song = true;

function get_playlist() {
    return JSON.stringify({songs: songs, queue: queue, now_playing: curr_song});
}

function handler(req, res) {
    var parsed = url.parse(req.url),
        uri = parsed.pathname,
        q = parsed.query;

    log("Requested " + uri);
    if (uri == '/' || uri == '/app.js' || uri == '/app.css') {
        if (uri == '/') uri = '/index.html';

        fs.readFile(
            __dirname + uri,
            function (err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading ' + uri);
                }

                res.writeHead(200);
                return res.end(data);
            }
        );
    }

    else if (uri == '/queue') {
        res.writeHead(200);
        if (!songs[q]) {
            res.writeHead(500);
            return res.end('Invalid song id: ' + q);
        }
        queue.push(q);

        if (first_song) {
            first_song = false;
            loop();
        }
        return res.end(get_playlist());
    }

    else if (uri == '/playlist') {
        res.writeHead(200);
        return res.end(get_playlist());
    }

    res.writeHead(404);
    res.end('Not found ' + uri);
}

http.createServer(handler).listen(port);
