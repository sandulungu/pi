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

var curr_song,
    queue = [],
    first_song = true;

function get_next_song() {
    var next = queue.shift();
    if (next == null)
        next = Math.floor(Math.random() * songs.length);
    curr_song = next;
    log("Next song: " + songs[next]);
    return songs[next];
}

function play_next() {
    if (first_song) return;
    exec("mpg123 " + get_next_song().replace(/ /g, '\\ '), play_next);
}

function stop_playback() {
    exec("killall mpg123");
}

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
        return;
    }

    else if (uri == '/stop') {
        res.writeHead(200);
        queue = [];
        first_song = true;
        stop_playback();
        return res.end(get_playlist());
    }

    else if (uri == '/queue' || uri == '/play') {
        res.writeHead(200);
        if (!songs[q]) {
            res.writeHead(500);
            return res.end('Invalid song id: ' + q);
        }
        if (uri == '/play') {
            queue.unshift(q);
            stop_playback();
        } else {
            queue.push(q);
        }

        first_song = false;
        play_next();
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
