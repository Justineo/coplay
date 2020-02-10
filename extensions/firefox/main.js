let storage = chrome.storage.sync || chrome.storage.local;

function inject() {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError.message);
  }
  chrome.tabs.executeScript(null, { file: 'inject.js', allFrames: true });
  console.log('Injector executed.');
}

function checkAutoInject() {
  console.log('Initing...');
  storage.get(
    {
      server: '',
      autoActivate: true
    },
    item => {
      if (item.autoActivate) {
        chrome.webNavigation.onCompleted.addListener(inject, {
          url: [
            {
              urlMatches:
                '(?:^|.)(youku.com|sohu.com|tudou.com|qq.com|iqiyi.com|youtube.com|acfun.cn|bilibili.com|mgtv.com|vimeo.com)(?:/|$)'
            }
          ]
        });
        console.log('Auto injector bound.');
      } else {
        if (chrome.webNavigation.onCompleted.hasListener(inject)) {
          chrome.webNavigation.onCompleted.removeListener(inject);
          console.log('Auto injector removed.');
        }
      }
    }
  );
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message.event === 'optionschange') {
    console.log('Options changed and re-init...');
    checkAutoInject();
    respond({ success: true });
  }
});

chrome.browserAction.onClicked.addListener(inject);
console.log('Action injector bound.');
checkAutoInject();
