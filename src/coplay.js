(function () {
    /**
     * coplay
     * Synchronizing video play between two peers
     */
    var coplay = {};


    /**
     * Check if coplay is already started or not supported
     */
    var id = 'coplay';
    if (get(id)) {
        return;
    }

    // Supported websites: Youku, SohuTV, Tudou, TencentVideo, iQiyi, YouTube
    var host = location.host.match(/(youku|sohu|tudou|qq|iqiyi|youtube|bilibili).com/);
    if (!host) {
        return;
    }
    host = host[1];


    /**
     * Common utilis
     */
    function getId(part) {
        return id + '-' + part;
    }

    function get(id) {
        return document.getElementById(id);
    }

    function query(selector, elem) {
        elem = elem || document;
        return elem.querySelector(selector);
    }

    function queryAll(selector, elem) {
        elem = elem || document;
        return elem.querySelectorAll(selector);
    }

    function create(tagName, parent, props) {
        var elem = document.createElement(tagName);
        for (var prop in props) {
            elem[prop] = props[prop];
        }
        parent.appendChild(elem);
        return elem;
    }

    function pack(type, data) {
        var p = {
            type: type
        };
        if (data) {
            p.data = data;
        }

        return p;
    };


    /**
     * Player adaptor layer
     */
    var playerAdaptor = {};
    playerAdaptor.youku = {
        prepare: function () {},
        play: function () {
            PlayerPause(false);
        },
        pause: function () {
            PlayerPause(true);
        },
        seek: function (sec) {
            PlayerSeek(sec);
        },
        isStart: function () {
            return playerStart;
        },
        getTime: function () {
            return PlayerInfo().time;
        }
    };
    playerAdaptor.tudou = {
        prepare: function () {
            this.player = get('tudouHomePlayer');
        },
        play: function () {
            this.player.notify('play');
        },
        pause: function () {
            this.player.notify('pause');
        },
        seek: function (sec) {
            // Seek in Tudou means go foward/backward,
            // so return to start and then forward to given time
            this.player.notify('seek', [-86400]);
            this.player.notify('seek', [sec]);
        },
        restart: function () {
            this.player.notify('replay');
        },
        isStart: function () {
            return true; // not available yet
        },
        getTime: function () {
            return this.player.notify('getPlaytime');
        }
    };
    playerAdaptor.qq = {
        prepare: function () {
            this.player = txv.playdata.player;
        },
        play: function () {
            this.player.play();
        },
        pause: function () {
            this.player.pause();
        },
        seek: function (sec) {
            this.player.setPlaytime(sec);
        },
        isStart: function () {
            return this.player.isStartPlay;
        },
        getTime: function () {
            return this.player.getPlaytime();
        }
    };
    playerAdaptor.iqiyi = {
        prepare: function () {
            this.player = get('flash');
        },
        play: function () {
            this.player.resumeQiyiVideo();
        },
        pause: function () {
            this.player.pauseQiyiVideo();
        },
        seek: function (sec) {
            this.player.seekQiyiVideo(sec);
        },
        isStart: function () {
            return true; // not available yet
        },
        getTime: function () {
            return JSON.parse(this.player.getQiyiPlayerInfo()).currentTime / 1000;
        }
    };
    playerAdaptor.sohu = {
        prepare: function () {
            this.player = get('player') || get('player_ob');
        },
        play: function () {
            this.player.playVideo();
        },
        pause: function () {
            this.player.pauseVideo();
        },
        seek: function (sec) {
            this.player.seekTo(sec);
        },
        isStart: function () {
            return this.player.getPlayerState() !== -1;
        },
        getTime: function () {
            return this.player.playedTime();
        }
    };
    playerAdaptor.youtube = {
        prepare: function () {
            this.player = get('movie_player');
        },
        play: function () {
            this.player.playVideo();
        },
        pause: function () {
            this.player.pauseVideo();
        },
        seek: function (sec) {
            this.player.seekTo(sec, true);
        },
        isStart: function () {
            return true;
        },
        getTime: function () {
            return this.player.getCurrentTime();
        }
    };
    playerAdaptor.bilibili = {
        prepare: function () {
            this.player = get('player_placeholder');
        },
        play: function () {
            if (!this.isStart()) {
                this.player.jwPlay();
            }
        },
        pause: function () {
            if (this.isStart()) {
                this.player.jwPause();
            }
        },
        seek: function (sec) {
            this.player.jwSeek(sec)
        },
        isStart: function () {
            return this.player.jwGetState() == "PLAYING";
        },
        getTime: function () {
            return this.player.jwGetPosition();
        }
    };

    function initPlayer() {
        var player = playerAdaptor[host];
        player.prepare();

        // enable after ad stops
        if (!player.isStart()) {
            coplay.disable();
            var timer = setInterval(function () {
                if (player.isStart()) {
                    coplay.enable();
                    clearInterval(timer);
                }
            }, 500);
        }
        coplay.player = player;
    }


    /**
     * coplay UI
     */
    function initUI() {
        var main = create('article', document.body, {
            id: id
        });

        var toggle = create('button', main, {
            id: getId('toggle'),
            innerHTML: '<span class="fa fa-heart"></span>'
        });
        toggle.onclick = function () {
            main.classList.toggle('active');
        };

        var local = create('input', main, {
            id: getId('local'),
            type: 'text',
            placeholder: 'Peer ID',
            readOnly: true
        });
        local.onfocus = function () {
            this.select();
            return false;
        };

        var remote = create('input', main, {
            id: getId('remote'),
            type: 'text',
            placeholder: 'Remote peer ID'
        });

        var connect = create('button', main, {
            id: getId('connect'),
            innerHTML: '<span class="fa fa-plug"></span>'
        });
        connect.onclick = function () {
            coplay.connect(remote.value);
            return false;
        };

        var disconnect = create('button', main, {
            id: getId('disconnect'),
            hidden: true,
            innerHTML: '<span class="fa fa-close"></span>'
        });
        disconnect.onclick = function () {
            coplay.disconnect();
            return false;
        };

        var play = create('button', main, {
            id: getId('play'),
            innerHTML: '<span class="fa fa-play"></span>',
            title: 'Play'
        });
        play.onclick = function () {
            coplay.player.play();
            coplay.remote.send(pack('PLAY'));
            return false;
        };

        var pause = create('button', main, {
            id: getId('pause'),
            innerHTML: '<span class="fa fa-pause"></span>',
            title: 'Pause'
        });
        pause.onclick = function () {
            coplay.player.pause();
            coplay.remote.send(pack('PAUSE'));
            return false;
        };

        var sync = create('button', main, {
            id: getId('sync'),
            innerHTML: '<span class="fa fa-refresh"></span>',
            title: 'Sync with me'
        });
        sync.onclick = function () {
            var time = coplay.player.getTime();
            coplay.player.seek(time);
            coplay.remote.send(pack('SEEK', time));
            return false;
        };

        var restart = create('button', main, {
            id: getId('restart'),
            innerHTML: '<span class="fa fa-step-backward"></span>',
            title: 'Restart'
        });
        restart.onclick = function () {
            if (coplay.player.restart) {
                coplay.player.restart();
            } else {
                coplay.player.seek(0);
            }
            coplay.remote.send(pack('SEEK', 0));
            return false;
        };

        coplay.ui = {
            main: main,
            local: local,
            remote: remote,
            connect: connect,
            disconnect: disconnect,
            toggle: toggle,
            play: play,
            pause: pause,
            sync: sync,
            restart: restart
        };
    }

    coplay.remote = {
        send: function () {
            var c = coplay.connection;
            if (c) {
                c.send.apply(c, arguments);
            }
        }
    }

    function initPeer() {
        if (!window.Peer) {
            throw 'Cannot initialize peer.';
        }

        var peer = new Peer({
            key: 'kl2e8piw363qsemi',
            config: {
                // free servers from https://gist.github.com/yetithefoot/7592580
                iceServers: [
                    { url: 'stun:stun.turnservers.com:3478' },
                    { url:'stun:stun01.sipphone.com' },
                    { url:'stun:stun.ekiga.net' },
                    { url:'stun:stun.fwdnet.net' },
                    { url:'stun:stun.ideasip.com' },
                    { url:'stun:stun.iptel.org' },
                    { url:'stun:stun.rixtelecom.se' },
                    { url:'stun:stun.schlund.de' },
                    { url:'stun:stun.l.google.com:19302' },
                    { url:'stun:stun1.l.google.com:19302' },
                    { url:'stun:stun2.l.google.com:19302' },
                    { url:'stun:stun3.l.google.com:19302' },
                    { url:'stun:stun4.l.google.com:19302' },
                    { url:'stun:stunserver.org' },
                    { url:'stun:stun.softjoys.com' },
                    { url:'stun:stun.voiparound.com' },
                    { url:'stun:stun.voipbuster.com' },
                    { url:'stun:stun.voipstunt.com' },
                    { url:'stun:stun.voxgratia.org' },
                    { url:'stun:stun.xten.com' },
                    { url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' },
                    { url: 'turn:192.158.29.39:3478?transport=udp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username: '28224511:1379330808' },
                    { url: 'turn:192.158.29.39:3478?transport=tcp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username: '28224511:1379330808' }
                ]
            }
        });

        peer.on('open', function (id) {
            coplay.ui.local.value = id;
        });

        peer.on('connection', connect);

        coplay.peer = peer;
    }

    function connect(c) {
        coplay.connection = c;

        var ui = coplay.ui;
        ui.remote.value = c.peer;
        ui.remote.disabled = true;
        ui.connect.hidden = true;
        ui.disconnect.hidden = false;

        var start = 0;
        var elapsed = 0;
        var round = 0;
        var count = 0;

        function heartBeat() {
            start = Date.now();
            c.send(pack('REQ'));
        }

        function checkPath() {
            c.send(pack('CHECK'));
        }

        function getPath() {
            return location.host + location.pathname;
        }

        c.on('data', function (p) {
            var player = coplay.player;
            switch (p.type) {
                case 'REQ':
                    c.send(pack('ACK'));
                    break;
                case 'ACK':
                    round = Date.now() - start;
                    count++;
                    elapsed += round;
                    console.log(round + 'ms');
                    setTimeout(function () {
                        heartBeat(c);
                    }, 1000);
                    break;
                case 'CHECK':
                    c.send(pack('PATH', getPath()));
                    break;
                case 'PATH':
                    if (p.data !== getPath()) {
                        console.log('Not on the same page.');
                        c.close();
                    }
                    break;
                case 'MSG':
                    console.log('Remote: ' + p.data);
                    break;
                case 'SEEK':
                    player.seek(p.data);
                    break;
                case 'PAUSE':
                    player.pause();
                    break;
                case 'PLAY':
                    player.play();
                    break;
            }
        });

        heartBeat();
        checkPath();

        c.on('close', function () {
            ui.remote.value = '';
            ui.remote.disabled = false;
            ui.connect.hidden = false;
            ui.disconnect.hidden = true;
            coplay.connection = null;
        });
    }

    coplay.init = function () {
        var main = get(id);
        if (!main) {
            initUI();
            initPlayer();
            initPeer();
        }
    };

    coplay.setDisabled = function (isDisabled) {
        var ui = coplay.ui;
        ui.play.disabled = isDisabled;
        ui.pause.disabled = isDisabled;
        ui.sync.disabled = isDisabled;
        ui.restart.disabled = isDisabled;
    };

    coplay.enable = function () {
        coplay.setDisabled(false);
    };

    coplay.disable = function () {
        coplay.setDisabled(true);
    };

    coplay.connect = function (remote) {

        var c = coplay.peer.connect(remote, {
            label: 'coplay',
            serialization: 'json',
            reliable: false
        });

        c.on('open', function () {
            connect(c);
        });
    };

    coplay.disconnect = function () {
        var c = coplay.connection;
        if (c) {
            c.close();
        }
    };

    window.coplay = coplay;
    coplay.init();
})();
