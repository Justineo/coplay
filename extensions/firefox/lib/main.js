buttons = require('sdk/ui/button/action');
var tabs = require('sdk/tabs');
var self = require('sdk/self');

var button = buttons.ActionButton({
  id: 'coplay',
  label: 'Activate coplay',
  icon: {
    '16': './coplay.png',
    '32': './coplay.png',
    '64': './coplay.png'
  },
  onClick: function () {
    var worker = tabs.activeTab.attach({
      contentScriptFile: self.data.url('./inject.js'),
      contentScriptOptions: {
        url: {
          'run.js': self.data.url('./run.js'),
          'peer.min.js': self.data.url('./peer.min.js'),
          'coplay.js': self.data.url('./coplay.js'),
          'coplay.css': self.data.url('./coplay.css')
        }
      }
    });
  }
});
