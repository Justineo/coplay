let storage = chrome.storage.sync || chrome.storage.local;
let server = get('server');
let key = get('key');
let autoActivate = get('auto-activate');

function get(id) {
  return document.getElementById(id) || id;
}

function on(elem, type, listener) {
  get(elem).addEventListener(type, listener, false);
}

function restore() {
  storage.get(
    {
      server: '',
      key: '',
      autoActivate: true
    },
    item => {
      server.value = item.server;
      key.value = item.key;
      autoActivate.checked = item.autoActivate;
    }
  );
}

function save() {
  storage.set(
    {
      server: server.value,
      key: key.value,
      autoActivate: autoActivate.checked
    },
    () => {
      chrome.runtime.sendMessage({ event: 'optionschange' }, response => {
        if (response.success) {
          window.close();
        }
      });
    }
  );
}

function cancel() {
  window.close();
}

on('save', 'click', save);
on('cancel', 'click', cancel);
restore();
