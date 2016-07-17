/**
 * @file drag.js
 * @author Justineo(justice360@gmail.com)
 */
(function () {
    var events = {};

    var vendorProps = {
        'user-select': ['-webkit-', '-moz-', '-ms-'],
        'transform': ['-webkit-', '-moz-', '-ms-'],
        'transition': ['-webkit-', '-moz-', '-ms-']
    };

    var prefixMap = {
        '-webkit-': 'webkit',
        '-moz-': 'Moz',
        '-ms-': 'ms'
    };

    for (var prop in vendorProps) {
        getSupportedAccessor(prop);
    }

    var regMatrix = /(matrix\((?:[^,]+,){4})([^,]+),([^,]+)(\))/i;
    var regMatrix3d = /(matrix3d\((?:[^,]+,){12})([^,]+),([^,]+)(,[^,]+,[^,]+\))/i;

    var translateMode = getSupportedAccessor('transform') ? 'transform' : 'offset';

    function convert(prop) {
        return prop.toLowerCase().replace(/(-\w+-)?([\w-]+)/, function (whole, prefix, standard) {
            prefix = prefix ? prefixMap[prefix] : '';
            var remain = (prefix ? '-' : '') + standard;
            return prefix + remain.replace(/-(\w)/g, function (matched, initial) {
                return initial.toUpperCase();
            });
        });
    }

    function getSupportedAccessor(prop) {
        var accessor = convert(prop);
        var prefixes = vendorProps[prop];
        if (!prefixes) {
            return prop;
        }
        if (typeof prefixes === 'string') {
            return convert(prefixes);
        }
        var elem = document.createElement('div');
        if (elem.style[accessor] !== undefined) {
            vendorProps[prop] = prop;
            return accessor;
        }
        for (var i = 0, j = prefixes.length; i < j; i++) {
            var prefix = prefixes[i];
            var prefixed = convert(prefix + prop);
            if (elem.style[prefixed] !== undefined) {
                vendorProps[prop] = prefix + prop;
                return prefixed;
            }
        }
        return null;
    }

    function getTransform(elem, isComputed) {
        var transform;
        var accessor = getSupportedAccessor('transform');
        if (isComputed) {
            transform = getComputed(elem, accessor);
        } else {
            transform = elem.style[accessor];
        }
        return transform;
    }

    function getScrollOffsets() {
        var result;
        if (window.scrollX !== undefined) {
            result = {
                x: window.scrollX,
                y: window.scrollY
            };
        } else if (window.pageXOffset !== undefined) {
            result = {
                x: window.pageXOffset,
                y: window.pageYOffset
            };
        } else if (document.compatMode === 'CSS1Compat') {
            result = {
                x: doc.scrollLeft,
                y: doc.scrollTop
            };
        } else {
            result = {
                x: document.body.scrollLeft,
                y: document.body.scrollTop
            };
        }
        return result;
    }

    function on(elem, type, listener) {
        if (elem.addEventListener) {
            elem.addEventListener(type, listener, false);
        }
        else if (elem.attachEvent) {
            elem.attachEvent('on' + type, listener);
        }
    }

    function off(elem, type, listener) {
        if (elem.removeEventListener) {
            elem.removeEventListener(type, listener, false);
        }
        else if (elem.attachEvent) {
            elem.detachEvent('on' + type, listener);
        }
    }

    function extend(target, source) {
        for (var key in source) {
            target[key] = source[key];
        }
        return target;
    }

    function attr(elem, attr, value) {
        if (arguments.length === 2) {
            return elem.getAttribute(attr);
        }

        if (value === null) {
            elem.removeAttribute(attr);
        } else {
            elem.setAttribute(attr, value);
        }
        return value;
    }

    function getComputed(elem, prop) {
        var getter = document.defaultView && document.defaultView.getComputedStyle;
        if (getter) {
            if (prop) {
                var accessor = getSupportedAccessor(prop);
                if (accessor) {
                    return getter(elem)[accessor];
                }
                return getter(elem)[prop];
            }
            return getter(elem);
        } else if (elem.currentStyle) {
            if (prop) {
                return elem.currentStyle[prop];
            }
            return elem.currentStyle;
        }
    }

    function getCSSText(elem) {
        if (typeof elem.style.cssText !== 'undefined') {
            return elem.style.cssText;
        }
        return attr(elem, 'style');
    }

    function addStyles(elem, styles, isReplace) {
        var cssText = '';
        if (typeof styles === 'object') {
            for (var prop in styles) {
                if (prop in vendorProps) {
                    cssText += ';' + vendorProps[prop] + ':' + styles[prop];
                } else {
                    cssText += ';' + prop + ':' + styles[prop];
                }
            }
        } else if (typeof styles ==='string') {
            cssText = styles;
        }
        if (typeof elem.style.cssText !== 'undefined') {
            elem.style.cssText = (isReplace ? '' : elem.style.cssText) + cssText;
        } else {
            attr(elem, 'style', (isReplace ? '' : attr(elem, 'style')) + cssText);
        }
    }

    function removeStyles(elem) {
        if (typeof elem.style.cssText !== 'undefined') {
            elem.style.cssText = '';
        } else {
            attr(elem, 'style', '');
        }
    }

    function extractNonPxLength(value) {
        var match = value.match(/^((?:[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)))((?!px)[a-z%]+)$/i);
        if (match) {
            return {
                value: parseFloat(match[1]),
                unit: match[2].toLowerCase()
            };
        }
        return null;
    }

    function bind(fn, newThis) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return fn.apply(newThis, args.concat(slice.call(arguments)));
        };
    }

    var ID_KEY = 'data-drag-id';
    var ID_DOC = '__doc__';
    var guid = 0;
    var util = {
        guid: function () {
            return guid++;
        },

        on: function (elem, type, listener) {
            var id = attr(elem, ID_KEY) || ID_DOC;
            if (!events[id]) {
                events[id] = {};
            }

            if (!events[id][type]) {
                events[id][type] = [];
            }
            events[id][type].push(listener);
            on(elem, type, listener);
        },

        off: function (elem, type, listener) {
            var id = attr(elem, ID_KEY) || ID_DOC;
            var listeners = events[id];

            if (!type) {
                // remove all event listeners on the element
                for (var t in listeners) {
                    for (var i = 0, j = listeners[t].length; i < j; i++) {
                        off(elem, t, listeners[t][i]);
                    }
                    delete listeners[t];
                }
                delete events[id];
            } else if (!listener) {
                for (var i = 0, j = listeners[type].length; i < j; i++) {
                    off(elem, type, listeners[type][i]);
                }
                delete listeners[type];
            }
        }
    };

    function Draggable(target, options) {
        this.target = target;

        if (options && typeof options === 'object') {
            extend(this, options);
        }
    }

    var doc = document.documentElement;
    Draggable.prototype.init = function () {
        var target = this.target;

        if (attr(target, ID_KEY)) {
            throw new Error('The element is already draggable!');
        }

        this.id = util.guid();
        attr(target, ID_KEY, this.id);

        // save current style attribute to recover later
        this.oldStyle = getCSSText(target);
        this.oldDocStyle = getCSSText(doc);

        target.style.cursor = 'default';

        this.handle = this.handle || target;
        util.on(this.handle, 'mousedown', bind(start, this));
    };

    Draggable.prototype.dispose = function () {
        util.off(this.target);
        util.off(doc);
        attr(this.target, ID_KEY, null);
        this.reset();
    };

    Draggable.prototype.reset = function () {
        addStyles(this.target, this.oldStyle, true);
    };

    function start(e) {
        var target = this.target;
        this.__starting__ = true;
        addStyles(doc, {
            'user-select': 'none'
        });
        if (getSupportedAccessor('user-select') === null) {
            this.oldSelectstart = document.onselectstart;
            document.onselectstart = function () {
                return false;
            };
        }

        // log current cursor coodinates
        this.cursor = {
            x: e.clientX,
            y: e.clientY
        };

        target.style.cursor = 'move';
        var newStyle = {};

        if (translateMode === 'transform') {
            var transform = (getTransform(target, true) || '').replace(/\s+/g, '');
            var matched;
            if ((matched = transform.match(regMatrix)) || (matched = transform.match(regMatrix3d))) {
                this.offset = {
                    x: parseFloat(matched[2]),
                    y: parseFloat(matched[3])
                };
            } else {
                this.offset = {
                    x: 0,
                    y: 0
                };

                newStyle = {
                    transform: 'translate(0, 0)'
                };
            }
        }

        addStyles(target, newStyle);

        // drag can cause scroll so scroll offsets also have to be logged
        this.scroll = getScrollOffsets();

        // lock `transition` to none to prevent lag while tracking
        var transitionAccessor = getSupportedAccessor('transition');
        if (transitionAccessor) {
            var oldTransition = this.target.style[transitionAccessor];
            this.oldTransition = oldTransition;
            this.target.style[transitionAccessor] = 'none';
        }

        util.on(doc, 'mousemove', bind(track, this));
        util.on(doc, 'mouseup', bind(stop, this));
    }

    function track(e) {
        // mouse move deltas
        var dx = e.clientX - this.cursor.x;
        var dy = e.clientY - this.cursor.y;
        this.cursor.x = e.clientX;
        this.cursor.y = e.clientY;

        // scroll deltas
        var scroll = getScrollOffsets();
        var dsx = scroll.x - this.scroll.x;
        var dsy = scroll.y - this.scroll.y;
        this.scroll = scroll;

        if (this.__starting__ && typeof this.ondragstart === 'function') {
            if (this.ondragstart() === false) {
                stop.call(this);
                return;
            }
        }

        this.__starting__ = false;

        // accumulate delta values
        this.offset.x += dx + dsx;
        this.offset.y += dy + dsy;

        locate(this.target, this.offset);

        if (typeof this.ondragprogress === 'function') {
            this.ondragprogress();
        }
    }

    function stop(e) {
        this.target.style.cursor = 'default';
        var transitionAccessor = getSupportedAccessor('transition');
        if (transitionAccessor) {
            this.target.style[transitionAccessor] = this.oldTransition || '';
        }
        if (this.oldSelectstart) {
            document.onselectstart = this.oldSelectstart;
        }
        addStyles(doc, this.oldDocStyle, true);
        util.off(doc);
        if (typeof this.ondragend === 'function') {
            this.ondragend();
        }
    }

    function locate(elem, offset) {
        function replaceTransform(whole, before, x, y, after) {
            return before + offset.x + ', ' + offset.y + after;
        }

        if (translateMode === 'transform') {
            var transform = getTransform(elem, true).replace(/\s+/g, '');
            var newTransform;

            if (transform.match(regMatrix)) {
                newTransform = transform.replace(regMatrix, replaceTransform);
            } else if (transform.match(regMatrix3d)) {
                newTransform = transform.replace(regMatrix3d, replaceTransform);
            }
            addStyles(elem, {
                transform: newTransform
            });
        }
    }

    var drag = function (target, options) {
        var wrapped = new Draggable(target, options);
        wrapped.init();
        return wrapped;
    };

    // Everything is ready, export the whole module
    window.coplayDrag = drag;
})();
