let storage = chrome.storage.sync || chrome.storage.local;
let server = get('server');
let defaultServer = get('default-server');
let key = get('key');
let autoActivate = get('auto-activate');

function get(id) {
    return document.getElementById(id) || id;
}

function on(elem, type, listener) {
    get(elem).addEventListener(type, listener, false);
}

function restore() {
    storage.get({
        defaultServer: false,
        server: '',
        key: '',
        autoActivate: false
    }, item => {
        defaultServer.checked = item.defaultServer;
        server.value = item.server;
        server.disabled = item.defaultServer;
        key.value = item.key;
        key.disabled = item.defaultServer;
        autoActivate.checked = item.autoActivate;
    });
}

function save() {
    storage.set({
        defaultServer: defaultServer.checked,
        server: server.value,
        key: key.value,
        autoActivate: autoActivate.checked
    }, () => {
        chrome.runtime.sendMessage({ event: 'optionschange' }, response => {
            if (response.success) {
                window.close();
            }
        });
    });
}

function cancel() {
    window.close();
}

function toggleDefault() {
    server.disabled = key.disabled = this.checked;
}

on(defaultServer, 'change', toggleDefault);
on('save', 'click', save);
on('cancel', 'click', cancel);
restore();
