(function () {
    'use strict';

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

    function attr(elem, name, value) {
        if (value !== undefined) {
            elem.setAttribute(name, value);
        } else {
            return elem.getAttribute(name);
        }
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

    function getDefined(...args) {
        return args.find(val => val !== undefined);
    }

    function on(elem, type, listener) {
        let prefixes = ['', 'webkit', 'moz'];
        let prefix = prefixes.find(prefix => elem['on' + prefix + type] !== undefined);
        elem['on' + prefix + type] = listener;
    }

    function getFullscreenElement() {
        return getDefined(
            document.fullscreenElement,
            document.webkitFullscreenElement,
            document.mozFullScreenElement
        );
    }

    function toggleFullscreen(elem) {
        if (!elem) {
            return false;
        }

        let fullscreenElement = getFullscreenElement();
        if (typeof fullscreenElement === undefined) {
            return false;
        }

        let main = coplay.ui.main;
        if (fullscreenElement !== null) {
            let exitFullscreen = getDefined(
                document.exitFullscreen,
                document.webkitExitFullscreen,
                document.mozCancelFullScreen
            );
            document.body.appendChild(main);
            exitFullscreen.call(document);
            return false;
        } else {
            let requestFullscreen = getDefined(
                elem.requestFullscreen,
                elem.webkitRequestFullscreen,
                elem.mozRequestFullScreen
            );
            requestFullscreen.call(elem);
            elem.appendChild(main);
            return true;
        }
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
            if (this._player = typeof PlayerPause !== 'undefined') {
                this.setFullscreenContainer(get('player'));
            }
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
            if (this._player = get('tudouHomePlayer')) {
                this.setFullscreenContainer(query('#player .player_main'));
            }
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
            if (this._player) {
                this.setFullscreenContainer(query('#mod_player .tenvideo_player'));
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
                return true;
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
        },
        onfullscreenchange: function (isFullscreen) {
            if (window.tvp) {
                attr(this._player.getPlayer(), 'style', isFullscreen ? 'width: 100vw; height: 100vh;' : '');
            }
        }
    };
    playerAdaptor.iqiyi = {
        prepare: function () {
            if (this._player = get('flash')) {
                this.setFullscreenContainer(get('flashbox'));
            };
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
        },
        onfullscreenchange: function (isFullscreen) {
            let box = this._fullscreenContainer;
            if (isFullscreen) {
                this._boxStyle = attr(box, 'style');
                attr(box, 'style', this._boxStyle + ';width: 100vw; height: 100vh;');
            } else {
                attr(box, 'style', this._boxStyle);
            }
        }
    };
    playerAdaptor.sohu = {
        prepare: function () {
            if (this._player = get('player') || get('player_ob')) {
                let outer = get('sohuplayer');
                let container = create('div', null);
                outer.insertBefore(container, this._player.nextSibling);
                container.appendChild(this._player);
                this.setFullscreenContainer(container);
            }
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
        },
        onfullscreenchange: function (isFullscreen) {
            if (isFullscreen) {
                this._playerStyle = attr(this._player, 'style');
                attr(this._player, 'style', this._playerStyle + ';width: 100vw; height: 100vh;');
            } else {
                attr(this._player, 'style', this._playerStyle);
            }
        }
    };
    playerAdaptor.youtube = {
        prepare: function () {
            if (this._player = get('movie_player')) {
                this.setFullscreenContainer(get('movie_player'));
            }
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
            if (this._player = get('player_placeholder')) {
                this.setFullscreenContainer(get('bofqi'));
            }
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
        },
        onfullscreenchange: function (isFullscreen) {
            if (isFullscreen) {
                this._boxStyle = attr(this._player, 'style');
                attr(this._player, 'style', this._boxStyle + ';width: calc(100vw + 298px); height: calc(100vh + 98px); margin-top: -50px;');
            } else {
                attr(this._player, 'style', this._boxStyle);
            }
        }
    };
    playerAdaptor.le = {
        prepare: function () {
            if (this._player = get('www_player_1')) {
                this.setFullscreenContainer(get('fla_box'));
            }
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
        },
        onfullscreenchange: function (isFullscreen) {
            let box = this._fullscreenContainer.firstChild;
            if (isFullscreen) {
                this._boxStyle = attr(box, 'style');
                attr(box, 'style', this._boxStyle + ';width: 100%; height: 100%;');
            } else {
                attr(box, 'style', this._boxStyle);
            }
        }
    };
    playerAdaptor.vimeo = {
        prepare: function () {
            if (window.PlayerManager) {
                if (this._player = this.getPlayer()) {
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
                    this.setFullscreenContainer(query('#player .player'));
                }
            }
        },
        play: function () {
            this.getPlayer().play();
        },
        pause: function () {
            this.getPlayer().pause();
        },
        seek: function (sec) {
            this.getPlayer().currentTime = sec;
        },
        isStart: function () {
            return this.getPlayer().paused;
        },
        getTime: function () {
            return this.getPlayer().currentTime();
        },
        getPlayer: function () {
            return PlayerManager.getPlayer(query('.video video'));
        },
        toggleFullscreen: function () {
            coplay.ui.fullscreen.classList.toggle('active');
            this._fullscreenContainer.appendChild(coplay.ui.main);
            this._isFullscreen = !this.isFullscreen;
            query('#player .fullscreen').dispatchEvent(new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            }));
        }
    };

    let playerBase = {
        trigger: function (type, ...args) {
            if (typeof this['on' + type] === 'function') {
                this['on' + type](...args);
            }
        },
        setFullscreenContainer: function (elem) {
            this._fullscreenContainer = elem;
            elem.classList.add('coplay-fullscreen-container');
            on(elem, 'fullscreenchange', () => {
                if ((getFullscreenElement() === elem) !== this._isFullscreen) {
                    this.resetFullscreen();
                }
            });
            this.trigger('fullscreeninit');
        },
        resetFullscreen: function() {
            coplay.ui.fullscreen.classList.remove('active');
            document.body.appendChild(coplay.ui.main);
            this.trigger('fullscreenchange', false);
        },
        toggleFullscreen: function () {
            coplay.ui.fullscreen.classList.toggle('active');
            this._isFullscreen = toggleFullscreen(this._fullscreenContainer);
            this.trigger('fullscreenchange', this._isFullscreen);
        }
    };

    function initPlayer(done) {
        let player = Object.assign({}, playerBase, playerAdaptor[host]);

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

        const DRAGGING_CLASS = 'coplay-dragging';
        let toggle = create('button', main, {
            id: getId('toggle'),
            innerHTML: '<span class="coplay-heart"></span>',
            title: 'Click to toggle, drag to move the control bar'
        });
        toggle.onclick = function () {
            if (!main.classList.contains(DRAGGING_CLASS)) {
                main.classList.toggle('active');
            }
        };
        drag(main, {
            handle: toggle,
            ondragstart: function () {
                this.target.classList.add(DRAGGING_CLASS);
            },
            ondragend: function () {
                setTimeout(() => {
                    this.target.classList.remove(DRAGGING_CLASS);
                }, 0);
            }
        });

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
                coplay.player.seek(0.001);
            }
            coplay.remote.send(pack('SEEK', 0));
            return false;
        };

        let fullscreen = create('button', main, {
            id: getId('fullscreen'),
            innerHTML: '<span class="coplay-fullscreen"></span><span class="coplay-exit-fullscreen"></span>',
            title: 'Toggle fullscreen'
        });
        fullscreen.onclick = function () {
            coplay.player.toggleFullscreen();
        };

        coplay.ui = {
            main,
            local,
            remote,
            connect,
            disconnect,
            toggle,
            play,
            pause,
            sync,
            restart,
            fullscreen
        };

        if (location.protocol === 'https:') {
            let call = create('button', main, {
                id: getId('call'),
                innerHTML: '<span class="coplay-call"></span>',
                title: 'Start video call'
            });
            call.onclick = function () {
                coplay.call(coplay.ui.remote.value);
            };
            coplay.ui.call = call;

            let hangUp = create('button', main, {
                id: getId('hang-up'),
                innerHTML: '<span class="coplay-cancel"></span>',
                hidden: true,
                title: 'End video call'
            });
            hangUp.onclick = function () {
                coplay.hangUp();
            };
            coplay.ui.hangUp = hangUp;

            create('style', document.body, {
                textContent: `
                    #coplay.active {
                        width: 46em !important;
                    }`
            });
        }

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
        send: function (...args) {
            let c = coplay.connection;
            if (c) {
                c.send.apply(c, args);
            }
        }
    };

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

        peer.on('call', call);

        coplay.peer = peer;
    }

    function call(media) {
        prepareMedia(media);
        coplay.call(media);
    }

    function prepareMedia(media) {
        coplay.media = media;
        let ui = coplay.ui;
        media.on('stream', stream => {
            ui.remoteVideo.src = window.URL.createObjectURL(stream);
            ui.localVideo.hidden = false;
            ui.remoteVideo.hidden = false;
            ui.call.hidden = true;
            ui.hangUp.hidden = false;
        });
        media.on('close', () => {
            ui.localVideo.hidden = true;
            ui.remoteVideo.hidden = true;
            ui.call.hidden = false;
            ui.hangUp.hidden = true;
        })
    }

    function connect(c) {
        coplay.connection = c;

        let ui = coplay.ui;
        ui.remote.value = c.peer;
        ui.remote.disabled = true;
        ui.connect.hidden = true;
        ui.disconnect.hidden = false;
        ui.call.disabled = false;

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
            switch (p.type) {
                case 'REQ':
                    c.send(pack('ACK'));
                    break;
                case 'ACK':
                    round = Date.now() - start;
                    count++;
                    elapsed += round;
                    setTimeout(function () {
                        heartBeat(c);
                    }, 1000);
                    break;
                case 'CHECK':
                    c.send(pack('PATH', getPath()));
                    break;
                case 'PATH':
                    if (p.data !== getPath()) {
                        console.error('Not on the same page.');
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
        ui.fullscreen.disabled = isDisabled;
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

    function getUserMedia(...args) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            return navigator.mediaDevices.getUserMedia(...args);
        }
        let method = getDefined(
            navigator.getUserMedia,
            navigator.webkitGetUserMedia,
            navigator.mozGetUserMedia
        );
        if (!method) {
            return null;
        }

        return method.apply(navigator, args);
    }

    function initVideoCallPlayers() {
        if (coplay.ui.localVideo) {
            return;
        }
        let remoteVideo = create('video', coplay.ui.main, {
            id: 'coplay-remote-video',
            autoplay: true
        });
        let localVideo = create('video', coplay.ui.main, {
            id: 'coplay-local-video',
            autoplay: true
        });
        drag(remoteVideo);
        drag(localVideo);
        Object.assign(coplay.ui, { remoteVideo, localVideo });
        on(document, 'fullscreenchange', function () {
            if (remoteVideo.src) {
                remoteVideo.play();
            }
            if (localVideo.src) {
                localVideo.play();
            }
        });
    }

    coplay.call = function (remote) {
        getUserMedia({
            video: true,
            audio: true
        }, stream => {
            initVideoCallPlayers();
            coplay.ui.localVideo.src = window.URL.createObjectURL(stream);
            if (typeof remote === 'string') { // peer id
                let media = coplay.peer.call(remote, stream);
                prepareMedia(media);
            } else { // MediaConnection
                remote.answer(stream);
            }
        }, err => console.error)
    };

    coplay.hangUp = function () {
        let m = coplay.media;
        if (m) {
            coplay.media.close();
        }
    };

    window.coplay = coplay;

    /**
     * Get options and start
     */
    let coplayOptions = JSON.parse(document.body.dataset['coplayOptions']);
    coplay.init();
})();
