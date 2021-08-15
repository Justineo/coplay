(function() {
  'use strict';

  const icons = {"call":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1792 1792\"><path d=\"M1792 352v1088q0 42-39 59-13 5-25 5-27 0-45-19l-403-403v166q0 119-84.5 203.5T992 1536H288q-119 0-203.5-84.5T0 1248V544q0-119 84.5-203.5T288 256h704q119 0 203.5 84.5T1280 544v165l403-402q18-19 45-19 12 0 25 5 39 17 39 59z\"/></svg>","cancel":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1408 1792\"><path d=\"M1298 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68L976 960l294 294q28 28 28 68z\"/></svg>","compress":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1536 1792\"><path d=\"M768 960v448q0 26-19 45t-45 19-45-19l-144-144-332 332q-10 10-23 10t-23-10L23 1527q-10-10-10-23t10-23l332-332-144-144q-19-19-19-45t19-45 45-19h448q26 0 45 19t19 45zm755-672q0 13-10 23l-332 332 144 144q19 19 19 45t-19 45-45 19H832q-26 0-45-19t-19-45V384q0-26 19-45t45-19 45 19l144 144 332-332q10-10 23-10t23 10l114 114q10 10 10 23z\"/></svg>","expand":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1536 1792\"><path d=\"M755 1056q0 13-10 23l-332 332 144 144q19 19 19 45t-19 45-45 19H64q-26 0-45-19t-19-45v-448q0-26 19-45t45-19 45 19l144 144 332-332q10-10 23-10t23 10l114 114q10 10 10 23zm781-864v448q0 26-19 45t-45 19-45-19l-144-144-332 332q-10 10-23 10t-23-10L791 759q-10-10-10-23t10-23l332-332-144-144q-19-19-19-45t19-45 45-19h448q26 0 45 19t19 45z\"/></svg>","heart":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1792 1792\"><path d=\"M896 1664q-26 0-44-18l-624-602q-10-8-27.5-26T145 952.5 77 855 23.5 734 0 596q0-220 127-344t351-124q62 0 126.5 21.5t120 58T820 276t76 68q36-36 76-68t95.5-68.5 120-58T1314 128q224 0 351 124t127 344q0 221-229 450l-623 600q-18 18-44 18z\"/></svg>","pause":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1536 1792\"><path d=\"M1536 192v1408q0 26-19 45t-45 19H960q-26 0-45-19t-19-45V192q0-26 19-45t45-19h512q26 0 45 19t19 45zm-896 0v1408q0 26-19 45t-45 19H64q-26 0-45-19t-19-45V192q0-26 19-45t45-19h512q26 0 45 19t19 45z\"/></svg>","play":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1408 1792\"><path d=\"M1384 927L56 1665q-23 13-39.5 3T0 1632V160q0-26 16.5-36t39.5 3l1328 738q23 13 23 31t-23 31z\"/></svg>","plug":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1792 1792\"><path d=\"M1755 453q37 38 37 90.5t-37 90.5l-401 400 150 150-160 160q-163 163-389.5 186.5T543 1430l-362 362H0v-181l362-362q-124-185-100.5-411.5T448 448l160-160 150 150 400-401q38-37 91-37t90 37 37 90.5-37 90.5L939 619l234 234 401-400q38-37 91-37t90 37z\"/></svg>","restart":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1024 1792\"><path d=\"M979 141q19-19 32-13t13 32v1472q0 26-13 32t-32-13L269 941q-9-9-13-19v678q0 26-19 45t-45 19H64q-26 0-45-19t-19-45V192q0-26 19-45t45-19h128q26 0 45 19t19 45v678q4-10 13-19z\"/></svg>","sync":"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1536 1792\"><path d=\"M1511 1056q0 5-1 7-64 268-268 434.5T764 1664q-146 0-282.5-55T238 1452l-129 129q-19 19-45 19t-45-19-19-45v-448q0-26 19-45t45-19h448q26 0 45 19t19 45-19 45l-137 137q71 66 161 102t187 36q134 0 250-65t186-179q11-17 53-117 8-23 30-23h192q13 0 22.5 9.5t9.5 22.5zm25-800v448q0 26-19 45t-45 19h-448q-26 0-45-19t-19-45 19-45l138-138Q969 384 768 384q-134 0-250 65T332 628q-11 17-53 117-8 23-30 23H50q-13 0-22.5-9.5T18 736v-7q65-268 270-434.5T768 128q146 0 284 55.5T1297 340l130-129q19-19 45-19t45 19 19 45z\"/></svg>"};

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

  // Supported websites: Youku, SohuTV, Tudou, TencentVideo, iQiyi, YouTube, ACFun, bilibili, MGTV, Vimeo
  let host = location.host.match(
    /(?:^|\.)(youku\.com|sohu\.com|tudou\.com|qq\.com|iqiyi\.com|youtube\.com|acfun\.cn|bilibili\.com|mgtv\.com|vimeo\.com)(?:\/|$)/i
  );
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

  function on(elem, type, listener, noStop) {
    let prefixes = ['', 'webkit', 'moz'];
    let prefix = prefixes.find(
      prefix => elem['on' + prefix + type] !== undefined
    );
    elem.addEventListener(
      prefix + type,
      function(e) {
        listener.call(elem, e);
        if (!noStop) {
          e.preventDefault();
          e.stopPropagation();
        }
        return !!noStop;
      },
      false
    );
  }

  function off(elem, type, listener) {
    let prefixes = ['', 'webkit', 'moz'];
    let prefix = prefixes.find(
      prefix => elem['on' + prefix + type] !== undefined
    );
    elem.removeEventListener(prefix + type, listener);
  }

  function visible(elem) {
    return elem && elem.getClientRects().length !== 0;
  }

  function fullscreen() {
    return !!document.fullscreenElement;
  }

  function getFullscreenElement(doc) {
    doc = doc || document;
    return getDefined(
      doc.fullscreenElement,
      doc.webkitFullscreenElement,
      doc.mozFullScreenElement
    );
  }

  function pack(type, data) {
    let p = {
      type: type
    };
    if (data !== undefined) {
      p.data = data;
    }

    return p;
  }

  function findReactComponent(elem) {
    if (!elem) {
      return null;
    }
    for (let key in elem) {
      if (key.startsWith('__reactInternalInstance$')) {
        return elem[key]._currentElement._owner._instance;
      }
    }
    return null;
  }

  /**
   * Player adaptor layer
   */
  let playerAdaptor = {};
  playerAdaptor.youku = {
    prepare() {
      this._player = window.videoPlayer;
    },
    play() {
      this._player.play();
    },
    pause() {
      this._player.pause();
    },
    seek(sec) {
      this._player.seek(sec);
    },
    isReady() {
      return this._player.getProcessState() === 'playstart';
    },
    getTime() {
      return this._player.getCurrentTime();
    },
    toggleFullscreen() {
      if (fullscreen()) {
        this._player.exitFullscreen();
      } else {
        this._player.enterFullscreen();
      }
    }
  };
  playerAdaptor.tudou = {
    prepare() {
      this._player = query('video[data-canplay="play"]');
    },
    play() {
      this._player.play();
    },
    pause() {
      this._player.pause();
    },
    seek(sec) {
      this._player.currentTime = sec;
    },
    isReady() {
      return query('.adtime').textContent === '0';
    },
    getTime() {
      return this._player.currentTime;
    },
    toggleFullscreen() {
      query(
        `.control-${fullscreen() ? 'half' : 'full'}screen-icon`,
        this._player.parentNode
      ).click();
    }
  };
  playerAdaptor.qq = {
    prepare() {
      this._player = window.PLAYER;
    },
    play() {
      this._player.play();
    },
    pause() {
      this._player.pause();
    },
    seek(sec) {
      this._player.seekTo(sec);
    },
    isReady() {
      return this._player.getPlayerState() !== -1;
    },
    getTime() {
      return this._player.getCurrentTime();
    },
    toggleFullscreen() {
      if (fullscreen()) {
        this._player.exitWindowFullscreen();
      } else {
        this._player.enterWindowFullscreen();
      }
    }
  };
  playerAdaptor.iqiyi = {
    prepare() {
      this._player = query('.iqp-player video');
    },
    play() {
      this._player.play();
    },
    pause() {
      this._player.pause();
    },
    seek(sec) {
      this._player.currentTime = sec;
    },
    isReady() {
      return !visible(query('.cd-time'));
    },
    getTime() {
      return this._player.currentTime;
    },
    toggleFullscreen() {
      query('.iqp-btn-fullscreen').click();
    }
  };
  playerAdaptor.sohu = {
    prepare() {
      this._player = window._player;
    },
    play() {
      this._player.play();
    },
    pause() {
      this._player.pause();
    },
    seek(sec) {
      this._player.seek(sec);
    },
    isReady() {
      return true;
    },
    getTime() {
      return this._player.currentTime;
    },
    toggleFullscreen() {
      if (fullscreen()) {
        this._player.exitFullscreen();
      } else {
        this._player.requestFullscreen();
      }
    }
  };
  playerAdaptor.youtube = {
    prepare() {
      let player = get('movie_player');
      if (visible(player)) {
        this._player = player;
      }
    },
    play() {
      this._player.playVideo();
    },
    pause() {
      this._player.pauseVideo();
    },
    seek(sec) {
      this._player.seekTo(sec, true);
    },
    isReady() {
      return true;
    },
    getTime() {
      return this._player.getCurrentTime();
    },
    toggleFullscreen() {
      this._player.toggleFullscreen();
    }
  };
  playerAdaptor.acfun = {
    prepare() {
      this._player = window.player;
    },
    play() {
      this._player.play();
    },
    pause() {
      this._player.pause();
    },
    seek(sec) {
      this._player.seek(sec);
    },
    isReady() {
      return true;
    },
    getTime() {
      return this._player.currentTime;
    },
    toggleFullscreen() {
      query('.fullscreen-screen').click();
    }
  };
  playerAdaptor.bilibili = {
    prepare() {
      if (window.player) {
        Object.defineProperty(this, '_player', {
          get() {
            return window.player;
          }
        });
      }
    },
    play() {
      this._player.play();
    },
    pause() {
      this._player.pause();
    },
    seek(sec) {
      this._player.seek(sec);
    },
    isReady() {
      return true;
    },
    getTime() {
      return this._player.getCurrentTime();
    },
    toggleFullscreen() {
      query('.bilibili-player-video-btn-fullscreen').click();
    }
  };
  playerAdaptor.vimeo = {
    prepare() {
      let component = findReactComponent(query('[data-player="true"]'));
      if (!component) {
        return;
      }
      if ((this._player = component.getPlayer())) {
        create('style', document.body, {
          textContent: `#coplay.active #coplay-toggle {
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
    play() {
      this._player.play();
    },
    pause() {
      this._player.pause();
    },
    seek(sec) {
      this._player.seekTo(sec);
    },
    isReady() {
      return true;
    },
    getTime() {
      return this._player.currentTime;
    },
    toggleFullscreen() {
      query('.fullscreen').click();
    }
  };
  playerAdaptor.mgtv = {
    prepare() {
      this._player = MGTVPlayer.getPlayer();
    },
    play() {
      this._player.play();
    },
    pause() {
      this._player.pause();
    },
    seek(sec) {
      this._player.seek(sec);
    },
    isReady() {
      return this._player.state === 4;
    },
    getTime() {
      return this._player.currentTime;
    },
    toggleFullscreen() {
      if (fullscreen()) {
        this._player.exitFullscreen();
      } else {
        this._player.fullScreen();
      }
    }
  };

  let playerBase = {
    trigger(type, ...args) {
      if (typeof this['on' + type] === 'function') {
        this['on' + type](...args);
      }
    },
    init() {
      this.prepare();
      this.initFullscreen();
    },
    initFullscreen() {
      this._fullscreenChangeHandler = () => {
        let fsc = getFullscreenElement(document);
        let isFullscreen = !!fsc;
        let container = isFullscreen ? fsc : document.body;
        container.appendChild(coplay.ui.main);
        coplay.ui.fullscreen.classList.toggle('active', isFullscreen);
        this.trigger('fullscreenchange', isFullscreen);
      };
      on(document, 'fullscreenchange', this._fullscreenChangeHandler);
      this.trigger('fullscreeninit');
    },
    disposeFullscreen() {
      off(document, 'fullscreenchange', this._fullscreenChangeHandler);
    },
    toggleFullscreen() {}
  };

  function initPlayer(done) {
    let player = Object.assign({}, playerBase, playerAdaptor[host]);

    (function init() {
      player.init();
      if (player._player) {
        coplay.player = player;
        if (typeof done === 'function') {
          done();
        }
      } else {
        setTimeout(init, 500);
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
      className: coplayOptions.autoActivate === false ? '' : 'active'
    });

    const DRAGGING_CLASS = 'coplay-dragging';
    let toggle = create('button', main, {
      id: getId('toggle'),
      innerHTML: `${icons['heart']}`,
      title: 'Click to toggle, drag to move the control bar'
    });
    on(toggle, 'click', function() {
      if (!main.classList.contains(DRAGGING_CLASS)) {
        main.classList.toggle('active');
      }
    });
    mainDrag = coplayDrag(main, {
      handle: toggle,
      ondragstart() {
        this.target.classList.add(DRAGGING_CLASS);
      },
      ondragend() {
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
    on(local, 'focus', function() {
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
    on(connect, 'click', function() {
      coplay.connect(remote.value);
    });

    let disconnect = create('button', main, {
      id: getId('disconnect'),
      hidden: true,
      innerHTML: `${icons['cancel']}`
    });
    on(disconnect, 'click', function() {
      coplay.disconnect();
    });

    let play = create('button', main, {
      id: getId('play'),
      innerHTML: `${icons['play']}`,
      title: 'Play'
    });
    on(play, 'click', function() {
      coplay.player.play();
      coplay.remote.send(pack('PLAY'));
    });

    let pause = create('button', main, {
      id: getId('pause'),
      innerHTML: `${icons['pause']}`,
      title: 'Pause'
    });
    on(pause, 'click', function() {
      coplay.player.pause();
      coplay.remote.send(pack('PAUSE'));
    });

    let sync = create('button', main, {
      id: getId('sync'),
      innerHTML: `${icons['sync']}`,
      title: 'Sync with me'
    });
    on(sync, 'click', function() {
      let time = coplay.player.getTime();
      coplay.player.seek(time);
      coplay.remote.send(pack('SEEK', time));
    });

    let restart = create('button', main, {
      id: getId('restart'),
      innerHTML: `${icons['restart']}`,
      title: 'Restart'
    });
    on(restart, 'click', function() {
      if (coplay.player.restart) {
        coplay.player.restart();
      } else {
        coplay.player.seek(0.001);
        coplay.player.play();
      }
      coplay.remote.send(pack('SEEK', 0));
    });

    let fullscreen = create('button', main, {
      id: getId('fullscreen'),
      innerHTML: `${icons['expand']}${icons['compress']}`,
      title: 'Toggle fullscreen'
    });
    on(fullscreen, 'click', function() {
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
      on(call, 'click', function() {
        coplay.call(coplay.ui.remote.value);
      });
      coplay.ui.call = call;

      let hangUp = create('button', main, {
        id: getId('hang-up'),
        innerHTML: `${icons['cancel']}`,
        hidden: true,
        title: 'End video call'
      });
      on(hangUp, 'click', function() {
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
    if (!coplay.player.isReady()) {
      coplay.disable();
      (function wait() {
        if (coplay.player.isReady()) {
          coplay.enable();
        } else {
          setTimeout(wait, 500);
        }
      })();
    }
  }

  coplay.remote = {
    send(...args) {
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
          {
            url: 'turn:numb.viagenie.ca',
            credential: 'muazkh',
            username: 'webrtc@live.com'
          },
          {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          },
          {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
          }
        ]
      }
    };

    console.log(coplayOptions);

    let server = coplayOptions.server;
    if (server) {
      let url = parseURL(server);
      peerOptions.host = url.host || undefined;
      peerOptions.path = url.path || undefined;
      peerOptions.port = url.port || 443;

      if (url.protocol === 'https:') {
        peerOptions.secure = true;
      }
      if (coplayOptions.key) {
        peerOptions.key = coplayOptions.key;
      }
    } else {
      peerOptions.host = 'coplay-server.herokuapp.com';
      peerOptions.path = '';
      peerOptions.port = 443;
      peerOptions.secure = true;
      peerOptions.key = 'peerjs';
    }

    let peer = new Peer(peerOptions);

    peer.on('open', function(id) {
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

    c.on('data', function(p) {
      let player = coplay.player;
      switch (p.type) {
        case 'REQ':
          c.send(pack('ACK'));
          break;
        case 'ACK':
          round = Date.now() - start;
          count++;
          elapsed += round;
          setTimeout(function() {
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

    c.on('close', function() {
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

  coplay.init = function() {
    let main = get(id);
    if (!main) {
      initPlayer(function() {
        initUI();
        initPeer();
      });
    }
  };

  coplay.setDisabled = function(isDisabled) {
    let ui = coplay.ui;
    ui.play.disabled = isDisabled;
    ui.pause.disabled = isDisabled;
    ui.sync.disabled = isDisabled;
    ui.restart.disabled = isDisabled;
    ui.fullscreen.disabled = isDisabled;
  };

  coplay.enable = function() {
    coplay.setDisabled(false);
  };

  coplay.disable = function() {
    coplay.setDisabled(true);
  };

  coplay.connect = function(remote) {
    let c = coplay.peer.connect(remote, {
      label: 'coplay',
      serialization: 'json',
      reliable: false
    });

    c.on('open', function() {
      connect(c);
    });
  };

  coplay.disconnect = function() {
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
    on(document, 'fullscreenchange', function() {
      if (remoteVideo.src) {
        remoteVideo.play();
      }
      if (localVideo.src) {
        localVideo.play();
      }
    });
  }

  coplay.call = function(remote) {
    getUserMedia(
      {
        video: true,
        audio: true
      },
      stream => {
        coplay.stream = stream;
        initVideoCallPlayers();
        coplay.ui.localVideo.src = window.URL.createObjectURL(stream);
        if (typeof remote === 'string') {
          // peer id
          let media = coplay.peer.call(remote, stream);
          prepareMedia(media);
        } else {
          // MediaConnection
          remote.answer(stream);
        }
      },
      err => console.error
    );
  };

  coplay.hangUp = function() {
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
