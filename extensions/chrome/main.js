const DOMAINS = [
    'youku.com',
    'sohu.com',
    'tudou.com',
    'qq.com',
    'iqiyi.com',
    'youtube.com',
    'bilibili.com'
];
let storage = chrome.storage.sync || chrome.storage.local;

function inject() {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
    }
    chrome.tabs.executeScript(null, { file: 'inject.js' });
    console.log('Injector executed.');
}

function checkAutoInject() {
    console.log('Initing...');
    storage.get({
        server: '',
        autoActivate: false
    }, item => {
        if (item.autoActivate) {
            let filters = DOMAINS.map(domain => {
                return { hostSuffix: domain };
            });
            chrome.webNavigation.onCompleted.addListener(inject, { url: filters });
            console.log('Auto injector bound.');
        } else {
            if (chrome.webNavigation.onCompleted.hasListener(inject)) {
                chrome.webNavigation.onCompleted.removeListener(inject);
                console.log('Auto injector removed.');
            }
        }
    });
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
