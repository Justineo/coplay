(function () {
    'use strict';

    const icons = '__ICONS__';

    /**
     * Don't activate inside iframes
     */
    if (window !== top) {
        return;
    }

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
    let host = location.host.match(/(?:^|\.)(youku\.com|sohu\.com|tudou\.com|qq\.com|iqiyi\.com|youtube\.com|acfun\.tv|bilibili\.com|le\.com|vimeo\.com)(?:\/|$)/i);
    if (!host) {
        return;
    }
    host = host[1].split('.')[0];

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

    function pick(obj, ...props) {
        return props.reduce((result, current) => {
            result[current] = obj[current];
            return result;
        }, {});
    }

    function on(elem, type, listener, noStop) {
        let prefixes = ['', 'webkit', 'moz'];
        let prefix = prefixes.find(prefix => elem['on' + prefix + type] !== undefined);
        elem.addEventListener(prefix + type, function (e) {
            listener.call(elem, e);
            if (!noStop) {
                e.preventDefault();
                e.stopPropagation();
            }
            return !!noStop;
        }, false);
    }

    function off(elem, type, listener) {
        let prefixes = ['', 'webkit', 'moz'];
        let prefix = prefixes.find(prefix => elem['on' + prefix + type] !== undefined);
        elem.removeEventListener(prefix + type, listener);
    }

    function getFullscreenElement(doc) {
        doc = doc || document;
        return getDefined(
            doc.fullscreenElement,
            doc.webkitFullscreenElement,
            doc.mozFullScreenElement
        );
    }

    function toggleFullscreen(elem, doc) {
        if (!elem) {
            return false;
        }

        let fullscreenElement = getFullscreenElement(doc);
        if (typeof fullscreenElement === undefined) {
            return false;
        }

        let ui = coplay.ui;
        if (fullscreenElement !== null) {
            let exitFullscreen = getDefined(
                document.exitFullscreen,
                document.webkitExitFullscreen,
                document.mozCancelFullScreen
            );
            document.body.appendChild(ui.main);
            if (ui.remoteVideo) {
                document.body.appendChild(ui.remoteVideo);
                document.body.appendChild(ui.localVideo);
            }
            exitFullscreen.call(document);
            return false;
        } else {
            let requestFullscreen = getDefined(
                elem.requestFullscreen,
                elem.webkitRequestFullscreen,
                elem.mozRequestFullScreen
            );
            requestFullscreen.call(elem);
            elem.appendChild(ui.main);
            if (ui.remoteVideo){
                elem.appendChild(ui.remoteVideo);
                elem.appendChild(ui.localVideo);
            }
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
            if (this._player = query('#ykPlayer video')) {
                this.setFullscreenContainer(get('ykPlayer'));
            }
        },
        play: function () {
          if (this._player.paused)
            this._player.play();
        },
        pause: function () {
            this._player.pause();
        },
        seek: function (sec) {
            this._player.currentTime = sec;
        },
        isStart: function () {
            return true;
        },
        getTime: function () {
            return this._player.currentTime;
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
            let me = this;
            this._isTvp = true;
            this._doc = document;
            function getPlayer(global) {
                let player;
                if (global.PLAYER) {
                    player = global.PLAYER;
                    me._isTvp = false;
                } else if (global.tvp) {
                    let instances = tvp.Player.instance;
                    player = instances[Object.keys(instances)[0]];
                    if (!player) {
                        let frame = get('player_area');
                        if (frame && frame.contentWindow) {
                            player = getPlayer(frame.contentWindow);
                            if (player) {
                                me._doc = frame.contentWindow.document;
                            }
                        }
                    }
                }
                return player;
            }

            this._player = getPlayer(window);
            if (this._player) {
                this.setFullscreenContainer(this._doc.querySelector('#mod_player .tenvideo_player'));
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
            if (this._isTvp) {
                return true;
            } else if (this._player.getPlayerState) {
                return this._player.getPlayerState() !== -1;
            }
        },
        getTime: function () {
            if (this._isTvp) {
                return this._player.getCurTime();
            } else if (window.PLAYER) {
                return this._player.getCurrentTime();
            }
        },
        onfullscreenchange: function (isFullscreen) {
            if (this._isTvp) {
                attr(this._player.getPlayer(), 'style', isFullscreen ? 'width: 100vw; height: 100vh;' : '');
            }
            if (mainDrag) {
                mainDrag[isFullscreen ? 'pause' : 'resume']();
            }
        }
    };
    playerAdaptor.iqiyi = {
        prepare: function () {
            if (this._player = get('flash')) {
                this._isFlash = true;
                this.setFullscreenContainer(get('flashbox'));
            } else if (this._player = query('.iqp-player video')) {
                this._isFlash = false;
                this.setFullscreenContainer(query('.iqp-player'));
            }
        },
        play: function () {
            if (this._isFlash) {
                this._player.resumeQiyiVideo();
            } else {
                if (this._player.paused) {
                    this._player.play();
                }
            }
        },
        pause: function () {
            if (this._isFlash) {
                this._player.pauseQiyiVideo();
            } else {
                if (!this._player.paused) {
                    this._player.pause();
                }
            }
        },
        seek: function (sec) {
            if (this._isFlash) {
                this._player.seekQiyiVideo(sec);
            } else {
                this._player.currentTime = sec;
            }

        },
        isStart: function () {
            return true; // not available yet
        },
        getTime: function () {
            return this._player.currentTime;
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
    playerAdaptor.acfun = {
        prepare: function () {
            let player = get('ACFlashPlayer');
            if (player && player.tagName === 'IFRAME') {
                player = player.contentDocument.getElementById('ACFlashPlayer');
            }
            if (this._player = player) {
                this.setFullscreenContainer(get('player'));
            }
        },
        play: function () {
            this._player.play({ action: 'play' });
        },
        pause: function () {
            this._player.play({ action: 'pause' });
        },
        seek: function (sec) {
            this._player.play({ action: 'jump,' + sec });
        },
        isStart: function () {
            return true;
        },
        getTime: function () {
            return this._player.getTime();
        },
        onfullscreenchange: function (isFullscreen) {
            let box = this._player;
            if (isFullscreen) {
                this._boxStyle = attr(box, 'style');
                attr(box, 'style', this._boxStyle + ';width: 100%; height: 100%;');
            } else {
                attr(box, 'style', this._boxStyle);
            }
        }
    },
    playerAdaptor.bilibili = {
        prepare: function () {
            if (this._player = query('.bilibili-player-video video')) {
                this._isFlash = false;
                this.setFullscreenContainer(get('bofqi'));
            } else {
                this._player = get('player_placeholder');
                this._isFlash = true;
                this.setFullscreenContainer(get('bofqi'));
            }
        },
        _checkPlayer: function () {
            // removed from DOM
            if (this._player && !document.body.contains(this._player)) {
                this.resetFullscreenContainer();
                this.prepare();
            }
        },
        play: function () {
            this._checkPlayer();
            if (this._isFlash) {
                if (!this.isStart()) {
                    this._player.jwPlay();
                }
            } else {
                if (this._player.paused) {
                    this._player.play();
                }
            }
        },
        pause: function () {
            this._checkPlayer();
            if (this._isFlash) {
                if (this.isStart()) {
                    this._player.jwPause();
                }
            } else {
                if (!this._player.paused) {
                    this._player.pause();
                }
            }
        },
        seek: function (sec) {
            this._checkPlayer();
            if (this._isFlash) {
                this._player.jwSeek(sec)
            } else {
                this._player.currentTime = sec;
            }
        },
        isStart: function () {
            this._checkPlayer();
            if (this._isFlash && this._player.jwGetState) {
                return this._player.jwGetState() === 'PLAYING';
            } else {
                return true;
            }
        },
        getTime: function () {
            this._checkPlayer();
            if (this._isFlash) {
                return this._player.jwGetPosition();
            } else {
                return this._player.currentTime;
            }
        },
        onfullscreenchange: function (isFullscreen) {
            this._checkPlayer();
            if (isFullscreen) {
                this._box = this._isFlash ? this._player : query('.player', this._fullscreenContainer);
                this._boxStyle = attr(this._box, 'style');
                attr(this._box, 'style', this._boxStyle + ';width: calc(100vw + 298px); height: calc(100vh + 98px); margin-top: -50px;');
            } else {
                attr(this._box, 'style', this._boxStyle);
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

            var _this = this;
            this._fullscreenChangeHandler = function () {
                if ((getFullscreenElement(_this._doc) === elem) !== _this._isFullscreen) {
                    _this.resetFullscreen();
                }
            };
            on(document, 'fullscreenchange', this._fullscreenChangeHandler);
            this.trigger('fullscreeninit');
        },
        resetFullscreenContainer: function () {
            if (this._fullscreenContainer) {
                this._fullscreenContainer.classList.remove('coplay-fullscreen-container');
            }
            this._fullscreenContainer = null;
            off(document, 'fullscreenchange', this._fullscreenChangeHandler);
        },
        resetFullscreen: function() {
            coplay.ui.fullscreen.classList.remove('active');
            document.body.appendChild(coplay.ui.main);
            this.trigger('fullscreenchange', false);
        },
        toggleFullscreen: function () {
            coplay.ui.fullscreen.classList.toggle('active');
            this._isFullscreen = toggleFullscreen(this._fullscreenContainer, this._doc);
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

    let mainDrag;

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
            innerHTML: `${icons['heart']}`,
            title: 'Click to toggle, drag to move the control bar'
        });
        on(toggle, 'click', function () {
            if (!main.classList.contains(DRAGGING_CLASS)) {
                main.classList.toggle('active');
            }
        });
        mainDrag = coplayDrag(main, {
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
        on(local, 'focus', function () {
            this.select();
        });
        on(local, 'click', () => {});

        let remote = create('input', main, {
            id: getId('remote'),
            type: 'text',
            placeholder: 'Remote peer ID'
        });
        on(remote, 'click', () => {});

        let connect = create('button', main, {
            id: getId('connect'),
            innerHTML: `${icons['plug']}`
        });
        on(connect, 'click', function () {
            coplay.connect(remote.value);
        });

        let disconnect = create('button', main, {
            id: getId('disconnect'),
            hidden: true,
            innerHTML: `${icons['cancel']}`
        });
        on(disconnect, 'click', function () {
            coplay.disconnect();
        });

        let play = create('button', main, {
            id: getId('play'),
            innerHTML: `${icons['play']}`,
            title: 'Play'
        });
        on(play, 'click', function () {
            coplay.player.play();
            coplay.remote.send(pack('PLAY'));
        });

        let pause = create('button', main, {
            id: getId('pause'),
            innerHTML: `${icons['pause']}`,
            title: 'Pause'
        });
        on(pause, 'click', function () {
            coplay.player.pause();
            coplay.remote.send(pack('PAUSE'));
        });

        let sync = create('button', main, {
            id: getId('sync'),
            innerHTML: `${icons['sync']}`,
            title: 'Sync with me'
        });
        on(sync, 'click', function () {
            let time = coplay.player.getTime();
            coplay.player.seek(time);
            coplay.remote.send(pack('SEEK', time));
        });

        let restart = create('button', main, {
            id: getId('restart'),
            innerHTML: `${icons['restart']}`,
            title: 'Restart'
        });
        on(restart, 'click', function () {
            if (coplay.player.restart) {
                coplay.player.restart();
            } else {
                coplay.player.seek(0.001);
            }
            coplay.remote.send(pack('SEEK', 0));
        });

        let fullscreen = create('button', main, {
            id: getId('fullscreen'),
            innerHTML: `${icons['expand']}${icons['compress']}`,
            title: 'Toggle fullscreen'
        });
        on(fullscreen, 'click', function () {
            coplay.player.toggleFullscreen();
        });

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
                innerHTML: `${icons['call']}`,
                title: 'Start video call',
                disabled: true
            });
            on(call, 'click', function () {
                coplay.call(coplay.ui.remote.value);
            });
            coplay.ui.call = call;

            let hangUp = create('button', main, {
                id: getId('hang-up'),
                innerHTML: `${icons['cancel']}`,
                hidden: true,
                title: 'End video call'
            });
            on(hangUp, 'click', function () {
                coplay.hangUp();
            });
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
        console.log(coplayOptions);
        let defaultServer = coplayOptions.defaultServer;
        if (defaultServer) {
            peerOptions.host = 'coplay-server.herokuapp.com';
            peerOptions.path = '';
            peerOptions.port = 443;
            peerOptions.secure = true;
            peerOptions.key = 'peerjs';
        } else {
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
            coplay.media = null;
            if (coplay.stream) {
                coplay.stream.getTracks().forEach(track => track.stop());
                coplay.stream = null;
            }
        });
    }

    function connect(c) {
        coplay.connection = c;

        let ui = coplay.ui;
        ui.remote.value = c.peer;
        ui.remote.disabled = true;
        ui.connect.hidden = true;
        ui.disconnect.hidden = false;

        if (ui.call) {
            ui.call.disabled = false;
        }

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

            if (ui.call) {
                ui.call.disabled = true;
            }

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
        coplay.hangUp();
    };

    function getUserMedia(...args) {
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
        let remoteVideo = create('video', document.body, {
            id: 'coplay-remote-video',
            autoplay: true
        });
        let localVideo = create('video', document.body, {
            id: 'coplay-local-video',
            autoplay: true,
            muted: true
        });
        coplayDrag(remoteVideo);
        coplayDrag(localVideo);
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
            coplay.stream = stream;
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
        if (coplay.media) {
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
