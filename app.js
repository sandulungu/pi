requirejs.config({
    paths: {
        jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery',
        bootstrap: '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.0/js/bootstrap',
        underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore'
    },
    shim: {
        bootstrap: { deps: ['jquery'] }
    }
});

/**
 * Jukebox Pi client
 */
define(['jquery', 'bootstrap', 'underscore'], function() {
    $(function() {

        function render(data) {
            $('#stop-playback').toggle(data.now_playing != null);

            var queue = {};
            _.each(data.queue, function(id, no) {
                queue[id] = queue[id] || [];
                queue[id].push(no + 1);
            });

            var $container = $('#playlist .dynamic-container').html(''),
                tpl = _.template($('#playlist script').html());

            _.each(data.songs, function(name, id) {
                $container.append(tpl({
                    id: id,
                    name: name,
                    queue: queue[id] ? queue[id].join(', ') : '',
                    stopped: data.now_playing == null,
                    now_playing: data.now_playing == id
                }));
            });
        }

        function refresh() {
            $.getJSON('http://10.10.0.45:8888/playlist', render);
        }

        refresh();
        setInterval(refresh, 10 * 1000);

        $('#playlist').delegate('.queue ,.play', 'click', function() {
            var $btn = $(this),
                id = $btn.data('id'),
                action = $btn.hasClass('play') ? 'play' : 'queue';

            $.getJSON('http://10.10.0.45:8888/' + action + '?' + id, render);

            return false;
        });

        $('#stop-playback').click(function() {
            $.getJSON('http://10.10.0.45:8888/stop', render);
            return false;
        });

        // Volume control
        var $volume_control = $('#volume-group');
        for (var i = 76; i <= 100; i += 4) {
            $volume_control.append($('<div>', {
                class: 'btn',
                title: 'Set volume to ' + i + '%'
            }).html(i));
        }
        $volume_control.find('.btn').click(function() {
            var $btn = $(this);
            $.getJSON('http://10.10.0.45:8888/volume?' + $btn.text(), render);
        });


    });
});