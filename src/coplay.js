(function () {
    /**
     * coplay
     * Synchronizing video play between two peers
     */
    let coplay = {};


    /**
     * Check if coplay is already started or not supported
     */
    let id = 'coplay';
    if (get(id)) {
        return;
    }

    // Supported websites: Youku, SohuTV, Tudou, TencentVideo, iQiyi, YouTube
    let host = location.host.match(/(?:^|\.)(youku|sohu|tudou|qq|iqiyi|youtube|bilibili|le|vimeo)\.com/i);
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
        return top.document.getElementById(id);
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
        let elem = document.createElement(tagName);
        for (let prop in props) {
            elem[prop] = props[prop];
        }
        if (parent) {
            parent.appendChild(elem);
        }
        return elem;
    }

    function pack(type, data) {
        let p = {
            type: type
        };
        if (data !== undefined) {
            p.data = data;
        }

        return p;
    };


    /**
     * Player adaptor layer
     */
    let playerAdaptor = {};
    playerAdaptor.youku = {
        prepare: function () {
            // just return true if ready
            this._player = typeof PlayerPause !== 'undefined';
        },
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
            this._player = get('tudouHomePlayer');
        },
        play: function () {
            this._player.notify('play');
        },
        pause: function () {
            this._player.notify('pause');
        },
        seek: function (sec) {
            // Seek in Tudou means go foward/backward,
            // so return to start and then forward to given time
            this._player.notify('seek', [-86400]);
            this._player.notify('seek', [sec]);
        },
        restart: function () {
            this._player.notify('replay');
        },
        isStart: function () {
            return true; // not available yet
        },
        getTime: function () {
            return this._player.notify('getPlaytime');
        }
    };
    playerAdaptor.qq = {
        prepare: function () {
            if (window.tvp) {
                let instances = tvp.Player.instance;
                this._player = instances[Object.keys(instances)[0]];
            } else if (window.PLAYER) {
                this._player = PLAYER;
            }
        },
        play: function () {
            this._player.play();
        },
        pause: function () {
            this._player.pause();
        },
        seek: function (sec) {
            this._player.seekTo(sec);
        },
        isStart: function () {
            if (window.tvp) {
                return !this._player.isPlayingLoadingAd();
            } else if (window.PLAYER) {
                return this._player.getPlayerState() !== -1;
            }
        },
        getTime: function () {
            if (window.tvp) {
                return this._player.getCurTime();
            } else if (window.PLAYER) {
                return this._player.getCurrentTime();
            }
        }
    };
    playerAdaptor.iqiyi = {
        prepare: function () {
            this._player = get('flash');
        },
        play: function () {
            this._player.resumeQiyiVideo();
        },
        pause: function () {
            this._player.pauseQiyiVideo();
        },
        seek: function (sec) {
            this._player.seekQiyiVideo(sec);
        },
        isStart: function () {
            return true; // not available yet
        },
        getTime: function () {
            return JSON.parse(this._player.getQiyiPlayerInfo()).currentTime / 1000;
        }
    };
    playerAdaptor.sohu = {
        prepare: function () {
            this._player = get('player') || get('player_ob');
        },
        play: function () {
            this._player.playVideo();
        },
        pause: function () {
            this._player.pauseVideo();
        },
        seek: function (sec) {
            this._player.seekTo(sec);
        },
        isStart: function () {
            return true;
        },
        getTime: function () {
            return this._player.playedTime();
        }
    };
    playerAdaptor.youtube = {
        prepare: function () {
            this._player = get('movie_player');
        },
        play: function () {
            this._player.playVideo();
        },
        pause: function () {
            this._player.pauseVideo();
        },
        seek: function (sec) {
            this._player.seekTo(sec, true);
        },
        isStart: function () {
            return true;
        },
        getTime: function () {
            return this._player.getCurrentTime();
        }
    };
    playerAdaptor.bilibili = {
        prepare: function () {
            this._player = get('player_placeholder');
        },
        play: function () {
            if (!this.isStart()) {
                this._player.jwPlay();
            }
        },
        pause: function () {
            if (this.isStart()) {
                this._player.jwPause();
            }
        },
        seek: function (sec) {
            this._player.jwSeek(sec)
        },
        isStart: function () {
            return this._player.jwGetState() === 'PLAYING';
        },
        getTime: function () {
            return this._player.jwGetPosition();
        }
    };
    playerAdaptor.le = {
        prepare: function () {
            this._player = get('www_player_1');
        },
        play: function () {
            this._player.resumeVideo();
        },
        pause: function () {
            this._player.pauseVideo();
        },
        seek: function (sec) {
            this._player.seekTo(sec);
        },
        isStart: function () {
            return LETV.PLYAER_STATE === 'START';
        },
        getTime: function () {
            return this._player.getVideoTime();
        }
    };
    playerAdaptor.vimeo = {
        prepare: function () {
            if (window.PlayerManager) {
                this._player = PlayerManager.getPlayer(query('.video video'));
                let s = create('style', document.body, {
                    textContent: `
                        #coplay.active #coplay-toggle {
                            color: #${this._player.color} !important;
                        }
                        #coplay input:focus,
                        #coplay button:not(:disabled):hover,
                        #coplay.active #coplay-toggle:hover {
                            color: #fff !important;
                            background-color: #${this._player.color} !important;
                        }`
                });
            }
        },
        play: function () {
            this._player.play();
        },
        pause: function () {
            this._player.pause();
        },
        seek: function (sec) {
            this._player.currentTime = sec;
        },
        isStart: function () {
            return this._player.paused;
        },
        getTime: function () {
            return this._player.currentTime();
        }
    };

    function initPlayer(done) {
        let player = playerAdaptor[host];

        (function prepare() {
            player.prepare();
            if (player._player) {
                coplay.player = player;
                if (typeof done === 'function') {
                    done();
                }
            } else {
                setTimeout(prepare, 500);
            }
        })();
    }


    /**
     * coplay UI
     */
    function initUI() {
        let main = create('article', document.body, {
            id: id,
            className: coplayOptions.autoActivate ? 'active' : ''
        });

        let toggle = create('button', main, {
            id: getId('toggle'),
            innerHTML: '<span class="coplay-heart"></span>'
        });
        toggle.onclick = function () {
            main.classList.toggle('active');
        };

        let local = create('input', main, {
            id: getId('local'),
            type: 'text',
            placeholder: 'Peer ID',
            readOnly: true
        });
        local.onfocus = function () {
            this.select();
            return false;
        };

        let remote = create('input', main, {
            id: getId('remote'),
            type: 'text',
            placeholder: 'Remote peer ID'
        });

        let connect = create('button', main, {
            id: getId('connect'),
            innerHTML: '<span class="coplay-plug"></span>'
        });
        connect.onclick = function () {
            coplay.connect(remote.value);
            return false;
        };

        let disconnect = create('button', main, {
            id: getId('disconnect'),
            hidden: true,
            innerHTML: '<span class="coplay-cancel"></span>'
        });
        disconnect.onclick = function () {
            coplay.disconnect();
            return false;
        };

        let play = create('button', main, {
            id: getId('play'),
            innerHTML: '<span class="coplay-play"></span>',
            title: 'Play'
        });
        play.onclick = function () {
            coplay.player.play();
            coplay.remote.send(pack('PLAY'));
            return false;
        };

        let pause = create('button', main, {
            id: getId('pause'),
            innerHTML: '<span class="coplay-pause"></span>',
            title: 'Pause'
        });
        pause.onclick = function () {
            coplay.player.pause();
            coplay.remote.send(pack('PAUSE'));
            return false;
        };

        let sync = create('button', main, {
            id: getId('sync'),
            innerHTML: '<span class="coplay-sync"></span>',
            title: 'Sync with me'
        });
        sync.onclick = function () {
            let time = coplay.player.getTime();
            coplay.player.seek(time);
            coplay.remote.send(pack('SEEK', time));
            return false;
        };

        let restart = create('button', main, {
            id: getId('restart'),
            innerHTML: '<span class="coplay-restart"></span>',
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

        // enable after ad stops
        if (!coplay.player.isStart()) {
            coplay.disable();
            (function wait() {
                if (coplay.player.isStart()) {
                    coplay.enable();
                } else {
                    setTimeout(wait, 500);
                }
            })();
        }
    }

    coplay.remote = {
        send: function () {
            let c = coplay.connection;
            if (c) {
                c.send.apply(c, arguments);
            }
        }
    }

    function parseURL(url) {
        let a = create('a', null, {
            href: url
        });

        let { protocol, hostname, pathname, port } = a;
        return {
            protocol,
            host: hostname,
            path: pathname,
            port
        };
    }

    function initPeer() {
        if (!window.Peer) {
            throw new Error('Cannot initialize peer.');
        }

        let peerOptions = {
            key: 'kl2e8piw363qsemi',
            config: {
                // free servers from https://gist.github.com/yetithefoot/7592580
                iceServers: [
                    { url: 'stun:stun.turnservers.com:3478' },
                    { url: 'stun:stun01.sipphone.com' },
                    { url: 'stun:stun.ekiga.net' },
                    { url: 'stun:stun.fwdnet.net' },
                    { url: 'stun:stun.ideasip.com' },
                    { url: 'stun:stun.iptel.org' },
                    { url: 'stun:stun.rixtelecom.se' },
                    { url: 'stun:stun.schlund.de' },
                    { url: 'stun:stun.l.google.com:19302' },
                    { url: 'stun:stun1.l.google.com:19302' },
                    { url: 'stun:stun2.l.google.com:19302' },
                    { url: 'stun:stun3.l.google.com:19302' },
                    { url: 'stun:stun4.l.google.com:19302' },
                    { url: 'stun:stunserver.org' },
                    { url: 'stun:stun.softjoys.com' },
                    { url: 'stun:stun.voiparound.com' },
                    { url: 'stun:stun.voipbuster.com' },
                    { url: 'stun:stun.voipstunt.com' },
                    { url: 'stun:stun.voxgratia.org' },
                    { url: 'stun:stun.xten.com' },
                    { url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' },
                    { url: 'turn:192.158.29.39:3478?transport=udp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username: '28224511:1379330808' },
                    { url: 'turn:192.158.29.39:3478?transport=tcp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username: '28224511:1379330808' }
                ]
            }
        };
        let server = coplayOptions.server;
        if (server) {
            let url = parseURL(server);
            peerOptions.host = url.host || undefined;
            peerOptions.path = url.path || undefined;
            peerOptions.port = url.port || undefined;

            if (url.protocol === 'https:') {
                peerOptions.secure = true;
            }
            if (coplayOptions.key) {
                peerOptions.key = coplayOptions.key;
            }
        }
        let peer = new Peer(peerOptions);

        peer.on('open', function (id) {
            coplay.ui.local.value = id;
        });

        peer.on('connection', connect);

        coplay.peer = peer;
    }

    function connect(c) {
        coplay.connection = c;

        let ui = coplay.ui;
        ui.remote.value = c.peer;
        ui.remote.disabled = true;
        ui.connect.hidden = true;
        ui.disconnect.hidden = false;

        let start = 0;
        let elapsed = 0;
        let round = 0;
        let count = 0;

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
            let player = coplay.player;
            console.log(p);
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
                    player.seek(parseInt(p.data, 10));
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
        let main = get(id);
        if (!main) {
            initPlayer(function () {
                initUI();
                initPeer();
            });
        }
    };

    coplay.setDisabled = function (isDisabled) {
        let ui = coplay.ui;
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

        let c = coplay.peer.connect(remote, {
            label: 'coplay',
            serialization: 'json',
            reliable: false
        });

        c.on('open', function () {
            connect(c);
        });
    };

    coplay.disconnect = function () {
        let c = coplay.connection;
        if (c) {
            c.close();
        }
    };

    window.coplay = coplay;

    /**
     * Get options and start
     */
    let coplayOptions = JSON.parse(document.body.dataset['coplayOptions']);
    coplay.init();
})();
