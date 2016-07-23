(function () {
    function loadScript(url, callback) {
        function doCallback() {
            if (typeof callback === 'function') {
                callback();
            }
        }

        var elem = document.createElement('script');
        elem.type = 'text/javascript';
        elem.charset = 'utf-8';
        if (elem.addEventListener) {
            elem.addEventListener('load', doCallback, false);
        } else { // IE
            elem.attachEvent('onreadystatechange', doCallback);
        }
        elem.src = url;
        document.getElementsByTagName('head')[0].appendChild(elem);
    }

    function loadStyle(url) {
        var elem = document.createElement('link');
        elem.rel = 'stylesheet';
        elem.type = 'text/css';
        elem.href = url;
        document.getElementsByTagName('head')[0].appendChild(elem);
    }

    function url(file) {
        return self.options.url[file];
    }

    function data(key, value) {
        var dataset = document.body.dataset;
        if (arguments.length === 0) {
            return dataset;
        } else if (arguments.length === 2) {
            dataset[key] = value;
        }
        return dataset[key];
    }

    let coplayOptions = {
        server: '',
        key: '',
        autoActivate: false
    };

    Object.assign(coplayOptions, self.options.coplayOptions);
    data('coplayOptions', JSON.stringify(coplayOptions));
    if (data('coplay')) {
        return;
    } else {
        data('coplay', true);
        loadStyle(url('coplay.css'));
        loadScript(url('peer.js'), () => {
            loadScript(url('drag.js'), () => {
                loadScript(url('coplay.js'));
            });
        });
    }
})();
