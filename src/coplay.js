(function() {
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
      },
      debug: 3
    };

    console.log(coplayOptions);

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
