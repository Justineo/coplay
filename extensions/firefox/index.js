let buttons = require('sdk/ui/button/action');
let tabs = require('sdk/tabs');
let self = require('sdk/self');
let prefs = require('sdk/simple-prefs');
let options = prefs.prefs;
let pageMod = require('sdk/page-mod');

const DOMAINS = [
    'youku.com',
    'sohu.com',
    'tudou.com',
    'qq.com',
    'iqiyi.com',
    'youtube.com',
    'bilibili.com',
    'le.com',
    'vimeo.com'
];

let urlOptions = {
  'run.js': self.data.url('./run.js'),
  'peer.js': self.data.url('./peer.js'),
  'drag.js': self.data.url('./drag.js'),
  'coplay.js': self.data.url('./coplay.js'),
  'coplay.css': self.data.url('./coplay.css')
};
let contentScriptConfig = {
  contentScriptFile: self.data.url('./inject.js')
};

function getCoplayOptions() {
  return {
    server: options.server,
    key: options.key,
    autoActivate: options.autoActivate
  };
}

let mod;
let domains = DOMAINS
  .map(domain => `*.${domain}`)
  .reduce((prev, current) => prev.concat([current]), []);
function checkAutoInject() {
  if (options.autoActivate) {
    console.log('Create PageMod');
    mod = pageMod.PageMod(Object.assign({
      include: domains
    }, contentScriptConfig, {
      contentScriptOptions: {
        url: urlOptions,
        coplayOptions: getCoplayOptions()
      }
    }));
  } else {
    if (mod) {
      console.log('Destroy PageMod');
      mod.destroy();
    }
  }
}

let button = buttons.ActionButton({
  id: 'coplay',
  label: 'Activate coplay',
  icon: {
    '16': './coplay.png',
    '32': './coplay.png',
    '64': './coplay.png'
  },
  onClick: () => {
    tabs.activeTab.attach(Object.assign({}, contentScriptConfig, {
      contentScriptOptions: {
        url: urlOptions,
        coplayOptions: getCoplayOptions()
      }
    }));
  }
});

prefs.on('', checkAutoInject);
checkAutoInject();
