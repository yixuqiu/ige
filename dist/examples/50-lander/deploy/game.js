"use strict";
function printStackTrace(t) {
    t = t || { guess: !0 };
    for (var i = t.e || null, e = !!t.guess, o = new printStackTrace.implementation(), s = o.run(i), n = e ? o.guessAnonymousFunctions(s) : s, r = 0; 4 > r; r++)
        n.shift();
    return n;
}
(printStackTrace.implementation = function () { }),
    (printStackTrace.implementation.prototype = {
        run: function (t) {
            t = t || this.createException();
            var i = this.mode(t);
            return i === "other" ? this.other(arguments.callee) : this[i](t);
        },
        createException: function () {
            try {
                return this.undef(), null;
            }
            catch (t) {
                return t;
            }
        },
        mode: function (t) {
            return (this._renderMode =
                t.arguments && t.stack
                    ? "chrome"
                    : t.message && typeof window != "undefined" && window.opera
                        ? t.stacktrace
                            ? "opera10"
                            : "opera"
                        : t.stack
                            ? "firefox"
                            : "other");
        },
        instrumentFunction: function (t, i, e) {
            t = t || window;
            var o = t[i];
            (t[i] = function () {
                return e.call(this, printStackTrace().slice(4)), t[i]._instrumented.apply(this, arguments);
            }),
                (t[i]._instrumented = o);
        },
        deinstrumentFunction: function (t, i) {
            t[i].constructor === Function &&
                t[i]._instrumented &&
                t[i]._instrumented.constructor === Function &&
                (t[i] = t[i]._instrumented);
        },
        chrome: function (t) {
            var i = (t.stack + "\n")
                .replace(/^\S[^\(]+?[\n$]/gm, "")
                .replace(/^\s+at\s+/gm, "")
                .replace(/^([^\(]+?)([\n$])/gm, "{anonymous}()@$1$2")
                .replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, "{anonymous}()@$1")
                .split("\n");
            return i.pop(), i;
        },
        firefox: function (t) {
            return t.stack
                .replace(/(?:\n@:0)?\s+$/m, "")
                .replace(/^\(/gm, "{anonymous}(")
                .split("\n");
        },
        opera10: function (t) {
            var i, e, o, s = t.stacktrace, n = s.split("\n"), r = "{anonymous}", a = /.*line (\d+), column (\d+) in ((<anonymous function\:?\s*(\S+))|([^\(]+)\([^\)]*\))(?: in )?(.*)\s*$/i;
            for (i = 2, e = 0, o = n.length; o - 2 > i; i++)
                if (a.test(n[i])) {
                    var h = RegExp.$6 + ":" + RegExp.$1 + ":" + RegExp.$2, l = RegExp.$3;
                    (l = l.replace(/<anonymous function\:?\s?(\S+)?>/g, r)), (n[e++] = l + "@" + h);
                }
            return n.splice(e, n.length - e), n;
        },
        opera: function (t) {
            var i, e, o, s = t.message.split("\n"), n = "{anonymous}", r = /Line\s+(\d+).*script\s+(http\S+)(?:.*in\s+function\s+(\S+))?/i;
            for (i = 4, e = 0, o = s.length; o > i; i += 2)
                r.test(s[i]) &&
                    (s[e++] =
                        (RegExp.$3
                            ? RegExp.$3 + "()@" + RegExp.$2 + RegExp.$1
                            : n + "()@" + RegExp.$2 + ":" + RegExp.$1) +
                            " -- " +
                            s[i + 1].replace(/^\s+/, ""));
            return s.splice(e, s.length - e), s;
        },
        other: function (t) {
            var i, e, o = "{anonymous}", s = /function\s*([\w\-$]+)?\s*\(/i, n = [], r = 10;
            while (t && r > n.length)
                (i = s.test(t + "") ? RegExp.$1 || o : o),
                    (e = Array.prototype.slice.call(t.arguments || [])),
                    (n[n.length] = i + "(" + this.stringifyArguments(e) + ")"),
                    (t = t.caller);
            return n;
        },
        stringifyArguments: function (t) {
            for (var i = Array.prototype.slice, e = 0; t.length > e; ++e) {
                var o = t[e];
                o === void 0
                    ? (t[e] = "undefined")
                    : o === null
                        ? (t[e] = "null")
                        : o.constructor &&
                            (o.constructor === Array
                                ? (t[e] =
                                    3 > o.length
                                        ? "[" + this.stringifyArguments(o) + "]"
                                        : "[" +
                                            this.stringifyArguments(i.call(o, 0, 1)) +
                                            "..." +
                                            this.stringifyArguments(i.call(o, -1)) +
                                            "]")
                                : o.constructor === Object
                                    ? (t[e] = "#object")
                                    : o.constructor === Function
                                        ? (t[e] = "#function")
                                        : o.constructor === String && (t[e] = '"' + o + '"'));
            }
            return t.join(",");
        },
        sourceCache: {},
        ajax: function (t) {
            var i = this.createXMLHTTPObject();
            if (i)
                return i.open("GET", t, !1), i.send(""), i.responseText;
        },
        createXMLHTTPObject: function () {
            for (var t, i = [
                function () {
                    return new XMLHttpRequest();
                },
                function () {
                    return new ActiveXObject("Msxml2.XMLHTTP");
                },
                function () {
                    return new ActiveXObject("Msxml3.XMLHTTP");
                },
                function () {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                }
            ], e = 0; i.length > e; e++)
                try {
                    return (t = i[e]()), (this.createXMLHTTPObject = i[e]), t;
                }
                catch (o) { }
        },
        isSameDomain: function (t) {
            return t.indexOf(location.hostname) !== -1;
        },
        getSource: function (t) {
            return t in this.sourceCache || (this.sourceCache[t] = this.ajax(t).split("\n")), this.sourceCache[t];
        },
        guessAnonymousFunctions: function (t) {
            for (var i = 0; t.length > i; ++i) {
                var e = /\{anonymous\}\(.*\)@(\w+:\/\/([\-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/, o = t[i], s = e.exec(o);
                if (s) {
                    var n = s[1], r = s[4], a = s[7] || 0;
                    if (n && this.isSameDomain(n) && r) {
                        var h = this.guessAnonymousFunction(n, r, a);
                        t[i] = o.replace("{anonymous}", h);
                    }
                }
            }
            return t;
        },
        guessAnonymousFunction: function (t, i) {
            var e;
            try {
                e = this.findFunctionName(this.getSource(t), i);
            }
            catch (o) {
                e = "getSource failed with url: " + t + ", exception: " + (o + "");
            }
            return e;
        },
        findFunctionName: function (t, i) {
            for (var e, o, s = /function\s+([^(]*?)\s*\(([^)]*)\)/, n = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/, r = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/, a = "", h = 10, l = 0; h > l; ++l)
                if ((e = t[i - l])) {
                    if (((a = e + a), (o = n.exec(a)), o && o[1]))
                        return o[1];
                    if (((o = s.exec(a)), o && o[1]))
                        return o[1];
                    if (((o = r.exec(a)), o && o[1]))
                        return o[1];
                }
            return "(?)";
        }
    }),
    (ige = null),
    (igeVersion = "v1.5.2@2014-01-24.001"),
    (igeClassStore = {}),
    (igeConfig = {
        debug: {
            _enabled: !0,
            _node: typeof module != "undefined" && module.exports !== void 0,
            _level: ["log", "warning", "error"],
            _stacks: !0,
            _throwErrors: !0,
            _timing: !0,
            enabled: function (t) {
                return t !== void 0
                    ? ((this._enabled = t), t || ((this._timing = !1), ige && ige.showStats(0)), this)
                    : this._enabled;
            }
        }
    }),
    igeConfig.debug._node && (igeConfig.debug._util = require("util")),
    Object.defineProperty(Object.prototype, "tween", { enumerable: !1, writable: !0, configurable: !0 }),
    (Object.prototype.tween = function (t, i, e) {
        var o = new $i_52().targetObj(this).properties(t).duration(i);
        return (e &&
            (e.beforeTween && o.beforeTween(e.beforeTween),
                e.afterTween && o.afterTween(e.afterTween),
                e.easing && o.easing(e.easing),
                e.startTime && o.startTime(e.startTime)),
            o);
    }),
    Object.defineProperty(Object.prototype, "theSameAs", { enumerable: !1, writable: !0, configurable: !0 }),
    (Object.prototype.theSameAs = function (t) {
        return JSON.stringify(this) === JSON.stringify(t);
    }),
    Object.defineProperty(Array.prototype, "clone", { enumerable: !1, writable: !0, configurable: !0 }),
    (Array.prototype.clone = function () {
        var t, i = [];
        for (t in this)
            this.hasOwnProperty(t) && (i[t] = this[t] instanceof Array ? this[t].clone() : this[t]);
        return i;
    }),
    Object.defineProperty(Array.prototype, "pull", { enumerable: !1, writable: !0, configurable: !0 }),
    (Array.prototype.pull = function (t) {
        var i = this.indexOf(t);
        return i > -1 ? (this.splice(i, 1), i) : -1;
    }),
    Object.defineProperty(Array.prototype, "pushUnique", { enumerable: !1, writable: !0, configurable: !0 }),
    (Array.prototype.pushUnique = function (t) {
        var i = this.indexOf(t);
        return i === -1 ? (this.push(t), !0) : !1;
    }),
    Object.defineProperty(Array.prototype, "each", { enumerable: !1, writable: !0, configurable: !0 }),
    (Array.prototype.each = function (t) {
        var i, e = this.length;
        for (i = 0; e > i; i++)
            t(this[i]);
    }),
    Object.defineProperty(Array.prototype, "eachReverse", { enumerable: !1, writable: !0, configurable: !0 }),
    (Array.prototype.eachReverse = function (t) {
        var i, e = this.length;
        for (i = e - 1; i >= 0; i--)
            t(this[i]);
    }),
    Object.defineProperty(Array.prototype, "destroyAll", { enumerable: !1, writable: !0, configurable: !0 }),
    (Array.prototype.destroyAll = function () {
        var t, i = this.length;
        for (t = i - 1; t >= 0; t--)
            typeof this[t].destroy == "function" && this[t].destroy();
    }),
    Object.defineProperty(Array.prototype, "eachIsolated", { enumerable: !1, writable: !0, configurable: !0 }),
    (Array.prototype.eachIsolated = function (t) {
        var i, e = [], o = e.length;
        for (i = 0; o > i; i++)
            e[i] = this[i];
        for (i = 0; o > i; i++)
            t(e[i]);
    }),
    Object.defineProperty(Math, "PI180", { enumerable: !1, writable: !0, configurable: !0 }),
    (Math.PI180 = Math.PI / 180),
    Object.defineProperty(Math, "PI180R", { enumerable: !1, writable: !0, configurable: !0 }),
    (Math.PI180R = 180 / Math.PI),
    Object.defineProperty(Math, "toIso", { enumerable: !1, writable: !0, configurable: !0 }),
    (Math.toIso = function (t, i, e) {
        var o = t - i, s = -e * 1.2247 + (t + i) * 0.5;
        return { x: o, y: s };
    }),
    Object.defineProperty(Math, "radians", { enumerable: !1, writable: !0, configurable: !0 }),
    (Math.radians = function (t) {
        return t * Math.PI180;
    }),
    Object.defineProperty(Math, "degrees", { enumerable: !1, writable: !0, configurable: !0 }),
    (Math.degrees = function (t) {
        return t * Math.PI180R;
    }),
    Object.defineProperty(Math, "distance", { enumerable: !1, writable: !0, configurable: !0 }),
    (Math.distance = function (t, i, e, o) {
        return Math.sqrt((t - e) * (t - e) + (i - o) * (i - o));
    }),
    typeof CanvasRenderingContext2D != "undefined" &&
        (Object.defineProperty(CanvasRenderingContext2D.prototype, "circle", {
            enumerable: !1,
            writable: !0,
            configurable: !0
        }),
            Object.defineProperty(CanvasRenderingContext2D.prototype, "strokeCircle", {
                enumerable: !1,
                writable: !0,
                configurable: !0
            }),
            Object.defineProperty(CanvasRenderingContext2D.prototype, "fillCircle", {
                enumerable: !1,
                writable: !0,
                configurable: !0
            }),
            (CanvasRenderingContext2D.prototype.circle = function (t, i, e) {
                this.arc(t, i, e, 0, 2 * Math.PI, !1);
            }),
            (CanvasRenderingContext2D.prototype.strokeCircle = function (t, i, e) {
                this.save(), this.beginPath(), this.arc(t, i, e, 0, 2 * Math.PI, !1), this.stroke(), this.restore();
            }),
            (CanvasRenderingContext2D.prototype.fillCircle = function (t, i, e) {
                this.save(), this.beginPath(), this.arc(t, i, e, 0, 2 * Math.PI, !1), this.fill(), this.restore();
            })),
    typeof ImageData != "undefined" &&
        (Object.defineProperty(ImageData.prototype, "pixelAt", { enumerable: !1, writable: !0, configurable: !0 }),
            (ImageData.prototype.pixelAt = function (t, i) {
                var e = this.data, o = i * this.width * 4 + t * 4;
                return { r: e[o], g: e[o + 1], b: e[o + 2], a: e[o + 3] };
            }),
            Object.defineProperty(ImageData.prototype, "isTransparent", { enumerable: !1, writable: !0, configurable: !0 }),
            (ImageData.prototype.isTransparent = function (t, i) {
                var e = this.data, o = i * this.width * 4 + t * 4;
                return e[o + 3] === 0;
            }),
            Object.defineProperty(ImageData.prototype, "makeTransparent", {
                enumerable: !1,
                writable: !0,
                configurable: !0
            }),
            (ImageData.prototype.makeTransparent = function (t, i) {
                var e = this.data, o = i * this.width * 4 + t * 4;
                e[o + 3] = 0;
            }));
var disableContextMenu = function (t) {
    t !== null &&
        (t.oncontextmenu = function () {
            return !1;
        });
};
Array.prototype.indexOf ||
    (Object.defineProperty(Array.prototype, "indexOf", { enumerable: !1, writable: !0, configurable: !0 }),
        (Array.prototype.indexOf = function (t) {
            var i, e = this.length;
            for (i = 0; e > i; i++)
                if (this[i] === t)
                    return i;
            return -1;
        })),
    (requestAnimFrame =
        typeof window != "undefined"
            ? (function () {
                return (window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (t) {
                        setTimeout(function () {
                            t(new Date().getTime());
                        }, 1e3 / 60);
                    });
            })()
            : (function () {
                return function (t) {
                    setTimeout(function () {
                        t(new Date().getTime());
                    }, 1e3 / 60);
                };
            })()),
    typeof console == "object"
        ? typeof console.log == "function" &&
            (console.info === void 0 && (console.info = console.log),
                console.warn === void 0 && (console.warn = console.log))
        : (console = { log: function () { }, warn: function () { }, info: function () { }, error: function () { } });
var $i_2 = (function () {
    var t = !1, i = (/xyz/.test(function () { }) ? /\b_super\b/ : /.*/, function () { }), e = function (t, i, e) {
        if (igeConfig.debug._enabled) {
            var o, s, n = "";
            if (((s = this._id !== void 0 ? ":" + this._id : ""),
                (i = i || "log"),
                e !== void 0 && console.warn(e),
                (i === "warning" || i === "error") &&
                    igeConfig.debug._stacks &&
                    (igeConfig.debug._node
                        ? console.trace
                            ? console.trace()
                            : ((o = Error().stack), console.log("Stack:", o))
                        : typeof printStackTrace == "function" &&
                            console.log("Stack:", printStackTrace().join("\n ---- "))),
                i === "error")) {
                if ((typeof ige != "undefined" &&
                    (console.log(n +
                        "IGE *" +
                        i +
                        "* [" +
                        (this._classId || this.prototype._classId) +
                        s +
                        "] : " +
                        "Error encountered, stopping engine to prevent console spamming..."),
                        ige.stop()),
                    igeConfig.debug._throwErrors))
                    throw n + "IGE *" + i + "* [" + (this._classId || this.prototype._classId) + s + "] : " + t;
                console.log(n + "IGE *" + i + "* [" + (this._classId || this.prototype._classId) + s + "] : " + t);
            }
            else
                console.log(n + "IGE *" + i + "* [" + (this._classId || this.prototype._classId) + s + "] : " + t);
        }
        return this;
    }, o = function () {
        return this._classId;
    }, s = function (t, i) {
        var e = new t(this, i);
        return ((this[e.componentId] = e), (this._components = this._components || []), this._components.push(e), this);
    }, n = function (t) {
        return (this[t] && this[t].destroy && this[t].destroy(),
            this._components && this._components.pull(this[t]),
            delete this[t],
            this);
    }, r = function (t, i) {
        var e, o = t.prototype || t;
        for (e in o)
            o.hasOwnProperty(e) && (i || this[e] === void 0) && (this[e] = o[e]);
        return this;
    }, a = function (t, i) {
        return t !== void 0
            ? i !== void 0
                ? ((this._data = this._data || {}), (this._data[t] = i), this)
                : this._data
                    ? this._data[t]
                    : null
            : void 0;
    };
    return ((i.extend = function () {
        function i() {
            !t && this.init && this.init.apply(this, arguments);
        }
        var h, l, c, _, m, u, p, d = arguments[arguments.length - 1], y = arguments[0];
        if (!d.classId)
            throw (console.log(d), "Cannot create a new class without giving the class a classId property!");
        if (igeClassStore[d.classId])
            throw ('Cannot create class with classId "' +
                d.classId +
                '" because a class with that ID has already been created!');
        (t = !0), (l = new this()), (t = !1);
        for (h in d)
            d.hasOwnProperty(h) && (l[h] = d[h]);
        if (arguments.length > 1 && y && y.length)
            for (m = 0; y.length > m; m++) {
                (c = y[m]), (p = c.extension.prototype || c.extension), (_ = c.overwrite);
                for (u in p)
                    p.hasOwnProperty(u) && (_ || l[u] === void 0) && (l[u] = p[u]);
            }
        return ((i.prototype = l),
            (i.prototype.constructor = i),
            (i.extend = arguments.callee),
            (i.prototype.log = e),
            (i.prototype.data = a),
            (i.prototype.classId = o),
            (i.prototype._classId = d.classId || "$i_2"),
            (i.prototype.addComponent = s),
            (i.prototype.removeComponent = n),
            (i.prototype.implement = r),
            (i.prototype.__igeEditor = d.editorOptions),
            (igeClassStore[d.classId] = i),
            i);
    }),
        (i.vanilla = function (t) {
            var i = t.init || function () { }, h = new this();
            for (name in t)
                t.hasOwnProperty(name) && name !== "init" && (h[name] = t[name]);
            return ((i.prototype = h),
                (i.prototype.constructor = i),
                (i.extend = this.extend),
                (i.prototype.log = e),
                (i.prototype.data = a),
                (i.prototype.classId = o),
                (i.prototype._classId = t.classId || "$i_2"),
                (i.prototype.addComponent = s),
                (i.prototype.removeComponent = n),
                (i.prototype.implement = r),
                (igeClassStore[t.classId] = i),
                i);
        }),
        (i.prototype._classId = "$i_2"),
        i);
})();
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_2);
var $i_3 = $i_2.extend({
    classId: "$i_3",
    on: function (t, i, e, o, s) {
        var n, r, a, h, l, c, _, m, u, p = this;
        if (((this._eventListeners = this._eventListeners || {}), typeof i == "function")) {
            if (typeof t == "string")
                return ((n = { call: i, context: e, oneShot: o, sendEventName: s }),
                    (h = this._eventListeners[t] = this._eventListeners[t] || []),
                    (r = !0),
                    (a = h.indexOf(n)),
                    a > -1 && (r = !1),
                    r && h.push(n),
                    n);
            if (t.length) {
                (l = []),
                    (l[0] = 0),
                    (l[1] = 0),
                    (l[3] = function () {
                        l[1]++, l[0] === l[1] && i.apply(e || p);
                    });
                for (c in t)
                    t.hasOwnProperty(c) && ((_ = t[c]), (m = _[0]), (u = _[1]), l[0]++, m.on(u, l[3], null, !0, !0));
            }
        }
        else
            typeof t != "string" && (t = "*Multi-Event*"),
                this.log('Cannot register event listener for event "' +
                    t +
                    '" because the passed callback is not a function!', "error");
    },
    off: function (t, i, e) {
        if (this._eventListeners) {
            if (this._eventListeners._processing)
                return ((this._eventListeners._removeQueue = this._eventListeners._removeQueue || []),
                    this._eventListeners._removeQueue.push([t, i, e]),
                    -1);
            if (this._eventListeners[t]) {
                var o = this._eventListeners[t].indexOf(i);
                if (o > -1)
                    return this._eventListeners[t].splice(o, 1), e && e(!0), !0;
                this.log('Failed to cancel event listener for event named "' + t + '" !', "warning", i);
            }
            else
                this.log("Failed to cancel event listener!");
        }
        return e && e(!1), !1;
    },
    emit: function (t, i) {
        if (this._eventListeners && this._eventListeners[t]) {
            var e, o, s, n, r, a, h = this._eventListeners[t].length, l = this._eventListeners[t].length - 1;
            if (h) {
                if (((e = []), typeof i == "object" && i !== null && i[0] !== null && i[0] !== void 0))
                    for (o in i)
                        i.hasOwnProperty(o) && (e[o] = i[o]);
                else
                    e = [i];
                (s = !1), (this._eventListeners._processing = !0);
                while (h--)
                    (n = l - h),
                        (r = this._eventListeners[t][n]),
                        r.sendEventName && (e = [t]),
                        (a = r.call.apply(r.context || this, e)),
                        a === !0 && (s = !0),
                        r.oneShot && this.off(t, r) === !0 && l--;
                if ((this._eventListeners && ((this._eventListeners._processing = !1), this._processRemovals()), s))
                    return 1;
            }
        }
    },
    eventList: function () {
        return this._eventListeners;
    },
    _processRemovals: function () {
        if (this._eventListeners) {
            var t, i, e, o = this._eventListeners._removeQueue;
            if (o) {
                t = o.length;
                while (t--)
                    (i = o[t]), (e = this.off(i[0], i[1])), typeof o[2] == "function" && o[2](e);
            }
            delete this._eventListeners._removeQueue;
        }
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_3);
var $i_4 = $i_2.extend({
    classId: "$i_4",
    init: function (t, i, e) {
        return ((this.x = t = t !== void 0 ? t : 0),
            (this.y = i = i !== void 0 ? i : 0),
            (this._floor = e !== void 0),
            this._floor
                ? ((this.x2 = Math.floor(t / 2)), (this.y2 = Math.floor(i / 2)))
                : ((this.x2 = t / 2), (this.y2 = i / 2)),
            this);
    },
    floor: function (t) {
        return t !== void 0 ? ((this._floor = t), this) : this._floor;
    },
    compare: function (t) {
        return t && this.x === t.x && this.y === t.y;
    },
    copy: function (t) {
        return (this.x = t.x), (this.y = t.y), (this.z = t.z), this;
    },
    toIso: function () {
        var t = this.x - this.y, i = (this.x + this.y) * 0.5;
        return { x: t, y: i };
    },
    thisToIso: function () {
        var t = this.toIso();
        return (this.x = t.x), (this.y = t.y), this;
    },
    to2d: function () {
        var t = this.y + this.x / 2, i = this.y - this.x / 2;
        return { x: t, y: i };
    },
    thisTo2d: function () {
        var t = this.to2d();
        return (this.x = t.x), (this.y = t.y), this;
    },
    addPoint: function (t) {
        return new $i_4(this.x + t.x, this.y + t.y);
    },
    thisAddPoint: function (t) {
        return (this.x += t.x), (this.y += t.y), this;
    },
    minusPoint: function (t) {
        return new $i_4(this.x - t.x, this.y - t.y);
    },
    thisMinusPoint: function (t) {
        return (this.x -= t.x), (this.y -= t.y), this;
    },
    multiply: function (t, i) {
        return new $i_4(this.x * t, this.y * i);
    },
    multiplyPoint: function (t) {
        return new $i_4(this.x * t.x, this.y * t.y);
    },
    thisMultiply: function (t, i) {
        return (this.x *= t), (this.y *= i), this;
    },
    divide: function (t, i) {
        return new $i_4(this.x / t, this.y / i);
    },
    dividePoint: function (t) {
        var i = this.x, e = this.y;
        return t.x && (i = this.x / t.x), t.y && (e = this.y / t.y), new $i_4(i, e);
    },
    thisDivide: function (t, i) {
        return (this.x /= t), (this.y /= i), this;
    },
    clone: function () {
        return new $i_4(this.x, this.y);
    },
    interpolate: function (t, i, e, o) {
        var s = t.x - this.x, n = t.y - this.y, r = o - i, a = r - (e - i), h = a / r;
        return new $i_4(t.x - s * h, t.y - n * h);
    },
    rotate: function (t) {
        var i = Math.sin(t), e = Math.cos(t), o = e * this.x - i * this.y, s = i * this.x - e * this.y;
        return new $i_4(o, s);
    },
    thisRotate: function (t) {
        var i = Math.sin(t), e = Math.cos(t), o = this.x, s = this.y;
        return (this.x = e * o - i * s), (this.y = i * o - e * s), this;
    },
    toString: function (t) {
        return t === void 0 && (t = 2), this.x.toFixed(t) + "," + this.y.toFixed(t);
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_4);
var $i_5 = $i_2.extend({
    classId: "$i_5",
    init: function (t, i, e, o) {
        return ((this.x = t = t !== void 0 ? t : 0),
            (this.y = i = i !== void 0 ? i : 0),
            (this.z = e = e !== void 0 ? e : 0),
            (this._floor = o !== void 0),
            this._floor
                ? ((this.x2 = Math.floor(t / 2)), (this.y2 = Math.floor(i / 2)), (this.z2 = Math.floor(e / 2)))
                : ((this.x2 = t / 2), (this.y2 = i / 2), (this.z2 = e / 2)),
            this);
    },
    floor: function (t) {
        return t !== void 0 ? ((this._floor = t), this) : this._floor;
    },
    compare: function (t) {
        return t && this.x === t.x && this.y === t.y && this.z === t.z;
    },
    copy: function (t) {
        return (this.x = t.x), (this.y = t.y), (this.z = t.z), this;
    },
    toIso: function () {
        var t = this.x - this.y, i = -this.z * 1.2247 + (this.x + this.y) * 0.5;
        return { x: t, y: i };
    },
    thisToIso: function () {
        var t = this.toIso();
        return (this.x = t.x), (this.y = t.y), this;
    },
    to2d: function () {
        var t = this.y + this.x / 2, i = this.y - this.x / 2;
        return { x: t, y: i };
    },
    thisTo2d: function () {
        var t = this.to2d();
        return (this.x = t.x), (this.y = t.y), (this.z = 0), this;
    },
    addPoint: function (t) {
        return new $i_5(this.x + t.x, this.y + t.y, this.z + t.z);
    },
    thisAddPoint: function (t) {
        return (this.x += t.x), (this.y += t.y), (this.z += t.z), this;
    },
    minusPoint: function (t) {
        return new $i_5(this.x - t.x, this.y - t.y, this.z - t.z);
    },
    thisMinusPoint: function (t) {
        return (this.x -= t.x), (this.y -= t.y), (this.z -= t.z), this;
    },
    multiply: function (t, i, e) {
        return new $i_5(this.x * t, this.y * i, this.z * e);
    },
    multiplyPoint: function (t) {
        return new $i_5(this.x * t.x, this.y * t.y, this.z * t.z);
    },
    thisMultiply: function (t, i, e) {
        return (this.x *= t), (this.y *= i), (this.z *= e), this;
    },
    divide: function (t, i, e) {
        return new $i_5(this.x / t, this.y / i, this.z / e);
    },
    dividePoint: function (t) {
        var i = this.x, e = this.y, o = this.z;
        return t.x && (i = this.x / t.x), t.y && (e = this.y / t.y), t.z && (o = this.z / t.z), new $i_5(i, e, o);
    },
    thisDivide: function (t, i, e) {
        return (this.x /= t), (this.y /= i), (this.z /= e), this;
    },
    clone: function () {
        return new $i_5(this.x, this.y, this.z);
    },
    interpolate: function (t, i, e, o) {
        var s = t.x - this.x, n = t.y - this.y, r = t.z - this.z, a = o - i, h = a - (e - i), l = h / a;
        return new $i_5(t.x - s * l, t.y - n * l, t.z - r * l);
    },
    rotate: function (t) {
        var i = Math.sin(t), e = Math.cos(t), o = e * this.x - i * this.y, s = i * this.x - e * this.y;
        return new $i_5(o, s, this.z);
    },
    thisRotate: function (t) {
        var i = Math.sin(t), e = Math.cos(t), o = this.x, s = this.y;
        return (this.x = e * o - i * s), (this.y = i * o - e * s), this;
    },
    toString: function (t) {
        return t === void 0 && (t = 2), this.x.toFixed(t) + "," + this.y.toFixed(t) + "," + this.z.toFixed(t);
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_5);
var $i_6 = $i_2.extend({
    classId: "$i_6",
    init: function () {
        (this._poly = []), (this._scale = new $i_4(1, 1));
    },
    scale: function (t, i) {
        return t !== void 0 && i !== void 0 ? ((this._scale.x = t), (this._scale.y = i), this) : this._scale;
    },
    multiply: function (t) {
        if (t !== void 0) {
            var i, e = this._poly, o = e.length;
            for (i = 0; o > i; i++)
                (e[i].x *= t), (e[i].y *= t);
        }
        return this;
    },
    divide: function (t) {
        if (t !== void 0) {
            var i, e = this._poly, o = e.length;
            for (i = 0; o > i; i++)
                (e[i].x /= t), (e[i].y /= t);
        }
        return this;
    },
    addPoint: function (t, i) {
        return this._poly.push(new $i_4(t, i)), this;
    },
    length: function () {
        return this._poly.length;
    },
    pointInPoly: function (t) {
        var i, e = this._poly, o = e.length, s = o - 1, n = 0;
        for (i = 0; o > i; s = i++)
            e[i].y > t.y != e[s].y > t.y &&
                ((e[s].x - e[i].x) * (t.y - e[i].y)) / (e[s].y - e[i].y) + e[i].x > t.x &&
                (n = !n);
        return Boolean(n);
    },
    xyInside: function (t, i) {
        var e, o = this._poly, s = o.length, n = s - 1, r = 0;
        for (e = 0; s > e; n = e++)
            o[e].y > i != o[n].y > i && ((o[n].x - o[e].x) * (i - o[e].y)) / (o[n].y - o[e].y) + o[e].x > t && (r = !r);
        return Boolean(r);
    },
    aabb: function () {
        var t, i, e, o, s, n = [], r = [], a = this._poly, h = a.length;
        for (s = 0; h > s; s++)
            n.push(a[s].x), r.push(a[s].y);
        return ((t = Math.min.apply(Math, n)),
            (i = Math.min.apply(Math, r)),
            (e = Math.max.apply(Math, n)),
            (o = Math.max.apply(Math, r)),
            new $i_7(t, i, e - t, o - i));
    },
    clone: function () {
        var t, i = new $i_6(), e = this._poly, o = e.length;
        for (t = 0; o > t; t++)
            i.addPoint(e[t].x, e[t].y);
        return i.scale(this._scale.x, this._scale.y), i;
    },
    clockWiseTriangle: function () {
        var t, i, e, o, s = this._poly;
        return ((i = s[0]),
            (e = s[1]),
            (o = s[2]),
            (t = i.x * e.y + e.x * o.y + o.x * i.y - e.y * o.x - o.y * i.x - i.y * e.x),
            t > 0);
    },
    makeClockWiseTriangle: function () {
        if (!this.clockWiseTriangle()) {
            var t = (this._poly[0], this._poly[1]), i = this._poly[2];
            (this._poly[2] = t), (this._poly[1] = i);
        }
    },
    triangulate: function () {
        var t, i, e, o, s, n = this._poly, r = [], a = this.triangulationIndices();
        for (t = 0; a.length > t; t += 3)
            (i = n[a[t]]),
                (e = n[a[t + 1]]),
                (o = n[a[t + 2]]),
                (s = new $i_6()),
                s.addPoint(i.x, i.y),
                s.addPoint(e.x, e.y),
                s.addPoint(o.x, o.y),
                s.makeClockWiseTriangle(),
                r.push(s);
        return r;
    },
    triangulationIndices: function () {
        var t, i, e, o, s, n, r, a, h, l, c = [], _ = this._poly.length, m = [], u = [];
        if (3 > _)
            return c;
        if (this._area() > 0)
            for (m = 0; _ > m; m++)
                u[m] = m;
        else
            for (m = 0; _ > m; m++)
                u[m] = _ - 1 - m;
        for (t = _, i = 2 * t, e = 0, m = t - 1; t > 2;) {
            if (0 >= i--)
                return c;
            if (((o = m),
                t > o || (o = 0),
                (m = o + 1),
                t > m || (m = 0),
                (s = m + 1),
                t > s || (s = 0),
                this._snip(o, m, s, t, u))) {
                for (n = u[o], r = u[m], a = u[s], c.push(n), c.push(r), c.push(a), e++, h = m, l = m + 1; t > l; l++)
                    (u[h] = u[l]), h++;
                t--, (i = 2 * t);
            }
        }
        return c.reverse(), c;
    },
    _area: function () {
        var t, i, e, o = this._poly.length, s = 0, n = 0;
        for (t = o - 1; o > n; t = n++)
            (i = this._poly[t]), (e = this._poly[n]), (s += i.x * e.y - e.x * i.y);
        return s * 0.5;
    },
    _snip: function (t, i, e, o, s) {
        var n, r, a = this._poly[s[t]], h = this._poly[s[i]], l = this._poly[s[e]];
        if (1e-5 > (h.x - a.x) * (l.y - a.y) - (h.y - a.y) * (l.x - a.x))
            return !1;
        for (n = 0; o > n; n++)
            if (n != t && n != i && n != e && ((r = this._poly[s[n]]), this._insideTriangle(a, h, l, r)))
                return !1;
        return !0;
    },
    _insideTriangle: function (t, i, e, o) {
        var s, n, r, a, h, l, c, _, m, u, p, d, y, x, f;
        return ((s = e.x - i.x),
            (n = e.y - i.y),
            (r = t.x - e.x),
            (a = t.y - e.y),
            (h = i.x - t.x),
            (l = i.y - t.y),
            (c = o.x - t.x),
            (_ = o.y - t.y),
            (m = o.x - i.x),
            (u = o.y - i.y),
            (p = o.x - e.x),
            (d = o.y - e.y),
            (f = s * u - n * m),
            (y = h * _ - l * c),
            (x = r * d - a * p),
            f >= 0 && x >= 0 && y >= 0);
    },
    render: function (t, i) {
        var e, o = this._poly, s = o.length, n = this._scale.x, r = this._scale.y;
        for (t.beginPath(), t.moveTo(o[0].x * n, o[0].y * r), e = 1; s > e; e++)
            t.lineTo(o[e].x * n, o[e].y * r);
        return t.lineTo(o[0].x * n, o[0].y * r), i && t.fill(), t.stroke(), this;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_6);
var $i_7 = $i_2.extend({
    classId: "$i_7",
    init: function (t, i, e, o) {
        return ((this.x = t = t !== void 0 ? t : 0),
            (this.y = i = i !== void 0 ? i : 0),
            (this.width = e = e !== void 0 ? e : 0),
            (this.height = o = o !== void 0 ? o : 0),
            (this.x2 = this.x / 2),
            (this.y2 = this.y / 2),
            this);
    },
    combineRect: function (t) {
        var i = this.x + this.width, e = this.y + this.height, o = t.x + t.width, s = t.y + t.height, n = Math.min(this.x, t.x), r = Math.min(this.y, t.y), a = Math.max(i - this.x, o - this.x), h = Math.max(e - this.y, s - this.y);
        return new $i_7(n, r, a, h);
    },
    thisCombineRect: function (t) {
        var i = this.x + this.width, e = this.y + this.height, o = t.x + t.width, s = t.y + t.height;
        (this.x = Math.min(this.x, t.x)),
            (this.y = Math.min(this.y, t.y)),
            (this.width = Math.max(i - this.x, o - this.x)),
            (this.height = Math.max(e - this.y, s - this.y));
    },
    minusPoint: function (t) {
        return new $i_7(this.x - t.x, this.y - t.y, this.width, this.height);
    },
    compare: function (t) {
        return t && this.x === t.x && this.y === t.y && this.width === t.width && this.height === t.height;
    },
    xyInside: function (t, i) {
        return t >= this.x && i > this.y && this.x + this.width >= t && this.y + this.height >= i;
    },
    pointInside: function (t) {
        return t.x >= this.x && t.y > this.y && this.x + this.width >= t.x && this.y + this.height >= t.y;
    },
    rectIntersect: function (t) {
        return (this.log('rectIntersect has been renamed to "intersects". Please update your code. rectIntersect will be removed in a later version of IGE.', "warning"),
            this.intersects(t));
    },
    intersects: function (t) {
        if (t) {
            var i = this.x, e = this.y, o = this.width, s = this.height, n = t.x, r = t.y, a = t.width, h = t.height, l = i + o, c = e + s, _ = n + a, m = r + h;
            if (_ > i && l > n && m > e && c > r)
                return !0;
        }
        return !1;
    },
    multiply: function (t, i, e, o) {
        return new $i_7(this.x * t, this.y * i, this.width * e, this.height * o);
    },
    thisMultiply: function (t, i, e, o) {
        return (this.x *= t), (this.y *= i), (this.width *= e), (this.height *= o), this;
    },
    clone: function () {
        return new $i_7(this.x, this.y, this.width, this.height);
    },
    toString: function (t) {
        return (t === void 0 && (t = 2),
            this.x.toFixed(t) + "," + this.y.toFixed(t) + "," + this.width.toFixed(t) + "," + this.height.toFixed(t));
    },
    render: function (t, i) {
        return t.rect(this.x, this.y, this.width, this.height), i && t.fill(), t.stroke(), this;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_7);
var $i_8 = function () {
    (this.matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]),
        (this._rotateOrigin = new $i_5(0, 0, 0)),
        (this._scaleOrigin = new $i_5(0, 0, 0));
};
($i_8.prototype = {
    matrix: null,
    transformCoord: function (t, i) {
        var e = t.x, o = t.y, s = this.matrix;
        return ((t.x = e * s[0] + o * s[1] + s[2]),
            (t.y = e * s[3] + o * s[4] + s[5]),
            (isNaN(s[0]) || isNaN(s[1]) || isNaN(s[2]) || isNaN(s[3]) || isNaN(s[4]) || isNaN(s[5])) &&
                i.log("The matrix operation produced a NaN value!", "error"),
            t);
    },
    transformCoordInverse: function (t, i) {
        var e = t.x, o = t.y, s = this.matrix;
        return ((t.x = e * s[0] - o * s[1] + s[2]),
            (t.y = e * s[3] + o * s[4] - s[5]),
            (isNaN(s[0]) || isNaN(s[1]) || isNaN(s[2]) || isNaN(s[3]) || isNaN(s[4]) || isNaN(s[5])) &&
                i.log("The matrix operation produced a NaN value!", "error"),
            t);
    },
    transform: function (t, i) {
        var e, o = t.length;
        for (e = 0; o > e; e++)
            this.transformCoord(t[e], i);
        return t;
    },
    _newRotate: function (t) {
        var i = new $i_8();
        return i.rotateTo(t), i;
    },
    rotateBy: function (t) {
        var i = new $i_8();
        return (i.translateBy(this._rotateOrigin.x, this._rotateOrigin.y),
            i.rotateTo(t),
            i.translateBy(-this._rotateOrigin.x, -this._rotateOrigin.y),
            this.multiply(i),
            this);
    },
    rotateTo: function (t) {
        var i = this.matrix, e = Math.cos(t), o = Math.sin(t);
        return ((i[0] = e),
            (i[1] = -o),
            (i[3] = o),
            (i[4] = e),
            (isNaN(i[0]) || isNaN(i[1]) || isNaN(i[2]) || isNaN(i[3]) || isNaN(i[4]) || isNaN(i[5])) &&
                console.log("The matrix operation produced a NaN value!", "error"),
            this);
    },
    rotationRadians: function () {
        return Math.asin(this.matrix[3]);
    },
    rotationDegrees: function () {
        return Math.degrees(Math.acos(this.matrix[0]));
    },
    _newScale: function (t, i) {
        var e = new $i_8();
        return (e.matrix[0] = t), (e.matrix[4] = i), e;
    },
    scaleBy: function (t, i) {
        var e = new $i_8();
        return (e.matrix[0] = t), (e.matrix[4] = i), this.multiply(e), this;
    },
    scaleTo: function (t, i) {
        var e = this.matrix;
        return ((e[0] = t),
            (e[4] = i),
            (isNaN(e[0]) || isNaN(e[1]) || isNaN(e[2]) || isNaN(e[3]) || isNaN(e[4]) || isNaN(e[5])) &&
                this.log("The matrix operation produced a NaN value!", "error"),
            this);
    },
    _newTranslate: function (t, i) {
        var e = new $i_8();
        return (e.matrix[2] = t), (e.matrix[5] = i), e;
    },
    translateBy: function (t, i) {
        var e = new $i_8();
        return (e.matrix[2] = t), (e.matrix[5] = i), this.multiply(e), this;
    },
    translateTo: function (t, i) {
        var e = this.matrix;
        return ((e[2] = t),
            (e[5] = i),
            (isNaN(e[0]) || isNaN(e[1]) || isNaN(e[2]) || isNaN(e[3]) || isNaN(e[4]) || isNaN(e[5])) &&
                this.log("The matrix operation produced a NaN value!", "error"),
            this);
    },
    copy: function (t) {
        t = t.matrix;
        var i = this.matrix;
        return ((i[0] = t[0]),
            (i[1] = t[1]),
            (i[2] = t[2]),
            (i[3] = t[3]),
            (i[4] = t[4]),
            (i[5] = t[5]),
            (i[6] = t[6]),
            (i[7] = t[7]),
            (i[8] = t[8]),
            this);
    },
    compare: function (t) {
        for (var i = this.matrix, e = t.matrix, o = 0; 9 > o; o++)
            if (i[o] !== e[o])
                return !1;
        return !0;
    },
    identity: function () {
        var t = this.matrix;
        return ((t[0] = 1),
            (t[1] = 0),
            (t[2] = 0),
            (t[3] = 0),
            (t[4] = 1),
            (t[5] = 0),
            (t[6] = 0),
            (t[7] = 0),
            (t[8] = 1),
            this);
    },
    multiply: function (t) {
        var i = this.matrix, e = t.matrix, o = i[0], s = i[1], n = i[2], r = i[3], a = i[4], h = i[5], l = i[6], c = i[7], _ = i[8], m = e[0], u = e[1], p = e[2], d = e[3], y = e[4], x = e[5], f = e[6], g = e[7], b = e[8];
        return ((i[0] = o * m + s * d + n * f),
            (i[1] = o * u + s * y + n * g),
            (i[2] = o * p + s * x + n * b),
            (i[3] = r * m + a * d + h * f),
            (i[4] = r * u + a * y + h * g),
            (i[5] = r * p + a * x + h * b),
            (i[6] = l * m + c * d + _ * f),
            (i[7] = l * u + c * y + _ * g),
            (i[8] = l * p + c * x + _ * b),
            this);
    },
    premultiply: function (t) {
        var i = t.matrix[0] * this.matrix[0] + t.matrix[1] * this.matrix[3] + t.matrix[2] * this.matrix[6], e = t.matrix[0] * this.matrix[1] + t.matrix[1] * this.matrix[4] + t.matrix[2] * this.matrix[7], o = t.matrix[0] * this.matrix[2] + t.matrix[1] * this.matrix[5] + t.matrix[2] * this.matrix[8], s = t.matrix[3] * this.matrix[0] + t.matrix[4] * this.matrix[3] + t.matrix[5] * this.matrix[6], n = t.matrix[3] * this.matrix[1] + t.matrix[4] * this.matrix[4] + t.matrix[5] * this.matrix[7], r = t.matrix[3] * this.matrix[2] + t.matrix[4] * this.matrix[5] + t.matrix[5] * this.matrix[8], a = t.matrix[6] * this.matrix[0] + t.matrix[7] * this.matrix[3] + t.matrix[8] * this.matrix[6], h = t.matrix[6] * this.matrix[1] + t.matrix[7] * this.matrix[4] + t.matrix[8] * this.matrix[7], l = t.matrix[6] * this.matrix[2] + t.matrix[7] * this.matrix[5] + t.matrix[8] * this.matrix[8];
        return ((this.matrix[0] = i),
            (this.matrix[1] = e),
            (this.matrix[2] = o),
            (this.matrix[3] = s),
            (this.matrix[4] = n),
            (this.matrix[5] = r),
            (this.matrix[6] = a),
            (this.matrix[7] = h),
            (this.matrix[8] = l),
            this);
    },
    getInverse: function () {
        var t = this.matrix, i = t[0], e = t[1], o = t[2], s = t[3], n = t[4], r = t[5], a = t[6], h = t[7], l = t[8], c = new $i_8(), _ = i * (n * l - h * r) - s * (e * l - h * o) + a * (e * r - n * o);
        if (_ === 0)
            return null;
        var m = c.matrix;
        return ((m[0] = n * l - r * h),
            (m[1] = o * h - e * l),
            (m[2] = e * r - o * n),
            (m[3] = r * a - s * l),
            (m[4] = i * l - o * a),
            (m[5] = o * s - i * r),
            (m[6] = s * h - n * a),
            (m[7] = e * a - i * h),
            (m[8] = i * n - e * s),
            c.multiplyScalar(1 / _),
            c);
    },
    multiplyScalar: function (t) {
        var i;
        for (i = 0; 9 > i; i++)
            this.matrix[i] *= t;
        return this;
    },
    transformRenderingContextSet: function (t) {
        var i = this.matrix;
        return t.setTransform(i[0], i[3], i[1], i[4], i[2], i[5]), this;
    },
    transformRenderingContext: function (t) {
        var i = this.matrix;
        return t.transform(i[0], i[3], i[1], i[4], i[2], i[5]), this;
    }
}),
    typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_8);
var $i_9 = $i_3.extend({
    classId: "$i_9",
    componentId: "time",
    init: function (t) {
        (this._entity = t),
            (this._timers = []),
            (this._additions = []),
            (this._removals = []),
            t.addBehaviour("time", this._update);
    },
    addTimer: function (t) {
        return t && (this._updating ? this._additions.push(t) : this._timers.push(t)), this;
    },
    removeTimer: function (t) {
        return t && (this._updating ? this._removals.push(t) : this._timers.pull(t)), this;
    },
    _update: function () {
        var t = ige.time, i = ige._tickDelta, e = t._timers, o = e.length;
        while (o--)
            e[o].addTime(i).update();
        return t._processRemovals(), t._processAdditions(), t;
    },
    _processAdditions: function () {
        var t = this._additions, i = t.length;
        if (i) {
            while (i--)
                this._timers.push(t[i]);
            this._additions = [];
        }
        return this;
    },
    _processRemovals: function () {
        var t = this._removals, i = t.length;
        if (i) {
            while (i--)
                this._timers.pull(t[i]);
            this._removals = [];
        }
        return this;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_9);
var $i_11 = $i_2.extend({
    classId: "$i_11",
    componentId: "velocity",
    init: function (t) {
        (this._entity = t),
            (this._velocity = new $i_5(0, 0, 0)),
            (this._friction = new $i_5(1, 1, 1)),
            t.addBehaviour("velocity", this._behaviour);
    },
    _behaviour: function (t) {
        this.velocity.tick(t);
    },
    byAngleAndPower: function (t, i, e) {
        var o = this._velocity, s = Math.cos(t) * i, n = Math.sin(t) * i, r = 0;
        return e ? ((o.x += s), (o.y += n), (o.z += r)) : ((o.x = s), (o.y = n), (o.z = r)), this._entity;
    },
    xyz: function (t, i, e, o) {
        var s = this._velocity;
        return o ? ((s.x += t), (s.y += i), (s.z += e)) : ((s.x = t), (s.y = i), (s.z = e)), this._entity;
    },
    x: function (t, i) {
        var e = this._velocity;
        return i ? (e.x += t) : (e.x = t), this._entity;
    },
    y: function (t, i) {
        var e = this._velocity;
        return i ? (e.y += t) : (e.y = t), this._entity;
    },
    z: function (t, i) {
        var e = this._velocity;
        return i ? (e.z += t) : (e.z = y), this._entity;
    },
    vector3: function (t, i) {
        typeof t.scale != "number" && (t.scale = 1);
        var e = this._velocity, o = t.x, s = t.y, n = t.z;
        return i ? ((e.x += o), (e.y += s), (e.z += n)) : ((e.x = o), (e.y = s), (e.z = n)), this._entity;
    },
    friction: function (t) {
        var i = 1 - t;
        return 0 > i && (i = 0), (this._friction = new $i_5(i, i, i)), this._entity;
    },
    linearForce: function (t, i) {
        i /= 1e3;
        var e = (t * Math.PI) / 180, o = Math.cos(e) * i, s = Math.sin(e) * i, n = o * s;
        return (this._linearForce = new $i_5(o, s, n)), this._entity;
    },
    linearForceXYZ: function (t, i, e) {
        return (this._linearForce = new $i_5(t, i, e)), this._entity;
    },
    linearForceVector3: function (t, i, e) {
        var o = (this._linearForce = this._linearForce || new $i_5(0, 0, 0)), s = t.x / 1e3, n = t.y / 1e3, r = t.z / 1e3;
        return (e ? ((o.x += s || 0), (o.y += n || 0), (o.z += r || 0)) : ((o.x = s || 0), (o.y = n || 0), (o.z = r || 0)),
            this._entity);
    },
    _applyLinearForce: function (t) {
        if (this._linearForce) {
            var i = this._velocity;
            (i.x += this._linearForce.x * t), (i.y += this._linearForce.y * t), (i.z += this._linearForce.z * t);
        }
    },
    _applyFriction: function () {
        var t = this._velocity, i = this._friction;
        (t.x *= i.x), (t.y *= i.y), (t.z *= i.z);
    },
    tick: function () {
        var t, i, e, o = ige._tickDelta, s = this._velocity;
        o &&
            (this._applyLinearForce(o),
                (t = s.x * o),
                (i = s.y * o),
                (e = s.z * o),
                (t || i || e) && this._entity.translateBy(t, i, e));
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_11);
var $i_12 = $i_2.extend({
    classId: "$i_12",
    componentId: "tween",
    init: function (t) {
        (this._entity = t), (this._transform = t.transform), (this._tweens = []), t.addBehaviour("tween", this.update);
    },
    start: function (t) {
        return (t._startTime > ige._currentTime
            ? this._tweens.push(t)
            : ((t._currentStep = 0), this._setupStep(t, !1) && this._tweens.push(t)),
            this.enable(),
            t);
    },
    _setupStep: function (t, i) {
        var e, o, s, n = t._targetObj, r = t._steps[t._currentStep], a = [];
        if ((r && (e = r.props), n)) {
            t._currentStep !== 0 || i
                ? (t._startTime = ige._currentTime)
                : t._startTime === void 0 && (t._startTime = ige._currentTime),
                (o = r.durationMs ? r.durationMs : t._durationMs),
                (t._selectedEasing = r.easing ? r.easing : t._easing),
                (t._endTime = t._startTime + o);
            for (s in e)
                e.hasOwnProperty(s) &&
                    a.push({ targetObj: n, propName: s, deltaVal: e[s] - (r.isDelta ? 0 : n[s]), oldDelta: 0 });
            return (t._targetData = a), (t._destTime = t._endTime - t._startTime), t;
        }
        this.log('Cannot start tweening properties of the specified object "' + obj + '" because it does not exist!', "error");
    },
    stop: function (t) {
        return this._tweens.pull(t), this._tweens.length || this.disable(), this;
    },
    stopAll: function () {
        return this.disable(), delete this._tweens, (this._tweens = []), this;
    },
    enable: function () {
        return this._tweening || (this._tweening = !0), this;
    },
    disable: function () {
        return this._tweening && (this._tweening = !1), this;
    },
    update: function () {
        var t = this.tween;
        if (t._tweens && t._tweens.length) {
            var i, e, o, s, n, r, a, h, l, c, _, m, u = ige._tickStart, p = t._tweens, d = p.length;
            while (d--)
                if (((i = p[d]), (_ = !1), i._started || u >= i._startTime))
                    if ((i._started ||
                        (i._currentStep === -1 && ((i._currentStep = 0), t._setupStep(i, !1)),
                            typeof i._beforeTween == "function" && (i._beforeTween(i), delete i._beforeTween),
                            typeof i._beforeStep == "function" &&
                                ((c = i._stepDirection ? i._steps.length - (i._currentStep + 1) : i._currentStep),
                                    i._beforeStep(i, c)),
                            (i._started = !0)),
                        (e = u - i._startTime),
                        (o = i._destTime),
                        (s = i._selectedEasing),
                        o > e)) {
                        h = i._targetData;
                        for (l in h)
                            if (h.hasOwnProperty(l)) {
                                n = h[l];
                                var m = t.easing[s](e, n.deltaVal, o);
                                (n.targetObj[n.propName] += m - n.oldDelta), (n.oldDelta = m);
                            }
                        typeof i._afterChange == "function" && i._afterChange(i, c);
                    }
                    else {
                        h = i._targetData;
                        for (l in h)
                            if (h.hasOwnProperty(l)) {
                                (n = h[l]),
                                    (r = n.targetObj),
                                    (a = r[n.propName]),
                                    (m = o !== 0 ? t.easing[s](o, n.deltaVal, o) : n.deltaVal),
                                    (a += m - n.oldDelta);
                                var y = Math.pow(10, 15 - (a.toFixed(0) + "").length);
                                r[n.propName] = Math.round(a * y) / y;
                            }
                        typeof i._afterStep == "function" &&
                            ((c = i._stepDirection ? i._steps.length - (i._currentStep + 1) : i._currentStep),
                                i._afterStep(i, c)),
                            i._steps.length === i._currentStep + 1
                                ? (i._repeatMode
                                    ? (i._repeatCount !== -1 &&
                                        (i._repeatedCount++, i._repeatCount === i._repeatedCount && (_ = !0)),
                                        _ ||
                                            (i._repeatMode === 1 && (i._currentStep = 0),
                                                i._repeatMode === 2 &&
                                                    ((i._stepDirection = !i._stepDirection),
                                                        i._steps.reverse(),
                                                        (i._currentStep = 1)),
                                                typeof i._stepsComplete == "function" &&
                                                    i._stepsComplete(i, i._currentStep),
                                                typeof i._beforeStep == "function" &&
                                                    ((c = i._stepDirection
                                                        ? i._steps.length - (i._currentStep + 1)
                                                        : i._currentStep),
                                                        i._beforeStep(i, c)),
                                                t._setupStep(i, !0)))
                                    : (_ = !0),
                                    _ &&
                                        (i.stop(),
                                            typeof i._afterTween == "function" && (i._afterTween(i), delete i._afterTween)))
                                : (i._currentStep++,
                                    typeof i._beforeStep == "function" &&
                                        ((c = i._stepDirection
                                            ? i._steps.length - (i._currentStep + 1)
                                            : i._currentStep),
                                            i._beforeStep(i, c)),
                                    t._setupStep(i, !0)),
                            typeof i._afterChange == "function" && i._afterChange(i, c);
                    }
        }
    },
    easing: {
        none: function (t, i, e) {
            return (i * t) / e;
        },
        inQuad: function (t, i, e) {
            return i * (t /= e) * t;
        },
        outQuad: function (t, i, e) {
            return -i * (t /= e) * (t - 2);
        },
        inOutQuad: function (t, i, e) {
            return 1 > (t /= e / 2) ? (i / 2) * t * t : (-i / 2) * (--t * (t - 2) - 1);
        },
        inCubic: function (t, i, e) {
            return i * (t /= e) * t * t;
        },
        outCubic: function (t, i, e) {
            return i * ((t = t / e - 1) * t * t + 1);
        },
        inOutCubic: function (t, i, e) {
            return 1 > (t /= e / 2) ? (i / 2) * t * t * t : (i / 2) * ((t -= 2) * t * t + 2);
        },
        outInCubic: function (t, i, e) {
            return e / 2 > t ? this.outCubic(t * 2, i / 2, e) : this.inCubic(t * 2 - e, i / 2, i / 2, e);
        },
        inQuart: function (t, i, e) {
            return i * (t /= e) * t * t * t;
        },
        outQuart: function (t, i, e) {
            return -i * ((t = t / e - 1) * t * t * t - 1);
        },
        inOutQuart: function (t, i, e) {
            return 1 > (t /= e / 2) ? (i / 2) * t * t * t * t : (-i / 2) * ((t -= 2) * t * t * t - 2);
        },
        outInQuart: function (t, i, e) {
            return e / 2 > t ? this.outQuart(t * 2, i / 2, e) : this.inQuart(t * 2 - e, i / 2, i / 2, e);
        },
        inQuint: function (t, i, e) {
            return i * (t /= e) * t * t * t * t;
        },
        outQuint: function (t, i, e) {
            return i * ((t = t / e - 1) * t * t * t * t + 1);
        },
        inOutQuint: function (t, i, e) {
            return 1 > (t /= e / 2) ? (i / 2) * t * t * t * t * t : (i / 2) * ((t -= 2) * t * t * t * t + 2);
        },
        outInQuint: function (t, i, e) {
            return e / 2 > t ? this.outQuint(t * 2, i / 2, e) : this.inQuint(t * 2 - e, i / 2, i / 2, e);
        },
        inSine: function (t, i, e) {
            return -i * Math.cos((t / e) * (Math.PI / 2)) + i;
        },
        outSine: function (t, i, e) {
            return i * Math.sin((t / e) * (Math.PI / 2));
        },
        inOutSine: function (t, i, e) {
            return (-i / 2) * (Math.cos((Math.PI * t) / e) - 1);
        },
        outInSine: function (t, i, e) {
            return e / 2 > t ? this.outSine(t * 2, i / 2, e) : this.inSine(t * 2 - e, i / 2, i / 2, e);
        },
        inExpo: function (t, i, e) {
            return t === 0 ? 0 : i * Math.pow(2, 10 * (t / e - 1)) - i * 0.001;
        },
        outExpo: function (t, i, e) {
            return t === e ? i : i * 1.001 * (-Math.pow(2, (-10 * t) / e) + 1);
        },
        inOutExpo: function (t, i, e) {
            return t === 0
                ? 0
                : t === e
                    ? i
                    : 1 > (t /= e / 2)
                        ? (i / 2) * Math.pow(2, 10 * (t - 1)) - i * 5e-4
                        : (i / 2) * 1.0005 * (-Math.pow(2, -10 * --t) + 2);
        },
        outInExpo: function (t, i, e) {
            return e / 2 > t ? this.outExpo(t * 2, i / 2, e) : this.inExpo(t * 2 - e, i / 2, i / 2, e);
        },
        inCirc: function (t, i, e) {
            return -i * (Math.sqrt(1 - (t /= e) * t) - 1);
        },
        outCirc: function (t, i, e) {
            return i * Math.sqrt(1 - (t = t / e - 1) * t);
        },
        inOutCirc: function (t, i, e) {
            return 1 > (t /= e / 2)
                ? (-i / 2) * (Math.sqrt(1 - t * t) - 1)
                : (i / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1);
        },
        outInCirc: function (t, i, e) {
            return e / 2 > t ? this.outCirc(t * 2, i / 2, e) : this.inCirc(t * 2 - e, i / 2, i / 2, e);
        },
        inElastic: function (t, i, e, o, s) {
            var n;
            return t === 0
                ? 0
                : (t /= e) === 1
                    ? i
                    : (s || (s = e * 0.3),
                        !o || Math.abs(i) > o ? ((o = i), (n = s / 4)) : (n = (s / (2 * Math.PI)) * Math.asin(i / o)),
                        -(o * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * e - n) * 2 * Math.PI) / s)));
        },
        outElastic: function (t, i, e, o, s) {
            var n;
            return t === 0
                ? 0
                : (t /= e) === 1
                    ? i
                    : (s || (s = e * 0.3),
                        !o || Math.abs(i) > o ? ((o = i), (n = s / 4)) : (n = (s / (2 * Math.PI)) * Math.asin(i / o)),
                        o * Math.pow(2, -10 * t) * Math.sin(((t * e - n) * 2 * Math.PI) / s) + i);
        },
        inOutElastic: function (t, i, e, o, s) {
            var n;
            return t === 0
                ? 0
                : (t /= e / 2) === 2
                    ? i
                    : (s || (s = e * 0.3 * 1.5),
                        !o || Math.abs(i) > o ? ((o = i), (n = s / 4)) : (n = (s / (2 * Math.PI)) * Math.asin(i / o)),
                        1 > t
                            ? -0.5 * o * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * e - n) * 2 * Math.PI) / s)
                            : o * Math.pow(2, -10 * (t -= 1)) * Math.sin(((t * e - n) * 2 * Math.PI) / s) * 0.5 + i);
        },
        outInElastic: function (t, i, e, o, s) {
            return e / 2 > t
                ? this.outElastic(t * 2, i / 2, e, o, s)
                : this.inElastic(t * 2 - e, i / 2, i / 2, e, o, s);
        },
        inBack: function (t, i, e, o) {
            return o === void 0 && (o = 1.70158), i * (t /= e) * t * ((o + 1) * t - o);
        },
        outBack: function (t, i, e, o) {
            return o === void 0 && (o = 1.70158), i * ((t = t / e - 1) * t * ((o + 1) * t + o) + 1);
        },
        inOutBack: function (t, i, e, o) {
            return (o === void 0 && (o = 1.70158),
                1 > (t /= e / 2)
                    ? (i / 2) * t * t * (((o *= 1.525) + 1) * t - o)
                    : (i / 2) * ((t -= 2) * t * (((o *= 1.525) + 1) * t + o) + 2));
        },
        outInBack: function (t, i, e, o) {
            return e / 2 > t ? this.outBack(t * 2, i / 2, e, o) : this.inBack(t * 2 - e, i / 2, i / 2, e, o);
        },
        inBounce: function (t, i, e) {
            return i - this.outBounce(e - t, 0, i, e);
        },
        outBounce: function (t, i, e) {
            return 1 / 2.75 > (t /= e)
                ? i * 7.5625 * t * t
                : 2 / 2.75 > t
                    ? i * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75)
                    : 2.5 / 2.75 > t
                        ? i * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375)
                        : i * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
        },
        inOutBounce: function (t, i, e) {
            return e / 2 > t ? this.inBounce(t * 2, 0, i, e) * 0.5 : this.outBounce(t * 2 - e, 0, i, e) * 0.5 + i * 0.5;
        },
        outInBounce: function (t, i, e) {
            return e / 2 > t ? this.outBounce(t * 2, i / 2, e) : this.inBounce(t * 2 - e, i / 2, i / 2, e);
        }
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_12);
var $i_14 = $i_3.extend({
    classId: "$i_14",
    componentId: "input",
    init: function () {
        (this._eventQueue = []),
            (this._eventControl = {
                _cancelled: !1,
                stopPropagation: function () {
                    this._cancelled = !0;
                }
            }),
            this.tick(),
            (this.mouse = {
                dblClick: -302,
                down: -301,
                up: -300,
                move: -259,
                wheel: -258,
                wheelUp: -257,
                wheelDown: -256,
                x: -255,
                y: -254,
                button1: -253,
                button2: -252,
                button3: -251
            }),
            (this.pad1 = {
                button1: -250,
                button2: -249,
                button3: -248,
                button4: -247,
                button5: -246,
                button6: -245,
                button7: -244,
                button8: -243,
                button9: -242,
                button10: -241,
                button11: -240,
                button12: -239,
                button13: -238,
                button14: -237,
                button15: -236,
                button16: -235,
                button17: -234,
                button18: -233,
                button19: -232,
                button20: -231,
                stick1: -230,
                stick2: -229,
                stick1Up: -228,
                stick1Down: -227,
                stick1Left: -226,
                stick1Right: -225,
                stick2Up: -224,
                stick2Down: -223,
                stick2Left: -222,
                stick2Right: -221
            }),
            (this.pad2 = {
                button1: -220,
                button2: -219,
                button3: -218,
                button4: -217,
                button5: -216,
                button6: -215,
                button7: -214,
                button8: -213,
                button9: -212,
                button10: -211,
                button11: -210,
                button12: -209,
                button13: -208,
                button14: -207,
                button15: -206,
                button16: -205,
                button17: -204,
                button18: -203,
                button19: -202,
                button20: -201,
                stick1: -200,
                stick2: -199,
                stick1Up: -198,
                stick1Down: -197,
                stick1Left: -196,
                stick1Right: -195,
                stick2Up: -194,
                stick2Down: -193,
                stick2Left: -192,
                stick2Right: -191
            }),
            (this.key = {
                shift: -3,
                ctrl: -2,
                alt: -1,
                backspace: 8,
                tab: 9,
                enter: 13,
                escape: 27,
                space: 32,
                pageUp: 33,
                pageDown: 34,
                end: 35,
                home: 36,
                left: 37,
                up: 38,
                right: 39,
                down: 40,
                insert: 45,
                del: 46,
                0: 48,
                1: 49,
                2: 50,
                3: 51,
                4: 52,
                5: 53,
                6: 54,
                7: 55,
                8: 56,
                9: 57,
                a: 65,
                b: 66,
                c: 67,
                d: 68,
                e: 69,
                f: 70,
                g: 71,
                h: 72,
                i: 73,
                j: 74,
                k: 75,
                l: 76,
                m: 77,
                n: 78,
                o: 79,
                p: 80,
                q: 81,
                r: 82,
                s: 83,
                t: 84,
                u: 85,
                v: 86,
                w: 87,
                x: 88,
                y: 89,
                z: 90
            }),
            (this._controlMap = []),
            (this._state = []),
            (this._state[this.mouse.x] = 0),
            (this._state[this.mouse.y] = 0);
    },
    debug: function (t) {
        return t !== void 0 ? ((this._debug = t), this) : this._debug;
    },
    setupListeners: function (t) {
        this.log("Setting up input event listeners..."), (this._canvas = t);
        var i = this;
        (this._evRef = {
            mousedown: function (t) {
                (t.igeType = "mouse"), i._rationalise(t), i._mouseDown(t);
            },
            mouseup: function (t) {
                (t.igeType = "mouse"), i._rationalise(t), i._mouseUp(t);
            },
            mousemove: function (t) {
                (t.igeType = "mouse"), i._rationalise(t), i._mouseMove(t);
            },
            mousewheel: function (t) {
                (t.igeType = "mouse"), i._rationalise(t), i._mouseWheel(t);
            },
            touchmove: function (t) {
                (t.igeType = "touch"), i._rationalise(t, !0), i._mouseMove(t);
            },
            touchstart: function (t) {
                (t.igeType = "touch"), i._rationalise(t, !0), i._mouseDown(t);
            },
            touchend: function (t) {
                (t.igeType = "touch"), i._rationalise(t, !0), i._mouseUp(t);
            },
            contextmenu: function (t) {
                t.preventDefault(), (t.igeType = "mouse"), i._rationalise(t), i._contextMenu(t);
            },
            keydown: function (t) {
                (t.igeType = "key"), i._rationalise(t), i._keyDown(t);
            },
            keyup: function (t) {
                (t.igeType = "key"), i._rationalise(t), i._keyUp(t);
            }
        }),
            t.addEventListener("mousedown", this._evRef.mousedown, !1),
            t.addEventListener("mouseup", this._evRef.mouseup, !1),
            t.addEventListener("mousemove", this._evRef.mousemove, !1),
            t.addEventListener("mousewheel", this._evRef.mousewheel, !1),
            t.addEventListener("touchmove", this._evRef.touchmove, !1),
            t.addEventListener("touchstart", this._evRef.touchstart, !1),
            t.addEventListener("touchend", this._evRef.touchend, !1),
            t.addEventListener("contextmenu", this._evRef.contextmenu, !1),
            window.addEventListener("keydown", this._evRef.keydown, !1),
            window.addEventListener("keyup", this._evRef.keyup, !1);
    },
    destroyListeners: function () {
        this.log("Removing input event listeners...");
        var t = this._canvas;
        t.removeEventListener("mousedown", this._evRef.mousedown, !1),
            t.removeEventListener("mouseup", this._evRef.mouseup, !1),
            t.removeEventListener("mousemove", this._evRef.mousemove, !1),
            t.removeEventListener("mousewheel", this._evRef.mousewheel, !1),
            t.removeEventListener("touchmove", this._evRef.touchmove, !1),
            t.removeEventListener("touchstart", this._evRef.touchstart, !1),
            t.removeEventListener("touchend", this._evRef.touchend, !1),
            t.removeEventListener("contextmenu", this._evRef.contextmenu, !1),
            window.removeEventListener("keydown", this._evRef.keydown, !1),
            window.removeEventListener("keyup", this._evRef.keyup, !1);
    },
    fireManualEvent: function (t, i) {
        t && i
            ? this._evRef[t]
                ? this._evRef[t](i)
                : this.log('Cannot fire manual event "' +
                    t +
                    '" because no listener exists in the engine for this event type!', "warning")
            : this.log("Cannot fire manual event because both eventName and eventObj params are required.", "warning");
    },
    _rationalise: function (t, i) {
        if (t.igeType === "key" && t.keyCode === 8) {
            var e = t.srcElement || t.target;
            e.tagName.toLowerCase() === "body" && t.preventDefault();
        }
        t.igeType === "touch" && t.preventDefault(),
            i
                ? ((t.button = 0),
                    t.changedTouches &&
                        t.changedTouches.length &&
                        ((t.igePageX = t.changedTouches[0].pageX), (t.igePageY = t.changedTouches[0].pageY)))
                : ((t.igePageX = t.pageX), (t.igePageY = t.pageY)),
            (t.igeX = t.igePageX - this._canvas.offsetLeft),
            (t.igeY = t.igePageY - this._canvas.offsetTop),
            this.emit("inputEvent", t);
    },
    _mouseDown: function (t) {
        this._debug && console.log("Mouse Down", t), this._updateMouseData(t);
        var i = t.igeX - ige._bounds2d.x2, e = t.igeY - ige._bounds2d.y2, o = this;
        t.button === 0 && (this._state[this.mouse.button1] = !0),
            t.button === 1 && (this._state[this.mouse.button2] = !0),
            t.button === 2 && (this._state[this.mouse.button3] = !0),
            (this.mouseDown = t),
            o.emit("preMouseDown", [t, i, e, t.button + 1]) ||
                this.queueEvent(this, function () {
                    o.emit("mouseDown", [t, i, e, t.button + 1]);
                });
    },
    _mouseUp: function (t) {
        this._debug && console.log("Mouse Up", t), this._updateMouseData(t);
        var i = t.igeX - ige._bounds2d.x2, e = t.igeY - ige._bounds2d.y2, o = this;
        t.button === 0 && (this._state[this.mouse.button1] = !1),
            t.button === 1 && (this._state[this.mouse.button2] = !1),
            t.button === 2 && (this._state[this.mouse.button3] = !1),
            (this.mouseUp = t),
            o.emit("preMouseUp", [t, i, e, t.button + 1]) ||
                this.queueEvent(this, function () {
                    o.emit("mouseUp", [t, i, e, t.button + 1]);
                });
    },
    _contextMenu: function (t) {
        this._debug && console.log("Context Menu", t), this._updateMouseData(t);
        var i = t.igeX - ige._bounds2d.x2, e = t.igeY - ige._bounds2d.y2, o = this;
        t.button === 0 && (this._state[this.mouse.button1] = !1),
            t.button === 1 && (this._state[this.mouse.button2] = !1),
            t.button === 2 && (this._state[this.mouse.button3] = !1),
            (this.contextMenu = t),
            o.emit("preContextMenu", [t, i, e, t.button + 1]) ||
                this.queueEvent(this, function () {
                    o.emit("contextMenu", [t, i, e, t.button + 1]);
                });
    },
    _mouseMove: function (t) {
        ige._mouseOverVp = this._updateMouseData(t);
        var i = t.igeX - ige._bounds2d.x2, e = t.igeY - ige._bounds2d.y2, o = this;
        (this._state[this.mouse.x] = i),
            (this._state[this.mouse.y] = e),
            (this.mouseMove = t),
            o.emit("preMouseMove", [t, i, e, t.button + 1]) ||
                this.queueEvent(this, function () {
                    o.emit("mouseMove", [t, i, e, t.button + 1]);
                });
    },
    _mouseWheel: function (t) {
        this._updateMouseData(t);
        var i = t.igeX - ige._bounds2d.x2, e = t.igeY - ige._bounds2d.y2, o = this;
        (this._state[this.mouse.wheel] = t.wheelDelta),
            t.wheelDelta > 0 ? (this._state[this.mouse.wheelUp] = !0) : (this._state[this.mouse.wheelDown] = !0),
            (this.mouseWheel = t),
            o.emit("preMouseWheel", [t, i, e, t.button + 1]) ||
                this.queueEvent(this, function () {
                    o.emit("mouseWheel", [t, i, e, t.button + 1]);
                });
    },
    _keyDown: function (t) {
        var i = this;
        (this._state[t.keyCode] = !0),
            this._debug && console.log("Key Down", t),
            i.emit("preKeyDown", [t, t.keyCode]) ||
                this.queueEvent(this, function () {
                    i.emit("keyDown", [t, t.keyCode]);
                });
    },
    _keyUp: function (t) {
        var i = this;
        (this._state[t.keyCode] = !1),
            this._debug && console.log("Key Up", t),
            i.emit("preKeyUp", [t, t.keyCode]) ||
                this.queueEvent(this, function () {
                    i.emit("keyUp", [t, t.keyCode]);
                });
    },
    _updateMouseData: function (t) {
        var i, e, o = ige._children, s = o.length, n = t.igeX - ige._bounds2d.x2 - ige._translate.x, r = t.igeY - ige._bounds2d.y2 - ige._translate.y;
        (ige._mousePos.x = n), (ige._mousePos.y = r);
        while (s--)
            if (((i = o[o.length - (s + 1)]),
                n > i._translate.x - i._bounds2d.x / 2 &&
                    i._translate.x + i._bounds2d.x / 2 > n &&
                    r > i._translate.y - i._bounds2d.y / 2 &&
                    i._translate.y + i._bounds2d.y / 2 > r)) {
                (i._mousePos = new $i_5(Math.floor((n - i._translate.x) / i.camera._scale.x + i.camera._translate.x), Math.floor((r - i._translate.y) / i.camera._scale.y + i.camera._translate.y), 0)),
                    (e = i),
                    (t.igeViewport = i);
                break;
            }
        return e;
    },
    mapAction: function (t, i) {
        this._controlMap[t] = i;
    },
    actionVal: function (t) {
        return this._state[this._controlMap[t]];
    },
    actionState: function (t) {
        var i = this._state[this._controlMap[t]];
        return !!i;
    },
    val: function (t) {
        return this._state[t];
    },
    state: function (t) {
        return !!this._state[t];
    },
    stopPropagation: function () {
        return (this._eventControl._cancelled = !0), this;
    },
    queueEvent: function (t, i, e) {
        return i !== void 0 && this._eventQueue.push([t, i, e]), this;
    },
    tick: function () {
        var t = this._eventQueue, i = t.length, e = this._eventControl;
        while (i--)
            if ((t[i][1].apply(t[i][0], [e, t[i][2]]), e._cancelled))
                break;
        (this._eventQueue = []),
            (this._eventControl._cancelled = !1),
            (this.dblClick = !1),
            (this.mouseMove = !1),
            (this.mouseDown = !1),
            (this.mouseUp = !1),
            (this.mouseWheel = !1);
    },
    emit: function (t, i) {
        if (this._eventListeners && this._eventListeners[t]) {
            var e, o, s, n, r, a, h = this._eventListeners[t].length, l = this._eventListeners[t].length - 1, c = this._eventControl;
            if (h) {
                if (((e = []), typeof i == "object" && i !== null && i[0] !== null))
                    for (o in i)
                        i.hasOwnProperty(o) && (e[o] = i[o]);
                else
                    e = [i];
                (s = !1), (this._eventListeners._processing = !0);
                while (h--) {
                    if (c._cancelled)
                        break;
                    (n = l - h),
                        (r = this._eventListeners[t][n]),
                        r.sendEventName && (e = [t]),
                        (a = r.call.apply(r.context || this, e)),
                        (a === !0 || c._cancelled === !0) && (s = !0),
                        r.oneShot && this.off(t, r);
                }
                if (((this._eventListeners._processing = !1), this._processRemovals(), s))
                    return 1;
            }
        }
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_14);
var $i_18 = $i_2.extend({
    classId: "$i_18",
    componentId: "ui",
    init: function (t, i) {
        var e = this;
        (this._entity = t),
            (this._options = i),
            (this._focus = null),
            (this._caret = null),
            (this._register = []),
            (this._styles = {}),
            (this._elementsByStyle = {}),
            ige.components.input.on("keyDown", function (t) {
                e._keyDown(t);
            });
    },
    style: function (t, i) {
        return t !== void 0 ? (i !== void 0 ? ((this._styles[t] = i), this) : this._styles[t]) : this;
    },
    registerElement: function (t) {
        this._register.push(t);
    },
    unRegisterElement: function (t) {
        this._register.pull(t),
            delete this._styles["#" + t._id],
            delete this._styles["#" + t._id + ":active"],
            delete this._styles["#" + t._id + ":focus"],
            delete this._styles["#" + t._id + ":hover"];
    },
    registerElementStyle: function (t) {
        t &&
            t._styleClass &&
            ((this._elementsByStyle[t._styleClass] = this._elementsByStyle[t._styleClass] || []),
                this._elementsByStyle[t._styleClass].push(t));
    },
    unRegisterElementStyle: function (t) {
        t &&
            t._styleClass &&
            ((this._elementsByStyle[t._styleClass] = this._elementsByStyle[t._styleClass] || []),
                this._elementsByStyle[t._styleClass].push(t));
    },
    canFocus: function (t) {
        return t._allowFocus;
    },
    focus: function (t) {
        if (t !== void 0) {
            if (t === this._focus)
                return !0;
            var i = this._focus;
            if (!((i && i.emit("blur", t)) || (i && ((i._focused = !1), i.blur()), t.emit("focus", i))))
                return (this._focus = t), (t._focused = !0), !0;
        }
        return !1;
    },
    blur: function (t) {
        return t === void 0 || t !== this._focus || t.emit("blur")
            ? !1
            : ((this._focus = null), (t._focused = !1), t._updateStyle(), !0);
    },
    _keyUp: function (t) {
        this._focus && (this._focus.emit("keyUp", t), ige.components.input.stopPropagation());
    },
    _keyDown: function (t) {
        this._focus && (this._focus.emit("keyDown", t), ige.components.input.stopPropagation());
    }
}), $i_22 = {};
(function (t, i) {
    function e() { }
    !(Object.defineProperty instanceof Function) &&
        Object.__defineGetter__ instanceof Function &&
        Object.__defineSetter__ instanceof Function &&
        (Object.defineProperty = function (t, i, e) {
            e.get instanceof Function && t.__defineGetter__(i, e.get),
                e.set instanceof Function && t.__defineSetter__(i, e.set);
        }),
        (t.inherit = function (t, i) {
            var o = t;
            (e.prototype = i.prototype), (t.prototype = new e()), (t.prototype.constructor = o);
        }),
        (t.generateCallback = function (t, i) {
            return function () {
                i.apply(t, arguments);
            };
        }),
        (t.NVector = function (t) {
            t === i && (t = 0);
            for (var e = Array(t || 0), o = 0; t > o; ++o)
                e[o] = 0;
            return e;
        }),
        (t.is = function (t, e) {
            return t === null
                ? !1
                : e instanceof Function && t instanceof e
                    ? !0
                    : t.constructor.__implements != i && t.constructor.__implements[e]
                        ? !0
                        : !1;
        }),
        (t.parseUInt = function (t) {
            return Math.abs(parseInt(t));
        });
})($i_22);
var Vector = Array, Vector_a2j_Number = $i_22.NVector;
$i_22 === void 0 && ($i_22 = {}),
    $i_22.Collision === void 0 && ($i_22.Collision = {}),
    $i_22.Collision.Shapes === void 0 && ($i_22.Collision.Shapes = {}),
    $i_22.Common === void 0 && ($i_22.Common = {}),
    $i_22.Common.Math === void 0 && ($i_22.Common.Math = {}),
    $i_22.Dynamics === void 0 && ($i_22.Dynamics = {}),
    $i_22.Dynamics.Contacts === void 0 && ($i_22.Dynamics.Contacts = {}),
    $i_22.Dynamics.Controllers === void 0 && ($i_22.Dynamics.Controllers = {}),
    $i_22.Dynamics.Joints === void 0 && ($i_22.Dynamics.Joints = {}),
    (function () {
        function t() {
            t.b2AABB.apply(this, arguments);
        }
        function i() {
            i.b2Bound.apply(this, arguments);
        }
        function e() {
            e.b2BoundValues.apply(this, arguments), this.constructor === e && this.b2BoundValues.apply(this, arguments);
        }
        function o() {
            o.b2Collision.apply(this, arguments);
        }
        function s() {
            s.b2ContactID.apply(this, arguments), this.constructor === s && this.b2ContactID.apply(this, arguments);
        }
        function n() {
            n.b2ContactPoint.apply(this, arguments);
        }
        function r() {
            r.b2Distance.apply(this, arguments);
        }
        function a() {
            a.b2DistanceInput.apply(this, arguments);
        }
        function h() {
            h.b2DistanceOutput.apply(this, arguments);
        }
        function l() {
            l.b2DistanceProxy.apply(this, arguments);
        }
        function c() {
            c.b2DynamicTree.apply(this, arguments), this.constructor === c && this.b2DynamicTree.apply(this, arguments);
        }
        function _() {
            _.b2DynamicTreeBroadPhase.apply(this, arguments);
        }
        function m() {
            m.b2DynamicTreeNode.apply(this, arguments);
        }
        function u() {
            u.b2DynamicTreePair.apply(this, arguments);
        }
        function p() {
            p.b2Manifold.apply(this, arguments), this.constructor === p && this.b2Manifold.apply(this, arguments);
        }
        function d() {
            d.b2ManifoldPoint.apply(this, arguments),
                this.constructor === d && this.b2ManifoldPoint.apply(this, arguments);
        }
        function y() {
            y.b2Point.apply(this, arguments);
        }
        function x() {
            x.b2RayCastInput.apply(this, arguments),
                this.constructor === x && this.b2RayCastInput.apply(this, arguments);
        }
        function f() {
            f.b2RayCastOutput.apply(this, arguments);
        }
        function g() {
            g.b2Segment.apply(this, arguments);
        }
        function b() {
            b.b2SeparationFunction.apply(this, arguments);
        }
        function v() {
            v.b2Simplex.apply(this, arguments), this.constructor === v && this.b2Simplex.apply(this, arguments);
        }
        function w() {
            w.b2SimplexCache.apply(this, arguments);
        }
        function C() {
            C.b2SimplexVertex.apply(this, arguments);
        }
        function D() {
            D.b2TimeOfImpact.apply(this, arguments);
        }
        function B() {
            B.b2TOIInput.apply(this, arguments);
        }
        function S() {
            S.b2WorldManifold.apply(this, arguments),
                this.constructor === S && this.b2WorldManifold.apply(this, arguments);
        }
        function I() {
            I.ClipVertex.apply(this, arguments);
        }
        function A() {
            A.Features.apply(this, arguments);
        }
        function M() {
            M.b2CircleShape.apply(this, arguments), this.constructor === M && this.b2CircleShape.apply(this, arguments);
        }
        function T() {
            T.b2EdgeChainDef.apply(this, arguments),
                this.constructor === T && this.b2EdgeChainDef.apply(this, arguments);
        }
        function P() {
            P.b2EdgeShape.apply(this, arguments), this.constructor === P && this.b2EdgeShape.apply(this, arguments);
        }
        function V() {
            V.b2MassData.apply(this, arguments);
        }
        function R() {
            R.b2PolygonShape.apply(this, arguments),
                this.constructor === R && this.b2PolygonShape.apply(this, arguments);
        }
        function L() {
            L.b2Shape.apply(this, arguments), this.constructor === L && this.b2Shape.apply(this, arguments);
        }
        function k() {
            k.b2Color.apply(this, arguments), this.constructor === k && this.b2Color.apply(this, arguments);
        }
        function F() {
            F.b2Settings.apply(this, arguments);
        }
        function G() {
            G.b2Mat22.apply(this, arguments), this.constructor === G && this.b2Mat22.apply(this, arguments);
        }
        function E() {
            E.b2Mat33.apply(this, arguments), this.constructor === E && this.b2Mat33.apply(this, arguments);
        }
        function z() {
            z.b2Math.apply(this, arguments);
        }
        function J() {
            J.b2Sweep.apply(this, arguments);
        }
        function O() {
            O.b2Transform.apply(this, arguments), this.constructor === O && this.b2Transform.apply(this, arguments);
        }
        function N() {
            N.b2Vec2.apply(this, arguments), this.constructor === N && this.b2Vec2.apply(this, arguments);
        }
        function W() {
            W.b2Vec3.apply(this, arguments), this.constructor === W && this.b2Vec3.apply(this, arguments);
        }
        function j() {
            j.b2Body.apply(this, arguments), this.constructor === j && this.b2Body.apply(this, arguments);
        }
        function U() {
            U.b2BodyDef.apply(this, arguments), this.constructor === U && this.b2BodyDef.apply(this, arguments);
        }
        function q() {
            q.b2ContactFilter.apply(this, arguments);
        }
        function X() {
            X.b2ContactImpulse.apply(this, arguments);
        }
        function H() {
            H.b2ContactListener.apply(this, arguments);
        }
        function K() {
            K.b2ContactManager.apply(this, arguments),
                this.constructor === K && this.b2ContactManager.apply(this, arguments);
        }
        function Y() {
            Y.b2DebugDraw.apply(this, arguments), this.constructor === Y && this.b2DebugDraw.apply(this, arguments);
        }
        function Z() {
            Z.b2DestructionListener.apply(this, arguments);
        }
        function Q() {
            Q.b2FilterData.apply(this, arguments);
        }
        function $() {
            $.b2Fixture.apply(this, arguments), this.constructor === $ && this.b2Fixture.apply(this, arguments);
        }
        function ti() {
            ti.b2FixtureDef.apply(this, arguments), this.constructor === ti && this.b2FixtureDef.apply(this, arguments);
        }
        function ii() {
            ii.b2Island.apply(this, arguments), this.constructor === ii && this.b2Island.apply(this, arguments);
        }
        function ei() {
            ei.b2TimeStep.apply(this, arguments);
        }
        function oi() {
            oi.b2World.apply(this, arguments), this.constructor === oi && this.b2World.apply(this, arguments);
        }
        function si() {
            si.b2CircleContact.apply(this, arguments);
        }
        function ni() {
            ni.b2Contact.apply(this, arguments), this.constructor === ni && this.b2Contact.apply(this, arguments);
        }
        function ri() {
            ri.b2ContactConstraint.apply(this, arguments),
                this.constructor === ri && this.b2ContactConstraint.apply(this, arguments);
        }
        function ai() {
            ai.b2ContactConstraintPoint.apply(this, arguments);
        }
        function hi() {
            hi.b2ContactEdge.apply(this, arguments);
        }
        function li() {
            li.b2ContactFactory.apply(this, arguments),
                this.constructor === li && this.b2ContactFactory.apply(this, arguments);
        }
        function ci() {
            ci.b2ContactRegister.apply(this, arguments);
        }
        function _i() {
            _i.b2ContactResult.apply(this, arguments);
        }
        function mi() {
            mi.b2ContactSolver.apply(this, arguments),
                this.constructor === mi && this.b2ContactSolver.apply(this, arguments);
        }
        function ui() {
            ui.b2EdgeAndCircleContact.apply(this, arguments);
        }
        function pi() {
            pi.b2NullContact.apply(this, arguments),
                this.constructor === pi && this.b2NullContact.apply(this, arguments);
        }
        function di() {
            di.b2PolyAndCircleContact.apply(this, arguments);
        }
        function yi() {
            yi.b2PolyAndEdgeContact.apply(this, arguments);
        }
        function xi() {
            xi.b2PolygonContact.apply(this, arguments);
        }
        function fi() {
            fi.b2PositionSolverManifold.apply(this, arguments),
                this.constructor === fi && this.b2PositionSolverManifold.apply(this, arguments);
        }
        function gi() {
            gi.b2BuoyancyController.apply(this, arguments);
        }
        function bi() {
            bi.b2ConstantAccelController.apply(this, arguments);
        }
        function vi() {
            vi.b2ConstantForceController.apply(this, arguments);
        }
        function wi() {
            wi.b2Controller.apply(this, arguments);
        }
        function Ci() {
            Ci.b2ControllerEdge.apply(this, arguments);
        }
        function Di() {
            Di.b2GravityController.apply(this, arguments);
        }
        function Bi() {
            Bi.b2TensorDampingController.apply(this, arguments);
        }
        function Si() {
            Si.b2DistanceJoint.apply(this, arguments),
                this.constructor === Si && this.b2DistanceJoint.apply(this, arguments);
        }
        function Ii() {
            Ii.b2DistanceJointDef.apply(this, arguments),
                this.constructor === Ii && this.b2DistanceJointDef.apply(this, arguments);
        }
        function Ai() {
            Ai.b2FrictionJoint.apply(this, arguments),
                this.constructor === Ai && this.b2FrictionJoint.apply(this, arguments);
        }
        function Mi() {
            Mi.b2FrictionJointDef.apply(this, arguments),
                this.constructor === Mi && this.b2FrictionJointDef.apply(this, arguments);
        }
        function Ti() {
            Ti.b2GearJoint.apply(this, arguments), this.constructor === Ti && this.b2GearJoint.apply(this, arguments);
        }
        function Pi() {
            Pi.b2GearJointDef.apply(this, arguments),
                this.constructor === Pi && this.b2GearJointDef.apply(this, arguments);
        }
        function Vi() {
            Vi.b2Jacobian.apply(this, arguments);
        }
        function Ri() {
            Ri.b2Joint.apply(this, arguments), this.constructor === Ri && this.b2Joint.apply(this, arguments);
        }
        function Li() {
            Li.b2JointDef.apply(this, arguments), this.constructor === Li && this.b2JointDef.apply(this, arguments);
        }
        function ki() {
            ki.b2JointEdge.apply(this, arguments);
        }
        function Fi() {
            Fi.b2LineJoint.apply(this, arguments), this.constructor === Fi && this.b2LineJoint.apply(this, arguments);
        }
        function Gi() {
            Gi.b2LineJointDef.apply(this, arguments),
                this.constructor === Gi && this.b2LineJointDef.apply(this, arguments);
        }
        function Ei() {
            Ei.b2MouseJoint.apply(this, arguments), this.constructor === Ei && this.b2MouseJoint.apply(this, arguments);
        }
        function zi() {
            zi.b2MouseJointDef.apply(this, arguments),
                this.constructor === zi && this.b2MouseJointDef.apply(this, arguments);
        }
        function Ji() {
            Ji.b2PrismaticJoint.apply(this, arguments),
                this.constructor === Ji && this.b2PrismaticJoint.apply(this, arguments);
        }
        function Oi() {
            Oi.b2PrismaticJointDef.apply(this, arguments),
                this.constructor === Oi && this.b2PrismaticJointDef.apply(this, arguments);
        }
        function Ni() {
            Ni.b2PulleyJoint.apply(this, arguments),
                this.constructor === Ni && this.b2PulleyJoint.apply(this, arguments);
        }
        function Wi() {
            Wi.b2PulleyJointDef.apply(this, arguments),
                this.constructor === Wi && this.b2PulleyJointDef.apply(this, arguments);
        }
        function ji() {
            ji.b2RevoluteJoint.apply(this, arguments),
                this.constructor === ji && this.b2RevoluteJoint.apply(this, arguments);
        }
        function Ui() {
            Ui.b2RevoluteJointDef.apply(this, arguments),
                this.constructor === Ui && this.b2RevoluteJointDef.apply(this, arguments);
        }
        function qi() {
            qi.b2WeldJoint.apply(this, arguments), this.constructor === qi && this.b2WeldJoint.apply(this, arguments);
        }
        function Xi() {
            Xi.b2WeldJointDef.apply(this, arguments),
                this.constructor === Xi && this.b2WeldJointDef.apply(this, arguments);
        }
        ($i_22.Collision.IBroadPhase = "$i_22.Collision.IBroadPhase"),
            ($i_22.Collision.b2AABB = t),
            ($i_22.Collision.b2Bound = i),
            ($i_22.Collision.b2BoundValues = e),
            ($i_22.Collision.b2Collision = o),
            ($i_22.Collision.b2ContactID = s),
            ($i_22.Collision.b2ContactPoint = n),
            ($i_22.Collision.b2Distance = r),
            ($i_22.Collision.b2DistanceInput = a),
            ($i_22.Collision.b2DistanceOutput = h),
            ($i_22.Collision.b2DistanceProxy = l),
            ($i_22.Collision.b2DynamicTree = c),
            ($i_22.Collision.b2DynamicTreeBroadPhase = _),
            ($i_22.Collision.b2DynamicTreeNode = m),
            ($i_22.Collision.b2DynamicTreePair = u),
            ($i_22.Collision.b2Manifold = p),
            ($i_22.Collision.b2ManifoldPoint = d),
            ($i_22.Collision.b2Point = y),
            ($i_22.Collision.b2RayCastInput = x),
            ($i_22.Collision.b2RayCastOutput = f),
            ($i_22.Collision.b2Segment = g),
            ($i_22.Collision.b2SeparationFunction = b),
            ($i_22.Collision.b2Simplex = v),
            ($i_22.Collision.b2SimplexCache = w),
            ($i_22.Collision.b2SimplexVertex = C),
            ($i_22.Collision.b2TimeOfImpact = D),
            ($i_22.Collision.b2TOIInput = B),
            ($i_22.Collision.b2WorldManifold = S),
            ($i_22.Collision.ClipVertex = I),
            ($i_22.Collision.Features = A),
            ($i_22.Collision.Shapes.b2CircleShape = M),
            ($i_22.Collision.Shapes.b2EdgeChainDef = T),
            ($i_22.Collision.Shapes.b2EdgeShape = P),
            ($i_22.Collision.Shapes.b2MassData = V),
            ($i_22.Collision.Shapes.b2PolygonShape = R),
            ($i_22.Collision.Shapes.b2Shape = L),
            ($i_22.Common.b2internal = "$i_22.Common.b2internal"),
            ($i_22.Common.b2Color = k),
            ($i_22.Common.b2Settings = F),
            ($i_22.Common.Math.b2Mat22 = G),
            ($i_22.Common.Math.b2Mat33 = E),
            ($i_22.Common.Math.b2Math = z),
            ($i_22.Common.Math.b2Sweep = J),
            ($i_22.Common.Math.b2Transform = O),
            ($i_22.Common.Math.b2Vec2 = N),
            ($i_22.Common.Math.b2Vec3 = W),
            ($i_22.Dynamics.b2Body = j),
            ($i_22.Dynamics.b2BodyDef = U),
            ($i_22.Dynamics.b2ContactFilter = q),
            ($i_22.Dynamics.b2ContactImpulse = X),
            ($i_22.Dynamics.b2ContactListener = H),
            ($i_22.Dynamics.b2ContactManager = K),
            ($i_22.Dynamics.b2DebugDraw = Y),
            ($i_22.Dynamics.b2DestructionListener = Z),
            ($i_22.Dynamics.b2FilterData = Q),
            ($i_22.Dynamics.b2Fixture = $),
            ($i_22.Dynamics.b2FixtureDef = ti),
            ($i_22.Dynamics.b2Island = ii),
            ($i_22.Dynamics.b2TimeStep = ei),
            ($i_22.Dynamics.b2World = oi),
            ($i_22.Dynamics.Contacts.b2CircleContact = si),
            ($i_22.Dynamics.Contacts.b2Contact = ni),
            ($i_22.Dynamics.Contacts.b2ContactConstraint = ri),
            ($i_22.Dynamics.Contacts.b2ContactConstraintPoint = ai),
            ($i_22.Dynamics.Contacts.b2ContactEdge = hi),
            ($i_22.Dynamics.Contacts.b2ContactFactory = li),
            ($i_22.Dynamics.Contacts.b2ContactRegister = ci),
            ($i_22.Dynamics.Contacts.b2ContactResult = _i),
            ($i_22.Dynamics.Contacts.b2ContactSolver = mi),
            ($i_22.Dynamics.Contacts.b2EdgeAndCircleContact = ui),
            ($i_22.Dynamics.Contacts.b2NullContact = pi),
            ($i_22.Dynamics.Contacts.b2PolyAndCircleContact = di),
            ($i_22.Dynamics.Contacts.b2PolyAndEdgeContact = yi),
            ($i_22.Dynamics.Contacts.b2PolygonContact = xi),
            ($i_22.Dynamics.Contacts.b2PositionSolverManifold = fi),
            ($i_22.Dynamics.Controllers.b2BuoyancyController = gi),
            ($i_22.Dynamics.Controllers.b2ConstantAccelController = bi),
            ($i_22.Dynamics.Controllers.b2ConstantForceController = vi),
            ($i_22.Dynamics.Controllers.b2Controller = wi),
            ($i_22.Dynamics.Controllers.b2ControllerEdge = Ci),
            ($i_22.Dynamics.Controllers.b2GravityController = Di),
            ($i_22.Dynamics.Controllers.b2TensorDampingController = Bi),
            ($i_22.Dynamics.Joints.b2DistanceJoint = Si),
            ($i_22.Dynamics.Joints.b2DistanceJointDef = Ii),
            ($i_22.Dynamics.Joints.b2FrictionJoint = Ai),
            ($i_22.Dynamics.Joints.b2FrictionJointDef = Mi),
            ($i_22.Dynamics.Joints.b2GearJoint = Ti),
            ($i_22.Dynamics.Joints.b2GearJointDef = Pi),
            ($i_22.Dynamics.Joints.b2Jacobian = Vi),
            ($i_22.Dynamics.Joints.b2Joint = Ri),
            ($i_22.Dynamics.Joints.b2JointDef = Li),
            ($i_22.Dynamics.Joints.b2JointEdge = ki),
            ($i_22.Dynamics.Joints.b2LineJoint = Fi),
            ($i_22.Dynamics.Joints.b2LineJointDef = Gi),
            ($i_22.Dynamics.Joints.b2MouseJoint = Ei),
            ($i_22.Dynamics.Joints.b2MouseJointDef = zi),
            ($i_22.Dynamics.Joints.b2PrismaticJoint = Ji),
            ($i_22.Dynamics.Joints.b2PrismaticJointDef = Oi),
            ($i_22.Dynamics.Joints.b2PulleyJoint = Ni),
            ($i_22.Dynamics.Joints.b2PulleyJointDef = Wi),
            ($i_22.Dynamics.Joints.b2RevoluteJoint = ji),
            ($i_22.Dynamics.Joints.b2RevoluteJointDef = Ui),
            ($i_22.Dynamics.Joints.b2WeldJoint = qi),
            ($i_22.Dynamics.Joints.b2WeldJointDef = Xi);
    })(),
    ($i_22.postDefs = []),
    (function () {
        var t = $i_22.Collision.Shapes.b2CircleShape, i = ($i_22.Collision.Shapes.b2EdgeChainDef,
            $i_22.Collision.Shapes.b2EdgeShape,
            $i_22.Collision.Shapes.b2MassData,
            $i_22.Collision.Shapes.b2PolygonShape), e = $i_22.Collision.Shapes.b2Shape, o = ($i_22.Common.b2Color, $i_22.Common.b2internal, $i_22.Common.b2Settings), s = ($i_22.Common.Math.b2Mat22, $i_22.Common.Math.b2Mat33, $i_22.Common.Math.b2Math), n = $i_22.Common.Math.b2Sweep, r = $i_22.Common.Math.b2Transform, a = $i_22.Common.Math.b2Vec2, h = ($i_22.Common.Math.b2Vec3, $i_22.Collision.b2AABB), l = $i_22.Collision.b2Bound, c = $i_22.Collision.b2BoundValues, _ = $i_22.Collision.b2Collision, m = $i_22.Collision.b2ContactID, u = $i_22.Collision.b2ContactPoint, p = $i_22.Collision.b2Distance, d = $i_22.Collision.b2DistanceInput, y = $i_22.Collision.b2DistanceOutput, x = $i_22.Collision.b2DistanceProxy, f = $i_22.Collision.b2DynamicTree, g = $i_22.Collision.b2DynamicTreeBroadPhase, b = $i_22.Collision.b2DynamicTreeNode, v = $i_22.Collision.b2DynamicTreePair, w = $i_22.Collision.b2Manifold, C = $i_22.Collision.b2ManifoldPoint, D = $i_22.Collision.b2Point, B = $i_22.Collision.b2RayCastInput, S = $i_22.Collision.b2RayCastOutput, I = $i_22.Collision.b2Segment, A = $i_22.Collision.b2SeparationFunction, M = $i_22.Collision.b2Simplex, T = $i_22.Collision.b2SimplexCache, P = $i_22.Collision.b2SimplexVertex, V = $i_22.Collision.b2TimeOfImpact, R = $i_22.Collision.b2TOIInput, L = $i_22.Collision.b2WorldManifold, k = $i_22.Collision.ClipVertex, F = $i_22.Collision.Features, G = $i_22.Collision.IBroadPhase;
        (h.b2AABB = function () {
            (this.lowerBound = new a()), (this.upperBound = new a());
        }),
            (h.prototype.IsValid = function () {
                var t = this.upperBound.x - this.lowerBound.x, i = this.upperBound.y - this.lowerBound.y, e = t >= 0 && i >= 0;
                return (e = e && this.lowerBound.IsValid() && this.upperBound.IsValid());
            }),
            (h.prototype.GetCenter = function () {
                return new a((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2);
            }),
            (h.prototype.GetExtents = function () {
                return new a((this.upperBound.x - this.lowerBound.x) / 2, (this.upperBound.y - this.lowerBound.y) / 2);
            }),
            (h.prototype.Contains = function (t) {
                var i = !0;
                return ((i = i && t.lowerBound.x >= this.lowerBound.x),
                    (i = i && t.lowerBound.y >= this.lowerBound.y),
                    (i = i && this.upperBound.x >= t.upperBound.x),
                    (i = i && this.upperBound.y >= t.upperBound.y));
            }),
            (h.prototype.RayCast = function (t, i) {
                var e = -Number.MAX_VALUE, o = Number.MAX_VALUE, s = i.p1.x, n = i.p1.y, r = i.p2.x - i.p1.x, a = i.p2.y - i.p1.y, h = Math.abs(r), l = Math.abs(a), c = t.normal, _ = 0, m = 0, u = 0, p = 0, d = 0;
                if (Number.MIN_VALUE > h) {
                    if (this.lowerBound.x > s || s > this.upperBound.x)
                        return !1;
                }
                else if (((_ = 1 / r),
                    (m = (this.lowerBound.x - s) * _),
                    (u = (this.upperBound.x - s) * _),
                    (d = -1),
                    m > u && ((p = m), (m = u), (u = p), (d = 1)),
                    m > e && ((c.x = d), (c.y = 0), (e = m)),
                    (o = Math.min(o, u)),
                    e > o))
                    return !1;
                if (Number.MIN_VALUE > l) {
                    if (this.lowerBound.y > n || n > this.upperBound.y)
                        return !1;
                }
                else if (((_ = 1 / a),
                    (m = (this.lowerBound.y - n) * _),
                    (u = (this.upperBound.y - n) * _),
                    (d = -1),
                    m > u && ((p = m), (m = u), (u = p), (d = 1)),
                    m > e && ((c.y = d), (c.x = 0), (e = m)),
                    (o = Math.min(o, u)),
                    e > o))
                    return !1;
                return (t.fraction = e), !0;
            }),
            (h.prototype.TestOverlap = function (t) {
                var i = t.lowerBound.x - this.upperBound.x, e = t.lowerBound.y - this.upperBound.y, o = this.lowerBound.x - t.upperBound.x, s = this.lowerBound.y - t.upperBound.y;
                return i > 0 || e > 0 ? !1 : o > 0 || s > 0 ? !1 : !0;
            }),
            (h.Combine = function (t, i) {
                var e = new h();
                return e.Combine(t, i), e;
            }),
            (h.prototype.Combine = function (t, i) {
                (this.lowerBound.x = Math.min(t.lowerBound.x, i.lowerBound.x)),
                    (this.lowerBound.y = Math.min(t.lowerBound.y, i.lowerBound.y)),
                    (this.upperBound.x = Math.max(t.upperBound.x, i.upperBound.x)),
                    (this.upperBound.y = Math.max(t.upperBound.y, i.upperBound.y));
            }),
            (l.b2Bound = function () { }),
            (l.prototype.IsLower = function () {
                return (this.value & 1) == 0;
            }),
            (l.prototype.IsUpper = function () {
                return (this.value & 1) == 1;
            }),
            (l.prototype.Swap = function (t) {
                var i = this.value, e = this.proxy, o = this.stabbingCount;
                (this.value = t.value),
                    (this.proxy = t.proxy),
                    (this.stabbingCount = t.stabbingCount),
                    (t.value = i),
                    (t.proxy = e),
                    (t.stabbingCount = o);
            }),
            (c.b2BoundValues = function () { }),
            (c.prototype.b2BoundValues = function () {
                (this.lowerValues = new Vector_a2j_Number()),
                    (this.lowerValues[0] = 0),
                    (this.lowerValues[1] = 0),
                    (this.upperValues = new Vector_a2j_Number()),
                    (this.upperValues[0] = 0),
                    (this.upperValues[1] = 0);
            }),
            (_.b2Collision = function () { }),
            (_.ClipSegmentToLine = function (t, i, e, o) {
                o === void 0 && (o = 0);
                var s, n = 0;
                s = i[0];
                var r = s.v;
                s = i[1];
                var a = s.v, h = e.x * r.x + e.y * r.y - o, l = e.x * a.x + e.y * a.y - o;
                if ((h > 0 || t[n++].Set(i[0]), l > 0 || t[n++].Set(i[1]), 0 > h * l)) {
                    var c = h / (h - l);
                    s = t[n];
                    var _ = s.v;
                    (_.x = r.x + c * (a.x - r.x)), (_.y = r.y + c * (a.y - r.y)), (s = t[n]);
                    var m;
                    h > 0 ? ((m = i[0]), (s.id = m.id)) : ((m = i[1]), (s.id = m.id)), ++n;
                }
                return n;
            }),
            (_.EdgeSeparation = function (t, i, e, o, s) {
                e === void 0 && (e = 0), parseInt(t.m_vertexCount);
                var n, r, a = t.m_vertices, h = t.m_normals, l = parseInt(o.m_vertexCount), c = o.m_vertices;
                (n = i.R), (r = h[e]);
                var _ = n.col1.x * r.x + n.col2.x * r.y, m = n.col1.y * r.x + n.col2.y * r.y;
                n = s.R;
                for (var u = n.col1.x * _ + n.col1.y * m, p = n.col2.x * _ + n.col2.y * m, d = 0, y = Number.MAX_VALUE, x = 0; l > x; ++x) {
                    r = c[x];
                    var f = r.x * u + r.y * p;
                    y > f && ((y = f), (d = x));
                }
                (r = a[e]), (n = i.R);
                var g = i.position.x + (n.col1.x * r.x + n.col2.x * r.y), b = i.position.y + (n.col1.y * r.x + n.col2.y * r.y);
                (r = c[d]), (n = s.R);
                var v = s.position.x + (n.col1.x * r.x + n.col2.x * r.y), w = s.position.y + (n.col1.y * r.x + n.col2.y * r.y);
                (v -= g), (w -= b);
                var C = v * _ + w * m;
                return C;
            }),
            (_.FindMaxSeparation = function (t, i, e, o, s) {
                var n, r, a = parseInt(i.m_vertexCount), h = i.m_normals;
                (r = s.R), (n = o.m_centroid);
                var l = s.position.x + (r.col1.x * n.x + r.col2.x * n.y), c = s.position.y + (r.col1.y * n.x + r.col2.y * n.y);
                (r = e.R),
                    (n = i.m_centroid),
                    (l -= e.position.x + (r.col1.x * n.x + r.col2.x * n.y)),
                    (c -= e.position.y + (r.col1.y * n.x + r.col2.y * n.y));
                for (var m = l * e.R.col1.x + c * e.R.col1.y, u = l * e.R.col2.x + c * e.R.col2.y, p = 0, d = -Number.MAX_VALUE, y = 0; a > y; ++y) {
                    n = h[y];
                    var x = n.x * m + n.y * u;
                    x > d && ((d = x), (p = y));
                }
                var f = _.EdgeSeparation(i, e, p, o, s), g = parseInt(0 > p - 1 ? a - 1 : p - 1), b = _.EdgeSeparation(i, e, g, o, s), v = parseInt(a > p + 1 ? p + 1 : 0), w = _.EdgeSeparation(i, e, v, o, s), C = 0, D = 0, B = 0;
                if (b > f && b > w)
                    (B = -1), (C = g), (D = b);
                else {
                    if (f >= w)
                        return (t[0] = p), f;
                    (B = 1), (C = v), (D = w);
                }
                for (;;) {
                    if (((p = B == -1 ? (0 > C - 1 ? a - 1 : C - 1) : a > C + 1 ? C + 1 : 0),
                        (f = _.EdgeSeparation(i, e, p, o, s)),
                        D >= f))
                        break;
                    (C = p), (D = f);
                }
                return (t[0] = C), D;
            }),
            (_.FindIncidentEdge = function (t, i, e, o, s, n) {
                o === void 0 && (o = 0), parseInt(i.m_vertexCount);
                var r, a, h = i.m_normals, l = parseInt(s.m_vertexCount), c = s.m_vertices, _ = s.m_normals;
                (r = e.R), (a = h[o]);
                var m = r.col1.x * a.x + r.col2.x * a.y, u = r.col1.y * a.x + r.col2.y * a.y;
                r = n.R;
                var p = r.col1.x * m + r.col1.y * u;
                (u = r.col2.x * m + r.col2.y * u), (m = p);
                for (var d = 0, y = Number.MAX_VALUE, x = 0; l > x; ++x) {
                    a = _[x];
                    var f = m * a.x + u * a.y;
                    y > f && ((y = f), (d = x));
                }
                var g, b = parseInt(d), v = parseInt(l > b + 1 ? b + 1 : 0);
                (g = t[0]),
                    (a = c[b]),
                    (r = n.R),
                    (g.v.x = n.position.x + (r.col1.x * a.x + r.col2.x * a.y)),
                    (g.v.y = n.position.y + (r.col1.y * a.x + r.col2.y * a.y)),
                    (g.id.features.referenceEdge = o),
                    (g.id.features.incidentEdge = b),
                    (g.id.features.incidentVertex = 0),
                    (g = t[1]),
                    (a = c[v]),
                    (r = n.R),
                    (g.v.x = n.position.x + (r.col1.x * a.x + r.col2.x * a.y)),
                    (g.v.y = n.position.y + (r.col1.y * a.x + r.col2.y * a.y)),
                    (g.id.features.referenceEdge = o),
                    (g.id.features.incidentEdge = v),
                    (g.id.features.incidentVertex = 1);
            }),
            (_.MakeClipPointVector = function () {
                var t = new Vector(2);
                return (t[0] = new k()), (t[1] = new k()), t;
            }),
            (_.CollidePolygons = function (t, i, e, s, n) {
                var r;
                t.m_pointCount = 0;
                var a = i.m_radius + s.m_radius, h = 0;
                _.s_edgeAO[0] = h;
                var l = _.FindMaxSeparation(_.s_edgeAO, i, e, s, n);
                if (((h = _.s_edgeAO[0]), a >= l)) {
                    var c = 0;
                    _.s_edgeBO[0] = c;
                    var m = _.FindMaxSeparation(_.s_edgeBO, s, n, i, e);
                    if (((c = _.s_edgeBO[0]), a >= m)) {
                        var u, p, d, y, x, f = 0, g = 0, b = 0.98, v = 0.001;
                        m > b * l + v
                            ? ((u = s), (p = i), (d = n), (y = e), (f = c), (t.m_type = w.e_faceB), (g = 1))
                            : ((u = i), (p = s), (d = e), (y = n), (f = h), (t.m_type = w.e_faceA), (g = 0));
                        var C = _.s_incidentEdge;
                        _.FindIncidentEdge(C, u, d, f, p, y);
                        var D, B = parseInt(u.m_vertexCount), S = u.m_vertices, I = S[f];
                        D = B > f + 1 ? S[parseInt(f + 1)] : S[0];
                        var A = _.s_localTangent;
                        A.Set(D.x - I.x, D.y - I.y), A.Normalize();
                        var M = _.s_localNormal;
                        (M.x = A.y), (M.y = -A.x);
                        var T = _.s_planePoint;
                        T.Set(0.5 * (I.x + D.x), 0.5 * (I.y + D.y));
                        var P = _.s_tangent;
                        (x = d.R), (P.x = x.col1.x * A.x + x.col2.x * A.y), (P.y = x.col1.y * A.x + x.col2.y * A.y);
                        var V = _.s_tangent2;
                        (V.x = -P.x), (V.y = -P.y);
                        var R = _.s_normal;
                        (R.x = P.y), (R.y = -P.x);
                        var L = _.s_v11, k = _.s_v12;
                        (L.x = d.position.x + (x.col1.x * I.x + x.col2.x * I.y)),
                            (L.y = d.position.y + (x.col1.y * I.x + x.col2.y * I.y)),
                            (k.x = d.position.x + (x.col1.x * D.x + x.col2.x * D.y)),
                            (k.y = d.position.y + (x.col1.y * D.x + x.col2.y * D.y));
                        var F = R.x * L.x + R.y * L.y, G = -P.x * L.x - P.y * L.y + a, E = P.x * k.x + P.y * k.y + a, z = _.s_clipPoints1, J = _.s_clipPoints2, O = 0;
                        if (((O = _.ClipSegmentToLine(z, C, V, G)),
                            O >= 2 && ((O = _.ClipSegmentToLine(J, z, P, E)), O >= 2))) {
                            t.m_localPlaneNormal.SetV(M), t.m_localPoint.SetV(T);
                            for (var N = 0, W = 0; o.b2_maxManifoldPoints > W; ++W) {
                                r = J[W];
                                var j = R.x * r.v.x + R.y * r.v.y - F;
                                if (a >= j) {
                                    var U = t.m_points[N];
                                    x = y.R;
                                    var q = r.v.x - y.position.x, X = r.v.y - y.position.y;
                                    (U.m_localPoint.x = q * x.col1.x + X * x.col1.y),
                                        (U.m_localPoint.y = q * x.col2.x + X * x.col2.y),
                                        U.m_id.Set(r.id),
                                        (U.m_id.features.flip = g),
                                        ++N;
                                }
                            }
                            t.m_pointCount = N;
                        }
                    }
                }
            }),
            (_.CollideCircles = function (t, i, e, o, s) {
                t.m_pointCount = 0;
                var n, r;
                (n = e.R), (r = i.m_p);
                var a = e.position.x + (n.col1.x * r.x + n.col2.x * r.y), h = e.position.y + (n.col1.y * r.x + n.col2.y * r.y);
                (n = s.R), (r = o.m_p);
                var l = s.position.x + (n.col1.x * r.x + n.col2.x * r.y), c = s.position.y + (n.col1.y * r.x + n.col2.y * r.y), _ = l - a, m = c - h, u = _ * _ + m * m, p = i.m_radius + o.m_radius;
                u > p * p ||
                    ((t.m_type = w.e_circles),
                        t.m_localPoint.SetV(i.m_p),
                        t.m_localPlaneNormal.SetZero(),
                        (t.m_pointCount = 1),
                        t.m_points[0].m_localPoint.SetV(o.m_p),
                        (t.m_points[0].m_id.key = 0));
            }),
            (_.CollidePolygonAndCircle = function (t, i, e, o, s) {
                t.m_pointCount = 0;
                var n, r, a = 0, h = 0;
                (r = s.R), (n = o.m_p);
                var l = s.position.x + (r.col1.x * n.x + r.col2.x * n.y), c = s.position.y + (r.col1.y * n.x + r.col2.y * n.y);
                (a = l - e.position.x), (h = c - e.position.y), (r = e.R);
                for (var _ = a * r.col1.x + h * r.col1.y, m = a * r.col2.x + h * r.col2.y, u = 0, p = -Number.MAX_VALUE, d = i.m_radius + o.m_radius, y = parseInt(i.m_vertexCount), x = i.m_vertices, f = i.m_normals, g = 0; y > g; ++g) {
                    (n = x[g]), (a = _ - n.x), (h = m - n.y), (n = f[g]);
                    var b = n.x * a + n.y * h;
                    if (b > d)
                        return;
                    b > p && ((p = b), (u = g));
                }
                var v = parseInt(u), C = parseInt(y > v + 1 ? v + 1 : 0), D = x[v], B = x[C];
                if (Number.MIN_VALUE > p)
                    return ((t.m_pointCount = 1),
                        (t.m_type = w.e_faceA),
                        t.m_localPlaneNormal.SetV(f[u]),
                        (t.m_localPoint.x = 0.5 * (D.x + B.x)),
                        (t.m_localPoint.y = 0.5 * (D.y + B.y)),
                        t.m_points[0].m_localPoint.SetV(o.m_p),
                        (t.m_points[0].m_id.key = 0),
                        void 0);
                var S = (_ - D.x) * (B.x - D.x) + (m - D.y) * (B.y - D.y), I = (_ - B.x) * (D.x - B.x) + (m - B.y) * (D.y - B.y);
                if (0 < S)
                    if (0 < I) {
                        var A = 0.5 * (D.x + B.x), M = 0.5 * (D.y + B.y);
                        if (((p = (_ - A) * f[v].x + (m - M) * f[v].y), p > d))
                            return;
                        (t.m_pointCount = 1),
                            (t.m_type = w.e_faceA),
                            (t.m_localPlaneNormal.x = f[v].x),
                            (t.m_localPlaneNormal.y = f[v].y),
                            t.m_localPlaneNormal.Normalize(),
                            t.m_localPoint.Set(A, M),
                            t.m_points[0].m_localPoint.SetV(o.m_p),
                            (t.m_points[0].m_id.key = 0);
                    }
                    else {
                        if ((_ - B.x) * (_ - B.x) + (m - B.y) * (m - B.y) > d * d)
                            return;
                        (t.m_pointCount = 1),
                            (t.m_type = w.e_faceA),
                            (t.m_localPlaneNormal.x = _ - B.x),
                            (t.m_localPlaneNormal.y = m - B.y),
                            t.m_localPlaneNormal.Normalize(),
                            t.m_localPoint.SetV(B),
                            t.m_points[0].m_localPoint.SetV(o.m_p),
                            (t.m_points[0].m_id.key = 0);
                    }
                else {
                    if ((_ - D.x) * (_ - D.x) + (m - D.y) * (m - D.y) > d * d)
                        return;
                    (t.m_pointCount = 1),
                        (t.m_type = w.e_faceA),
                        (t.m_localPlaneNormal.x = _ - D.x),
                        (t.m_localPlaneNormal.y = m - D.y),
                        t.m_localPlaneNormal.Normalize(),
                        t.m_localPoint.SetV(D),
                        t.m_points[0].m_localPoint.SetV(o.m_p),
                        (t.m_points[0].m_id.key = 0);
                }
            }),
            (_.TestOverlap = function (t, i) {
                var e = i.lowerBound, o = t.upperBound, s = e.x - o.x, n = e.y - o.y;
                (e = t.lowerBound), (o = i.upperBound);
                var r = e.x - o.x, a = e.y - o.y;
                return s > 0 || n > 0 ? !1 : r > 0 || a > 0 ? !1 : !0;
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Collision.b2Collision.s_incidentEdge = _.MakeClipPointVector()),
                    ($i_22.Collision.b2Collision.s_clipPoints1 = _.MakeClipPointVector()),
                    ($i_22.Collision.b2Collision.s_clipPoints2 = _.MakeClipPointVector()),
                    ($i_22.Collision.b2Collision.s_edgeAO = new Vector_a2j_Number(1)),
                    ($i_22.Collision.b2Collision.s_edgeBO = new Vector_a2j_Number(1)),
                    ($i_22.Collision.b2Collision.s_localTangent = new a()),
                    ($i_22.Collision.b2Collision.s_localNormal = new a()),
                    ($i_22.Collision.b2Collision.s_planePoint = new a()),
                    ($i_22.Collision.b2Collision.s_normal = new a()),
                    ($i_22.Collision.b2Collision.s_tangent = new a()),
                    ($i_22.Collision.b2Collision.s_tangent2 = new a()),
                    ($i_22.Collision.b2Collision.s_v11 = new a()),
                    ($i_22.Collision.b2Collision.s_v12 = new a()),
                    ($i_22.Collision.b2Collision.b2CollidePolyTempVec = new a()),
                    ($i_22.Collision.b2Collision.b2_nullFeature = 255);
            }),
            (m.b2ContactID = function () {
                this.features = new F();
            }),
            (m.prototype.b2ContactID = function () {
                this.features._m_id = this;
            }),
            (m.prototype.Set = function (t) {
                this.key = t._key;
            }),
            (m.prototype.Copy = function () {
                var t = new m();
                return (t.key = this.key), t;
            }),
            Object.defineProperty(m.prototype, "key", {
                enumerable: !1,
                configurable: !0,
                get: function () {
                    return this._key;
                }
            }),
            Object.defineProperty(m.prototype, "key", {
                enumerable: !1,
                configurable: !0,
                set: function (t) {
                    t === void 0 && (t = 0),
                        (this._key = t),
                        (this.features._referenceEdge = this._key & 255),
                        (this.features._incidentEdge = ((this._key & 65280) >> 8) & 255),
                        (this.features._incidentVertex = ((this._key & 16711680) >> 16) & 255),
                        (this.features._flip = ((this._key & 4278190080) >> 24) & 255);
                }
            }),
            (u.b2ContactPoint = function () {
                (this.position = new a()), (this.velocity = new a()), (this.normal = new a()), (this.id = new m());
            }),
            (p.b2Distance = function () { }),
            (p.Distance = function (t, i, e) {
                ++p.b2_gjkCalls;
                var n = e.proxyA, r = e.proxyB, h = e.transformA, l = e.transformB, c = p.s_simplex;
                c.ReadCache(i, n, h, r, l);
                var _, m = c.m_vertices, u = 20, d = p.s_saveA, y = p.s_saveB, x = 0, f = c.GetClosestPoint(), g = f.LengthSquared(), b = g, v = 0, w = 0;
                while (u > w) {
                    for (x = c.m_count, v = 0; x > v; v++)
                        (d[v] = m[v].indexA), (y[v] = m[v].indexB);
                    switch (c.m_count) {
                        case 1:
                            break;
                        case 2:
                            c.Solve2();
                            break;
                        case 3:
                            c.Solve3();
                            break;
                        default:
                            o.b2Assert(!1);
                    }
                    if (c.m_count == 3)
                        break;
                    (_ = c.GetClosestPoint()), (b = _.LengthSquared()), (g = b);
                    var C = c.GetSearchDirection();
                    if (Number.MIN_VALUE * Number.MIN_VALUE > C.LengthSquared())
                        break;
                    var D = m[c.m_count];
                    (D.indexA = n.GetSupport(s.MulTMV(h.R, C.GetNegative()))),
                        (D.wA = s.MulX(h, n.GetVertex(D.indexA))),
                        (D.indexB = r.GetSupport(s.MulTMV(l.R, C))),
                        (D.wB = s.MulX(l, r.GetVertex(D.indexB))),
                        (D.w = s.SubtractVV(D.wB, D.wA)),
                        ++w,
                        ++p.b2_gjkIters;
                    var B = !1;
                    for (v = 0; x > v; v++)
                        if (D.indexA == d[v] && D.indexB == y[v]) {
                            B = !0;
                            break;
                        }
                    if (B)
                        break;
                    ++c.m_count;
                }
                if (((p.b2_gjkMaxIters = s.Max(p.b2_gjkMaxIters, w)),
                    c.GetWitnessPoints(t.pointA, t.pointB),
                    (t.distance = s.SubtractVV(t.pointA, t.pointB).Length()),
                    (t.iterations = w),
                    c.WriteCache(i),
                    e.useRadii)) {
                    var S = n.m_radius, I = r.m_radius;
                    if (t.distance > S + I && t.distance > Number.MIN_VALUE) {
                        t.distance -= S + I;
                        var A = s.SubtractVV(t.pointB, t.pointA);
                        A.Normalize(),
                            (t.pointA.x += S * A.x),
                            (t.pointA.y += S * A.y),
                            (t.pointB.x -= I * A.x),
                            (t.pointB.y -= I * A.y);
                    }
                    else
                        (_ = new a()),
                            (_.x = 0.5 * (t.pointA.x + t.pointB.x)),
                            (_.y = 0.5 * (t.pointA.y + t.pointB.y)),
                            (t.pointA.x = t.pointB.x = _.x),
                            (t.pointA.y = t.pointB.y = _.y),
                            (t.distance = 0);
                }
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Collision.b2Distance.s_simplex = new M()),
                    ($i_22.Collision.b2Distance.s_saveA = new Vector_a2j_Number(3)),
                    ($i_22.Collision.b2Distance.s_saveB = new Vector_a2j_Number(3));
            }),
            (d.b2DistanceInput = function () { }),
            (y.b2DistanceOutput = function () {
                (this.pointA = new a()), (this.pointB = new a());
            }),
            (x.b2DistanceProxy = function () { }),
            (x.prototype.Set = function (s) {
                switch (s.GetType()) {
                    case e.e_circleShape:
                        var n = s instanceof t ? s : null;
                        (this.m_vertices = new Vector(1, !0)),
                            (this.m_vertices[0] = n.m_p),
                            (this.m_count = 1),
                            (this.m_radius = n.m_radius);
                        break;
                    case e.e_polygonShape:
                        var r = s instanceof i ? s : null;
                        (this.m_vertices = r.m_vertices),
                            (this.m_count = r.m_vertexCount),
                            (this.m_radius = r.m_radius);
                        break;
                    default:
                        o.b2Assert(!1);
                }
            }),
            (x.prototype.GetSupport = function (t) {
                for (var i = 0, e = this.m_vertices[0].x * t.x + this.m_vertices[0].y * t.y, o = 1; this.m_count > o; ++o) {
                    var s = this.m_vertices[o].x * t.x + this.m_vertices[o].y * t.y;
                    s > e && ((i = o), (e = s));
                }
                return i;
            }),
            (x.prototype.GetSupportVertex = function (t) {
                for (var i = 0, e = this.m_vertices[0].x * t.x + this.m_vertices[0].y * t.y, o = 1; this.m_count > o; ++o) {
                    var s = this.m_vertices[o].x * t.x + this.m_vertices[o].y * t.y;
                    s > e && ((i = o), (e = s));
                }
                return this.m_vertices[i];
            }),
            (x.prototype.GetVertexCount = function () {
                return this.m_count;
            }),
            (x.prototype.GetVertex = function (t) {
                return t === void 0 && (t = 0), o.b2Assert(t >= 0 && this.m_count > t), this.m_vertices[t];
            }),
            (f.b2DynamicTree = function () { }),
            (f.prototype.b2DynamicTree = function () {
                (this.m_root = null), (this.m_freeList = null), (this.m_path = 0), (this.m_insertionCount = 0);
            }),
            (f.prototype.CreateProxy = function (t, i) {
                var e = this.AllocateNode(), s = o.b2_aabbExtension, n = o.b2_aabbExtension;
                return ((e.aabb.lowerBound.x = t.lowerBound.x - s),
                    (e.aabb.lowerBound.y = t.lowerBound.y - n),
                    (e.aabb.upperBound.x = t.upperBound.x + s),
                    (e.aabb.upperBound.y = t.upperBound.y + n),
                    (e.userData = i),
                    this.InsertLeaf(e),
                    e);
            }),
            (f.prototype.DestroyProxy = function (t) {
                this.RemoveLeaf(t), this.FreeNode(t);
            }),
            (f.prototype.MoveProxy = function (t, i, e) {
                if ((o.b2Assert(t.IsLeaf()), t.aabb.Contains(i)))
                    return !1;
                this.RemoveLeaf(t);
                var s = o.b2_aabbExtension + o.b2_aabbMultiplier * (e.x > 0 ? e.x : -e.x), n = o.b2_aabbExtension + o.b2_aabbMultiplier * (e.y > 0 ? e.y : -e.y);
                return ((t.aabb.lowerBound.x = i.lowerBound.x - s),
                    (t.aabb.lowerBound.y = i.lowerBound.y - n),
                    (t.aabb.upperBound.x = i.upperBound.x + s),
                    (t.aabb.upperBound.y = i.upperBound.y + n),
                    this.InsertLeaf(t),
                    !0);
            }),
            (f.prototype.Rebalance = function (t) {
                if ((t === void 0 && (t = 0), this.m_root != null))
                    for (var i = 0; t > i; i++) {
                        var e = this.m_root, o = 0;
                        while (e.IsLeaf() == 0)
                            (e = (this.m_path >> o) & 1 ? e.child2 : e.child1), (o = (o + 1) & 31);
                        ++this.m_path, this.RemoveLeaf(e), this.InsertLeaf(e);
                    }
            }),
            (f.prototype.GetFatAABB = function (t) {
                return t.aabb;
            }),
            (f.prototype.GetUserData = function (t) {
                return t.userData;
            }),
            (f.prototype.Query = function (t, i) {
                if (this.m_root != null) {
                    var e = new Vector(), o = 0;
                    e[o++] = this.m_root;
                    while (o > 0) {
                        var s = e[--o];
                        if (s.aabb.TestOverlap(i))
                            if (s.IsLeaf()) {
                                var n = t(s);
                                if (!n)
                                    return;
                            }
                            else
                                (e[o++] = s.child1), (e[o++] = s.child2);
                    }
                }
            }),
            (f.prototype.RayCast = function (t, i) {
                if (this.m_root != null) {
                    var e = i.p1, o = i.p2, n = s.SubtractVV(e, o);
                    n.Normalize();
                    var r = s.CrossFV(1, n), a = s.AbsV(r), l = i.maxFraction, c = new h(), _ = 0, m = 0;
                    (_ = e.x + l * (o.x - e.x)),
                        (m = e.y + l * (o.y - e.y)),
                        (c.lowerBound.x = Math.min(e.x, _)),
                        (c.lowerBound.y = Math.min(e.y, m)),
                        (c.upperBound.x = Math.max(e.x, _)),
                        (c.upperBound.y = Math.max(e.y, m));
                    var u = new Vector(), p = 0;
                    u[p++] = this.m_root;
                    while (p > 0) {
                        var d = u[--p];
                        if (d.aabb.TestOverlap(c) != 0) {
                            var y = d.aabb.GetCenter(), x = d.aabb.GetExtents(), f = Math.abs(r.x * (e.x - y.x) + r.y * (e.y - y.y)) - a.x * x.x - a.y * x.y;
                            if (0 >= f)
                                if (d.IsLeaf()) {
                                    var g = new B();
                                    if (((g.p1 = i.p1),
                                        (g.p2 = i.p2),
                                        (g.maxFraction = i.maxFraction),
                                        (l = t(g, d)),
                                        l == 0))
                                        return;
                                    l > 0 &&
                                        ((_ = e.x + l * (o.x - e.x)),
                                            (m = e.y + l * (o.y - e.y)),
                                            (c.lowerBound.x = Math.min(e.x, _)),
                                            (c.lowerBound.y = Math.min(e.y, m)),
                                            (c.upperBound.x = Math.max(e.x, _)),
                                            (c.upperBound.y = Math.max(e.y, m)));
                                }
                                else
                                    (u[p++] = d.child1), (u[p++] = d.child2);
                        }
                    }
                }
            }),
            (f.prototype.AllocateNode = function () {
                if (this.m_freeList) {
                    var t = this.m_freeList;
                    return (this.m_freeList = t.parent), (t.parent = null), (t.child1 = null), (t.child2 = null), t;
                }
                return new b();
            }),
            (f.prototype.FreeNode = function (t) {
                (t.parent = this.m_freeList), (this.m_freeList = t);
            }),
            (f.prototype.InsertLeaf = function (t) {
                if ((++this.m_insertionCount, this.m_root == null))
                    return (this.m_root = t), (this.m_root.parent = null), void 0;
                var i = t.aabb.GetCenter(), e = this.m_root;
                if (e.IsLeaf() == 0)
                    do {
                        var o = e.child1, s = e.child2, n = Math.abs((o.aabb.lowerBound.x + o.aabb.upperBound.x) / 2 - i.x) +
                            Math.abs((o.aabb.lowerBound.y + o.aabb.upperBound.y) / 2 - i.y), r = Math.abs((s.aabb.lowerBound.x + s.aabb.upperBound.x) / 2 - i.x) +
                            Math.abs((s.aabb.lowerBound.y + s.aabb.upperBound.y) / 2 - i.y);
                        e = r > n ? o : s;
                    } while (e.IsLeaf() == 0);
                var a = e.parent, h = this.AllocateNode();
                if (((h.parent = a), (h.userData = null), h.aabb.Combine(t.aabb, e.aabb), a)) {
                    e.parent.child1 == e ? (a.child1 = h) : (a.child2 = h),
                        (h.child1 = e),
                        (h.child2 = t),
                        (e.parent = h),
                        (t.parent = h);
                    do {
                        if (a.aabb.Contains(h.aabb))
                            break;
                        a.aabb.Combine(a.child1.aabb, a.child2.aabb), (h = a), (a = a.parent);
                    } while (a);
                }
                else
                    (h.child1 = e), (h.child2 = t), (e.parent = h), (t.parent = h), (this.m_root = h);
            }),
            (f.prototype.RemoveLeaf = function (t) {
                if (t == this.m_root)
                    return (this.m_root = null), void 0;
                var i, e = t.parent, o = e.parent;
                if (((i = e.child1 == t ? e.child2 : e.child1), o)) {
                    o.child1 == e ? (o.child1 = i) : (o.child2 = i), (i.parent = o), this.FreeNode(e);
                    while (o) {
                        var s = o.aabb;
                        if (((o.aabb = h.Combine(o.child1.aabb, o.child2.aabb)), s.Contains(o.aabb)))
                            break;
                        o = o.parent;
                    }
                }
                else
                    (this.m_root = i), (i.parent = null), this.FreeNode(e);
            }),
            (g.b2DynamicTreeBroadPhase = function () {
                (this.m_tree = new f()),
                    (this.m_moveBuffer = new Vector()),
                    (this.m_pairBuffer = new Vector()),
                    (this.m_pairCount = 0);
            }),
            (g.prototype.CreateProxy = function (t, i) {
                var e = this.m_tree.CreateProxy(t, i);
                return ++this.m_proxyCount, this.BufferMove(e), e;
            }),
            (g.prototype.DestroyProxy = function (t) {
                this.UnBufferMove(t), --this.m_proxyCount, this.m_tree.DestroyProxy(t);
            }),
            (g.prototype.MoveProxy = function (t, i, e) {
                var o = this.m_tree.MoveProxy(t, i, e);
                o && this.BufferMove(t);
            }),
            (g.prototype.TestOverlap = function (t, i) {
                var e = this.m_tree.GetFatAABB(t), o = this.m_tree.GetFatAABB(i);
                return e.TestOverlap(o);
            }),
            (g.prototype.GetUserData = function (t) {
                return this.m_tree.GetUserData(t);
            }),
            (g.prototype.GetFatAABB = function (t) {
                return this.m_tree.GetFatAABB(t);
            }),
            (g.prototype.GetProxyCount = function () {
                return this.m_proxyCount;
            }),
            (g.prototype.UpdatePairs = function (t) {
                function i(t) {
                    if (t == o)
                        return !0;
                    e.m_pairCount == e.m_pairBuffer.length && (e.m_pairBuffer[e.m_pairCount] = new v());
                    var i = e.m_pairBuffer[e.m_pairCount];
                    return (i.proxyA = o > t ? t : o), (i.proxyB = o > t ? o : t), ++e.m_pairCount, !0;
                }
                var e = this;
                e.m_pairCount = 0;
                var o, s = 0;
                for (s = 0; e.m_moveBuffer.length > s; ++s) {
                    o = e.m_moveBuffer[s];
                    var n = e.m_tree.GetFatAABB(o);
                    e.m_tree.Query(i, n);
                }
                e.m_moveBuffer.length = 0;
                for (var s = 0; e.m_pairCount > s;) {
                    var r = e.m_pairBuffer[s], a = e.m_tree.GetUserData(r.proxyA), h = e.m_tree.GetUserData(r.proxyB);
                    t(a, h), ++s;
                    while (e.m_pairCount > s) {
                        var l = e.m_pairBuffer[s];
                        if (l.proxyA != r.proxyA || l.proxyB != r.proxyB)
                            break;
                        ++s;
                    }
                }
            }),
            (g.prototype.Query = function (t, i) {
                this.m_tree.Query(t, i);
            }),
            (g.prototype.RayCast = function (t, i) {
                this.m_tree.RayCast(t, i);
            }),
            (g.prototype.Validate = function () { }),
            (g.prototype.Rebalance = function (t) {
                t === void 0 && (t = 0), this.m_tree.Rebalance(t);
            }),
            (g.prototype.BufferMove = function (t) {
                this.m_moveBuffer[this.m_moveBuffer.length] = t;
            }),
            (g.prototype.UnBufferMove = function (t) {
                var i = parseInt(this.m_moveBuffer.indexOf(t));
                this.m_moveBuffer.splice(i, 1);
            }),
            (g.prototype.ComparePairs = function () {
                return 0;
            }),
            (g.__implements = {}),
            (g.__implements[G] = !0),
            (b.b2DynamicTreeNode = function () {
                this.aabb = new h();
            }),
            (b.prototype.IsLeaf = function () {
                return this.child1 == null;
            }),
            (v.b2DynamicTreePair = function () { }),
            (w.b2Manifold = function () {
                this.m_pointCount = 0;
            }),
            (w.prototype.b2Manifold = function () {
                this.m_points = new Vector(o.b2_maxManifoldPoints);
                for (var t = 0; o.b2_maxManifoldPoints > t; t++)
                    this.m_points[t] = new C();
                (this.m_localPlaneNormal = new a()), (this.m_localPoint = new a());
            }),
            (w.prototype.Reset = function () {
                for (var t = 0; o.b2_maxManifoldPoints > t; t++)
                    (this.m_points[t] instanceof C ? this.m_points[t] : null).Reset();
                this.m_localPlaneNormal.SetZero(),
                    this.m_localPoint.SetZero(),
                    (this.m_type = 0),
                    (this.m_pointCount = 0);
            }),
            (w.prototype.Set = function (t) {
                this.m_pointCount = t.m_pointCount;
                for (var i = 0; o.b2_maxManifoldPoints > i; i++)
                    (this.m_points[i] instanceof C ? this.m_points[i] : null).Set(t.m_points[i]);
                this.m_localPlaneNormal.SetV(t.m_localPlaneNormal),
                    this.m_localPoint.SetV(t.m_localPoint),
                    (this.m_type = t.m_type);
            }),
            (w.prototype.Copy = function () {
                var t = new w();
                return t.Set(this), t;
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Collision.b2Manifold.e_circles = 1),
                    ($i_22.Collision.b2Manifold.e_faceA = 2),
                    ($i_22.Collision.b2Manifold.e_faceB = 4);
            }),
            (C.b2ManifoldPoint = function () {
                (this.m_localPoint = new a()), (this.m_id = new m());
            }),
            (C.prototype.b2ManifoldPoint = function () {
                this.Reset();
            }),
            (C.prototype.Reset = function () {
                this.m_localPoint.SetZero(),
                    (this.m_normalImpulse = 0),
                    (this.m_tangentImpulse = 0),
                    (this.m_id.key = 0);
            }),
            (C.prototype.Set = function (t) {
                this.m_localPoint.SetV(t.m_localPoint),
                    (this.m_normalImpulse = t.m_normalImpulse),
                    (this.m_tangentImpulse = t.m_tangentImpulse),
                    this.m_id.Set(t.m_id);
            }),
            (D.b2Point = function () {
                this.p = new a();
            }),
            (D.prototype.Support = function (t, i, e) {
                return i === void 0 && (i = 0), e === void 0 && (e = 0), this.p;
            }),
            (D.prototype.GetFirstVertex = function () {
                return this.p;
            }),
            (B.b2RayCastInput = function () {
                (this.p1 = new a()), (this.p2 = new a());
            }),
            (B.prototype.b2RayCastInput = function (t, i, e) {
                t === void 0 && (t = null),
                    i === void 0 && (i = null),
                    e === void 0 && (e = 1),
                    t && this.p1.SetV(t),
                    i && this.p2.SetV(i),
                    (this.maxFraction = e);
            }),
            (S.b2RayCastOutput = function () {
                this.normal = new a();
            }),
            (I.b2Segment = function () {
                (this.p1 = new a()), (this.p2 = new a());
            }),
            (I.prototype.TestSegment = function (t, i, e, o) {
                o === void 0 && (o = 0);
                var s = e.p1, n = e.p2.x - s.x, r = e.p2.y - s.y, a = this.p2.x - this.p1.x, h = this.p2.y - this.p1.y, l = h, c = -a, _ = 100 * Number.MIN_VALUE, m = -(n * l + r * c);
                if (m > _) {
                    var u = s.x - this.p1.x, p = s.y - this.p1.y, d = u * l + p * c;
                    if (d >= 0 && o * m >= d) {
                        var y = -n * p + r * u;
                        if (y >= -_ * m && m * (1 + _) >= y) {
                            d /= m;
                            var x = Math.sqrt(l * l + c * c);
                            return (l /= x), (c /= x), (t[0] = d), i.Set(l, c), !0;
                        }
                    }
                }
                return !1;
            }),
            (I.prototype.Extend = function (t) {
                this.ExtendForward(t), this.ExtendBackward(t);
            }),
            (I.prototype.ExtendForward = function (t) {
                var i = this.p2.x - this.p1.x, e = this.p2.y - this.p1.y, o = Math.min(i > 0
                    ? (t.upperBound.x - this.p1.x) / i
                    : 0 > i
                        ? (t.lowerBound.x - this.p1.x) / i
                        : Number.POSITIVE_INFINITY, e > 0
                    ? (t.upperBound.y - this.p1.y) / e
                    : 0 > e
                        ? (t.lowerBound.y - this.p1.y) / e
                        : Number.POSITIVE_INFINITY);
                (this.p2.x = this.p1.x + i * o), (this.p2.y = this.p1.y + e * o);
            }),
            (I.prototype.ExtendBackward = function (t) {
                var i = -this.p2.x + this.p1.x, e = -this.p2.y + this.p1.y, o = Math.min(i > 0
                    ? (t.upperBound.x - this.p2.x) / i
                    : 0 > i
                        ? (t.lowerBound.x - this.p2.x) / i
                        : Number.POSITIVE_INFINITY, e > 0
                    ? (t.upperBound.y - this.p2.y) / e
                    : 0 > e
                        ? (t.lowerBound.y - this.p2.y) / e
                        : Number.POSITIVE_INFINITY);
                (this.p1.x = this.p2.x + i * o), (this.p1.y = this.p2.y + e * o);
            }),
            (A.b2SeparationFunction = function () {
                (this.m_localPoint = new a()), (this.m_axis = new a());
            }),
            (A.prototype.Initialize = function (t, i, e, n, r) {
                (this.m_proxyA = i), (this.m_proxyB = n);
                var h = parseInt(t.count);
                o.b2Assert(h > 0 && 3 > h);
                var l, c, _, m, u, p, d, y, x = 0, f = 0, g = 0, b = 0, v = 0, w = 0, C = 0, D = 0;
                if (h == 1)
                    (this.m_type = A.e_points),
                        (l = this.m_proxyA.GetVertex(t.indexA[0])),
                        (m = this.m_proxyB.GetVertex(t.indexB[0])),
                        (y = l),
                        (d = e.R),
                        (x = e.position.x + (d.col1.x * y.x + d.col2.x * y.y)),
                        (f = e.position.y + (d.col1.y * y.x + d.col2.y * y.y)),
                        (y = m),
                        (d = r.R),
                        (g = r.position.x + (d.col1.x * y.x + d.col2.x * y.y)),
                        (b = r.position.y + (d.col1.y * y.x + d.col2.y * y.y)),
                        (this.m_axis.x = g - x),
                        (this.m_axis.y = b - f),
                        this.m_axis.Normalize();
                else if (t.indexB[0] == t.indexB[1])
                    (this.m_type = A.e_faceA),
                        (c = this.m_proxyA.GetVertex(t.indexA[0])),
                        (_ = this.m_proxyA.GetVertex(t.indexA[1])),
                        (m = this.m_proxyB.GetVertex(t.indexB[0])),
                        (this.m_localPoint.x = 0.5 * (c.x + _.x)),
                        (this.m_localPoint.y = 0.5 * (c.y + _.y)),
                        (this.m_axis = s.CrossVF(s.SubtractVV(_, c), 1)),
                        this.m_axis.Normalize(),
                        (y = this.m_axis),
                        (d = e.R),
                        (v = d.col1.x * y.x + d.col2.x * y.y),
                        (w = d.col1.y * y.x + d.col2.y * y.y),
                        (y = this.m_localPoint),
                        (d = e.R),
                        (x = e.position.x + (d.col1.x * y.x + d.col2.x * y.y)),
                        (f = e.position.y + (d.col1.y * y.x + d.col2.y * y.y)),
                        (y = m),
                        (d = r.R),
                        (g = r.position.x + (d.col1.x * y.x + d.col2.x * y.y)),
                        (b = r.position.y + (d.col1.y * y.x + d.col2.y * y.y)),
                        (C = (g - x) * v + (b - f) * w),
                        0 > C && this.m_axis.NegativeSelf();
                else if (t.indexA[0] == t.indexA[0])
                    (this.m_type = A.e_faceB),
                        (u = this.m_proxyB.GetVertex(t.indexB[0])),
                        (p = this.m_proxyB.GetVertex(t.indexB[1])),
                        (l = this.m_proxyA.GetVertex(t.indexA[0])),
                        (this.m_localPoint.x = 0.5 * (u.x + p.x)),
                        (this.m_localPoint.y = 0.5 * (u.y + p.y)),
                        (this.m_axis = s.CrossVF(s.SubtractVV(p, u), 1)),
                        this.m_axis.Normalize(),
                        (y = this.m_axis),
                        (d = r.R),
                        (v = d.col1.x * y.x + d.col2.x * y.y),
                        (w = d.col1.y * y.x + d.col2.y * y.y),
                        (y = this.m_localPoint),
                        (d = r.R),
                        (g = r.position.x + (d.col1.x * y.x + d.col2.x * y.y)),
                        (b = r.position.y + (d.col1.y * y.x + d.col2.y * y.y)),
                        (y = l),
                        (d = e.R),
                        (x = e.position.x + (d.col1.x * y.x + d.col2.x * y.y)),
                        (f = e.position.y + (d.col1.y * y.x + d.col2.y * y.y)),
                        (C = (x - g) * v + (f - b) * w),
                        0 > C && this.m_axis.NegativeSelf();
                else {
                    (c = this.m_proxyA.GetVertex(t.indexA[0])),
                        (_ = this.m_proxyA.GetVertex(t.indexA[1])),
                        (u = this.m_proxyB.GetVertex(t.indexB[0])),
                        (p = this.m_proxyB.GetVertex(t.indexB[1])),
                        s.MulX(e, l);
                    var B = s.MulMV(e.R, s.SubtractVV(_, c));
                    s.MulX(r, m);
                    var S = s.MulMV(r.R, s.SubtractVV(p, u)), I = B.x * B.x + B.y * B.y, M = S.x * S.x + S.y * S.y, T = s.SubtractVV(S, B), P = B.x * T.x + B.y * T.y, V = S.x * T.x + S.y * T.y, R = B.x * S.x + B.y * S.y, L = I * M - R * R;
                    (C = 0), L != 0 && (C = s.Clamp((R * V - P * M) / L, 0, 1));
                    var k = (R * C + V) / M;
                    0 > k && ((k = 0), (C = s.Clamp((R - P) / I, 0, 1))),
                        (l = new a()),
                        (l.x = c.x + C * (_.x - c.x)),
                        (l.y = c.y + C * (_.y - c.y)),
                        (m = new a()),
                        (m.x = u.x + C * (p.x - u.x)),
                        (m.y = u.y + C * (p.y - u.y)),
                        C == 0 || C == 1
                            ? ((this.m_type = A.e_faceB),
                                (this.m_axis = s.CrossVF(s.SubtractVV(p, u), 1)),
                                this.m_axis.Normalize(),
                                (this.m_localPoint = m),
                                (y = this.m_axis),
                                (d = r.R),
                                (v = d.col1.x * y.x + d.col2.x * y.y),
                                (w = d.col1.y * y.x + d.col2.y * y.y),
                                (y = this.m_localPoint),
                                (d = r.R),
                                (g = r.position.x + (d.col1.x * y.x + d.col2.x * y.y)),
                                (b = r.position.y + (d.col1.y * y.x + d.col2.y * y.y)),
                                (y = l),
                                (d = e.R),
                                (x = e.position.x + (d.col1.x * y.x + d.col2.x * y.y)),
                                (f = e.position.y + (d.col1.y * y.x + d.col2.y * y.y)),
                                (D = (x - g) * v + (f - b) * w),
                                0 > C && this.m_axis.NegativeSelf())
                            : ((this.m_type = A.e_faceA),
                                (this.m_axis = s.CrossVF(s.SubtractVV(_, c), 1)),
                                (this.m_localPoint = l),
                                (y = this.m_axis),
                                (d = e.R),
                                (v = d.col1.x * y.x + d.col2.x * y.y),
                                (w = d.col1.y * y.x + d.col2.y * y.y),
                                (y = this.m_localPoint),
                                (d = e.R),
                                (x = e.position.x + (d.col1.x * y.x + d.col2.x * y.y)),
                                (f = e.position.y + (d.col1.y * y.x + d.col2.y * y.y)),
                                (y = m),
                                (d = r.R),
                                (g = r.position.x + (d.col1.x * y.x + d.col2.x * y.y)),
                                (b = r.position.y + (d.col1.y * y.x + d.col2.y * y.y)),
                                (D = (g - x) * v + (b - f) * w),
                                0 > C && this.m_axis.NegativeSelf());
                }
            }),
            (A.prototype.Evaluate = function (t, i) {
                var e, n, r, a, h, l, c, _ = 0;
                switch (this.m_type) {
                    case A.e_points:
                        return ((e = s.MulTMV(t.R, this.m_axis)),
                            (n = s.MulTMV(i.R, this.m_axis.GetNegative())),
                            (r = this.m_proxyA.GetSupportVertex(e)),
                            (a = this.m_proxyB.GetSupportVertex(n)),
                            (h = s.MulX(t, r)),
                            (l = s.MulX(i, a)),
                            (_ = (l.x - h.x) * this.m_axis.x + (l.y - h.y) * this.m_axis.y));
                    case A.e_faceA:
                        return ((c = s.MulMV(t.R, this.m_axis)),
                            (h = s.MulX(t, this.m_localPoint)),
                            (n = s.MulTMV(i.R, c.GetNegative())),
                            (a = this.m_proxyB.GetSupportVertex(n)),
                            (l = s.MulX(i, a)),
                            (_ = (l.x - h.x) * c.x + (l.y - h.y) * c.y));
                    case A.e_faceB:
                        return ((c = s.MulMV(i.R, this.m_axis)),
                            (l = s.MulX(i, this.m_localPoint)),
                            (e = s.MulTMV(t.R, c.GetNegative())),
                            (r = this.m_proxyA.GetSupportVertex(e)),
                            (h = s.MulX(t, r)),
                            (_ = (h.x - l.x) * c.x + (h.y - l.y) * c.y));
                    default:
                        return o.b2Assert(!1), 0;
                }
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Collision.b2SeparationFunction.e_points = 1),
                    ($i_22.Collision.b2SeparationFunction.e_faceA = 2),
                    ($i_22.Collision.b2SeparationFunction.e_faceB = 4);
            }),
            (M.b2Simplex = function () {
                (this.m_v1 = new P()), (this.m_v2 = new P()), (this.m_v3 = new P()), (this.m_vertices = new Vector(3));
            }),
            (M.prototype.b2Simplex = function () {
                (this.m_vertices[0] = this.m_v1), (this.m_vertices[1] = this.m_v2), (this.m_vertices[2] = this.m_v3);
            }),
            (M.prototype.ReadCache = function (t, i, e, n, r) {
                o.b2Assert(t.count >= 0 && 3 >= t.count);
                var a, h;
                this.m_count = t.count;
                for (var l = this.m_vertices, c = 0; this.m_count > c; c++) {
                    var _ = l[c];
                    (_.indexA = t.indexA[c]),
                        (_.indexB = t.indexB[c]),
                        (a = i.GetVertex(_.indexA)),
                        (h = n.GetVertex(_.indexB)),
                        (_.wA = s.MulX(e, a)),
                        (_.wB = s.MulX(r, h)),
                        (_.w = s.SubtractVV(_.wB, _.wA)),
                        (_.a = 0);
                }
                if (this.m_count > 1) {
                    var m = t.metric, u = this.GetMetric();
                    (0.5 * m > u || u > 2 * m || Number.MIN_VALUE > u) && (this.m_count = 0);
                }
                this.m_count == 0 &&
                    ((_ = l[0]),
                        (_.indexA = 0),
                        (_.indexB = 0),
                        (a = i.GetVertex(0)),
                        (h = n.GetVertex(0)),
                        (_.wA = s.MulX(e, a)),
                        (_.wB = s.MulX(r, h)),
                        (_.w = s.SubtractVV(_.wB, _.wA)),
                        (this.m_count = 1));
            }),
            (M.prototype.WriteCache = function (t) {
                (t.metric = this.GetMetric()), (t.count = $i_22.parseUInt(this.m_count));
                for (var i = this.m_vertices, e = 0; this.m_count > e; e++)
                    (t.indexA[e] = $i_22.parseUInt(i[e].indexA)), (t.indexB[e] = $i_22.parseUInt(i[e].indexB));
            }),
            (M.prototype.GetSearchDirection = function () {
                switch (this.m_count) {
                    case 1:
                        return this.m_v1.w.GetNegative();
                    case 2:
                        var t = s.SubtractVV(this.m_v2.w, this.m_v1.w), i = s.CrossVV(t, this.m_v1.w.GetNegative());
                        return i > 0 ? s.CrossFV(1, t) : s.CrossVF(t, 1);
                    default:
                        return o.b2Assert(!1), new a();
                }
            }),
            (M.prototype.GetClosestPoint = function () {
                switch (this.m_count) {
                    case 0:
                        return o.b2Assert(!1), new a();
                    case 1:
                        return this.m_v1.w;
                    case 2:
                        return new a(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);
                    default:
                        return o.b2Assert(!1), new a();
                }
            }),
            (M.prototype.GetWitnessPoints = function (t, i) {
                switch (this.m_count) {
                    case 0:
                        o.b2Assert(!1);
                        break;
                    case 1:
                        t.SetV(this.m_v1.wA), i.SetV(this.m_v1.wB);
                        break;
                    case 2:
                        (t.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x),
                            (t.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y),
                            (i.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x),
                            (i.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y);
                        break;
                    case 3:
                        (i.x = t.x =
                            this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x),
                            (i.y = t.y =
                                this.m_v1.a * this.m_v1.wA.y +
                                    this.m_v2.a * this.m_v2.wA.y +
                                    this.m_v3.a * this.m_v3.wA.y);
                        break;
                    default:
                        o.b2Assert(!1);
                }
            }),
            (M.prototype.GetMetric = function () {
                switch (this.m_count) {
                    case 0:
                        return o.b2Assert(!1), 0;
                    case 1:
                        return 0;
                    case 2:
                        return s.SubtractVV(this.m_v1.w, this.m_v2.w).Length();
                    case 3:
                        return s.CrossVV(s.SubtractVV(this.m_v2.w, this.m_v1.w), s.SubtractVV(this.m_v3.w, this.m_v1.w));
                    default:
                        return o.b2Assert(!1), 0;
                }
            }),
            (M.prototype.Solve2 = function () {
                var t = this.m_v1.w, i = this.m_v2.w, e = s.SubtractVV(i, t), o = -(t.x * e.x + t.y * e.y);
                if (0 >= o)
                    return (this.m_v1.a = 1), (this.m_count = 1), void 0;
                var n = i.x * e.x + i.y * e.y;
                if (0 >= n)
                    return (this.m_v2.a = 1), (this.m_count = 1), this.m_v1.Set(this.m_v2), void 0;
                var r = 1 / (n + o);
                (this.m_v1.a = n * r), (this.m_v2.a = o * r), (this.m_count = 2);
            }),
            (M.prototype.Solve3 = function () {
                var t = this.m_v1.w, i = this.m_v2.w, e = this.m_v3.w, o = s.SubtractVV(i, t), n = s.Dot(t, o), r = s.Dot(i, o), a = r, h = -n, l = s.SubtractVV(e, t), c = s.Dot(t, l), _ = s.Dot(e, l), m = _, u = -c, p = s.SubtractVV(e, i), d = s.Dot(i, p), y = s.Dot(e, p), x = y, f = -d, g = s.CrossVV(o, l), b = g * s.CrossVV(i, e), v = g * s.CrossVV(e, t), w = g * s.CrossVV(t, i);
                if (0 >= h && 0 >= u)
                    return (this.m_v1.a = 1), (this.m_count = 1), void 0;
                if (a > 0 && h > 0 && 0 >= w) {
                    var C = 1 / (a + h);
                    return (this.m_v1.a = a * C), (this.m_v2.a = h * C), (this.m_count = 2), void 0;
                }
                if (m > 0 && u > 0 && 0 >= v) {
                    var D = 1 / (m + u);
                    return ((this.m_v1.a = m * D),
                        (this.m_v3.a = u * D),
                        (this.m_count = 2),
                        this.m_v2.Set(this.m_v3),
                        void 0);
                }
                if (0 >= a && 0 >= f)
                    return (this.m_v2.a = 1), (this.m_count = 1), this.m_v1.Set(this.m_v2), void 0;
                if (0 >= m && 0 >= x)
                    return (this.m_v3.a = 1), (this.m_count = 1), this.m_v1.Set(this.m_v3), void 0;
                if (x > 0 && f > 0 && 0 >= b) {
                    var B = 1 / (x + f);
                    return ((this.m_v2.a = x * B),
                        (this.m_v3.a = f * B),
                        (this.m_count = 2),
                        this.m_v1.Set(this.m_v3),
                        void 0);
                }
                var S = 1 / (b + v + w);
                (this.m_v1.a = b * S), (this.m_v2.a = v * S), (this.m_v3.a = w * S), (this.m_count = 3);
            }),
            (T.b2SimplexCache = function () {
                (this.indexA = new Vector_a2j_Number(3)), (this.indexB = new Vector_a2j_Number(3));
            }),
            (P.b2SimplexVertex = function () { }),
            (P.prototype.Set = function (t) {
                this.wA.SetV(t.wA),
                    this.wB.SetV(t.wB),
                    this.w.SetV(t.w),
                    (this.a = t.a),
                    (this.indexA = t.indexA),
                    (this.indexB = t.indexB);
            }),
            (V.b2TimeOfImpact = function () { }),
            (V.TimeOfImpact = function (t) {
                ++V.b2_toiCalls;
                var i = t.proxyA, e = t.proxyB, n = t.sweepA, r = t.sweepB;
                o.b2Assert(n.t0 == r.t0), o.b2Assert(1 - n.t0 > Number.MIN_VALUE);
                var a = i.m_radius + e.m_radius, h = t.tolerance, l = 0, c = 1e3, _ = 0, m = 0;
                for (V.s_cache.count = 0, V.s_distanceInput.useRadii = !1;;) {
                    if ((n.GetTransform(V.s_xfA, l),
                        r.GetTransform(V.s_xfB, l),
                        (V.s_distanceInput.proxyA = i),
                        (V.s_distanceInput.proxyB = e),
                        (V.s_distanceInput.transformA = V.s_xfA),
                        (V.s_distanceInput.transformB = V.s_xfB),
                        p.Distance(V.s_distanceOutput, V.s_cache, V.s_distanceInput),
                        0 >= V.s_distanceOutput.distance)) {
                        l = 1;
                        break;
                    }
                    V.s_fcn.Initialize(V.s_cache, i, V.s_xfA, e, V.s_xfB);
                    var u = V.s_fcn.Evaluate(V.s_xfA, V.s_xfB);
                    if (0 >= u) {
                        l = 1;
                        break;
                    }
                    if ((_ == 0 && (m = u > a ? s.Max(a - h, 0.75 * a) : s.Max(u - h, 0.02 * a)), 0.5 * h > u - m)) {
                        if (_ == 0) {
                            l = 1;
                            break;
                        }
                        break;
                    }
                    var d = l, y = l, x = 1, f = u;
                    n.GetTransform(V.s_xfA, x), r.GetTransform(V.s_xfB, x);
                    var g = V.s_fcn.Evaluate(V.s_xfA, V.s_xfB);
                    if (g >= m) {
                        l = 1;
                        break;
                    }
                    for (var b = 0;;) {
                        var v = 0;
                        (v = b & 1 ? y + ((m - f) * (x - y)) / (g - f) : 0.5 * (y + x)),
                            n.GetTransform(V.s_xfA, v),
                            r.GetTransform(V.s_xfB, v);
                        var w = V.s_fcn.Evaluate(V.s_xfA, V.s_xfB);
                        if (0.025 * h > s.Abs(w - m)) {
                            d = v;
                            break;
                        }
                        if ((w > m ? ((y = v), (f = w)) : ((x = v), (g = w)), ++b, ++V.b2_toiRootIters, b == 50))
                            break;
                    }
                    if (((V.b2_toiMaxRootIters = s.Max(V.b2_toiMaxRootIters, b)), (1 + 100 * Number.MIN_VALUE) * l > d))
                        break;
                    if (((l = d), _++, ++V.b2_toiIters, _ == c))
                        break;
                }
                return (V.b2_toiMaxIters = s.Max(V.b2_toiMaxIters, _)), l;
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Collision.b2TimeOfImpact.b2_toiCalls = 0),
                    ($i_22.Collision.b2TimeOfImpact.b2_toiIters = 0),
                    ($i_22.Collision.b2TimeOfImpact.b2_toiMaxIters = 0),
                    ($i_22.Collision.b2TimeOfImpact.b2_toiRootIters = 0),
                    ($i_22.Collision.b2TimeOfImpact.b2_toiMaxRootIters = 0),
                    ($i_22.Collision.b2TimeOfImpact.s_cache = new T()),
                    ($i_22.Collision.b2TimeOfImpact.s_distanceInput = new d()),
                    ($i_22.Collision.b2TimeOfImpact.s_xfA = new r()),
                    ($i_22.Collision.b2TimeOfImpact.s_xfB = new r()),
                    ($i_22.Collision.b2TimeOfImpact.s_fcn = new A()),
                    ($i_22.Collision.b2TimeOfImpact.s_distanceOutput = new y());
            }),
            (R.b2TOIInput = function () {
                (this.proxyA = new x()), (this.proxyB = new x()), (this.sweepA = new n()), (this.sweepB = new n());
            }),
            (L.b2WorldManifold = function () {
                this.m_normal = new a();
            }),
            (L.prototype.b2WorldManifold = function () {
                this.m_points = new Vector(o.b2_maxManifoldPoints);
                for (var t = 0; o.b2_maxManifoldPoints > t; t++)
                    this.m_points[t] = new a();
            }),
            (L.prototype.Initialize = function (t, i, e, o, s) {
                if ((e === void 0 && (e = 0), s === void 0 && (s = 0), t.m_pointCount != 0)) {
                    var n, r, a = 0, h = 0, l = 0, c = 0, _ = 0, m = 0, u = 0;
                    switch (t.m_type) {
                        case w.e_circles:
                            (r = i.R), (n = t.m_localPoint);
                            var p = i.position.x + r.col1.x * n.x + r.col2.x * n.y, d = i.position.y + r.col1.y * n.x + r.col2.y * n.y;
                            (r = o.R), (n = t.m_points[0].m_localPoint);
                            var y = o.position.x + r.col1.x * n.x + r.col2.x * n.y, x = o.position.y + r.col1.y * n.x + r.col2.y * n.y, f = y - p, g = x - d, b = f * f + g * g;
                            if (b > Number.MIN_VALUE * Number.MIN_VALUE) {
                                var v = Math.sqrt(b);
                                (this.m_normal.x = f / v), (this.m_normal.y = g / v);
                            }
                            else
                                (this.m_normal.x = 1), (this.m_normal.y = 0);
                            var C = p + e * this.m_normal.x, D = d + e * this.m_normal.y, B = y - s * this.m_normal.x, S = x - s * this.m_normal.y;
                            (this.m_points[0].x = 0.5 * (C + B)), (this.m_points[0].y = 0.5 * (D + S));
                            break;
                        case w.e_faceA:
                            for (r = i.R,
                                n = t.m_localPlaneNormal,
                                h = r.col1.x * n.x + r.col2.x * n.y,
                                l = r.col1.y * n.x + r.col2.y * n.y,
                                r = i.R,
                                n = t.m_localPoint,
                                c = i.position.x + r.col1.x * n.x + r.col2.x * n.y,
                                _ = i.position.y + r.col1.y * n.x + r.col2.y * n.y,
                                this.m_normal.x = h,
                                this.m_normal.y = l,
                                a = 0; t.m_pointCount > a; a++)
                                (r = o.R),
                                    (n = t.m_points[a].m_localPoint),
                                    (m = o.position.x + r.col1.x * n.x + r.col2.x * n.y),
                                    (u = o.position.y + r.col1.y * n.x + r.col2.y * n.y),
                                    (this.m_points[a].x = m + 0.5 * (e - (m - c) * h - (u - _) * l - s) * h),
                                    (this.m_points[a].y = u + 0.5 * (e - (m - c) * h - (u - _) * l - s) * l);
                            break;
                        case w.e_faceB:
                            for (r = o.R,
                                n = t.m_localPlaneNormal,
                                h = r.col1.x * n.x + r.col2.x * n.y,
                                l = r.col1.y * n.x + r.col2.y * n.y,
                                r = o.R,
                                n = t.m_localPoint,
                                c = o.position.x + r.col1.x * n.x + r.col2.x * n.y,
                                _ = o.position.y + r.col1.y * n.x + r.col2.y * n.y,
                                this.m_normal.x = -h,
                                this.m_normal.y = -l,
                                a = 0; t.m_pointCount > a; a++)
                                (r = i.R),
                                    (n = t.m_points[a].m_localPoint),
                                    (m = i.position.x + r.col1.x * n.x + r.col2.x * n.y),
                                    (u = i.position.y + r.col1.y * n.x + r.col2.y * n.y),
                                    (this.m_points[a].x = m + 0.5 * (s - (m - c) * h - (u - _) * l - e) * h),
                                    (this.m_points[a].y = u + 0.5 * (s - (m - c) * h - (u - _) * l - e) * l);
                    }
                }
            }),
            (k.ClipVertex = function () {
                (this.v = new a()), (this.id = new m());
            }),
            (k.prototype.Set = function (t) {
                this.v.SetV(t.v), this.id.Set(t.id);
            }),
            (F.Features = function () { }),
            Object.defineProperty(F.prototype, "referenceEdge", {
                enumerable: !1,
                configurable: !0,
                get: function () {
                    return this._referenceEdge;
                }
            }),
            Object.defineProperty(F.prototype, "referenceEdge", {
                enumerable: !1,
                configurable: !0,
                set: function (t) {
                    t === void 0 && (t = 0),
                        (this._referenceEdge = t),
                        (this._m_id._key = (this._m_id._key & 4294967040) | (this._referenceEdge & 255));
                }
            }),
            Object.defineProperty(F.prototype, "incidentEdge", {
                enumerable: !1,
                configurable: !0,
                get: function () {
                    return this._incidentEdge;
                }
            }),
            Object.defineProperty(F.prototype, "incidentEdge", {
                enumerable: !1,
                configurable: !0,
                set: function (t) {
                    t === void 0 && (t = 0),
                        (this._incidentEdge = t),
                        (this._m_id._key = (this._m_id._key & 4294902015) | ((this._incidentEdge << 8) & 65280));
                }
            }),
            Object.defineProperty(F.prototype, "incidentVertex", {
                enumerable: !1,
                configurable: !0,
                get: function () {
                    return this._incidentVertex;
                }
            }),
            Object.defineProperty(F.prototype, "incidentVertex", {
                enumerable: !1,
                configurable: !0,
                set: function (t) {
                    t === void 0 && (t = 0),
                        (this._incidentVertex = t),
                        (this._m_id._key = (this._m_id._key & 4278255615) | ((this._incidentVertex << 16) & 16711680));
                }
            }),
            Object.defineProperty(F.prototype, "flip", {
                enumerable: !1,
                configurable: !0,
                get: function () {
                    return this._flip;
                }
            }),
            Object.defineProperty(F.prototype, "flip", {
                enumerable: !1,
                configurable: !0,
                set: function (t) {
                    t === void 0 && (t = 0),
                        (this._flip = t),
                        (this._m_id._key = (this._m_id._key & 16777215) | ((this._flip << 24) & 4278190080));
                }
            });
    })(),
    (function () {
        var t = ($i_22.Common.b2Color, $i_22.Common.b2internal, $i_22.Common.b2Settings), i = $i_22.Collision.Shapes.b2CircleShape, e = $i_22.Collision.Shapes.b2EdgeChainDef, o = $i_22.Collision.Shapes.b2EdgeShape, s = $i_22.Collision.Shapes.b2MassData, n = $i_22.Collision.Shapes.b2PolygonShape, r = $i_22.Collision.Shapes.b2Shape, a = $i_22.Common.Math.b2Mat22, h = ($i_22.Common.Math.b2Mat33, $i_22.Common.Math.b2Math), l = ($i_22.Common.Math.b2Sweep, $i_22.Common.Math.b2Transform), c = $i_22.Common.Math.b2Vec2, _ = ($i_22.Common.Math.b2Vec3,
            $i_22.Dynamics.b2Body,
            $i_22.Dynamics.b2BodyDef,
            $i_22.Dynamics.b2ContactFilter,
            $i_22.Dynamics.b2ContactImpulse,
            $i_22.Dynamics.b2ContactListener,
            $i_22.Dynamics.b2ContactManager,
            $i_22.Dynamics.b2DebugDraw,
            $i_22.Dynamics.b2DestructionListener,
            $i_22.Dynamics.b2FilterData,
            $i_22.Dynamics.b2Fixture,
            $i_22.Dynamics.b2FixtureDef,
            $i_22.Dynamics.b2Island,
            $i_22.Dynamics.b2TimeStep,
            $i_22.Dynamics.b2World,
            $i_22.Collision.b2AABB,
            $i_22.Collision.b2Bound,
            $i_22.Collision.b2BoundValues,
            $i_22.Collision.b2Collision,
            $i_22.Collision.b2ContactID,
            $i_22.Collision.b2ContactPoint,
            $i_22.Collision.b2Distance), m = $i_22.Collision.b2DistanceInput, u = $i_22.Collision.b2DistanceOutput, p = $i_22.Collision.b2DistanceProxy, d = ($i_22.Collision.b2DynamicTree,
            $i_22.Collision.b2DynamicTreeBroadPhase,
            $i_22.Collision.b2DynamicTreeNode,
            $i_22.Collision.b2DynamicTreePair,
            $i_22.Collision.b2Manifold,
            $i_22.Collision.b2ManifoldPoint,
            $i_22.Collision.b2Point,
            $i_22.Collision.b2RayCastInput,
            $i_22.Collision.b2RayCastOutput,
            $i_22.Collision.b2Segment,
            $i_22.Collision.b2SeparationFunction,
            $i_22.Collision.b2Simplex,
            $i_22.Collision.b2SimplexCache);
        $i_22.Collision.b2SimplexVertex,
            $i_22.Collision.b2TimeOfImpact,
            $i_22.Collision.b2TOIInput,
            $i_22.Collision.b2WorldManifold,
            $i_22.Collision.ClipVertex,
            $i_22.Collision.Features,
            $i_22.Collision.IBroadPhase,
            $i_22.inherit(i, $i_22.Collision.Shapes.b2Shape),
            (i.prototype.__super = $i_22.Collision.Shapes.b2Shape.prototype),
            (i.b2CircleShape = function () {
                $i_22.Collision.Shapes.b2Shape.b2Shape.apply(this, arguments), (this.m_p = new c());
            }),
            (i.prototype.Copy = function () {
                var t = new i();
                return t.Set(this), t;
            }),
            (i.prototype.Set = function (t) {
                if ((this.__super.Set.call(this, t), $i_22.is(t, i))) {
                    var e = t instanceof i ? t : null;
                    this.m_p.SetV(e.m_p);
                }
            }),
            (i.prototype.TestPoint = function (t, i) {
                var e = t.R, o = t.position.x + (e.col1.x * this.m_p.x + e.col2.x * this.m_p.y), s = t.position.y + (e.col1.y * this.m_p.x + e.col2.y * this.m_p.y);
                return (o = i.x - o), (s = i.y - s), this.m_radius * this.m_radius >= o * o + s * s;
            }),
            (i.prototype.RayCast = function (t, i, e) {
                var o = e.R, s = e.position.x + (o.col1.x * this.m_p.x + o.col2.x * this.m_p.y), n = e.position.y + (o.col1.y * this.m_p.x + o.col2.y * this.m_p.y), r = i.p1.x - s, a = i.p1.y - n, h = r * r + a * a - this.m_radius * this.m_radius, l = i.p2.x - i.p1.x, c = i.p2.y - i.p1.y, _ = r * l + a * c, m = l * l + c * c, u = _ * _ - m * h;
                if (0 > u || Number.MIN_VALUE > m)
                    return !1;
                var p = -(_ + Math.sqrt(u));
                return 0 > p || p > i.maxFraction * m
                    ? !1
                    : ((p /= m),
                        (t.fraction = p),
                        (t.normal.x = r + p * l),
                        (t.normal.y = a + p * c),
                        t.normal.Normalize(),
                        !0);
            }),
            (i.prototype.ComputeAABB = function (t, i) {
                var e = i.R, o = i.position.x + (e.col1.x * this.m_p.x + e.col2.x * this.m_p.y), s = i.position.y + (e.col1.y * this.m_p.x + e.col2.y * this.m_p.y);
                t.lowerBound.Set(o - this.m_radius, s - this.m_radius),
                    t.upperBound.Set(o + this.m_radius, s + this.m_radius);
            }),
            (i.prototype.ComputeMass = function (i, e) {
                e === void 0 && (e = 0),
                    (i.mass = e * t.b2_pi * this.m_radius * this.m_radius),
                    i.center.SetV(this.m_p),
                    (i.I =
                        i.mass *
                            (0.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y)));
            }),
            (i.prototype.ComputeSubmergedArea = function (t, i, e, o) {
                i === void 0 && (i = 0);
                var s = h.MulX(e, this.m_p), n = -(h.Dot(t, s) - i);
                if (-this.m_radius + Number.MIN_VALUE > n)
                    return 0;
                if (n > this.m_radius)
                    return o.SetV(s), Math.PI * this.m_radius * this.m_radius;
                var r = this.m_radius * this.m_radius, a = n * n, l = r * (Math.asin(n / this.m_radius) + Math.PI / 2) + n * Math.sqrt(r - a), c = ((-2 / 3) * Math.pow(r - a, 1.5)) / l;
                return (o.x = s.x + t.x * c), (o.y = s.y + t.y * c), l;
            }),
            (i.prototype.GetLocalPosition = function () {
                return this.m_p;
            }),
            (i.prototype.SetLocalPosition = function (t) {
                this.m_p.SetV(t);
            }),
            (i.prototype.GetRadius = function () {
                return this.m_radius;
            }),
            (i.prototype.SetRadius = function (t) {
                t === void 0 && (t = 0), (this.m_radius = t);
            }),
            (i.prototype.b2CircleShape = function (t) {
                t === void 0 && (t = 0),
                    this.__super.b2Shape.call(this),
                    (this.m_type = r.e_circleShape),
                    (this.m_radius = t);
            }),
            (e.b2EdgeChainDef = function () { }),
            (e.prototype.b2EdgeChainDef = function () {
                (this.vertexCount = 0), (this.isALoop = !0), (this.vertices = []);
            }),
            $i_22.inherit(o, $i_22.Collision.Shapes.b2Shape),
            (o.prototype.__super = $i_22.Collision.Shapes.b2Shape.prototype),
            (o.b2EdgeShape = function () {
                $i_22.Collision.Shapes.b2Shape.b2Shape.apply(this, arguments),
                    (this.s_supportVec = new c()),
                    (this.m_v1 = new c()),
                    (this.m_v2 = new c()),
                    (this.m_coreV1 = new c()),
                    (this.m_coreV2 = new c()),
                    (this.m_normal = new c()),
                    (this.m_direction = new c()),
                    (this.m_cornerDir1 = new c()),
                    (this.m_cornerDir2 = new c());
            }),
            (o.prototype.TestPoint = function () {
                return !1;
            }),
            (o.prototype.RayCast = function (t, i, e) {
                var o, s = i.p2.x - i.p1.x, n = i.p2.y - i.p1.y;
                o = e.R;
                var r = e.position.x + (o.col1.x * this.m_v1.x + o.col2.x * this.m_v1.y), a = e.position.y + (o.col1.y * this.m_v1.x + o.col2.y * this.m_v1.y), h = e.position.y + (o.col1.y * this.m_v2.x + o.col2.y * this.m_v2.y) - a, l = -(e.position.x + (o.col1.x * this.m_v2.x + o.col2.x * this.m_v2.y) - r), c = 100 * Number.MIN_VALUE, _ = -(s * h + n * l);
                if (_ > c) {
                    var m = i.p1.x - r, u = i.p1.y - a, p = m * h + u * l;
                    if (p >= 0 && i.maxFraction * _ >= p) {
                        var d = -s * u + n * m;
                        if (d >= -c * _ && _ * (1 + c) >= d) {
                            (p /= _), (t.fraction = p);
                            var y = Math.sqrt(h * h + l * l);
                            return (t.normal.x = h / y), (t.normal.y = l / y), !0;
                        }
                    }
                }
                return !1;
            }),
            (o.prototype.ComputeAABB = function (t, i) {
                var e = i.R, o = i.position.x + (e.col1.x * this.m_v1.x + e.col2.x * this.m_v1.y), s = i.position.y + (e.col1.y * this.m_v1.x + e.col2.y * this.m_v1.y), n = i.position.x + (e.col1.x * this.m_v2.x + e.col2.x * this.m_v2.y), r = i.position.y + (e.col1.y * this.m_v2.x + e.col2.y * this.m_v2.y);
                n > o ? ((t.lowerBound.x = o), (t.upperBound.x = n)) : ((t.lowerBound.x = n), (t.upperBound.x = o)),
                    r > s ? ((t.lowerBound.y = s), (t.upperBound.y = r)) : ((t.lowerBound.y = r), (t.upperBound.y = s));
            }),
            (o.prototype.ComputeMass = function (t, i) {
                i === void 0 && (i = 0), (t.mass = 0), t.center.SetV(this.m_v1), (t.I = 0);
            }),
            (o.prototype.ComputeSubmergedArea = function (t, i, e, o) {
                i === void 0 && (i = 0);
                var s = new c(t.x * i, t.y * i), n = h.MulX(e, this.m_v1), r = h.MulX(e, this.m_v2), a = h.Dot(t, n) - i, l = h.Dot(t, r) - i;
                if (a > 0) {
                    if (l > 0)
                        return 0;
                    (n.x = (-l / (a - l)) * n.x + (a / (a - l)) * r.x),
                        (n.y = (-l / (a - l)) * n.y + (a / (a - l)) * r.y);
                }
                else
                    l > 0 &&
                        ((r.x = (-l / (a - l)) * n.x + (a / (a - l)) * r.x),
                            (r.y = (-l / (a - l)) * n.y + (a / (a - l)) * r.y));
                return ((o.x = (s.x + n.x + r.x) / 3),
                    (o.y = (s.y + n.y + r.y) / 3),
                    0.5 * ((n.x - s.x) * (r.y - s.y) - (n.y - s.y) * (r.x - s.x)));
            }),
            (o.prototype.GetLength = function () {
                return this.m_length;
            }),
            (o.prototype.GetVertex1 = function () {
                return this.m_v1;
            }),
            (o.prototype.GetVertex2 = function () {
                return this.m_v2;
            }),
            (o.prototype.GetCoreVertex1 = function () {
                return this.m_coreV1;
            }),
            (o.prototype.GetCoreVertex2 = function () {
                return this.m_coreV2;
            }),
            (o.prototype.GetNormalVector = function () {
                return this.m_normal;
            }),
            (o.prototype.GetDirectionVector = function () {
                return this.m_direction;
            }),
            (o.prototype.GetCorner1Vector = function () {
                return this.m_cornerDir1;
            }),
            (o.prototype.GetCorner2Vector = function () {
                return this.m_cornerDir2;
            }),
            (o.prototype.Corner1IsConvex = function () {
                return this.m_cornerConvex1;
            }),
            (o.prototype.Corner2IsConvex = function () {
                return this.m_cornerConvex2;
            }),
            (o.prototype.GetFirstVertex = function (t) {
                var i = t.R;
                return new c(t.position.x + (i.col1.x * this.m_coreV1.x + i.col2.x * this.m_coreV1.y), t.position.y + (i.col1.y * this.m_coreV1.x + i.col2.y * this.m_coreV1.y));
            }),
            (o.prototype.GetNextEdge = function () {
                return this.m_nextEdge;
            }),
            (o.prototype.GetPrevEdge = function () {
                return this.m_prevEdge;
            }),
            (o.prototype.Support = function (t, i, e) {
                i === void 0 && (i = 0), e === void 0 && (e = 0);
                var o = t.R, s = t.position.x + (o.col1.x * this.m_coreV1.x + o.col2.x * this.m_coreV1.y), n = t.position.y + (o.col1.y * this.m_coreV1.x + o.col2.y * this.m_coreV1.y), r = t.position.x + (o.col1.x * this.m_coreV2.x + o.col2.x * this.m_coreV2.y), a = t.position.y + (o.col1.y * this.m_coreV2.x + o.col2.y * this.m_coreV2.y);
                return (s * i + n * e > r * i + a * e
                    ? ((this.s_supportVec.x = s), (this.s_supportVec.y = n))
                    : ((this.s_supportVec.x = r), (this.s_supportVec.y = a)),
                    this.s_supportVec);
            }),
            (o.prototype.b2EdgeShape = function (i, e) {
                this.__super.b2Shape.call(this),
                    (this.m_type = r.e_edgeShape),
                    (this.m_prevEdge = null),
                    (this.m_nextEdge = null),
                    (this.m_v1 = i),
                    (this.m_v2 = e),
                    this.m_direction.Set(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y),
                    (this.m_length = this.m_direction.Normalize()),
                    this.m_normal.Set(this.m_direction.y, -this.m_direction.x),
                    this.m_coreV1.Set(-t.b2_toiSlop * (this.m_normal.x - this.m_direction.x) + this.m_v1.x, -t.b2_toiSlop * (this.m_normal.y - this.m_direction.y) + this.m_v1.y),
                    this.m_coreV2.Set(-t.b2_toiSlop * (this.m_normal.x + this.m_direction.x) + this.m_v2.x, -t.b2_toiSlop * (this.m_normal.y + this.m_direction.y) + this.m_v2.y),
                    (this.m_cornerDir1 = this.m_normal),
                    this.m_cornerDir2.Set(-this.m_normal.x, -this.m_normal.y);
            }),
            (o.prototype.SetPrevEdge = function (t, i, e, o) {
                (this.m_prevEdge = t), (this.m_coreV1 = i), (this.m_cornerDir1 = e), (this.m_cornerConvex1 = o);
            }),
            (o.prototype.SetNextEdge = function (t, i, e, o) {
                (this.m_nextEdge = t), (this.m_coreV2 = i), (this.m_cornerDir2 = e), (this.m_cornerConvex2 = o);
            }),
            (s.b2MassData = function () {
                (this.mass = 0), (this.center = new c(0, 0)), (this.I = 0);
            }),
            $i_22.inherit(n, $i_22.Collision.Shapes.b2Shape),
            (n.prototype.__super = $i_22.Collision.Shapes.b2Shape.prototype),
            (n.b2PolygonShape = function () {
                $i_22.Collision.Shapes.b2Shape.b2Shape.apply(this, arguments);
            }),
            (n.prototype.Copy = function () {
                var t = new n();
                return t.Set(this), t;
            }),
            (n.prototype.Set = function (t) {
                if ((this.__super.Set.call(this, t), $i_22.is(t, n))) {
                    var i = t instanceof n ? t : null;
                    this.m_centroid.SetV(i.m_centroid),
                        (this.m_vertexCount = i.m_vertexCount),
                        this.Reserve(this.m_vertexCount);
                    for (var e = 0; this.m_vertexCount > e; e++)
                        this.m_vertices[e].SetV(i.m_vertices[e]), this.m_normals[e].SetV(i.m_normals[e]);
                }
            }),
            (n.prototype.SetAsArray = function (t, i) {
                i === void 0 && (i = 0);
                var e, o = new Vector(), s = 0;
                for (s = 0; t.length > s; ++s)
                    (e = t[s]), o.push(e);
                this.SetAsVector(o, i);
            }),
            (n.AsArray = function (t, i) {
                i === void 0 && (i = 0);
                var e = new n();
                return e.SetAsArray(t, i), e;
            }),
            (n.prototype.SetAsVector = function (i, e) {
                e === void 0 && (e = 0),
                    e == 0 && (e = i.length),
                    t.b2Assert(e >= 2),
                    (this.m_vertexCount = e),
                    this.Reserve(e);
                var o = 0;
                for (o = 0; this.m_vertexCount > o; o++)
                    this.m_vertices[o].SetV(i[o]);
                for (o = 0; this.m_vertexCount > o; ++o) {
                    var s = parseInt(o), r = parseInt(this.m_vertexCount > o + 1 ? o + 1 : 0), a = h.SubtractVV(this.m_vertices[r], this.m_vertices[s]);
                    t.b2Assert(a.LengthSquared() > Number.MIN_VALUE),
                        this.m_normals[o].SetV(h.CrossVF(a, 1)),
                        this.m_normals[o].Normalize();
                }
                this.m_centroid = n.ComputeCentroid(this.m_vertices, this.m_vertexCount);
            }),
            (n.AsVector = function (t, i) {
                i === void 0 && (i = 0);
                var e = new n();
                return e.SetAsVector(t, i), e;
            }),
            (n.prototype.SetAsBox = function (t, i) {
                t === void 0 && (t = 0),
                    i === void 0 && (i = 0),
                    (this.m_vertexCount = 4),
                    this.Reserve(4),
                    this.m_vertices[0].Set(-t, -i),
                    this.m_vertices[1].Set(t, -i),
                    this.m_vertices[2].Set(t, i),
                    this.m_vertices[3].Set(-t, i),
                    this.m_normals[0].Set(0, -1),
                    this.m_normals[1].Set(1, 0),
                    this.m_normals[2].Set(0, 1),
                    this.m_normals[3].Set(-1, 0),
                    this.m_centroid.SetZero();
            }),
            (n.AsBox = function (t, i) {
                t === void 0 && (t = 0), i === void 0 && (i = 0);
                var e = new n();
                return e.SetAsBox(t, i), e;
            }),
            (n.prototype.SetAsOrientedBox = function (t, i, e, o) {
                t === void 0 && (t = 0),
                    i === void 0 && (i = 0),
                    e === void 0 && (e = null),
                    o === void 0 && (o = 0),
                    (this.m_vertexCount = 4),
                    this.Reserve(4),
                    this.m_vertices[0].Set(-t, -i),
                    this.m_vertices[1].Set(t, -i),
                    this.m_vertices[2].Set(t, i),
                    this.m_vertices[3].Set(-t, i),
                    this.m_normals[0].Set(0, -1),
                    this.m_normals[1].Set(1, 0),
                    this.m_normals[2].Set(0, 1),
                    this.m_normals[3].Set(-1, 0),
                    (this.m_centroid = e);
                var s = new l();
                (s.position = e), s.R.Set(o);
                for (var n = 0; this.m_vertexCount > n; ++n)
                    (this.m_vertices[n] = h.MulX(s, this.m_vertices[n])),
                        (this.m_normals[n] = h.MulMV(s.R, this.m_normals[n]));
            }),
            (n.AsOrientedBox = function (t, i, e, o) {
                t === void 0 && (t = 0), i === void 0 && (i = 0), e === void 0 && (e = null), o === void 0 && (o = 0);
                var s = new n();
                return s.SetAsOrientedBox(t, i, e, o), s;
            }),
            (n.prototype.SetAsEdge = function (t, i) {
                (this.m_vertexCount = 2),
                    this.Reserve(2),
                    this.m_vertices[0].SetV(t),
                    this.m_vertices[1].SetV(i),
                    (this.m_centroid.x = 0.5 * (t.x + i.x)),
                    (this.m_centroid.y = 0.5 * (t.y + i.y)),
                    (this.m_normals[0] = h.CrossVF(h.SubtractVV(i, t), 1)),
                    this.m_normals[0].Normalize(),
                    (this.m_normals[1].x = -this.m_normals[0].x),
                    (this.m_normals[1].y = -this.m_normals[0].y);
            }),
            (n.AsEdge = function (t, i) {
                var e = new n();
                return e.SetAsEdge(t, i), e;
            }),
            (n.prototype.TestPoint = function (t, i) {
                for (var e, o = t.R, s = i.x - t.position.x, n = i.y - t.position.y, r = s * o.col1.x + n * o.col1.y, a = s * o.col2.x + n * o.col2.y, h = 0; this.m_vertexCount > h; ++h) {
                    (e = this.m_vertices[h]), (s = r - e.x), (n = a - e.y), (e = this.m_normals[h]);
                    var l = e.x * s + e.y * n;
                    if (l > 0)
                        return !1;
                }
                return !0;
            }),
            (n.prototype.RayCast = function (t, i, e) {
                var o, s, n = 0, r = i.maxFraction, a = 0, h = 0;
                (a = i.p1.x - e.position.x), (h = i.p1.y - e.position.y), (o = e.R);
                var l = a * o.col1.x + h * o.col1.y, c = a * o.col2.x + h * o.col2.y;
                (a = i.p2.x - e.position.x), (h = i.p2.y - e.position.y), (o = e.R);
                for (var _ = a * o.col1.x + h * o.col1.y, m = a * o.col2.x + h * o.col2.y, u = _ - l, p = m - c, d = parseInt(-1), y = 0; this.m_vertexCount > y; ++y) {
                    (s = this.m_vertices[y]), (a = s.x - l), (h = s.y - c), (s = this.m_normals[y]);
                    var x = s.x * a + s.y * h, f = s.x * u + s.y * p;
                    if (f == 0) {
                        if (0 > x)
                            return !1;
                    }
                    else
                        0 > f && n * f > x ? ((n = x / f), (d = y)) : f > 0 && r * f > x && (r = x / f);
                    if (n - Number.MIN_VALUE > r)
                        return !1;
                }
                return 0 > d
                    ? !1
                    : ((t.fraction = n),
                        (o = e.R),
                        (s = this.m_normals[d]),
                        (t.normal.x = o.col1.x * s.x + o.col2.x * s.y),
                        (t.normal.y = o.col1.y * s.x + o.col2.y * s.y),
                        !0);
            }),
            (n.prototype.ComputeAABB = function (t, i) {
                for (var e = i.R, o = this.m_vertices[0], s = i.position.x + (e.col1.x * o.x + e.col2.x * o.y), n = i.position.y + (e.col1.y * o.x + e.col2.y * o.y), r = s, a = n, h = 1; this.m_vertexCount > h; ++h) {
                    o = this.m_vertices[h];
                    var l = i.position.x + (e.col1.x * o.x + e.col2.x * o.y), c = i.position.y + (e.col1.y * o.x + e.col2.y * o.y);
                    (s = l > s ? s : l), (n = c > n ? n : c), (r = r > l ? r : l), (a = a > c ? a : c);
                }
                (t.lowerBound.x = s - this.m_radius),
                    (t.lowerBound.y = n - this.m_radius),
                    (t.upperBound.x = r + this.m_radius),
                    (t.upperBound.y = a + this.m_radius);
            }),
            (n.prototype.ComputeMass = function (t, i) {
                if ((i === void 0 && (i = 0), this.m_vertexCount == 2))
                    return ((t.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x)),
                        (t.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y)),
                        (t.mass = 0),
                        (t.I = 0),
                        void 0);
                for (var e = 0, o = 0, s = 0, n = 0, r = 0, a = 0, h = 1 / 3, l = 0; this.m_vertexCount > l; ++l) {
                    var c = this.m_vertices[l], _ = this.m_vertexCount > l + 1 ? this.m_vertices[parseInt(l + 1)] : this.m_vertices[0], m = c.x - r, u = c.y - a, p = _.x - r, d = _.y - a, y = m * d - u * p, x = 0.5 * y;
                    (s += x), (e += x * h * (r + c.x + _.x)), (o += x * h * (a + c.y + _.y));
                    var f = r, g = a, b = m, v = u, w = p, C = d, D = h * (0.25 * (b * b + w * b + w * w) + (f * b + f * w)) + 0.5 * f * f, B = h * (0.25 * (v * v + C * v + C * C) + (g * v + g * C)) + 0.5 * g * g;
                    n += y * (D + B);
                }
                (t.mass = i * s), (e *= 1 / s), (o *= 1 / s), t.center.Set(e, o), (t.I = i * n);
            }),
            (n.prototype.ComputeSubmergedArea = function (t, i, e, o) {
                i === void 0 && (i = 0);
                var n = h.MulTMV(e.R, t), r = i - h.Dot(t, e.position), a = new Vector_a2j_Number(), l = 0, _ = parseInt(-1), m = parseInt(-1), u = !1, p = 0;
                for (p = 0; this.m_vertexCount > p; ++p) {
                    a[p] = h.Dot(n, this.m_vertices[p]) - r;
                    var d = -Number.MIN_VALUE > a[p];
                    p > 0 && (d ? u || ((_ = p - 1), l++) : u && ((m = p - 1), l++)), (u = d);
                }
                switch (l) {
                    case 0:
                        if (u) {
                            var y = new s();
                            return this.ComputeMass(y, 1), o.SetV(h.MulX(e, y.center)), y.mass;
                        }
                        return 0;
                    case 1:
                        _ == -1 ? (_ = this.m_vertexCount - 1) : (m = this.m_vertexCount - 1);
                }
                var x, f = parseInt((_ + 1) % this.m_vertexCount), g = parseInt((m + 1) % this.m_vertexCount), b = (0 - a[_]) / (a[f] - a[_]), v = (0 - a[m]) / (a[g] - a[m]), w = new c(this.m_vertices[_].x * (1 - b) + this.m_vertices[f].x * b, this.m_vertices[_].y * (1 - b) + this.m_vertices[f].y * b), C = new c(this.m_vertices[m].x * (1 - v) + this.m_vertices[g].x * v, this.m_vertices[m].y * (1 - v) + this.m_vertices[g].y * v), D = 0, B = new c(), S = this.m_vertices[f];
                p = f;
                while (p != g) {
                    (p = (p + 1) % this.m_vertexCount), (x = p == g ? C : this.m_vertices[p]);
                    var I = 0.5 * ((S.x - w.x) * (x.y - w.y) - (S.y - w.y) * (x.x - w.x));
                    (D += I), (B.x += (I * (w.x + S.x + x.x)) / 3), (B.y += (I * (w.y + S.y + x.y)) / 3), (S = x);
                }
                return B.Multiply(1 / D), o.SetV(h.MulX(e, B)), D;
            }),
            (n.prototype.GetVertexCount = function () {
                return this.m_vertexCount;
            }),
            (n.prototype.GetVertices = function () {
                return this.m_vertices;
            }),
            (n.prototype.GetNormals = function () {
                return this.m_normals;
            }),
            (n.prototype.GetSupport = function (t) {
                for (var i = 0, e = this.m_vertices[0].x * t.x + this.m_vertices[0].y * t.y, o = 1; this.m_vertexCount > o; ++o) {
                    var s = this.m_vertices[o].x * t.x + this.m_vertices[o].y * t.y;
                    s > e && ((i = o), (e = s));
                }
                return i;
            }),
            (n.prototype.GetSupportVertex = function (t) {
                for (var i = 0, e = this.m_vertices[0].x * t.x + this.m_vertices[0].y * t.y, o = 1; this.m_vertexCount > o; ++o) {
                    var s = this.m_vertices[o].x * t.x + this.m_vertices[o].y * t.y;
                    s > e && ((i = o), (e = s));
                }
                return this.m_vertices[i];
            }),
            (n.prototype.Validate = function () {
                return !1;
            }),
            (n.prototype.b2PolygonShape = function () {
                this.__super.b2Shape.call(this),
                    (this.m_type = r.e_polygonShape),
                    (this.m_centroid = new c()),
                    (this.m_vertices = new Vector()),
                    (this.m_normals = new Vector());
            }),
            (n.prototype.Reserve = function (t) {
                t === void 0 && (t = 0);
                for (var i = parseInt(this.m_vertices.length); t > i; i++)
                    (this.m_vertices[i] = new c()), (this.m_normals[i] = new c());
            }),
            (n.ComputeCentroid = function (t, i) {
                i === void 0 && (i = 0);
                for (var e = new c(), o = 0, s = 0, n = 0, r = 1 / 3, a = 0; i > a; ++a) {
                    var h = t[a], l = i > a + 1 ? t[parseInt(a + 1)] : t[0], _ = h.x - s, m = h.y - n, u = l.x - s, p = l.y - n, d = _ * p - m * u, y = 0.5 * d;
                    (o += y), (e.x += y * r * (s + h.x + l.x)), (e.y += y * r * (n + h.y + l.y));
                }
                return (e.x *= 1 / o), (e.y *= 1 / o), e;
            }),
            (n.ComputeOBB = function (t, i, e) {
                e === void 0 && (e = 0);
                var o = 0, s = new Vector(e + 1);
                for (o = 0; e > o; ++o)
                    s[o] = i[o];
                s[e] = s[0];
                var n = Number.MAX_VALUE;
                for (o = 1; e >= o; ++o) {
                    var r = s[parseInt(o - 1)], a = s[o].x - r.x, h = s[o].y - r.y, l = Math.sqrt(a * a + h * h);
                    (a /= l), (h /= l);
                    for (var c = -h, _ = a, m = Number.MAX_VALUE, u = Number.MAX_VALUE, p = -Number.MAX_VALUE, d = -Number.MAX_VALUE, y = 0; e > y; ++y) {
                        var x = s[y].x - r.x, f = s[y].y - r.y, g = a * x + h * f, b = c * x + _ * f;
                        m > g && (m = g), u > b && (u = b), g > p && (p = g), b > d && (d = b);
                    }
                    var v = (p - m) * (d - u);
                    if (0.95 * n > v) {
                        (n = v), (t.R.col1.x = a), (t.R.col1.y = h), (t.R.col2.x = c), (t.R.col2.y = _);
                        var w = 0.5 * (m + p), C = 0.5 * (u + d), D = t.R;
                        (t.center.x = r.x + (D.col1.x * w + D.col2.x * C)),
                            (t.center.y = r.y + (D.col1.y * w + D.col2.y * C)),
                            (t.extents.x = 0.5 * (p - m)),
                            (t.extents.y = 0.5 * (d - u));
                    }
                }
            }),
            $i_22.postDefs.push(function () {
                $i_22.Collision.Shapes.b2PolygonShape.s_mat = new a();
            }),
            (r.b2Shape = function () { }),
            (r.prototype.Copy = function () {
                return null;
            }),
            (r.prototype.Set = function (t) {
                this.m_radius = t.m_radius;
            }),
            (r.prototype.GetType = function () {
                return this.m_type;
            }),
            (r.prototype.TestPoint = function () {
                return !1;
            }),
            (r.prototype.RayCast = function () {
                return !1;
            }),
            (r.prototype.ComputeAABB = function () { }),
            (r.prototype.ComputeMass = function (t, i) {
                i === void 0 && (i = 0);
            }),
            (r.prototype.ComputeSubmergedArea = function (t, i) {
                return i === void 0 && (i = 0), 0;
            }),
            (r.TestOverlap = function (t, i, e, o) {
                var s = new m();
                (s.proxyA = new p()),
                    s.proxyA.Set(t),
                    (s.proxyB = new p()),
                    s.proxyB.Set(e),
                    (s.transformA = i),
                    (s.transformB = o),
                    (s.useRadii = !0);
                var n = new d();
                n.count = 0;
                var r = new u();
                return _.Distance(r, n, s), 10 * Number.MIN_VALUE > r.distance;
            }),
            (r.prototype.b2Shape = function () {
                (this.m_type = r.e_unknownShape), (this.m_radius = t.b2_linearSlop);
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Collision.Shapes.b2Shape.e_unknownShape = parseInt(-1)),
                    ($i_22.Collision.Shapes.b2Shape.e_circleShape = 0),
                    ($i_22.Collision.Shapes.b2Shape.e_polygonShape = 1),
                    ($i_22.Collision.Shapes.b2Shape.e_edgeShape = 2),
                    ($i_22.Collision.Shapes.b2Shape.e_shapeTypeCount = 3),
                    ($i_22.Collision.Shapes.b2Shape.e_hitCollide = 1),
                    ($i_22.Collision.Shapes.b2Shape.e_missCollide = 0),
                    ($i_22.Collision.Shapes.b2Shape.e_startsInsideCollide = parseInt(-1));
            });
    })(),
    (function () {
        var t = $i_22.Common.b2Color, i = ($i_22.Common.b2internal, $i_22.Common.b2Settings), e = ($i_22.Common.Math.b2Mat22, $i_22.Common.Math.b2Mat33, $i_22.Common.Math.b2Math);
        $i_22.Common.Math.b2Sweep,
            $i_22.Common.Math.b2Transform,
            $i_22.Common.Math.b2Vec2,
            $i_22.Common.Math.b2Vec3,
            (t.b2Color = function () {
                (this._r = 0), (this._g = 0), (this._b = 0);
            }),
            (t.prototype.b2Color = function (t, i, o) {
                t === void 0 && (t = 0),
                    i === void 0 && (i = 0),
                    o === void 0 && (o = 0),
                    (this._r = $i_22.parseUInt(255 * e.Clamp(t, 0, 1))),
                    (this._g = $i_22.parseUInt(255 * e.Clamp(i, 0, 1))),
                    (this._b = $i_22.parseUInt(255 * e.Clamp(o, 0, 1)));
            }),
            (t.prototype.Set = function (t, i, o) {
                t === void 0 && (t = 0),
                    i === void 0 && (i = 0),
                    o === void 0 && (o = 0),
                    (this._r = $i_22.parseUInt(255 * e.Clamp(t, 0, 1))),
                    (this._g = $i_22.parseUInt(255 * e.Clamp(i, 0, 1))),
                    (this._b = $i_22.parseUInt(255 * e.Clamp(o, 0, 1)));
            }),
            Object.defineProperty(t.prototype, "r", {
                enumerable: !1,
                configurable: !0,
                set: function (t) {
                    t === void 0 && (t = 0), (this._r = $i_22.parseUInt(255 * e.Clamp(t, 0, 1)));
                }
            }),
            Object.defineProperty(t.prototype, "g", {
                enumerable: !1,
                configurable: !0,
                set: function (t) {
                    t === void 0 && (t = 0), (this._g = $i_22.parseUInt(255 * e.Clamp(t, 0, 1)));
                }
            }),
            Object.defineProperty(t.prototype, "b", {
                enumerable: !1,
                configurable: !0,
                set: function (t) {
                    t === void 0 && (t = 0), (this._b = $i_22.parseUInt(255 * e.Clamp(t, 0, 1)));
                }
            }),
            Object.defineProperty(t.prototype, "color", {
                enumerable: !1,
                configurable: !0,
                get: function () {
                    return (this._r << 16) | (this._g << 8) | this._b;
                }
            }),
            (i.b2Settings = function () { }),
            (i.b2MixFriction = function (t, i) {
                return t === void 0 && (t = 0), i === void 0 && (i = 0), Math.sqrt(t * i);
            }),
            (i.b2MixRestitution = function (t, i) {
                return t === void 0 && (t = 0), i === void 0 && (i = 0), t > i ? t : i;
            }),
            (i.b2Assert = function (t) {
                if (!t)
                    throw "Assertion Failed";
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Common.b2Settings.VERSION = "2.1alpha"),
                    ($i_22.Common.b2Settings.USHRT_MAX = 65535),
                    ($i_22.Common.b2Settings.b2_pi = Math.PI),
                    ($i_22.Common.b2Settings.b2_maxManifoldPoints = 2),
                    ($i_22.Common.b2Settings.b2_aabbExtension = 0.1),
                    ($i_22.Common.b2Settings.b2_aabbMultiplier = 2),
                    ($i_22.Common.b2Settings.b2_polygonRadius = 2 * i.b2_linearSlop),
                    ($i_22.Common.b2Settings.b2_linearSlop = 0.005),
                    ($i_22.Common.b2Settings.b2_angularSlop = (2 / 180) * i.b2_pi),
                    ($i_22.Common.b2Settings.b2_toiSlop = 8 * i.b2_linearSlop),
                    ($i_22.Common.b2Settings.b2_maxTOIContactsPerIsland = 32),
                    ($i_22.Common.b2Settings.b2_maxTOIJointsPerIsland = 32),
                    ($i_22.Common.b2Settings.b2_velocityThreshold = 1),
                    ($i_22.Common.b2Settings.b2_maxLinearCorrection = 0.2),
                    ($i_22.Common.b2Settings.b2_maxAngularCorrection = (8 / 180) * i.b2_pi),
                    ($i_22.Common.b2Settings.b2_maxTranslation = 2),
                    ($i_22.Common.b2Settings.b2_maxTranslationSquared = i.b2_maxTranslation * i.b2_maxTranslation),
                    ($i_22.Common.b2Settings.b2_maxRotation = 0.5 * i.b2_pi),
                    ($i_22.Common.b2Settings.b2_maxRotationSquared = i.b2_maxRotation * i.b2_maxRotation),
                    ($i_22.Common.b2Settings.b2_contactBaumgarte = 0.2),
                    ($i_22.Common.b2Settings.b2_timeToSleep = 0.5),
                    ($i_22.Common.b2Settings.b2_linearSleepTolerance = 0.01),
                    ($i_22.Common.b2Settings.b2_angularSleepTolerance = (2 / 180) * i.b2_pi);
            });
    })(),
    (function () {
        var t = ($i_22.Collision.b2AABB,
            $i_22.Common.b2Color,
            $i_22.Common.b2internal,
            $i_22.Common.b2Settings,
            $i_22.Common.Math.b2Mat22), i = $i_22.Common.Math.b2Mat33, e = $i_22.Common.Math.b2Math, o = $i_22.Common.Math.b2Sweep, s = $i_22.Common.Math.b2Transform, n = $i_22.Common.Math.b2Vec2, r = $i_22.Common.Math.b2Vec3;
        (t.b2Mat22 = function () {
            (this.col1 = new n()), (this.col2 = new n());
        }),
            (t.prototype.b2Mat22 = function () {
                this.SetIdentity();
            }),
            (t.FromAngle = function (i) {
                i === void 0 && (i = 0);
                var e = new t();
                return e.Set(i), e;
            }),
            (t.FromVV = function (i, e) {
                var o = new t();
                return o.SetVV(i, e), o;
            }),
            (t.prototype.Set = function (t) {
                t === void 0 && (t = 0);
                var i = Math.cos(t), e = Math.sin(t);
                (this.col1.x = i), (this.col2.x = -e), (this.col1.y = e), (this.col2.y = i);
            }),
            (t.prototype.SetVV = function (t, i) {
                this.col1.SetV(t), this.col2.SetV(i);
            }),
            (t.prototype.Copy = function () {
                var i = new t();
                return i.SetM(this), i;
            }),
            (t.prototype.SetM = function (t) {
                this.col1.SetV(t.col1), this.col2.SetV(t.col2);
            }),
            (t.prototype.AddM = function (t) {
                (this.col1.x += t.col1.x),
                    (this.col1.y += t.col1.y),
                    (this.col2.x += t.col2.x),
                    (this.col2.y += t.col2.y);
            }),
            (t.prototype.SetIdentity = function () {
                (this.col1.x = 1), (this.col2.x = 0), (this.col1.y = 0), (this.col2.y = 1);
            }),
            (t.prototype.SetZero = function () {
                (this.col1.x = 0), (this.col2.x = 0), (this.col1.y = 0), (this.col2.y = 0);
            }),
            (t.prototype.GetAngle = function () {
                return Math.atan2(this.col1.y, this.col1.x);
            }),
            (t.prototype.GetInverse = function (t) {
                var i = this.col1.x, e = this.col2.x, o = this.col1.y, s = this.col2.y, n = i * s - e * o;
                return (n != 0 && (n = 1 / n),
                    (t.col1.x = n * s),
                    (t.col2.x = -n * e),
                    (t.col1.y = -n * o),
                    (t.col2.y = n * i),
                    t);
            }),
            (t.prototype.Solve = function (t, i, e) {
                i === void 0 && (i = 0), e === void 0 && (e = 0);
                var o = this.col1.x, s = this.col2.x, n = this.col1.y, r = this.col2.y, a = o * r - s * n;
                return a != 0 && (a = 1 / a), (t.x = a * (r * i - s * e)), (t.y = a * (o * e - n * i)), t;
            }),
            (t.prototype.Abs = function () {
                this.col1.Abs(), this.col2.Abs();
            }),
            (i.b2Mat33 = function () {
                (this.col1 = new r()), (this.col2 = new r()), (this.col3 = new r());
            }),
            (i.prototype.b2Mat33 = function (t, i, e) {
                t === void 0 && (t = null),
                    i === void 0 && (i = null),
                    e === void 0 && (e = null),
                    t || i || e
                        ? (this.col1.SetV(t), this.col2.SetV(i), this.col3.SetV(e))
                        : (this.col1.SetZero(), this.col2.SetZero(), this.col3.SetZero());
            }),
            (i.prototype.SetVVV = function (t, i, e) {
                this.col1.SetV(t), this.col2.SetV(i), this.col3.SetV(e);
            }),
            (i.prototype.Copy = function () {
                return new i(this.col1, this.col2, this.col3);
            }),
            (i.prototype.SetM = function (t) {
                this.col1.SetV(t.col1), this.col2.SetV(t.col2), this.col3.SetV(t.col3);
            }),
            (i.prototype.AddM = function (t) {
                (this.col1.x += t.col1.x),
                    (this.col1.y += t.col1.y),
                    (this.col1.z += t.col1.z),
                    (this.col2.x += t.col2.x),
                    (this.col2.y += t.col2.y),
                    (this.col2.z += t.col2.z),
                    (this.col3.x += t.col3.x),
                    (this.col3.y += t.col3.y),
                    (this.col3.z += t.col3.z);
            }),
            (i.prototype.SetIdentity = function () {
                (this.col1.x = 1),
                    (this.col2.x = 0),
                    (this.col3.x = 0),
                    (this.col1.y = 0),
                    (this.col2.y = 1),
                    (this.col3.y = 0),
                    (this.col1.z = 0),
                    (this.col2.z = 0),
                    (this.col3.z = 1);
            }),
            (i.prototype.SetZero = function () {
                (this.col1.x = 0),
                    (this.col2.x = 0),
                    (this.col3.x = 0),
                    (this.col1.y = 0),
                    (this.col2.y = 0),
                    (this.col3.y = 0),
                    (this.col1.z = 0),
                    (this.col2.z = 0),
                    (this.col3.z = 0);
            }),
            (i.prototype.Solve22 = function (t, i, e) {
                i === void 0 && (i = 0), e === void 0 && (e = 0);
                var o = this.col1.x, s = this.col2.x, n = this.col1.y, r = this.col2.y, a = o * r - s * n;
                return a != 0 && (a = 1 / a), (t.x = a * (r * i - s * e)), (t.y = a * (o * e - n * i)), t;
            }),
            (i.prototype.Solve33 = function (t, i, e, o) {
                i === void 0 && (i = 0), e === void 0 && (e = 0), o === void 0 && (o = 0);
                var s = this.col1.x, n = this.col1.y, r = this.col1.z, a = this.col2.x, h = this.col2.y, l = this.col2.z, c = this.col3.x, _ = this.col3.y, m = this.col3.z, u = s * (h * m - l * _) + n * (l * c - a * m) + r * (a * _ - h * c);
                return (u != 0 && (u = 1 / u),
                    (t.x = u * (i * (h * m - l * _) + e * (l * c - a * m) + o * (a * _ - h * c))),
                    (t.y = u * (s * (e * m - o * _) + n * (o * c - i * m) + r * (i * _ - e * c))),
                    (t.z = u * (s * (h * o - l * e) + n * (l * i - a * o) + r * (a * e - h * i))),
                    t);
            }),
            (e.b2Math = function () { }),
            (e.IsValid = function (t) {
                return t === void 0 && (t = 0), isFinite(t);
            }),
            (e.Dot = function (t, i) {
                return t.x * i.x + t.y * i.y;
            }),
            (e.CrossVV = function (t, i) {
                return t.x * i.y - t.y * i.x;
            }),
            (e.CrossVF = function (t, i) {
                i === void 0 && (i = 0);
                var e = new n(i * t.y, -i * t.x);
                return e;
            }),
            (e.CrossFV = function (t, i) {
                t === void 0 && (t = 0);
                var e = new n(-t * i.y, t * i.x);
                return e;
            }),
            (e.MulMV = function (t, i) {
                var e = new n(t.col1.x * i.x + t.col2.x * i.y, t.col1.y * i.x + t.col2.y * i.y);
                return e;
            }),
            (e.MulTMV = function (t, i) {
                var o = new n(e.Dot(i, t.col1), e.Dot(i, t.col2));
                return o;
            }),
            (e.MulX = function (t, i) {
                var o = e.MulMV(t.R, i);
                return (o.x += t.position.x), (o.y += t.position.y), o;
            }),
            (e.MulXT = function (t, i) {
                var o = e.SubtractVV(i, t.position), s = o.x * t.R.col1.x + o.y * t.R.col1.y;
                return (o.y = o.x * t.R.col2.x + o.y * t.R.col2.y), (o.x = s), o;
            }),
            (e.AddVV = function (t, i) {
                var e = new n(t.x + i.x, t.y + i.y);
                return e;
            }),
            (e.SubtractVV = function (t, i) {
                var e = new n(t.x - i.x, t.y - i.y);
                return e;
            }),
            (e.Distance = function (t, i) {
                var e = t.x - i.x, o = t.y - i.y;
                return Math.sqrt(e * e + o * o);
            }),
            (e.DistanceSquared = function (t, i) {
                var e = t.x - i.x, o = t.y - i.y;
                return e * e + o * o;
            }),
            (e.MulFV = function (t, i) {
                t === void 0 && (t = 0);
                var e = new n(t * i.x, t * i.y);
                return e;
            }),
            (e.AddMM = function (i, o) {
                var s = t.FromVV(e.AddVV(i.col1, o.col1), e.AddVV(i.col2, o.col2));
                return s;
            }),
            (e.MulMM = function (i, o) {
                var s = t.FromVV(e.MulMV(i, o.col1), e.MulMV(i, o.col2));
                return s;
            }),
            (e.MulTMM = function (i, o) {
                var s = new n(e.Dot(i.col1, o.col1), e.Dot(i.col2, o.col1)), r = new n(e.Dot(i.col1, o.col2), e.Dot(i.col2, o.col2)), a = t.FromVV(s, r);
                return a;
            }),
            (e.Abs = function (t) {
                return t === void 0 && (t = 0), t > 0 ? t : -t;
            }),
            (e.AbsV = function (t) {
                var i = new n(e.Abs(t.x), e.Abs(t.y));
                return i;
            }),
            (e.AbsM = function (i) {
                var o = t.FromVV(e.AbsV(i.col1), e.AbsV(i.col2));
                return o;
            }),
            (e.Min = function (t, i) {
                return t === void 0 && (t = 0), i === void 0 && (i = 0), i > t ? t : i;
            }),
            (e.MinV = function (t, i) {
                var o = new n(e.Min(t.x, i.x), e.Min(t.y, i.y));
                return o;
            }),
            (e.Max = function (t, i) {
                return t === void 0 && (t = 0), i === void 0 && (i = 0), t > i ? t : i;
            }),
            (e.MaxV = function (t, i) {
                var o = new n(e.Max(t.x, i.x), e.Max(t.y, i.y));
                return o;
            }),
            (e.Clamp = function (t, i, e) {
                return (t === void 0 && (t = 0), i === void 0 && (i = 0), e === void 0 && (e = 0), i > t ? i : t > e ? e : t);
            }),
            (e.ClampV = function (t, i, o) {
                return e.MaxV(i, e.MinV(t, o));
            }),
            (e.Swap = function (t, i) {
                var e = t[0];
                (t[0] = i[0]), (i[0] = e);
            }),
            (e.Random = function () {
                return Math.random() * 2 - 1;
            }),
            (e.RandomRange = function (t, i) {
                t === void 0 && (t = 0), i === void 0 && (i = 0);
                var e = Math.random();
                return (e = (i - t) * e + t);
            }),
            (e.NextPowerOfTwo = function (t) {
                return (t === void 0 && (t = 0),
                    (t |= (t >> 1) & 2147483647),
                    (t |= (t >> 2) & 1073741823),
                    (t |= (t >> 4) & 268435455),
                    (t |= (t >> 8) & 16777215),
                    (t |= (t >> 16) & 65535),
                    t + 1);
            }),
            (e.IsPowerOfTwo = function (t) {
                t === void 0 && (t = 0);
                var i = t > 0 && (t & (t - 1)) == 0;
                return i;
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Common.Math.b2Math.b2Vec2_zero = new n(0, 0)),
                    ($i_22.Common.Math.b2Math.b2Mat22_identity = t.FromVV(new n(1, 0), new n(0, 1))),
                    ($i_22.Common.Math.b2Math.b2Transform_identity = new s(e.b2Vec2_zero, e.b2Mat22_identity));
            }),
            (o.b2Sweep = function () {
                (this.localCenter = new n()), (this.c0 = new n()), (this.c = new n());
            }),
            (o.prototype.Set = function (t) {
                this.localCenter.SetV(t.localCenter),
                    this.c0.SetV(t.c0),
                    this.c.SetV(t.c),
                    (this.a0 = t.a0),
                    (this.a = t.a),
                    (this.t0 = t.t0);
            }),
            (o.prototype.Copy = function () {
                var t = new o();
                return (t.localCenter.SetV(this.localCenter),
                    t.c0.SetV(this.c0),
                    t.c.SetV(this.c),
                    (t.a0 = this.a0),
                    (t.a = this.a),
                    (t.t0 = this.t0),
                    t);
            }),
            (o.prototype.GetTransform = function (t, i) {
                i === void 0 && (i = 0),
                    (t.position.x = (1 - i) * this.c0.x + i * this.c.x),
                    (t.position.y = (1 - i) * this.c0.y + i * this.c.y);
                var e = (1 - i) * this.a0 + i * this.a;
                t.R.Set(e);
                var o = t.R;
                (t.position.x -= o.col1.x * this.localCenter.x + o.col2.x * this.localCenter.y),
                    (t.position.y -= o.col1.y * this.localCenter.x + o.col2.y * this.localCenter.y);
            }),
            (o.prototype.Advance = function (t) {
                if ((t === void 0 && (t = 0), t > this.t0 && 1 - this.t0 > Number.MIN_VALUE)) {
                    var i = (t - this.t0) / (1 - this.t0);
                    (this.c0.x = (1 - i) * this.c0.x + i * this.c.x),
                        (this.c0.y = (1 - i) * this.c0.y + i * this.c.y),
                        (this.a0 = (1 - i) * this.a0 + i * this.a),
                        (this.t0 = t);
                }
            }),
            (s.b2Transform = function () {
                (this.position = new n()), (this.R = new t());
            }),
            (s.prototype.b2Transform = function (t, i) {
                t === void 0 && (t = null), i === void 0 && (i = null), t && (this.position.SetV(t), this.R.SetM(i));
            }),
            (s.prototype.Initialize = function (t, i) {
                this.position.SetV(t), this.R.SetM(i);
            }),
            (s.prototype.SetIdentity = function () {
                this.position.SetZero(), this.R.SetIdentity();
            }),
            (s.prototype.Set = function (t) {
                this.position.SetV(t.position), this.R.SetM(t.R);
            }),
            (s.prototype.GetAngle = function () {
                return Math.atan2(this.R.col1.y, this.R.col1.x);
            }),
            (n.b2Vec2 = function () { }),
            (n.prototype.b2Vec2 = function (t, i) {
                t === void 0 && (t = 0), i === void 0 && (i = 0), (this.x = t), (this.y = i);
            }),
            (n.prototype.SetZero = function () {
                (this.x = 0), (this.y = 0);
            }),
            (n.prototype.Set = function (t, i) {
                t === void 0 && (t = 0), i === void 0 && (i = 0), (this.x = t), (this.y = i);
            }),
            (n.prototype.SetV = function (t) {
                (this.x = t.x), (this.y = t.y);
            }),
            (n.prototype.GetNegative = function () {
                return new n(-this.x, -this.y);
            }),
            (n.prototype.NegativeSelf = function () {
                (this.x = -this.x), (this.y = -this.y);
            }),
            (n.Make = function (t, i) {
                return t === void 0 && (t = 0), i === void 0 && (i = 0), new n(t, i);
            }),
            (n.prototype.Copy = function () {
                return new n(this.x, this.y);
            }),
            (n.prototype.Add = function (t) {
                (this.x += t.x), (this.y += t.y);
            }),
            (n.prototype.Subtract = function (t) {
                (this.x -= t.x), (this.y -= t.y);
            }),
            (n.prototype.Multiply = function (t) {
                t === void 0 && (t = 0), (this.x *= t), (this.y *= t);
            }),
            (n.prototype.MulM = function (t) {
                var i = this.x;
                (this.x = t.col1.x * i + t.col2.x * this.y), (this.y = t.col1.y * i + t.col2.y * this.y);
            }),
            (n.prototype.MulTM = function (t) {
                var i = e.Dot(this, t.col1);
                (this.y = e.Dot(this, t.col2)), (this.x = i);
            }),
            (n.prototype.CrossVF = function (t) {
                t === void 0 && (t = 0);
                var i = this.x;
                (this.x = t * this.y), (this.y = -t * i);
            }),
            (n.prototype.CrossFV = function (t) {
                t === void 0 && (t = 0);
                var i = this.x;
                (this.x = -t * this.y), (this.y = t * i);
            }),
            (n.prototype.MinV = function (t) {
                (this.x = t.x > this.x ? this.x : t.x), (this.y = t.y > this.y ? this.y : t.y);
            }),
            (n.prototype.MaxV = function (t) {
                (this.x = this.x > t.x ? this.x : t.x), (this.y = this.y > t.y ? this.y : t.y);
            }),
            (n.prototype.Abs = function () {
                0 > this.x && (this.x = -this.x), 0 > this.y && (this.y = -this.y);
            }),
            (n.prototype.Length = function () {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            }),
            (n.prototype.LengthSquared = function () {
                return this.x * this.x + this.y * this.y;
            }),
            (n.prototype.Normalize = function () {
                var t = Math.sqrt(this.x * this.x + this.y * this.y);
                if (Number.MIN_VALUE > t)
                    return 0;
                var i = 1 / t;
                return (this.x *= i), (this.y *= i), t;
            }),
            (n.prototype.IsValid = function () {
                return e.IsValid(this.x) && e.IsValid(this.y);
            }),
            (r.b2Vec3 = function () { }),
            (r.prototype.b2Vec3 = function (t, i, e) {
                t === void 0 && (t = 0),
                    i === void 0 && (i = 0),
                    e === void 0 && (e = 0),
                    (this.x = t),
                    (this.y = i),
                    (this.z = e);
            }),
            (r.prototype.SetZero = function () {
                this.x = this.y = this.z = 0;
            }),
            (r.prototype.Set = function (t, i, e) {
                t === void 0 && (t = 0),
                    i === void 0 && (i = 0),
                    e === void 0 && (e = 0),
                    (this.x = t),
                    (this.y = i),
                    (this.z = e);
            }),
            (r.prototype.SetV = function (t) {
                (this.x = t.x), (this.y = t.y), (this.z = t.z);
            }),
            (r.prototype.GetNegative = function () {
                return new r(-this.x, -this.y, -this.z);
            }),
            (r.prototype.NegativeSelf = function () {
                (this.x = -this.x), (this.y = -this.y), (this.z = -this.z);
            }),
            (r.prototype.Copy = function () {
                return new r(this.x, this.y, this.z);
            }),
            (r.prototype.Add = function (t) {
                (this.x += t.x), (this.y += t.y), (this.z += t.z);
            }),
            (r.prototype.Subtract = function (t) {
                (this.x -= t.x), (this.y -= t.y), (this.z -= t.z);
            }),
            (r.prototype.Multiply = function (t) {
                t === void 0 && (t = 0), (this.x *= t), (this.y *= t), (this.z *= t);
            });
    })(),
    (function () {
        var t = ($i_22.Dynamics.Controllers.b2ControllerEdge,
            $i_22.Common.Math.b2Mat22,
            $i_22.Common.Math.b2Mat33,
            $i_22.Common.Math.b2Math), i = $i_22.Common.Math.b2Sweep, e = $i_22.Common.Math.b2Transform, o = $i_22.Common.Math.b2Vec2, s = ($i_22.Common.Math.b2Vec3, $i_22.Common.b2Color), n = ($i_22.Common.b2internal, $i_22.Common.b2Settings), r = $i_22.Collision.b2AABB, a = ($i_22.Collision.b2Bound,
            $i_22.Collision.b2BoundValues,
            $i_22.Collision.b2Collision,
            $i_22.Collision.b2ContactID,
            $i_22.Collision.b2ContactPoint), h = ($i_22.Collision.b2Distance,
            $i_22.Collision.b2DistanceInput,
            $i_22.Collision.b2DistanceOutput,
            $i_22.Collision.b2DistanceProxy,
            $i_22.Collision.b2DynamicTree,
            $i_22.Collision.b2DynamicTreeBroadPhase), l = ($i_22.Collision.b2DynamicTreeNode,
            $i_22.Collision.b2DynamicTreePair,
            $i_22.Collision.b2Manifold,
            $i_22.Collision.b2ManifoldPoint,
            $i_22.Collision.b2Point,
            $i_22.Collision.b2RayCastInput), c = $i_22.Collision.b2RayCastOutput, _ = ($i_22.Collision.b2Segment,
            $i_22.Collision.b2SeparationFunction,
            $i_22.Collision.b2Simplex,
            $i_22.Collision.b2SimplexCache,
            $i_22.Collision.b2SimplexVertex,
            $i_22.Collision.b2TimeOfImpact,
            $i_22.Collision.b2TOIInput,
            $i_22.Collision.b2WorldManifold,
            $i_22.Collision.ClipVertex,
            $i_22.Collision.Features,
            $i_22.Collision.IBroadPhase,
            $i_22.Collision.Shapes.b2CircleShape), m = ($i_22.Collision.Shapes.b2EdgeChainDef, $i_22.Collision.Shapes.b2EdgeShape), u = $i_22.Collision.Shapes.b2MassData, p = $i_22.Collision.Shapes.b2PolygonShape, d = $i_22.Collision.Shapes.b2Shape, y = $i_22.Dynamics.b2Body, x = $i_22.Dynamics.b2BodyDef, f = $i_22.Dynamics.b2ContactFilter, g = $i_22.Dynamics.b2ContactImpulse, b = $i_22.Dynamics.b2ContactListener, v = $i_22.Dynamics.b2ContactManager, w = $i_22.Dynamics.b2DebugDraw, C = $i_22.Dynamics.b2DestructionListener, D = $i_22.Dynamics.b2FilterData, B = $i_22.Dynamics.b2Fixture, S = $i_22.Dynamics.b2FixtureDef, I = $i_22.Dynamics.b2Island, A = $i_22.Dynamics.b2TimeStep, M = $i_22.Dynamics.b2World, T = ($i_22.Dynamics.Contacts.b2CircleContact, $i_22.Dynamics.Contacts.b2Contact), P = ($i_22.Dynamics.Contacts.b2ContactConstraint,
            $i_22.Dynamics.Contacts.b2ContactConstraintPoint,
            $i_22.Dynamics.Contacts.b2ContactEdge,
            $i_22.Dynamics.Contacts.b2ContactFactory), V = ($i_22.Dynamics.Contacts.b2ContactRegister,
            $i_22.Dynamics.Contacts.b2ContactResult,
            $i_22.Dynamics.Contacts.b2ContactSolver), R = ($i_22.Dynamics.Contacts.b2EdgeAndCircleContact,
            $i_22.Dynamics.Contacts.b2NullContact,
            $i_22.Dynamics.Contacts.b2PolyAndCircleContact,
            $i_22.Dynamics.Contacts.b2PolyAndEdgeContact,
            $i_22.Dynamics.Contacts.b2PolygonContact,
            $i_22.Dynamics.Contacts.b2PositionSolverManifold,
            $i_22.Dynamics.Controllers.b2Controller,
            $i_22.Dynamics.Joints.b2DistanceJoint,
            $i_22.Dynamics.Joints.b2DistanceJointDef,
            $i_22.Dynamics.Joints.b2FrictionJoint,
            $i_22.Dynamics.Joints.b2FrictionJointDef,
            $i_22.Dynamics.Joints.b2GearJoint,
            $i_22.Dynamics.Joints.b2GearJointDef,
            $i_22.Dynamics.Joints.b2Jacobian,
            $i_22.Dynamics.Joints.b2Joint), L = ($i_22.Dynamics.Joints.b2JointDef,
            $i_22.Dynamics.Joints.b2JointEdge,
            $i_22.Dynamics.Joints.b2LineJoint,
            $i_22.Dynamics.Joints.b2LineJointDef,
            $i_22.Dynamics.Joints.b2MouseJoint,
            $i_22.Dynamics.Joints.b2MouseJointDef,
            $i_22.Dynamics.Joints.b2PrismaticJoint,
            $i_22.Dynamics.Joints.b2PrismaticJointDef,
            $i_22.Dynamics.Joints.b2PulleyJoint);
        $i_22.Dynamics.Joints.b2PulleyJointDef,
            $i_22.Dynamics.Joints.b2RevoluteJoint,
            $i_22.Dynamics.Joints.b2RevoluteJointDef,
            $i_22.Dynamics.Joints.b2WeldJoint,
            $i_22.Dynamics.Joints.b2WeldJointDef,
            (y.b2Body = function () {
                (this.m_xf = new e()),
                    (this.m_sweep = new i()),
                    (this.m_linearVelocity = new o()),
                    (this.m_force = new o());
            }),
            (y.prototype.connectEdges = function (i, e, o) {
                o === void 0 && (o = 0);
                var s = Math.atan2(e.GetDirectionVector().y, e.GetDirectionVector().x), r = Math.tan((s - o) * 0.5), a = t.MulFV(r, e.GetDirectionVector());
                (a = t.SubtractVV(a, e.GetNormalVector())),
                    (a = t.MulFV(n.b2_toiSlop, a)),
                    (a = t.AddVV(a, e.GetVertex1()));
                var h = t.AddVV(i.GetDirectionVector(), e.GetDirectionVector());
                h.Normalize();
                var l = t.Dot(i.GetDirectionVector(), e.GetNormalVector()) > 0;
                return i.SetNextEdge(e, a, h, l), e.SetPrevEdge(i, a, h, l), s;
            }),
            (y.prototype.CreateFixture = function (t) {
                if (this.m_world.IsLocked() == 1)
                    return null;
                var i = new B();
                if ((i.Create(this, this.m_xf, t), this.m_flags & y.e_activeFlag)) {
                    var e = this.m_world.m_contactManager.m_broadPhase;
                    i.CreateProxy(e, this.m_xf);
                }
                return ((i.m_next = this.m_fixtureList),
                    (this.m_fixtureList = i),
                    ++this.m_fixtureCount,
                    (i.m_body = this),
                    i.m_density > 0 && this.ResetMassData(),
                    (this.m_world.m_flags |= M.e_newFixture),
                    i);
            }),
            (y.prototype.CreateFixture2 = function (t, i) {
                i === void 0 && (i = 0);
                var e = new S();
                return (e.shape = t), (e.density = i), this.CreateFixture(e);
            }),
            (y.prototype.DestroyFixture = function (t) {
                if (this.m_world.IsLocked() != 1) {
                    var i = this.m_fixtureList, e = null, o = !1;
                    while (i != null) {
                        if (i == t) {
                            e ? (e.m_next = t.m_next) : (this.m_fixtureList = t.m_next), (o = !0);
                            break;
                        }
                        (e = i), (i = i.m_next);
                    }
                    var s = this.m_contactList;
                    while (s) {
                        var n = s.contact;
                        s = s.next;
                        var r = n.GetFixtureA(), a = n.GetFixtureB();
                        (t == r || t == a) && this.m_world.m_contactManager.Destroy(n);
                    }
                    if (this.m_flags & y.e_activeFlag) {
                        var h = this.m_world.m_contactManager.m_broadPhase;
                        t.DestroyProxy(h);
                    }
                    t.Destroy(), (t.m_body = null), (t.m_next = null), --this.m_fixtureCount, this.ResetMassData();
                }
            }),
            (y.prototype.SetPositionAndAngle = function (t, i) {
                i === void 0 && (i = 0);
                var e;
                if (this.m_world.IsLocked() != 1) {
                    this.m_xf.R.Set(i), this.m_xf.position.SetV(t);
                    var o = this.m_xf.R, s = this.m_sweep.localCenter;
                    (this.m_sweep.c.x = o.col1.x * s.x + o.col2.x * s.y),
                        (this.m_sweep.c.y = o.col1.y * s.x + o.col2.y * s.y),
                        (this.m_sweep.c.x += this.m_xf.position.x),
                        (this.m_sweep.c.y += this.m_xf.position.y),
                        this.m_sweep.c0.SetV(this.m_sweep.c),
                        (this.m_sweep.a0 = this.m_sweep.a = i);
                    var n = this.m_world.m_contactManager.m_broadPhase;
                    for (e = this.m_fixtureList; e; e = e.m_next)
                        e.Synchronize(n, this.m_xf, this.m_xf);
                    this.m_world.m_contactManager.FindNewContacts();
                }
            }),
            (y.prototype.SetTransform = function (t) {
                this.SetPositionAndAngle(t.position, t.GetAngle());
            }),
            (y.prototype.GetTransform = function () {
                return this.m_xf;
            }),
            (y.prototype.GetPosition = function () {
                return this.m_xf.position;
            }),
            (y.prototype.SetPosition = function (t) {
                this.SetPositionAndAngle(t, this.GetAngle());
            }),
            (y.prototype.GetAngle = function () {
                return this.m_sweep.a;
            }),
            (y.prototype.SetAngle = function (t) {
                t === void 0 && (t = 0), this.SetPositionAndAngle(this.GetPosition(), t);
            }),
            (y.prototype.GetWorldCenter = function () {
                return this.m_sweep.c;
            }),
            (y.prototype.GetLocalCenter = function () {
                return this.m_sweep.localCenter;
            }),
            (y.prototype.SetLinearVelocity = function (t) {
                this.m_type != y.b2_staticBody && this.m_linearVelocity.SetV(t);
            }),
            (y.prototype.GetLinearVelocity = function () {
                return this.m_linearVelocity;
            }),
            (y.prototype.SetAngularVelocity = function (t) {
                t === void 0 && (t = 0), this.m_type != y.b2_staticBody && (this.m_angularVelocity = t);
            }),
            (y.prototype.GetAngularVelocity = function () {
                return this.m_angularVelocity;
            }),
            (y.prototype.GetDefinition = function () {
                var t = new x();
                return ((t.type = this.GetType()),
                    (t.allowSleep = (this.m_flags & y.e_allowSleepFlag) == y.e_allowSleepFlag),
                    (t.angle = this.GetAngle()),
                    (t.angularDamping = this.m_angularDamping),
                    (t.angularVelocity = this.m_angularVelocity),
                    (t.fixedRotation = (this.m_flags & y.e_fixedRotationFlag) == y.e_fixedRotationFlag),
                    (t.bullet = (this.m_flags & y.e_bulletFlag) == y.e_bulletFlag),
                    (t.awake = (this.m_flags & y.e_awakeFlag) == y.e_awakeFlag),
                    (t.linearDamping = this.m_linearDamping),
                    t.linearVelocity.SetV(this.GetLinearVelocity()),
                    (t.position = this.GetPosition()),
                    (t.userData = this.GetUserData()),
                    t);
            }),
            (y.prototype.ApplyForce = function (t, i) {
                this.m_type == y.b2_dynamicBody &&
                    (this.IsAwake() == 0 && this.SetAwake(!0),
                        (this.m_force.x += t.x),
                        (this.m_force.y += t.y),
                        (this.m_torque += (i.x - this.m_sweep.c.x) * t.y - (i.y - this.m_sweep.c.y) * t.x));
            }),
            (y.prototype.ApplyTorque = function (t) {
                t === void 0 && (t = 0),
                    this.m_type == y.b2_dynamicBody && (this.IsAwake() == 0 && this.SetAwake(!0), (this.m_torque += t));
            }),
            (y.prototype.ApplyImpulse = function (t, i) {
                this.m_type == y.b2_dynamicBody &&
                    (this.IsAwake() == 0 && this.SetAwake(!0),
                        (this.m_linearVelocity.x += this.m_invMass * t.x),
                        (this.m_linearVelocity.y += this.m_invMass * t.y),
                        (this.m_angularVelocity +=
                            this.m_invI * ((i.x - this.m_sweep.c.x) * t.y - (i.y - this.m_sweep.c.y) * t.x)));
            }),
            (y.prototype.Split = function (i) {
                for (var e, o = this.GetLinearVelocity().Copy(), s = this.GetAngularVelocity(), n = this.GetWorldCenter(), r = this, a = this.m_world.CreateBody(this.GetDefinition()), h = r.m_fixtureList; h;)
                    if (i(h)) {
                        var l = h.m_next;
                        e ? (e.m_next = l) : (r.m_fixtureList = l),
                            r.m_fixtureCount--,
                            (h.m_next = a.m_fixtureList),
                            (a.m_fixtureList = h),
                            a.m_fixtureCount++,
                            (h.m_body = a),
                            (h = l);
                    }
                    else
                        (e = h), (h = h.m_next);
                r.ResetMassData(), a.ResetMassData();
                var c = r.GetWorldCenter(), _ = a.GetWorldCenter(), m = t.AddVV(o, t.CrossFV(s, t.SubtractVV(c, n))), u = t.AddVV(o, t.CrossFV(s, t.SubtractVV(_, n)));
                return (r.SetLinearVelocity(m),
                    a.SetLinearVelocity(u),
                    r.SetAngularVelocity(s),
                    a.SetAngularVelocity(s),
                    r.SynchronizeFixtures(),
                    a.SynchronizeFixtures(),
                    a);
            }),
            (y.prototype.Merge = function (t) {
                var i;
                for (i = t.m_fixtureList; i;) {
                    var e = i.m_next;
                    t.m_fixtureCount--,
                        (i.m_next = this.m_fixtureList),
                        (this.m_fixtureList = i),
                        this.m_fixtureCount++,
                        (i.m_body = s),
                        (i = e);
                }
                o.m_fixtureCount = 0;
                var o = this, s = t;
                o.GetWorldCenter(),
                    s.GetWorldCenter(),
                    o.GetLinearVelocity().Copy(),
                    s.GetLinearVelocity().Copy(),
                    o.GetAngularVelocity(),
                    s.GetAngularVelocity(),
                    o.ResetMassData(),
                    this.SynchronizeFixtures();
            }),
            (y.prototype.GetMass = function () {
                return this.m_mass;
            }),
            (y.prototype.GetInertia = function () {
                return this.m_I;
            }),
            (y.prototype.GetMassData = function (t) {
                (t.mass = this.m_mass), (t.I = this.m_I), t.center.SetV(this.m_sweep.localCenter);
            }),
            (y.prototype.SetMassData = function (i) {
                if ((n.b2Assert(this.m_world.IsLocked() == 0),
                    this.m_world.IsLocked() != 1 && this.m_type == y.b2_dynamicBody)) {
                    (this.m_invMass = 0),
                        (this.m_I = 0),
                        (this.m_invI = 0),
                        (this.m_mass = i.mass),
                        this.m_mass > 0 || (this.m_mass = 1),
                        (this.m_invMass = 1 / this.m_mass),
                        i.I > 0 &&
                            (this.m_flags & y.e_fixedRotationFlag) == 0 &&
                            ((this.m_I = i.I - this.m_mass * (i.center.x * i.center.x + i.center.y * i.center.y)),
                                (this.m_invI = 1 / this.m_I));
                    var e = this.m_sweep.c.Copy();
                    this.m_sweep.localCenter.SetV(i.center),
                        this.m_sweep.c0.SetV(t.MulX(this.m_xf, this.m_sweep.localCenter)),
                        this.m_sweep.c.SetV(this.m_sweep.c0),
                        (this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - e.y)),
                        (this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - e.x));
                }
            }),
            (y.prototype.ResetMassData = function () {
                if (((this.m_mass = 0),
                    (this.m_invMass = 0),
                    (this.m_I = 0),
                    (this.m_invI = 0),
                    this.m_sweep.localCenter.SetZero(),
                    this.m_type != y.b2_staticBody && this.m_type != y.b2_kinematicBody)) {
                    for (var i = o.Make(0, 0), e = this.m_fixtureList; e; e = e.m_next)
                        if (e.m_density != 0) {
                            var s = e.GetMassData();
                            (this.m_mass += s.mass),
                                (i.x += s.center.x * s.mass),
                                (i.y += s.center.y * s.mass),
                                (this.m_I += s.I);
                        }
                    this.m_mass > 0
                        ? ((this.m_invMass = 1 / this.m_mass), (i.x *= this.m_invMass), (i.y *= this.m_invMass))
                        : ((this.m_mass = 1), (this.m_invMass = 1)),
                        this.m_I > 0 && (this.m_flags & y.e_fixedRotationFlag) == 0
                            ? ((this.m_I -= this.m_mass * (i.x * i.x + i.y * i.y)),
                                (this.m_I *= this.m_inertiaScale),
                                n.b2Assert(this.m_I > 0),
                                (this.m_invI = 1 / this.m_I))
                            : ((this.m_I = 0), (this.m_invI = 0));
                    var r = this.m_sweep.c.Copy();
                    this.m_sweep.localCenter.SetV(i),
                        this.m_sweep.c0.SetV(t.MulX(this.m_xf, this.m_sweep.localCenter)),
                        this.m_sweep.c.SetV(this.m_sweep.c0),
                        (this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - r.y)),
                        (this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - r.x));
                }
            }),
            (y.prototype.GetWorldPoint = function (t) {
                var i = this.m_xf.R, e = new o(i.col1.x * t.x + i.col2.x * t.y, i.col1.y * t.x + i.col2.y * t.y);
                return (e.x += this.m_xf.position.x), (e.y += this.m_xf.position.y), e;
            }),
            (y.prototype.GetWorldVector = function (i) {
                return t.MulMV(this.m_xf.R, i);
            }),
            (y.prototype.GetLocalPoint = function (i) {
                return t.MulXT(this.m_xf, i);
            }),
            (y.prototype.GetLocalVector = function (i) {
                return t.MulTMV(this.m_xf.R, i);
            }),
            (y.prototype.GetLinearVelocityFromWorldPoint = function (t) {
                return new o(this.m_linearVelocity.x - this.m_angularVelocity * (t.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (t.x - this.m_sweep.c.x));
            }),
            (y.prototype.GetLinearVelocityFromLocalPoint = function (t) {
                var i = this.m_xf.R, e = new o(i.col1.x * t.x + i.col2.x * t.y, i.col1.y * t.x + i.col2.y * t.y);
                return ((e.x += this.m_xf.position.x),
                    (e.y += this.m_xf.position.y),
                    new o(this.m_linearVelocity.x - this.m_angularVelocity * (e.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (e.x - this.m_sweep.c.x)));
            }),
            (y.prototype.GetLinearDamping = function () {
                return this.m_linearDamping;
            }),
            (y.prototype.SetLinearDamping = function (t) {
                t === void 0 && (t = 0), (this.m_linearDamping = t);
            }),
            (y.prototype.GetAngularDamping = function () {
                return this.m_angularDamping;
            }),
            (y.prototype.SetAngularDamping = function (t) {
                t === void 0 && (t = 0), (this.m_angularDamping = t);
            }),
            (y.prototype.SetType = function (t) {
                if ((t === void 0 && (t = 0), this.m_type != t)) {
                    (this.m_type = t),
                        this.ResetMassData(),
                        this.m_type == y.b2_staticBody &&
                            (this.m_linearVelocity.SetZero(), (this.m_angularVelocity = 0)),
                        this.SetAwake(!0),
                        this.m_force.SetZero(),
                        (this.m_torque = 0);
                    for (var i = this.m_contactList; i; i = i.next)
                        i.contact.FlagForFiltering();
                }
            }),
            (y.prototype.GetType = function () {
                return this.m_type;
            }),
            (y.prototype.SetBullet = function (t) {
                t ? (this.m_flags |= y.e_bulletFlag) : (this.m_flags &= ~y.e_bulletFlag);
            }),
            (y.prototype.IsBullet = function () {
                return (this.m_flags & y.e_bulletFlag) == y.e_bulletFlag;
            }),
            (y.prototype.SetSleepingAllowed = function (t) {
                t ? (this.m_flags |= y.e_allowSleepFlag) : ((this.m_flags &= ~y.e_allowSleepFlag), this.SetAwake(!0));
            }),
            (y.prototype.SetAwake = function (t) {
                t
                    ? ((this.m_flags |= y.e_awakeFlag), (this.m_sleepTime = 0))
                    : ((this.m_flags &= ~y.e_awakeFlag),
                        (this.m_sleepTime = 0),
                        this.m_linearVelocity.SetZero(),
                        (this.m_angularVelocity = 0),
                        this.m_force.SetZero(),
                        (this.m_torque = 0));
            }),
            (y.prototype.IsAwake = function () {
                return (this.m_flags & y.e_awakeFlag) == y.e_awakeFlag;
            }),
            (y.prototype.SetFixedRotation = function (t) {
                t ? (this.m_flags |= y.e_fixedRotationFlag) : (this.m_flags &= ~y.e_fixedRotationFlag),
                    this.ResetMassData();
            }),
            (y.prototype.IsFixedRotation = function () {
                return (this.m_flags & y.e_fixedRotationFlag) == y.e_fixedRotationFlag;
            }),
            (y.prototype.SetActive = function (t) {
                if (t != this.IsActive()) {
                    var i, e;
                    if (t)
                        for (this.m_flags |= y.e_activeFlag,
                            i = this.m_world.m_contactManager.m_broadPhase,
                            e = this.m_fixtureList; e; e = e.m_next)
                            e.CreateProxy(i, this.m_xf);
                    else {
                        for (this.m_flags &= ~y.e_activeFlag,
                            i = this.m_world.m_contactManager.m_broadPhase,
                            e = this.m_fixtureList; e; e = e.m_next)
                            e.DestroyProxy(i);
                        var o = this.m_contactList;
                        while (o) {
                            var s = o;
                            (o = o.next), this.m_world.m_contactManager.Destroy(s.contact);
                        }
                        this.m_contactList = null;
                    }
                }
            }),
            (y.prototype.IsActive = function () {
                return (this.m_flags & y.e_activeFlag) == y.e_activeFlag;
            }),
            (y.prototype.IsSleepingAllowed = function () {
                return (this.m_flags & y.e_allowSleepFlag) == y.e_allowSleepFlag;
            }),
            (y.prototype.GetFixtureList = function () {
                return this.m_fixtureList;
            }),
            (y.prototype.GetJointList = function () {
                return this.m_jointList;
            }),
            (y.prototype.GetControllerList = function () {
                return this.m_controllerList;
            }),
            (y.prototype.GetContactList = function () {
                return this.m_contactList;
            }),
            (y.prototype.GetNext = function () {
                return this.m_next;
            }),
            (y.prototype.GetUserData = function () {
                return this.m_userData;
            }),
            (y.prototype.SetUserData = function (t) {
                this.m_userData = t;
            }),
            (y.prototype.GetWorld = function () {
                return this.m_world;
            }),
            (y.prototype.b2Body = function (t, i) {
                (this.m_flags = 0),
                    t.bullet && (this.m_flags |= y.e_bulletFlag),
                    t.fixedRotation && (this.m_flags |= y.e_fixedRotationFlag),
                    t.allowSleep && (this.m_flags |= y.e_allowSleepFlag),
                    t.awake && (this.m_flags |= y.e_awakeFlag),
                    t.active && (this.m_flags |= y.e_activeFlag),
                    (this.m_world = i),
                    this.m_xf.position.SetV(t.position),
                    this.m_xf.R.Set(t.angle),
                    this.m_sweep.localCenter.SetZero(),
                    (this.m_sweep.t0 = 1),
                    (this.m_sweep.a0 = this.m_sweep.a = t.angle);
                var e = this.m_xf.R, o = this.m_sweep.localCenter;
                (this.m_sweep.c.x = e.col1.x * o.x + e.col2.x * o.y),
                    (this.m_sweep.c.y = e.col1.y * o.x + e.col2.y * o.y),
                    (this.m_sweep.c.x += this.m_xf.position.x),
                    (this.m_sweep.c.y += this.m_xf.position.y),
                    this.m_sweep.c0.SetV(this.m_sweep.c),
                    (this.m_jointList = null),
                    (this.m_controllerList = null),
                    (this.m_contactList = null),
                    (this.m_controllerCount = 0),
                    (this.m_prev = null),
                    (this.m_next = null),
                    this.m_linearVelocity.SetV(t.linearVelocity),
                    (this.m_angularVelocity = t.angularVelocity),
                    (this.m_linearDamping = t.linearDamping),
                    (this.m_angularDamping = t.angularDamping),
                    this.m_force.Set(0, 0),
                    (this.m_torque = 0),
                    (this.m_sleepTime = 0),
                    (this.m_type = t.type),
                    this.m_type == y.b2_dynamicBody
                        ? ((this.m_mass = 1), (this.m_invMass = 1))
                        : ((this.m_mass = 0), (this.m_invMass = 0)),
                    (this.m_I = 0),
                    (this.m_invI = 0),
                    (this.m_inertiaScale = t.inertiaScale),
                    (this.m_userData = t.userData),
                    (this.m_fixtureList = null),
                    (this.m_fixtureCount = 0);
            }),
            (y.prototype.SynchronizeFixtures = function () {
                var t = y.s_xf1;
                t.R.Set(this.m_sweep.a0);
                var i = t.R, e = this.m_sweep.localCenter;
                (t.position.x = this.m_sweep.c0.x - (i.col1.x * e.x + i.col2.x * e.y)),
                    (t.position.y = this.m_sweep.c0.y - (i.col1.y * e.x + i.col2.y * e.y));
                var o, s = this.m_world.m_contactManager.m_broadPhase;
                for (o = this.m_fixtureList; o; o = o.m_next)
                    o.Synchronize(s, t, this.m_xf);
            }),
            (y.prototype.SynchronizeTransform = function () {
                this.m_xf.R.Set(this.m_sweep.a);
                var t = this.m_xf.R, i = this.m_sweep.localCenter;
                (this.m_xf.position.x = this.m_sweep.c.x - (t.col1.x * i.x + t.col2.x * i.y)),
                    (this.m_xf.position.y = this.m_sweep.c.y - (t.col1.y * i.x + t.col2.y * i.y));
            }),
            (y.prototype.ShouldCollide = function (t) {
                if (this.m_type != y.b2_dynamicBody && t.m_type != y.b2_dynamicBody)
                    return !1;
                for (var i = this.m_jointList; i; i = i.next)
                    if (i.other == t && i.joint.m_collideConnected == 0)
                        return !1;
                return !0;
            }),
            (y.prototype.Advance = function (t) {
                t === void 0 && (t = 0),
                    this.m_sweep.Advance(t),
                    this.m_sweep.c.SetV(this.m_sweep.c0),
                    (this.m_sweep.a = this.m_sweep.a0),
                    this.SynchronizeTransform();
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Dynamics.b2Body.s_xf1 = new e()),
                    ($i_22.Dynamics.b2Body.e_islandFlag = 1),
                    ($i_22.Dynamics.b2Body.e_awakeFlag = 2),
                    ($i_22.Dynamics.b2Body.e_allowSleepFlag = 4),
                    ($i_22.Dynamics.b2Body.e_bulletFlag = 8),
                    ($i_22.Dynamics.b2Body.e_fixedRotationFlag = 16),
                    ($i_22.Dynamics.b2Body.e_activeFlag = 32),
                    ($i_22.Dynamics.b2Body.b2_staticBody = 0),
                    ($i_22.Dynamics.b2Body.b2_kinematicBody = 1),
                    ($i_22.Dynamics.b2Body.b2_dynamicBody = 2);
            }),
            (x.b2BodyDef = function () {
                (this.position = new o()), (this.linearVelocity = new o());
            }),
            (x.prototype.b2BodyDef = function () {
                (this.userData = null),
                    this.position.Set(0, 0),
                    (this.angle = 0),
                    this.linearVelocity.Set(0, 0),
                    (this.angularVelocity = 0),
                    (this.linearDamping = 0),
                    (this.angularDamping = 0),
                    (this.allowSleep = !0),
                    (this.awake = !0),
                    (this.fixedRotation = !1),
                    (this.bullet = !1),
                    (this.type = y.b2_staticBody),
                    (this.active = !0),
                    (this.inertiaScale = 1);
            }),
            (f.b2ContactFilter = function () { }),
            (f.prototype.ShouldCollide = function (t, i) {
                var e = t.GetFilterData(), o = i.GetFilterData();
                if (e.groupIndex == o.groupIndex && e.groupIndex != 0)
                    return e.groupIndex > 0;
                var s = (e.maskBits & o.categoryBits) != 0 && (e.categoryBits & o.maskBits) != 0;
                return s;
            }),
            (f.prototype.RayCollide = function (t, i) {
                return t ? this.ShouldCollide(t instanceof B ? t : null, i) : !0;
            }),
            $i_22.postDefs.push(function () {
                $i_22.Dynamics.b2ContactFilter.b2_defaultFilter = new f();
            }),
            (g.b2ContactImpulse = function () {
                (this.normalImpulses = new Vector_a2j_Number(n.b2_maxManifoldPoints)),
                    (this.tangentImpulses = new Vector_a2j_Number(n.b2_maxManifoldPoints));
            }),
            (b.b2ContactListener = function () { }),
            (b.prototype.BeginContact = function () { }),
            (b.prototype.EndContact = function () { }),
            (b.prototype.PreSolve = function () { }),
            (b.prototype.PostSolve = function () { }),
            $i_22.postDefs.push(function () {
                $i_22.Dynamics.b2ContactListener.b2_defaultListener = new b();
            }),
            (v.b2ContactManager = function () { }),
            (v.prototype.b2ContactManager = function () {
                (this.m_world = null),
                    (this.m_contactCount = 0),
                    (this.m_contactFilter = f.b2_defaultFilter),
                    (this.m_contactListener = b.b2_defaultListener),
                    (this.m_contactFactory = new P(this.m_allocator)),
                    (this.m_broadPhase = new h());
            }),
            (v.prototype.AddPair = function (t, i) {
                var e = t instanceof B ? t : null, o = i instanceof B ? i : null, s = e.GetBody(), n = o.GetBody();
                if (s != n) {
                    var r = n.GetContactList();
                    while (r) {
                        if (r.other == s) {
                            var a = r.contact.GetFixtureA(), h = r.contact.GetFixtureB();
                            if (a == e && h == o)
                                return;
                            if (a == o && h == e)
                                return;
                        }
                        r = r.next;
                    }
                    if (n.ShouldCollide(s) != 0 && this.m_contactFilter.ShouldCollide(e, o) != 0) {
                        var l = this.m_contactFactory.Create(e, o);
                        (e = l.GetFixtureA()),
                            (o = l.GetFixtureB()),
                            (s = e.m_body),
                            (n = o.m_body),
                            (l.m_prev = null),
                            (l.m_next = this.m_world.m_contactList),
                            this.m_world.m_contactList != null && (this.m_world.m_contactList.m_prev = l),
                            (this.m_world.m_contactList = l),
                            (l.m_nodeA.contact = l),
                            (l.m_nodeA.other = n),
                            (l.m_nodeA.prev = null),
                            (l.m_nodeA.next = s.m_contactList),
                            s.m_contactList != null && (s.m_contactList.prev = l.m_nodeA),
                            (s.m_contactList = l.m_nodeA),
                            (l.m_nodeB.contact = l),
                            (l.m_nodeB.other = s),
                            (l.m_nodeB.prev = null),
                            (l.m_nodeB.next = n.m_contactList),
                            n.m_contactList != null && (n.m_contactList.prev = l.m_nodeB),
                            (n.m_contactList = l.m_nodeB),
                            ++this.m_world.m_contactCount;
                    }
                }
            }),
            (v.prototype.FindNewContacts = function () {
                this.m_broadPhase.UpdatePairs($i_22.generateCallback(this, this.AddPair));
            }),
            (v.prototype.Destroy = function (t) {
                var i = t.GetFixtureA(), e = t.GetFixtureB(), o = i.GetBody(), s = e.GetBody();
                t.IsTouching() && this.m_contactListener.EndContact(t),
                    t.m_prev && (t.m_prev.m_next = t.m_next),
                    t.m_next && (t.m_next.m_prev = t.m_prev),
                    t == this.m_world.m_contactList && (this.m_world.m_contactList = t.m_next),
                    t.m_nodeA.prev && (t.m_nodeA.prev.next = t.m_nodeA.next),
                    t.m_nodeA.next && (t.m_nodeA.next.prev = t.m_nodeA.prev),
                    t.m_nodeA == o.m_contactList && (o.m_contactList = t.m_nodeA.next),
                    t.m_nodeB.prev && (t.m_nodeB.prev.next = t.m_nodeB.next),
                    t.m_nodeB.next && (t.m_nodeB.next.prev = t.m_nodeB.prev),
                    t.m_nodeB == s.m_contactList && (s.m_contactList = t.m_nodeB.next),
                    this.m_contactFactory.Destroy(t),
                    --this.m_contactCount;
            }),
            (v.prototype.Collide = function () {
                var t = this.m_world.m_contactList;
                while (t) {
                    var i = t.GetFixtureA(), e = t.GetFixtureB(), o = i.GetBody(), s = e.GetBody();
                    if (o.IsAwake() != 0 || s.IsAwake() != 0) {
                        if (t.m_flags & T.e_filterFlag) {
                            if (s.ShouldCollide(o) == 0) {
                                var n = t;
                                (t = n.GetNext()), this.Destroy(n);
                                continue;
                            }
                            if (this.m_contactFilter.ShouldCollide(i, e) == 0) {
                                (n = t), (t = n.GetNext()), this.Destroy(n);
                                continue;
                            }
                            t.m_flags &= ~T.e_filterFlag;
                        }
                        var r = i.m_proxy, a = e.m_proxy;
                        if (r && a) {
                            var h = this.m_broadPhase.TestOverlap(r, a);
                            if (h == 0) {
                                (n = t), (t = n.GetNext()), this.Destroy(n);
                                continue;
                            }
                        }
                        t.Update(this.m_contactListener), (t = t.GetNext());
                    }
                    else
                        t = t.GetNext();
                }
            }),
            $i_22.postDefs.push(function () {
                $i_22.Dynamics.b2ContactManager.s_evalCP = new a();
            }),
            (w.b2DebugDraw = function () { }),
            (w.prototype.b2DebugDraw = function () { }),
            (w.prototype.SetFlags = function (t) {
                t === void 0 && (t = 0);
            }),
            (w.prototype.GetFlags = function () { }),
            (w.prototype.AppendFlags = function (t) {
                t === void 0 && (t = 0);
            }),
            (w.prototype.ClearFlags = function (t) {
                t === void 0 && (t = 0);
            }),
            (w.prototype.SetSprite = function () { }),
            (w.prototype.GetSprite = function () { }),
            (w.prototype.SetDrawScale = function (t) {
                t === void 0 && (t = 0);
            }),
            (w.prototype.GetDrawScale = function () { }),
            (w.prototype.SetLineThickness = function (t) {
                t === void 0 && (t = 0);
            }),
            (w.prototype.GetLineThickness = function () { }),
            (w.prototype.SetAlpha = function (t) {
                t === void 0 && (t = 0);
            }),
            (w.prototype.GetAlpha = function () { }),
            (w.prototype.SetFillAlpha = function (t) {
                t === void 0 && (t = 0);
            }),
            (w.prototype.GetFillAlpha = function () { }),
            (w.prototype.SetXFormScale = function (t) {
                t === void 0 && (t = 0);
            }),
            (w.prototype.GetXFormScale = function () { }),
            (w.prototype.DrawPolygon = function (t, i) {
                i === void 0 && (i = 0);
            }),
            (w.prototype.DrawSolidPolygon = function (t, i) {
                i === void 0 && (i = 0);
            }),
            (w.prototype.DrawCircle = function (t, i) {
                i === void 0 && (i = 0);
            }),
            (w.prototype.DrawSolidCircle = function (t, i) {
                i === void 0 && (i = 0);
            }),
            (w.prototype.DrawSegment = function () { }),
            (w.prototype.DrawTransform = function () { }),
            $i_22.postDefs.push(function () {
                ($i_22.Dynamics.b2DebugDraw.e_shapeBit = 1),
                    ($i_22.Dynamics.b2DebugDraw.e_jointBit = 2),
                    ($i_22.Dynamics.b2DebugDraw.e_aabbBit = 4),
                    ($i_22.Dynamics.b2DebugDraw.e_pairBit = 8),
                    ($i_22.Dynamics.b2DebugDraw.e_centerOfMassBit = 16),
                    ($i_22.Dynamics.b2DebugDraw.e_controllerBit = 32);
            }),
            (C.b2DestructionListener = function () { }),
            (C.prototype.SayGoodbyeJoint = function () { }),
            (C.prototype.SayGoodbyeFixture = function () { }),
            (D.b2FilterData = function () {
                (this.categoryBits = 1), (this.maskBits = 65535), (this.groupIndex = 0);
            }),
            (D.prototype.Copy = function () {
                var t = new D();
                return ((t.categoryBits = this.categoryBits),
                    (t.maskBits = this.maskBits),
                    (t.groupIndex = this.groupIndex),
                    t);
            }),
            (B.b2Fixture = function () {
                this.m_filter = new D();
            }),
            (B.prototype.GetType = function () {
                return this.m_shape.GetType();
            }),
            (B.prototype.GetShape = function () {
                return this.m_shape;
            }),
            (B.prototype.SetSensor = function (t) {
                if (this.m_isSensor != t && ((this.m_isSensor = t), this.m_body != null)) {
                    var i = this.m_body.GetContactList();
                    while (i) {
                        var e = i.contact, o = e.GetFixtureA(), s = e.GetFixtureB();
                        (o == this || s == this) && e.SetSensor(o.IsSensor() || s.IsSensor()), (i = i.next);
                    }
                }
            }),
            (B.prototype.IsSensor = function () {
                return this.m_isSensor;
            }),
            (B.prototype.SetFilterData = function (t) {
                if (((this.m_filter = t.Copy()), !this.m_body)) {
                    var i = this.m_body.GetContactList();
                    while (i) {
                        var e = i.contact, o = e.GetFixtureA(), s = e.GetFixtureB();
                        (o == this || s == this) && e.FlagForFiltering(), (i = i.next);
                    }
                }
            }),
            (B.prototype.GetFilterData = function () {
                return this.m_filter.Copy();
            }),
            (B.prototype.GetBody = function () {
                return this.m_body;
            }),
            (B.prototype.GetNext = function () {
                return this.m_next;
            }),
            (B.prototype.GetUserData = function () {
                return this.m_userData;
            }),
            (B.prototype.SetUserData = function (t) {
                this.m_userData = t;
            }),
            (B.prototype.TestPoint = function (t) {
                return this.m_shape.TestPoint(this.m_body.GetTransform(), t);
            }),
            (B.prototype.RayCast = function (t, i) {
                return this.m_shape.RayCast(t, i, this.m_body.GetTransform());
            }),
            (B.prototype.GetMassData = function (t) {
                return (t === void 0 && (t = null),
                    t == null && (t = new u()),
                    this.m_shape.ComputeMass(t, this.m_density),
                    t);
            }),
            (B.prototype.SetDensity = function (t) {
                t === void 0 && (t = 0), (this.m_density = t);
            }),
            (B.prototype.GetDensity = function () {
                return this.m_density;
            }),
            (B.prototype.GetFriction = function () {
                return this.m_friction;
            }),
            (B.prototype.SetFriction = function (t) {
                t === void 0 && (t = 0), (this.m_friction = t);
            }),
            (B.prototype.GetRestitution = function () {
                return this.m_restitution;
            }),
            (B.prototype.SetRestitution = function (t) {
                t === void 0 && (t = 0), (this.m_restitution = t);
            }),
            (B.prototype.GetAABB = function () {
                return this.m_aabb;
            }),
            (B.prototype.b2Fixture = function () {
                (this.m_aabb = new r()),
                    (this.m_userData = null),
                    (this.m_body = null),
                    (this.m_next = null),
                    (this.m_shape = null),
                    (this.m_density = 0),
                    (this.m_friction = 0),
                    (this.m_restitution = 0);
            }),
            (B.prototype.Create = function (t, i, e) {
                (this.m_userData = e.userData),
                    (this.m_friction = e.friction),
                    (this.m_restitution = e.restitution),
                    (this.m_body = t),
                    (this.m_next = null),
                    (this.m_filter = e.filter.Copy()),
                    (this.m_isSensor = e.isSensor),
                    (this.m_shape = e.shape.Copy()),
                    (this.m_density = e.density);
            }),
            (B.prototype.Destroy = function () {
                this.m_shape = null;
            }),
            (B.prototype.CreateProxy = function (t, i) {
                this.m_shape.ComputeAABB(this.m_aabb, i), (this.m_proxy = t.CreateProxy(this.m_aabb, this));
            }),
            (B.prototype.DestroyProxy = function (t) {
                this.m_proxy != null && (t.DestroyProxy(this.m_proxy), (this.m_proxy = null));
            }),
            (B.prototype.Synchronize = function (i, e, o) {
                if (this.m_proxy) {
                    var s = new r(), n = new r();
                    this.m_shape.ComputeAABB(s, e), this.m_shape.ComputeAABB(n, o), this.m_aabb.Combine(s, n);
                    var a = t.SubtractVV(o.position, e.position);
                    i.MoveProxy(this.m_proxy, this.m_aabb, a);
                }
            }),
            (S.b2FixtureDef = function () {
                this.filter = new D();
            }),
            (S.prototype.b2FixtureDef = function () {
                (this.shape = null),
                    (this.userData = null),
                    (this.friction = 0.2),
                    (this.restitution = 0),
                    (this.density = 0),
                    (this.filter.categoryBits = 1),
                    (this.filter.maskBits = 65535),
                    (this.filter.groupIndex = 0),
                    (this.isSensor = !1);
            }),
            (I.b2Island = function () { }),
            (I.prototype.b2Island = function () {
                (this.m_bodies = new Vector()), (this.m_contacts = new Vector()), (this.m_joints = new Vector());
            }),
            (I.prototype.Initialize = function (t, i, e, o, s, n) {
                t === void 0 && (t = 0), i === void 0 && (i = 0), e === void 0 && (e = 0);
                var r = 0;
                for (this.m_bodyCapacity = t,
                    this.m_contactCapacity = i,
                    this.m_jointCapacity = e,
                    this.m_bodyCount = 0,
                    this.m_contactCount = 0,
                    this.m_jointCount = 0,
                    this.m_allocator = o,
                    this.m_listener = s,
                    this.m_contactSolver = n,
                    r = this.m_bodies.length; t > r; r++)
                    this.m_bodies[r] = null;
                for (r = this.m_contacts.length; i > r; r++)
                    this.m_contacts[r] = null;
                for (r = this.m_joints.length; e > r; r++)
                    this.m_joints[r] = null;
            }),
            (I.prototype.Clear = function () {
                (this.m_bodyCount = 0), (this.m_contactCount = 0), (this.m_jointCount = 0);
            }),
            (I.prototype.Solve = function (i, e, o) {
                var s, r, a = 0, h = 0, l = e.x, c = e.y;
                for (a = 0; this.m_bodyCount > a; ++a)
                    (s = this.m_bodies[a]),
                        s.GetType() == y.b2_dynamicBody &&
                            (s.m_nonGravitic
                                ? ((s.m_linearVelocity.x += i.dt * s.m_invMass * s.m_force.x),
                                    (s.m_linearVelocity.y += i.dt * s.m_invMass * s.m_force.y))
                                : ((s.m_linearVelocity.x += i.dt * (l + s.m_invMass * s.m_force.x)),
                                    (s.m_linearVelocity.y += i.dt * (c + s.m_invMass * s.m_force.y))),
                                (s.m_angularVelocity += i.dt * s.m_invI * s.m_torque),
                                s.m_linearVelocity.Multiply(t.Clamp(1 - i.dt * s.m_linearDamping, 0, 1)),
                                (s.m_angularVelocity *= t.Clamp(1 - i.dt * s.m_angularDamping, 0, 1)));
                this.m_contactSolver.Initialize(i, this.m_contacts, this.m_contactCount, this.m_allocator);
                var _ = this.m_contactSolver;
                for (_.InitVelocityConstraints(i), a = 0; this.m_jointCount > a; ++a)
                    (r = this.m_joints[a]), r.InitVelocityConstraints(i);
                for (a = 0; i.velocityIterations > a; ++a) {
                    for (h = 0; this.m_jointCount > h; ++h)
                        (r = this.m_joints[h]), r.SolveVelocityConstraints(i);
                    _.SolveVelocityConstraints();
                }
                for (a = 0; this.m_jointCount > a; ++a)
                    (r = this.m_joints[a]), r.FinalizeVelocityConstraints();
                for (_.FinalizeVelocityConstraints(), a = 0; this.m_bodyCount > a; ++a)
                    if (((s = this.m_bodies[a]), s.GetType() != y.b2_staticBody)) {
                        var m = i.dt * s.m_linearVelocity.x, u = i.dt * s.m_linearVelocity.y;
                        m * m + u * u > n.b2_maxTranslationSquared &&
                            (s.m_linearVelocity.Normalize(),
                                (s.m_linearVelocity.x *= n.b2_maxTranslation * i.inv_dt),
                                (s.m_linearVelocity.y *= n.b2_maxTranslation * i.inv_dt));
                        var p = i.dt * s.m_angularVelocity;
                        p * p > n.b2_maxRotationSquared &&
                            (s.m_angularVelocity =
                                0 > s.m_angularVelocity ? -n.b2_maxRotation * i.inv_dt : n.b2_maxRotation * i.inv_dt),
                            s.m_sweep.c0.SetV(s.m_sweep.c),
                            (s.m_sweep.a0 = s.m_sweep.a),
                            (s.m_sweep.c.x += i.dt * s.m_linearVelocity.x),
                            (s.m_sweep.c.y += i.dt * s.m_linearVelocity.y),
                            (s.m_sweep.a += i.dt * s.m_angularVelocity),
                            s.SynchronizeTransform();
                    }
                for (a = 0; i.positionIterations > a; ++a) {
                    var d = _.SolvePositionConstraints(n.b2_contactBaumgarte), x = !0;
                    for (h = 0; this.m_jointCount > h; ++h) {
                        r = this.m_joints[h];
                        var f = r.SolvePositionConstraints(n.b2_contactBaumgarte);
                        x = x && f;
                    }
                    if (d && x)
                        break;
                }
                if ((this.Report(_.m_constraints), o)) {
                    var g = Number.MAX_VALUE, b = n.b2_linearSleepTolerance * n.b2_linearSleepTolerance, v = n.b2_angularSleepTolerance * n.b2_angularSleepTolerance;
                    for (a = 0; this.m_bodyCount > a; ++a)
                        (s = this.m_bodies[a]),
                            s.GetType() != y.b2_staticBody &&
                                ((s.m_flags & y.e_allowSleepFlag) == 0 && ((s.m_sleepTime = 0), (g = 0)),
                                    (s.m_flags & y.e_allowSleepFlag) == 0 ||
                                        s.m_angularVelocity * s.m_angularVelocity > v ||
                                        t.Dot(s.m_linearVelocity, s.m_linearVelocity) > b
                                        ? ((s.m_sleepTime = 0), (g = 0))
                                        : ((s.m_sleepTime += i.dt), (g = t.Min(g, s.m_sleepTime))));
                    if (g >= n.b2_timeToSleep)
                        for (a = 0; this.m_bodyCount > a; ++a)
                            (s = this.m_bodies[a]), s.SetAwake(!1);
                }
            }),
            (I.prototype.SolveTOI = function (t) {
                var i = 0, e = 0;
                this.m_contactSolver.Initialize(t, this.m_contacts, this.m_contactCount, this.m_allocator);
                var o = this.m_contactSolver;
                for (i = 0; this.m_jointCount > i; ++i)
                    this.m_joints[i].InitVelocityConstraints(t);
                for (i = 0; t.velocityIterations > i; ++i)
                    for (o.SolveVelocityConstraints(), e = 0; this.m_jointCount > e; ++e)
                        this.m_joints[e].SolveVelocityConstraints(t);
                for (i = 0; this.m_bodyCount > i; ++i) {
                    var s = this.m_bodies[i];
                    if (s.GetType() != y.b2_staticBody) {
                        var r = t.dt * s.m_linearVelocity.x, a = t.dt * s.m_linearVelocity.y;
                        r * r + a * a > n.b2_maxTranslationSquared &&
                            (s.m_linearVelocity.Normalize(),
                                (s.m_linearVelocity.x *= n.b2_maxTranslation * t.inv_dt),
                                (s.m_linearVelocity.y *= n.b2_maxTranslation * t.inv_dt));
                        var h = t.dt * s.m_angularVelocity;
                        h * h > n.b2_maxRotationSquared &&
                            (s.m_angularVelocity =
                                0 > s.m_angularVelocity ? -n.b2_maxRotation * t.inv_dt : n.b2_maxRotation * t.inv_dt),
                            s.m_sweep.c0.SetV(s.m_sweep.c),
                            (s.m_sweep.a0 = s.m_sweep.a),
                            (s.m_sweep.c.x += t.dt * s.m_linearVelocity.x),
                            (s.m_sweep.c.y += t.dt * s.m_linearVelocity.y),
                            (s.m_sweep.a += t.dt * s.m_angularVelocity),
                            s.SynchronizeTransform();
                    }
                }
                var l = 0.75;
                for (i = 0; t.positionIterations > i; ++i) {
                    var c = o.SolvePositionConstraints(l), _ = !0;
                    for (e = 0; this.m_jointCount > e; ++e) {
                        var m = this.m_joints[e].SolvePositionConstraints(n.b2_contactBaumgarte);
                        _ = _ && m;
                    }
                    if (c && _)
                        break;
                }
                this.Report(o.m_constraints);
            }),
            (I.prototype.Report = function (t) {
                if (this.m_listener != null)
                    for (var i = 0; this.m_contactCount > i; ++i) {
                        for (var e = this.m_contacts[i], o = t[i], s = 0; o.pointCount > s; ++s)
                            (I.s_impulse.normalImpulses[s] = o.points[s].normalImpulse),
                                (I.s_impulse.tangentImpulses[s] = o.points[s].tangentImpulse);
                        this.m_listener.PostSolve(e, I.s_impulse);
                    }
            }),
            (I.prototype.AddBody = function (t) {
                (t.m_islandIndex = this.m_bodyCount), (this.m_bodies[this.m_bodyCount++] = t);
            }),
            (I.prototype.AddContact = function (t) {
                this.m_contacts[this.m_contactCount++] = t;
            }),
            (I.prototype.AddJoint = function (t) {
                this.m_joints[this.m_jointCount++] = t;
            }),
            $i_22.postDefs.push(function () {
                $i_22.Dynamics.b2Island.s_impulse = new g();
            }),
            (A.b2TimeStep = function () { }),
            (A.prototype.Set = function (t) {
                (this.dt = t.dt),
                    (this.inv_dt = t.inv_dt),
                    (this.positionIterations = t.positionIterations),
                    (this.velocityIterations = t.velocityIterations),
                    (this.warmStarting = t.warmStarting);
            }),
            (M.b2World = function () {
                (this.s_stack = new Vector()),
                    (this.m_contactManager = new v()),
                    (this.m_contactSolver = new V()),
                    (this.m_island = new I());
            }),
            (M.prototype.b2World = function (t, i) {
                (this.m_destructionListener = null),
                    (this.m_debugDraw = null),
                    (this.m_bodyList = null),
                    (this.m_contactList = null),
                    (this.m_jointList = null),
                    (this.m_controllerList = null),
                    (this.m_bodyCount = 0),
                    (this.m_contactCount = 0),
                    (this.m_jointCount = 0),
                    (this.m_controllerCount = 0),
                    (M.m_warmStarting = !0),
                    (M.m_continuousPhysics = !0),
                    (this.m_allowSleep = i),
                    (this.m_gravity = t),
                    (this.m_inv_dt0 = 0),
                    (this.m_contactManager.m_world = this);
                var e = new x();
                this.m_groundBody = this.CreateBody(e);
            }),
            (M.prototype.SetDestructionListener = function (t) {
                this.m_destructionListener = t;
            }),
            (M.prototype.SetContactFilter = function (t) {
                this.m_contactManager.m_contactFilter = t;
            }),
            (M.prototype.SetContactListener = function (t) {
                this.m_contactManager.m_contactListener = t;
            }),
            (M.prototype.SetDebugDraw = function (t) {
                this.m_debugDraw = t;
            }),
            (M.prototype.SetBroadPhase = function (t) {
                var i = this.m_contactManager.m_broadPhase;
                this.m_contactManager.m_broadPhase = t;
                for (var e = this.m_bodyList; e; e = e.m_next)
                    for (var o = e.m_fixtureList; o; o = o.m_next)
                        o.m_proxy = t.CreateProxy(i.GetFatAABB(o.m_proxy), o);
            }),
            (M.prototype.Validate = function () {
                this.m_contactManager.m_broadPhase.Validate();
            }),
            (M.prototype.GetProxyCount = function () {
                return this.m_contactManager.m_broadPhase.GetProxyCount();
            }),
            (M.prototype.CreateBody = function (t) {
                if (this.IsLocked() == 1)
                    return null;
                var i = new y(t, this);
                return ((i.m_prev = null),
                    (i.m_next = this.m_bodyList),
                    this.m_bodyList && (this.m_bodyList.m_prev = i),
                    (this.m_bodyList = i),
                    ++this.m_bodyCount,
                    i);
            }),
            (M.prototype.DestroyBody = function (t) {
                if (this.IsLocked() != 1) {
                    var i = t.m_jointList;
                    while (i) {
                        var e = i;
                        (i = i.next),
                            this.m_destructionListener && this.m_destructionListener.SayGoodbyeJoint(e.joint),
                            this.DestroyJoint(e.joint);
                    }
                    var o = t.m_controllerList;
                    while (o) {
                        var s = o;
                        (o = o.nextController), s.controller.RemoveBody(t);
                    }
                    var n = t.m_contactList;
                    while (n) {
                        var r = n;
                        (n = n.next), this.m_contactManager.Destroy(r.contact);
                    }
                    t.m_contactList = null;
                    var a = t.m_fixtureList;
                    while (a) {
                        var h = a;
                        (a = a.m_next),
                            this.m_destructionListener && this.m_destructionListener.SayGoodbyeFixture(h),
                            h.DestroyProxy(this.m_contactManager.m_broadPhase),
                            h.Destroy();
                    }
                    (t.m_fixtureList = null),
                        (t.m_fixtureCount = 0),
                        t.m_prev && (t.m_prev.m_next = t.m_next),
                        t.m_next && (t.m_next.m_prev = t.m_prev),
                        t == this.m_bodyList && (this.m_bodyList = t.m_next),
                        --this.m_bodyCount;
                }
            }),
            (M.prototype.CreateJoint = function (t) {
                var i = R.Create(t, null);
                (i.m_prev = null),
                    (i.m_next = this.m_jointList),
                    this.m_jointList && (this.m_jointList.m_prev = i),
                    (this.m_jointList = i),
                    ++this.m_jointCount,
                    (i.m_edgeA.joint = i),
                    (i.m_edgeA.other = i.m_bodyB),
                    (i.m_edgeA.prev = null),
                    (i.m_edgeA.next = i.m_bodyA.m_jointList),
                    i.m_bodyA.m_jointList && (i.m_bodyA.m_jointList.prev = i.m_edgeA),
                    (i.m_bodyA.m_jointList = i.m_edgeA),
                    (i.m_edgeB.joint = i),
                    (i.m_edgeB.other = i.m_bodyA),
                    (i.m_edgeB.prev = null),
                    (i.m_edgeB.next = i.m_bodyB.m_jointList),
                    i.m_bodyB.m_jointList && (i.m_bodyB.m_jointList.prev = i.m_edgeB),
                    (i.m_bodyB.m_jointList = i.m_edgeB);
                var e = t.bodyA, o = t.bodyB;
                if (t.collideConnected == 0) {
                    var s = o.GetContactList();
                    while (s)
                        s.other == e && s.contact.FlagForFiltering(), (s = s.next);
                }
                return i;
            }),
            (M.prototype.DestroyJoint = function (t) {
                var i = t.m_collideConnected;
                t.m_prev && (t.m_prev.m_next = t.m_next),
                    t.m_next && (t.m_next.m_prev = t.m_prev),
                    t == this.m_jointList && (this.m_jointList = t.m_next);
                var e = t.m_bodyA, o = t.m_bodyB;
                if ((e.SetAwake(!0),
                    o.SetAwake(!0),
                    t.m_edgeA.prev && (t.m_edgeA.prev.next = t.m_edgeA.next),
                    t.m_edgeA.next && (t.m_edgeA.next.prev = t.m_edgeA.prev),
                    t.m_edgeA == e.m_jointList && (e.m_jointList = t.m_edgeA.next),
                    (t.m_edgeA.prev = null),
                    (t.m_edgeA.next = null),
                    t.m_edgeB.prev && (t.m_edgeB.prev.next = t.m_edgeB.next),
                    t.m_edgeB.next && (t.m_edgeB.next.prev = t.m_edgeB.prev),
                    t.m_edgeB == o.m_jointList && (o.m_jointList = t.m_edgeB.next),
                    (t.m_edgeB.prev = null),
                    (t.m_edgeB.next = null),
                    R.Destroy(t, null),
                    --this.m_jointCount,
                    i == 0)) {
                    var s = o.GetContactList();
                    while (s)
                        s.other == e && s.contact.FlagForFiltering(), (s = s.next);
                }
            }),
            (M.prototype.AddController = function (t) {
                return ((t.m_next = this.m_controllerList),
                    (t.m_prev = null),
                    (this.m_controllerList = t),
                    (t.m_world = this),
                    this.m_controllerCount++,
                    t);
            }),
            (M.prototype.RemoveController = function (t) {
                t.m_prev && (t.m_prev.m_next = t.m_next),
                    t.m_next && (t.m_next.m_prev = t.m_prev),
                    this.m_controllerList == t && (this.m_controllerList = t.m_next),
                    this.m_controllerCount--;
            }),
            (M.prototype.CreateController = function (t) {
                if (t.m_world != this)
                    throw Error("Controller can only be a member of one world");
                return ((t.m_next = this.m_controllerList),
                    (t.m_prev = null),
                    this.m_controllerList && (this.m_controllerList.m_prev = t),
                    (this.m_controllerList = t),
                    ++this.m_controllerCount,
                    (t.m_world = this),
                    t);
            }),
            (M.prototype.DestroyController = function (t) {
                t.Clear(),
                    t.m_next && (t.m_next.m_prev = t.m_prev),
                    t.m_prev && (t.m_prev.m_next = t.m_next),
                    t == this.m_controllerList && (this.m_controllerList = t.m_next),
                    --this.m_controllerCount;
            }),
            (M.prototype.SetWarmStarting = function (t) {
                M.m_warmStarting = t;
            }),
            (M.prototype.SetContinuousPhysics = function (t) {
                M.m_continuousPhysics = t;
            }),
            (M.prototype.GetBodyCount = function () {
                return this.m_bodyCount;
            }),
            (M.prototype.GetJointCount = function () {
                return this.m_jointCount;
            }),
            (M.prototype.GetContactCount = function () {
                return this.m_contactCount;
            }),
            (M.prototype.SetGravity = function (t) {
                this.m_gravity = t;
            }),
            (M.prototype.GetGravity = function () {
                return this.m_gravity;
            }),
            (M.prototype.GetGroundBody = function () {
                return this.m_groundBody;
            }),
            (M.prototype.Step = function (t, i, e) {
                t === void 0 && (t = 0),
                    i === void 0 && (i = 0),
                    e === void 0 && (e = 0),
                    this.m_flags & M.e_newFixture &&
                        (this.m_contactManager.FindNewContacts(), (this.m_flags &= ~M.e_newFixture)),
                    (this.m_flags |= M.e_locked);
                var o = M.s_timestep2;
                (o.dt = t),
                    (o.velocityIterations = i),
                    (o.positionIterations = e),
                    (o.inv_dt = t > 0 ? 1 / t : 0),
                    (o.dtRatio = this.m_inv_dt0 * t),
                    (o.warmStarting = M.m_warmStarting),
                    this.m_contactManager.Collide(),
                    o.dt > 0 && this.Solve(o),
                    M.m_continuousPhysics && o.dt > 0 && this.SolveTOI(o),
                    o.dt > 0 && (this.m_inv_dt0 = o.inv_dt),
                    (this.m_flags &= ~M.e_locked);
            }),
            (M.prototype.ClearForces = function () {
                for (var t = this.m_bodyList; t; t = t.m_next)
                    t.m_force.SetZero(), (t.m_torque = 0);
            }),
            (M.prototype.DrawDebugData = function () {
                if (this.m_debugDraw != null) {
                    this.m_debugDraw.m_sprite.graphics.clear();
                    var t, i, e, n, a, h = this.m_debugDraw.GetFlags();
                    new o(), new o(), new o();
                    var l;
                    new r(), new r();
                    var c = [new o(), new o(), new o(), new o()], _ = new s(0, 0, 0);
                    if (h & w.e_shapeBit)
                        for (t = this.m_bodyList; t; t = t.m_next)
                            if (!t._entity || !t._entity._box2dNoDebug)
                                for (l = t.m_xf, i = t.GetFixtureList(); i; i = i.m_next)
                                    (e = i.GetShape()),
                                        t.IsActive() == 0
                                            ? (_.Set(0.5, 0.5, 0.3), this.DrawShape(e, l, _))
                                            : t.GetType() == y.b2_staticBody
                                                ? (_.Set(0.5, 0.9, 0.5), this.DrawShape(e, l, _))
                                                : t.GetType() == y.b2_kinematicBody
                                                    ? (_.Set(0.5, 0.5, 0.9), this.DrawShape(e, l, _))
                                                    : t.IsAwake() == 0
                                                        ? (_.Set(0.6, 0.6, 0.6), this.DrawShape(e, l, _))
                                                        : (_.Set(0.9, 0.7, 0.7), this.DrawShape(e, l, _));
                    if (h & w.e_jointBit)
                        for (n = this.m_jointList; n; n = n.m_next)
                            this.DrawJoint(n);
                    if (h & w.e_controllerBit)
                        for (var m = this.m_controllerList; m; m = m.m_next)
                            m.Draw(this.m_debugDraw);
                    if (h & w.e_pairBit) {
                        _.Set(0.3, 0.9, 0.9);
                        for (var u = this.m_contactManager.m_contactList; u; u = u.GetNext()) {
                            var p = u.GetFixtureA(), d = u.GetFixtureB(), x = p.GetAABB().GetCenter(), f = d.GetAABB().GetCenter();
                            this.m_debugDraw.DrawSegment(x, f, _);
                        }
                    }
                    if (h & w.e_aabbBit)
                        for (a = this.m_contactManager.m_broadPhase,
                            c = [new o(), new o(), new o(), new o()],
                            t = this.m_bodyList; t; t = t.GetNext())
                            if (t.IsActive() != 0)
                                for (i = t.GetFixtureList(); i; i = i.GetNext()) {
                                    var g = a.GetFatAABB(i.m_proxy);
                                    c[0].Set(g.lowerBound.x, g.lowerBound.y),
                                        c[1].Set(g.upperBound.x, g.lowerBound.y),
                                        c[2].Set(g.upperBound.x, g.upperBound.y),
                                        c[3].Set(g.lowerBound.x, g.upperBound.y),
                                        this.m_debugDraw.DrawPolygon(c, 4, _);
                                }
                    if (h & w.e_centerOfMassBit)
                        for (t = this.m_bodyList; t; t = t.m_next)
                            (l = M.s_xf),
                                (l.R = t.m_xf.R),
                                (l.position = t.GetWorldCenter()),
                                this.m_debugDraw.DrawTransform(l);
                }
            }),
            (M.prototype.QueryAABB = function (t, i) {
                function e(i) {
                    return t(s.GetUserData(i));
                }
                var o = this, s = o.m_contactManager.m_broadPhase;
                s.Query(e, i);
            }),
            (M.prototype.QueryShape = function (t, i, o) {
                function s(e) {
                    var s = a.GetUserData(e) instanceof B ? a.GetUserData(e) : null;
                    return d.TestOverlap(i, o, s.GetShape(), s.GetBody().GetTransform()) ? t(s) : !0;
                }
                var n = this;
                o === void 0 && (o = null), o == null && ((o = new e()), o.SetIdentity());
                var a = n.m_contactManager.m_broadPhase, h = new r();
                i.ComputeAABB(h, o), a.Query(s, h);
            }),
            (M.prototype.QueryPoint = function (t, i) {
                function e(e) {
                    var o = s.GetUserData(e) instanceof B ? s.GetUserData(e) : null;
                    return o.TestPoint(i) ? t(o) : !0;
                }
                var o = this, s = o.m_contactManager.m_broadPhase, a = new r();
                a.lowerBound.Set(i.x - n.b2_linearSlop, i.y - n.b2_linearSlop),
                    a.upperBound.Set(i.x + n.b2_linearSlop, i.y + n.b2_linearSlop),
                    s.Query(e, a);
            }),
            (M.prototype.RayCast = function (t, i, e) {
                function s(s, n) {
                    var h = r.GetUserData(n), l = h instanceof B ? h : null, c = l.RayCast(a, s);
                    if (c) {
                        var _ = a.fraction, m = new o((1 - _) * i.x + _ * e.x, (1 - _) * i.y + _ * e.y);
                        return t(l, m, a.normal, _);
                    }
                    return s.maxFraction;
                }
                var n = this, r = n.m_contactManager.m_broadPhase, a = new c(), h = new l(i, e);
                r.RayCast(s, h);
            }),
            (M.prototype.RayCastOne = function (t, i) {
                function e(t, i, e, s) {
                    return s === void 0 && (s = 0), (o = t), s;
                }
                var o, s = this;
                return s.RayCast(e, t, i), o;
            }),
            (M.prototype.RayCastAll = function (t, i) {
                function e(t, i, e, o) {
                    return o === void 0 && (o = 0), (s[s.length] = t), 1;
                }
                var o = this, s = new Vector();
                return o.RayCast(e, t, i), s;
            }),
            (M.prototype.GetBodyList = function () {
                return this.m_bodyList;
            }),
            (M.prototype.GetJointList = function () {
                return this.m_jointList;
            }),
            (M.prototype.GetContactList = function () {
                return this.m_contactList;
            }),
            (M.prototype.IsLocked = function () {
                return (this.m_flags & M.e_locked) > 0;
            }),
            (M.prototype.Solve = function (t) {
                for (var i, e = this.m_controllerList; e; e = e.m_next)
                    e.Step(t);
                var o = this.m_island;
                for (o.Initialize(this.m_bodyCount, this.m_contactCount, this.m_jointCount, null, this.m_contactManager.m_contactListener, this.m_contactSolver),
                    i = this.m_bodyList; i; i = i.m_next)
                    i.m_flags &= ~y.e_islandFlag;
                for (var s = this.m_contactList; s; s = s.m_next)
                    s.m_flags &= ~T.e_islandFlag;
                for (var n = this.m_jointList; n; n = n.m_next)
                    n.m_islandFlag = !1;
                parseInt(this.m_bodyCount);
                for (var r = this.s_stack, a = this.m_bodyList; a; a = a.m_next)
                    if (!(a.m_flags & y.e_islandFlag) &&
                        a.IsAwake() != 0 &&
                        a.IsActive() != 0 &&
                        a.GetType() != y.b2_staticBody) {
                        o.Clear();
                        var h = 0;
                        (r[h++] = a), (a.m_flags |= y.e_islandFlag);
                        while (h > 0)
                            if (((i = r[--h]),
                                o.AddBody(i),
                                i.IsAwake() == 0 && i.SetAwake(!0),
                                i.GetType() != y.b2_staticBody)) {
                                for (var l, c = i.m_contactList; c; c = c.next)
                                    c.contact.m_flags & T.e_islandFlag ||
                                        (c.contact.IsSensor() != 1 &&
                                            c.contact.IsEnabled() != 0 &&
                                            c.contact.IsTouching() != 0 &&
                                            (o.AddContact(c.contact),
                                                (c.contact.m_flags |= T.e_islandFlag),
                                                (l = c.other),
                                                l.m_flags & y.e_islandFlag ||
                                                    ((r[h++] = l), (l.m_flags |= y.e_islandFlag))));
                                for (var _ = i.m_jointList; _; _ = _.next)
                                    _.joint.m_islandFlag != 1 &&
                                        ((l = _.other),
                                            l.IsActive() != 0 &&
                                                (o.AddJoint(_.joint),
                                                    (_.joint.m_islandFlag = !0),
                                                    l.m_flags & y.e_islandFlag ||
                                                        ((r[h++] = l), (l.m_flags |= y.e_islandFlag))));
                            }
                        o.Solve(t, this.m_gravity, this.m_allowSleep);
                        for (var m = 0; o.m_bodyCount > m; ++m)
                            (i = o.m_bodies[m]), i.GetType() == y.b2_staticBody && (i.m_flags &= ~y.e_islandFlag);
                    }
                for (m = 0; r.length > m; ++m) {
                    if (!r[m])
                        break;
                    r[m] = null;
                }
                for (i = this.m_bodyList; i; i = i.m_next)
                    i.IsAwake() != 0 && i.IsActive() != 0 && i.GetType() != y.b2_staticBody && i.SynchronizeFixtures();
                this.m_contactManager.FindNewContacts();
            }),
            (M.prototype.SolveTOI = function (t) {
                var i, e, o, s, r, a, h, l = this.m_island;
                l.Initialize(this.m_bodyCount, n.b2_maxTOIContactsPerIsland, n.b2_maxTOIJointsPerIsland, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
                var c = M.s_queue;
                for (i = this.m_bodyList; i; i = i.m_next)
                    (i.m_flags &= ~y.e_islandFlag), (i.m_sweep.t0 = 0);
                var _;
                for (_ = this.m_contactList; _; _ = _.m_next)
                    _.m_flags &= ~(T.e_toiFlag | T.e_islandFlag);
                for (h = this.m_jointList; h; h = h.m_next)
                    h.m_islandFlag = !1;
                for (;;) {
                    var m = null, u = 1;
                    for (_ = this.m_contactList; _; _ = _.m_next)
                        if (_.IsSensor() != 1 && _.IsEnabled() != 0 && _.IsContinuous() != 0) {
                            var p = 1;
                            if (_.m_flags & T.e_toiFlag)
                                p = _.m_toi;
                            else {
                                if (((e = _.m_fixtureA),
                                    (o = _.m_fixtureB),
                                    (s = e.m_body),
                                    (r = o.m_body),
                                    !((s.GetType() == y.b2_dynamicBody && s.IsAwake() != 0) ||
                                        (r.GetType() == y.b2_dynamicBody && r.IsAwake() != 0))))
                                    continue;
                                var d = s.m_sweep.t0;
                                r.m_sweep.t0 > s.m_sweep.t0
                                    ? ((d = r.m_sweep.t0), s.m_sweep.Advance(d))
                                    : s.m_sweep.t0 > r.m_sweep.t0 && ((d = s.m_sweep.t0), r.m_sweep.Advance(d)),
                                    (p = _.ComputeTOI(s.m_sweep, r.m_sweep)),
                                    n.b2Assert(p >= 0 && 1 >= p),
                                    p > 0 && 1 > p && ((p = (1 - p) * d + p), p > 1 && (p = 1)),
                                    (_.m_toi = p),
                                    (_.m_flags |= T.e_toiFlag);
                            }
                            p > Number.MIN_VALUE && u > p && ((m = _), (u = p));
                        }
                    if (m == null || u > 1 - 100 * Number.MIN_VALUE)
                        break;
                    if (((e = m.m_fixtureA),
                        (o = m.m_fixtureB),
                        (s = e.m_body),
                        (r = o.m_body),
                        M.s_backupA.Set(s.m_sweep),
                        M.s_backupB.Set(r.m_sweep),
                        s.Advance(u),
                        r.Advance(u),
                        m.Update(this.m_contactManager.m_contactListener),
                        (m.m_flags &= ~T.e_toiFlag),
                        m.IsSensor() != 1 && m.IsEnabled() != 0)) {
                        if (m.IsTouching() != 0) {
                            var x = s;
                            x.GetType() != y.b2_dynamicBody && (x = r), l.Clear();
                            var f = 0, g = 0;
                            (c[f + g++] = x), (x.m_flags |= y.e_islandFlag);
                            while (g > 0)
                                if (((i = c[f++]),
                                    --g,
                                    l.AddBody(i),
                                    i.IsAwake() == 0 && i.SetAwake(!0),
                                    i.GetType() == y.b2_dynamicBody)) {
                                    for (a = i.m_contactList; a; a = a.next) {
                                        if (l.m_contactCount == l.m_contactCapacity)
                                            break;
                                        if (!(a.contact.m_flags & T.e_islandFlag) &&
                                            a.contact.IsSensor() != 1 &&
                                            a.contact.IsEnabled() != 0 &&
                                            a.contact.IsTouching() != 0) {
                                            l.AddContact(a.contact), (a.contact.m_flags |= T.e_islandFlag);
                                            var b = a.other;
                                            b.m_flags & y.e_islandFlag ||
                                                (b.GetType() != y.b2_staticBody && (b.Advance(u), b.SetAwake(!0)),
                                                    (c[f + g] = b),
                                                    ++g,
                                                    (b.m_flags |= y.e_islandFlag));
                                        }
                                    }
                                    for (var v = i.m_jointList; v; v = v.next)
                                        l.m_jointCount != l.m_jointCapacity &&
                                            v.joint.m_islandFlag != 1 &&
                                            ((b = v.other),
                                                b.IsActive() != 0 &&
                                                    (l.AddJoint(v.joint),
                                                        (v.joint.m_islandFlag = !0),
                                                        b.m_flags & y.e_islandFlag ||
                                                            (b.GetType() != y.b2_staticBody && (b.Advance(u), b.SetAwake(!0)),
                                                                (c[f + g] = b),
                                                                ++g,
                                                                (b.m_flags |= y.e_islandFlag))));
                                }
                            var w = M.s_timestep;
                            (w.warmStarting = !1),
                                (w.dt = (1 - u) * t.dt),
                                (w.inv_dt = 1 / w.dt),
                                (w.dtRatio = 0),
                                (w.velocityIterations = t.velocityIterations),
                                (w.positionIterations = t.positionIterations),
                                l.SolveTOI(w);
                            var C = 0;
                            for (C = 0; l.m_bodyCount > C; ++C)
                                if (((i = l.m_bodies[C]),
                                    (i.m_flags &= ~y.e_islandFlag),
                                    i.IsAwake() != 0 && i.GetType() == y.b2_dynamicBody))
                                    for (i.SynchronizeFixtures(), a = i.m_contactList; a; a = a.next)
                                        a.contact.m_flags &= ~T.e_toiFlag;
                            for (C = 0; l.m_contactCount > C; ++C)
                                (_ = l.m_contacts[C]), (_.m_flags &= ~(T.e_toiFlag | T.e_islandFlag));
                            for (C = 0; l.m_jointCount > C; ++C)
                                (h = l.m_joints[C]), (h.m_islandFlag = !1);
                            this.m_contactManager.FindNewContacts();
                        }
                    }
                    else
                        s.m_sweep.Set(M.s_backupA),
                            r.m_sweep.Set(M.s_backupB),
                            s.SynchronizeTransform(),
                            r.SynchronizeTransform();
                }
            }),
            (M.prototype.DrawJoint = function (t) {
                var i = t.GetBodyA(), e = t.GetBodyB(), o = i.m_xf, s = e.m_xf, n = o.position, r = s.position, a = t.GetAnchorA(), h = t.GetAnchorB(), l = M.s_jointColor;
                switch (t.m_type) {
                    case R.e_distanceJoint:
                        this.m_debugDraw.DrawSegment(a, h, l);
                        break;
                    case R.e_pulleyJoint:
                        var c = t instanceof L ? t : null, _ = c.GetGroundAnchorA(), m = c.GetGroundAnchorB();
                        this.m_debugDraw.DrawSegment(_, a, l),
                            this.m_debugDraw.DrawSegment(m, h, l),
                            this.m_debugDraw.DrawSegment(_, m, l);
                        break;
                    case R.e_mouseJoint:
                        this.m_debugDraw.DrawSegment(a, h, l);
                        break;
                    default:
                        i != this.m_groundBody && this.m_debugDraw.DrawSegment(n, a, l),
                            this.m_debugDraw.DrawSegment(a, h, l),
                            e != this.m_groundBody && this.m_debugDraw.DrawSegment(r, h, l);
                }
            }),
            (M.prototype.DrawShape = function (i, e, o) {
                switch (i.m_type) {
                    case d.e_circleShape:
                        var s = i instanceof _ ? i : null, n = t.MulX(e, s.m_p), r = s.m_radius, a = e.R.col1;
                        this.m_debugDraw.DrawSolidCircle(n, r, a, o);
                        break;
                    case d.e_polygonShape:
                        var h = 0, l = i instanceof p ? i : null, c = parseInt(l.GetVertexCount()), u = l.GetVertices(), y = new Vector(c);
                        for (h = 0; c > h; ++h)
                            y[h] = t.MulX(e, u[h]);
                        this.m_debugDraw.DrawSolidPolygon(y, c, o);
                        break;
                    case d.e_edgeShape:
                        var x = i instanceof m ? i : null;
                        this.m_debugDraw.DrawSegment(t.MulX(e, x.GetVertex1()), t.MulX(e, x.GetVertex2()), o);
                }
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Dynamics.b2World.s_timestep2 = new A()),
                    ($i_22.Dynamics.b2World.s_xf = new e()),
                    ($i_22.Dynamics.b2World.s_backupA = new i()),
                    ($i_22.Dynamics.b2World.s_backupB = new i()),
                    ($i_22.Dynamics.b2World.s_timestep = new A()),
                    ($i_22.Dynamics.b2World.s_queue = new Vector()),
                    ($i_22.Dynamics.b2World.s_jointColor = new s(0.5, 0.8, 0.8)),
                    ($i_22.Dynamics.b2World.e_newFixture = 1),
                    ($i_22.Dynamics.b2World.e_locked = 2);
            });
    })(),
    (function () {
        var t = $i_22.Collision.Shapes.b2CircleShape, i = ($i_22.Collision.Shapes.b2EdgeChainDef, $i_22.Collision.Shapes.b2EdgeShape), e = ($i_22.Collision.Shapes.b2MassData, $i_22.Collision.Shapes.b2PolygonShape), o = $i_22.Collision.Shapes.b2Shape, s = $i_22.Dynamics.Contacts.b2CircleContact, n = $i_22.Dynamics.Contacts.b2Contact, r = $i_22.Dynamics.Contacts.b2ContactConstraint, a = $i_22.Dynamics.Contacts.b2ContactConstraintPoint, h = $i_22.Dynamics.Contacts.b2ContactEdge, l = $i_22.Dynamics.Contacts.b2ContactFactory, c = $i_22.Dynamics.Contacts.b2ContactRegister, _ = $i_22.Dynamics.Contacts.b2ContactResult, m = $i_22.Dynamics.Contacts.b2ContactSolver, u = $i_22.Dynamics.Contacts.b2EdgeAndCircleContact, p = $i_22.Dynamics.Contacts.b2NullContact, d = $i_22.Dynamics.Contacts.b2PolyAndCircleContact, y = $i_22.Dynamics.Contacts.b2PolyAndEdgeContact, x = $i_22.Dynamics.Contacts.b2PolygonContact, f = $i_22.Dynamics.Contacts.b2PositionSolverManifold, g = $i_22.Dynamics.b2Body, b = ($i_22.Dynamics.b2BodyDef,
            $i_22.Dynamics.b2ContactFilter,
            $i_22.Dynamics.b2ContactImpulse,
            $i_22.Dynamics.b2ContactListener,
            $i_22.Dynamics.b2ContactManager,
            $i_22.Dynamics.b2DebugDraw,
            $i_22.Dynamics.b2DestructionListener,
            $i_22.Dynamics.b2FilterData,
            $i_22.Dynamics.b2Fixture,
            $i_22.Dynamics.b2FixtureDef,
            $i_22.Dynamics.b2Island,
            $i_22.Dynamics.b2TimeStep), v = ($i_22.Dynamics.b2World, $i_22.Common.b2Color, $i_22.Common.b2internal, $i_22.Common.b2Settings), w = $i_22.Common.Math.b2Mat22, C = ($i_22.Common.Math.b2Mat33, $i_22.Common.Math.b2Math), D = ($i_22.Common.Math.b2Sweep, $i_22.Common.Math.b2Transform, $i_22.Common.Math.b2Vec2), B = ($i_22.Common.Math.b2Vec3,
            $i_22.Collision.b2AABB,
            $i_22.Collision.b2Bound,
            $i_22.Collision.b2BoundValues,
            $i_22.Collision.b2Collision), S = $i_22.Collision.b2ContactID, I = ($i_22.Collision.b2ContactPoint,
            $i_22.Collision.b2Distance,
            $i_22.Collision.b2DistanceInput,
            $i_22.Collision.b2DistanceOutput,
            $i_22.Collision.b2DistanceProxy,
            $i_22.Collision.b2DynamicTree,
            $i_22.Collision.b2DynamicTreeBroadPhase,
            $i_22.Collision.b2DynamicTreeNode,
            $i_22.Collision.b2DynamicTreePair,
            $i_22.Collision.b2Manifold), A = ($i_22.Collision.b2ManifoldPoint,
            $i_22.Collision.b2Point,
            $i_22.Collision.b2RayCastInput,
            $i_22.Collision.b2RayCastOutput,
            $i_22.Collision.b2Segment,
            $i_22.Collision.b2SeparationFunction,
            $i_22.Collision.b2Simplex,
            $i_22.Collision.b2SimplexCache,
            $i_22.Collision.b2SimplexVertex,
            $i_22.Collision.b2TimeOfImpact), M = $i_22.Collision.b2TOIInput, T = $i_22.Collision.b2WorldManifold;
        $i_22.Collision.ClipVertex,
            $i_22.Collision.Features,
            $i_22.Collision.IBroadPhase,
            $i_22.inherit(s, $i_22.Dynamics.Contacts.b2Contact),
            (s.prototype.__super = $i_22.Dynamics.Contacts.b2Contact.prototype),
            (s.b2CircleContact = function () {
                $i_22.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments);
            }),
            (s.Create = function () {
                return new s();
            }),
            (s.Destroy = function () { }),
            (s.prototype.Reset = function (t, i) {
                this.__super.Reset.call(this, t, i);
            }),
            (s.prototype.Evaluate = function () {
                var i = this.m_fixtureA.GetBody(), e = this.m_fixtureB.GetBody();
                B.CollideCircles(this.m_manifold, this.m_fixtureA.GetShape() instanceof t ? this.m_fixtureA.GetShape() : null, i.m_xf, this.m_fixtureB.GetShape() instanceof t ? this.m_fixtureB.GetShape() : null, e.m_xf);
            }),
            (n.b2Contact = function () {
                (this.m_nodeA = new h()),
                    (this.m_nodeB = new h()),
                    (this.m_manifold = new I()),
                    (this.m_oldManifold = new I());
            }),
            (n.prototype.GetManifold = function () {
                return this.m_manifold;
            }),
            (n.prototype.GetWorldManifold = function (t) {
                var i = this.m_fixtureA.GetBody(), e = this.m_fixtureB.GetBody(), o = this.m_fixtureA.GetShape(), s = this.m_fixtureB.GetShape();
                t.Initialize(this.m_manifold, i.GetTransform(), o.m_radius, e.GetTransform(), s.m_radius);
            }),
            (n.prototype.IsTouching = function () {
                return (this.m_flags & n.e_touchingFlag) == n.e_touchingFlag;
            }),
            (n.prototype.IsContinuous = function () {
                return (this.m_flags & n.e_continuousFlag) == n.e_continuousFlag;
            }),
            (n.prototype.SetSensor = function (t) {
                t ? (this.m_flags |= n.e_sensorFlag) : (this.m_flags &= ~n.e_sensorFlag);
            }),
            (n.prototype.IsSensor = function () {
                return (this.m_flags & n.e_sensorFlag) == n.e_sensorFlag;
            }),
            (n.prototype.SetEnabled = function (t) {
                t ? (this.m_flags |= n.e_enabledFlag) : (this.m_flags &= ~n.e_enabledFlag);
            }),
            (n.prototype.IsEnabled = function () {
                return (this.m_flags & n.e_enabledFlag) == n.e_enabledFlag;
            }),
            (n.prototype.GetNext = function () {
                return this.m_next;
            }),
            (n.prototype.GetFixtureA = function () {
                return this.m_fixtureA;
            }),
            (n.prototype.GetFixtureB = function () {
                return this.m_fixtureB;
            }),
            (n.prototype.FlagForFiltering = function () {
                this.m_flags |= n.e_filterFlag;
            }),
            (n.prototype.b2Contact = function () { }),
            (n.prototype.Reset = function (t, i) {
                if ((t === void 0 && (t = null), i === void 0 && (i = null), (this.m_flags = n.e_enabledFlag), !t || !i))
                    return (this.m_fixtureA = null), (this.m_fixtureB = null), void 0;
                (t.IsSensor() || i.IsSensor()) && (this.m_flags |= n.e_sensorFlag);
                var e = t.GetBody(), o = i.GetBody();
                (e.GetType() != g.b2_dynamicBody || e.IsBullet() || o.GetType() != g.b2_dynamicBody || o.IsBullet()) &&
                    (this.m_flags |= n.e_continuousFlag),
                    (this.m_fixtureA = t),
                    (this.m_fixtureB = i),
                    (this.m_manifold.m_pointCount = 0),
                    (this.m_prev = null),
                    (this.m_next = null),
                    (this.m_nodeA.contact = null),
                    (this.m_nodeA.prev = null),
                    (this.m_nodeA.next = null),
                    (this.m_nodeA.other = null),
                    (this.m_nodeB.contact = null),
                    (this.m_nodeB.prev = null),
                    (this.m_nodeB.next = null),
                    (this.m_nodeB.other = null);
            }),
            (n.prototype.Update = function (t) {
                var i = this.m_oldManifold;
                (this.m_oldManifold = this.m_manifold), (this.m_manifold = i), (this.m_flags |= n.e_enabledFlag);
                var e = !1, s = (this.m_flags & n.e_touchingFlag) == n.e_touchingFlag, r = this.m_fixtureA.m_body, a = this.m_fixtureB.m_body, h = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);
                if (this.m_flags & n.e_sensorFlag) {
                    if (h) {
                        var l = this.m_fixtureA.GetShape(), c = this.m_fixtureB.GetShape(), _ = r.GetTransform(), m = a.GetTransform();
                        e = o.TestOverlap(l, _, c, m);
                    }
                    this.m_manifold.m_pointCount = 0;
                }
                else {
                    if ((r.GetType() != g.b2_dynamicBody ||
                        r.IsBullet() ||
                        a.GetType() != g.b2_dynamicBody ||
                        a.IsBullet()
                        ? (this.m_flags |= n.e_continuousFlag)
                        : (this.m_flags &= ~n.e_continuousFlag),
                        h)) {
                        this.Evaluate(), (e = this.m_manifold.m_pointCount > 0);
                        for (var u = 0; this.m_manifold.m_pointCount > u; ++u) {
                            var p = this.m_manifold.m_points[u];
                            (p.m_normalImpulse = 0), (p.m_tangentImpulse = 0);
                            for (var d = p.m_id, y = 0; this.m_oldManifold.m_pointCount > y; ++y) {
                                var x = this.m_oldManifold.m_points[y];
                                if (x.m_id.key == d.key) {
                                    (p.m_normalImpulse = x.m_normalImpulse), (p.m_tangentImpulse = x.m_tangentImpulse);
                                    break;
                                }
                            }
                        }
                    }
                    else
                        this.m_manifold.m_pointCount = 0;
                    e != s && (r.SetAwake(!0), a.SetAwake(!0));
                }
                e ? (this.m_flags |= n.e_touchingFlag) : (this.m_flags &= ~n.e_touchingFlag),
                    s == 0 && e == 1 && t.BeginContact(this),
                    s == 1 && e == 0 && t.EndContact(this),
                    (this.m_flags & n.e_sensorFlag) == 0 && t.PreSolve(this, this.m_oldManifold);
            }),
            (n.prototype.Evaluate = function () { }),
            (n.prototype.ComputeTOI = function (t, i) {
                return (n.s_input.proxyA.Set(this.m_fixtureA.GetShape()),
                    n.s_input.proxyB.Set(this.m_fixtureB.GetShape()),
                    (n.s_input.sweepA = t),
                    (n.s_input.sweepB = i),
                    (n.s_input.tolerance = v.b2_linearSlop),
                    A.TimeOfImpact(n.s_input));
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Dynamics.Contacts.b2Contact.e_sensorFlag = 1),
                    ($i_22.Dynamics.Contacts.b2Contact.e_continuousFlag = 2),
                    ($i_22.Dynamics.Contacts.b2Contact.e_islandFlag = 4),
                    ($i_22.Dynamics.Contacts.b2Contact.e_toiFlag = 8),
                    ($i_22.Dynamics.Contacts.b2Contact.e_touchingFlag = 16),
                    ($i_22.Dynamics.Contacts.b2Contact.e_enabledFlag = 32),
                    ($i_22.Dynamics.Contacts.b2Contact.e_filterFlag = 64),
                    ($i_22.Dynamics.Contacts.b2Contact.s_input = new M());
            }),
            (r.b2ContactConstraint = function () {
                (this.localPlaneNormal = new D()),
                    (this.localPoint = new D()),
                    (this.normal = new D()),
                    (this.normalMass = new w()),
                    (this.K = new w());
            }),
            (r.prototype.b2ContactConstraint = function () {
                this.points = new Vector(v.b2_maxManifoldPoints);
                for (var t = 0; v.b2_maxManifoldPoints > t; t++)
                    this.points[t] = new a();
            }),
            (a.b2ContactConstraintPoint = function () {
                (this.localPoint = new D()), (this.rA = new D()), (this.rB = new D());
            }),
            (h.b2ContactEdge = function () { }),
            (l.b2ContactFactory = function () { }),
            (l.prototype.b2ContactFactory = function (t) {
                (this.m_allocator = t), this.InitializeRegisters();
            }),
            (l.prototype.AddType = function (t, i, e, o) {
                e === void 0 && (e = 0),
                    o === void 0 && (o = 0),
                    (this.m_registers[e][o].createFcn = t),
                    (this.m_registers[e][o].destroyFcn = i),
                    (this.m_registers[e][o].primary = !0),
                    e != o &&
                        ((this.m_registers[o][e].createFcn = t),
                            (this.m_registers[o][e].destroyFcn = i),
                            (this.m_registers[o][e].primary = !1));
            }),
            (l.prototype.InitializeRegisters = function () {
                this.m_registers = new Vector(o.e_shapeTypeCount);
                for (var t = 0; o.e_shapeTypeCount > t; t++) {
                    this.m_registers[t] = new Vector(o.e_shapeTypeCount);
                    for (var i = 0; o.e_shapeTypeCount > i; i++)
                        this.m_registers[t][i] = new c();
                }
                this.AddType(s.Create, s.Destroy, o.e_circleShape, o.e_circleShape),
                    this.AddType(d.Create, d.Destroy, o.e_polygonShape, o.e_circleShape),
                    this.AddType(x.Create, x.Destroy, o.e_polygonShape, o.e_polygonShape),
                    this.AddType(u.Create, u.Destroy, o.e_edgeShape, o.e_circleShape),
                    this.AddType(y.Create, y.Destroy, o.e_polygonShape, o.e_edgeShape);
            }),
            (l.prototype.Create = function (t, i) {
                var e, o = parseInt(t.GetType()), s = parseInt(i.GetType()), n = this.m_registers[o][s];
                if (n.pool)
                    return (e = n.pool), (n.pool = e.m_next), n.poolCount--, e.Reset(t, i), e;
                var r = n.createFcn;
                return r != null
                    ? n.primary
                        ? ((e = r(this.m_allocator)), e.Reset(t, i), e)
                        : ((e = r(this.m_allocator)), e.Reset(i, t), e)
                    : null;
            }),
            (l.prototype.Destroy = function (t) {
                t.m_manifold.m_pointCount > 0 && (t.m_fixtureA.m_body.SetAwake(!0), t.m_fixtureB.m_body.SetAwake(!0));
                var i = parseInt(t.m_fixtureA.GetType()), e = parseInt(t.m_fixtureB.GetType()), o = this.m_registers[i][e];
                o.poolCount++, (t.m_next = o.pool), (o.pool = t);
                var s = o.destroyFcn;
                s(t, this.m_allocator);
            }),
            (c.b2ContactRegister = function () { }),
            (_.b2ContactResult = function () {
                (this.position = new D()), (this.normal = new D()), (this.id = new S());
            }),
            (m.b2ContactSolver = function () {
                (this.m_step = new b()), (this.m_constraints = new Vector());
            }),
            (m.prototype.b2ContactSolver = function () { }),
            (m.prototype.Initialize = function (t, i, e, o) {
                e === void 0 && (e = 0);
                var s;
                this.m_step.Set(t), (this.m_allocator = o);
                var n = 0;
                this.m_constraintCount = e;
                while (this.m_constraintCount > this.m_constraints.length)
                    this.m_constraints[this.m_constraints.length] = new r();
                for (n = 0; e > n; ++n) {
                    s = i[n];
                    var a = s.m_fixtureA, h = s.m_fixtureB, l = a.m_shape, c = h.m_shape, _ = l.m_radius, u = c.m_radius, p = a.m_body, d = h.m_body, y = s.GetManifold(), x = v.b2MixFriction(a.GetFriction(), h.GetFriction()), f = v.b2MixRestitution(a.GetRestitution(), h.GetRestitution()), g = p.m_linearVelocity.x, b = p.m_linearVelocity.y, w = d.m_linearVelocity.x, C = d.m_linearVelocity.y, D = p.m_angularVelocity, B = d.m_angularVelocity;
                    v.b2Assert(y.m_pointCount > 0), m.s_worldManifold.Initialize(y, p.m_xf, _, d.m_xf, u);
                    var S = m.s_worldManifold.m_normal.x, I = m.s_worldManifold.m_normal.y, A = this.m_constraints[n];
                    (A.bodyA = p),
                        (A.bodyB = d),
                        (A.manifold = y),
                        (A.normal.x = S),
                        (A.normal.y = I),
                        (A.pointCount = y.m_pointCount),
                        (A.friction = x),
                        (A.restitution = f),
                        (A.localPlaneNormal.x = y.m_localPlaneNormal.x),
                        (A.localPlaneNormal.y = y.m_localPlaneNormal.y),
                        (A.localPoint.x = y.m_localPoint.x),
                        (A.localPoint.y = y.m_localPoint.y),
                        (A.radius = _ + u),
                        (A.type = y.m_type);
                    for (var M = 0; A.pointCount > M; ++M) {
                        var T = y.m_points[M], P = A.points[M];
                        (P.normalImpulse = T.m_normalImpulse),
                            (P.tangentImpulse = T.m_tangentImpulse),
                            P.localPoint.SetV(T.m_localPoint);
                        var V = (P.rA.x = m.s_worldManifold.m_points[M].x - p.m_sweep.c.x), R = (P.rA.y = m.s_worldManifold.m_points[M].y - p.m_sweep.c.y), L = (P.rB.x = m.s_worldManifold.m_points[M].x - d.m_sweep.c.x), k = (P.rB.y = m.s_worldManifold.m_points[M].y - d.m_sweep.c.y), F = V * I - R * S, G = L * I - k * S;
                        (F *= F), (G *= G);
                        var E = p.m_invMass + d.m_invMass + p.m_invI * F + d.m_invI * G;
                        P.normalMass = 1 / E;
                        var z = p.m_mass * p.m_invMass + d.m_mass * d.m_invMass;
                        (z += p.m_mass * p.m_invI * F + d.m_mass * d.m_invI * G), (P.equalizedMass = 1 / z);
                        var J = I, O = -S, N = V * O - R * J, W = L * O - k * J;
                        (N *= N), (W *= W);
                        var j = p.m_invMass + d.m_invMass + p.m_invI * N + d.m_invI * W;
                        (P.tangentMass = 1 / j), (P.velocityBias = 0);
                        var U = w + -B * k - g - -D * R, q = C + B * L - b - D * V, X = A.normal.x * U + A.normal.y * q;
                        -v.b2_velocityThreshold > X && (P.velocityBias += -A.restitution * X);
                    }
                    if (A.pointCount == 2) {
                        var H = A.points[0], K = A.points[1], Y = p.m_invMass, Z = p.m_invI, Q = d.m_invMass, $ = d.m_invI, ti = H.rA.x * I - H.rA.y * S, ii = H.rB.x * I - H.rB.y * S, ei = K.rA.x * I - K.rA.y * S, oi = K.rB.x * I - K.rB.y * S, si = Y + Q + Z * ti * ti + $ * ii * ii, ni = Y + Q + Z * ei * ei + $ * oi * oi, ri = Y + Q + Z * ti * ei + $ * ii * oi, ai = 100;
                        ai * (si * ni - ri * ri) > si * si
                            ? (A.K.col1.Set(si, ri), A.K.col2.Set(ri, ni), A.K.GetInverse(A.normalMass))
                            : (A.pointCount = 1);
                    }
                }
            }),
            (m.prototype.InitVelocityConstraints = function (t) {
                for (var i = 0; this.m_constraintCount > i; ++i) {
                    var e = this.m_constraints[i], o = e.bodyA, s = e.bodyB, n = o.m_invMass, r = o.m_invI, a = s.m_invMass, h = s.m_invI, l = e.normal.x, c = e.normal.y, _ = c, m = -l, u = 0, p = 0;
                    if (t.warmStarting)
                        for (p = e.pointCount, u = 0; p > u; ++u) {
                            var d = e.points[u];
                            (d.normalImpulse *= t.dtRatio), (d.tangentImpulse *= t.dtRatio);
                            var y = d.normalImpulse * l + d.tangentImpulse * _, x = d.normalImpulse * c + d.tangentImpulse * m;
                            (o.m_angularVelocity -= r * (d.rA.x * x - d.rA.y * y)),
                                (o.m_linearVelocity.x -= n * y),
                                (o.m_linearVelocity.y -= n * x),
                                (s.m_angularVelocity += h * (d.rB.x * x - d.rB.y * y)),
                                (s.m_linearVelocity.x += a * y),
                                (s.m_linearVelocity.y += a * x);
                        }
                    else
                        for (p = e.pointCount, u = 0; p > u; ++u) {
                            var f = e.points[u];
                            (f.normalImpulse = 0), (f.tangentImpulse = 0);
                        }
                }
            }),
            (m.prototype.SolveVelocityConstraints = function () {
                for (var t, i, e = 0, o = 0, s = 0, n = 0, r = 0, a = 0, h = 0, l = 0, c = 0, _ = 0, m = 0, u = 0, p = 0, d = 0, y = 0, x = 0, f = 0; this.m_constraintCount > f; ++f) {
                    var g = this.m_constraints[f], b = g.bodyA, v = g.bodyB, w = b.m_angularVelocity, D = v.m_angularVelocity, B = b.m_linearVelocity, S = v.m_linearVelocity, I = b.m_invMass, A = b.m_invI, M = v.m_invMass, T = v.m_invI, P = g.normal.x, V = g.normal.y, R = V, L = -P, k = g.friction;
                    for (e = 0; g.pointCount > e; e++)
                        (t = g.points[e]),
                            (o = S.x - D * t.rB.y - B.x + w * t.rA.y),
                            (s = S.y + D * t.rB.x - B.y - w * t.rA.x),
                            (r = o * R + s * L),
                            (a = t.tangentMass * -r),
                            (h = k * t.normalImpulse),
                            (l = C.Clamp(t.tangentImpulse + a, -h, h)),
                            (a = l - t.tangentImpulse),
                            (c = a * R),
                            (_ = a * L),
                            (B.x -= I * c),
                            (B.y -= I * _),
                            (w -= A * (t.rA.x * _ - t.rA.y * c)),
                            (S.x += M * c),
                            (S.y += M * _),
                            (D += T * (t.rB.x * _ - t.rB.y * c)),
                            (t.tangentImpulse = l);
                    if ((parseInt(g.pointCount), g.pointCount == 1))
                        (t = g.points[0]),
                            (o = S.x + -D * t.rB.y - B.x - -w * t.rA.y),
                            (s = S.y + D * t.rB.x - B.y - w * t.rA.x),
                            (n = o * P + s * V),
                            (a = -t.normalMass * (n - t.velocityBias)),
                            (l = t.normalImpulse + a),
                            (l = l > 0 ? l : 0),
                            (a = l - t.normalImpulse),
                            (c = a * P),
                            (_ = a * V),
                            (B.x -= I * c),
                            (B.y -= I * _),
                            (w -= A * (t.rA.x * _ - t.rA.y * c)),
                            (S.x += M * c),
                            (S.y += M * _),
                            (D += T * (t.rB.x * _ - t.rB.y * c)),
                            (t.normalImpulse = l);
                    else {
                        var F = g.points[0], G = g.points[1], E = F.normalImpulse, z = G.normalImpulse, J = S.x - D * F.rB.y - B.x + w * F.rA.y, O = S.y + D * F.rB.x - B.y - w * F.rA.x, N = S.x - D * G.rB.y - B.x + w * G.rA.y, W = S.y + D * G.rB.x - B.y - w * G.rA.x, j = J * P + O * V, U = N * P + W * V, q = j - F.velocityBias, X = U - G.velocityBias;
                        for (i = g.K, q -= i.col1.x * E + i.col2.x * z, X -= i.col1.y * E + i.col2.y * z;;) {
                            i = g.normalMass;
                            var H = -(i.col1.x * q + i.col2.x * X), K = -(i.col1.y * q + i.col2.y * X);
                            if (H >= 0 && K >= 0) {
                                (m = H - E),
                                    (u = K - z),
                                    (p = m * P),
                                    (d = m * V),
                                    (y = u * P),
                                    (x = u * V),
                                    (B.x -= I * (p + y)),
                                    (B.y -= I * (d + x)),
                                    (w -= A * (F.rA.x * d - F.rA.y * p + G.rA.x * x - G.rA.y * y)),
                                    (S.x += M * (p + y)),
                                    (S.y += M * (d + x)),
                                    (D += T * (F.rB.x * d - F.rB.y * p + G.rB.x * x - G.rB.y * y)),
                                    (F.normalImpulse = H),
                                    (G.normalImpulse = K);
                                break;
                            }
                            if (((H = -F.normalMass * q), (K = 0), (j = 0), (U = g.K.col1.y * H + X), H >= 0 && U >= 0)) {
                                (m = H - E),
                                    (u = K - z),
                                    (p = m * P),
                                    (d = m * V),
                                    (y = u * P),
                                    (x = u * V),
                                    (B.x -= I * (p + y)),
                                    (B.y -= I * (d + x)),
                                    (w -= A * (F.rA.x * d - F.rA.y * p + G.rA.x * x - G.rA.y * y)),
                                    (S.x += M * (p + y)),
                                    (S.y += M * (d + x)),
                                    (D += T * (F.rB.x * d - F.rB.y * p + G.rB.x * x - G.rB.y * y)),
                                    (F.normalImpulse = H),
                                    (G.normalImpulse = K);
                                break;
                            }
                            if (((H = 0), (K = -G.normalMass * X), (j = g.K.col2.x * K + q), (U = 0), K >= 0 && j >= 0)) {
                                (m = H - E),
                                    (u = K - z),
                                    (p = m * P),
                                    (d = m * V),
                                    (y = u * P),
                                    (x = u * V),
                                    (B.x -= I * (p + y)),
                                    (B.y -= I * (d + x)),
                                    (w -= A * (F.rA.x * d - F.rA.y * p + G.rA.x * x - G.rA.y * y)),
                                    (S.x += M * (p + y)),
                                    (S.y += M * (d + x)),
                                    (D += T * (F.rB.x * d - F.rB.y * p + G.rB.x * x - G.rB.y * y)),
                                    (F.normalImpulse = H),
                                    (G.normalImpulse = K);
                                break;
                            }
                            if (((H = 0), (K = 0), (j = q), (U = X), j >= 0 && U >= 0)) {
                                (m = H - E),
                                    (u = K - z),
                                    (p = m * P),
                                    (d = m * V),
                                    (y = u * P),
                                    (x = u * V),
                                    (B.x -= I * (p + y)),
                                    (B.y -= I * (d + x)),
                                    (w -= A * (F.rA.x * d - F.rA.y * p + G.rA.x * x - G.rA.y * y)),
                                    (S.x += M * (p + y)),
                                    (S.y += M * (d + x)),
                                    (D += T * (F.rB.x * d - F.rB.y * p + G.rB.x * x - G.rB.y * y)),
                                    (F.normalImpulse = H),
                                    (G.normalImpulse = K);
                                break;
                            }
                            break;
                        }
                    }
                    (b.m_angularVelocity = w), (v.m_angularVelocity = D);
                }
            }),
            (m.prototype.FinalizeVelocityConstraints = function () {
                for (var t = 0; this.m_constraintCount > t; ++t)
                    for (var i = this.m_constraints[t], e = i.manifold, o = 0; i.pointCount > o; ++o) {
                        var s = e.m_points[o], n = i.points[o];
                        (s.m_normalImpulse = n.normalImpulse), (s.m_tangentImpulse = n.tangentImpulse);
                    }
            }),
            (m.prototype.SolvePositionConstraints = function (t) {
                t === void 0 && (t = 0);
                for (var i = 0, e = 0; this.m_constraintCount > e; e++) {
                    var o = this.m_constraints[e], s = o.bodyA, n = o.bodyB, r = s.m_mass * s.m_invMass, a = s.m_mass * s.m_invI, h = n.m_mass * n.m_invMass, l = n.m_mass * n.m_invI;
                    m.s_psm.Initialize(o);
                    for (var c = m.s_psm.m_normal, _ = 0; o.pointCount > _; _++) {
                        var u = o.points[_], p = m.s_psm.m_points[_], d = m.s_psm.m_separations[_], y = p.x - s.m_sweep.c.x, x = p.y - s.m_sweep.c.y, f = p.x - n.m_sweep.c.x, g = p.y - n.m_sweep.c.y;
                        i = d > i ? i : d;
                        var b = C.Clamp(t * (d + v.b2_linearSlop), -v.b2_maxLinearCorrection, 0), w = -u.equalizedMass * b, D = w * c.x, B = w * c.y;
                        (s.m_sweep.c.x -= r * D),
                            (s.m_sweep.c.y -= r * B),
                            (s.m_sweep.a -= a * (y * B - x * D)),
                            s.SynchronizeTransform(),
                            (n.m_sweep.c.x += h * D),
                            (n.m_sweep.c.y += h * B),
                            (n.m_sweep.a += l * (f * B - g * D)),
                            n.SynchronizeTransform();
                    }
                }
                return i > -1.5 * v.b2_linearSlop;
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Dynamics.Contacts.b2ContactSolver.s_worldManifold = new T()),
                    ($i_22.Dynamics.Contacts.b2ContactSolver.s_psm = new f());
            }),
            $i_22.inherit(u, $i_22.Dynamics.Contacts.b2Contact),
            (u.prototype.__super = $i_22.Dynamics.Contacts.b2Contact.prototype),
            (u.b2EdgeAndCircleContact = function () {
                $i_22.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments);
            }),
            (u.Create = function () {
                return new u();
            }),
            (u.Destroy = function () { }),
            (u.prototype.Reset = function (t, i) {
                this.__super.Reset.call(this, t, i);
            }),
            (u.prototype.Evaluate = function () {
                var e = this.m_fixtureA.GetBody(), o = this.m_fixtureB.GetBody();
                this.b2CollideEdgeAndCircle(this.m_manifold, this.m_fixtureA.GetShape() instanceof i ? this.m_fixtureA.GetShape() : null, e.m_xf, this.m_fixtureB.GetShape() instanceof t ? this.m_fixtureB.GetShape() : null, o.m_xf);
            }),
            (u.prototype.b2CollideEdgeAndCircle = function () { }),
            $i_22.inherit(p, $i_22.Dynamics.Contacts.b2Contact),
            (p.prototype.__super = $i_22.Dynamics.Contacts.b2Contact.prototype),
            (p.b2NullContact = function () {
                $i_22.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments);
            }),
            (p.prototype.b2NullContact = function () {
                this.__super.b2Contact.call(this);
            }),
            (p.prototype.Evaluate = function () { }),
            $i_22.inherit(d, $i_22.Dynamics.Contacts.b2Contact),
            (d.prototype.__super = $i_22.Dynamics.Contacts.b2Contact.prototype),
            (d.b2PolyAndCircleContact = function () {
                $i_22.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments);
            }),
            (d.Create = function () {
                return new d();
            }),
            (d.Destroy = function () { }),
            (d.prototype.Reset = function (t, i) {
                this.__super.Reset.call(this, t, i),
                    v.b2Assert(t.GetType() == o.e_polygonShape),
                    v.b2Assert(i.GetType() == o.e_circleShape);
            }),
            (d.prototype.Evaluate = function () {
                var i = this.m_fixtureA.m_body, o = this.m_fixtureB.m_body;
                B.CollidePolygonAndCircle(this.m_manifold, this.m_fixtureA.GetShape() instanceof e ? this.m_fixtureA.GetShape() : null, i.m_xf, this.m_fixtureB.GetShape() instanceof t ? this.m_fixtureB.GetShape() : null, o.m_xf);
            }),
            $i_22.inherit(y, $i_22.Dynamics.Contacts.b2Contact),
            (y.prototype.__super = $i_22.Dynamics.Contacts.b2Contact.prototype),
            (y.b2PolyAndEdgeContact = function () {
                $i_22.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments);
            }),
            (y.Create = function () {
                return new y();
            }),
            (y.Destroy = function () { }),
            (y.prototype.Reset = function (t, i) {
                this.__super.Reset.call(this, t, i),
                    v.b2Assert(t.GetType() == o.e_polygonShape),
                    v.b2Assert(i.GetType() == o.e_edgeShape);
            }),
            (y.prototype.Evaluate = function () {
                var t = this.m_fixtureA.GetBody(), o = this.m_fixtureB.GetBody();
                this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape() instanceof e ? this.m_fixtureA.GetShape() : null, t.m_xf, this.m_fixtureB.GetShape() instanceof i ? this.m_fixtureB.GetShape() : null, o.m_xf);
            }),
            (y.prototype.b2CollidePolyAndEdge = function () { }),
            $i_22.inherit(x, $i_22.Dynamics.Contacts.b2Contact),
            (x.prototype.__super = $i_22.Dynamics.Contacts.b2Contact.prototype),
            (x.b2PolygonContact = function () {
                $i_22.Dynamics.Contacts.b2Contact.b2Contact.apply(this, arguments);
            }),
            (x.Create = function () {
                return new x();
            }),
            (x.Destroy = function () { }),
            (x.prototype.Reset = function (t, i) {
                this.__super.Reset.call(this, t, i);
            }),
            (x.prototype.Evaluate = function () {
                var t = this.m_fixtureA.GetBody(), i = this.m_fixtureB.GetBody();
                B.CollidePolygons(this.m_manifold, this.m_fixtureA.GetShape() instanceof e ? this.m_fixtureA.GetShape() : null, t.m_xf, this.m_fixtureB.GetShape() instanceof e ? this.m_fixtureB.GetShape() : null, i.m_xf);
            }),
            (f.b2PositionSolverManifold = function () { }),
            (f.prototype.b2PositionSolverManifold = function () {
                (this.m_normal = new D()),
                    (this.m_separations = new Vector_a2j_Number(v.b2_maxManifoldPoints)),
                    (this.m_points = new Vector(v.b2_maxManifoldPoints));
                for (var t = 0; v.b2_maxManifoldPoints > t; t++)
                    this.m_points[t] = new D();
            }),
            (f.prototype.Initialize = function (t) {
                v.b2Assert(t.pointCount > 0);
                var i, e, o = 0, s = 0, n = 0, r = 0, a = 0;
                switch (t.type) {
                    case I.e_circles:
                        (i = t.bodyA.m_xf.R), (e = t.localPoint);
                        var h = t.bodyA.m_xf.position.x + (i.col1.x * e.x + i.col2.x * e.y), l = t.bodyA.m_xf.position.y + (i.col1.y * e.x + i.col2.y * e.y);
                        (i = t.bodyB.m_xf.R), (e = t.points[0].localPoint);
                        var c = t.bodyB.m_xf.position.x + (i.col1.x * e.x + i.col2.x * e.y), _ = t.bodyB.m_xf.position.y + (i.col1.y * e.x + i.col2.y * e.y), m = c - h, u = _ - l, p = m * m + u * u;
                        if (p > Number.MIN_VALUE * Number.MIN_VALUE) {
                            var d = Math.sqrt(p);
                            (this.m_normal.x = m / d), (this.m_normal.y = u / d);
                        }
                        else
                            (this.m_normal.x = 1), (this.m_normal.y = 0);
                        (this.m_points[0].x = 0.5 * (h + c)),
                            (this.m_points[0].y = 0.5 * (l + _)),
                            (this.m_separations[0] = m * this.m_normal.x + u * this.m_normal.y - t.radius);
                        break;
                    case I.e_faceA:
                        for (i = t.bodyA.m_xf.R,
                            e = t.localPlaneNormal,
                            this.m_normal.x = i.col1.x * e.x + i.col2.x * e.y,
                            this.m_normal.y = i.col1.y * e.x + i.col2.y * e.y,
                            i = t.bodyA.m_xf.R,
                            e = t.localPoint,
                            r = t.bodyA.m_xf.position.x + (i.col1.x * e.x + i.col2.x * e.y),
                            a = t.bodyA.m_xf.position.y + (i.col1.y * e.x + i.col2.y * e.y),
                            i = t.bodyB.m_xf.R,
                            o = 0; t.pointCount > o; ++o)
                            (e = t.points[o].localPoint),
                                (s = t.bodyB.m_xf.position.x + (i.col1.x * e.x + i.col2.x * e.y)),
                                (n = t.bodyB.m_xf.position.y + (i.col1.y * e.x + i.col2.y * e.y)),
                                (this.m_separations[o] =
                                    (s - r) * this.m_normal.x + (n - a) * this.m_normal.y - t.radius),
                                (this.m_points[o].x = s),
                                (this.m_points[o].y = n);
                        break;
                    case I.e_faceB:
                        for (i = t.bodyB.m_xf.R,
                            e = t.localPlaneNormal,
                            this.m_normal.x = i.col1.x * e.x + i.col2.x * e.y,
                            this.m_normal.y = i.col1.y * e.x + i.col2.y * e.y,
                            i = t.bodyB.m_xf.R,
                            e = t.localPoint,
                            r = t.bodyB.m_xf.position.x + (i.col1.x * e.x + i.col2.x * e.y),
                            a = t.bodyB.m_xf.position.y + (i.col1.y * e.x + i.col2.y * e.y),
                            i = t.bodyA.m_xf.R,
                            o = 0; t.pointCount > o; ++o)
                            (e = t.points[o].localPoint),
                                (s = t.bodyA.m_xf.position.x + (i.col1.x * e.x + i.col2.x * e.y)),
                                (n = t.bodyA.m_xf.position.y + (i.col1.y * e.x + i.col2.y * e.y)),
                                (this.m_separations[o] =
                                    (s - r) * this.m_normal.x + (n - a) * this.m_normal.y - t.radius),
                                this.m_points[o].Set(s, n);
                        (this.m_normal.x *= -1), (this.m_normal.y *= -1);
                }
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Dynamics.Contacts.b2PositionSolverManifold.circlePointA = new D()),
                    ($i_22.Dynamics.Contacts.b2PositionSolverManifold.circlePointB = new D());
            });
    })(),
    (function () {
        var t = ($i_22.Dynamics.b2Body,
            $i_22.Dynamics.b2BodyDef,
            $i_22.Dynamics.b2ContactFilter,
            $i_22.Dynamics.b2ContactImpulse,
            $i_22.Dynamics.b2ContactListener,
            $i_22.Dynamics.b2ContactManager,
            $i_22.Dynamics.b2DebugDraw,
            $i_22.Dynamics.b2DestructionListener,
            $i_22.Dynamics.b2FilterData,
            $i_22.Dynamics.b2Fixture,
            $i_22.Dynamics.b2FixtureDef,
            $i_22.Dynamics.b2Island,
            $i_22.Dynamics.b2TimeStep,
            $i_22.Dynamics.b2World,
            $i_22.Common.Math.b2Mat22), i = ($i_22.Common.Math.b2Mat33, $i_22.Common.Math.b2Math), e = ($i_22.Common.Math.b2Sweep, $i_22.Common.Math.b2Transform, $i_22.Common.Math.b2Vec2), o = ($i_22.Common.Math.b2Vec3, $i_22.Common.b2Color), s = ($i_22.Common.b2internal,
            $i_22.Common.b2Settings,
            $i_22.Collision.Shapes.b2CircleShape,
            $i_22.Collision.Shapes.b2EdgeChainDef,
            $i_22.Collision.Shapes.b2EdgeShape,
            $i_22.Collision.Shapes.b2MassData,
            $i_22.Collision.Shapes.b2PolygonShape,
            $i_22.Collision.Shapes.b2Shape,
            $i_22.Dynamics.Controllers.b2BuoyancyController), n = $i_22.Dynamics.Controllers.b2ConstantAccelController, r = $i_22.Dynamics.Controllers.b2ConstantForceController, a = $i_22.Dynamics.Controllers.b2Controller, h = $i_22.Dynamics.Controllers.b2ControllerEdge, l = $i_22.Dynamics.Controllers.b2GravityController, c = $i_22.Dynamics.Controllers.b2TensorDampingController;
        $i_22.inherit(s, $i_22.Dynamics.Controllers.b2Controller),
            (s.prototype.__super = $i_22.Dynamics.Controllers.b2Controller.prototype),
            (s.b2BuoyancyController = function () {
                $i_22.Dynamics.Controllers.b2Controller.b2Controller.apply(this, arguments),
                    (this.normal = new e(0, -1)),
                    (this.offset = 0),
                    (this.density = 0),
                    (this.velocity = new e(0, 0)),
                    (this.linearDrag = 2),
                    (this.angularDrag = 1),
                    (this.useDensity = !1),
                    (this.useWorldGravity = !0),
                    (this.gravity = null);
            }),
            (s.prototype.Step = function () {
                if (this.m_bodyList) {
                    this.useWorldGravity && (this.gravity = this.GetWorld().GetGravity().Copy());
                    for (var t = this.m_bodyList; t; t = t.nextBody) {
                        var i = t.body;
                        if (i.IsAwake() != 0) {
                            for (var o = new e(), s = new e(), n = 0, r = 0, a = i.GetFixtureList(); a; a = a.GetNext()) {
                                var h = new e(), l = a
                                    .GetShape()
                                    .ComputeSubmergedArea(this.normal, this.offset, i.GetTransform(), h);
                                (n += l), (o.x += l * h.x), (o.y += l * h.y);
                                var c = 0;
                                (c = this.useDensity ? 1 : 1), (r += l * c), (s.x += l * h.x * c), (s.y += l * h.y * c);
                            }
                            if (((o.x /= n), (o.y /= n), (s.x /= r), (s.y /= r), n >= Number.MIN_VALUE)) {
                                var _ = this.gravity.GetNegative();
                                _.Multiply(this.density * n), i.ApplyForce(_, s);
                                var m = i.GetLinearVelocityFromWorldPoint(o);
                                m.Subtract(this.velocity),
                                    m.Multiply(-this.linearDrag * n),
                                    i.ApplyForce(m, o),
                                    i.ApplyTorque((-i.GetInertia() / i.GetMass()) * n * i.GetAngularVelocity() * this.angularDrag);
                            }
                        }
                    }
                }
            }),
            (s.prototype.Draw = function (t) {
                var i = 1e3, s = new e(), n = new e();
                (s.x = this.normal.x * this.offset + this.normal.y * i),
                    (s.y = this.normal.y * this.offset - this.normal.x * i),
                    (n.x = this.normal.x * this.offset - this.normal.y * i),
                    (n.y = this.normal.y * this.offset + this.normal.x * i);
                var r = new o(0, 0, 1);
                t.DrawSegment(s, n, r);
            }),
            $i_22.inherit(n, $i_22.Dynamics.Controllers.b2Controller),
            (n.prototype.__super = $i_22.Dynamics.Controllers.b2Controller.prototype),
            (n.b2ConstantAccelController = function () {
                $i_22.Dynamics.Controllers.b2Controller.b2Controller.apply(this, arguments), (this.A = new e(0, 0));
            }),
            (n.prototype.Step = function (t) {
                for (var i = new e(this.A.x * t.dt, this.A.y * t.dt), o = this.m_bodyList; o; o = o.nextBody) {
                    var s = o.body;
                    s.IsAwake() &&
                        s.SetLinearVelocity(new e(s.GetLinearVelocity().x + i.x, s.GetLinearVelocity().y + i.y));
                }
            }),
            $i_22.inherit(r, $i_22.Dynamics.Controllers.b2Controller),
            (r.prototype.__super = $i_22.Dynamics.Controllers.b2Controller.prototype),
            (r.b2ConstantForceController = function () {
                $i_22.Dynamics.Controllers.b2Controller.b2Controller.apply(this, arguments), (this.F = new e(0, 0));
            }),
            (r.prototype.Step = function () {
                for (var t = this.m_bodyList; t; t = t.nextBody) {
                    var i = t.body;
                    i.IsAwake() && i.ApplyForce(this.F, i.GetWorldCenter());
                }
            }),
            (a.b2Controller = function () { }),
            (a.prototype.Step = function () { }),
            (a.prototype.Draw = function () { }),
            (a.prototype.AddBody = function (t) {
                var i = new h();
                (i.controller = this),
                    (i.body = t),
                    (i.nextBody = this.m_bodyList),
                    (i.prevBody = null),
                    (this.m_bodyList = i),
                    i.nextBody && (i.nextBody.prevBody = i),
                    this.m_bodyCount++,
                    (i.nextController = t.m_controllerList),
                    (i.prevController = null),
                    (t.m_controllerList = i),
                    i.nextController && (i.nextController.prevController = i),
                    t.m_controllerCount++;
            }),
            (a.prototype.RemoveBody = function (t) {
                var i = t.m_controllerList;
                while (i && i.controller != this)
                    i = i.nextController;
                i.prevBody && (i.prevBody.nextBody = i.nextBody),
                    i.nextBody && (i.nextBody.prevBody = i.prevBody),
                    i.nextController && (i.nextController.prevController = i.prevController),
                    i.prevController && (i.prevController.nextController = i.nextController),
                    this.m_bodyList == i && (this.m_bodyList = i.nextBody),
                    t.m_controllerList == i && (t.m_controllerList = i.nextController),
                    t.m_controllerCount--,
                    this.m_bodyCount--;
            }),
            (a.prototype.Clear = function () {
                while (this.m_bodyList)
                    this.RemoveBody(this.m_bodyList.body);
            }),
            (a.prototype.GetNext = function () {
                return this.m_next;
            }),
            (a.prototype.GetWorld = function () {
                return this.m_world;
            }),
            (a.prototype.GetBodyList = function () {
                return this.m_bodyList;
            }),
            (h.b2ControllerEdge = function () { }),
            $i_22.inherit(l, $i_22.Dynamics.Controllers.b2Controller),
            (l.prototype.__super = $i_22.Dynamics.Controllers.b2Controller.prototype),
            (l.b2GravityController = function () {
                $i_22.Dynamics.Controllers.b2Controller.b2Controller.apply(this, arguments),
                    (this.G = 1),
                    (this.invSqr = !0);
            }),
            (l.prototype.Step = function () {
                var t = null, i = null, o = null, s = 0, n = null, r = null, a = null, h = 0, l = 0, c = 0, _ = null;
                if (this.invSqr)
                    for (t = this.m_bodyList; t; t = t.nextBody)
                        for (i = t.body, o = i.GetWorldCenter(), s = i.GetMass(), n = this.m_bodyList; n != t; n = n.nextBody)
                            (r = n.body),
                                (a = r.GetWorldCenter()),
                                (h = a.x - o.x),
                                (l = a.y - o.y),
                                (c = h * h + l * l),
                                Number.MIN_VALUE > c ||
                                    ((_ = new e(h, l)),
                                        _.Multiply((this.G / c / Math.sqrt(c)) * s * r.GetMass()),
                                        i.IsAwake() && i.ApplyForce(_, o),
                                        _.Multiply(-1),
                                        r.IsAwake() && r.ApplyForce(_, a));
                else
                    for (t = this.m_bodyList; t; t = t.nextBody)
                        for (i = t.body, o = i.GetWorldCenter(), s = i.GetMass(), n = this.m_bodyList; n != t; n = n.nextBody)
                            (r = n.body),
                                (a = r.GetWorldCenter()),
                                (h = a.x - o.x),
                                (l = a.y - o.y),
                                (c = h * h + l * l),
                                Number.MIN_VALUE > c ||
                                    ((_ = new e(h, l)),
                                        _.Multiply((this.G / c) * s * r.GetMass()),
                                        i.IsAwake() && i.ApplyForce(_, o),
                                        _.Multiply(-1),
                                        r.IsAwake() && r.ApplyForce(_, a));
            }),
            $i_22.inherit(c, $i_22.Dynamics.Controllers.b2Controller),
            (c.prototype.__super = $i_22.Dynamics.Controllers.b2Controller.prototype),
            (c.b2TensorDampingController = function () {
                $i_22.Dynamics.Controllers.b2Controller.b2Controller.apply(this, arguments),
                    (this.T = new t()),
                    (this.maxTimestep = 0);
            }),
            (c.prototype.SetAxisAligned = function (t, i) {
                t === void 0 && (t = 0),
                    i === void 0 && (i = 0),
                    (this.T.col1.x = -t),
                    (this.T.col1.y = 0),
                    (this.T.col2.x = 0),
                    (this.T.col2.y = -i),
                    (this.maxTimestep = t > 0 || i > 0 ? 1 / Math.max(t, i) : 0);
            }),
            (c.prototype.Step = function (t) {
                var o = t.dt;
                if (o > Number.MIN_VALUE) {
                    o > this.maxTimestep && this.maxTimestep > 0 && (o = this.maxTimestep);
                    for (var s = this.m_bodyList; s; s = s.nextBody) {
                        var n = s.body;
                        if (n.IsAwake()) {
                            var r = n.GetWorldVector(i.MulMV(this.T, n.GetLocalVector(n.GetLinearVelocity())));
                            n.SetLinearVelocity(new e(n.GetLinearVelocity().x + r.x * o, n.GetLinearVelocity().y + r.y * o));
                        }
                    }
                }
            });
    })(),
    (function () {
        var t = ($i_22.Common.b2Color, $i_22.Common.b2internal, $i_22.Common.b2Settings), i = $i_22.Common.Math.b2Mat22, e = $i_22.Common.Math.b2Mat33, o = $i_22.Common.Math.b2Math, s = ($i_22.Common.Math.b2Sweep, $i_22.Common.Math.b2Transform, $i_22.Common.Math.b2Vec2), n = $i_22.Common.Math.b2Vec3, r = $i_22.Dynamics.Joints.b2DistanceJoint, a = $i_22.Dynamics.Joints.b2DistanceJointDef, h = $i_22.Dynamics.Joints.b2FrictionJoint, l = $i_22.Dynamics.Joints.b2FrictionJointDef, c = $i_22.Dynamics.Joints.b2GearJoint, _ = $i_22.Dynamics.Joints.b2GearJointDef, m = $i_22.Dynamics.Joints.b2Jacobian, u = $i_22.Dynamics.Joints.b2Joint, p = $i_22.Dynamics.Joints.b2JointDef, d = $i_22.Dynamics.Joints.b2JointEdge, y = $i_22.Dynamics.Joints.b2LineJoint, x = $i_22.Dynamics.Joints.b2LineJointDef, f = $i_22.Dynamics.Joints.b2MouseJoint, g = $i_22.Dynamics.Joints.b2MouseJointDef, b = $i_22.Dynamics.Joints.b2PrismaticJoint, v = $i_22.Dynamics.Joints.b2PrismaticJointDef, w = $i_22.Dynamics.Joints.b2PulleyJoint, C = $i_22.Dynamics.Joints.b2PulleyJointDef, D = $i_22.Dynamics.Joints.b2RevoluteJoint, B = $i_22.Dynamics.Joints.b2RevoluteJointDef, S = $i_22.Dynamics.Joints.b2WeldJoint, I = $i_22.Dynamics.Joints.b2WeldJointDef;
        $i_22.Dynamics.b2Body,
            $i_22.Dynamics.b2BodyDef,
            $i_22.Dynamics.b2ContactFilter,
            $i_22.Dynamics.b2ContactImpulse,
            $i_22.Dynamics.b2ContactListener,
            $i_22.Dynamics.b2ContactManager,
            $i_22.Dynamics.b2DebugDraw,
            $i_22.Dynamics.b2DestructionListener,
            $i_22.Dynamics.b2FilterData,
            $i_22.Dynamics.b2Fixture,
            $i_22.Dynamics.b2FixtureDef,
            $i_22.Dynamics.b2Island,
            $i_22.Dynamics.b2TimeStep,
            $i_22.Dynamics.b2World,
            $i_22.inherit(r, $i_22.Dynamics.Joints.b2Joint),
            (r.prototype.__super = $i_22.Dynamics.Joints.b2Joint.prototype),
            (r.b2DistanceJoint = function () {
                $i_22.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
                    (this.m_localAnchor1 = new s()),
                    (this.m_localAnchor2 = new s()),
                    (this.m_u = new s());
            }),
            (r.prototype.GetAnchorA = function () {
                return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
            }),
            (r.prototype.GetAnchorB = function () {
                return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
            }),
            (r.prototype.GetReactionForce = function (t) {
                return t === void 0 && (t = 0), new s(t * this.m_impulse * this.m_u.x, t * this.m_impulse * this.m_u.y);
            }),
            (r.prototype.GetReactionTorque = function (t) {
                return t === void 0 && (t = 0), 0;
            }),
            (r.prototype.GetLength = function () {
                return this.m_length;
            }),
            (r.prototype.SetLength = function (t) {
                t === void 0 && (t = 0), (this.m_length = t);
            }),
            (r.prototype.GetFrequency = function () {
                return this.m_frequencyHz;
            }),
            (r.prototype.SetFrequency = function (t) {
                t === void 0 && (t = 0), (this.m_frequencyHz = t);
            }),
            (r.prototype.GetDampingRatio = function () {
                return this.m_dampingRatio;
            }),
            (r.prototype.SetDampingRatio = function (t) {
                t === void 0 && (t = 0), (this.m_dampingRatio = t);
            }),
            (r.prototype.b2DistanceJoint = function (t) {
                this.__super.b2Joint.call(this, t),
                    this.m_localAnchor1.SetV(t.localAnchorA),
                    this.m_localAnchor2.SetV(t.localAnchorB),
                    (this.m_length = t.length),
                    (this.m_frequencyHz = t.frequencyHz),
                    (this.m_dampingRatio = t.dampingRatio),
                    (this.m_impulse = 0),
                    (this.m_gamma = 0),
                    (this.m_bias = 0);
            }),
            (r.prototype.InitVelocityConstraints = function (i) {
                var e, o = 0, s = this.m_bodyA, n = this.m_bodyB;
                e = s.m_xf.R;
                var r = this.m_localAnchor1.x - s.m_sweep.localCenter.x, a = this.m_localAnchor1.y - s.m_sweep.localCenter.y;
                (o = e.col1.x * r + e.col2.x * a), (a = e.col1.y * r + e.col2.y * a), (r = o), (e = n.m_xf.R);
                var h = this.m_localAnchor2.x - n.m_sweep.localCenter.x, l = this.m_localAnchor2.y - n.m_sweep.localCenter.y;
                (o = e.col1.x * h + e.col2.x * l),
                    (l = e.col1.y * h + e.col2.y * l),
                    (h = o),
                    (this.m_u.x = n.m_sweep.c.x + h - s.m_sweep.c.x - r),
                    (this.m_u.y = n.m_sweep.c.y + l - s.m_sweep.c.y - a);
                var c = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
                c > t.b2_linearSlop ? this.m_u.Multiply(1 / c) : this.m_u.SetZero();
                var _ = r * this.m_u.y - a * this.m_u.x, m = h * this.m_u.y - l * this.m_u.x, u = s.m_invMass + s.m_invI * _ * _ + n.m_invMass + n.m_invI * m * m;
                if (((this.m_mass = u != 0 ? 1 / u : 0), this.m_frequencyHz > 0)) {
                    var p = c - this.m_length, d = 2 * Math.PI * this.m_frequencyHz, y = 2 * this.m_mass * this.m_dampingRatio * d, x = this.m_mass * d * d;
                    (this.m_gamma = i.dt * (y + i.dt * x)),
                        (this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0),
                        (this.m_bias = p * i.dt * x * this.m_gamma),
                        (this.m_mass = u + this.m_gamma),
                        (this.m_mass = this.m_mass != 0 ? 1 / this.m_mass : 0);
                }
                if (i.warmStarting) {
                    this.m_impulse *= i.dtRatio;
                    var f = this.m_impulse * this.m_u.x, g = this.m_impulse * this.m_u.y;
                    (s.m_linearVelocity.x -= s.m_invMass * f),
                        (s.m_linearVelocity.y -= s.m_invMass * g),
                        (s.m_angularVelocity -= s.m_invI * (r * g - a * f)),
                        (n.m_linearVelocity.x += n.m_invMass * f),
                        (n.m_linearVelocity.y += n.m_invMass * g),
                        (n.m_angularVelocity += n.m_invI * (h * g - l * f));
                }
                else
                    this.m_impulse = 0;
            }),
            (r.prototype.SolveVelocityConstraints = function () {
                var t, i = this.m_bodyA, e = this.m_bodyB;
                t = i.m_xf.R;
                var o = this.m_localAnchor1.x - i.m_sweep.localCenter.x, s = this.m_localAnchor1.y - i.m_sweep.localCenter.y, n = t.col1.x * o + t.col2.x * s;
                (s = t.col1.y * o + t.col2.y * s), (o = n), (t = e.m_xf.R);
                var r = this.m_localAnchor2.x - e.m_sweep.localCenter.x, a = this.m_localAnchor2.y - e.m_sweep.localCenter.y;
                (n = t.col1.x * r + t.col2.x * a), (a = t.col1.y * r + t.col2.y * a), (r = n);
                var h = i.m_linearVelocity.x + -i.m_angularVelocity * s, l = i.m_linearVelocity.y + i.m_angularVelocity * o, c = e.m_linearVelocity.x + -e.m_angularVelocity * a, _ = e.m_linearVelocity.y + e.m_angularVelocity * r, m = this.m_u.x * (c - h) + this.m_u.y * (_ - l), u = -this.m_mass * (m + this.m_bias + this.m_gamma * this.m_impulse);
                this.m_impulse += u;
                var p = u * this.m_u.x, d = u * this.m_u.y;
                (i.m_linearVelocity.x -= i.m_invMass * p),
                    (i.m_linearVelocity.y -= i.m_invMass * d),
                    (i.m_angularVelocity -= i.m_invI * (o * d - s * p)),
                    (e.m_linearVelocity.x += e.m_invMass * p),
                    (e.m_linearVelocity.y += e.m_invMass * d),
                    (e.m_angularVelocity += e.m_invI * (r * d - a * p));
            }),
            (r.prototype.SolvePositionConstraints = function (i) {
                i === void 0 && (i = 0);
                var e;
                if (this.m_frequencyHz > 0)
                    return !0;
                var s = this.m_bodyA, n = this.m_bodyB;
                e = s.m_xf.R;
                var r = this.m_localAnchor1.x - s.m_sweep.localCenter.x, a = this.m_localAnchor1.y - s.m_sweep.localCenter.y, h = e.col1.x * r + e.col2.x * a;
                (a = e.col1.y * r + e.col2.y * a), (r = h), (e = n.m_xf.R);
                var l = this.m_localAnchor2.x - n.m_sweep.localCenter.x, c = this.m_localAnchor2.y - n.m_sweep.localCenter.y;
                (h = e.col1.x * l + e.col2.x * c), (c = e.col1.y * l + e.col2.y * c), (l = h);
                var _ = n.m_sweep.c.x + l - s.m_sweep.c.x - r, m = n.m_sweep.c.y + c - s.m_sweep.c.y - a, u = Math.sqrt(_ * _ + m * m);
                (_ /= u), (m /= u);
                var p = u - this.m_length;
                p = o.Clamp(p, -t.b2_maxLinearCorrection, t.b2_maxLinearCorrection);
                var d = -this.m_mass * p;
                this.m_u.Set(_, m);
                var y = d * this.m_u.x, x = d * this.m_u.y;
                return ((s.m_sweep.c.x -= s.m_invMass * y),
                    (s.m_sweep.c.y -= s.m_invMass * x),
                    (s.m_sweep.a -= s.m_invI * (r * x - a * y)),
                    (n.m_sweep.c.x += n.m_invMass * y),
                    (n.m_sweep.c.y += n.m_invMass * x),
                    (n.m_sweep.a += n.m_invI * (l * x - c * y)),
                    s.SynchronizeTransform(),
                    n.SynchronizeTransform(),
                    t.b2_linearSlop > o.Abs(p));
            }),
            $i_22.inherit(a, $i_22.Dynamics.Joints.b2JointDef),
            (a.prototype.__super = $i_22.Dynamics.Joints.b2JointDef.prototype),
            (a.b2DistanceJointDef = function () {
                $i_22.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
                    (this.localAnchorA = new s()),
                    (this.localAnchorB = new s());
            }),
            (a.prototype.b2DistanceJointDef = function () {
                this.__super.b2JointDef.call(this),
                    (this.type = u.e_distanceJoint),
                    (this.length = 1),
                    (this.frequencyHz = 0),
                    (this.dampingRatio = 0);
            }),
            (a.prototype.Initialize = function (t, i, e, o) {
                (this.bodyA = t),
                    (this.bodyB = i),
                    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(e)),
                    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(o));
                var s = o.x - e.x, n = o.y - e.y;
                (this.length = Math.sqrt(s * s + n * n)), (this.frequencyHz = 0), (this.dampingRatio = 0);
            }),
            $i_22.inherit(h, $i_22.Dynamics.Joints.b2Joint),
            (h.prototype.__super = $i_22.Dynamics.Joints.b2Joint.prototype),
            (h.b2FrictionJoint = function () {
                $i_22.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
                    (this.m_localAnchorA = new s()),
                    (this.m_localAnchorB = new s()),
                    (this.m_linearMass = new i()),
                    (this.m_linearImpulse = new s());
            }),
            (h.prototype.GetAnchorA = function () {
                return this.m_bodyA.GetWorldPoint(this.m_localAnchorA);
            }),
            (h.prototype.GetAnchorB = function () {
                return this.m_bodyB.GetWorldPoint(this.m_localAnchorB);
            }),
            (h.prototype.GetReactionForce = function (t) {
                return t === void 0 && (t = 0), new s(t * this.m_linearImpulse.x, t * this.m_linearImpulse.y);
            }),
            (h.prototype.GetReactionTorque = function (t) {
                return t === void 0 && (t = 0), t * this.m_angularImpulse;
            }),
            (h.prototype.SetMaxForce = function (t) {
                t === void 0 && (t = 0), (this.m_maxForce = t);
            }),
            (h.prototype.GetMaxForce = function () {
                return this.m_maxForce;
            }),
            (h.prototype.SetMaxTorque = function (t) {
                t === void 0 && (t = 0), (this.m_maxTorque = t);
            }),
            (h.prototype.GetMaxTorque = function () {
                return this.m_maxTorque;
            }),
            (h.prototype.b2FrictionJoint = function (t) {
                this.__super.b2Joint.call(this, t),
                    this.m_localAnchorA.SetV(t.localAnchorA),
                    this.m_localAnchorB.SetV(t.localAnchorB),
                    this.m_linearMass.SetZero(),
                    (this.m_angularMass = 0),
                    this.m_linearImpulse.SetZero(),
                    (this.m_angularImpulse = 0),
                    (this.m_maxForce = t.maxForce),
                    (this.m_maxTorque = t.maxTorque);
            }),
            (h.prototype.InitVelocityConstraints = function (t) {
                var e, o = 0, s = this.m_bodyA, n = this.m_bodyB;
                e = s.m_xf.R;
                var r = this.m_localAnchorA.x - s.m_sweep.localCenter.x, a = this.m_localAnchorA.y - s.m_sweep.localCenter.y;
                (o = e.col1.x * r + e.col2.x * a), (a = e.col1.y * r + e.col2.y * a), (r = o), (e = n.m_xf.R);
                var h = this.m_localAnchorB.x - n.m_sweep.localCenter.x, l = this.m_localAnchorB.y - n.m_sweep.localCenter.y;
                (o = e.col1.x * h + e.col2.x * l), (l = e.col1.y * h + e.col2.y * l), (h = o);
                var c = s.m_invMass, _ = n.m_invMass, m = s.m_invI, u = n.m_invI, p = new i();
                if (((p.col1.x = c + _),
                    (p.col2.x = 0),
                    (p.col1.y = 0),
                    (p.col2.y = c + _),
                    (p.col1.x += m * a * a),
                    (p.col2.x += -m * r * a),
                    (p.col1.y += -m * r * a),
                    (p.col2.y += m * r * r),
                    (p.col1.x += u * l * l),
                    (p.col2.x += -u * h * l),
                    (p.col1.y += -u * h * l),
                    (p.col2.y += u * h * h),
                    p.GetInverse(this.m_linearMass),
                    (this.m_angularMass = m + u),
                    this.m_angularMass > 0 && (this.m_angularMass = 1 / this.m_angularMass),
                    t.warmStarting)) {
                    (this.m_linearImpulse.x *= t.dtRatio),
                        (this.m_linearImpulse.y *= t.dtRatio),
                        (this.m_angularImpulse *= t.dtRatio);
                    var d = this.m_linearImpulse;
                    (s.m_linearVelocity.x -= c * d.x),
                        (s.m_linearVelocity.y -= c * d.y),
                        (s.m_angularVelocity -= m * (r * d.y - a * d.x + this.m_angularImpulse)),
                        (n.m_linearVelocity.x += _ * d.x),
                        (n.m_linearVelocity.y += _ * d.y),
                        (n.m_angularVelocity += u * (h * d.y - l * d.x + this.m_angularImpulse));
                }
                else
                    this.m_linearImpulse.SetZero(), (this.m_angularImpulse = 0);
            }),
            (h.prototype.SolveVelocityConstraints = function (t) {
                var i, e = 0, n = this.m_bodyA, r = this.m_bodyB, a = n.m_linearVelocity, h = n.m_angularVelocity, l = r.m_linearVelocity, c = r.m_angularVelocity, _ = n.m_invMass, m = r.m_invMass, u = n.m_invI, p = r.m_invI;
                i = n.m_xf.R;
                var d = this.m_localAnchorA.x - n.m_sweep.localCenter.x, y = this.m_localAnchorA.y - n.m_sweep.localCenter.y;
                (e = i.col1.x * d + i.col2.x * y), (y = i.col1.y * d + i.col2.y * y), (d = e), (i = r.m_xf.R);
                var x = this.m_localAnchorB.x - r.m_sweep.localCenter.x, f = this.m_localAnchorB.y - r.m_sweep.localCenter.y;
                (e = i.col1.x * x + i.col2.x * f), (f = i.col1.y * x + i.col2.y * f), (x = e);
                var g = 0, b = c - h, v = -this.m_angularMass * b, w = this.m_angularImpulse;
                (g = t.dt * this.m_maxTorque),
                    (this.m_angularImpulse = o.Clamp(this.m_angularImpulse + v, -g, g)),
                    (v = this.m_angularImpulse - w),
                    (h -= u * v),
                    (c += p * v);
                var C = l.x - c * f - a.x + h * y, D = l.y + c * x - a.y - h * d, B = o.MulMV(this.m_linearMass, new s(-C, -D)), S = this.m_linearImpulse.Copy();
                this.m_linearImpulse.Add(B),
                    (g = t.dt * this.m_maxForce),
                    this.m_linearImpulse.LengthSquared() > g * g &&
                        (this.m_linearImpulse.Normalize(), this.m_linearImpulse.Multiply(g)),
                    (B = o.SubtractVV(this.m_linearImpulse, S)),
                    (a.x -= _ * B.x),
                    (a.y -= _ * B.y),
                    (h -= u * (d * B.y - y * B.x)),
                    (l.x += m * B.x),
                    (l.y += m * B.y),
                    (c += p * (x * B.y - f * B.x)),
                    (n.m_angularVelocity = h),
                    (r.m_angularVelocity = c);
            }),
            (h.prototype.SolvePositionConstraints = function (t) {
                return t === void 0 && (t = 0), !0;
            }),
            $i_22.inherit(l, $i_22.Dynamics.Joints.b2JointDef),
            (l.prototype.__super = $i_22.Dynamics.Joints.b2JointDef.prototype),
            (l.b2FrictionJointDef = function () {
                $i_22.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
                    (this.localAnchorA = new s()),
                    (this.localAnchorB = new s());
            }),
            (l.prototype.b2FrictionJointDef = function () {
                this.__super.b2JointDef.call(this),
                    (this.type = u.e_frictionJoint),
                    (this.maxForce = 0),
                    (this.maxTorque = 0);
            }),
            (l.prototype.Initialize = function (t, i, e) {
                (this.bodyA = t),
                    (this.bodyB = i),
                    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(e)),
                    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(e));
            }),
            $i_22.inherit(c, $i_22.Dynamics.Joints.b2Joint),
            (c.prototype.__super = $i_22.Dynamics.Joints.b2Joint.prototype),
            (c.b2GearJoint = function () {
                $i_22.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
                    (this.m_groundAnchor1 = new s()),
                    (this.m_groundAnchor2 = new s()),
                    (this.m_localAnchor1 = new s()),
                    (this.m_localAnchor2 = new s()),
                    (this.m_J = new m());
            }),
            (c.prototype.GetAnchorA = function () {
                return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
            }),
            (c.prototype.GetAnchorB = function () {
                return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
            }),
            (c.prototype.GetReactionForce = function (t) {
                return (t === void 0 && (t = 0),
                    new s(t * this.m_impulse * this.m_J.linearB.x, t * this.m_impulse * this.m_J.linearB.y));
            }),
            (c.prototype.GetReactionTorque = function (t) {
                t === void 0 && (t = 0);
                var i = this.m_bodyB.m_xf.R, e = this.m_localAnchor1.x - this.m_bodyB.m_sweep.localCenter.x, o = this.m_localAnchor1.y - this.m_bodyB.m_sweep.localCenter.y, s = i.col1.x * e + i.col2.x * o;
                (o = i.col1.y * e + i.col2.y * o), (e = s);
                var n = this.m_impulse * this.m_J.linearB.x, r = this.m_impulse * this.m_J.linearB.y;
                return t * (this.m_impulse * this.m_J.angularB - e * r + o * n);
            }),
            (c.prototype.GetRatio = function () {
                return this.m_ratio;
            }),
            (c.prototype.SetRatio = function (t) {
                t === void 0 && (t = 0), (this.m_ratio = t);
            }),
            (c.prototype.b2GearJoint = function (t) {
                this.__super.b2Joint.call(this, t);
                var i = parseInt(t.joint1.m_type), e = parseInt(t.joint2.m_type);
                (this.m_revolute1 = null),
                    (this.m_prismatic1 = null),
                    (this.m_revolute2 = null),
                    (this.m_prismatic2 = null);
                var o = 0, s = 0;
                (this.m_ground1 = t.joint1.GetBodyA()),
                    (this.m_bodyA = t.joint1.GetBodyB()),
                    i == u.e_revoluteJoint
                        ? ((this.m_revolute1 = t.joint1 instanceof D ? t.joint1 : null),
                            this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1),
                            this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2),
                            (o = this.m_revolute1.GetJointAngle()))
                        : ((this.m_prismatic1 = t.joint1 instanceof b ? t.joint1 : null),
                            this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1),
                            this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2),
                            (o = this.m_prismatic1.GetJointTranslation())),
                    (this.m_ground2 = t.joint2.GetBodyA()),
                    (this.m_bodyB = t.joint2.GetBodyB()),
                    e == u.e_revoluteJoint
                        ? ((this.m_revolute2 = t.joint2 instanceof D ? t.joint2 : null),
                            this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1),
                            this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2),
                            (s = this.m_revolute2.GetJointAngle()))
                        : ((this.m_prismatic2 = t.joint2 instanceof b ? t.joint2 : null),
                            this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1),
                            this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2),
                            (s = this.m_prismatic2.GetJointTranslation())),
                    (this.m_ratio = t.ratio),
                    (this.m_constant = o + this.m_ratio * s),
                    (this.m_impulse = 0);
            }),
            (c.prototype.InitVelocityConstraints = function (t) {
                var i, e, o = this.m_ground1, s = this.m_ground2, n = this.m_bodyA, r = this.m_bodyB, a = 0, h = 0, l = 0, c = 0, _ = 0, m = 0, u = 0;
                this.m_J.SetZero(),
                    this.m_revolute1
                        ? ((this.m_J.angularA = -1), (u += n.m_invI))
                        : ((i = o.m_xf.R),
                            (e = this.m_prismatic1.m_localXAxis1),
                            (a = i.col1.x * e.x + i.col2.x * e.y),
                            (h = i.col1.y * e.x + i.col2.y * e.y),
                            (i = n.m_xf.R),
                            (l = this.m_localAnchor1.x - n.m_sweep.localCenter.x),
                            (c = this.m_localAnchor1.y - n.m_sweep.localCenter.y),
                            (m = i.col1.x * l + i.col2.x * c),
                            (c = i.col1.y * l + i.col2.y * c),
                            (l = m),
                            (_ = l * h - c * a),
                            this.m_J.linearA.Set(-a, -h),
                            (this.m_J.angularA = -_),
                            (u += n.m_invMass + n.m_invI * _ * _)),
                    this.m_revolute2
                        ? ((this.m_J.angularB = -this.m_ratio), (u += this.m_ratio * this.m_ratio * r.m_invI))
                        : ((i = s.m_xf.R),
                            (e = this.m_prismatic2.m_localXAxis1),
                            (a = i.col1.x * e.x + i.col2.x * e.y),
                            (h = i.col1.y * e.x + i.col2.y * e.y),
                            (i = r.m_xf.R),
                            (l = this.m_localAnchor2.x - r.m_sweep.localCenter.x),
                            (c = this.m_localAnchor2.y - r.m_sweep.localCenter.y),
                            (m = i.col1.x * l + i.col2.x * c),
                            (c = i.col1.y * l + i.col2.y * c),
                            (l = m),
                            (_ = l * h - c * a),
                            this.m_J.linearB.Set(-this.m_ratio * a, -this.m_ratio * h),
                            (this.m_J.angularB = -this.m_ratio * _),
                            (u += this.m_ratio * this.m_ratio * (r.m_invMass + r.m_invI * _ * _))),
                    (this.m_mass = u > 0 ? 1 / u : 0),
                    t.warmStarting
                        ? ((n.m_linearVelocity.x += n.m_invMass * this.m_impulse * this.m_J.linearA.x),
                            (n.m_linearVelocity.y += n.m_invMass * this.m_impulse * this.m_J.linearA.y),
                            (n.m_angularVelocity += n.m_invI * this.m_impulse * this.m_J.angularA),
                            (r.m_linearVelocity.x += r.m_invMass * this.m_impulse * this.m_J.linearB.x),
                            (r.m_linearVelocity.y += r.m_invMass * this.m_impulse * this.m_J.linearB.y),
                            (r.m_angularVelocity += r.m_invI * this.m_impulse * this.m_J.angularB))
                        : (this.m_impulse = 0);
            }),
            (c.prototype.SolveVelocityConstraints = function () {
                var t = this.m_bodyA, i = this.m_bodyB, e = this.m_J.Compute(t.m_linearVelocity, t.m_angularVelocity, i.m_linearVelocity, i.m_angularVelocity), o = -this.m_mass * e;
                (this.m_impulse += o),
                    (t.m_linearVelocity.x += t.m_invMass * o * this.m_J.linearA.x),
                    (t.m_linearVelocity.y += t.m_invMass * o * this.m_J.linearA.y),
                    (t.m_angularVelocity += t.m_invI * o * this.m_J.angularA),
                    (i.m_linearVelocity.x += i.m_invMass * o * this.m_J.linearB.x),
                    (i.m_linearVelocity.y += i.m_invMass * o * this.m_J.linearB.y),
                    (i.m_angularVelocity += i.m_invI * o * this.m_J.angularB);
            }),
            (c.prototype.SolvePositionConstraints = function (i) {
                i === void 0 && (i = 0);
                var e = 0, o = this.m_bodyA, s = this.m_bodyB, n = 0, r = 0;
                (n = this.m_revolute1 ? this.m_revolute1.GetJointAngle() : this.m_prismatic1.GetJointTranslation()),
                    (r = this.m_revolute2 ? this.m_revolute2.GetJointAngle() : this.m_prismatic2.GetJointTranslation());
                var a = this.m_constant - (n + this.m_ratio * r), h = -this.m_mass * a;
                return ((o.m_sweep.c.x += o.m_invMass * h * this.m_J.linearA.x),
                    (o.m_sweep.c.y += o.m_invMass * h * this.m_J.linearA.y),
                    (o.m_sweep.a += o.m_invI * h * this.m_J.angularA),
                    (s.m_sweep.c.x += s.m_invMass * h * this.m_J.linearB.x),
                    (s.m_sweep.c.y += s.m_invMass * h * this.m_J.linearB.y),
                    (s.m_sweep.a += s.m_invI * h * this.m_J.angularB),
                    o.SynchronizeTransform(),
                    s.SynchronizeTransform(),
                    t.b2_linearSlop > e);
            }),
            $i_22.inherit(_, $i_22.Dynamics.Joints.b2JointDef),
            (_.prototype.__super = $i_22.Dynamics.Joints.b2JointDef.prototype),
            (_.b2GearJointDef = function () {
                $i_22.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments);
            }),
            (_.prototype.b2GearJointDef = function () {
                this.__super.b2JointDef.call(this),
                    (this.type = u.e_gearJoint),
                    (this.joint1 = null),
                    (this.joint2 = null),
                    (this.ratio = 1);
            }),
            (m.b2Jacobian = function () {
                (this.linearA = new s()), (this.linearB = new s());
            }),
            (m.prototype.SetZero = function () {
                this.linearA.SetZero(), (this.angularA = 0), this.linearB.SetZero(), (this.angularB = 0);
            }),
            (m.prototype.Set = function (t, i, e, o) {
                i === void 0 && (i = 0),
                    o === void 0 && (o = 0),
                    this.linearA.SetV(t),
                    (this.angularA = i),
                    this.linearB.SetV(e),
                    (this.angularB = o);
            }),
            (m.prototype.Compute = function (t, i, e, o) {
                return (i === void 0 && (i = 0),
                    o === void 0 && (o = 0),
                    this.linearA.x * t.x +
                        this.linearA.y * t.y +
                        this.angularA * i +
                        (this.linearB.x * e.x + this.linearB.y * e.y) +
                        this.angularB * o);
            }),
            (u.b2Joint = function () {
                (this.m_edgeA = new d()),
                    (this.m_edgeB = new d()),
                    (this.m_localCenterA = new s()),
                    (this.m_localCenterB = new s());
            }),
            (u.prototype.GetType = function () {
                return this.m_type;
            }),
            (u.prototype.GetAnchorA = function () {
                return null;
            }),
            (u.prototype.GetAnchorB = function () {
                return null;
            }),
            (u.prototype.GetReactionForce = function (t) {
                return t === void 0 && (t = 0), null;
            }),
            (u.prototype.GetReactionTorque = function (t) {
                return t === void 0 && (t = 0), 0;
            }),
            (u.prototype.GetBodyA = function () {
                return this.m_bodyA;
            }),
            (u.prototype.GetBodyB = function () {
                return this.m_bodyB;
            }),
            (u.prototype.GetNext = function () {
                return this.m_next;
            }),
            (u.prototype.GetUserData = function () {
                return this.m_userData;
            }),
            (u.prototype.SetUserData = function (t) {
                this.m_userData = t;
            }),
            (u.prototype.IsActive = function () {
                return this.m_bodyA.IsActive() && this.m_bodyB.IsActive();
            }),
            (u.Create = function (t) {
                var i = null;
                switch (t.type) {
                    case u.e_distanceJoint:
                        i = new r(t instanceof a ? t : null);
                        break;
                    case u.e_mouseJoint:
                        i = new f(t instanceof g ? t : null);
                        break;
                    case u.e_prismaticJoint:
                        i = new b(t instanceof v ? t : null);
                        break;
                    case u.e_revoluteJoint:
                        i = new D(t instanceof B ? t : null);
                        break;
                    case u.e_pulleyJoint:
                        i = new w(t instanceof C ? t : null);
                        break;
                    case u.e_gearJoint:
                        i = new c(t instanceof _ ? t : null);
                        break;
                    case u.e_lineJoint:
                        i = new y(t instanceof x ? t : null);
                        break;
                    case u.e_weldJoint:
                        i = new S(t instanceof I ? t : null);
                        break;
                    case u.e_frictionJoint:
                        i = new h(t instanceof l ? t : null);
                        break;
                    default:
                }
                return i;
            }),
            (u.Destroy = function () { }),
            (u.prototype.b2Joint = function (i) {
                t.b2Assert(i.bodyA != i.bodyB),
                    (this.m_type = i.type),
                    (this.m_prev = null),
                    (this.m_next = null),
                    (this.m_bodyA = i.bodyA),
                    (this.m_bodyB = i.bodyB),
                    (this.m_collideConnected = i.collideConnected),
                    (this.m_islandFlag = !1),
                    (this.m_userData = i.userData);
            }),
            (u.prototype.InitVelocityConstraints = function () { }),
            (u.prototype.SolveVelocityConstraints = function () { }),
            (u.prototype.FinalizeVelocityConstraints = function () { }),
            (u.prototype.SolvePositionConstraints = function (t) {
                return t === void 0 && (t = 0), !1;
            }),
            $i_22.postDefs.push(function () {
                ($i_22.Dynamics.Joints.b2Joint.e_unknownJoint = 0),
                    ($i_22.Dynamics.Joints.b2Joint.e_revoluteJoint = 1),
                    ($i_22.Dynamics.Joints.b2Joint.e_prismaticJoint = 2),
                    ($i_22.Dynamics.Joints.b2Joint.e_distanceJoint = 3),
                    ($i_22.Dynamics.Joints.b2Joint.e_pulleyJoint = 4),
                    ($i_22.Dynamics.Joints.b2Joint.e_mouseJoint = 5),
                    ($i_22.Dynamics.Joints.b2Joint.e_gearJoint = 6),
                    ($i_22.Dynamics.Joints.b2Joint.e_lineJoint = 7),
                    ($i_22.Dynamics.Joints.b2Joint.e_weldJoint = 8),
                    ($i_22.Dynamics.Joints.b2Joint.e_frictionJoint = 9),
                    ($i_22.Dynamics.Joints.b2Joint.e_inactiveLimit = 0),
                    ($i_22.Dynamics.Joints.b2Joint.e_atLowerLimit = 1),
                    ($i_22.Dynamics.Joints.b2Joint.e_atUpperLimit = 2),
                    ($i_22.Dynamics.Joints.b2Joint.e_equalLimits = 3);
            }),
            (p.b2JointDef = function () { }),
            (p.prototype.b2JointDef = function () {
                (this.type = u.e_unknownJoint),
                    (this.userData = null),
                    (this.bodyA = null),
                    (this.bodyB = null),
                    (this.collideConnected = !1);
            }),
            (d.b2JointEdge = function () { }),
            $i_22.inherit(y, $i_22.Dynamics.Joints.b2Joint),
            (y.prototype.__super = $i_22.Dynamics.Joints.b2Joint.prototype),
            (y.b2LineJoint = function () {
                $i_22.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
                    (this.m_localAnchor1 = new s()),
                    (this.m_localAnchor2 = new s()),
                    (this.m_localXAxis1 = new s()),
                    (this.m_localYAxis1 = new s()),
                    (this.m_axis = new s()),
                    (this.m_perp = new s()),
                    (this.m_K = new i()),
                    (this.m_impulse = new s());
            }),
            (y.prototype.GetAnchorA = function () {
                return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
            }),
            (y.prototype.GetAnchorB = function () {
                return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
            }),
            (y.prototype.GetReactionForce = function (t) {
                return (t === void 0 && (t = 0),
                    new s(t *
                        (this.m_impulse.x * this.m_perp.x +
                            (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x), t *
                        (this.m_impulse.x * this.m_perp.y +
                            (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y)));
            }),
            (y.prototype.GetReactionTorque = function (t) {
                return t === void 0 && (t = 0), t * this.m_impulse.y;
            }),
            (y.prototype.GetJointTranslation = function () {
                var t = this.m_bodyA, i = this.m_bodyB, e = t.GetWorldPoint(this.m_localAnchor1), o = i.GetWorldPoint(this.m_localAnchor2), s = o.x - e.x, n = o.y - e.y, r = t.GetWorldVector(this.m_localXAxis1), a = r.x * s + r.y * n;
                return a;
            }),
            (y.prototype.GetJointSpeed = function () {
                var t, i = this.m_bodyA, e = this.m_bodyB;
                t = i.m_xf.R;
                var o = this.m_localAnchor1.x - i.m_sweep.localCenter.x, s = this.m_localAnchor1.y - i.m_sweep.localCenter.y, n = t.col1.x * o + t.col2.x * s;
                (s = t.col1.y * o + t.col2.y * s), (o = n), (t = e.m_xf.R);
                var r = this.m_localAnchor2.x - e.m_sweep.localCenter.x, a = this.m_localAnchor2.y - e.m_sweep.localCenter.y;
                (n = t.col1.x * r + t.col2.x * a), (a = t.col1.y * r + t.col2.y * a), (r = n);
                var h = i.m_sweep.c.x + o, l = i.m_sweep.c.y + s, c = e.m_sweep.c.x + r, _ = e.m_sweep.c.y + a, m = c - h, u = _ - l, p = i.GetWorldVector(this.m_localXAxis1), d = i.m_linearVelocity, y = e.m_linearVelocity, x = i.m_angularVelocity, f = e.m_angularVelocity, g = m * -x * p.y +
                    u * x * p.x +
                    (p.x * (y.x + -f * a - d.x - -x * s) + p.y * (y.y + f * r - d.y - x * o));
                return g;
            }),
            (y.prototype.IsLimitEnabled = function () {
                return this.m_enableLimit;
            }),
            (y.prototype.EnableLimit = function (t) {
                this.m_bodyA.SetAwake(!0), this.m_bodyB.SetAwake(!0), (this.m_enableLimit = t);
            }),
            (y.prototype.GetLowerLimit = function () {
                return this.m_lowerTranslation;
            }),
            (y.prototype.GetUpperLimit = function () {
                return this.m_upperTranslation;
            }),
            (y.prototype.SetLimits = function (t, i) {
                t === void 0 && (t = 0),
                    i === void 0 && (i = 0),
                    this.m_bodyA.SetAwake(!0),
                    this.m_bodyB.SetAwake(!0),
                    (this.m_lowerTranslation = t),
                    (this.m_upperTranslation = i);
            }),
            (y.prototype.IsMotorEnabled = function () {
                return this.m_enableMotor;
            }),
            (y.prototype.EnableMotor = function (t) {
                this.m_bodyA.SetAwake(!0), this.m_bodyB.SetAwake(!0), (this.m_enableMotor = t);
            }),
            (y.prototype.SetMotorSpeed = function (t) {
                t === void 0 && (t = 0), this.m_bodyA.SetAwake(!0), this.m_bodyB.SetAwake(!0), (this.m_motorSpeed = t);
            }),
            (y.prototype.GetMotorSpeed = function () {
                return this.m_motorSpeed;
            }),
            (y.prototype.SetMaxMotorForce = function (t) {
                t === void 0 && (t = 0),
                    this.m_bodyA.SetAwake(!0),
                    this.m_bodyB.SetAwake(!0),
                    (this.m_maxMotorForce = t);
            }),
            (y.prototype.GetMaxMotorForce = function () {
                return this.m_maxMotorForce;
            }),
            (y.prototype.GetMotorForce = function () {
                return this.m_motorImpulse;
            }),
            (y.prototype.b2LineJoint = function (t) {
                this.__super.b2Joint.call(this, t),
                    this.m_localAnchor1.SetV(t.localAnchorA),
                    this.m_localAnchor2.SetV(t.localAnchorB),
                    this.m_localXAxis1.SetV(t.localAxisA),
                    (this.m_localYAxis1.x = -this.m_localXAxis1.y),
                    (this.m_localYAxis1.y = this.m_localXAxis1.x),
                    this.m_impulse.SetZero(),
                    (this.m_motorMass = 0),
                    (this.m_motorImpulse = 0),
                    (this.m_lowerTranslation = t.lowerTranslation),
                    (this.m_upperTranslation = t.upperTranslation),
                    (this.m_maxMotorForce = t.maxMotorForce),
                    (this.m_motorSpeed = t.motorSpeed),
                    (this.m_enableLimit = t.enableLimit),
                    (this.m_enableMotor = t.enableMotor),
                    (this.m_limitState = u.e_inactiveLimit),
                    this.m_axis.SetZero(),
                    this.m_perp.SetZero();
            }),
            (y.prototype.InitVelocityConstraints = function (i) {
                var e, s = this.m_bodyA, n = this.m_bodyB, r = 0;
                this.m_localCenterA.SetV(s.GetLocalCenter()), this.m_localCenterB.SetV(n.GetLocalCenter());
                var a = s.GetTransform();
                n.GetTransform(), (e = s.m_xf.R);
                var h = this.m_localAnchor1.x - this.m_localCenterA.x, l = this.m_localAnchor1.y - this.m_localCenterA.y;
                (r = e.col1.x * h + e.col2.x * l), (l = e.col1.y * h + e.col2.y * l), (h = r), (e = n.m_xf.R);
                var c = this.m_localAnchor2.x - this.m_localCenterB.x, _ = this.m_localAnchor2.y - this.m_localCenterB.y;
                (r = e.col1.x * c + e.col2.x * _), (_ = e.col1.y * c + e.col2.y * _), (c = r);
                var m = n.m_sweep.c.x + c - s.m_sweep.c.x - h, p = n.m_sweep.c.y + _ - s.m_sweep.c.y - l;
                (this.m_invMassA = s.m_invMass),
                    (this.m_invMassB = n.m_invMass),
                    (this.m_invIA = s.m_invI),
                    (this.m_invIB = n.m_invI),
                    this.m_axis.SetV(o.MulMV(a.R, this.m_localXAxis1)),
                    (this.m_a1 = (m + h) * this.m_axis.y - (p + l) * this.m_axis.x),
                    (this.m_a2 = c * this.m_axis.y - _ * this.m_axis.x),
                    (this.m_motorMass =
                        this.m_invMassA +
                            this.m_invMassB +
                            this.m_invIA * this.m_a1 * this.m_a1 +
                            this.m_invIB * this.m_a2 * this.m_a2),
                    (this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1 / this.m_motorMass : 0),
                    this.m_perp.SetV(o.MulMV(a.R, this.m_localYAxis1)),
                    (this.m_s1 = (m + h) * this.m_perp.y - (p + l) * this.m_perp.x),
                    (this.m_s2 = c * this.m_perp.y - _ * this.m_perp.x);
                var d = this.m_invMassA, y = this.m_invMassB, x = this.m_invIA, f = this.m_invIB;
                if (((this.m_K.col1.x = d + y + x * this.m_s1 * this.m_s1 + f * this.m_s2 * this.m_s2),
                    (this.m_K.col1.y = x * this.m_s1 * this.m_a1 + f * this.m_s2 * this.m_a2),
                    (this.m_K.col2.x = this.m_K.col1.y),
                    (this.m_K.col2.y = d + y + x * this.m_a1 * this.m_a1 + f * this.m_a2 * this.m_a2),
                    this.m_enableLimit)) {
                    var g = this.m_axis.x * m + this.m_axis.y * p;
                    2 * t.b2_linearSlop > o.Abs(this.m_upperTranslation - this.m_lowerTranslation)
                        ? (this.m_limitState = u.e_equalLimits)
                        : g > this.m_lowerTranslation
                            ? this.m_upperTranslation > g
                                ? ((this.m_limitState = u.e_inactiveLimit), (this.m_impulse.y = 0))
                                : this.m_limitState != u.e_atUpperLimit &&
                                    ((this.m_limitState = u.e_atUpperLimit), (this.m_impulse.y = 0))
                            : this.m_limitState != u.e_atLowerLimit &&
                                ((this.m_limitState = u.e_atLowerLimit), (this.m_impulse.y = 0));
                }
                else
                    this.m_limitState = u.e_inactiveLimit;
                if ((this.m_enableMotor == 0 && (this.m_motorImpulse = 0), i.warmStarting)) {
                    (this.m_impulse.x *= i.dtRatio),
                        (this.m_impulse.y *= i.dtRatio),
                        (this.m_motorImpulse *= i.dtRatio);
                    var b = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x, v = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y, w = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1, C = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2;
                    (s.m_linearVelocity.x -= this.m_invMassA * b),
                        (s.m_linearVelocity.y -= this.m_invMassA * v),
                        (s.m_angularVelocity -= this.m_invIA * w),
                        (n.m_linearVelocity.x += this.m_invMassB * b),
                        (n.m_linearVelocity.y += this.m_invMassB * v),
                        (n.m_angularVelocity += this.m_invIB * C);
                }
                else
                    this.m_impulse.SetZero(), (this.m_motorImpulse = 0);
            }),
            (y.prototype.SolveVelocityConstraints = function (t) {
                var i = this.m_bodyA, e = this.m_bodyB, n = i.m_linearVelocity, r = i.m_angularVelocity, a = e.m_linearVelocity, h = e.m_angularVelocity, l = 0, c = 0, _ = 0, m = 0;
                if (this.m_enableMotor && this.m_limitState != u.e_equalLimits) {
                    var p = this.m_axis.x * (a.x - n.x) + this.m_axis.y * (a.y - n.y) + this.m_a2 * h - this.m_a1 * r, d = this.m_motorMass * (this.m_motorSpeed - p), y = this.m_motorImpulse, x = t.dt * this.m_maxMotorForce;
                    (this.m_motorImpulse = o.Clamp(this.m_motorImpulse + d, -x, x)),
                        (d = this.m_motorImpulse - y),
                        (l = d * this.m_axis.x),
                        (c = d * this.m_axis.y),
                        (_ = d * this.m_a1),
                        (m = d * this.m_a2),
                        (n.x -= this.m_invMassA * l),
                        (n.y -= this.m_invMassA * c),
                        (r -= this.m_invIA * _),
                        (a.x += this.m_invMassB * l),
                        (a.y += this.m_invMassB * c),
                        (h += this.m_invIB * m);
                }
                var f = this.m_perp.x * (a.x - n.x) + this.m_perp.y * (a.y - n.y) + this.m_s2 * h - this.m_s1 * r;
                if (this.m_enableLimit && this.m_limitState != u.e_inactiveLimit) {
                    var g = this.m_axis.x * (a.x - n.x) + this.m_axis.y * (a.y - n.y) + this.m_a2 * h - this.m_a1 * r, b = this.m_impulse.Copy(), v = this.m_K.Solve(new s(), -f, -g);
                    this.m_impulse.Add(v),
                        this.m_limitState == u.e_atLowerLimit
                            ? (this.m_impulse.y = o.Max(this.m_impulse.y, 0))
                            : this.m_limitState == u.e_atUpperLimit && (this.m_impulse.y = o.Min(this.m_impulse.y, 0));
                    var w = -f - (this.m_impulse.y - b.y) * this.m_K.col2.x, C = 0;
                    (C = this.m_K.col1.x != 0 ? w / this.m_K.col1.x + b.x : b.x),
                        (this.m_impulse.x = C),
                        (v.x = this.m_impulse.x - b.x),
                        (v.y = this.m_impulse.y - b.y),
                        (l = v.x * this.m_perp.x + v.y * this.m_axis.x),
                        (c = v.x * this.m_perp.y + v.y * this.m_axis.y),
                        (_ = v.x * this.m_s1 + v.y * this.m_a1),
                        (m = v.x * this.m_s2 + v.y * this.m_a2),
                        (n.x -= this.m_invMassA * l),
                        (n.y -= this.m_invMassA * c),
                        (r -= this.m_invIA * _),
                        (a.x += this.m_invMassB * l),
                        (a.y += this.m_invMassB * c),
                        (h += this.m_invIB * m);
                }
                else {
                    var D = 0;
                    (D = this.m_K.col1.x != 0 ? -f / this.m_K.col1.x : 0),
                        (this.m_impulse.x += D),
                        (l = D * this.m_perp.x),
                        (c = D * this.m_perp.y),
                        (_ = D * this.m_s1),
                        (m = D * this.m_s2),
                        (n.x -= this.m_invMassA * l),
                        (n.y -= this.m_invMassA * c),
                        (r -= this.m_invIA * _),
                        (a.x += this.m_invMassB * l),
                        (a.y += this.m_invMassB * c),
                        (h += this.m_invIB * m);
                }
                i.m_linearVelocity.SetV(n),
                    (i.m_angularVelocity = r),
                    e.m_linearVelocity.SetV(a),
                    (e.m_angularVelocity = h);
            }),
            (y.prototype.SolvePositionConstraints = function (e) {
                e === void 0 && (e = 0);
                var n, r = this.m_bodyA, a = this.m_bodyB, h = r.m_sweep.c, l = r.m_sweep.a, c = a.m_sweep.c, _ = a.m_sweep.a, m = 0, u = 0, p = 0, d = 0, y = 0, x = 0, f = 0, g = !1, b = 0, v = i.FromAngle(l), w = i.FromAngle(_);
                n = v;
                var C = this.m_localAnchor1.x - this.m_localCenterA.x, D = this.m_localAnchor1.y - this.m_localCenterA.y;
                (m = n.col1.x * C + n.col2.x * D), (D = n.col1.y * C + n.col2.y * D), (C = m), (n = w);
                var B = this.m_localAnchor2.x - this.m_localCenterB.x, S = this.m_localAnchor2.y - this.m_localCenterB.y;
                (m = n.col1.x * B + n.col2.x * S), (S = n.col1.y * B + n.col2.y * S), (B = m);
                var I = c.x + B - h.x - C, A = c.y + S - h.y - D;
                if (this.m_enableLimit) {
                    (this.m_axis = o.MulMV(v, this.m_localXAxis1)),
                        (this.m_a1 = (I + C) * this.m_axis.y - (A + D) * this.m_axis.x),
                        (this.m_a2 = B * this.m_axis.y - S * this.m_axis.x);
                    var M = this.m_axis.x * I + this.m_axis.y * A;
                    2 * t.b2_linearSlop > o.Abs(this.m_upperTranslation - this.m_lowerTranslation)
                        ? ((b = o.Clamp(M, -t.b2_maxLinearCorrection, t.b2_maxLinearCorrection)),
                            (x = o.Abs(M)),
                            (g = !0))
                        : M > this.m_lowerTranslation
                            ? this.m_upperTranslation > M ||
                                ((b = o.Clamp(M - this.m_upperTranslation + t.b2_linearSlop, 0, t.b2_maxLinearCorrection)),
                                    (x = M - this.m_upperTranslation),
                                    (g = !0))
                            : ((b = o.Clamp(M - this.m_lowerTranslation + t.b2_linearSlop, -t.b2_maxLinearCorrection, 0)),
                                (x = this.m_lowerTranslation - M),
                                (g = !0));
                }
                (this.m_perp = o.MulMV(v, this.m_localYAxis1)),
                    (this.m_s1 = (I + C) * this.m_perp.y - (A + D) * this.m_perp.x),
                    (this.m_s2 = B * this.m_perp.y - S * this.m_perp.x);
                var T = new s(), P = this.m_perp.x * I + this.m_perp.y * A;
                if (((x = o.Max(x, o.Abs(P))), (f = 0), g))
                    (u = this.m_invMassA),
                        (p = this.m_invMassB),
                        (d = this.m_invIA),
                        (y = this.m_invIB),
                        (this.m_K.col1.x = u + p + d * this.m_s1 * this.m_s1 + y * this.m_s2 * this.m_s2),
                        (this.m_K.col1.y = d * this.m_s1 * this.m_a1 + y * this.m_s2 * this.m_a2),
                        (this.m_K.col2.x = this.m_K.col1.y),
                        (this.m_K.col2.y = u + p + d * this.m_a1 * this.m_a1 + y * this.m_a2 * this.m_a2),
                        this.m_K.Solve(T, -P, -b);
                else {
                    (u = this.m_invMassA), (p = this.m_invMassB), (d = this.m_invIA), (y = this.m_invIB);
                    var V = u + p + d * this.m_s1 * this.m_s1 + y * this.m_s2 * this.m_s2, R = 0;
                    (R = V != 0 ? -P / V : 0), (T.x = R), (T.y = 0);
                }
                var L = T.x * this.m_perp.x + T.y * this.m_axis.x, k = T.x * this.m_perp.y + T.y * this.m_axis.y, F = T.x * this.m_s1 + T.y * this.m_a1, G = T.x * this.m_s2 + T.y * this.m_a2;
                return ((h.x -= this.m_invMassA * L),
                    (h.y -= this.m_invMassA * k),
                    (l -= this.m_invIA * F),
                    (c.x += this.m_invMassB * L),
                    (c.y += this.m_invMassB * k),
                    (_ += this.m_invIB * G),
                    (r.m_sweep.a = l),
                    (a.m_sweep.a = _),
                    r.SynchronizeTransform(),
                    a.SynchronizeTransform(),
                    t.b2_linearSlop >= x && t.b2_angularSlop >= f);
            }),
            $i_22.inherit(x, $i_22.Dynamics.Joints.b2JointDef),
            (x.prototype.__super = $i_22.Dynamics.Joints.b2JointDef.prototype),
            (x.b2LineJointDef = function () {
                $i_22.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
                    (this.localAnchorA = new s()),
                    (this.localAnchorB = new s()),
                    (this.localAxisA = new s());
            }),
            (x.prototype.b2LineJointDef = function () {
                this.__super.b2JointDef.call(this),
                    (this.type = u.e_lineJoint),
                    this.localAxisA.Set(1, 0),
                    (this.enableLimit = !1),
                    (this.lowerTranslation = 0),
                    (this.upperTranslation = 0),
                    (this.enableMotor = !1),
                    (this.maxMotorForce = 0),
                    (this.motorSpeed = 0);
            }),
            (x.prototype.Initialize = function (t, i, e, o) {
                (this.bodyA = t),
                    (this.bodyB = i),
                    (this.localAnchorA = this.bodyA.GetLocalPoint(e)),
                    (this.localAnchorB = this.bodyB.GetLocalPoint(e)),
                    (this.localAxisA = this.bodyA.GetLocalVector(o));
            }),
            $i_22.inherit(f, $i_22.Dynamics.Joints.b2Joint),
            (f.prototype.__super = $i_22.Dynamics.Joints.b2Joint.prototype),
            (f.b2MouseJoint = function () {
                $i_22.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
                    (this.K = new i()),
                    (this.K1 = new i()),
                    (this.K2 = new i()),
                    (this.m_localAnchor = new s()),
                    (this.m_target = new s()),
                    (this.m_impulse = new s()),
                    (this.m_mass = new i()),
                    (this.m_C = new s());
            }),
            (f.prototype.GetAnchorA = function () {
                return this.m_target;
            }),
            (f.prototype.GetAnchorB = function () {
                return this.m_bodyB.GetWorldPoint(this.m_localAnchor);
            }),
            (f.prototype.GetReactionForce = function (t) {
                return t === void 0 && (t = 0), new s(t * this.m_impulse.x, t * this.m_impulse.y);
            }),
            (f.prototype.GetReactionTorque = function (t) {
                return t === void 0 && (t = 0), 0;
            }),
            (f.prototype.GetTarget = function () {
                return this.m_target;
            }),
            (f.prototype.SetTarget = function (t) {
                this.m_bodyB.IsAwake() == 0 && this.m_bodyB.SetAwake(!0), (this.m_target = t);
            }),
            (f.prototype.GetMaxForce = function () {
                return this.m_maxForce;
            }),
            (f.prototype.SetMaxForce = function (t) {
                t === void 0 && (t = 0), (this.m_maxForce = t);
            }),
            (f.prototype.GetFrequency = function () {
                return this.m_frequencyHz;
            }),
            (f.prototype.SetFrequency = function (t) {
                t === void 0 && (t = 0), (this.m_frequencyHz = t);
            }),
            (f.prototype.GetDampingRatio = function () {
                return this.m_dampingRatio;
            }),
            (f.prototype.SetDampingRatio = function (t) {
                t === void 0 && (t = 0), (this.m_dampingRatio = t);
            }),
            (f.prototype.b2MouseJoint = function (t) {
                this.__super.b2Joint.call(this, t), this.m_target.SetV(t.target);
                var i = this.m_target.x - this.m_bodyB.m_xf.position.x, e = this.m_target.y - this.m_bodyB.m_xf.position.y, o = this.m_bodyB.m_xf.R;
                (this.m_localAnchor.x = i * o.col1.x + e * o.col1.y),
                    (this.m_localAnchor.y = i * o.col2.x + e * o.col2.y),
                    (this.m_maxForce = t.maxForce),
                    this.m_impulse.SetZero(),
                    (this.m_frequencyHz = t.frequencyHz),
                    (this.m_dampingRatio = t.dampingRatio),
                    (this.m_beta = 0),
                    (this.m_gamma = 0);
            }),
            (f.prototype.InitVelocityConstraints = function (t) {
                var i = this.m_bodyB, e = i.GetMass(), o = 2 * Math.PI * this.m_frequencyHz, s = 2 * e * this.m_dampingRatio * o, n = e * o * o;
                (this.m_gamma = t.dt * (s + t.dt * n)),
                    (this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0),
                    (this.m_beta = t.dt * n * this.m_gamma);
                var r;
                r = i.m_xf.R;
                var a = this.m_localAnchor.x - i.m_sweep.localCenter.x, h = this.m_localAnchor.y - i.m_sweep.localCenter.y, l = r.col1.x * a + r.col2.x * h;
                (h = r.col1.y * a + r.col2.y * h), (a = l);
                var c = i.m_invMass, _ = i.m_invI;
                (this.K1.col1.x = c),
                    (this.K1.col2.x = 0),
                    (this.K1.col1.y = 0),
                    (this.K1.col2.y = c),
                    (this.K2.col1.x = _ * h * h),
                    (this.K2.col2.x = -_ * a * h),
                    (this.K2.col1.y = -_ * a * h),
                    (this.K2.col2.y = _ * a * a),
                    this.K.SetM(this.K1),
                    this.K.AddM(this.K2),
                    (this.K.col1.x += this.m_gamma),
                    (this.K.col2.y += this.m_gamma),
                    this.K.GetInverse(this.m_mass),
                    (this.m_C.x = i.m_sweep.c.x + a - this.m_target.x),
                    (this.m_C.y = i.m_sweep.c.y + h - this.m_target.y),
                    (i.m_angularVelocity *= 0.98),
                    (this.m_impulse.x *= t.dtRatio),
                    (this.m_impulse.y *= t.dtRatio),
                    (i.m_linearVelocity.x += c * this.m_impulse.x),
                    (i.m_linearVelocity.y += c * this.m_impulse.y),
                    (i.m_angularVelocity += _ * (a * this.m_impulse.y - h * this.m_impulse.x));
            }),
            (f.prototype.SolveVelocityConstraints = function (t) {
                var i, e = this.m_bodyB, o = 0, s = 0;
                i = e.m_xf.R;
                var n = this.m_localAnchor.x - e.m_sweep.localCenter.x, r = this.m_localAnchor.y - e.m_sweep.localCenter.y;
                (o = i.col1.x * n + i.col2.x * r), (r = i.col1.y * n + i.col2.y * r), (n = o);
                var a = e.m_linearVelocity.x + -e.m_angularVelocity * r, h = e.m_linearVelocity.y + e.m_angularVelocity * n;
                (i = this.m_mass),
                    (o = a + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x),
                    (s = h + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y);
                var l = -(i.col1.x * o + i.col2.x * s), c = -(i.col1.y * o + i.col2.y * s), _ = this.m_impulse.x, m = this.m_impulse.y;
                (this.m_impulse.x += l), (this.m_impulse.y += c);
                var u = t.dt * this.m_maxForce;
                this.m_impulse.LengthSquared() > u * u && this.m_impulse.Multiply(u / this.m_impulse.Length()),
                    (l = this.m_impulse.x - _),
                    (c = this.m_impulse.y - m),
                    (e.m_linearVelocity.x += e.m_invMass * l),
                    (e.m_linearVelocity.y += e.m_invMass * c),
                    (e.m_angularVelocity += e.m_invI * (n * c - r * l));
            }),
            (f.prototype.SolvePositionConstraints = function (t) {
                return t === void 0 && (t = 0), !0;
            }),
            $i_22.inherit(g, $i_22.Dynamics.Joints.b2JointDef),
            (g.prototype.__super = $i_22.Dynamics.Joints.b2JointDef.prototype),
            (g.b2MouseJointDef = function () {
                $i_22.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments), (this.target = new s());
            }),
            (g.prototype.b2MouseJointDef = function () {
                this.__super.b2JointDef.call(this),
                    (this.type = u.e_mouseJoint),
                    (this.maxForce = 0),
                    (this.frequencyHz = 5),
                    (this.dampingRatio = 0.7);
            }),
            $i_22.inherit(b, $i_22.Dynamics.Joints.b2Joint),
            (b.prototype.__super = $i_22.Dynamics.Joints.b2Joint.prototype),
            (b.b2PrismaticJoint = function () {
                $i_22.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
                    (this.m_localAnchor1 = new s()),
                    (this.m_localAnchor2 = new s()),
                    (this.m_localXAxis1 = new s()),
                    (this.m_localYAxis1 = new s()),
                    (this.m_axis = new s()),
                    (this.m_perp = new s()),
                    (this.m_K = new e()),
                    (this.m_impulse = new n());
            }),
            (b.prototype.GetAnchorA = function () {
                return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
            }),
            (b.prototype.GetAnchorB = function () {
                return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
            }),
            (b.prototype.GetReactionForce = function (t) {
                return (t === void 0 && (t = 0),
                    new s(t *
                        (this.m_impulse.x * this.m_perp.x +
                            (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), t *
                        (this.m_impulse.x * this.m_perp.y +
                            (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y)));
            }),
            (b.prototype.GetReactionTorque = function (t) {
                return t === void 0 && (t = 0), t * this.m_impulse.y;
            }),
            (b.prototype.GetJointTranslation = function () {
                var t = this.m_bodyA, i = this.m_bodyB, e = t.GetWorldPoint(this.m_localAnchor1), o = i.GetWorldPoint(this.m_localAnchor2), s = o.x - e.x, n = o.y - e.y, r = t.GetWorldVector(this.m_localXAxis1), a = r.x * s + r.y * n;
                return a;
            }),
            (b.prototype.GetJointSpeed = function () {
                var t, i = this.m_bodyA, e = this.m_bodyB;
                t = i.m_xf.R;
                var o = this.m_localAnchor1.x - i.m_sweep.localCenter.x, s = this.m_localAnchor1.y - i.m_sweep.localCenter.y, n = t.col1.x * o + t.col2.x * s;
                (s = t.col1.y * o + t.col2.y * s), (o = n), (t = e.m_xf.R);
                var r = this.m_localAnchor2.x - e.m_sweep.localCenter.x, a = this.m_localAnchor2.y - e.m_sweep.localCenter.y;
                (n = t.col1.x * r + t.col2.x * a), (a = t.col1.y * r + t.col2.y * a), (r = n);
                var h = i.m_sweep.c.x + o, l = i.m_sweep.c.y + s, c = e.m_sweep.c.x + r, _ = e.m_sweep.c.y + a, m = c - h, u = _ - l, p = i.GetWorldVector(this.m_localXAxis1), d = i.m_linearVelocity, y = e.m_linearVelocity, x = i.m_angularVelocity, f = e.m_angularVelocity, g = m * -x * p.y +
                    u * x * p.x +
                    (p.x * (y.x + -f * a - d.x - -x * s) + p.y * (y.y + f * r - d.y - x * o));
                return g;
            }),
            (b.prototype.IsLimitEnabled = function () {
                return this.m_enableLimit;
            }),
            (b.prototype.EnableLimit = function (t) {
                this.m_bodyA.SetAwake(!0), this.m_bodyB.SetAwake(!0), (this.m_enableLimit = t);
            }),
            (b.prototype.GetLowerLimit = function () {
                return this.m_lowerTranslation;
            }),
            (b.prototype.GetUpperLimit = function () {
                return this.m_upperTranslation;
            }),
            (b.prototype.SetLimits = function (t, i) {
                t === void 0 && (t = 0),
                    i === void 0 && (i = 0),
                    this.m_bodyA.SetAwake(!0),
                    this.m_bodyB.SetAwake(!0),
                    (this.m_lowerTranslation = t),
                    (this.m_upperTranslation = i);
            }),
            (b.prototype.IsMotorEnabled = function () {
                return this.m_enableMotor;
            }),
            (b.prototype.EnableMotor = function (t) {
                this.m_bodyA.SetAwake(!0), this.m_bodyB.SetAwake(!0), (this.m_enableMotor = t);
            }),
            (b.prototype.SetMotorSpeed = function (t) {
                t === void 0 && (t = 0), this.m_bodyA.SetAwake(!0), this.m_bodyB.SetAwake(!0), (this.m_motorSpeed = t);
            }),
            (b.prototype.GetMotorSpeed = function () {
                return this.m_motorSpeed;
            }),
            (b.prototype.SetMaxMotorForce = function (t) {
                t === void 0 && (t = 0),
                    this.m_bodyA.SetAwake(!0),
                    this.m_bodyB.SetAwake(!0),
                    (this.m_maxMotorForce = t);
            }),
            (b.prototype.GetMotorForce = function () {
                return this.m_motorImpulse;
            }),
            (b.prototype.b2PrismaticJoint = function (t) {
                this.__super.b2Joint.call(this, t),
                    this.m_localAnchor1.SetV(t.localAnchorA),
                    this.m_localAnchor2.SetV(t.localAnchorB),
                    this.m_localXAxis1.SetV(t.localAxisA),
                    (this.m_localYAxis1.x = -this.m_localXAxis1.y),
                    (this.m_localYAxis1.y = this.m_localXAxis1.x),
                    (this.m_refAngle = t.referenceAngle),
                    this.m_impulse.SetZero(),
                    (this.m_motorMass = 0),
                    (this.m_motorImpulse = 0),
                    (this.m_lowerTranslation = t.lowerTranslation),
                    (this.m_upperTranslation = t.upperTranslation),
                    (this.m_maxMotorForce = t.maxMotorForce),
                    (this.m_motorSpeed = t.motorSpeed),
                    (this.m_enableLimit = t.enableLimit),
                    (this.m_enableMotor = t.enableMotor),
                    (this.m_limitState = u.e_inactiveLimit),
                    this.m_axis.SetZero(),
                    this.m_perp.SetZero();
            }),
            (b.prototype.InitVelocityConstraints = function (i) {
                var e, s = this.m_bodyA, n = this.m_bodyB, r = 0;
                this.m_localCenterA.SetV(s.GetLocalCenter()), this.m_localCenterB.SetV(n.GetLocalCenter());
                var a = s.GetTransform();
                n.GetTransform(), (e = s.m_xf.R);
                var h = this.m_localAnchor1.x - this.m_localCenterA.x, l = this.m_localAnchor1.y - this.m_localCenterA.y;
                (r = e.col1.x * h + e.col2.x * l), (l = e.col1.y * h + e.col2.y * l), (h = r), (e = n.m_xf.R);
                var c = this.m_localAnchor2.x - this.m_localCenterB.x, _ = this.m_localAnchor2.y - this.m_localCenterB.y;
                (r = e.col1.x * c + e.col2.x * _), (_ = e.col1.y * c + e.col2.y * _), (c = r);
                var m = n.m_sweep.c.x + c - s.m_sweep.c.x - h, p = n.m_sweep.c.y + _ - s.m_sweep.c.y - l;
                (this.m_invMassA = s.m_invMass),
                    (this.m_invMassB = n.m_invMass),
                    (this.m_invIA = s.m_invI),
                    (this.m_invIB = n.m_invI),
                    this.m_axis.SetV(o.MulMV(a.R, this.m_localXAxis1)),
                    (this.m_a1 = (m + h) * this.m_axis.y - (p + l) * this.m_axis.x),
                    (this.m_a2 = c * this.m_axis.y - _ * this.m_axis.x),
                    (this.m_motorMass =
                        this.m_invMassA +
                            this.m_invMassB +
                            this.m_invIA * this.m_a1 * this.m_a1 +
                            this.m_invIB * this.m_a2 * this.m_a2),
                    this.m_motorMass > Number.MIN_VALUE && (this.m_motorMass = 1 / this.m_motorMass),
                    this.m_perp.SetV(o.MulMV(a.R, this.m_localYAxis1)),
                    (this.m_s1 = (m + h) * this.m_perp.y - (p + l) * this.m_perp.x),
                    (this.m_s2 = c * this.m_perp.y - _ * this.m_perp.x);
                var d = this.m_invMassA, y = this.m_invMassB, x = this.m_invIA, f = this.m_invIB;
                if (((this.m_K.col1.x = d + y + x * this.m_s1 * this.m_s1 + f * this.m_s2 * this.m_s2),
                    (this.m_K.col1.y = x * this.m_s1 + f * this.m_s2),
                    (this.m_K.col1.z = x * this.m_s1 * this.m_a1 + f * this.m_s2 * this.m_a2),
                    (this.m_K.col2.x = this.m_K.col1.y),
                    (this.m_K.col2.y = x + f),
                    (this.m_K.col2.z = x * this.m_a1 + f * this.m_a2),
                    (this.m_K.col3.x = this.m_K.col1.z),
                    (this.m_K.col3.y = this.m_K.col2.z),
                    (this.m_K.col3.z = d + y + x * this.m_a1 * this.m_a1 + f * this.m_a2 * this.m_a2),
                    this.m_enableLimit)) {
                    var g = this.m_axis.x * m + this.m_axis.y * p;
                    2 * t.b2_linearSlop > o.Abs(this.m_upperTranslation - this.m_lowerTranslation)
                        ? (this.m_limitState = u.e_equalLimits)
                        : g > this.m_lowerTranslation
                            ? this.m_upperTranslation > g
                                ? ((this.m_limitState = u.e_inactiveLimit), (this.m_impulse.z = 0))
                                : this.m_limitState != u.e_atUpperLimit &&
                                    ((this.m_limitState = u.e_atUpperLimit), (this.m_impulse.z = 0))
                            : this.m_limitState != u.e_atLowerLimit &&
                                ((this.m_limitState = u.e_atLowerLimit), (this.m_impulse.z = 0));
                }
                else
                    this.m_limitState = u.e_inactiveLimit;
                if ((this.m_enableMotor == 0 && (this.m_motorImpulse = 0), i.warmStarting)) {
                    (this.m_impulse.x *= i.dtRatio),
                        (this.m_impulse.y *= i.dtRatio),
                        (this.m_motorImpulse *= i.dtRatio);
                    var b = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x, v = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y, w = this.m_impulse.x * this.m_s1 +
                        this.m_impulse.y +
                        (this.m_motorImpulse + this.m_impulse.z) * this.m_a1, C = this.m_impulse.x * this.m_s2 +
                        this.m_impulse.y +
                        (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
                    (s.m_linearVelocity.x -= this.m_invMassA * b),
                        (s.m_linearVelocity.y -= this.m_invMassA * v),
                        (s.m_angularVelocity -= this.m_invIA * w),
                        (n.m_linearVelocity.x += this.m_invMassB * b),
                        (n.m_linearVelocity.y += this.m_invMassB * v),
                        (n.m_angularVelocity += this.m_invIB * C);
                }
                else
                    this.m_impulse.SetZero(), (this.m_motorImpulse = 0);
            }),
            (b.prototype.SolveVelocityConstraints = function (t) {
                var i = this.m_bodyA, e = this.m_bodyB, r = i.m_linearVelocity, a = i.m_angularVelocity, h = e.m_linearVelocity, l = e.m_angularVelocity, c = 0, _ = 0, m = 0, p = 0;
                if (this.m_enableMotor && this.m_limitState != u.e_equalLimits) {
                    var d = this.m_axis.x * (h.x - r.x) + this.m_axis.y * (h.y - r.y) + this.m_a2 * l - this.m_a1 * a, y = this.m_motorMass * (this.m_motorSpeed - d), x = this.m_motorImpulse, f = t.dt * this.m_maxMotorForce;
                    (this.m_motorImpulse = o.Clamp(this.m_motorImpulse + y, -f, f)),
                        (y = this.m_motorImpulse - x),
                        (c = y * this.m_axis.x),
                        (_ = y * this.m_axis.y),
                        (m = y * this.m_a1),
                        (p = y * this.m_a2),
                        (r.x -= this.m_invMassA * c),
                        (r.y -= this.m_invMassA * _),
                        (a -= this.m_invIA * m),
                        (h.x += this.m_invMassB * c),
                        (h.y += this.m_invMassB * _),
                        (l += this.m_invIB * p);
                }
                var g = this.m_perp.x * (h.x - r.x) + this.m_perp.y * (h.y - r.y) + this.m_s2 * l - this.m_s1 * a, b = l - a;
                if (this.m_enableLimit && this.m_limitState != u.e_inactiveLimit) {
                    var v = this.m_axis.x * (h.x - r.x) + this.m_axis.y * (h.y - r.y) + this.m_a2 * l - this.m_a1 * a, w = this.m_impulse.Copy(), C = this.m_K.Solve33(new n(), -g, -b, -v);
                    this.m_impulse.Add(C),
                        this.m_limitState == u.e_atLowerLimit
                            ? (this.m_impulse.z = o.Max(this.m_impulse.z, 0))
                            : this.m_limitState == u.e_atUpperLimit && (this.m_impulse.z = o.Min(this.m_impulse.z, 0));
                    var D = -g - (this.m_impulse.z - w.z) * this.m_K.col3.x, B = -b - (this.m_impulse.z - w.z) * this.m_K.col3.y, S = this.m_K.Solve22(new s(), D, B);
                    (S.x += w.x),
                        (S.y += w.y),
                        (this.m_impulse.x = S.x),
                        (this.m_impulse.y = S.y),
                        (C.x = this.m_impulse.x - w.x),
                        (C.y = this.m_impulse.y - w.y),
                        (C.z = this.m_impulse.z - w.z),
                        (c = C.x * this.m_perp.x + C.z * this.m_axis.x),
                        (_ = C.x * this.m_perp.y + C.z * this.m_axis.y),
                        (m = C.x * this.m_s1 + C.y + C.z * this.m_a1),
                        (p = C.x * this.m_s2 + C.y + C.z * this.m_a2),
                        (r.x -= this.m_invMassA * c),
                        (r.y -= this.m_invMassA * _),
                        (a -= this.m_invIA * m),
                        (h.x += this.m_invMassB * c),
                        (h.y += this.m_invMassB * _),
                        (l += this.m_invIB * p);
                }
                else {
                    var I = this.m_K.Solve22(new s(), -g, -b);
                    (this.m_impulse.x += I.x),
                        (this.m_impulse.y += I.y),
                        (c = I.x * this.m_perp.x),
                        (_ = I.x * this.m_perp.y),
                        (m = I.x * this.m_s1 + I.y),
                        (p = I.x * this.m_s2 + I.y),
                        (r.x -= this.m_invMassA * c),
                        (r.y -= this.m_invMassA * _),
                        (a -= this.m_invIA * m),
                        (h.x += this.m_invMassB * c),
                        (h.y += this.m_invMassB * _),
                        (l += this.m_invIB * p);
                }
                i.m_linearVelocity.SetV(r),
                    (i.m_angularVelocity = a),
                    e.m_linearVelocity.SetV(h),
                    (e.m_angularVelocity = l);
            }),
            (b.prototype.SolvePositionConstraints = function (e) {
                e === void 0 && (e = 0);
                var r, a = this.m_bodyA, h = this.m_bodyB, l = a.m_sweep.c, c = a.m_sweep.a, _ = h.m_sweep.c, m = h.m_sweep.a, u = 0, p = 0, d = 0, y = 0, x = 0, f = 0, g = 0, b = !1, v = 0, w = i.FromAngle(c), C = i.FromAngle(m);
                r = w;
                var D = this.m_localAnchor1.x - this.m_localCenterA.x, B = this.m_localAnchor1.y - this.m_localCenterA.y;
                (u = r.col1.x * D + r.col2.x * B), (B = r.col1.y * D + r.col2.y * B), (D = u), (r = C);
                var S = this.m_localAnchor2.x - this.m_localCenterB.x, I = this.m_localAnchor2.y - this.m_localCenterB.y;
                (u = r.col1.x * S + r.col2.x * I), (I = r.col1.y * S + r.col2.y * I), (S = u);
                var A = _.x + S - l.x - D, M = _.y + I - l.y - B;
                if (this.m_enableLimit) {
                    (this.m_axis = o.MulMV(w, this.m_localXAxis1)),
                        (this.m_a1 = (A + D) * this.m_axis.y - (M + B) * this.m_axis.x),
                        (this.m_a2 = S * this.m_axis.y - I * this.m_axis.x);
                    var T = this.m_axis.x * A + this.m_axis.y * M;
                    2 * t.b2_linearSlop > o.Abs(this.m_upperTranslation - this.m_lowerTranslation)
                        ? ((v = o.Clamp(T, -t.b2_maxLinearCorrection, t.b2_maxLinearCorrection)),
                            (f = o.Abs(T)),
                            (b = !0))
                        : T > this.m_lowerTranslation
                            ? this.m_upperTranslation > T ||
                                ((v = o.Clamp(T - this.m_upperTranslation + t.b2_linearSlop, 0, t.b2_maxLinearCorrection)),
                                    (f = T - this.m_upperTranslation),
                                    (b = !0))
                            : ((v = o.Clamp(T - this.m_lowerTranslation + t.b2_linearSlop, -t.b2_maxLinearCorrection, 0)),
                                (f = this.m_lowerTranslation - T),
                                (b = !0));
                }
                (this.m_perp = o.MulMV(w, this.m_localYAxis1)),
                    (this.m_s1 = (A + D) * this.m_perp.y - (M + B) * this.m_perp.x),
                    (this.m_s2 = S * this.m_perp.y - I * this.m_perp.x);
                var P = new n(), V = this.m_perp.x * A + this.m_perp.y * M, R = m - c - this.m_refAngle;
                if (((f = o.Max(f, o.Abs(V))), (g = o.Abs(R)), b))
                    (p = this.m_invMassA),
                        (d = this.m_invMassB),
                        (y = this.m_invIA),
                        (x = this.m_invIB),
                        (this.m_K.col1.x = p + d + y * this.m_s1 * this.m_s1 + x * this.m_s2 * this.m_s2),
                        (this.m_K.col1.y = y * this.m_s1 + x * this.m_s2),
                        (this.m_K.col1.z = y * this.m_s1 * this.m_a1 + x * this.m_s2 * this.m_a2),
                        (this.m_K.col2.x = this.m_K.col1.y),
                        (this.m_K.col2.y = y + x),
                        (this.m_K.col2.z = y * this.m_a1 + x * this.m_a2),
                        (this.m_K.col3.x = this.m_K.col1.z),
                        (this.m_K.col3.y = this.m_K.col2.z),
                        (this.m_K.col3.z = p + d + y * this.m_a1 * this.m_a1 + x * this.m_a2 * this.m_a2),
                        this.m_K.Solve33(P, -V, -R, -v);
                else {
                    (p = this.m_invMassA), (d = this.m_invMassB), (y = this.m_invIA), (x = this.m_invIB);
                    var L = p + d + y * this.m_s1 * this.m_s1 + x * this.m_s2 * this.m_s2, k = y * this.m_s1 + x * this.m_s2, F = y + x;
                    this.m_K.col1.Set(L, k, 0), this.m_K.col2.Set(k, F, 0);
                    var G = this.m_K.Solve22(new s(), -V, -R);
                    (P.x = G.x), (P.y = G.y), (P.z = 0);
                }
                var E = P.x * this.m_perp.x + P.z * this.m_axis.x, z = P.x * this.m_perp.y + P.z * this.m_axis.y, J = P.x * this.m_s1 + P.y + P.z * this.m_a1, O = P.x * this.m_s2 + P.y + P.z * this.m_a2;
                return ((l.x -= this.m_invMassA * E),
                    (l.y -= this.m_invMassA * z),
                    (c -= this.m_invIA * J),
                    (_.x += this.m_invMassB * E),
                    (_.y += this.m_invMassB * z),
                    (m += this.m_invIB * O),
                    (a.m_sweep.a = c),
                    (h.m_sweep.a = m),
                    a.SynchronizeTransform(),
                    h.SynchronizeTransform(),
                    t.b2_linearSlop >= f && t.b2_angularSlop >= g);
            }),
            $i_22.inherit(v, $i_22.Dynamics.Joints.b2JointDef),
            (v.prototype.__super = $i_22.Dynamics.Joints.b2JointDef.prototype),
            (v.b2PrismaticJointDef = function () {
                $i_22.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
                    (this.localAnchorA = new s()),
                    (this.localAnchorB = new s()),
                    (this.localAxisA = new s());
            }),
            (v.prototype.b2PrismaticJointDef = function () {
                this.__super.b2JointDef.call(this),
                    (this.type = u.e_prismaticJoint),
                    this.localAxisA.Set(1, 0),
                    (this.referenceAngle = 0),
                    (this.enableLimit = !1),
                    (this.lowerTranslation = 0),
                    (this.upperTranslation = 0),
                    (this.enableMotor = !1),
                    (this.maxMotorForce = 0),
                    (this.motorSpeed = 0);
            }),
            (v.prototype.Initialize = function (t, i, e, o) {
                (this.bodyA = t),
                    (this.bodyB = i),
                    (this.localAnchorA = this.bodyA.GetLocalPoint(e)),
                    (this.localAnchorB = this.bodyB.GetLocalPoint(e)),
                    (this.localAxisA = this.bodyA.GetLocalVector(o)),
                    (this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle());
            }),
            $i_22.inherit(w, $i_22.Dynamics.Joints.b2Joint),
            (w.prototype.__super = $i_22.Dynamics.Joints.b2Joint.prototype),
            (w.b2PulleyJoint = function () {
                $i_22.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
                    (this.m_groundAnchor1 = new s()),
                    (this.m_groundAnchor2 = new s()),
                    (this.m_localAnchor1 = new s()),
                    (this.m_localAnchor2 = new s()),
                    (this.m_u1 = new s()),
                    (this.m_u2 = new s());
            }),
            (w.prototype.GetAnchorA = function () {
                return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
            }),
            (w.prototype.GetAnchorB = function () {
                return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
            }),
            (w.prototype.GetReactionForce = function (t) {
                return (t === void 0 && (t = 0), new s(t * this.m_impulse * this.m_u2.x, t * this.m_impulse * this.m_u2.y));
            }),
            (w.prototype.GetReactionTorque = function (t) {
                return t === void 0 && (t = 0), 0;
            }),
            (w.prototype.GetGroundAnchorA = function () {
                var t = this.m_ground.m_xf.position.Copy();
                return t.Add(this.m_groundAnchor1), t;
            }),
            (w.prototype.GetGroundAnchorB = function () {
                var t = this.m_ground.m_xf.position.Copy();
                return t.Add(this.m_groundAnchor2), t;
            }),
            (w.prototype.GetLength1 = function () {
                var t = this.m_bodyA.GetWorldPoint(this.m_localAnchor1), i = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x, e = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y, o = t.x - i, s = t.y - e;
                return Math.sqrt(o * o + s * s);
            }),
            (w.prototype.GetLength2 = function () {
                var t = this.m_bodyB.GetWorldPoint(this.m_localAnchor2), i = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x, e = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y, o = t.x - i, s = t.y - e;
                return Math.sqrt(o * o + s * s);
            }),
            (w.prototype.GetRatio = function () {
                return this.m_ratio;
            }),
            (w.prototype.b2PulleyJoint = function (t) {
                this.__super.b2Joint.call(this, t),
                    (this.m_ground = this.m_bodyA.m_world.m_groundBody),
                    (this.m_groundAnchor1.x = t.groundAnchorA.x - this.m_ground.m_xf.position.x),
                    (this.m_groundAnchor1.y = t.groundAnchorA.y - this.m_ground.m_xf.position.y),
                    (this.m_groundAnchor2.x = t.groundAnchorB.x - this.m_ground.m_xf.position.x),
                    (this.m_groundAnchor2.y = t.groundAnchorB.y - this.m_ground.m_xf.position.y),
                    this.m_localAnchor1.SetV(t.localAnchorA),
                    this.m_localAnchor2.SetV(t.localAnchorB),
                    (this.m_ratio = t.ratio),
                    (this.m_constant = t.lengthA + this.m_ratio * t.lengthB),
                    (this.m_maxLength1 = o.Min(t.maxLengthA, this.m_constant - this.m_ratio * w.b2_minPulleyLength)),
                    (this.m_maxLength2 = o.Min(t.maxLengthB, (this.m_constant - w.b2_minPulleyLength) / this.m_ratio)),
                    (this.m_impulse = 0),
                    (this.m_limitImpulse1 = 0),
                    (this.m_limitImpulse2 = 0);
            }),
            (w.prototype.InitVelocityConstraints = function (i) {
                var e, o = this.m_bodyA, s = this.m_bodyB;
                e = o.m_xf.R;
                var n = this.m_localAnchor1.x - o.m_sweep.localCenter.x, r = this.m_localAnchor1.y - o.m_sweep.localCenter.y, a = e.col1.x * n + e.col2.x * r;
                (r = e.col1.y * n + e.col2.y * r), (n = a), (e = s.m_xf.R);
                var h = this.m_localAnchor2.x - s.m_sweep.localCenter.x, l = this.m_localAnchor2.y - s.m_sweep.localCenter.y;
                (a = e.col1.x * h + e.col2.x * l), (l = e.col1.y * h + e.col2.y * l), (h = a);
                var c = o.m_sweep.c.x + n, _ = o.m_sweep.c.y + r, m = s.m_sweep.c.x + h, p = s.m_sweep.c.y + l, d = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x, y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y, x = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x, f = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
                this.m_u1.Set(c - d, _ - y), this.m_u2.Set(m - x, p - f);
                var g = this.m_u1.Length(), b = this.m_u2.Length();
                g > t.b2_linearSlop ? this.m_u1.Multiply(1 / g) : this.m_u1.SetZero(),
                    b > t.b2_linearSlop ? this.m_u2.Multiply(1 / b) : this.m_u2.SetZero();
                var v = this.m_constant - g - this.m_ratio * b;
                v > 0 ? ((this.m_state = u.e_inactiveLimit), (this.m_impulse = 0)) : (this.m_state = u.e_atUpperLimit),
                    this.m_maxLength1 > g
                        ? ((this.m_limitState1 = u.e_inactiveLimit), (this.m_limitImpulse1 = 0))
                        : (this.m_limitState1 = u.e_atUpperLimit),
                    this.m_maxLength2 > b
                        ? ((this.m_limitState2 = u.e_inactiveLimit), (this.m_limitImpulse2 = 0))
                        : (this.m_limitState2 = u.e_atUpperLimit);
                var w = n * this.m_u1.y - r * this.m_u1.x, C = h * this.m_u2.y - l * this.m_u2.x;
                if (((this.m_limitMass1 = o.m_invMass + o.m_invI * w * w),
                    (this.m_limitMass2 = s.m_invMass + s.m_invI * C * C),
                    (this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2),
                    (this.m_limitMass1 = 1 / this.m_limitMass1),
                    (this.m_limitMass2 = 1 / this.m_limitMass2),
                    (this.m_pulleyMass = 1 / this.m_pulleyMass),
                    i.warmStarting)) {
                    (this.m_impulse *= i.dtRatio),
                        (this.m_limitImpulse1 *= i.dtRatio),
                        (this.m_limitImpulse2 *= i.dtRatio);
                    var D = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.x, B = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.y, S = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.x, I = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.y;
                    (o.m_linearVelocity.x += o.m_invMass * D),
                        (o.m_linearVelocity.y += o.m_invMass * B),
                        (o.m_angularVelocity += o.m_invI * (n * B - r * D)),
                        (s.m_linearVelocity.x += s.m_invMass * S),
                        (s.m_linearVelocity.y += s.m_invMass * I),
                        (s.m_angularVelocity += s.m_invI * (h * I - l * S));
                }
                else
                    (this.m_impulse = 0), (this.m_limitImpulse1 = 0), (this.m_limitImpulse2 = 0);
            }),
            (w.prototype.SolveVelocityConstraints = function () {
                var t, i = this.m_bodyA, e = this.m_bodyB;
                t = i.m_xf.R;
                var s = this.m_localAnchor1.x - i.m_sweep.localCenter.x, n = this.m_localAnchor1.y - i.m_sweep.localCenter.y, r = t.col1.x * s + t.col2.x * n;
                (n = t.col1.y * s + t.col2.y * n), (s = r), (t = e.m_xf.R);
                var a = this.m_localAnchor2.x - e.m_sweep.localCenter.x, h = this.m_localAnchor2.y - e.m_sweep.localCenter.y;
                (r = t.col1.x * a + t.col2.x * h), (h = t.col1.y * a + t.col2.y * h), (a = r);
                var l = 0, c = 0, _ = 0, m = 0, p = 0, d = 0, y = 0, x = 0, f = 0, g = 0, b = 0;
                this.m_state == u.e_atUpperLimit &&
                    ((l = i.m_linearVelocity.x + -i.m_angularVelocity * n),
                        (c = i.m_linearVelocity.y + i.m_angularVelocity * s),
                        (_ = e.m_linearVelocity.x + -e.m_angularVelocity * h),
                        (m = e.m_linearVelocity.y + e.m_angularVelocity * a),
                        (f = -(this.m_u1.x * l + this.m_u1.y * c) - this.m_ratio * (this.m_u2.x * _ + this.m_u2.y * m)),
                        (g = this.m_pulleyMass * -f),
                        (b = this.m_impulse),
                        (this.m_impulse = o.Max(0, this.m_impulse + g)),
                        (g = this.m_impulse - b),
                        (p = -g * this.m_u1.x),
                        (d = -g * this.m_u1.y),
                        (y = -this.m_ratio * g * this.m_u2.x),
                        (x = -this.m_ratio * g * this.m_u2.y),
                        (i.m_linearVelocity.x += i.m_invMass * p),
                        (i.m_linearVelocity.y += i.m_invMass * d),
                        (i.m_angularVelocity += i.m_invI * (s * d - n * p)),
                        (e.m_linearVelocity.x += e.m_invMass * y),
                        (e.m_linearVelocity.y += e.m_invMass * x),
                        (e.m_angularVelocity += e.m_invI * (a * x - h * y))),
                    this.m_limitState1 == u.e_atUpperLimit &&
                        ((l = i.m_linearVelocity.x + -i.m_angularVelocity * n),
                            (c = i.m_linearVelocity.y + i.m_angularVelocity * s),
                            (f = -(this.m_u1.x * l + this.m_u1.y * c)),
                            (g = -this.m_limitMass1 * f),
                            (b = this.m_limitImpulse1),
                            (this.m_limitImpulse1 = o.Max(0, this.m_limitImpulse1 + g)),
                            (g = this.m_limitImpulse1 - b),
                            (p = -g * this.m_u1.x),
                            (d = -g * this.m_u1.y),
                            (i.m_linearVelocity.x += i.m_invMass * p),
                            (i.m_linearVelocity.y += i.m_invMass * d),
                            (i.m_angularVelocity += i.m_invI * (s * d - n * p))),
                    this.m_limitState2 == u.e_atUpperLimit &&
                        ((_ = e.m_linearVelocity.x + -e.m_angularVelocity * h),
                            (m = e.m_linearVelocity.y + e.m_angularVelocity * a),
                            (f = -(this.m_u2.x * _ + this.m_u2.y * m)),
                            (g = -this.m_limitMass2 * f),
                            (b = this.m_limitImpulse2),
                            (this.m_limitImpulse2 = o.Max(0, this.m_limitImpulse2 + g)),
                            (g = this.m_limitImpulse2 - b),
                            (y = -g * this.m_u2.x),
                            (x = -g * this.m_u2.y),
                            (e.m_linearVelocity.x += e.m_invMass * y),
                            (e.m_linearVelocity.y += e.m_invMass * x),
                            (e.m_angularVelocity += e.m_invI * (a * x - h * y)));
            }),
            (w.prototype.SolvePositionConstraints = function (i) {
                i === void 0 && (i = 0);
                var e, s = this.m_bodyA, n = this.m_bodyB, r = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x, a = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y, h = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x, l = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y, c = 0, _ = 0, m = 0, p = 0, d = 0, y = 0, x = 0, f = 0, g = 0, b = 0, v = 0, w = 0, C = 0, D = 0;
                return (this.m_state == u.e_atUpperLimit &&
                    ((e = s.m_xf.R),
                        (c = this.m_localAnchor1.x - s.m_sweep.localCenter.x),
                        (_ = this.m_localAnchor1.y - s.m_sweep.localCenter.y),
                        (C = e.col1.x * c + e.col2.x * _),
                        (_ = e.col1.y * c + e.col2.y * _),
                        (c = C),
                        (e = n.m_xf.R),
                        (m = this.m_localAnchor2.x - n.m_sweep.localCenter.x),
                        (p = this.m_localAnchor2.y - n.m_sweep.localCenter.y),
                        (C = e.col1.x * m + e.col2.x * p),
                        (p = e.col1.y * m + e.col2.y * p),
                        (m = C),
                        (d = s.m_sweep.c.x + c),
                        (y = s.m_sweep.c.y + _),
                        (x = n.m_sweep.c.x + m),
                        (f = n.m_sweep.c.y + p),
                        this.m_u1.Set(d - r, y - a),
                        this.m_u2.Set(x - h, f - l),
                        (g = this.m_u1.Length()),
                        (b = this.m_u2.Length()),
                        g > t.b2_linearSlop ? this.m_u1.Multiply(1 / g) : this.m_u1.SetZero(),
                        b > t.b2_linearSlop ? this.m_u2.Multiply(1 / b) : this.m_u2.SetZero(),
                        (v = this.m_constant - g - this.m_ratio * b),
                        (D = o.Max(D, -v)),
                        (v = o.Clamp(v + t.b2_linearSlop, -t.b2_maxLinearCorrection, 0)),
                        (w = -this.m_pulleyMass * v),
                        (d = -w * this.m_u1.x),
                        (y = -w * this.m_u1.y),
                        (x = -this.m_ratio * w * this.m_u2.x),
                        (f = -this.m_ratio * w * this.m_u2.y),
                        (s.m_sweep.c.x += s.m_invMass * d),
                        (s.m_sweep.c.y += s.m_invMass * y),
                        (s.m_sweep.a += s.m_invI * (c * y - _ * d)),
                        (n.m_sweep.c.x += n.m_invMass * x),
                        (n.m_sweep.c.y += n.m_invMass * f),
                        (n.m_sweep.a += n.m_invI * (m * f - p * x)),
                        s.SynchronizeTransform(),
                        n.SynchronizeTransform()),
                    this.m_limitState1 == u.e_atUpperLimit &&
                        ((e = s.m_xf.R),
                            (c = this.m_localAnchor1.x - s.m_sweep.localCenter.x),
                            (_ = this.m_localAnchor1.y - s.m_sweep.localCenter.y),
                            (C = e.col1.x * c + e.col2.x * _),
                            (_ = e.col1.y * c + e.col2.y * _),
                            (c = C),
                            (d = s.m_sweep.c.x + c),
                            (y = s.m_sweep.c.y + _),
                            this.m_u1.Set(d - r, y - a),
                            (g = this.m_u1.Length()),
                            g > t.b2_linearSlop ? ((this.m_u1.x *= 1 / g), (this.m_u1.y *= 1 / g)) : this.m_u1.SetZero(),
                            (v = this.m_maxLength1 - g),
                            (D = o.Max(D, -v)),
                            (v = o.Clamp(v + t.b2_linearSlop, -t.b2_maxLinearCorrection, 0)),
                            (w = -this.m_limitMass1 * v),
                            (d = -w * this.m_u1.x),
                            (y = -w * this.m_u1.y),
                            (s.m_sweep.c.x += s.m_invMass * d),
                            (s.m_sweep.c.y += s.m_invMass * y),
                            (s.m_sweep.a += s.m_invI * (c * y - _ * d)),
                            s.SynchronizeTransform()),
                    this.m_limitState2 == u.e_atUpperLimit &&
                        ((e = n.m_xf.R),
                            (m = this.m_localAnchor2.x - n.m_sweep.localCenter.x),
                            (p = this.m_localAnchor2.y - n.m_sweep.localCenter.y),
                            (C = e.col1.x * m + e.col2.x * p),
                            (p = e.col1.y * m + e.col2.y * p),
                            (m = C),
                            (x = n.m_sweep.c.x + m),
                            (f = n.m_sweep.c.y + p),
                            this.m_u2.Set(x - h, f - l),
                            (b = this.m_u2.Length()),
                            b > t.b2_linearSlop ? ((this.m_u2.x *= 1 / b), (this.m_u2.y *= 1 / b)) : this.m_u2.SetZero(),
                            (v = this.m_maxLength2 - b),
                            (D = o.Max(D, -v)),
                            (v = o.Clamp(v + t.b2_linearSlop, -t.b2_maxLinearCorrection, 0)),
                            (w = -this.m_limitMass2 * v),
                            (x = -w * this.m_u2.x),
                            (f = -w * this.m_u2.y),
                            (n.m_sweep.c.x += n.m_invMass * x),
                            (n.m_sweep.c.y += n.m_invMass * f),
                            (n.m_sweep.a += n.m_invI * (m * f - p * x)),
                            n.SynchronizeTransform()),
                    t.b2_linearSlop > D);
            }),
            $i_22.postDefs.push(function () {
                $i_22.Dynamics.Joints.b2PulleyJoint.b2_minPulleyLength = 2;
            }),
            $i_22.inherit(C, $i_22.Dynamics.Joints.b2JointDef),
            (C.prototype.__super = $i_22.Dynamics.Joints.b2JointDef.prototype),
            (C.b2PulleyJointDef = function () {
                $i_22.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
                    (this.groundAnchorA = new s()),
                    (this.groundAnchorB = new s()),
                    (this.localAnchorA = new s()),
                    (this.localAnchorB = new s());
            }),
            (C.prototype.b2PulleyJointDef = function () {
                this.__super.b2JointDef.call(this),
                    (this.type = u.e_pulleyJoint),
                    this.groundAnchorA.Set(-1, 1),
                    this.groundAnchorB.Set(1, 1),
                    this.localAnchorA.Set(-1, 0),
                    this.localAnchorB.Set(1, 0),
                    (this.lengthA = 0),
                    (this.maxLengthA = 0),
                    (this.lengthB = 0),
                    (this.maxLengthB = 0),
                    (this.ratio = 1),
                    (this.collideConnected = !0);
            }),
            (C.prototype.Initialize = function (t, i, e, o, s, n, r) {
                r === void 0 && (r = 0),
                    (this.bodyA = t),
                    (this.bodyB = i),
                    this.groundAnchorA.SetV(e),
                    this.groundAnchorB.SetV(o),
                    (this.localAnchorA = this.bodyA.GetLocalPoint(s)),
                    (this.localAnchorB = this.bodyB.GetLocalPoint(n));
                var a = s.x - e.x, h = s.y - e.y;
                this.lengthA = Math.sqrt(a * a + h * h);
                var l = n.x - o.x, c = n.y - o.y;
                (this.lengthB = Math.sqrt(l * l + c * c)), (this.ratio = r);
                var _ = this.lengthA + this.ratio * this.lengthB;
                (this.maxLengthA = _ - this.ratio * w.b2_minPulleyLength),
                    (this.maxLengthB = (_ - w.b2_minPulleyLength) / this.ratio);
            }),
            $i_22.inherit(D, $i_22.Dynamics.Joints.b2Joint),
            (D.prototype.__super = $i_22.Dynamics.Joints.b2Joint.prototype),
            (D.b2RevoluteJoint = function () {
                $i_22.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
                    (this.K = new i()),
                    (this.K1 = new i()),
                    (this.K2 = new i()),
                    (this.K3 = new i()),
                    (this.impulse3 = new n()),
                    (this.impulse2 = new s()),
                    (this.reduced = new s()),
                    (this.m_localAnchor1 = new s()),
                    (this.m_localAnchor2 = new s()),
                    (this.m_impulse = new n()),
                    (this.m_mass = new e());
            }),
            (D.prototype.GetAnchorA = function () {
                return this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
            }),
            (D.prototype.GetAnchorB = function () {
                return this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
            }),
            (D.prototype.GetReactionForce = function (t) {
                return t === void 0 && (t = 0), new s(t * this.m_impulse.x, t * this.m_impulse.y);
            }),
            (D.prototype.GetReactionTorque = function (t) {
                return t === void 0 && (t = 0), t * this.m_impulse.z;
            }),
            (D.prototype.GetJointAngle = function () {
                return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle;
            }),
            (D.prototype.GetJointSpeed = function () {
                return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity;
            }),
            (D.prototype.IsLimitEnabled = function () {
                return this.m_enableLimit;
            }),
            (D.prototype.EnableLimit = function (t) {
                this.m_enableLimit = t;
            }),
            (D.prototype.GetLowerLimit = function () {
                return this.m_lowerAngle;
            }),
            (D.prototype.GetUpperLimit = function () {
                return this.m_upperAngle;
            }),
            (D.prototype.SetLimits = function (t, i) {
                t === void 0 && (t = 0), i === void 0 && (i = 0), (this.m_lowerAngle = t), (this.m_upperAngle = i);
            }),
            (D.prototype.IsMotorEnabled = function () {
                return this.m_bodyA.SetAwake(!0), this.m_bodyB.SetAwake(!0), this.m_enableMotor;
            }),
            (D.prototype.EnableMotor = function (t) {
                this.m_enableMotor = t;
            }),
            (D.prototype.SetMotorSpeed = function (t) {
                t === void 0 && (t = 0), this.m_bodyA.SetAwake(!0), this.m_bodyB.SetAwake(!0), (this.m_motorSpeed = t);
            }),
            (D.prototype.GetMotorSpeed = function () {
                return this.m_motorSpeed;
            }),
            (D.prototype.SetMaxMotorTorque = function (t) {
                t === void 0 && (t = 0), (this.m_maxMotorTorque = t);
            }),
            (D.prototype.GetMotorTorque = function () {
                return this.m_maxMotorTorque;
            }),
            (D.prototype.b2RevoluteJoint = function (t) {
                this.__super.b2Joint.call(this, t),
                    this.m_localAnchor1.SetV(t.localAnchorA),
                    this.m_localAnchor2.SetV(t.localAnchorB),
                    (this.m_referenceAngle = t.referenceAngle),
                    this.m_impulse.SetZero(),
                    (this.m_motorImpulse = 0),
                    (this.m_lowerAngle = t.lowerAngle),
                    (this.m_upperAngle = t.upperAngle),
                    (this.m_maxMotorTorque = t.maxMotorTorque),
                    (this.m_motorSpeed = t.motorSpeed),
                    (this.m_enableLimit = t.enableLimit),
                    (this.m_enableMotor = t.enableMotor),
                    (this.m_limitState = u.e_inactiveLimit);
            }),
            (D.prototype.InitVelocityConstraints = function (i) {
                var e, s = this.m_bodyA, n = this.m_bodyB, r = 0;
                this.m_enableMotor || this.m_enableLimit, (e = s.m_xf.R);
                var a = this.m_localAnchor1.x - s.m_sweep.localCenter.x, h = this.m_localAnchor1.y - s.m_sweep.localCenter.y;
                (r = e.col1.x * a + e.col2.x * h), (h = e.col1.y * a + e.col2.y * h), (a = r), (e = n.m_xf.R);
                var l = this.m_localAnchor2.x - n.m_sweep.localCenter.x, c = this.m_localAnchor2.y - n.m_sweep.localCenter.y;
                (r = e.col1.x * l + e.col2.x * c), (c = e.col1.y * l + e.col2.y * c), (l = r);
                var _ = s.m_invMass, m = n.m_invMass, p = s.m_invI, d = n.m_invI;
                if (((this.m_mass.col1.x = _ + m + h * h * p + c * c * d),
                    (this.m_mass.col2.x = -h * a * p - c * l * d),
                    (this.m_mass.col3.x = -h * p - c * d),
                    (this.m_mass.col1.y = this.m_mass.col2.x),
                    (this.m_mass.col2.y = _ + m + a * a * p + l * l * d),
                    (this.m_mass.col3.y = a * p + l * d),
                    (this.m_mass.col1.z = this.m_mass.col3.x),
                    (this.m_mass.col2.z = this.m_mass.col3.y),
                    (this.m_mass.col3.z = p + d),
                    (this.m_motorMass = 1 / (p + d)),
                    this.m_enableMotor == 0 && (this.m_motorImpulse = 0),
                    this.m_enableLimit)) {
                    var y = n.m_sweep.a - s.m_sweep.a - this.m_referenceAngle;
                    2 * t.b2_angularSlop > o.Abs(this.m_upperAngle - this.m_lowerAngle)
                        ? (this.m_limitState = u.e_equalLimits)
                        : y > this.m_lowerAngle
                            ? this.m_upperAngle > y
                                ? ((this.m_limitState = u.e_inactiveLimit), (this.m_impulse.z = 0))
                                : (this.m_limitState != u.e_atUpperLimit && (this.m_impulse.z = 0),
                                    (this.m_limitState = u.e_atUpperLimit))
                            : (this.m_limitState != u.e_atLowerLimit && (this.m_impulse.z = 0),
                                (this.m_limitState = u.e_atLowerLimit));
                }
                else
                    this.m_limitState = u.e_inactiveLimit;
                if (i.warmStarting) {
                    (this.m_impulse.x *= i.dtRatio),
                        (this.m_impulse.y *= i.dtRatio),
                        (this.m_motorImpulse *= i.dtRatio);
                    var x = this.m_impulse.x, f = this.m_impulse.y;
                    (s.m_linearVelocity.x -= _ * x),
                        (s.m_linearVelocity.y -= _ * f),
                        (s.m_angularVelocity -= p * (a * f - h * x + this.m_motorImpulse + this.m_impulse.z)),
                        (n.m_linearVelocity.x += m * x),
                        (n.m_linearVelocity.y += m * f),
                        (n.m_angularVelocity += d * (l * f - c * x + this.m_motorImpulse + this.m_impulse.z));
                }
                else
                    this.m_impulse.SetZero(), (this.m_motorImpulse = 0);
            }),
            (D.prototype.SolveVelocityConstraints = function (t) {
                var i, e = this.m_bodyA, s = this.m_bodyB, n = 0, r = 0, a = 0, h = 0, l = 0, c = 0, _ = e.m_linearVelocity, m = e.m_angularVelocity, p = s.m_linearVelocity, d = s.m_angularVelocity, y = e.m_invMass, x = s.m_invMass, f = e.m_invI, g = s.m_invI;
                if (this.m_enableMotor && this.m_limitState != u.e_equalLimits) {
                    var b = d - m - this.m_motorSpeed, v = this.m_motorMass * -b, w = this.m_motorImpulse, C = t.dt * this.m_maxMotorTorque;
                    (this.m_motorImpulse = o.Clamp(this.m_motorImpulse + v, -C, C)),
                        (v = this.m_motorImpulse - w),
                        (m -= f * v),
                        (d += g * v);
                }
                if (this.m_enableLimit && this.m_limitState != u.e_inactiveLimit) {
                    (i = e.m_xf.R),
                        (a = this.m_localAnchor1.x - e.m_sweep.localCenter.x),
                        (h = this.m_localAnchor1.y - e.m_sweep.localCenter.y),
                        (n = i.col1.x * a + i.col2.x * h),
                        (h = i.col1.y * a + i.col2.y * h),
                        (a = n),
                        (i = s.m_xf.R),
                        (l = this.m_localAnchor2.x - s.m_sweep.localCenter.x),
                        (c = this.m_localAnchor2.y - s.m_sweep.localCenter.y),
                        (n = i.col1.x * l + i.col2.x * c),
                        (c = i.col1.y * l + i.col2.y * c),
                        (l = n);
                    var D = p.x + -d * c - _.x - -m * h, B = p.y + d * l - _.y - m * a, S = d - m;
                    this.m_mass.Solve33(this.impulse3, -D, -B, -S),
                        this.m_limitState == u.e_equalLimits
                            ? this.m_impulse.Add(this.impulse3)
                            : this.m_limitState == u.e_atLowerLimit
                                ? ((r = this.m_impulse.z + this.impulse3.z),
                                    0 > r &&
                                        (this.m_mass.Solve22(this.reduced, -D, -B),
                                            (this.impulse3.x = this.reduced.x),
                                            (this.impulse3.y = this.reduced.y),
                                            (this.impulse3.z = -this.m_impulse.z),
                                            (this.m_impulse.x += this.reduced.x),
                                            (this.m_impulse.y += this.reduced.y),
                                            (this.m_impulse.z = 0)))
                                : this.m_limitState == u.e_atUpperLimit &&
                                    ((r = this.m_impulse.z + this.impulse3.z),
                                        r > 0 &&
                                            (this.m_mass.Solve22(this.reduced, -D, -B),
                                                (this.impulse3.x = this.reduced.x),
                                                (this.impulse3.y = this.reduced.y),
                                                (this.impulse3.z = -this.m_impulse.z),
                                                (this.m_impulse.x += this.reduced.x),
                                                (this.m_impulse.y += this.reduced.y),
                                                (this.m_impulse.z = 0))),
                        (_.x -= y * this.impulse3.x),
                        (_.y -= y * this.impulse3.y),
                        (m -= f * (a * this.impulse3.y - h * this.impulse3.x + this.impulse3.z)),
                        (p.x += x * this.impulse3.x),
                        (p.y += x * this.impulse3.y),
                        (d += g * (l * this.impulse3.y - c * this.impulse3.x + this.impulse3.z));
                }
                else {
                    (i = e.m_xf.R),
                        (a = this.m_localAnchor1.x - e.m_sweep.localCenter.x),
                        (h = this.m_localAnchor1.y - e.m_sweep.localCenter.y),
                        (n = i.col1.x * a + i.col2.x * h),
                        (h = i.col1.y * a + i.col2.y * h),
                        (a = n),
                        (i = s.m_xf.R),
                        (l = this.m_localAnchor2.x - s.m_sweep.localCenter.x),
                        (c = this.m_localAnchor2.y - s.m_sweep.localCenter.y),
                        (n = i.col1.x * l + i.col2.x * c),
                        (c = i.col1.y * l + i.col2.y * c),
                        (l = n);
                    var I = p.x + -d * c - _.x - -m * h, A = p.y + d * l - _.y - m * a;
                    this.m_mass.Solve22(this.impulse2, -I, -A),
                        (this.m_impulse.x += this.impulse2.x),
                        (this.m_impulse.y += this.impulse2.y),
                        (_.x -= y * this.impulse2.x),
                        (_.y -= y * this.impulse2.y),
                        (m -= f * (a * this.impulse2.y - h * this.impulse2.x)),
                        (p.x += x * this.impulse2.x),
                        (p.y += x * this.impulse2.y),
                        (d += g * (l * this.impulse2.y - c * this.impulse2.x));
                }
                e.m_linearVelocity.SetV(_),
                    (e.m_angularVelocity = m),
                    s.m_linearVelocity.SetV(p),
                    (s.m_angularVelocity = d);
            }),
            (D.prototype.SolvePositionConstraints = function (i) {
                i === void 0 && (i = 0);
                var e, s = 0, n = this.m_bodyA, r = this.m_bodyB, a = 0, h = 0, l = 0, c = 0, _ = 0;
                if (this.m_enableLimit && this.m_limitState != u.e_inactiveLimit) {
                    var m = r.m_sweep.a - n.m_sweep.a - this.m_referenceAngle, p = 0;
                    this.m_limitState == u.e_equalLimits
                        ? ((s = o.Clamp(m - this.m_lowerAngle, -t.b2_maxAngularCorrection, t.b2_maxAngularCorrection)),
                            (p = -this.m_motorMass * s),
                            (a = o.Abs(s)))
                        : this.m_limitState == u.e_atLowerLimit
                            ? ((s = m - this.m_lowerAngle),
                                (a = -s),
                                (s = o.Clamp(s + t.b2_angularSlop, -t.b2_maxAngularCorrection, 0)),
                                (p = -this.m_motorMass * s))
                            : this.m_limitState == u.e_atUpperLimit &&
                                ((s = m - this.m_upperAngle),
                                    (a = s),
                                    (s = o.Clamp(s - t.b2_angularSlop, 0, t.b2_maxAngularCorrection)),
                                    (p = -this.m_motorMass * s)),
                        (n.m_sweep.a -= n.m_invI * p),
                        (r.m_sweep.a += r.m_invI * p),
                        n.SynchronizeTransform(),
                        r.SynchronizeTransform();
                }
                e = n.m_xf.R;
                var d = this.m_localAnchor1.x - n.m_sweep.localCenter.x, y = this.m_localAnchor1.y - n.m_sweep.localCenter.y;
                (l = e.col1.x * d + e.col2.x * y), (y = e.col1.y * d + e.col2.y * y), (d = l), (e = r.m_xf.R);
                var x = this.m_localAnchor2.x - r.m_sweep.localCenter.x, f = this.m_localAnchor2.y - r.m_sweep.localCenter.y;
                (l = e.col1.x * x + e.col2.x * f), (f = e.col1.y * x + e.col2.y * f), (x = l);
                var g = r.m_sweep.c.x + x - n.m_sweep.c.x - d, b = r.m_sweep.c.y + f - n.m_sweep.c.y - y, v = g * g + b * b, w = Math.sqrt(v);
                h = w;
                var C = n.m_invMass, B = r.m_invMass, S = n.m_invI, I = r.m_invI, A = 10 * t.b2_linearSlop;
                if (v > A * A) {
                    var M = C + B, T = 1 / M;
                    (c = T * -g), (_ = T * -b);
                    var P = 0.5;
                    (n.m_sweep.c.x -= P * C * c),
                        (n.m_sweep.c.y -= P * C * _),
                        (r.m_sweep.c.x += P * B * c),
                        (r.m_sweep.c.y += P * B * _),
                        (g = r.m_sweep.c.x + x - n.m_sweep.c.x - d),
                        (b = r.m_sweep.c.y + f - n.m_sweep.c.y - y);
                }
                return ((this.K1.col1.x = C + B),
                    (this.K1.col2.x = 0),
                    (this.K1.col1.y = 0),
                    (this.K1.col2.y = C + B),
                    (this.K2.col1.x = S * y * y),
                    (this.K2.col2.x = -S * d * y),
                    (this.K2.col1.y = -S * d * y),
                    (this.K2.col2.y = S * d * d),
                    (this.K3.col1.x = I * f * f),
                    (this.K3.col2.x = -I * x * f),
                    (this.K3.col1.y = -I * x * f),
                    (this.K3.col2.y = I * x * x),
                    this.K.SetM(this.K1),
                    this.K.AddM(this.K2),
                    this.K.AddM(this.K3),
                    this.K.Solve(D.tImpulse, -g, -b),
                    (c = D.tImpulse.x),
                    (_ = D.tImpulse.y),
                    (n.m_sweep.c.x -= n.m_invMass * c),
                    (n.m_sweep.c.y -= n.m_invMass * _),
                    (n.m_sweep.a -= n.m_invI * (d * _ - y * c)),
                    (r.m_sweep.c.x += r.m_invMass * c),
                    (r.m_sweep.c.y += r.m_invMass * _),
                    (r.m_sweep.a += r.m_invI * (x * _ - f * c)),
                    n.SynchronizeTransform(),
                    r.SynchronizeTransform(),
                    t.b2_linearSlop >= h && t.b2_angularSlop >= a);
            }),
            $i_22.postDefs.push(function () {
                $i_22.Dynamics.Joints.b2RevoluteJoint.tImpulse = new s();
            }),
            $i_22.inherit(B, $i_22.Dynamics.Joints.b2JointDef),
            (B.prototype.__super = $i_22.Dynamics.Joints.b2JointDef.prototype),
            (B.b2RevoluteJointDef = function () {
                $i_22.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
                    (this.localAnchorA = new s()),
                    (this.localAnchorB = new s());
            }),
            (B.prototype.b2RevoluteJointDef = function () {
                this.__super.b2JointDef.call(this),
                    (this.type = u.e_revoluteJoint),
                    this.localAnchorA.Set(0, 0),
                    this.localAnchorB.Set(0, 0),
                    (this.referenceAngle = 0),
                    (this.lowerAngle = 0),
                    (this.upperAngle = 0),
                    (this.maxMotorTorque = 0),
                    (this.motorSpeed = 0),
                    (this.enableLimit = !1),
                    (this.enableMotor = !1);
            }),
            (B.prototype.Initialize = function (t, i, e) {
                (this.bodyA = t),
                    (this.bodyB = i),
                    (this.localAnchorA = this.bodyA.GetLocalPoint(e)),
                    (this.localAnchorB = this.bodyB.GetLocalPoint(e)),
                    (this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle());
            }),
            $i_22.inherit(S, $i_22.Dynamics.Joints.b2Joint),
            (S.prototype.__super = $i_22.Dynamics.Joints.b2Joint.prototype),
            (S.b2WeldJoint = function () {
                $i_22.Dynamics.Joints.b2Joint.b2Joint.apply(this, arguments),
                    (this.m_localAnchorA = new s()),
                    (this.m_localAnchorB = new s()),
                    (this.m_impulse = new n()),
                    (this.m_mass = new e());
            }),
            (S.prototype.GetAnchorA = function () {
                return this.m_bodyA.GetWorldPoint(this.m_localAnchorA);
            }),
            (S.prototype.GetAnchorB = function () {
                return this.m_bodyB.GetWorldPoint(this.m_localAnchorB);
            }),
            (S.prototype.GetReactionForce = function (t) {
                return t === void 0 && (t = 0), new s(t * this.m_impulse.x, t * this.m_impulse.y);
            }),
            (S.prototype.GetReactionTorque = function (t) {
                return t === void 0 && (t = 0), t * this.m_impulse.z;
            }),
            (S.prototype.b2WeldJoint = function (t) {
                this.__super.b2Joint.call(this, t),
                    this.m_localAnchorA.SetV(t.localAnchorA),
                    this.m_localAnchorB.SetV(t.localAnchorB),
                    (this.m_referenceAngle = t.referenceAngle),
                    this.m_impulse.SetZero(),
                    (this.m_mass = new e());
            }),
            (S.prototype.InitVelocityConstraints = function (t) {
                var i, e = 0, o = this.m_bodyA, s = this.m_bodyB;
                i = o.m_xf.R;
                var n = this.m_localAnchorA.x - o.m_sweep.localCenter.x, r = this.m_localAnchorA.y - o.m_sweep.localCenter.y;
                (e = i.col1.x * n + i.col2.x * r), (r = i.col1.y * n + i.col2.y * r), (n = e), (i = s.m_xf.R);
                var a = this.m_localAnchorB.x - s.m_sweep.localCenter.x, h = this.m_localAnchorB.y - s.m_sweep.localCenter.y;
                (e = i.col1.x * a + i.col2.x * h), (h = i.col1.y * a + i.col2.y * h), (a = e);
                var l = o.m_invMass, c = s.m_invMass, _ = o.m_invI, m = s.m_invI;
                (this.m_mass.col1.x = l + c + r * r * _ + h * h * m),
                    (this.m_mass.col2.x = -r * n * _ - h * a * m),
                    (this.m_mass.col3.x = -r * _ - h * m),
                    (this.m_mass.col1.y = this.m_mass.col2.x),
                    (this.m_mass.col2.y = l + c + n * n * _ + a * a * m),
                    (this.m_mass.col3.y = n * _ + a * m),
                    (this.m_mass.col1.z = this.m_mass.col3.x),
                    (this.m_mass.col2.z = this.m_mass.col3.y),
                    (this.m_mass.col3.z = _ + m),
                    t.warmStarting
                        ? ((this.m_impulse.x *= t.dtRatio),
                            (this.m_impulse.y *= t.dtRatio),
                            (this.m_impulse.z *= t.dtRatio),
                            (o.m_linearVelocity.x -= l * this.m_impulse.x),
                            (o.m_linearVelocity.y -= l * this.m_impulse.y),
                            (o.m_angularVelocity -= _ * (n * this.m_impulse.y - r * this.m_impulse.x + this.m_impulse.z)),
                            (s.m_linearVelocity.x += c * this.m_impulse.x),
                            (s.m_linearVelocity.y += c * this.m_impulse.y),
                            (s.m_angularVelocity += m * (a * this.m_impulse.y - h * this.m_impulse.x + this.m_impulse.z)))
                        : this.m_impulse.SetZero();
            }),
            (S.prototype.SolveVelocityConstraints = function () {
                var t, i = 0, e = this.m_bodyA, o = this.m_bodyB, s = e.m_linearVelocity, r = e.m_angularVelocity, a = o.m_linearVelocity, h = o.m_angularVelocity, l = e.m_invMass, c = o.m_invMass, _ = e.m_invI, m = o.m_invI;
                t = e.m_xf.R;
                var u = this.m_localAnchorA.x - e.m_sweep.localCenter.x, p = this.m_localAnchorA.y - e.m_sweep.localCenter.y;
                (i = t.col1.x * u + t.col2.x * p), (p = t.col1.y * u + t.col2.y * p), (u = i), (t = o.m_xf.R);
                var d = this.m_localAnchorB.x - o.m_sweep.localCenter.x, y = this.m_localAnchorB.y - o.m_sweep.localCenter.y;
                (i = t.col1.x * d + t.col2.x * y), (y = t.col1.y * d + t.col2.y * y), (d = i);
                var x = a.x - h * y - s.x + r * p, f = a.y + h * d - s.y - r * u, g = h - r, b = new n();
                this.m_mass.Solve33(b, -x, -f, -g),
                    this.m_impulse.Add(b),
                    (s.x -= l * b.x),
                    (s.y -= l * b.y),
                    (r -= _ * (u * b.y - p * b.x + b.z)),
                    (a.x += c * b.x),
                    (a.y += c * b.y),
                    (h += m * (d * b.y - y * b.x + b.z)),
                    (e.m_angularVelocity = r),
                    (o.m_angularVelocity = h);
            }),
            (S.prototype.SolvePositionConstraints = function (i) {
                i === void 0 && (i = 0);
                var e, s = 0, r = this.m_bodyA, a = this.m_bodyB;
                e = r.m_xf.R;
                var h = this.m_localAnchorA.x - r.m_sweep.localCenter.x, l = this.m_localAnchorA.y - r.m_sweep.localCenter.y;
                (s = e.col1.x * h + e.col2.x * l), (l = e.col1.y * h + e.col2.y * l), (h = s), (e = a.m_xf.R);
                var c = this.m_localAnchorB.x - a.m_sweep.localCenter.x, _ = this.m_localAnchorB.y - a.m_sweep.localCenter.y;
                (s = e.col1.x * c + e.col2.x * _), (_ = e.col1.y * c + e.col2.y * _), (c = s);
                var m = r.m_invMass, u = a.m_invMass, p = r.m_invI, d = a.m_invI, y = a.m_sweep.c.x + c - r.m_sweep.c.x - h, x = a.m_sweep.c.y + _ - r.m_sweep.c.y - l, f = a.m_sweep.a - r.m_sweep.a - this.m_referenceAngle, g = 10 * t.b2_linearSlop, b = Math.sqrt(y * y + x * x), v = o.Abs(f);
                b > g && ((p *= 1), (d *= 1)),
                    (this.m_mass.col1.x = m + u + l * l * p + _ * _ * d),
                    (this.m_mass.col2.x = -l * h * p - _ * c * d),
                    (this.m_mass.col3.x = -l * p - _ * d),
                    (this.m_mass.col1.y = this.m_mass.col2.x),
                    (this.m_mass.col2.y = m + u + h * h * p + c * c * d),
                    (this.m_mass.col3.y = h * p + c * d),
                    (this.m_mass.col1.z = this.m_mass.col3.x),
                    (this.m_mass.col2.z = this.m_mass.col3.y),
                    (this.m_mass.col3.z = p + d);
                var w = new n();
                return (this.m_mass.Solve33(w, -y, -x, -f),
                    (r.m_sweep.c.x -= m * w.x),
                    (r.m_sweep.c.y -= m * w.y),
                    (r.m_sweep.a -= p * (h * w.y - l * w.x + w.z)),
                    (a.m_sweep.c.x += u * w.x),
                    (a.m_sweep.c.y += u * w.y),
                    (a.m_sweep.a += d * (c * w.y - _ * w.x + w.z)),
                    r.SynchronizeTransform(),
                    a.SynchronizeTransform(),
                    t.b2_linearSlop >= b && t.b2_angularSlop >= v);
            }),
            $i_22.inherit(I, $i_22.Dynamics.Joints.b2JointDef),
            (I.prototype.__super = $i_22.Dynamics.Joints.b2JointDef.prototype),
            (I.b2WeldJointDef = function () {
                $i_22.Dynamics.Joints.b2JointDef.b2JointDef.apply(this, arguments),
                    (this.localAnchorA = new s()),
                    (this.localAnchorB = new s());
            }),
            (I.prototype.b2WeldJointDef = function () {
                this.__super.b2JointDef.call(this), (this.type = u.e_weldJoint), (this.referenceAngle = 0);
            }),
            (I.prototype.Initialize = function (t, i, e) {
                (this.bodyA = t),
                    (this.bodyB = i),
                    this.localAnchorA.SetV(this.bodyA.GetLocalPoint(e)),
                    this.localAnchorB.SetV(this.bodyB.GetLocalPoint(e)),
                    (this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle());
            });
    })(),
    (function () {
        var t = $i_22.Dynamics.b2DebugDraw;
        (t.b2DebugDraw = function () {
            (this.m_drawScale = 1),
                (this.m_lineThickness = 1),
                (this.m_alpha = 1),
                (this.m_fillAlpha = 1),
                (this.m_xformScale = 1);
            var t = this;
            this.m_sprite = {
                graphics: {
                    clear: function () { },
                    setTranslation: function (i, e) {
                        t.m_ctx.translate(i, e);
                    }
                }
            };
        }),
            (t.prototype._color = function (t, i) {
                return "rgba(" + ((t & 16711680) >> 16) + "," + ((t & 65280) >> 8) + "," + (t & 255) + "," + i + ")";
            }),
            (t.prototype.b2DebugDraw = function () {
                this.m_drawFlags = 0;
            }),
            (t.prototype.SetFlags = function (t) {
                t === void 0 && (t = 0), (this.m_drawFlags = t);
            }),
            (t.prototype.GetFlags = function () {
                return this.m_drawFlags;
            }),
            (t.prototype.AppendFlags = function (t) {
                t === void 0 && (t = 0), (this.m_drawFlags |= t);
            }),
            (t.prototype.ClearFlags = function (t) {
                t === void 0 && (t = 0), (this.m_drawFlags &= ~t);
            }),
            (t.prototype.SetSprite = function (t) {
                this.m_ctx = t;
            }),
            (t.prototype.GetSprite = function () {
                return this.m_ctx;
            }),
            (t.prototype.SetDrawScale = function (t) {
                t === void 0 && (t = 0), (this.m_drawScale = t);
            }),
            (t.prototype.GetDrawScale = function () {
                return this.m_drawScale;
            }),
            (t.prototype.SetLineThickness = function (t) {
                t === void 0 && (t = 0), (this.m_lineThickness = t), (this.m_ctx.strokeWidth = t);
            }),
            (t.prototype.GetLineThickness = function () {
                return this.m_lineThickness;
            }),
            (t.prototype.SetAlpha = function (t) {
                t === void 0 && (t = 0), (this.m_alpha = t);
            }),
            (t.prototype.GetAlpha = function () {
                return this.m_alpha;
            }),
            (t.prototype.SetFillAlpha = function (t) {
                t === void 0 && (t = 0), (this.m_fillAlpha = t);
            }),
            (t.prototype.GetFillAlpha = function () {
                return this.m_fillAlpha;
            }),
            (t.prototype.SetXFormScale = function (t) {
                t === void 0 && (t = 0), (this.m_xformScale = t);
            }),
            (t.prototype.GetXFormScale = function () {
                return this.m_xformScale;
            }),
            (t.prototype.DrawPolygon = function (t, i, e) {
                if (i) {
                    var o = this.m_ctx, s = this.m_drawScale;
                    o.beginPath(),
                        (o.strokeStyle = this._color(e.color, this.m_alpha)),
                        o.moveTo(t[0].x * s, t[0].y * s);
                    for (var n = 1; i > n; n++)
                        o.lineTo(t[n].x * s, t[n].y * s);
                    o.lineTo(t[0].x * s, t[0].y * s), o.closePath(), o.stroke();
                }
            }),
            (t.prototype.DrawSolidPolygon = function (t, i, e) {
                if (i) {
                    var o = this.m_ctx, s = this.m_drawScale;
                    o.beginPath(),
                        (o.strokeStyle = this._color(e.color, this.m_alpha)),
                        (o.fillStyle = this._color(e.color, this.m_fillAlpha)),
                        o.moveTo(t[0].x * s, t[0].y * s);
                    for (var n = 1; i > n; n++)
                        o.lineTo(t[n].x * s, t[n].y * s);
                    o.lineTo(t[0].x * s, t[0].y * s), o.closePath(), o.fill(), o.stroke();
                }
            }),
            (t.prototype.DrawCircle = function (t, i, e) {
                if (i) {
                    var o = this.m_ctx, s = this.m_drawScale;
                    o.beginPath(),
                        (o.strokeStyle = this._color(e.color, this.m_alpha)),
                        o.arc(t.x * s, t.y * s, i * s, 0, Math.PI * 2, !0),
                        o.closePath(),
                        o.stroke();
                }
            }),
            (t.prototype.DrawSolidCircle = function (t, i, e, o) {
                if (i) {
                    var s = this.m_ctx, n = this.m_drawScale, r = t.x * n, a = t.y * n;
                    s.moveTo(0, 0),
                        s.beginPath(),
                        (s.strokeStyle = this._color(o.color, this.m_alpha)),
                        (s.fillStyle = this._color(o.color, this.m_fillAlpha)),
                        s.arc(r, a, i * n, 0, Math.PI * 2, !0),
                        s.moveTo(r, a),
                        s.lineTo((t.x + e.x * i) * n, (t.y + e.y * i) * n),
                        s.closePath(),
                        s.fill(),
                        s.stroke();
                }
            }),
            (t.prototype.DrawSegment = function (t, i, e) {
                var o = this.m_ctx, s = this.m_drawScale;
                (o.strokeStyle = this._color(e.color, this.m_alpha)),
                    o.beginPath(),
                    o.moveTo(t.x * s, t.y * s),
                    o.lineTo(i.x * s, i.y * s),
                    o.closePath(),
                    o.stroke();
            }),
            (t.prototype.DrawTransform = function (t) {
                var i = this.m_ctx, e = this.m_drawScale;
                i.beginPath(),
                    (i.strokeStyle = this._color(16711680, this.m_alpha)),
                    i.moveTo(t.position.x * e, t.position.y * e),
                    i.lineTo((t.position.x + this.m_xformScale * t.R.col1.x) * e, (t.position.y + this.m_xformScale * t.R.col1.y) * e),
                    (i.strokeStyle = this._color(65280, this.m_alpha)),
                    i.moveTo(t.position.x * e, t.position.y * e),
                    i.lineTo((t.position.x + this.m_xformScale * t.R.col2.x) * e, (t.position.y + this.m_xformScale * t.R.col2.y) * e),
                    i.closePath(),
                    i.stroke();
            });
    })();
var i;
for (i = 0; $i_22.postDefs.length > i; ++i)
    $i_22.postDefs[i]();
delete $i_22.postDefs, typeof window == "undefined" && (exports.$i_22 = $i_22);
var $i_42 = $i_3.extend({
    classId: "$i_42",
    componentId: "cocoonJs",
    init: function () {
        (this.detected = typeof ext != "undefined" && ext.IDTK_APP !== void 0),
            this.detected && this.log("CocoonJS support enabled!");
    },
    showInputDialog: function (t, i, e, o, s, n) {
        this.detected
            ? ((t = t || ""),
                (i = i || ""),
                (e = e || ""),
                (o = o || "text"),
                (s = s || "Cancel"),
                (n = n || "OK"),
                ext.IDTK_APP.makeCall("showTextDialog", t, i, e, o, s, n))
            : this.log("Cannot open CocoonJS input dialog! CocoonJS is not detected!", "error");
    },
    showWebView: function (t) {
        this.detected &&
            (ext.IDTK_APP.makeCall("forward", "ext.IDTK_APP.makeCall('loadPath', '" + t + "')"),
                ext.IDTK_APP.makeCall("forward", "ext.IDTK_APP.makeCall('show');"));
    },
    hideWebView: function () {
        this.detected && ext.IDTK_APP.makeCall("forward", "ext.IDTK_APP.makeCall('hide');");
    }
}), $i_43 = {
    left: function (t, i) {
        if (t !== void 0) {
            if (t === null)
                delete this._uiLeft, delete this._uiLeftPercent;
            else if ((delete this._uiCenter, delete this._uiCenterPercent, typeof t == "string")) {
                this._uiLeftPercent = t;
                var e, o, s = parseInt(t, 10);
                (e = this._parent ? this._parent._bounds2d.x : ige._bounds2d.x),
                    (o = ((e / 100) * s) | 0),
                    (this._uiLeft = o);
            }
            else
                (this._uiLeft = t), delete this._uiLeftPercent;
            return i || this._updateUiPosition(), this;
        }
        return this._uiLeft;
    },
    right: function (t, i) {
        if (t !== void 0) {
            if (t === null)
                delete this._uiRight, delete this._uiRightPercent;
            else if ((delete this._uiCenter, delete this._uiCenterPercent, typeof t == "string")) {
                this._uiRightPercent = t;
                var e, o, s = parseInt(t, 10);
                (e = this._parent ? this._parent._bounds2d.x : ige._bounds2d.x),
                    (o = ((e / 100) * s) | 0),
                    (this._uiRight = o);
            }
            else
                (this._uiRight = t), delete this._uiRightPercent;
            return i || this._updateUiPosition(), this;
        }
        return this._uiRight;
    },
    center: function (t, i) {
        if (t !== void 0) {
            if (t === null)
                delete this._uiCenter, delete this._uiCenterPercent;
            else if ((delete this._uiLeft,
                delete this._uiLeftPercent,
                delete this._uiRight,
                delete this._uiRightPercent,
                typeof t == "string")) {
                this._uiCenterPercent = t;
                var e, o, s = parseInt(t, 10);
                (e = this._parent ? this._parent._bounds2d.x2 : ige._bounds2d.x2),
                    (o = ((e / 100) * s) | 0),
                    (this._uiCenter = o);
            }
            else
                (this._uiCenter = t), delete this._uiCenterPercent;
            return i || this._updateUiPosition(), this;
        }
        return this._uiCenter;
    },
    top: function (t, i) {
        if (t !== void 0) {
            if (t === null)
                delete this._uiTop, delete this._uiTopPercent;
            else if ((delete this._uiMiddle, delete this._uiMiddlePercent, typeof t == "string")) {
                this._uiTopPercent = t;
                var e, o, s = parseInt(t, 10);
                (e = this._parent ? this._parent._bounds2d.y : ige._bounds2d.y),
                    (o = ((e / 100) * s) | 0),
                    (this._uiTop = o);
            }
            else
                (this._uiTop = t), delete this._uiTopPercent;
            return i || this._updateUiPosition(), this;
        }
        return this._uiTop;
    },
    bottom: function (t, i) {
        if (t !== void 0) {
            if (t === null)
                delete this._uiBottom, delete this._uiBottomPercent;
            else if ((delete this._uiMiddle, delete this._uiMiddlePercent, typeof t == "string")) {
                this._uiBottomPercent = t;
                var e, o, s = parseInt(t, 10);
                (e = this._parent ? this._parent._bounds2d.y : ige._bounds2d.y),
                    (o = ((e / 100) * s) | 0),
                    (this._uiBottom = o);
            }
            else
                (this._uiBottom = t), delete this._uiBottomPercent;
            return i || this._updateUiPosition(), this;
        }
        return this._uiBottom;
    },
    middle: function (t, i) {
        if (t !== void 0) {
            if (t === null)
                delete this._uiMiddle, delete this._uiMiddlePercent;
            else if ((delete this._uiTop,
                delete this._uiTopPercent,
                delete this._uiBottom,
                delete this._uiBottomPercent,
                typeof t == "string")) {
                this._uiMiddlePercent = t;
                var e, o, s = parseInt(t, 10);
                (e = this._parent ? this._parent._bounds2d.y2 : ige._bounds2d.y2),
                    (o = ((e / 100) * s) | 0),
                    (this._uiMiddle = o);
            }
            else
                (this._uiMiddle = t), delete this._uiMiddlePercent;
            return i || this._updateUiPosition(), this;
        }
        return this._uiMiddle;
    },
    width: function (t, i, e, o) {
        if (t !== void 0) {
            if (t === null)
                delete this._uiWidth, (this._bounds2d.x = 0), (this._bounds2d.x2 = 0);
            else if (((this._uiWidth = t), (this._widthModifier = e !== void 0 ? e : 0), typeof t == "string"))
                if (this._parent) {
                    var s, n, r = this._parent._bounds2d.x, a = parseInt(t, 10);
                    (s = ((r / 100) * a + this._widthModifier) | 0),
                        i && ((n = s / this._bounds2d.x), this.height(this._bounds2d.y / n, !1, 0, o)),
                        (this._bounds2d.x = s),
                        (this._bounds2d.x2 = Math.floor(this._bounds2d.x / 2));
                }
                else {
                    var r = ige._bounds2d.x, a = parseInt(t, 10);
                    (this._bounds2d.x = ((r / 100) * a + this._widthModifier) | 0),
                        (this._bounds2d.x2 = Math.floor(this._bounds2d.x / 2));
                }
            else {
                if (i) {
                    var n = t / this._bounds2d.x;
                    this.height(this._bounds2d.y * n, !1, 0, o);
                }
                (this._bounds2d.x = t), (this._bounds2d.x2 = Math.floor(this._bounds2d.x / 2));
            }
            return o || this._updateUiPosition(), this;
        }
        return this._bounds2d.x;
    },
    height: function (t, i, e, o) {
        if (t !== void 0) {
            if (t === null)
                delete this._uiHeight, (this._bounds2d.y = 0), (this._bounds2d.y2 = 0);
            else if (((this._uiHeight = t), (this._heightModifier = e !== void 0 ? e : 0), typeof t == "string"))
                if (this._parent) {
                    var s, n, r = this._parent._bounds2d.y, a = parseInt(t, 10);
                    (s = ((r / 100) * a + this._heightModifier) | 0),
                        i && ((n = s / this._bounds2d.y), this.width(this._bounds2d.x / n, !1, 0, o)),
                        (this._bounds2d.y = s),
                        (this._bounds2d.y2 = Math.floor(this._bounds2d.y / 2));
                }
                else {
                    var r = ige._bounds2d.y, a = parseInt(t, 10);
                    (this._bounds2d.y = ((r / 100) * a + this._heightModifier) | 0),
                        (this._bounds2d.y2 = Math.floor(this._bounds2d.y / 2));
                }
            else {
                if (i) {
                    var n = t / this._bounds2d.y;
                    this.width(this._bounds2d.x * n, !1, 0, o);
                }
                (this._bounds2d.y = t), (this._bounds2d.y2 = Math.floor(this._bounds2d.y / 2));
            }
            return o || this._updateUiPosition(), this;
        }
        return this._bounds2d.y;
    },
    autoScaleX: function (t, i) {
        return t !== void 0
            ? ((this._autoScaleX = t), (this._autoScaleLockAspect = i), this._updateUiPosition(), this)
            : this._autoScaleX;
    },
    autoScaleY: function (t, i) {
        return t !== void 0
            ? ((this._autoScaleY = t), (this._autoScaleLockAspect = i), this._updateUiPosition(), this)
            : this._autoScaleY;
    },
    updateUiChildren: function () {
        var t, i, e = this._children;
        if (e) {
            t = e.length;
            while (t--)
                (i = e[t]),
                    i._updateUiPosition && i._updateUiPosition(),
                    typeof i.updateUiChildren == "function" && i.updateUiChildren();
        }
        return this;
    },
    _updateUiPosition: function () {
        if (this._parent) {
            var t, i, e, o = this._parent._bounds2d, s = this._bounds2d.multiplyPoint(this._scale);
            this._autoScaleX &&
                ((t = parseInt(this._autoScaleX, 10)),
                    (i = (o.x / 100) * t),
                    (e = i / this._bounds2d.x),
                    (this._scale.x = e),
                    this._autoScaleLockAspect && (this._scale.y = e)),
                this._autoScaleY &&
                    ((t = parseInt(this._autoScaleY, 10)),
                        (i = (o.y / 100) * t),
                        (e = i / this._bounds2d.y),
                        (this._scale.y = e),
                        this._autoScaleLockAspect && (this._scale.x = e)),
                this._uiWidth && this.width(this._uiWidth, !1, this._widthModifier, !0),
                this._uiHeight && this.height(this._uiHeight, !1, this._heightModifier, !0),
                this._uiCenterPercent && this.center(this._uiCenterPercent, !0),
                this._uiMiddlePercent && this.middle(this._uiMiddlePercent, !0),
                this._uiLeftPercent && this.left(this._uiLeftPercent, !0),
                this._uiRightPercent && this.right(this._uiRightPercent, !0),
                this._uiTopPercent && this.top(this._uiTopPercent, !0),
                this._uiBottomPercent && this.bottom(this._uiBottomPercent, !0),
                this._uiCenter !== void 0
                    ? (this._translate.x = Math.floor(this._uiCenter))
                    : this._uiLeft !== void 0 && this._uiRight !== void 0
                        ? (this.width(o.x - this._uiLeft - this._uiRight, !1, 0, !0),
                            (this._translate.x = Math.floor(this._uiLeft + s.x2 - o.x2)))
                        : (this._uiLeft !== void 0 && (this._translate.x = Math.floor(this._uiLeft + s.x2 - o.x2)),
                            this._uiRight !== void 0 && (this._translate.x = Math.floor(o.x2 - s.x2 - this._uiRight))),
                this._uiMiddle !== void 0
                    ? (this._translate.y = Math.floor(this._uiMiddle))
                    : this._uiTop !== void 0 && this._uiBottom !== void 0
                        ? (this.height(o.y - this._uiTop - this._uiBottom, !1, 0, !0),
                            (this._translate.y = Math.floor(this._uiTop + s.y2 - o.y2)))
                        : (this._uiTop !== void 0 && (this._translate.y = Math.floor(this._uiTop + s.y2 - o.y2)),
                            this._uiBottom !== void 0 && (this._translate.y = Math.floor(o.y2 - s.y2 - this._uiBottom))),
                this.emit("uiUpdate"),
                this.cacheDirty(!0);
        }
    }
};
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_43);
var $i_44 = {
    color: function (t) {
        return t !== void 0 ? ((this._color = t), this.cacheDirty(!0), this) : this._color;
    },
    backgroundImage: function (t, i) {
        if (t && t.image) {
            if ((i || (i = "no-repeat"),
                (this._patternRepeat = i),
                (this._patternTexture = t),
                this._backgroundSize
                    ? (t.resize(this._backgroundSize.x, this._backgroundSize.y),
                        (this._patternWidth = this._backgroundSize.x),
                        (this._patternHeight = this._backgroundSize.y))
                    : ((this._patternWidth = t.image.width), (this._patternHeight = t.image.height)),
                this._cell > 1)) {
                var e = document.createElement("canvas"), o = e.getContext("2d"), s = t._cells[this._cell];
                (e.width = s[2]),
                    (e.height = s[3]),
                    o.drawImage(t.image, s[0], s[1], s[2], s[3], 0, 0, s[2], s[3]),
                    (this._patternFill = ige._ctx.createPattern(e, i));
            }
            else
                this._patternFill = ige._ctx.createPattern(t.image, i);
            return t.restoreOriginal(), this.cacheDirty(!0), this;
        }
        return this._patternFill;
    },
    backgroundSize: function (t, i) {
        return t !== void 0 && i !== void 0
            ? (typeof t == "string" && (t = (this._bounds2d.x / 100) * parseInt(t, 10)),
                typeof i == "string" && (i = (this._bounds2d.y / 100) * parseInt(i, 10)),
                t !== 0 && i !== 0
                    ? ((this._backgroundSize = { x: t, y: i }),
                        this._patternTexture &&
                            this._patternRepeat &&
                            this.backgroundImage(this._patternTexture, this._patternRepeat),
                        this.cacheDirty(!0))
                    : this.log("Cannot set background to zero-sized x or y!", "error"),
                this)
            : this._backgroundSize;
    },
    backgroundColor: function (t) {
        return t !== void 0 ? ((this._backgroundColor = t), this.cacheDirty(!0), this) : this._backgroundColor;
    },
    backgroundPosition: function (t, i) {
        return t !== void 0 && i !== void 0
            ? ((this._backgroundPosition = { x: t, y: i }), this.cacheDirty(!0), this)
            : this._backgroundPosition;
    },
    borderColor: function (t) {
        return t !== void 0
            ? ((this._borderColor = t),
                (this._borderLeftColor = t),
                (this._borderTopColor = t),
                (this._borderRightColor = t),
                (this._borderBottomColor = t),
                this.cacheDirty(!0),
                this)
            : this._borderColor;
    },
    borderLeftColor: function (t) {
        return t !== void 0 ? ((this._borderLeftColor = t), this.cacheDirty(!0), this) : this._borderLeftColor;
    },
    borderTopColor: function (t) {
        return t !== void 0 ? ((this._borderTopColor = t), this.cacheDirty(!0), this) : this._borderTopColor;
    },
    borderRightColor: function (t) {
        return t !== void 0 ? ((this._borderRightColor = t), this.cacheDirty(!0), this) : this._borderRightColor;
    },
    borderBottomColor: function (t) {
        return t !== void 0 ? ((this._borderBottomColor = t), this.cacheDirty(!0), this) : this._borderBottomColor;
    },
    borderWidth: function (t) {
        return t !== void 0
            ? ((this._borderWidth = t),
                (this._borderLeftWidth = t),
                (this._borderTopWidth = t),
                (this._borderRightWidth = t),
                (this._borderBottomWidth = t),
                this.cacheDirty(!0),
                this)
            : this._borderWidth;
    },
    borderLeftWidth: function (t) {
        return t !== void 0 ? ((this._borderLeftWidth = t), this.cacheDirty(!0), this) : this._borderLeftWidth;
    },
    borderTopWidth: function (t) {
        return t !== void 0 ? ((this._borderTopWidth = t), this.cacheDirty(!0), this) : this._borderTopWidth;
    },
    borderRightWidth: function (t) {
        return t !== void 0 ? ((this._borderRightWidth = t), this.cacheDirty(!0), this) : this._borderRightWidth;
    },
    borderBottomWidth: function (t) {
        return t !== void 0 ? ((this._borderBottomWidth = t), this.cacheDirty(!0), this) : this._borderBottomWidth;
    },
    borderRadius: function (t) {
        return t !== void 0
            ? ((this._borderRadius = t),
                (this._borderTopLeftRadius = t),
                (this._borderTopRightRadius = t),
                (this._borderBottomRightRadius = t),
                (this._borderBottomLeftRadius = t),
                this.cacheDirty(!0),
                this)
            : this._borderRadius;
    },
    padding: function (t, i, e, o) {
        return ((this._paddingLeft = t),
            (this._paddingTop = i),
            (this._paddingRight = e),
            (this._paddingBottom = o),
            this.cacheDirty(!0),
            this);
    },
    paddingLeft: function (t) {
        return t !== void 0 ? ((this._paddingLeft = t), this.cacheDirty(!0), this) : this._paddingLeft;
    },
    paddingTop: function (t) {
        return t !== void 0 ? ((this._paddingTop = t), this.cacheDirty(!0), this) : this._paddingTop;
    },
    paddingRight: function (t) {
        return t !== void 0 ? ((this._paddingRight = t), this.cacheDirty(!0), this) : this._paddingRight;
    },
    paddingBottom: function (t) {
        return t !== void 0 ? ((this._paddingBottom = t), this.cacheDirty(!0), this) : this._paddingBottom;
    }
};
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_44);
var nullMethod = function () { }, $i_48 = function () {
    (this.dummy = !0), (this.width = 0), (this.height = 0);
};
($i_48.prototype.getContext = function () {
    return $i_49;
}),
    typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_48);
var nullMethod = function () { }, $i_49 = {
    dummy: !0,
    save: nullMethod,
    restore: nullMethod,
    translate: nullMethod,
    rotate: nullMethod,
    scale: nullMethod,
    drawImage: nullMethod,
    fillRect: nullMethod,
    strokeRect: nullMethod,
    stroke: nullMethod,
    fill: nullMethod,
    rect: nullMethod,
    moveTo: nullMethod,
    lineTo: nullMethod,
    arc: nullMethod,
    clearRect: nullMethod,
    beginPath: nullMethod,
    clip: nullMethod,
    transform: nullMethod,
    setTransform: nullMethod,
    fillText: nullMethod
};
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_49);
var $i_52 = $i_2.extend({
    classId: "$i_52",
    init: function (t, i, e, o) {
        (this._targetObj = t),
            (this._steps = []),
            (this._currentStep = -1),
            i !== void 0 && this.stepTo(i),
            (this._durationMs = e !== void 0 ? e : 0),
            (this._started = !1),
            (this._stepDirection = !1),
            o && o.easing ? this.easing(o.easing) : this.easing("none"),
            o && o.startTime !== void 0 && this.startTime(o.startTime),
            o && o.beforeTween !== void 0 && this.beforeTween(o.beforeTween),
            o && o.afterTween !== void 0 && this.afterTween(o.afterTween);
    },
    targetObj: function (t) {
        return t !== void 0 && (this._targetObj = t), this;
    },
    properties: function (t) {
        return t !== void 0 && ((this._steps = []), (this._currentStep = -1), this.stepTo(t)), this;
    },
    repeatMode: function (t, i) {
        return t !== void 0 ? ((this._repeatMode = t), this.repeatCount(i), this) : this._repeatMode;
    },
    repeatCount: function (t) {
        return t !== void 0 ? ((this._repeatCount = t), (this._repeatedCount = 0), this) : this._repeatCount;
    },
    step: function (t, i, e) {
        return (this.log("The step method has been renamed to stepTo(). Please update your code as the step() method will soon be removed.", "warning"),
            this.stepTo(t, i, e),
            this);
    },
    stepTo: function (t, i, e, o) {
        return t !== void 0 && this._steps.push({ props: t, durationMs: i, easing: e, isDelta: o }), this;
    },
    stepBy: function (t, i, e) {
        return this.stepTo(t, i, e, !0), this;
    },
    duration: function (t) {
        return t !== void 0 && (this._durationMs = t), this;
    },
    beforeTween: function (t) {
        return t !== void 0 && (this._beforeTween = t), this;
    },
    afterTween: function (t) {
        return t !== void 0 && (this._afterTween = t), this;
    },
    beforeStep: function (t) {
        return t !== void 0 && (this._beforeStep = t), this;
    },
    afterStep: function (t) {
        return t !== void 0 && (this._afterStep = t), this;
    },
    afterChange: function (t) {
        return t !== void 0 && (this._afterChange = t), this;
    },
    targetObject: function () {
        return this._targetObj;
    },
    easing: function (t) {
        return (t !== void 0 &&
            (ige.tween.easing[t]
                ? (this._easing = t)
                : this.log("The easing method you have selected does not exist, please use a valid easing method. For a list of easing methods please inspect ige.tween.easing from your console.", "error", ige.tween.easing)),
            this);
    },
    startTime: function (t) {
        return t !== void 0 && (this._startTime = t), this;
    },
    start: function (t) {
        return (t !== void 0 && this.startTime(t + ige._currentTime),
            ige.tween.start(this),
            (this._targetObj._tweenArr = this._targetObj._tweenArr || []),
            this._targetObj._tweenArr.push(this),
            this);
    },
    stop: function () {
        return ige.tween.stop(this), this._targetObj._tweenArr && this._targetObj._tweenArr.pull(this), this;
    },
    startAll: function () {
        return (this._targetObj._tweenArr &&
            this._targetObj._tweenArr.eachReverse(function (t) {
                t.start();
            }),
            this);
    },
    stopAll: function () {
        return (this._targetObj._tweenArr &&
            this._targetObj._tweenArr.eachReverse(function (t) {
                t.stop();
            }),
            this);
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_52);
var $i_53 = $i_3.extend({
    classId: "$i_53",
    $i_53: !0,
    init: function (t) {
        (this._loaded = !1),
            (this._cells = []),
            (this._smoothing = ige._globalSmoothing),
            (this._applyFilters = []),
            (this._applyFiltersData = []),
            (this._preFilters = []),
            (this._preFiltersData = []);
        var i = typeof t;
        i === "string" && t && this.url(t), i === "object" && this.assignSmartTextureImage(t);
    },
    id: function (t) {
        if (t !== void 0) {
            if (!ige._register[t])
                return (this._id && ige._register[this._id] && ige.unRegister(this),
                    (this._id = t),
                    ige.register(this),
                    this);
            if (ige._register[t] === this)
                return this;
            this.log('Cannot set ID of object to "' + t + '" because that ID is already in use by another object!', "error");
        }
        return (this._id || ((this._id = this._url ? ige.newIdFromString(this._url) : ige.newIdHex()), ige.register(this)),
            this._id);
    },
    url: function (t) {
        return t !== void 0
            ? ((this._url = t), t.substr(t.length - 2, 2) === "js" ? this._loadScript(t) : this._loadImage(t), this)
            : this._url;
    },
    _loadImage: function (t) {
        var i, e = this;
        isClient &&
            (ige.textureLoadStart(t, this),
                ige._textureImageStore[t]
                    ? ((i = this.image = this._originalImage = ige._textureImageStore[t]),
                        i._igeTextures.push(this),
                        i._loaded &&
                            ((e._renderMode = 0),
                                e.sizeX(i.width),
                                e.sizeY(i.height),
                                i.width % 2 &&
                                    this.log("This texture's width is not divisible by 2 which will cause the texture to use sub-pixel rendering resulting in a blurred image. This may also slow down the renderer on some browsers. Image file: " +
                                        this._url, "warning"),
                                i.height % 2 &&
                                    this.log("This texture's height is not divisible by 2 which will cause the texture to use sub-pixel rendering resulting in a blurred image. This may also slow down the renderer on some browsers. Image file: " +
                                        this._url, "warning"),
                                (e._cells[1] = [0, 0, e._sizeX, e._sizeY]),
                                e._textureLoaded()))
                    : ((i = ige._textureImageStore[t] = this.image = this._originalImage = new Image()),
                        (i._igeTextures = i._igeTextures || []),
                        i._igeTextures.push(this),
                        (i.onload = function () {
                            (i._loaded = !0), ige.log("Texture image (" + t + ") loaded successfully");
                            var e, o, s = i._igeTextures, n = s.length;
                            for (e = 0; n > e; e++)
                                (o = s[e]),
                                    (o._mode = 0),
                                    o.sizeX(i.width),
                                    o.sizeY(i.height),
                                    (o._cells[1] = [0, 0, o._sizeX, o._sizeY]),
                                    o._textureLoaded();
                        }),
                        (i.src = t)));
    },
    _textureLoaded: function () {
        var t = this;
        setTimeout(function () {
            (t._loaded = !0), t.emit("loaded"), ige.textureLoadEnd(t.image.src, t);
        }, 5);
    },
    _loadScript: function (scriptUrl) {
        var textures = ige.textures, rs_sandboxContext, self = this, scriptElem;
        ige.textureLoadStart(scriptUrl, this),
            isClient &&
                ((scriptElem = document.createElement("script")),
                    (scriptElem.onload = function (data) {
                        self.log('Texture script "' + scriptUrl + '" loaded successfully'),
                            eval(data),
                            (self._renderMode = 1),
                            (self.script = image),
                            typeof image.init == "function" && image.init.apply(image, [self]),
                            (self._loaded = !0),
                            self.emit("loaded"),
                            ige.textureLoadEnd(scriptUrl, self);
                    }),
                    scriptElem.addEventListener("error", function () {
                        self.log("Error loading smart texture script file: " + scriptUrl, "error");
                    }, !0),
                    (scriptElem.src = scriptUrl),
                    document.getElementsByTagName("head")[0].appendChild(scriptElem));
    },
    assignSmartTextureImage: function (t) {
        var i = (ige.textures, this);
        typeof t.render == "function"
            ? ((i._mode = 1),
                (i.script = t),
                typeof t.init == "function" && t.init.apply(t, [i]),
                (i._loaded = !0),
                i.emit("loaded"))
            : this.log("Cannot assign smart texture because it doesn't have a render() method!", "error");
    },
    _setImage: function (t) {
        var i;
        isClient &&
            ((i = this.image = this._originalImage = t),
                (i._igeTextures = i._igeTextures || []),
                (i._loaded = !0),
                (this._renderMode = 0),
                this.sizeX(i.width),
                this.sizeY(i.height),
                (this._cells[1] = [0, 0, this._sizeX, this._sizeY]));
    },
    textureFromCell: function (t) {
        var i = new $i_53(), e = this;
        return (this._loaded
            ? this._textureFromCell(i, t)
            : this.on("loaded", function () {
                e._textureFromCell(i, t);
            }),
            i);
    },
    _textureFromCell: function (t, i) {
        var e, o, s, n;
        (e = typeof i == "string" ? this.cellIdToIndex(i) : i),
            this._cells[e]
                ? ((o = this._cells[e]),
                    (s = document.createElement("canvas")),
                    (n = s.getContext("2d")),
                    this._smoothing
                        ? ((n.imageSmoothingEnabled = !0),
                            (n.webkitImageSmoothingEnabled = !0),
                            (n.mozImageSmoothingEnabled = !0))
                        : ((n.imageSmoothingEnabled = !1),
                            (n.webkitImageSmoothingEnabled = !1),
                            (n.mozImageSmoothingEnabled = !1)),
                    (s.width = o[2]),
                    (s.height = o[3]),
                    n.drawImage(this._originalImage, o[0], o[1], o[2], o[3], 0, 0, o[2], o[3]),
                    t._setImage(s),
                    (t._loaded = !0),
                    setTimeout(function () {
                        t.emit("loaded");
                    }, 1))
                : this.log("Unable to create new texture from passed cell index (" +
                    i +
                    ") because the cell does not exist!", "warning");
    },
    sizeX: function (t) {
        this._sizeX = t;
    },
    sizeY: function (t) {
        this._sizeY = t;
    },
    resize: function (t, i, e) {
        this._originalImage &&
            (this._loaded
                ? (this._textureCtx || (this._textureCanvas = document.createElement("canvas")),
                    (this._textureCanvas.width = t),
                    (this._textureCanvas.height = i),
                    (this._textureCtx = this._textureCanvas.getContext("2d")),
                    this._smoothing
                        ? ((this._textureCtx.imageSmoothingEnabled = !0),
                            (this._textureCtx.webkitImageSmoothingEnabled = !0),
                            (this._textureCtx.mozImageSmoothingEnabled = !0))
                        : ((this._textureCtx.imageSmoothingEnabled = !1),
                            (this._textureCtx.webkitImageSmoothingEnabled = !1),
                            (this._textureCtx.mozImageSmoothingEnabled = !1)),
                    e ||
                        this._textureCtx.drawImage(this._originalImage, 0, 0, this._originalImage.width, this._originalImage.height, 0, 0, t, i),
                    (this.image = this._textureCanvas))
                : this.log("Cannot resize texture because the texture image (" +
                    this._url +
                    ") has not loaded into memory yet!", "error"));
    },
    resizeByPercent: function (t, i, e) {
        this._originalImage &&
            (this._loaded
                ? ((t = Math.floor((this.image.width / 100) * t)),
                    (i = Math.floor((this.image.height / 100) * i)),
                    this._textureCtx || (this._textureCanvas = document.createElement("canvas")),
                    (this._textureCanvas.width = t),
                    (this._textureCanvas.height = i),
                    (this._textureCtx = this._textureCanvas.getContext("2d")),
                    this._smoothing
                        ? ((this._textureCtx.imageSmoothingEnabled = !0),
                            (this._textureCtx.webkitImageSmoothingEnabled = !0),
                            (this._textureCtx.mozImageSmoothingEnabled = !0))
                        : ((this._textureCtx.imageSmoothingEnabled = !1),
                            (this._textureCtx.webkitImageSmoothingEnabled = !1),
                            (this._textureCtx.mozImageSmoothingEnabled = !1)),
                    e ||
                        this._textureCtx.drawImage(this._originalImage, 0, 0, this._originalImage.width, this._originalImage.height, 0, 0, t, i),
                    (this.image = this._textureCanvas))
                : this.log("Cannot resize texture because the texture image (" +
                    this._url +
                    ") has not loaded into memory yet!", "error"));
    },
    restoreOriginal: function () {
        (this.image = this._originalImage), delete this._textureCtx, delete this._textureCanvas, this.removeFilters();
    },
    smoothing: function (t) {
        return t !== void 0 ? ((this._smoothing = t), this) : this._smoothing;
    },
    render: function (t, i) {
        if (i._cell !== null) {
            if ((this._smoothing
                ? ((ige._ctx.imageSmoothingEnabled = !0),
                    (ige._ctx.webkitImageSmoothingEnabled = !0),
                    (ige._ctx.mozImageSmoothingEnabled = !0))
                : ((ige._ctx.imageSmoothingEnabled = !1),
                    (ige._ctx.webkitImageSmoothingEnabled = !1),
                    (ige._ctx.mozImageSmoothingEnabled = !1)),
                this._renderMode === 0)) {
                var e = this._cells[i._cell], o = i._bounds2d, s = i._renderPos;
                if (e) {
                    if (this._preFilters.length > 0 && this._textureCtx) {
                        this._textureCtx.clearRect(0, 0, this._textureCanvas.width, this._textureCanvas.height),
                            this._textureCtx.drawImage(this._originalImage, 0, 0);
                        var n = this;
                        this._applyFilters.forEach(function (t, i) {
                            n._textureCtx.save(),
                                t(n._textureCanvas, n._textureCtx, n._originalImage, n, n._applyFiltersData[i]),
                                n._textureCtx.restore();
                        }),
                            this._preFilters.forEach(function (t, i) {
                                n._textureCtx.save(),
                                    t(n._textureCanvas, n._textureCtx, n._originalImage, n, n._preFiltersData[i]),
                                    n._textureCtx.restore();
                            });
                    }
                    t.drawImage(this.image, e[0], e[1], e[2], e[3], s.x, s.y, o.x, o.y), ige._drawCount++;
                }
                else
                    this.log("Cannot render texture using cell " +
                        i._cell +
                        " because the cell does not exist in the assigned texture!", "error");
            }
            this._renderMode === 1 && (t.save(), this.script.render(t, i, this), t.restore(), ige._drawCount++);
        }
    },
    removeFilter: function (t) {
        var i;
        while ((i = this._preFilters.indexOf(t)) > -1)
            (this._preFilters[i] = void 0), (this._preFiltersData[i] = void 0);
        while ((i = this._applyFilters.indexOf(t)) > -1)
            (this._applyFilters[i] = void 0), (this._applyFiltersData[i] = void 0);
        (this._preFilters = this._preFilters.clean()),
            (this._preFiltersData = this._preFiltersData.clean()),
            (this._applyFilters = this._applyFilters.clean()),
            (this._applyFiltersData = this._applyFiltersData.clean()),
            this._rerenderFilters();
    },
    removeFilters: function () {
        (this._applyFilters = []),
            (this._applyFiltersData = []),
            (this._preFilters = []),
            (this._preFiltersData = []),
            this._rerenderFilters();
    },
    _rerenderFilters: function () {
        if (this._textureCanvas) {
            this.resize(this._textureCanvas.width, this._textureCanvas.height, !1);
            var t = this;
            this._applyFilters.forEach(function (i, e) {
                t._textureCtx.save(),
                    i(t._textureCanvas, t._textureCtx, t._originalImage, t, t._applyFiltersData[e]),
                    t._textureCtx.restore();
            });
        }
    },
    preFilter: function (t, i) {
        return t !== void 0
            ? (this._originalImage &&
                (this._textureCtx ||
                    ((this._textureCanvas = document.createElement("canvas")),
                        (this._textureCanvas.width = this._originalImage.width),
                        (this._textureCanvas.height = this._originalImage.height),
                        (this._textureCtx = this._textureCanvas.getContext("2d")),
                        this._smoothing
                            ? ((this._textureCtx.imageSmoothingEnabled = !0),
                                (this._textureCtx.webkitImageSmoothingEnabled = !0),
                                (this._textureCtx.mozImageSmoothingEnabled = !0))
                            : ((this._textureCtx.imageSmoothingEnabled = !1),
                                (this._textureCtx.webkitImageSmoothingEnabled = !1),
                                (this._textureCtx.mozImageSmoothingEnabled = !1))),
                    (this.image = this._textureCanvas),
                    (this._preFilters[this._preFilters.length] = t),
                    (this._preFiltersData[this._preFiltersData.length] = i ? i : {})),
                this)
            : (this.log("Cannot use pre-filter, no filter method was passed!", "warning"),
                this._preFilters[this._preFilters.length - 1]);
    },
    applyFilter: function (t, i) {
        return (this._loaded
            ? t !== void 0
                ? this._originalImage &&
                    (this._textureCtx ||
                        ((this._textureCanvas = document.createElement("canvas")),
                            (this._textureCanvas.width = this._originalImage.width),
                            (this._textureCanvas.height = this._originalImage.height),
                            (this._textureCtx = this._textureCanvas.getContext("2d")),
                            this._textureCtx.clearRect(0, 0, this._textureCanvas.width, this._textureCanvas.height),
                            this._textureCtx.drawImage(this._originalImage, 0, 0),
                            this._smoothing
                                ? ((this._textureCtx.imageSmoothingEnabled = !0),
                                    (this._textureCtx.webkitImageSmoothingEnabled = !0),
                                    (this._textureCtx.mozImageSmoothingEnabled = !0))
                                : ((this._textureCtx.imageSmoothingEnabled = !1),
                                    (this._textureCtx.webkitImageSmoothingEnabled = !1),
                                    (this._textureCtx.mozImageSmoothingEnabled = !1))),
                        (this.image = this._textureCanvas),
                        this._preFilters.length > 0 ||
                            (this._textureCtx.save(),
                                t(this._textureCanvas, this._textureCtx, this._originalImage, this, i),
                                this._textureCtx.restore()),
                        (this._applyFilters[this._applyFilters.length] = t),
                        (this._applyFiltersData[this._applyFiltersData.length] = i ? i : {}))
                : this.log("Cannot apply filter, no filter method was passed!", "warning")
            : this.log("Cannot apply filter, the texture you are trying to apply the filter to has not yet loaded!", "error"),
            this);
    },
    pixelData: function (t, i) {
        if (this._loaded) {
            if (this.image)
                return (this._textureCtx
                    ? (this._textureCtx = this._textureCtx)
                    : ((this._textureCanvas = document.createElement("canvas")),
                        (this._textureCanvas.width = this.image.width),
                        (this._textureCanvas.height = this.image.height),
                        (this._textureCtx = this._textureCanvas.getContext("2d")),
                        this._smoothing
                            ? ((this._textureCtx.imageSmoothingEnabled = !0),
                                (this._textureCtx.webkitImageSmoothingEnabled = !0),
                                (this._textureCtx.mozImageSmoothingEnabled = !0))
                            : ((this._textureCtx.imageSmoothingEnabled = !1),
                                (this._textureCtx.webkitImageSmoothingEnabled = !1),
                                (this._textureCtx.mozImageSmoothingEnabled = !1)),
                        this._textureCtx.drawImage(this.image, 0, 0)),
                    this._textureCtx.getImageData(t, i, 1, 1).data);
        }
        else
            this.log("Cannot read pixel data, the texture you are trying to read data from has not yet loaded!", "error");
        return this;
    },
    clone: function () {
        return this.textureFromCell(1);
    },
    stringify: function () {
        var t = "new " + this.classId() + "('" + this._url + "')";
        return (t += this._stringify());
    },
    _stringify: function () {
        return "";
    },
    destroy: function () {
        delete this._eventListeners,
            this.image && this.image._igeTextures && this.image._igeTextures.pull(this),
            ige._textureStore.pull(this),
            delete this.image,
            delete this.script,
            delete this._textureCanvas,
            delete this._textureCtx,
            (this._destroyed = !0);
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_53);
var $i_54 = $i_53.extend({
    classId: "$i_54",
    $i_55: !0,
    init: function (t, i, e) {
        var o = this;
        o.horizontalCells(i || 1), o.verticalCells(e || 1), $i_53.prototype.init.call(this, t);
    },
    _textureLoaded: function () {
        this.image
            ? ((this._sheetImage = this.image), this._applyCells())
            : this.log("Cannot create cell-sheet because texture has not loaded an image!", "error"),
            $i_53.prototype._textureLoaded.call(this);
    },
    cellCount: function () {
        return this.horizontalCells() * this.verticalCells();
    },
    horizontalCells: function (t) {
        return t !== void 0 ? ((this._cellColumns = t), this) : this._cellColumns;
    },
    verticalCells: function (t) {
        return t !== void 0 ? ((this._cellRows = t), this) : this._cellRows;
    },
    _applyCells: function () {
        var t, i, e, o, s, n, r, a, h;
        if (this.image && this._cellRows && this._cellColumns)
            if (((t = this._sizeX),
                (i = this._sizeY),
                (e = this._cellRows),
                (o = this._cellColumns),
                (s = this._cellWidth = t / o),
                (n = this._cellHeight = i / e),
                s !== parseInt(s, 10) &&
                    this.log("Cell width is a floating-point number! (Image Width " +
                        t +
                        " / Number of Columns " +
                        o +
                        " = " +
                        s +
                        ") in file: " +
                        this._url, "warning"),
                n !== parseInt(n, 10) &&
                    this.log("Cell height is a floating-point number! (Image Height " +
                        i +
                        " / Number of Rows " +
                        e +
                        " = " +
                        n +
                        ")  in file: " +
                        this._url, "warning"),
                e > 1 || o > 1))
                for (r = 1; e * o >= r; r++)
                    (h = Math.ceil(r / o) - 1), (a = r - o * h - 1), (this._cells[r] = [a * s, h * n, s, n]);
            else
                this._cells[1] = [0, 0, this._sizeX, this._sizeY];
    },
    stringify: function () {
        var t = "new " +
            this.classId() +
            "('" +
            this.url() +
            "', " +
            this.horizontalCells() +
            ", " +
            this.verticalCells() +
            ")";
        return t;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_53);
var $i_55 = $i_53.extend({
    classId: "$i_55",
    $i_55: !0,
    init: function (t, i) {
        (this._spriteCells = i), $i_53.prototype.init.call(this, t);
    },
    _textureLoaded: function () {
        if (this.image) {
            this._sheetImage = this.image;
            var t, i = this._spriteCells;
            for (i ||
                (this.log("No cell data provided for sprite sheet, attempting to automatically detect sprite bounds..."),
                    (i = this.detectCells(this._sheetImage))),
                t = 0; i.length > t; t++)
                (this._cells[t + 1] = i[t]),
                    this._checkModulus &&
                        (i[t][2] % 2 &&
                            this.log("This texture's cell definition defines a cell width is not divisible by 2 which can cause the texture to use sub-pixel rendering resulting in a blurred image. This may also slow down the renderer on some browsers. Image file: " +
                                this._url, "warning", i[t]),
                            i[t][3] % 2 &&
                                this.log("This texture's cell definition defines a cell height is not divisible by 2 which can cause the texture to use sub-pixel rendering resulting in a blurred image. This may also slow down the renderer on some browsers. Image file: " +
                                    this._url, "warning", i[t]));
        }
        else
            this.log("Cannot create cell-sheet because texture has not loaded an image!", "error");
        $i_53.prototype._textureLoaded.call(this);
    },
    detectCells: function (t) {
        var i, e, o, s, n = document.createElement("canvas"), r = n.getContext("2d"), a = [];
        for (n.width = t.width,
            n.height = t.height,
            r.drawImage(t, 0, 0),
            i = r.getImageData(0, 0, n.width, n.height),
            o = 0; n.height > o; o++)
            for (e = 0; n.width > e; e++)
                if (!i.isTransparent(e, o) && !this._pixelInRects(a, e, o)) {
                    if (((s = this._determineRect(i, e, o)), !s))
                        return this.log("Cannot automatically determine sprite bounds!", "warning"), [];
                    a.push(s);
                }
        return a;
    },
    _pixelInRects: function (t, i, e) {
        var o, s, n = t.length;
        for (o = 0; n > o; o++)
            if (((s = t[o]), !(s.x > i || i > s.x + s.width || s.y > e || e > s.y + s.height)))
                return !0;
        return !1;
    },
    _determineRect: function (t, i, e) {
        var o, s = [{ x: i, y: e }], n = { x: i, y: e, width: 1, height: 1 };
        while (s.length)
            (o = s.shift()),
                o.x > n.x + n.width && (n.width = o.x - n.x + 1),
                o.y > n.y + n.height && (n.height = o.y - n.y + 1),
                n.x > o.x && ((n.width += n.x - o.x), (n.x = o.x)),
                n.y > o.y && ((n.height += n.y - o.y), (n.y = o.y)),
                t.isTransparent(o.x - 1, o.y - 1) ||
                    (t.makeTransparent(o.x - 1, o.y - 1), s.push({ x: o.x - 1, y: o.y - 1 })),
                t.isTransparent(o.x, o.y - 1) || (t.makeTransparent(o.x, o.y - 1), s.push({ x: o.x, y: o.y - 1 })),
                t.isTransparent(o.x + 1, o.y - 1) ||
                    (t.makeTransparent(o.x + 1, o.y - 1), s.push({ x: o.x + 1, y: o.y - 1 })),
                t.isTransparent(o.x - 1, o.y) || (t.makeTransparent(o.x - 1, o.y), s.push({ x: o.x - 1, y: o.y })),
                t.isTransparent(o.x + 1, o.y) || (t.makeTransparent(o.x + 1, o.y), s.push({ x: o.x + 1, y: o.y })),
                t.isTransparent(o.x - 1, o.y + 1) ||
                    (t.makeTransparent(o.x - 1, o.y + 1), s.push({ x: o.x - 1, y: o.y + 1 })),
                t.isTransparent(o.x, o.y + 1) || (t.makeTransparent(o.x, o.y + 1), s.push({ x: o.x, y: o.y + 1 })),
                t.isTransparent(o.x + 1, o.y + 1) ||
                    (t.makeTransparent(o.x + 1, o.y + 1), s.push({ x: o.x + 1, y: o.y + 1 }));
        return [n.x, n.y, n.width, n.height];
    },
    cellCount: function () {
        return this._cells.length;
    },
    cellIdToIndex: function (t) {
        var i, e = this._cells;
        for (i = 1; e.length > i; i++)
            if (e[i][4] === t)
                return i;
        return -1;
    },
    stringify: function () {
        var t = "new " + this.classId() + "('" + this.url() + "', " + (this._cells + "") + ")";
        return t;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_55);
var $i_56 = $i_53.extend({
    classId: "$i_56",
    init: function (t) {
        $i_53.prototype.init.call(this, t),
            arguments[1] &&
                this.log("Font sheets no longer accept a caching limit value. All font output is now cached by default via the actual font entity - fontEntity.cache(true);", "warning"),
            (this._noDimensions = !0),
            this.on("loaded", function () {
                if (this.image)
                    if (((this._sheetImage = this.image),
                        (this._fontData = this.decodeHeader()),
                        (this._charCodeMap = this._fontData.characters.charCodes),
                        (this._charPosMap = this._fontData.characters.charPosition),
                        (this._measuredWidthMap = this._fontData.characters.measuredWidth),
                        (this._pixelWidthMap = this._fontData.characters.pixelWidth),
                        this._fontData)) {
                        var t = this._fontData.font;
                        this.log("Loaded font sheet for font: " +
                            t.fontName +
                            " @ " +
                            t.fontSize +
                            t.fontSizeUnit +
                            " in " +
                            t.fontColor);
                    }
                    else
                        this.log("Could not load data header for font sheet: " + this.image.src, "error");
            });
    },
    decodeHeader: function () {
        var t = document.createElement("canvas"), i = t.getContext("2d");
        return ((t.width = this.image.width),
            (t.height = 1),
            i.drawImage(this.image, 0, 0),
            this._decode(t, 0, 0, this.image.width));
    },
    _decode: function (t, i, e, o) {
        "use strict";
        var s, n = t.getContext("2d"), r = n.getImageData(i, e, o, t.height).data, a = !0, h = 0, l = "";
        while (a) {
            if (((s = r[h] + "" + " " + (r[h + 1] + "") + " " + (r[h + 2] + "")), s === "3 2 1"))
                return (a = !1), JSON.parse(l);
            (l += String.fromCharCode(r[h]) + String.fromCharCode(r[h + 1]) + String.fromCharCode(r[h + 2])),
                (h += 4),
                h > r.length && ((a = !1), console.log("Image JSON Decode Error!"));
        }
    },
    lineHeightModifier: function (t) {
        t !== void 0 && (this._lineHeightModifier = t);
    },
    measureTextWidth: function (t) {
        if (this._loaded) {
            var i, e, o, s, n = this._charCodeMap, r = this._measuredWidthMap, a = [], h = 0;
            for (t.indexOf("\n") > -1 ? (a = t.split("\n")) : a.push(t), o = 0; a.length > o; o++) {
                for (s = 0, i = 0; a[o].length > i; i++)
                    (e = n[a[o].charCodeAt(i)]), (s += r[e] || 0);
                s > h && (h = s);
            }
            return s;
        }
        return -1;
    },
    render: function (t, i) {
        if (i._renderText && this._loaded) {
            var e, o, s, n, r, a = t, h = i._renderText, l = [], c = this._charCodeMap, _ = this._charPosMap, m = this._measuredWidthMap, u = this._pixelWidthMap, p = 0, d = 0, y = 0, x = 0, f = 0, g = 0, b = [], v = this._sizeY - 2, w = 0, C = 0;
            switch ((h.indexOf("\n") > -1 ? (l = h.split("\n")) : l.push(h), (n = v * l.length), i._textAlignY)) {
                case 0:
                    x = -((v * l.length) / 2) - i._textLineSpacing * ((l.length - 1) / 2);
                    break;
                case 1:
                    x = -((v * l.length) / 2) - i._textLineSpacing * ((l.length - 1) / 2);
                    break;
                case 2:
                    x = -((v * l.length) / 2) - i._textLineSpacing * ((l.length - 1) / 2);
            }
            for (o = 0; l.length > o; o++) {
                for (e = l[o], s = 0; e.length > s; s++)
                    (r = c[e.charCodeAt(s)]), (w += m[r] || 0);
                (b[o] = w), w > C && (C = w), (w = 0);
            }
            switch (i._textAlignX) {
                case 0:
                    y = -i._bounds2d.x2;
                    break;
                case 1:
                    y = -C / 2;
                    break;
                case 2:
                    y = i._bounds2d.x2 - C;
            }
            for (o = 0; l.length > o; o++) {
                switch (((e = l[o]), (d = v * o + i._textLineSpacing * o), i._textAlignX)) {
                    case 0:
                        p = -i._bounds2d.x2;
                        break;
                    case 1:
                        p = -b[o] / 2;
                        break;
                    case 2:
                        p = i._bounds2d.x2 - b[o];
                }
                for (s = 0; e.length > s; s++)
                    (r = c[e.charCodeAt(s)]),
                        a.drawImage(this.image, _[r], 2, u[r], this._sizeY - 2, Math.floor(f + p), Math.floor(g + x + d), u[r], this._sizeY - 2),
                        i._colorOverlay &&
                            (a.save(),
                                (a.globalCompositeOperation = "source-atop"),
                                (a.fillStyle = i._colorOverlay),
                                a.fillRect(Math.floor(f + p), Math.floor(g + x + d), u[r], this._sizeY - 2),
                                a.restore()),
                        (p += m[r] || 0),
                        ige._drawCount++;
                p = 0;
            }
        }
    },
    destroy: function () {
        (this.image = null), (this.script = null);
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_56);
var $i_57 = {
    measureTextWidth: function (t, i) {
        if (i._nativeFont) {
            var e, o, s = [], n = 0, r = document.createElement("canvas"), a = r.getContext("2d");
            for (t.indexOf("\n") > -1 ? (s = t.split("\n")) : s.push(t),
                a.font = i._nativeFont,
                a.textBaseline = "middle",
                i._nativeStroke &&
                    ((a.lineWidth = i._nativeStroke),
                        (a.strokeStyle = i._nativeStrokeColor ? i._nativeStrokeColor : i._colorOverlay)),
                e = 0; s.length > e; e++)
                (o = a.measureText(s[e]).width), o > n && (n = o);
            return n;
        }
        return -1;
    },
    render: function (t, i) {
        if (i._nativeFont && i._renderText) {
            var e, o, s, n, r, a = i._renderText, h = [];
            for (t.font = i._nativeFont,
                t.textBaseline = "middle",
                i._colorOverlay && (t.fillStyle = i._colorOverlay),
                i._textAlignX === 0 && ((t.textAlign = "left"), t.translate(-i._bounds2d.x2, 0)),
                i._textAlignX === 1 && (t.textAlign = "center"),
                i._textAlignX === 2 && ((t.textAlign = "right"), t.translate(i._bounds2d.x2, 0)),
                i._nativeStroke &&
                    ((t.lineWidth = i._nativeStroke),
                        (t.strokeStyle = i._nativeStrokeColor ? i._nativeStrokeColor : i._colorOverlay)),
                a.indexOf("\n") > -1 ? (h = a.split("\n")) : h.push(a),
                n = Math.floor(i._bounds2d.y / h.length),
                o = -((n + i._textLineSpacing) / 2) * (h.length - 1),
                r = 0; h.length > r; r++)
                (s = o + n * r + i._textLineSpacing * r),
                    (e = t.measureText(h[r])),
                    i._nativeStroke && t.strokeText(h[r], 0, s),
                    t.fillText(h[r], 0, s);
        }
    }
}, $i_58 = $i_3.extend({
    classId: "$i_58",
    init: function () {
        (this._newBorn = !0),
            (this._alive = !0),
            (this._renderMode = 0),
            (this._mountMode = 0),
            (this._parent = null),
            (this._children = []),
            (this._layer = 0),
            (this._depth = 0),
            (this._depthSortMode = 0),
            (this._timeStream = []),
            (this._inView = !0),
            (this._managed = 1),
            (this._specialProp = ["_id", "_parent", "_children"]);
    },
    alive: function (t) {
        return t !== void 0 ? ((this._alive = t), this) : this._alive;
    },
    managed: function (t) {
        return t !== void 0 ? ((this._managed = t), this) : this._managed;
    },
    id: function (t) {
        if (t !== void 0) {
            if (t === this._id)
                return this;
            if (!ige._register[t])
                return (this._id && ige._register[this._id] && ige.unRegister(this),
                    (this._id = t),
                    ige.register(this),
                    this);
            ige._register[t] !== this &&
                this.log('Cannot set ID of object to "' + t + '" because that ID is already in use by another object!', "error");
        }
        return this._id || ((this._id = ige.newIdHex()), ige.register(this)), this._id;
    },
    category: function (t) {
        return t !== void 0
            ? (this._category && this._category !== t && ige.categoryUnRegister(this),
                (this._category = t),
                t && ige.categoryRegister(this),
                this)
            : this._category;
    },
    group: function () {
        this.log("The group() method has been renamed to category(). Please update your code.", "error");
    },
    addGroup: function () {
        var t, i, e = arguments.length;
        while (e--)
            if (((t = arguments[e]), t instanceof Array)) {
                i = t.length;
                while (i--)
                    (this._groups && this._groups.indexOf(t[i]) !== -1) ||
                        ((this._groups = this._groups || []),
                            this._groups.push(t[i]),
                            ige.groupRegister(this, t[i]));
            }
            else
                (this._groups && this._groups.indexOf(t) !== -1) ||
                    ((this._groups = this._groups || []), this._groups.push(t), ige.groupRegister(this, t));
        return this;
    },
    inGroup: function (t, i) {
        return t ? (i ? this.inAllGroups(t) : this.inAnyGroup(t)) : !1;
    },
    inAllGroups: function (t) {
        var i, e;
        if (!(t instanceof Array))
            return this._groups && this._groups.indexOf(t) !== -1;
        e = t.length;
        while (e--)
            if (((i = t[e]), i && (!this._groups || this._groups.indexOf(i) === -1)))
                return !1;
        return !0;
    },
    inAnyGroup: function (t) {
        var i, e;
        if (!(t instanceof Array))
            return this._groups && this._groups.indexOf(t) > -1;
        e = t.length;
        while (e--)
            if (((i = t[e]), i && this._groups && this._groups.indexOf(i) > -1))
                return !0;
        return !1;
    },
    groups: function () {
        return this._groups || [];
    },
    groupCount: function () {
        return this._groups ? this._groups.length : 0;
    },
    removeGroup: function () {
        if (this._groups) {
            var t, i, e = arguments.length;
            while (e--)
                if (((t = arguments[e]), t instanceof Array)) {
                    i = t.length;
                    while (i--)
                        this._groups.pull(t[i]), ige.groupUnRegister(this, t[i]);
                }
                else
                    this._groups.pull(t), ige.groupUnRegister(this, t);
        }
        return this;
    },
    removeAllGroups: function () {
        if (this._groups) {
            var t = this._groups, i = t.length;
            while (i--)
                ige.groupUnRegister(this, t[i]);
            delete this._groups;
        }
        return this;
    },
    addBehaviour: function (t, i, e) {
        if (typeof t == "string") {
            if (typeof i == "function")
                return (e
                    ? ((this._tickBehaviours = this._tickBehaviours || []),
                        this._tickBehaviours.push({ id: t, method: i }))
                    : ((this._updateBehaviours = this._updateBehaviours || []),
                        this._updateBehaviours.push({ id: t, method: i })),
                    this);
            this.log("The behaviour you passed is not a function! The second parameter of the call must be a function!", "error");
        }
        else
            this.log("Cannot add behaviour to object because the specified behaviour id is not a string. You must provide two parameters with the addBehaviour() call, an id:String and a behaviour:Function. Adding a behaviour with an id allows you to remove it by it's id at a later stage!", "error");
        return !1;
    },
    removeBehaviour: function (t, i) {
        if (t !== void 0) {
            var e, o;
            if ((e = i ? this._tickBehaviours : this._updateBehaviours)) {
                o = e.length;
                while (o--)
                    if (e[o].id === t)
                        return e.splice(o, 1), this;
            }
        }
        return !1;
    },
    hasBehaviour: function (t, i) {
        if (t !== void 0) {
            var e, o;
            if ((e = i ? this._tickBehaviours : this._updateBehaviours)) {
                o = e.length;
                while (o--)
                    if (e[o].id === t)
                        return !0;
            }
        }
        return !1;
    },
    drawBounds: function (t) {
        return t !== void 0 ? ((this._drawBounds = t), this) : this._drawBounds;
    },
    drawBoundsData: function (t) {
        return t !== void 0 ? ((this._drawBoundsData = t), this) : this._drawBoundsData;
    },
    drawMouse: function (t) {
        return t !== void 0 ? ((this._drawMouse = t), this) : this._drawMouse;
    },
    drawMouseData: function (t) {
        return t !== void 0 ? ((this._drawMouseData = t), this) : this._drawMouseData;
    },
    $: function (t) {
        var i = ige.$(t);
        if (i._parent === this)
            return i;
        var e = i.parent(this.id());
        return e ? i : void 0;
    },
    $$: function (t) {
        var i, e = ige.$$(t), o = e.length, s = [], n = this.id();
        while (o--)
            (i = e[o]), (i._parent === this || i.parent(n)) && s.push(i);
        return s;
    },
    parent: function (t) {
        return t
            ? this._parent
                ? this._parent.id() === t
                    ? this._parent
                    : this._parent.parent(t)
                : void 0
            : this._parent;
    },
    children: function () {
        return this._children;
    },
    mount: function (t) {
        if (t) {
            if (t === this)
                return this.log("Cannot mount an object to itself!", "error"), this;
            if (t._children) {
                if ((this.id(), this._parent)) {
                    if (this._parent === t)
                        return this;
                    this.unMount();
                }
                return ((this._parent = t),
                    !this._ignoreCamera &&
                        this._parent._ignoreCamera &&
                        (this._ignoreCamera = this._parent._ignoreCamera),
                    this._parent._streamRoomId && (this._streamRoomId = this._parent._streamRoomId),
                    t._children.push(this),
                    this._parent._childMounted(this),
                    t.updateTransform && (t.updateTransform(), t.aabb(!0)),
                    t._compositeCache ? (this._compositeParent = !0) : delete this._compositeParent,
                    this._mounted(this._parent),
                    this.emit("mounted", this._parent),
                    this);
            }
            return (this.log("Cannot mount object because it has no _children array! If you are mounting to a custom class, ensure that you have called the prototype.init() method of your super-class during the init of your custom class.", "warning"),
                !1);
        }
        this.log("Cannot mount non-existent object!", "error");
    },
    unMount: function () {
        if (this._parent) {
            var t = this._parent._children, i = t.indexOf(this), e = this._parent;
            return i > -1
                ? (t.splice(i, 1),
                    this._parent._childUnMounted(this),
                    (this._parent = null),
                    this._unMounted(e),
                    this)
                : !1;
        }
        return !1;
    },
    hasParent: function (t, i) {
        var e = !1;
        return !i && this._hasParent && this._hasParent[t] !== void 0
            ? this._hasParent[t]
            : (this._parent && (e = this._parent.id() === t ? !0 : this._parent.hasParent(t, i)),
                (this._hasParent = this._hasParent || {}),
                (this._hasParent[t] = e),
                e);
    },
    clone: function (options) {
        options === void 0 && (options = {}),
            options.id === void 0 && (options.id = !1),
            options.mount === void 0 && (options.mount = !1),
            options.transform === void 0 && (options.transform = !0);
        var newObject = eval(this.stringify(options));
        return newObject;
    },
    mode: function (t) {
        return t !== void 0 ? ((this._renderMode = t), this) : this._renderMode;
    },
    isometric: function (t) {
        return t === !0
            ? ((this._renderMode = 1), this)
            : t === !1
                ? ((this._renderMode = 0), this)
                : this._renderMode === 1;
    },
    isometricMounts: function (t) {
        return t === !0
            ? ((this._mountMode = 1), this)
            : t === !1
                ? ((this._mountMode = 0), this)
                : this._mountMode === 1;
    },
    indestructible: function (t) {
        return t !== void 0 ? ((this._indestructible = t), this) : this._indestructible;
    },
    layer: function (t) {
        return t !== void 0 ? ((this._layer = t), this) : this._layer;
    },
    depth: function (t) {
        return t !== void 0 ? ((this._depth = t), this) : this._depth;
    },
    destroyChildren: function () {
        var t, i = this._children;
        if (i) {
            t = i.length;
            while (t--)
                i[t].destroy();
        }
        return (this._children = []), this;
    },
    destroyBehaviours: function () {
        delete this._updateBehaviours, delete this._tickBehaviours;
    },
    destroyComponents: function () {
        var t, i = this._components;
        if (i) {
            t = i.length;
            while (t--)
                i[t].destroy && i[t].destroy();
        }
        return delete this._components, this;
    },
    depthSortMode: function (t) {
        return t !== void 0 ? ((this._depthSortMode = t), this) : this._depthSortMode;
    },
    depthSortChildren: function () {
        if (this._depthSortMode !== -1) {
            var t, i, e, o, s = this._children;
            if (s && ((t = s.length), t > 1))
                if (this._mountMode === 1) {
                    if (this._depthSortMode === 0) {
                        for (i = { adj: [], c: [], p: [], order: [], order_ind: t - 1 }, e = 0; t > e; ++e)
                            for (i.c[e] = 0, i.p[e] = -1, o = e + 1; t > o; ++o)
                                (i.adj[e] = i.adj[e] || []),
                                    (i.adj[o] = i.adj[o] || []),
                                    s[e]._inView &&
                                        s[o]._inView &&
                                        s[e]._projectionOverlap &&
                                        s[o]._projectionOverlap &&
                                        s[e]._projectionOverlap(s[o]) &&
                                        (s[e].isBehind(s[o]) ? i.adj[o].push(e) : i.adj[e].push(o));
                        for (e = 0; t > e; ++e)
                            i.c[e] === 0 && this._depthSortVisit(e, i);
                        for (e = 0; i.order.length > e; e++)
                            s[i.order[e]].depth(e);
                        this._children.sort(function (t, i) {
                            var e = i._layer - t._layer;
                            return e === 0 ? i._depth - t._depth : e;
                        });
                    }
                    if ((this._depthSortMode === 1 &&
                        this._children.sort(function (t, i) {
                            var e = i._layer - t._layer;
                            return e === 0 ? (t.isBehind(i) ? -1 : 1) : e;
                        }),
                        this._depthSortMode === 2)) {
                        while (t--)
                            (i = s[t]), (o = i._translate), o && (i._depth = o.x + o.y + o.z);
                        this._children.sort(function (t, i) {
                            var e = i._layer - t._layer;
                            return e === 0 ? i._depth - t._depth : e;
                        });
                    }
                }
                else
                    this._children.sort(function (t, i) {
                        var e = i._layer - t._layer;
                        return e === 0 ? i._depth - t._depth : e;
                    });
        }
    },
    viewChecking: function (t) {
        return t !== void 0 ? ((this._viewChecking = t), this) : this._viewChecking;
    },
    viewCheckChildren: function () {
        if (ige._currentViewport) {
            var t, i = this._children, e = i.length, o = ige._currentViewport.viewArea();
            while (e--)
                (t = i[e]), (t._inView = t._alwaysInView ? !0 : t.aabb ? (o.intersects(t.aabb(!0)) ? !0 : !1) : !1);
        }
        return this;
    },
    update: function (t, i) {
        if (this._alive) {
            this._newBorn && (this._newBorn = !1);
            var e, o, s, n = this._children;
            if (n)
                if (((e = n.length),
                    e &&
                        !ige._headless &&
                        (igeConfig.debug._timing
                            ? (ige._timeSpentLastTick[this.id()] || (ige._timeSpentLastTick[this.id()] = {}),
                                (o = new Date().getTime()),
                                this.depthSortChildren(),
                                (s = new Date().getTime() - o),
                                (ige._timeSpentLastTick[this.id()].depthSortChildren = s))
                            : this.depthSortChildren()),
                    igeConfig.debug._timing))
                    while (e--)
                        (o = new Date().getTime()),
                            n[e].update(t, i),
                            (s = new Date().getTime() - o),
                            n[e] &&
                                (ige._timeSpentInTick[n[e].id()] || (ige._timeSpentInTick[n[e].id()] = 0),
                                    ige._timeSpentLastTick[n[e].id()] || (ige._timeSpentLastTick[n[e].id()] = {}),
                                    (ige._timeSpentInTick[n[e].id()] += s),
                                    (ige._timeSpentLastTick[n[e].id()].tick = s));
                else
                    while (e--)
                        n[e].update(t, i);
        }
    },
    tick: function (t) {
        if (this._alive) {
            var i, e, o, s = this._children;
            if ((this._viewChecking && this.viewCheckChildren(), s))
                if (((i = s.length), igeConfig.debug._timing))
                    while (i--)
                        s[i]
                            ? s[i]._newBorn ||
                                (t.save(),
                                    (e = new Date().getTime()),
                                    s[i].tick(t),
                                    (o = new Date().getTime() - e),
                                    s[i] &&
                                        (ige._timeSpentInTick[s[i].id()] || (ige._timeSpentInTick[s[i].id()] = 0),
                                            ige._timeSpentLastTick[s[i].id()] || (ige._timeSpentLastTick[s[i].id()] = {}),
                                            (ige._timeSpentInTick[s[i].id()] += o),
                                            (ige._timeSpentLastTick[s[i].id()].tick = o)),
                                    t.restore())
                            : this.log("Object _children is undefined for index " + i + " and _id: " + this._id, "error");
                else
                    while (i--)
                        s[i]
                            ? s[i]._newBorn || (t.save(), s[i].tick(t), t.restore())
                            : this.log("Object _children is undefined for index " + i + " and _id: " + this._id, "error");
        }
    },
    _depthSortVisit: function (t, i) {
        var e, o, s = i.adj[t], n = s.length;
        for (i.c[t] = 1, e = 0; n > e; ++e)
            (o = s[e]), i.c[o] === 0 && ((i.p[o] = t), this._depthSortVisit(o, i));
        (i.c[t] = 2), (i.order[i.order_ind] = t), --i.order_ind;
    },
    _resizeEvent: function (t) {
        var i, e = this._children;
        if (e) {
            i = e.length;
            while (i--)
                e[i]._resizeEvent(t);
        }
    },
    _processUpdateBehaviours: function () {
        var t, i = this._updateBehaviours;
        if (i) {
            t = i.length;
            while (t--)
                i[t].method.apply(this, arguments);
        }
    },
    _processTickBehaviours: function () {
        var t, i = this._tickBehaviours;
        if (i) {
            t = i.length;
            while (t--)
                i[t].method.apply(this, arguments);
        }
    },
    _childMounted: function () {
        this._resizeEvent(null);
    },
    _childUnMounted: function () { },
    _mounted: function () { },
    _unMounted: function () { },
    destroy: function () {
        return (this.unMount(),
            this._children && this.destroyChildren(),
            this.destroyComponents(),
            this.destroyBehaviours(),
            ige.unRegister(this),
            ige.categoryUnRegister(this),
            ige.groupUnRegister(this),
            (this._alive = !1),
            delete this._eventListeners,
            this);
    },
    objSave: function () {
        return { igeClass: this.classId(), data: this._objSaveReassign(this, []) };
    },
    objLoad: function (t) {
        this._objLoadReassign(this, t.data);
    },
    saveSpecialProp: function (t, i) {
        switch (i) {
            case "_id":
                if (t._id)
                    return { _id: t._id };
                break;
            case "_parent":
                if (t._parent)
                    return { _parent: t._parent.id() };
                break;
            case "_children":
                if (t._children.length) {
                    var e, o, s = [];
                    for (e = 0; t._children.length > e; e++)
                        (o = t._children[e]), s.push(o.objSave());
                    return { _children: s };
                }
        }
        return void 0;
    },
    loadSpecialProp: function (t, i) {
        switch (i) {
            case "_id":
                return { _id: t[i] };
            case "_parent":
                return { _parent: t[i] };
            case "_children":
                return { _children: t[i] };
        }
        return void 0;
    },
    loadGraph: function (t) {
        if (t.igeClass && t.data) {
            var i, e, o, s, n = ige.newClassInstance(t.igeClass);
            if ((n.objLoad(t),
                n._parent && ((s = n._parent), delete n._parent),
                n._id && ((i = n._id), delete n._id, n.id(i)),
                n._children && n._children.length))
                for (e = n._children, n._children = [], o = 0; e.length > o; o++)
                    n.loadGraph(e[o]);
            n.mount(this);
        }
    },
    _objSaveReassign: function (t, i) {
        var e, o, s, n, r, a = this._specialProp;
        if (typeof t != "object" || t instanceof Array)
            return t;
        e = {};
        for (r in t)
            if (t.hasOwnProperty(r))
                if (typeof t[r] == "object") {
                    if (a.indexOf(r) === -1)
                        (o = i.indexOf(t[r])),
                            o > -1
                                ? ((e[r] = "{ref:" + o + "}"),
                                    this.log("Possible circular reference for property " + r))
                                : (i.push(t[r]), (e[r] = this._objSaveReassign(t[r], i)));
                    else if ((s = this.saveSpecialProp(t, r)))
                        if (typeof s != "object" || s instanceof Array)
                            e[r] = s;
                        else
                            for (n in s)
                                s.hasOwnProperty(n) && (e[n] = s[n]);
                }
                else
                    e[r] = t[r];
        return e;
    },
    _objLoadReassign: function (t, i) {
        var e, o, s, n = this._specialProp;
        for (s in i)
            if (i.hasOwnProperty(s))
                if (n.indexOf(s) === -1)
                    typeof i[s] == "object" && t[s] ? this._objLoadReassign(t[s], i[s]) : (t[s] = i[s]);
                else if ((e = this.loadSpecialProp(i, s)))
                    if (typeof e != "object" || e instanceof Array)
                        t[s] = e;
                    else
                        for (o in e)
                            e.hasOwnProperty(o) && (t[o] = e[o]);
    },
    stringify: function (t) {
        t === void 0 && (t = {});
        var i = "new " + this.classId() + "()";
        return (t.id !== !1 && (i += ".id('" + this.id() + "')"),
            t.mount !== !1 && this.parent() && (i += ".mount(ige.$('" + this.parent().id() + "'))"),
            (i += this._stringify(t)));
    },
    _stringify: function (t) {
        t === void 0 && (t = {});
        var i, e = "";
        for (i in this)
            if (this.hasOwnProperty(i) && this[i] !== void 0)
                switch (i) {
                    case "_category":
                        e += ".category(" + this.category() + ")";
                        break;
                    case "_drawBounds":
                        e += ".drawBounds(" + this.drawBounds() + ")";
                        break;
                    case "_drawBoundsData":
                        e += ".drawBoundsData(" + this.drawBoundsData() + ")";
                        break;
                    case "_drawMouse":
                        e += ".drawMouse(" + this.drawMouse() + ")";
                        break;
                    case "_mode":
                        e += ".mode(" + this.mode() + ")";
                        break;
                    case "_isometricMounts":
                        e += ".isometricMounts(" + this.isometricMounts() + ")";
                        break;
                    case "_indestructible":
                        e += ".indestructible(" + this.indestructible() + ")";
                        break;
                    case "_layer":
                        e += ".layer(" + this.layer() + ")";
                        break;
                    case "_depth":
                        e += ".depth(" + this.depth() + ")";
                }
        return e;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_58);
var $i_59 = $i_58.extend({
    classId: "$i_59",
    init: function () {
        $i_58.prototype.init.call(this),
            this._specialProp.push("_texture"),
            this._specialProp.push("_eventListeners"),
            this._specialProp.push("_aabb"),
            (this._anchor = new $i_4(0, 0)),
            (this._renderPos = { x: 0, y: 0 }),
            (this._opacity = 1),
            (this._cell = 1),
            (this._deathTime = void 0),
            (this._bornTime = ige._currentTime),
            (this._translate = new $i_5(0, 0, 0)),
            (this._oldTranslate = new $i_5(0, 0, 0)),
            (this._rotate = new $i_5(0, 0, 0)),
            (this._scale = new $i_5(1, 1, 1)),
            (this._origin = new $i_5(0.5, 0.5, 0.5)),
            (this._bounds2d = new $i_4(40, 40)),
            (this._bounds3d = new $i_5(0, 0, 0)),
            (this._oldBounds2d = new $i_4(40, 40)),
            (this._oldBounds3d = new $i_5(0, 0, 0)),
            (this._highlight = !1),
            (this._mouseEventsActive = !1),
            (this._velocity = new $i_5(0, 0, 0)),
            (this._localMatrix = new $i_8()),
            (this._worldMatrix = new $i_8()),
            (this._oldWorldMatrix = new $i_8()),
            (this._inView = !0),
            (this._hidden = !1),
            this.streamSections(["transform"]);
    },
    show: function () {
        return (this._hidden = !1), this;
    },
    hide: function () {
        return (this._hidden = !0), this;
    },
    isVisible: function () {
        return this._hidden === !1;
    },
    isHidden: function () {
        return this._hidden === !0;
    },
    cache: function (t) {
        if (t !== void 0) {
            if (((this._cache = t), t)) {
                (this._cacheCanvas = isClient ? document.createElement("canvas") : new $i_48()),
                    (this._cacheCtx = this._cacheCanvas.getContext("2d")),
                    (this._cacheDirty = !0);
                var i = this._cacheSmoothing !== void 0 ? this._cacheSmoothing : ige._globalSmoothing;
                i
                    ? ((this._cacheCtx.imageSmoothingEnabled = !0),
                        (this._cacheCtx.webkitImageSmoothingEnabled = !0),
                        (this._cacheCtx.mozImageSmoothingEnabled = !0))
                    : ((this._cacheCtx.imageSmoothingEnabled = !1),
                        (this._cacheCtx.webkitImageSmoothingEnabled = !1),
                        (this._cacheCtx.mozImageSmoothingEnabled = !1)),
                    this.compositeCache() && this.compositeCache(!1);
            }
            else
                delete this._cacheCanvas;
            return this;
        }
        return this._cache;
    },
    cacheSmoothing: function (t) {
        return t !== void 0 ? ((this._cacheSmoothing = t), this) : this._cacheSmoothing;
    },
    compositeCache: function (t) {
        if (isClient) {
            if (t !== void 0) {
                if (t) {
                    this.cache(!1),
                        (this._cacheCanvas = document.createElement("canvas")),
                        (this._cacheCtx = this._cacheCanvas.getContext("2d")),
                        (this._cacheDirty = !0);
                    var i = this._cacheSmoothing !== void 0 ? this._cacheSmoothing : ige._globalSmoothing;
                    i
                        ? ((this._cacheCtx.imageSmoothingEnabled = !0),
                            (this._cacheCtx.webkitImageSmoothingEnabled = !0),
                            (this._cacheCtx.mozImageSmoothingEnabled = !0))
                        : ((this._cacheCtx.imageSmoothingEnabled = !1),
                            (this._cacheCtx.webkitImageSmoothingEnabled = !1),
                            (this._cacheCtx.mozImageSmoothingEnabled = !1));
                }
                return (this._children.each(function () {
                    t ? (this._compositeParent = !0) : delete this._compositeParent;
                }),
                    (this._compositeCache = t),
                    this);
            }
            return this._compositeCache;
        }
        return this;
    },
    cacheDirty: function (t) {
        return t !== void 0
            ? ((this._cacheDirty = t),
                t &&
                    this._compositeParent &&
                    this._parent &&
                    (this._parent.cacheDirty(t), this._cache || this._compositeCache || (this._cacheDirty = !1)),
                this)
            : this._cacheDirty;
    },
    mousePos: function (t) {
        if ((t = t || ige._currentViewport)) {
            var i = t._mousePos.clone();
            return this._ignoreCamera, (i.x += t._translate.x), (i.y += t._translate.y), this._transformPoint(i), i;
        }
        return new $i_5(0, 0, 0);
    },
    mousePosAbsolute: function (t) {
        if ((t = t || ige._currentViewport)) {
            var i = t._mousePos.clone();
            return this._transformPoint(i), i;
        }
        return new $i_5(0, 0, 0);
    },
    mousePosWorld: function (t) {
        t = t || ige._currentViewport;
        var i = this.mousePos(t);
        return this.localToWorldPoint(i, t), this._ignoreCamera, i;
    },
    rotateToPoint: function (t) {
        var i = this.worldPosition();
        return (this.rotateTo(this._rotate.x, this._rotate.y, Math.atan2(i.y - t.y, i.x - t.x) - this._parent._rotate.z + Math.radians(270)),
            this);
    },
    backgroundPattern: function (t, i, e, o) {
        return t !== void 0
            ? ((this._backgroundPattern = t),
                (this._backgroundPatternRepeat = i || "repeat"),
                (this._backgroundPatternTrackCamera = e),
                (this._backgroundPatternIsoTile = o),
                this)
            : this._backgroundPattern;
    },
    widthByTile: function (t, i) {
        if (this._parent && this._parent._tileWidth !== void 0 && this._parent._tileHeight !== void 0) {
            var e, o = this._renderMode === 0 ? this._parent._tileWidth : this._parent._tileWidth * 2;
            this.width(t * o),
                i &&
                    (this._texture
                        ? ((e = this._texture._sizeX / this._bounds2d.x), this.height(this._texture._sizeY / e))
                        : this.log("Cannot set height based on texture aspect ratio and new width because no texture is currently assigned to the entity!", "error"));
        }
        else
            this.log("Cannot set width by tile because the entity is not currently mounted to a tile map or the tile map has no tileWidth or tileHeight values.", "warning");
        return this;
    },
    heightByTile: function (t, i) {
        if (this._parent && this._parent._tileWidth !== void 0 && this._parent._tileHeight !== void 0) {
            var e, o = this._renderMode === 0 ? this._parent._tileHeight : this._parent._tileHeight * 2;
            this.height(t * o),
                i &&
                    (this._texture
                        ? ((e = this._texture._sizeY / this._bounds2d.y), this.width(this._texture._sizeX / e))
                        : this.log("Cannot set width based on texture aspect ratio and new height because no texture is currently assigned to the entity!", "error"));
        }
        else
            this.log("Cannot set height by tile because the entity is not currently mounted to a tile map or the tile map has no tileWidth or tileHeight values.", "warning");
        return this;
    },
    occupyTile: function (t, i, e, o) {
        if (this._parent && this._parent.$i_66)
            if (t !== void 0 && i !== void 0)
                this._parent.occupyTile(t, i, e, o, this);
            else {
                var s = new $i_5(this._translate.x - (this._tileWidth / 2 - 0.5) * this._parent._tileWidth, this._translate.y - (this._tileHeight / 2 - 0.5) * this._parent._tileHeight, 0), n = this._parent.pointToTile(s);
                this._parent._mountMode === 1 && n.thisToIso(),
                    this._parent.occupyTile(n.x, n.y, this._tileWidth, this._tileHeight, this);
            }
        return this;
    },
    unOccupyTile: function (t, i, e, o) {
        if (this._parent && this._parent.$i_66)
            if (t !== void 0 && i !== void 0)
                this._parent.unOccupyTile(t, i, e, o);
            else {
                var s = new $i_5(this._translate.x - (this._tileWidth / 2 - 0.5) * this._parent._tileWidth, this._translate.y - (this._tileHeight / 2 - 0.5) * this._parent._tileHeight, 0), n = this._parent.pointToTile(s);
                this._parent._mountMode === 1 && n.thisToIso(),
                    this._parent.unOccupyTile(n.x, n.y, this._tileWidth, this._tileHeight);
            }
        return this;
    },
    overTiles: function () {
        if (this._parent && this._parent.$i_66) {
            var t, i, e = this._tileWidth || 1, o = this._tileHeight || 1, s = this._parent.pointToTile(this._translate), n = [];
            for (t = 0; e > t; t++)
                for (i = 0; o > i; i++)
                    n.push(new $i_5(s.x + t, s.y + i, 0));
            return n;
        }
    },
    anchor: function (t, i) {
        return t !== void 0 && i !== void 0 ? ((this._anchor = new $i_4(t, i)), this) : this._anchor;
    },
    width: function (t, i) {
        if (t !== void 0) {
            if (i) {
                var e = t / this._bounds2d.x;
                this.height(this._bounds2d.y * e);
            }
            return (this._bounds2d.x = t), (this._bounds2d.x2 = t / 2), this;
        }
        return this._bounds2d.x;
    },
    height: function (t, i) {
        if (t !== void 0) {
            if (i) {
                var e = t / this._bounds2d.y;
                this.width(this._bounds2d.x * e);
            }
            return (this._bounds2d.y = t), (this._bounds2d.y2 = t / 2), this;
        }
        return this._bounds2d.y;
    },
    bounds2d: function (t, i) {
        return t !== void 0 && i !== void 0
            ? ((this._bounds2d = new $i_4(t, i, 0)), this)
            : (t !== void 0 && i === void 0 && (this._bounds2d = new $i_4(t.x, t.y)), this._bounds2d);
    },
    bounds3d: function (t, i, e) {
        return t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._bounds3d = new $i_5(t, i, e)), this)
            : this._bounds3d;
    },
    size3d: function () {
        this.log("size3d has been renamed to bounds3d but is exactly the same so please search/replace your code to update calls.", "warning");
    },
    lifeSpan: function (t, i) {
        return t !== void 0 ? (this.deathTime(ige._currentTime + t, i), this) : this.deathTime() - ige._currentTime;
    },
    deathTime: function (t, i) {
        return t !== void 0
            ? ((this._deathTime = t), i !== void 0 && (this._deathCallBack = i), this)
            : this._deathTime;
    },
    opacity: function (t) {
        return t !== void 0 ? ((this._opacity = t), this) : this._opacity;
    },
    noAabb: function (t) {
        return t !== void 0 ? ((this._noAabb = t), this) : this._noAabb;
    },
    texture: function (t) {
        return t !== void 0 ? ((this._texture = t), this) : this._texture;
    },
    cell: function (t) {
        return t > 0 || t === null ? ((this._cell = t), this) : this._cell;
    },
    cellById: function (t) {
        if (t !== void 0)
            if (this._texture) {
                var i, e = this._texture, o = e._cells;
                for (i = 1; o.length > i; i++)
                    if (o[i][4] === t)
                        return this.cell(i), this;
                this.log('Could not find the cell id "' +
                    t +
                    '" in the assigned entity texture ' +
                    e.id() +
                    ', please check your sprite sheet (texture) cell definition to ensure the cell id "' +
                    t +
                    '" has been assigned to a cell!', "error");
            }
            else
                this.log("Cannot assign cell index from cell ID until an $i_55 has been set as the texture for this entity. Please set the texture before calling cellById().", "error");
        return this._cell;
    },
    dimensionsFromTexture: function (t) {
        return (this._texture &&
            (t === void 0
                ? (this.width(this._texture._sizeX), this.height(this._texture._sizeY))
                : (this.width(Math.floor((this._texture._sizeX / 100) * t)),
                    this.height(Math.floor((this._texture._sizeY / 100) * t))),
                this.localAabb(!0)),
            this);
    },
    dimensionsFromCell: function (t) {
        return (this._texture &&
            this._texture._cells &&
            this._texture._cells.length &&
            (t === void 0
                ? (this.width(this._texture._cells[this._cell][2]),
                    this.height(this._texture._cells[this._cell][3]))
                : (this.width(Math.floor((this._texture._cells[this._cell][2] / 100) * t)),
                    this.height(Math.floor((this._texture._cells[this._cell][3] / 100) * t))),
                this.localAabb(!0)),
            this);
    },
    highlight: function (t) {
        return t !== void 0 ? ((this._highlight = t), this) : this._highlight;
    },
    worldPosition: function () {
        return new $i_5(this._worldMatrix.matrix[2], this._worldMatrix.matrix[5], 0);
    },
    worldRotationZ: function () {
        return this._worldMatrix.rotationRadians();
    },
    localToWorld: function (t, i, e) {
        (i = i || ige._currentViewport),
            this._adjustmentMatrix && this._worldMatrix.multiply(this._adjustmentMatrix),
            e ? this._localMatrix.transform(t, this) : this._worldMatrix.transform(t, this),
            this._ignoreCamera;
    },
    localToWorldPoint: function (t, i) {
        (i = i || ige._currentViewport), this._worldMatrix.transform([t], this);
    },
    screenPosition: function () {
        return new $i_5(Math.floor((this._worldMatrix.matrix[2] - ige._currentCamera._translate.x) * ige._currentCamera._scale.x +
            ige._bounds2d.x2), Math.floor((this._worldMatrix.matrix[5] - ige._currentCamera._translate.y) * ige._currentCamera._scale.y +
            ige._bounds2d.y2), 0);
    },
    localIsoBoundsPoly: function () { },
    localBounds3dPolygon: function (t) {
        if (this._bounds3dPolygonDirty || !this._localBounds3dPolygon || t) {
            var i = this._bounds3d, e = new $i_6(), o = Math.toIso(+i.x2, -i.y2, -i.z2), s = Math.toIso(+i.x2, +i.y2, -i.z2), n = Math.toIso(-i.x2, +i.y2, -i.z2), r = Math.toIso(-i.x2, -i.y2, i.z2), a = Math.toIso(+i.x2, -i.y2, i.z2), h = Math.toIso(-i.x2, +i.y2, i.z2);
            e
                .addPoint(r.x, r.y)
                .addPoint(a.x, a.y)
                .addPoint(o.x, o.y)
                .addPoint(s.x, s.y)
                .addPoint(n.x, n.y)
                .addPoint(h.x, h.y)
                .addPoint(r.x, r.y),
                (this._localBounds3dPolygon = e),
                (this._bounds3dPolygonDirty = !1);
        }
        return this._localBounds3dPolygon;
    },
    isoBoundsPoly: function () { },
    bounds3dPolygon: function (t) {
        if (this._bounds3dPolygonDirty || !this._bounds3dPolygon || t) {
            var i = this.localBounds3dPolygon(t).clone();
            this.localToWorld(i._poly), (this._bounds3dPolygon = i);
        }
        return this._bounds3dPolygon;
    },
    mouseInIsoBounds: function () { },
    mouseInBounds3d: function (t) {
        var i = this.localBounds3dPolygon(t), e = this.mousePos();
        return i.pointInside(e);
    },
    aabb: function (t, i) {
        if (this._aabbDirty || !this._aabb || t) {
            var e, o, s, n, r, a, h, l, c, _, m = new $i_6(), u = this._anchor, p = u.x, d = u.y;
            (a = this._bounds2d),
                (h = a.x2),
                (l = a.y2),
                (c = h),
                (_ = l),
                m.addPoint(-c + p, -_ + d),
                m.addPoint(c + p, -_ + d),
                m.addPoint(c + p, _ + d),
                m.addPoint(-c + p, _ + d),
                (this._renderPos = { x: -c + p, y: -_ + d }),
                this.localToWorld(m._poly, null, i),
                (e = Math.min(m._poly[0].x, m._poly[1].x, m._poly[2].x, m._poly[3].x)),
                (o = Math.min(m._poly[0].y, m._poly[1].y, m._poly[2].y, m._poly[3].y)),
                (s = Math.max(m._poly[0].x, m._poly[1].x, m._poly[2].x, m._poly[3].x)),
                (n = Math.max(m._poly[0].y, m._poly[1].y, m._poly[2].y, m._poly[3].y)),
                (r = new $i_7(e, o, s - e, n - o)),
                (this._aabb = r),
                (this._aabbDirty = !1);
        }
        return this._aabb;
    },
    localAabb: function (t) {
        if (!this._localAabb || t) {
            var i = this.aabb();
            this._localAabb = new $i_7(-Math.floor(i.width / 2), -Math.floor(i.height / 2), Math.floor(i.width), Math.floor(i.height));
        }
        return this._localAabb;
    },
    compositeAabb: function (t) {
        var i, e, o = this._children;
        if (((e = t ? this.aabb(!0, t).clone() : this.aabb().clone()), o)) {
            i = o.length;
            while (i--)
                e.thisCombineRect(o[i].compositeAabb(t));
        }
        return e;
    },
    compositeStream: function (t) {
        return t !== void 0 ? ((this._compositeStream = t), this) : this._compositeStream;
    },
    _childMounted: function (t) {
        this.compositeStream() &&
            (t.compositeStream(!0), t.streamMode(this.streamMode()), t.streamControl(this.streamControl())),
            $i_58.prototype._childMounted.call(this, t),
            this.compositeCache() && this.cacheDirty(!0);
    },
    _swapVars: function (t, i) {
        return [i, t];
    },
    _internalsOverlap: function (t, i, e, o) {
        var s;
        return (t > i && ((s = this._swapVars(t, i)), (t = s[0]), (i = s[1])),
            e > o && ((s = this._swapVars(e, o)), (e = s[0]), (o = s[1])),
            t > e &&
                ((s = this._swapVars(t, e)),
                    (t = s[0]),
                    (e = s[1]),
                    (s = this._swapVars(i, o)),
                    (i = s[0]),
                    (o = s[1])),
            i > e);
    },
    _projectionOverlap: function (t) {
        var i = this._bounds3d, e = { x: this._translate.x - i.x / 2, y: this._translate.y - i.y / 2, z: this._translate.z - i.z }, o = { x: this._translate.x + i.x / 2, y: this._translate.y + i.y / 2, z: this._translate.z + i.z }, s = t._bounds3d, n = { x: t._translate.x - s.x / 2, y: t._translate.y - s.y / 2, z: t._translate.z - s.z }, r = { x: t._translate.x + s.x / 2, y: t._translate.y + s.y / 2, z: t._translate.z + s.z };
        return (this._internalsOverlap(e.x - o.y, o.x - e.y, n.x - r.y, r.x - n.y) &&
            this._internalsOverlap(e.x - o.z, o.x - e.z, n.x - r.z, r.x - n.z) &&
            this._internalsOverlap(e.z - o.y, o.z - e.y, n.z - r.y, r.z - n.y));
    },
    isBehind: function (t) {
        var i = this._bounds3d, e = new $i_5(this._translate.x - i.x / 2, this._translate.y - i.y / 2, this._translate.z), o = new $i_5(this._translate.x + i.x / 2, this._translate.y + i.y / 2, this._translate.z + i.z), s = t._bounds3d, n = new $i_5(t._translate.x - s.x / 2, t._translate.y - s.y / 2, t._translate.z), r = new $i_5(t._translate.x + s.x / 2, t._translate.y + s.y / 2, t._translate.z + s.z);
        return o.x > n.x
            ? r.x > e.x
                ? o.y > n.y
                    ? r.y > e.y
                        ? o.z > n.z
                            ? r.z > e.z
                                ? this._translate.x + this._translate.y + this._translate.z >
                                    t._translate.x + t._translate.y + t._translate.z
                                : !0
                            : !1
                        : !0
                    : !1
                : !0
            : !1;
    },
    mouseEventsActive: function (t) {
        return t !== void 0 ? ((this._mouseEventsActive = t), this) : this._mouseEventsActive;
    },
    ignoreCameraComposite: function (t) {
        var i, e = this._children, o = e.length;
        for (this._ignoreCamera = t, i = 0; o > i; i++)
            e[i].ignoreCameraComposite && e[i].ignoreCameraComposite(t);
    },
    newFrame: function () {
        return ige._frameAlternator !== this._frameAlternatorCurrent;
    },
    _transformContext: function (t, i) {
        (t.globalAlpha = this._parent ? this._parent._opacity * this._opacity : this._opacity),
            i
                ? this._localMatrix.getInverse().transformRenderingContext(t)
                : this._localMatrix.transformRenderingContext(t);
    },
    mouseAlwaysInside: function (t) {
        return t !== void 0 ? ((this._mouseAlwaysInside = t), this) : this._mouseAlwaysInside;
    },
    update: function (t, i) {
        this._deathTime === void 0 || this._deathTime > ige._tickStart
            ? this._bornTime !== void 0 && this._bornTime > ige._currentTime
                ? ((this._birthMount = this._parent.id()), this.unMount(), ige.spawnQueue(this))
                : (delete this._streamDataCache,
                    this._processUpdateBehaviours(t, i),
                    (this._velocity.x || this._velocity.y) &&
                        ((this._translate.x += (this._velocity.x / 16) * i),
                            (this._translate.y += (this._velocity.y / 16) * i)),
                    this._timeStream.length &&
                        this._processInterpolate(ige._tickStart - ige.components.network.stream._renderLatency),
                    this.updateTransform(),
                    !this._noAabb && this._aabbDirty && this.aabb(),
                    (this._oldTranslate = this._translate.clone()),
                    (this._frameAlternatorCurrent = ige._frameAlternator))
            : (this._deathCallBack && (this._deathCallBack.apply(this), delete this._deathCallback), this.destroy()),
            $i_58.prototype.update.call(this, t, i);
    },
    tick: function (t, i) {
        this._hidden ||
            !this._inView ||
            (this._parent && !this._parent._inView) ||
            this._streamJustCreated ||
            (this._processTickBehaviours(t),
                this._mouseEventsActive &&
                    (this._processTriggerHitTests()
                        ? ige.components.input.queueEvent(this, this._mouseInTrigger, null)
                        : ige.components.input.mouseMove && this._handleMouseOut(ige.components.input.mouseMove)),
                this._dontRender ||
                    (this._cache || this._compositeCache
                        ? (this._cacheDirty && this._refreshCache(i), this._renderCache(t))
                        : (i || this._transformContext(t), this._renderEntity(t, i))),
                this._streamMode === 1 && this.streamSync(),
                this._compositeCache
                    ? this._cacheDirty &&
                        ($i_58.prototype.tick.call(this, this._cacheCtx), this._renderCache(t), (this._cacheDirty = !1))
                    : $i_58.prototype.tick.call(this, t));
    },
    _processTriggerHitTests: function () {
        var t, i;
        if (ige._currentViewport) {
            if (this._mouseAlwaysInside)
                return !0;
            if ((t = this.mousePosWorld()))
                return ((i =
                    this._triggerPolygon && this[this._triggerPolygon]
                        ? this[this._triggerPolygon](t)
                        : this._parent && this._parent._mountMode === 1
                            ? this.bounds3dPolygon()
                            : this.aabb()),
                    i.xyInside(t.x, t.y));
        }
        return !1;
    },
    _refreshCache: function (t) {
        var i = this._cacheCanvas, e = this._cacheCtx;
        if (this._compositeCache) {
            var o = this.compositeAabb(!0);
            (this._compositeAabbCache = o),
                o.width > 0 && o.height > 0
                    ? ((i.width = Math.ceil(o.width)), (i.height = Math.ceil(o.height)))
                    : ((i.width = 2), (i.height = 2)),
                e.translate(-o.x, -o.y),
                this.emit("compositeReady");
        }
        else
            this._bounds2d.x > 0 && this._bounds2d.y > 0
                ? ((i.width = this._bounds2d.x), (i.height = this._bounds2d.y))
                : ((i.width = 1), (i.height = 1)),
                e.translate(this._bounds2d.x2, this._bounds2d.y2),
                (this._cacheDirty = !1);
        t || this._transformContext(e), this._renderEntity(e, t);
    },
    _renderEntity: function (t) {
        if (this._opacity > 0) {
            this._backgroundPattern &&
                (this._backgroundPatternFill ||
                    (t &&
                        (this._backgroundPatternFill = t.createPattern(this._backgroundPattern.image, this._backgroundPatternRepeat))),
                    this._backgroundPatternFill &&
                        (t.save(),
                            (t.fillStyle = this._backgroundPatternFill),
                            t.translate(-this._bounds2d.x2, -this._bounds2d.y2),
                            t.rect(0, 0, this._bounds2d.x, this._bounds2d.y),
                            this._backgroundPatternTrackCamera &&
                                (t.translate(-ige._currentCamera._translate.x, -ige._currentCamera._translate.y),
                                    t.scale(ige._currentCamera._scale.x, ige._currentCamera._scale.y)),
                            t.fill(),
                            ige._drawCount++,
                            this._backgroundPatternIsoTile &&
                                (t.translate(-Math.floor(this._backgroundPattern.image.width) / 2, -Math.floor(this._backgroundPattern.image.height / 2)),
                                    t.fill(),
                                    ige._drawCount++),
                            t.restore()));
            var i = this._texture;
            i &&
                i._loaded &&
                (i.render(t, this, ige._tickDelta),
                    this._highlight && ((t.globalCompositeOperation = "lighter"), i.render(t, this))),
                this._compositeCache &&
                    ige._currentViewport._drawCompositeBounds &&
                    ((t.fillStyle = "rgba(0, 0, 255, 0.3)"),
                        t.fillRect(-this._bounds2d.x2, -this._bounds2d.y2, this._bounds2d.x, this._bounds2d.y),
                        (t.fillStyle = "#ffffff"),
                        t.fillText("Composite Entity", -this._bounds2d.x2, -this._bounds2d.y2 - 15),
                        t.fillText(this.id(), -this._bounds2d.x2, -this._bounds2d.y2 - 5));
        }
    },
    _renderCache: function (t) {
        if ((t.save(), this._compositeCache)) {
            var i = this._compositeAabbCache;
            t.translate(this._bounds2d.x2 + i.x, this._bounds2d.y2 + i.y),
                this._parent && this._parent._ignoreCamera && ige._currentCamera;
        }
        t.drawImage(this._cacheCanvas, -this._bounds2d.x2, -this._bounds2d.y2),
            ige._currentViewport._drawCompositeBounds &&
                ((t.fillStyle = "rgba(0, 255, 0, 0.5)"),
                    t.fillRect(-this._bounds2d.x2, -this._bounds2d.y2, this._cacheCanvas.width, this._cacheCanvas.height),
                    (t.fillStyle = "#ffffff"),
                    t.fillText("Composite Cache", -this._bounds2d.x2, -this._bounds2d.y2 - 15),
                    t.fillText(this.id(), -this._bounds2d.x2, -this._bounds2d.y2 - 5)),
            ige._drawCount++,
            this._highlight &&
                ((t.globalCompositeOperation = "lighter"),
                    t.drawImage(this._cacheCanvas, -this._bounds2d.x2, -this._bounds2d.y2),
                    ige._drawCount++),
            t.restore();
    },
    _transformPoint: function (t) {
        if (this._parent) {
            var i = new $i_8();
            i.copy(this._parent._worldMatrix), i.multiply(this._localMatrix), i.getInverse().transformCoord(t, this);
        }
        else
            this._localMatrix.transformCoord(t, this);
        return t;
    },
    _transformPoints: function (t) {
        var i, e = t.length;
        while (e--)
            if (((i = t[e]), this._parent)) {
                var o = new $i_8();
                o.copy(this._parent._worldMatrix),
                    o.multiply(this._localMatrix),
                    o.getInverse().transformCoord(i, this);
            }
            else
                this._localMatrix.transformCoord(i, this);
    },
    _stringify: function (t) {
        t === void 0 && (t = {});
        var i, e = $i_58.prototype._stringify.call(this, t);
        for (i in this)
            if (this.hasOwnProperty(i) && this[i] !== void 0)
                switch (i) {
                    case "_opacity":
                        e += ".opacity(" + this.opacity() + ")";
                        break;
                    case "_texture":
                        e += ".texture(ige.$('" + this.texture().id() + "'))";
                        break;
                    case "_cell":
                        e += ".cell(" + this.cell() + ")";
                        break;
                    case "_translate":
                        t.transform !== !1 &&
                            t.translate !== !1 &&
                            (e +=
                                ".translateTo(" +
                                    this._translate.x +
                                    ", " +
                                    this._translate.y +
                                    ", " +
                                    this._translate.z +
                                    ")");
                        break;
                    case "_rotate":
                        t.transform !== !1 &&
                            t.rotate !== !1 &&
                            (e += ".rotateTo(" + this._rotate.x + ", " + this._rotate.y + ", " + this._rotate.z + ")");
                        break;
                    case "_scale":
                        t.transform !== !1 &&
                            t.scale !== !1 &&
                            (e += ".scaleTo(" + this._scale.x + ", " + this._scale.y + ", " + this._scale.z + ")");
                        break;
                    case "_origin":
                        t.origin !== !1 &&
                            (e += ".originTo(" + this._origin.x + ", " + this._origin.y + ", " + this._origin.z + ")");
                        break;
                    case "_anchor":
                        t.anchor !== !1 && (e += ".anchor(" + this._anchor.x + ", " + this._anchor.y + ")");
                        break;
                    case "_width":
                        e +=
                            typeof this.width() == "string"
                                ? ".width('" + this.width() + "')"
                                : ".width(" + this.width() + ")";
                        break;
                    case "_height":
                        e +=
                            typeof this.height() == "string"
                                ? ".height('" + this.height() + "')"
                                : ".height(" + this.height() + ")";
                        break;
                    case "_bounds3d":
                        e += ".bounds3d(" + this._bounds3d.x + ", " + this._bounds3d.y + ", " + this._bounds3d.z + ")";
                        break;
                    case "_deathTime":
                        t.deathTime !== !1 && t.lifeSpan !== !1 && (e += ".deathTime(" + this.deathTime() + ")");
                        break;
                    case "_highlight":
                        e += ".highlight(" + this.highlight() + ")";
                }
        return e;
    },
    destroy: function () {
        (this._alive = !1), this.emit("destroyed", this), $i_58.prototype.destroy.call(this);
    },
    saveSpecialProp: function (t, i) {
        switch (i) {
            case "_texture":
                if (t._texture)
                    return { _texture: t._texture.id() };
                break;
            default:
                return $i_58.prototype.saveSpecialProp.call(this, t, i);
        }
        return void 0;
    },
    loadSpecialProp: function (t, i) {
        switch (i) {
            case "_texture":
                return { _texture: ige.$(t[i]) };
            default:
                return $i_58.prototype.loadSpecialProp.call(this, t, i);
        }
        return void 0;
    },
    mouseMove: function (t) {
        return t ? ((this._mouseMove = t), (this._mouseEventsActive = !0), this) : this._mouseMove;
    },
    mouseOver: function (t) {
        return t ? ((this._mouseOver = t), (this._mouseEventsActive = !0), this) : this._mouseOver;
    },
    mouseOut: function (t) {
        return t ? ((this._mouseOut = t), (this._mouseEventsActive = !0), this) : this._mouseOut;
    },
    mouseUp: function (t) {
        return t ? ((this._mouseUp = t), (this._mouseEventsActive = !0), this) : this._mouseUp;
    },
    mouseDown: function (t) {
        return t ? ((this._mouseDown = t), (this._mouseEventsActive = !0), this) : this._mouseDown;
    },
    mouseWheel: function (t) {
        return t ? ((this._mouseWheel = t), (this._mouseEventsActive = !0), this) : this._mouseWheel;
    },
    mouseMoveOff: function () {
        return delete this._mouseMove, this;
    },
    mouseOverOff: function () {
        return delete this._mouseOver, this;
    },
    mouseOutOff: function () {
        return delete this._mouseOut, this;
    },
    mouseUpOff: function () {
        return delete this._mouseUp, this;
    },
    mouseDownOff: function () {
        return delete this._mouseDown, this;
    },
    mouseWheelOff: function () {
        return delete this._mouseWheel, this;
    },
    triggerPolygon: function (t) {
        return t !== void 0 ? ((this._triggerPolygon = t), this) : this._triggerPolygon;
    },
    mouseEventTrigger: function () {
        this.log("mouseEventTrigger is no longer in use. Please see triggerPolygon() instead.", "warning");
    },
    _handleMouseIn: function (t, i, e) {
        this._mouseStateOver ||
            ((this._mouseStateOver = !0),
                this._mouseOver && this._mouseOver(t, i, e),
                this.emit("mouseOver", [t, i, e])),
            this._mouseMove && this._mouseMove(t, i, e),
            this.emit("mouseMove", [t, i, e]);
    },
    _handleMouseOut: function (t, i, e) {
        (this._mouseStateDown = !1),
            this._mouseStateOver &&
                ((this._mouseStateOver = !1),
                    this._mouseOut && this._mouseOut(t, i, e),
                    this.emit("mouseOut", [t, i, e]));
    },
    _handleMouseWheel: function (t, i, e) {
        this._mouseWheel && this._mouseWheel(t, i, e), this.emit("mouseWheel", [t, i, e]);
    },
    _handleMouseUp: function (t, i, e) {
        (this._mouseStateDown = !1), this._mouseUp && this._mouseUp(t, i, e), this.emit("mouseUp", [t, i, e]);
    },
    _handleMouseDown: function (t, i, e) {
        this._mouseStateDown ||
            ((this._mouseStateDown = !0),
                this._mouseDown && this._mouseDown(t, i, e),
                this.emit("mouseDown", [t, i, e]));
    },
    _mouseInTrigger: function (t, i) {
        ige.components.input.mouseMove && this._handleMouseIn(ige.components.input.mouseMove, t, i),
            ige.components.input.mouseDown && this._handleMouseDown(ige.components.input.mouseDown, t, i),
            ige.components.input.mouseUp && this._handleMouseUp(ige.components.input.mouseUp, t, i),
            ige.components.input.mouseWheel && this._handleMouseWheel(ige.components.input.mouseWheel, t, i);
    },
    debugTransforms: function () {
        return (ige.traceSet(this._translate, "x", 1, function (t) {
            return isNaN(t);
        }),
            ige.traceSet(this._translate, "y", 1, function (t) {
                return isNaN(t);
            }),
            ige.traceSet(this._translate, "z", 1, function (t) {
                return isNaN(t);
            }),
            ige.traceSet(this._rotate, "x", 1, function (t) {
                return isNaN(t);
            }),
            ige.traceSet(this._rotate, "y", 1, function (t) {
                return isNaN(t);
            }),
            ige.traceSet(this._rotate, "z", 1, function (t) {
                return isNaN(t);
            }),
            ige.traceSet(this._scale, "x", 1, function (t) {
                return isNaN(t);
            }),
            ige.traceSet(this._scale, "y", 1, function (t) {
                return isNaN(t);
            }),
            ige.traceSet(this._scale, "z", 1, function (t) {
                return isNaN(t);
            }),
            this);
    },
    velocityTo: function (t, i, e) {
        return (t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._velocity.x = t), (this._velocity.y = i), (this._velocity.z = e))
            : this.log("velocityTo() called with a missing or undefined x, y or z parameter!", "error"),
            this._entity || this);
    },
    velocityBy: function (t, i, e) {
        return (t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._velocity.x += t), (this._velocity.y += i), (this._velocity.z += e))
            : this.log("velocityBy() called with a missing or undefined x, y or z parameter!", "error"),
            this._entity || this);
    },
    translateBy: function (t, i, e) {
        return (t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._translate.x += t), (this._translate.y += i), (this._translate.z += e))
            : this.log("translateBy() called with a missing or undefined x, y or z parameter!", "error"),
            this._entity || this);
    },
    translateTo: function (t, i, e) {
        return (t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._translate.x = t), (this._translate.y = i), (this._translate.z = e))
            : this.log("translateTo() called with a missing or undefined x, y or z parameter!", "error"),
            this._entity || this);
    },
    translateToPoint: function (t) {
        return (t !== void 0
            ? ((this._translate.x = t.x), (this._translate.y = t.y), (this._translate.z = t.z))
            : this.log("translateToPoint() called with a missing or undefined point parameter!", "error"),
            this._entity || this);
    },
    translateToTile: function (t, i, e) {
        if (this._parent && this._parent._tileWidth !== void 0 && this._parent._tileHeight !== void 0) {
            var o;
            (o = e !== void 0 ? e * this._parent._tileWidth : this._translate.z),
                this.translateTo(t * this._parent._tileWidth + this._parent._tileWidth / 2, i * this._parent._tileHeight + this._parent._tileWidth / 2, o);
        }
        else
            this.log("Cannot translate to tile because the entity is not currently mounted to a tile map or the tile map has no tileWidth or tileHeight values.", "warning");
        return this;
    },
    translate: function () {
        return (arguments.length &&
            this.log("You called translate with arguments, did you mean translateTo or translateBy instead of translate?", "warning"),
            (this.x = this._translateAccessorX),
            (this.y = this._translateAccessorY),
            (this.z = this._translateAccessorZ),
            this._entity || this);
    },
    _translateAccessorX: function (t) {
        return t !== void 0 ? ((this._translate.x = t), this._entity || this) : this._translate.x;
    },
    _translateAccessorY: function (t) {
        return t !== void 0 ? ((this._translate.y = t), this._entity || this) : this._translate.y;
    },
    _translateAccessorZ: function (t) {
        return t !== void 0 ? ((this._translate.z = t), this._entity || this) : this._translate.z;
    },
    rotateBy: function (t, i, e) {
        return (t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._rotate.x += t), (this._rotate.y += i), (this._rotate.z += e))
            : this.log("rotateBy() called with a missing or undefined x, y or z parameter!", "error"),
            this._entity || this);
    },
    rotateTo: function (t, i, e) {
        return (t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._rotate.x = t), (this._rotate.y = i), (this._rotate.z = e))
            : this.log("rotateTo() called with a missing or undefined x, y or z parameter!", "error"),
            this._entity || this);
    },
    rotate: function () {
        return (arguments.length &&
            this.log("You called rotate with arguments, did you mean rotateTo or rotateBy instead of rotate?", "warning"),
            (this.x = this._rotateAccessorX),
            (this.y = this._rotateAccessorY),
            (this.z = this._rotateAccessorZ),
            this._entity || this);
    },
    _rotateAccessorX: function (t) {
        return t !== void 0 ? ((this._rotate.x = t), this._entity || this) : this._rotate.x;
    },
    _rotateAccessorY: function (t) {
        return t !== void 0 ? ((this._rotate.y = t), this._entity || this) : this._rotate.y;
    },
    _rotateAccessorZ: function (t) {
        return t !== void 0 ? ((this._rotate.z = t), this._entity || this) : this._rotate.z;
    },
    scaleBy: function (t, i, e) {
        return (t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._scale.x += t), (this._scale.y += i), (this._scale.z += e))
            : this.log("scaleBy() called with a missing or undefined x, y or z parameter!", "error"),
            this._entity || this);
    },
    scaleTo: function (t, i, e) {
        return (t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._scale.x = t), (this._scale.y = i), (this._scale.z = e))
            : this.log("scaleTo() called with a missing or undefined x, y or z parameter!", "error"),
            this._entity || this);
    },
    scale: function () {
        return (arguments.length &&
            this.log("You called scale with arguments, did you mean scaleTo or scaleBy instead of scale?", "warning"),
            (this.x = this._scaleAccessorX),
            (this.y = this._scaleAccessorY),
            (this.z = this._scaleAccessorZ),
            this._entity || this);
    },
    _scaleAccessorX: function (t) {
        return t !== void 0 ? ((this._scale.x = t), this._entity || this) : this._scale.x;
    },
    _scaleAccessorY: function (t) {
        return t !== void 0 ? ((this._scale.y = t), this._entity || this) : this._scale.y;
    },
    _scaleAccessorZ: function (t) {
        return t !== void 0 ? ((this._scale.z = t), this._entity || this) : this._scale.z;
    },
    originBy: function (t, i, e) {
        return (t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._origin.x += t), (this._origin.y += i), (this._origin.z += e))
            : this.log("originBy() called with a missing or undefined x, y or z parameter!", "error"),
            this._entity || this);
    },
    originTo: function (t, i, e) {
        return (t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._origin.x = t), (this._origin.y = i), (this._origin.z = e))
            : this.log("originTo() called with a missing or undefined x, y or z parameter!", "error"),
            this._entity || this);
    },
    origin: function () {
        return ((this.x = this._originAccessorX),
            (this.y = this._originAccessorY),
            (this.z = this._originAccessorZ),
            this._entity || this);
    },
    _originAccessorX: function (t) {
        return t !== void 0 ? ((this._origin.x = t), this._entity || this) : this._origin.x;
    },
    _originAccessorY: function (t) {
        return t !== void 0 ? ((this._origin.y = t), this._entity || this) : this._origin.y;
    },
    _originAccessorZ: function (t) {
        return t !== void 0 ? ((this._origin.z = t), this._entity || this) : this._origin.z;
    },
    _rotatePoint: function (t, i, e) {
        var o = Math.cos(i), s = Math.sin(i);
        return { x: e.x + (t.x - e.x) * o + (t.y - e.y) * s, y: e.y - (t.x - e.x) * s + (t.y - e.y) * o };
    },
    updateTransform: function () {
        if ((this._localMatrix.identity(),
            this._renderMode === 0 &&
                this._localMatrix.multiply(this._localMatrix._newTranslate(this._translate.x, this._translate.y)),
            this._renderMode === 1)) {
            var t = (this._translateIso = new $i_5(this._translate.x, this._translate.y, this._translate.z + this._bounds3d.z / 2).toIso());
            this._parent && this._parent._bounds3d.z && (t.y += this._parent._bounds3d.z / 1.6),
                this._localMatrix.multiply(this._localMatrix._newTranslate(t.x, t.y));
        }
        return (this._localMatrix.rotateBy(this._rotate.z),
            this._localMatrix.scaleBy(this._scale.x, this._scale.y),
            (this._origin.x !== 0.5 || this._origin.y !== 0.5) &&
                this._localMatrix.translateBy(this._bounds2d.x * (0.5 - this._origin.x), this._bounds2d.y * (0.5 - this._origin.y)),
            this._parent
                ? (this._worldMatrix.copy(this._parent._worldMatrix), this._worldMatrix.multiply(this._localMatrix))
                : this._worldMatrix.copy(this._localMatrix),
            this._worldMatrix.compare(this._oldWorldMatrix)
                ? (this._transformChanged = !1)
                : (this._oldWorldMatrix.copy(this._worldMatrix),
                    (this._transformChanged = !0),
                    (this._aabbDirty = !0),
                    (this._bounds3dPolygonDirty = !0)),
            this._oldBounds2d.compare(this._bounds2d) ||
                ((this._aabbDirty = !0), this._oldBounds2d.copy(this._bounds2d)),
            this._oldBounds3d.compare(this._bounds3d) ||
                ((this._bounds3dPolygonDirty = !0), this._oldBounds3d.copy(this._bounds3d)),
            this);
    },
    disableInterpolation: function (t) {
        return t !== void 0 ? ((this._disableInterpolation = t), this) : this._disableInterpolation;
    },
    streamSections: function (t) {
        return t !== void 0 ? ((this._streamSections = t), this) : this._streamSections;
    },
    streamSectionData: function (t, i, e) {
        switch (t) {
            case "transform":
                if (!i)
                    return (this._translate.toString(this._streamFloatPrecision) +
                        "," +
                        this._scale.toString(this._streamFloatPrecision) +
                        "," +
                        this._rotate.toString(this._streamFloatPrecision) +
                        ",");
                var o = i.split(",");
                this._disableInterpolation || e || this._streamJustCreated
                    ? (o[0] && (this._translate.x = parseFloat(o[0])),
                        o[1] && (this._translate.y = parseFloat(o[1])),
                        o[2] && (this._translate.z = parseFloat(o[2])),
                        o[3] && (this._scale.x = parseFloat(o[3])),
                        o[4] && (this._scale.y = parseFloat(o[4])),
                        o[5] && (this._scale.z = parseFloat(o[5])),
                        o[6] && (this._rotate.x = parseFloat(o[6])),
                        o[7] && (this._rotate.y = parseFloat(o[7])),
                        o[8] && (this._rotate.z = parseFloat(o[8])),
                        this._compositeCache && this.cacheDirty(!0))
                    : (o[0] && (o[0] = parseFloat(o[0])),
                        o[1] && (o[1] = parseFloat(o[1])),
                        o[2] && (o[2] = parseFloat(o[2])),
                        o[3] && (o[3] = parseFloat(o[3])),
                        o[4] && (o[4] = parseFloat(o[4])),
                        o[5] && (o[5] = parseFloat(o[5])),
                        o[6] && (o[6] = parseFloat(o[6])),
                        o[7] && (o[7] = parseFloat(o[7])),
                        o[8] && (o[8] = parseFloat(o[8])),
                        this._timeStream.push([
                            ige.components.network.stream._streamDataTime + ige.components.network._latency,
                            o
                        ]),
                        this._timeStream.length > 10 && this._timeStream.shift());
                break;
            case "depth":
                if (i === void 0)
                    return this.depth() + "";
                isClient && this.depth(parseInt(i));
                break;
            case "layer":
                if (i === void 0)
                    return this.layer() + "";
                isClient && this.layer(parseInt(i));
                break;
            case "bounds2d":
                if (i === void 0)
                    return this._bounds2d.x + "," + this._bounds2d.y + "";
                if (isClient) {
                    var s = i.split(",");
                    this.bounds2d(parseFloat(s[0]), parseFloat(s[1]));
                }
                break;
            case "bounds3d":
                if (i === void 0)
                    return this._bounds3d.x + "," + this._bounds3d.y + "," + this._bounds3d.z + "";
                if (isClient) {
                    var s = i.split(",");
                    this.bounds3d(parseFloat(s[0]), parseFloat(s[1]), parseFloat(s[2]));
                }
                break;
            case "hidden":
                if (i === void 0)
                    return this.isHidden() + "";
                isClient && (i == "true" ? this.hide() : this.show());
                break;
            case "mount":
                if (i === void 0) {
                    var n = this.parent();
                    return n ? this.parent().id() : "";
                }
                if (isClient)
                    if (i) {
                        var r = ige.$(i);
                        r && this.mount(r);
                    }
                    else
                        this.unMount();
                break;
            case "origin":
                if (i === void 0)
                    return this._origin.x + "," + this._origin.y + "," + this._origin.z + "";
                if (isClient) {
                    var s = i.split(",");
                    this.origin(parseFloat(s[0]), parseFloat(s[1]), parseFloat(s[2]));
                }
        }
    },
    interpolateValue: function (t, i, e, o, s) {
        var n = i - t, r = s - e, a = o - e, h = a / r;
        return 0 > h ? (h = 0) : h > 1 && (h = 1), n * h + t;
    },
    _processInterpolate: function (t, i) {
        i || (i = 200);
        var e, o, s, n, r, a, h, l = this._timeStream, c = [], _ = 1;
        while (l[_]) {
            if (l[_][0] > t) {
                (e = l[_ - 1]), (o = l[_]);
                break;
            }
            _++;
        }
        o || e
            ? l.splice(0, _ - 1)
            : l.length > 2 &&
                t > l[l.length - 1][0] &&
                ((e = l[l.length - 2]), (o = l[l.length - 1]), l.shift(), this.emit("interpolationLag")),
            o &&
                e &&
                (isNaN(e[0]) && (e[0] = o[0]),
                    (this._timeStreamPreviousData = e),
                    (this._timeStreamNextData = o),
                    (s = o[0] - e[0]),
                    (n = t - e[0]),
                    (this._timeStreamDataDelta = Math.floor(s)),
                    (this._timeStreamOffsetDelta = Math.floor(n)),
                    (r = n / s),
                    (this._timeStreamCurrentInterpolateTime = r),
                    (a = e[1]),
                    (h = o[1]),
                    (c[0] = this.interpolateValue(a[0], h[0], e[0], t, o[0])),
                    (c[1] = this.interpolateValue(a[1], h[1], e[0], t, o[0])),
                    (c[2] = this.interpolateValue(a[2], h[2], e[0], t, o[0])),
                    (c[3] = this.interpolateValue(a[3], h[3], e[0], t, o[0])),
                    (c[4] = this.interpolateValue(a[4], h[4], e[0], t, o[0])),
                    (c[5] = this.interpolateValue(a[5], h[5], e[0], t, o[0])),
                    (c[6] = this.interpolateValue(a[6], h[6], e[0], t, o[0])),
                    (c[7] = this.interpolateValue(a[7], h[7], e[0], t, o[0])),
                    (c[8] = this.interpolateValue(a[8], h[8], e[0], t, o[0])),
                    this.translateTo(parseFloat(c[0]), parseFloat(c[1]), parseFloat(c[2])),
                    this.scaleTo(parseFloat(c[3]), parseFloat(c[4]), parseFloat(c[5])),
                    this.rotateTo(parseFloat(c[6]), parseFloat(c[7]), parseFloat(c[8])),
                    (this._lastUpdate = new Date().getTime()));
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_59);
var $i_60 = $i_59.extend([
    { extension: $i_44, overwrite: !0 },
    { extension: $i_43, overwrite: !0 }
], {
    classId: "$i_60",
    init: function () {
        $i_59.prototype.init.call(this),
            (this._color = "#000000"),
            (this._borderLeftWidth = 0),
            (this._borderTopWidth = 0),
            (this._borderRightWidth = 0),
            (this._borderBottomWidth = 0),
            (this._borderTopLeftRadius = 0),
            (this._borderTopRightRadius = 0),
            (this._borderBottomRightRadius = 0),
            (this._borderBottomLeftRadius = 0),
            (this._backgroundPosition = { x: 0, y: 0 }),
            (this._paddingLeft = 0),
            (this._paddingTop = 0),
            (this._paddingRight = 0),
            (this._paddingBottom = 0);
    },
    disabled: function (t) {
        return t !== void 0 ? ((this._disabled = t), this) : this._disabled;
    },
    overflow: function (t) {
        return t !== void 0 ? ((this._overflow = t), this) : this._overflow;
    },
    _renderBackground: function (t) {
        var i, e, o, s, n = this._bounds2d;
        (this._backgroundColor || this._patternFill) &&
            ((i = -(n.x / 2) | 0),
                (e = -(n.y / 2) | 0),
                (o = n.x),
                (s = n.y),
                t.save(),
                t.beginPath(),
                this._borderTopRightRadius ||
                    !this._borderBottomRightRadius ||
                    this._borderBottomLeftRadius ||
                    this._borderTopLeftRadius
                    ? (t.moveTo(i + this._borderTopLeftRadius, e),
                        t.lineTo(i + o - this._borderTopRightRadius, e),
                        this._borderTopRightRadius > 0 &&
                            t.arcTo(i + o, e, i + o, e + this._borderTopRightRadius, this._borderTopRightRadius),
                        t.lineTo(i + o, e + s - this._borderBottomRightRadius),
                        this._borderBottomRightRadius > 0 &&
                            t.arcTo(i + o, e + s, i + o - this._borderBottomRightRadius, e + s, this._borderBottomRightRadius),
                        t.lineTo(i + this._borderBottomLeftRadius, e + s),
                        this._borderBottomLeftRadius > 0 &&
                            t.arcTo(i, e + s, i, e + s - this._borderBottomLeftRadius, this._borderBottomLeftRadius),
                        t.lineTo(i, e + this._borderTopLeftRadius),
                        this._borderTopLeftRadius > 0 &&
                            t.arcTo(i, e, i + this._borderTopLeftRadius, e, this._borderTopLeftRadius),
                        t.clip())
                    : t.rect(i, e, o, s),
                this._backgroundColor && ((t.fillStyle = this._backgroundColor), t.fill()),
                this._patternFill &&
                    (t.translate(-((o / 2) | 0) + this._backgroundPosition.x, -((s / 2) | 0) + this._backgroundPosition.y),
                        (t.fillStyle = this._patternFill),
                        t.fill()),
                t.restore());
    },
    _renderBorder: function (t) {
        var i, e = this._bounds2d, o = (-e.x2 | 0) + 0.5, s = (-e.y2 | 0) + 0.5, n = e.x - 1, r = e.y - 1;
        if (this._borderTopRightRadius ||
            this._borderBottomRightRadius ||
            this._borderBottomLeftRadius ||
            this._borderTopLeftRadius ||
            this._borderLeftWidth !== this._borderWidth ||
            this._borderTopWidth !== this._borderWidth ||
            this._borderRightWidth !== this._borderWidth ||
            this._borderBottomWidth !== this._borderWidth) {
            var a = function () {
                t.stroke(), t.beginPath();
            };
            (i = Math.PI / 180),
                t.beginPath(),
                this._borderTopWidth &&
                    ((t.strokeStyle = this._borderTopColor),
                        (t.lineWidth = this._borderTopWidth),
                        this._borderTopLeftRadius > 0 &&
                            t.arc(o + this._borderTopLeftRadius, s + this._borderTopLeftRadius, this._borderTopLeftRadius, 225 * i, 270 * i),
                        t.moveTo(o + this._borderTopLeftRadius, s),
                        t.lineTo(o + n - this._borderTopRightRadius, s),
                        this._borderTopRightRadius > 0 &&
                            t.arc(o + n - this._borderTopRightRadius, s + this._borderTopRightRadius, this._borderTopRightRadius, -90 * i, -44 * i)),
                (this._borderRightWidth &&
                    this._borderTopColor == this._borderRightColor &&
                    this._borderTopWidth == this._borderRightWidth) ||
                    a(),
                this._borderRightWidth &&
                    ((t.strokeStyle = this._borderRightColor),
                        (t.lineWidth = this._borderRightWidth),
                        this._borderTopRightRadius > 0 &&
                            t.arc(o + n - this._borderTopRightRadius, s + this._borderTopRightRadius, this._borderTopRightRadius, -45 * i, 0),
                        t.moveTo(o + n, s + this._borderTopRightRadius),
                        t.lineTo(o + n, s + r - this._borderBottomRightRadius),
                        this._borderBottomRightRadius > 0 &&
                            t.arc(o + n - this._borderBottomRightRadius, s + r - this._borderBottomRightRadius, this._borderTopRightRadius, 0, 46 * i)),
                (this._borderBottomWidth &&
                    this._borderRightColor == this._borderBottomColor &&
                    this._borderRightWidth == this._borderBottomWidth) ||
                    a(),
                this._borderBottomWidth &&
                    ((t.strokeStyle = this._borderBottomColor),
                        (t.lineWidth = this._borderBottomWidth),
                        this._borderBottomRightRadius > 0 &&
                            t.arc(o + n - this._borderBottomRightRadius, s + r - this._borderBottomRightRadius, this._borderBottomRightRadius, 45 * i, 90 * i),
                        t.moveTo(o + n - this._borderBottomRightRadius, s + r),
                        t.lineTo(o + this._borderBottomLeftRadius, s + r),
                        this._borderBottomLeftRadius > 0 &&
                            t.arc(o + this._borderBottomLeftRadius, s + r - this._borderBottomLeftRadius, this._borderBottomLeftRadius, 90 * i, 136 * i)),
                (this._borderLeftWidth &&
                    this._borderBottomColor == this._borderLeftColor &&
                    this._borderBottomWidth == this._borderLeftWidth) ||
                    a(),
                this._borderLeftWidth &&
                    ((t.strokeStyle = this._borderLeftColor),
                        (t.lineWidth = this._borderLeftWidth),
                        this._borderBottomLeftRadius > 0 &&
                            t.arc(o + this._borderBottomLeftRadius, s + r - this._borderBottomLeftRadius, this._borderBottomLeftRadius, 135 * i, 180 * i),
                        t.moveTo(o, s + r - this._borderBottomLeftRadius),
                        t.lineTo(o, s + this._borderTopLeftRadius),
                        this._borderTopLeftRadius > 0 &&
                            t.arc(o + this._borderTopLeftRadius, s + this._borderTopLeftRadius, this._borderTopLeftRadius, 180 * i, 226 * i)),
                t.stroke();
        }
        else
            (t.strokeStyle = this._borderColor), (t.lineWidth = this._borderWidth), t.strokeRect(o, s, n, r);
    },
    cell: function (t) {
        var i = $i_59.prototype.cell.call(this, t);
        return (i === this && this._patternTexture && this.backgroundImage(this._patternTexture, this._patternRepeat), i);
    },
    mount: function (t) {
        var i = $i_59.prototype.mount.call(this, t);
        return (this._parent &&
            (this._updateUiPosition && this._updateUiPosition(),
                this._children.length && this.updateUiChildren()),
            i);
    },
    tick: function (t, i) {
        if (!this._hidden && this._inView && (!this._parent || this._parent._inView) && !this._streamJustCreated) {
            if ((i || this._transformContext(t),
                this._renderBackground(t),
                this._renderBorder(t),
                this._overflow === "hidden")) {
                var e = this._bounds2d, o = (-(e.x / 2) + this._paddingLeft) | 0, s = (-(e.y / 2) + this._paddingTop) | 0, n = e.x + this._paddingRight, r = e.y + this._paddingBottom;
                t.rect(o, s, n, r), t.clip();
            }
            t.translate(this._paddingLeft, this._paddingTop), $i_59.prototype.tick.call(this, t, !0);
        }
    },
    _resizeEvent: function (t) {
        this._updateUiPosition && this._updateUiPosition(), $i_59.prototype._resizeEvent.call(this, t);
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_60);
var $i_61 = $i_60.extend({
    classId: "$i_61",
    init: function () {
        var t = this;
        $i_60.prototype.init.call(this),
            ige.ui.registerElement(this),
            (this._focused = !1),
            (this._allowHover = !0),
            (this._allowFocus = !0),
            (this._allowActive = !0);
        var i = function () {
            t._updateStyle();
        };
        this.on("mouseOver", function () {
            this._allowHover ? (i(), ige.components.input.stopPropagation()) : (this._mouseStateOver = !1);
        }),
            this.on("mouseOut", function () {
                this._allowHover ? (i(), ige.components.input.stopPropagation()) : (this._mouseStateOver = !1);
            }),
            this.on("mouseDown", function () {
                this._allowActive ? (i(), ige.components.input.stopPropagation()) : (this._mouseStateDown = !1);
            }),
            this.on("mouseUp", function () {
                this._allowFocus
                    ? t.focus()
                        ? ige.components.input.stopPropagation()
                        : i()
                    : this._allowActive && i();
            }),
            this.mouseEventsActive(!0);
    },
    allowHover: function (t) {
        return t !== void 0 ? ((this._allowHover = t), this) : this._allowHover;
    },
    allowFocus: function (t) {
        return t !== void 0 ? ((this._allowFocus = t), this) : this._allowFocus;
    },
    allowActive: function (t) {
        return t !== void 0 ? ((this._allowActive = t), this) : this._allowActive;
    },
    styleClass: function (t) {
        return t !== void 0
            ? ((t = "." + t),
                this._styleClass && this._styleClass !== t && ige.ui.unRegisterElementStyle(this),
                (this._styleClass = t),
                ige.ui.registerElementStyle(this),
                this._updateStyle(),
                this)
            : this._styleClass;
    },
    _updateStyle: function () {
        this._processStyle(this._classId),
            this._processStyle(this._styleClass),
            this._processStyle("#" + this._id),
            this._focused &&
                (this._processStyle(this._classId, "focus"),
                    this._processStyle(this._styleClass, "focus"),
                    this._processStyle("#" + this._id, "focus")),
            this._mouseStateOver &&
                (this._processStyle(this._classId, "hover"),
                    this._processStyle(this._styleClass, "hover"),
                    this._processStyle("#" + this._id, "hover")),
            this._mouseStateDown &&
                (this._processStyle(this._classId, "active"),
                    this._processStyle(this._styleClass, "active"),
                    this._processStyle("#" + this._id, "active"));
    },
    _processStyle: function (t, i) {
        if (t) {
            i && (t += ":" + i);
            var e = ige.ui.style(t);
            e && this.applyStyle(e);
        }
    },
    applyStyle: function (t) {
        var i;
        if (t !== void 0)
            for (var e in t)
                t.hasOwnProperty(e) &&
                    typeof this[e] == "function" &&
                    ((i = t[e] instanceof Array ? t[e] : [t[e]]), this[e].apply(this, i));
        return this;
    },
    focus: function () {
        return ige.ui.focus(this) ? (this._updateStyle(), !0) : !1;
    },
    blur: function () {
        return ige.ui.blur(this) ? (this._updateStyle(), !0) : !1;
    },
    focused: function () {
        return this._focused;
    },
    value: function (t) {
        return t !== void 0 ? ((this._value = t), this) : this._value;
    },
    _mounted: function () {
        this._updateStyle();
    },
    destroy: function () {
        ige.ui.unRegisterElement(this), $i_60.prototype.destroy.call(this);
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_61);
var $i_62 = $i_60.extend({
    classId: "$i_62",
    init: function () {
        $i_60.prototype.init.call(this),
            (this._renderText = void 0),
            (this._text = void 0),
            (this._textAlignX = 1),
            (this._textAlignY = 1),
            (this._textLineSpacing = 0),
            (this._nativeMode = !1),
            this.cache(!0);
    },
    width: function (t, i, e, o) {
        t !== void 0 && this._bounds2d.x !== t && this.clearCache();
        var s = $i_60.prototype.width.call(this, t, i, e, o);
        return this._autoWrap && this._applyAutoWrap(), s;
    },
    height: function (t, i, e, o) {
        return (t !== void 0 && this._bounds2d.y !== t && this.clearCache(), $i_60.prototype.height.call(this, t, i, e, o));
    },
    text: function (t) {
        if (t !== void 0) {
            var i = !1;
            return ((t += ""),
                this._text !== t && (this.clearCache(), (i = !0)),
                (this._text = t),
                this._autoWrap && i ? this._applyAutoWrap() : (this._renderText = t),
                this);
        }
        return this._text;
    },
    bindData: function (t, i, e, o) {
        return (t !== void 0 &&
            i !== void 0 &&
            ((this._bindDataObject = t),
                (this._bindDataProperty = i),
                (this._bindDataPreText = e || ""),
                (this._bindDataPostText = o || "")),
            this);
    },
    textAlignX: function (t) {
        return t !== void 0
            ? (this._textAlignX !== t && this.clearCache(), (this._textAlignX = t), this)
            : this._textAlignX;
    },
    textAlignY: function (t) {
        return t !== void 0
            ? (this._textAlignY !== t && this.clearCache(), (this._textAlignY = t), this)
            : this._textAlignY;
    },
    textLineSpacing: function (t) {
        return t !== void 0
            ? (this._textLineSpacing !== t && this.clearCache(), (this._textLineSpacing = t), this)
            : this._textLineSpacing;
    },
    colorOverlay: function (t) {
        return t !== void 0
            ? (this._colorOverlay !== t && this.clearCache(), (this._colorOverlay = t), this)
            : this._colorOverlay;
    },
    color: function (t) {
        return this.colorOverlay(t);
    },
    clearCache: function () {
        this._cache && this.cacheDirty(!0),
            this._texture &&
                this._texture._caching &&
                this._texture._cacheText[this._renderText] &&
                delete this._texture._cacheText[this._renderText];
    },
    nativeFont: function (t) {
        if (t !== void 0) {
            this._nativeFont !== t && this.clearCache(), (this._nativeFont = t);
            var i = new $i_53($i_57);
            return this.texture(i), (this._nativeMode = !0), this;
        }
        return this._nativeFont;
    },
    nativeStroke: function (t) {
        return t !== void 0
            ? (this._nativeStroke !== t && this.clearCache(), (this._nativeStroke = t), this)
            : this._nativeStroke;
    },
    nativeStrokeColor: function (t) {
        return t !== void 0
            ? (this._nativeStrokeColor !== t && this.clearCache(), (this._nativeStrokeColor = t), this)
            : this._nativeStrokeColor;
    },
    autoWrap: function (t) {
        return t !== void 0
            ? ((this._autoWrap = t), this._text && (this._applyAutoWrap(), this.clearCache()), this)
            : this._autoWrap;
    },
    _applyAutoWrap: function () {
        if (this._text) {
            var t, i, e, o = this._text.replace(/\n/g, " "), s = [], n = "";
            for (t = o.split(" "), i = 0; t.length > i; i++)
                n && (n += " "),
                    (n += t[i]),
                    (e = this.measureTextWidth(n)),
                    this._bounds2d.x > e ? s.push(t[i]) : ((n = t[i]), s.push("\n" + t[i]));
            this._renderText = s.join(" ");
        }
    },
    measureTextWidth: function (t) {
        return ((t = t || this._text),
            this._texture._renderMode === 0
                ? this._texture.measureTextWidth(t)
                : this._texture.script.measureTextWidth(t, this));
    },
    tick: function (t) {
        this._bindDataObject &&
            this._bindDataProperty &&
            (this._bindDataObject._alive === !1
                ? delete this._bindDataObject
                : this.text(this._bindDataPreText + this._bindDataObject[this._bindDataProperty] + this._bindDataPostText)),
            $i_60.prototype.tick.call(this, t);
    },
    _stringify: function () {
        var t, i = $i_60.prototype._stringify.call(this);
        for (t in this)
            if (this.hasOwnProperty(t) && this[t] !== void 0)
                switch (t) {
                    case "_text":
                        i += ".text(" + this.text() + ")";
                        break;
                    case "_textAlignX":
                        i += ".textAlignX(" + this.textAlignX() + ")";
                        break;
                    case "_textAlignY":
                        i += ".textAlignY(" + this.textAlignY() + ")";
                        break;
                    case "_textLineSpacing":
                        i += ".textLineSpacing(" + this.textLineSpacing() + ")";
                }
        return i;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_62);
var $i_63 = $i_60.extend({
    classId: "$i_63",
    $i_63: !0,
    init: function () {
        $i_60.prototype.init.call(this),
            (this._currentDelta = 0),
            (this._started = !1),
            (this._particles = []),
            this.applyDepthToParticles(!0),
            this.applyLayerToParticles(!0),
            this.quantityTimespan(1e3),
            this.quantityBase(10),
            this.quantityVariance(0, 0),
            this.translateBaseX(0),
            this.translateBaseY(0),
            this.translateBaseZ(0),
            this.translateVarianceX(0, 0),
            this.translateVarianceY(0, 0),
            this.translateVarianceZ(0, 0),
            this.rotateBase(0),
            this.rotateVariance(0, 0),
            this.deathRotateBase(0),
            this.deathRotateVariance(0, 0),
            this.scaleBaseX(1),
            this.scaleBaseY(1),
            this.scaleBaseZ(1),
            this.scaleVarianceX(0, 0),
            this.scaleVarianceY(0, 0),
            this.scaleVarianceZ(0, 0),
            this.scaleLockAspect(!1),
            this.deathScaleBaseX(0),
            this.deathScaleBaseY(0),
            this.deathScaleBaseZ(0),
            this.deathScaleVarianceX(0, 0),
            this.deathScaleVarianceY(0, 0),
            this.deathScaleVarianceZ(0, 0),
            this.deathScaleLockAspect(!1),
            this.opacityBase(1),
            this.opacityVariance(0, 0),
            this.deathOpacityBase(1),
            this.deathOpacityVariance(0, 0),
            this.lifeBase(1e3),
            this.lifeVariance(0, 0);
    },
    particle: function (t) {
        return (this._particle = t), this;
    },
    particleMountTarget: function (t) {
        return (this._particleMountTarget = t), this;
    },
    applyDepthToParticles: function (t) {
        return (this._applyDepthToParticles = t), this;
    },
    applyLayerToParticles: function (t) {
        return (this._applyLayerToParticles = t), this;
    },
    quantityTimespan: function (t) {
        return (this._quantityTimespan = t), this;
    },
    quantityBase: function (t) {
        return (this._quantityBase = t), this;
    },
    quantityVariance: function (t, i) {
        return (this._quantityVariance = [t, i]), this;
    },
    quantityMax: function (t) {
        return (this._quantityMax = t), (this._quantityProduced = 0), this;
    },
    translateBaseX: function (t) {
        return (this._translateBaseX = t), this;
    },
    translateBaseY: function (t) {
        return (this._translateBaseY = t), this;
    },
    translateBaseZ: function (t) {
        return (this._translateBaseZ = t), this;
    },
    translateVarianceX: function (t, i) {
        return (this._translateVarianceX = [t, i]), this;
    },
    translateVarianceY: function (t, i) {
        return (this._translateVarianceY = [t, i]), this;
    },
    translateVarianceZ: function (t, i) {
        return (this._translateVarianceZ = [t, i]), this;
    },
    rotateBase: function (t) {
        return (this._rotateBase = t), this;
    },
    rotateVariance: function (t, i) {
        return (this._rotateVariance = [t, i]), this;
    },
    deathRotateBase: function (t) {
        return (this._deathRotateBase = t), this;
    },
    deathRotateVariance: function (t, i) {
        return (this._deathRotateVariance = [t, i]), this;
    },
    scaleBaseX: function (t) {
        return (this._scaleBaseX = t), this;
    },
    scaleBaseY: function (t) {
        return (this._scaleBaseY = t), this;
    },
    scaleBaseZ: function (t) {
        return (this._scaleBaseZ = t), this;
    },
    scaleVarianceX: function (t, i) {
        return (this._scaleVarianceX = [t, i]), this;
    },
    scaleVarianceY: function (t, i) {
        return (this._scaleVarianceY = [t, i]), this;
    },
    scaleVarianceZ: function (t, i) {
        return (this._scaleVarianceZ = [t, i]), this;
    },
    scaleLockAspect: function (t) {
        return (this._scaleLockAspect = t), this;
    },
    deathScaleBaseX: function (t) {
        return (this._deathScaleBaseX = t), this;
    },
    deathScaleBaseY: function (t) {
        return (this._deathScaleBaseY = t), this;
    },
    deathScaleBaseZ: function (t) {
        return (this._deathScaleBaseZ = t), this;
    },
    deathScaleVarianceX: function (t, i) {
        return (this._deathScaleVarianceX = [t, i]), this;
    },
    deathScaleVarianceY: function (t, i) {
        return (this._deathScaleVarianceY = [t, i]), this;
    },
    deathScaleVarianceZ: function (t, i) {
        return (this._deathScaleVarianceZ = [t, i]), this;
    },
    deathScaleLockAspect: function (t) {
        return (this._deathScaleLockAspect = t), this;
    },
    opacityBase: function (t) {
        return (this._opacityBase = t), this;
    },
    opacityVariance: function (t, i) {
        return (this._opacityVariance = [t, i]), this;
    },
    deathOpacityBase: function (t) {
        return (this._deathOpacityBase = t), this;
    },
    deathOpacityVariance: function (t, i) {
        return (this._deathOpacityVariance = [t, i]), this;
    },
    lifeBase: function (t) {
        return (this._lifeBase = t), this;
    },
    lifeVariance: function (t, i) {
        return (this._lifeVariance = [t, i]), this;
    },
    velocityVector: function (t, i, e) {
        return (this._velocityVector = { base: t, min: i, max: e }), this;
    },
    linearForceVector: function (t, i, e) {
        return (this._linearForceVector = { base: t, min: i, max: e }), this;
    },
    start: function () {
        return (this._particle
            ? (this.updateTransform(),
                (this._quantityTimespan = this._quantityTimespan !== void 0 ? this._quantityTimespan : 1e3),
                (this._maxParticles = this.baseAndVarianceValue(this._quantityBase, this._quantityVariance, !0)),
                (this._particlesPerTimeVector = this._quantityTimespan / this._maxParticles),
                (this._currentDelta = 0),
                (this._quantityProduced = 0),
                (this._started = !0))
            : this.log("Cannot start particle emitter because no particle class was specified with a call to particle()", "error"),
            this);
    },
    updateSettings: function () {
        (this._maxParticles = this.baseAndVarianceValue(this._quantityBase, this._quantityVariance, !0)),
            (this._particlesPerTimeVector = this._quantityTimespan / this._maxParticles);
    },
    stop: function () {
        return (this._started = !1), this;
    },
    stopAndKill: function () {
        this._started = !1;
        var t = this._particles, i = t.length;
        while (i--)
            t[i].destroy();
        return (this._particles = []), this;
    },
    baseAndVarianceValue: function (t, i, e) {
        (t = t || 0), (i = i || [0, 0]);
        var o = 0;
        return (o = e ? Math.floor(i[0] + Math.random() * (i[1] - i[0])) : i[0] + Math.random() * (i[1] - i[0])), t + o;
    },
    vectorFromBaseMinMax: function (t) {
        if (t.min && t.max) {
            var i = t.base, e = t.min, o = t.max, s = {};
            return ((s.x = i.x + (e.x + Math.random() * (o.x - e.x))),
                (s.y = i.y + (e.y + Math.random() * (o.y - e.y))),
                (s.z = i.z + (e.z + Math.random() * (o.z - e.z))),
                s);
        }
        return t.base;
    },
    tick: function (t) {
        if (((this._currentDelta += ige._tickDelta),
            this._parent && this._started && (!this._quantityMax || this._quantityMax > this._quantityProduced))) {
            var i, e, o, s, n, r, a, h, l, c, _, m, u, p, d, y, x, f, g, b, v, w, C, D, B, S, I;
            if ((this._currentDelta > this._quantityTimespan && (this._currentDelta = this._quantityTimespan),
                this._currentDelta >= this._particlesPerTimeVector &&
                    ((i = (this._currentDelta / this._particlesPerTimeVector) | 0),
                        (this._currentDelta -= this._particlesPerTimeVector * i),
                        i)))
                while (i--) {
                    if (this._quantityMax && (this._quantityProduced++, this._quantityProduced >= this._quantityMax)) {
                        this.stop();
                        break;
                    }
                    for (e = this.baseAndVarianceValue(this._translateBaseX, this._translateVarianceX, !0),
                        o = this.baseAndVarianceValue(this._translateBaseY, this._translateVarianceY, !0),
                        s = this.baseAndVarianceValue(this._translateBaseZ, this._translateVarianceZ, !0),
                        this._velocityVector &&
                            ((n = this.vectorFromBaseMinMax(this._velocityVector)),
                                (h = n.x),
                                (l = n.y),
                                (c = this._worldMatrix.matrix[0]),
                                (_ = this._worldMatrix.matrix[3]),
                                (r = h * c - l * _),
                                (a = l * c + h * _),
                                (n.x = r),
                                (n.y = a)),
                        m = this.baseAndVarianceValue(this._scaleBaseX, this._scaleVarianceX, !1),
                        p = u = m,
                        this._scaleLockAspect ||
                            ((u = this.baseAndVarianceValue(this._scaleBaseY, this._scaleVarianceY, !1)),
                                (p = this.baseAndVarianceValue(this._scaleBaseZ, this._scaleVarianceZ, !1))),
                        d = this.baseAndVarianceValue(this._rotateBase, this._rotateVariance, !0),
                        y = this.baseAndVarianceValue(this._opacityBase, this._opacityVariance, !1),
                        x = this.baseAndVarianceValue(this._lifeBase, this._lifeVariance, !0),
                        this._linearForceVector &&
                            ((f = this.vectorFromBaseMinMax(this._linearForceVector)),
                                (h = f.x),
                                (l = f.y),
                                (c = this._worldMatrix.matrix[0]),
                                (_ = this._worldMatrix.matrix[3]),
                                (r = h * c - l * _),
                                (a = l * c + h * _),
                                (f.x = r),
                                (f.y = a)),
                        this._deathScaleBaseX !== void 0 &&
                            (g = this.baseAndVarianceValue(this._deathScaleBaseX, this._deathScaleVarianceX, !1)),
                        this._deathScaleBaseY === void 0 ||
                            this._deathScaleLockAspect ||
                            (b = this.baseAndVarianceValue(this._deathScaleBaseY, this._deathScaleVarianceY, !1)),
                        this._deathScaleBaseZ === void 0 ||
                            this._deathScaleLockAspect ||
                            (v = this.baseAndVarianceValue(this._deathScaleBaseZ, this._deathScaleVarianceZ, !1)),
                        this._deathScaleLockAspect && (v = b = g),
                        this._deathRotateBase !== void 0 &&
                            (w = this.baseAndVarianceValue(this._deathRotateBase, this._deathRotateVariance, !0)),
                        this._deathOpacityBase !== void 0 &&
                            (C = this.baseAndVarianceValue(this._deathOpacityBase, this._deathOpacityVariance, !1)),
                        D = new this._particle(this),
                        this._ignoreCamera
                            ? ((e += this._translate.x), (o += this._translate.y))
                            : ((e += this._worldMatrix.matrix[2]), (o += this._worldMatrix.matrix[5])),
                        s += this._translate.z,
                        m *= this._scale.x,
                        u *= this._scale.y,
                        p *= this._scale.z,
                        g *= this._scale.x,
                        b *= this._scale.y,
                        v *= this._scale.z,
                        D.translateTo(e, o, s),
                        D.rotateTo(0, 0, Math.radians(d)),
                        D.scaleTo(m, u, p),
                        D.opacity(y),
                        this._applyDepthToParticles && D.depth(this._depth),
                        this._applyLayerToParticles && D.layer(this._layer),
                        typeof n == "object" && D.velocity.vector3(n, !1),
                        typeof f == "object" && D.velocity.linearForceVector3(f, !1),
                        B = [],
                        w !== void 0 &&
                            B.push(new $i_52()
                                .targetObj(D._rotate)
                                .properties({ z: Math.radians(w) })
                                .duration(x)),
                        C !== void 0 && B.push(new $i_52().targetObj(D).properties({ _opacity: C }).duration(x)),
                        S = {},
                        g !== void 0 && (S.x = g),
                        b !== void 0 && (S.y = b),
                        v !== void 0 && (S.z = v),
                        (S.x || S.y || S.z) && B.push(new $i_52().targetObj(D._scale).properties(S).duration(x)),
                        typeof x == "number" && D.lifeSpan(x),
                        this._particles.push(D),
                        D.mount(this._particleMountTarget || this._parent),
                        I = 0; B.length > I; I++)
                        B[I].start();
                }
        }
        $i_60.prototype.tick.call(this, t);
    },
    particles: function () {
        return this._particles;
    },
    _stringify: function () {
        var t = $i_60.prototype._stringify.call(this);
        return t;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_63);
var $i_64 = $i_59.extend({
    classId: "$i_64",
    init: function (t) {
        (this._emitter = t), $i_59.prototype.init.call(this), this.addComponent($i_11);
    },
    destroy: function () {
        this._emitter !== void 0 && this._emitter._particles.pull(this), $i_59.prototype.destroy.call(this);
    }
}), $i_65 = $i_2.extend({
    classId: "$i_65",
    init: function (t) {
        this._mapData = t || [];
    },
    tileData: function (t, i, e) {
        if (t !== void 0 && i !== void 0) {
            if (e !== void 0)
                return (this._mapData[i] = this._mapData[i] || []), (this._mapData[i][t] = e), this;
            if (this._mapData[i])
                return this._mapData[i][t];
        }
        return void 0;
    },
    clearData: function (t, i) {
        return t !== void 0 && i !== void 0 && this._mapData[i] !== void 0 ? (delete this._mapData[i][t], !0) : !1;
    },
    collision: function (t, i, e, o) {
        var s, n;
        if ((e === void 0 && (e = 1), o === void 0 && (o = 1), t !== void 0 && i !== void 0))
            for (n = 0; o > n; n++)
                for (s = 0; e > s; s++)
                    if (this.tileData(t + s, i + n))
                        return !0;
        return !1;
    },
    collisionWith: function (t, i, e, o, s) {
        var n, r;
        if ((e === void 0 && (e = 1), o === void 0 && (o = 1), t !== void 0 && i !== void 0))
            for (r = 0; o > r; r++)
                for (n = 0; e > n; n++)
                    if (this.tileData(t + n, i + r) === s)
                        return !0;
        return !1;
    },
    collisionWithOnly: function (t, i, e, o, s) {
        var n, r, a, h = !1;
        if ((e === void 0 && (e = 1), o === void 0 && (o = 1), t !== void 0 && i !== void 0))
            for (r = 0; o > r; r++)
                for (n = 0; e > n; n++)
                    if ((a = this.tileData(t + n, i + r))) {
                        if (this.tileData(t + n, i + r) !== s)
                            return !1;
                        h = !0;
                    }
        return h;
    },
    mapData: function (t, i, e) {
        if (t !== void 0) {
            if (i || e) {
                var o, s;
                for (s in t)
                    for (o in t[s])
                        this._mapData[e + parseInt(s)][i + parseInt(o)] = t[s][o];
            }
            else
                this._mapData = t;
            return this;
        }
        return this._mapData;
    },
    sortedMapDataAsArray: function () {
        var t, i, e, o, s, n, r = this.mapData(), a = {};
        for (o = this._sortKeys(r), s = 0; o.length > s; s++)
            for (i = o[s], e = this._sortKeys(r[i]), a[i] = a[i] || {}, n = 0; e.length > n; n++)
                (t = e[n]), (a[i][t] = r[i][t]);
        return a;
    },
    _sortKeys: function (t) {
        var i = [];
        for (var e in t)
            i.push(e);
        return i.sort(), i;
    },
    mapDataString: function () {
        return JSON.stringify(this.mapData());
    },
    insertMapData: function () { },
    rotateData: function (t, i) {
        switch (i) {
            case -90:
                break;
            case 180:
                break;
            case 90:
            default:
        }
    },
    translateDataBy: function (t, i) {
        var e, o, s, n, r, a = this.mapData(), h = [];
        for (o in a)
            if (a.hasOwnProperty(o)) {
                (n = parseInt(o, 10)), (s = a[n]), (h[n + i] = h[n + i] || {});
                for (e in s)
                    s.hasOwnProperty(e) && ((r = parseInt(e, 10)), (h[n + i][r + t] = a[o][e]));
            }
        this.mapData(h, 0, 0);
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_65);
var $i_66 = $i_59.extend({
    classId: "$i_66",
    $i_66: !0,
    init: function (t, i) {
        $i_59.prototype.init.call(this), (t = t !== void 0 ? t : 40), (i = i !== void 0 ? i : 40);
        var e = this, o = new $i_53($i_66SmartTexture);
        e.texture(o),
            (e.map = new $i_65()),
            (e._adjustmentMatrix = new $i_8()),
            e.tileWidth(t),
            e.tileHeight(i),
            e.gridSize(3, 3),
            (e._drawGrid = 0),
            (e._gridColor = "#ffffff");
    },
    highlightOccupied: function (t) {
        return t !== void 0 ? ((this._highlightOccupied = t), this) : this._highlightOccupied;
    },
    highlightTileRect: function (t) {
        return t !== void 0 ? ((this._highlightTileRect = t), this) : this._highlightTileRect;
    },
    tileWidth: function (t) {
        return t !== void 0
            ? ((this._tileWidth = t),
                this._gridSize &&
                    this._gridSize.x &&
                    (this.width(this._tileWidth * this._gridSize.x), this._updateAdjustmentMatrix()),
                this)
            : this._tileWidth;
    },
    tileHeight: function (t) {
        return t !== void 0
            ? ((this._tileHeight = t),
                this._gridSize &&
                    this._gridSize.y &&
                    (this.height(this._tileHeight * this._gridSize.y), this._updateAdjustmentMatrix()),
                this)
            : this._tileHeight;
    },
    gridSize: function (t, i) {
        return t !== void 0 && i !== void 0
            ? ((this._gridSize = new $i_4(t, i)),
                this._mountMode === 0 && this._tileWidth && this.width(this._tileWidth * this._gridSize.x),
                this._mountMode === 1 && this._tileWidth && this.width(this._tileWidth * 2 * this._gridSize.x),
                this._tileHeight && this.height(this._tileHeight * this._gridSize.y),
                this._updateAdjustmentMatrix(),
                this)
            : this._gridSize;
    },
    drawGrid: function (t) {
        return t !== void 0 ? ((this._drawGrid = t), this) : this._drawGrid;
    },
    gridColor: function (t) {
        return t !== void 0 ? ((this._gridColor = t), this) : this._gridColor;
    },
    occupyTile: function (t, i, e, o, s) {
        var n, r;
        if ((e === void 0 && (e = 1),
            o === void 0 && (o = 1),
            (t = Math.floor(t)),
            (i = Math.floor(i)),
            (e = Math.floor(e)),
            (o = Math.floor(o)),
            t !== void 0 && i !== void 0)) {
            for (n = 0; e > n; n++)
                for (r = 0; o > r; r++)
                    this.map.tileData(t + n, i + r, s);
            s._classId && (s._occupiedRect = new $i_7(t, i, e, o));
        }
        return this;
    },
    unOccupyTile: function (t, i, e, o) {
        var s, n, r;
        if ((e === void 0 && (e = 1),
            o === void 0 && (o = 1),
            (t = Math.floor(t)),
            (i = Math.floor(i)),
            (e = Math.floor(e)),
            (o = Math.floor(o)),
            t !== void 0 && i !== void 0))
            for (s = 0; e > s; s++)
                for (n = 0; o > n; n++)
                    (r = this.map.tileData(t + s, i + n)),
                        r && r._occupiedRect && delete r._occupiedRect,
                        this.map.clearData(t + s, i + n);
        return this;
    },
    isTileOccupied: function (t, i, e, o) {
        return e === void 0 && (e = 1), o === void 0 && (o = 1), this.map.collision(t, i, e, o);
    },
    tileOccupiedBy: function (t, i) {
        return this.map.tileData(t, i);
    },
    pointToTile: function (t) {
        var i, e, o, s = t.x, n = t.y;
        return (this._mountMode === 0 &&
            ((i = s), (e = n), (o = new $i_5(Math.floor(i / this._tileWidth), Math.floor(e / this._tileWidth), 0))),
            this._mountMode === 1 &&
                ((i = s),
                    (e = n),
                    (o = new $i_5(Math.floor(i / this._tileWidth), Math.floor(e / this._tileHeight), 0))),
            o);
    },
    mouseTilePoint: function () {
        var t = this.mouseToTile().thisMultiply(this._tileWidth, this._tileHeight, 1);
        return (t.x += this._tileWidth / 2), (t.y += this._tileHeight / 2), t;
    },
    tileToPoint: function (t, i) {
        var e;
        return (this._mountMode === 0 &&
            ((e = new $i_5(t, i, 0).thisMultiply(this._tileWidth, this._tileHeight, 1)),
                (e.x -= this._bounds2d.x2 - this._tileWidth / 2),
                (e.y -= this._bounds2d.y2 - this._tileHeight / 2)),
            this._mountMode === 1 &&
                ((e = new $i_5(t * this._tileWidth + this._tileWidth / 2, i * this._tileHeight + this._tileHeight / 2, 0)),
                    (e.x -= this._bounds2d.x2 / 2),
                    (e.y -= this._bounds2d.y2)),
            (e.x2 = e.x / 2),
            (e.y2 = e.y / 2),
            e);
    },
    mouseToTile: function () {
        var t;
        return (t =
            this._mountMode === 0 ? this.pointToTile(this.mousePos()) : this.pointToTile(this.mousePos().to2d()));
    },
    scanRects: function (t) {
        var i, e, o = [], s = this.map._mapData.clone();
        for (e in s)
            if (s.hasOwnProperty(e))
                for (i in s[e])
                    s[e].hasOwnProperty(i) &&
                        s[e][i] &&
                        (!t || (t && t(s[e][i], i, e))) &&
                        o.push(this._scanRects(s, parseInt(i, 10), parseInt(e, 10), t));
        return o;
    },
    _scanRects: function (t, i, e, o) {
        var s = { x: i, y: e, width: 1, height: 1 }, n = i + 1, r = e + 1;
        t[e][i] = 0;
        while (t[e][n] && (!o || (o && o(t[e][n], n, e))))
            s.width++, (t[e][n] = 0), n++;
        while (t[r] && t[r][i] && (!o || (o && o(t[r][i], i, r)))) {
            if ((t[r][i - 1] && (!o || (o && o(t[r][i - 1], i - 1, r)))) ||
                (t[r][i + s.width] && (!o || (o && o(t[r][i + s.width], i + s.width, r)))))
                return s;
            for (n = i; i + s.width > n; n++)
                if (!t[r][n] || (o && !o(t[r][n], n, r)))
                    return s;
            for (n = i; i + s.width > n; n++)
                t[r][n] = 0;
            s.height++, r++;
        }
        return s;
    },
    inGrid: function (t, i, e, o) {
        return (e === void 0 && (e = 1),
            o === void 0 && (o = 1),
            !(0 > t || 0 > i || t + e > this._gridSize.x || i + o > this._gridSize.y));
    },
    hoverColor: function (t) {
        return t !== void 0 ? ((this._hoverColor = t), this) : this._hoverColor;
    },
    loadMap: function (t) {
        return this.map.mapData(t.data, 0, 0), this;
    },
    saveMap: function () {
        var t, i, e = 0, o = 0, s = this.map._mapData;
        for (i in s)
            if (s.hasOwnProperty(i))
                for (t in s[i])
                    s[i].hasOwnProperty(t) &&
                        (parseInt(e) > parseInt(t) && (e = parseInt(t)),
                            parseInt(o) > parseInt(i) && (o = parseInt(i)));
        return JSON.stringify({ data: this.map.sortedMapDataAsArray(), dataXY: [parseInt(e, 10), parseInt(o, 10)] });
    },
    isometricMounts: function (t) {
        return t !== void 0
            ? ($i_59.prototype.isometricMounts.call(this, t),
                this.tileWidth(this._tileWidth),
                this.tileHeight(this._tileHeight),
                this.gridSize(this._gridSize.x, this._gridSize.y),
                this._updateAdjustmentMatrix(),
                this)
            : this._mountMode;
    },
    tileMapHitPolygon: function () {
        if (this._mountMode === 0)
            return this.aabb();
        if (this._mountMode === 1) {
            var t = this.aabb(), i = new $i_6();
            return (i.addPoint(t.x + t.width / 2, t.y),
                i.addPoint(t.x + t.width, t.y + t.height / 2),
                i.addPoint(t.x + t.width / 2, t.y + t.height - 1),
                i.addPoint(t.x - 1, t.y + t.height / 2 - 1),
                i);
        }
    },
    _processTriggerHitTests: function () {
        if (this._mouseEventsActive && ige._currentViewport) {
            if (this._mouseAlwaysInside)
                return !0;
            var t = this.mouseToTile();
            return t.x >= 0 && t.y >= 0 && this._gridSize.x > t.x && this._gridSize.y > t.y ? !0 : !1;
        }
        return !1;
    },
    _updateAdjustmentMatrix: function () {
        this._bounds2d.x2 &&
            this._bounds2d.y2 &&
            this._tileWidth &&
            this._tileHeight &&
            (this._mountMode === 0 && this._adjustmentMatrix.translateTo(this._bounds2d.x2, this._bounds2d.y2),
                this._mountMode === 1 && this._adjustmentMatrix.translateTo(0, this._bounds2d.y2));
    },
    _childMounted: function (t) {
        (t.tileWidth = t.tileWidth || this.tileWidth),
            (t.tileHeight = t.tileHeight || this.tileHeight),
            (t._tileWidth = t._tileWidth || 1),
            (t._tileHeight = t._tileHeight || 1),
            $i_59.prototype._childMounted.call(this, t);
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_66);
var $i_53Map = $i_66.extend({
    classId: "$i_53Map",
    init: function (t, i) {
        $i_66.prototype.init.call(this, t, i),
            (this.map = new $i_65()),
            (this._textureList = []),
            (this._renderCenter = new $i_5(0, 0, 0)),
            (this._cacheDirty = !0);
    },
    autoSection: function (t) {
        return t !== void 0 ? ((this._autoSection = t), this) : this._autoSection;
    },
    drawSectionBounds: function (t) {
        return t !== void 0 ? ((this._drawSectionBounds = t), this) : this._drawSectionBounds;
    },
    cacheForceFrame: function () {
        this._cacheDirty = !0;
    },
    negate: function (t) {
        if (t !== void 0) {
            var i, e, o = t.map._mapData, s = this.map._mapData;
            for (e in o)
                if (o.hasOwnProperty(e))
                    for (i in o[e])
                        o[e].hasOwnProperty(i) && s[e] && s[e][i] && delete s[e][i];
        }
        return this;
    },
    addTexture: function (t) {
        return this._textureList.push(t), t._loaded || (this._allTexturesLoaded = !1), this._textureList.length - 1;
    },
    allTexturesLoaded: function () {
        if (!this._allTexturesLoaded) {
            var t = this._textureList, i = t.length;
            while (i--)
                if (!t[i]._loaded)
                    return !1;
        }
        return (this._allTexturesLoaded = !0), !0;
    },
    paintTile: function (t, i, e, o) {
        t !== void 0 &&
            i !== void 0 &&
            e !== void 0 &&
            ((o === void 0 || 1 > o) && (o = 1), this.map.tileData(t, i, [e, o]));
    },
    clearTile: function (t, i) {
        this.map.clearData(t, i);
    },
    loadMap: function (map) {
        if (map.textures) {
            this._textureList = [];
            var tex = [], i, self = this;
            for (i = 0; map.textures.length > i; i++)
                eval("tex[" + i + "] = " + map.textures[i]), self.addTexture(tex[i]);
            self.map.mapData(map.data);
        }
        else
            this.map.mapData(map.data);
        return this;
    },
    saveMap: function () {
        var t, i, e, o = [], s = 0, n = 0, r = this.map._mapData;
        for (t = 0; this._textureList.length > t; t++)
            o.push(this._textureList[t].stringify());
        for (e in r)
            if (r.hasOwnProperty(e))
                for (i in r[e])
                    r[e].hasOwnProperty(i) && (s > i && (s = i), n > e && (n = e));
        return JSON.stringify({ textures: o, data: this.map.mapData(), dataXY: [s, n] });
    },
    clearMap: function () {
        return this.map.mapData([]), this;
    },
    reset: function () {
        return this.clearMap(), (this._textureList = []), this;
    },
    tileTextureIndex: function (t, i, e) {
        if (t !== void 0 && i !== void 0) {
            var o = this.map.tileData(t, i);
            if (e === void 0)
                return o[0];
            o[0] = e;
        }
    },
    tileTextureCell: function (t, i, e) {
        if (t !== void 0 && i !== void 0) {
            var o = this.map.tileData(t, i);
            if (e === void 0)
                return o[1];
            o[1] = e;
        }
    },
    convertHorizontalData: function (t) {
        var i, e, o = [];
        for (i in t)
            if (t.hasOwnProperty(i))
                for (e in t[i])
                    t[i].hasOwnProperty(e) && ((o[e] = o[e] || []), (o[e][i] = t[i][e]));
        return o;
    },
    tick: function (t) {
        $i_66.prototype.tick.call(this, t);
        var i, e, o, s, n, r, a, h, l, c, _, m, u, p, d, y, x, f = this.map._mapData, g = this._newTileEntity();
        if (this._autoSection > 0) {
            if (this._cacheDirty && this.allTexturesLoaded()) {
                (this._sections = []), (this._sectionCtx = []);
                for (e in f)
                    if (f.hasOwnProperty(e))
                        for (i in f[e])
                            if (f[e].hasOwnProperty(i) &&
                                ((n = parseInt(i)),
                                    (r = parseInt(e)),
                                    this._mountMode === 0 && ((a = n), (h = r)),
                                    this._mountMode === 1 &&
                                        ((o = n * this._tileWidth),
                                            (s = r * this._tileHeight),
                                            (a = (o - s) / this._tileWidth),
                                            (h = ((o + s) * 0.5) / this._tileHeight)),
                                    (l = f[e][i]),
                                    (c = Math.floor(a / this._autoSection)),
                                    (_ = Math.floor(h / this._autoSection)),
                                    this._ensureSectionExists(c, _),
                                    (p = this._sectionCtx[c][_]),
                                    l && (d = this._renderTile(p, n, r, l, g, null, c, _))))
                                for (x = 0; d.length > x; x++)
                                    (y = d[x]),
                                        (m = c),
                                        (u = _),
                                        y.x && (m += y.x),
                                        y.y && (u += y.y),
                                        this._ensureSectionExists(m, u),
                                        (p = this._sectionCtx[m][u]),
                                        (this._sectionTileRegion = this._sectionTileRegion || []),
                                        (this._sectionTileRegion[m] = this._sectionTileRegion[m] || []),
                                        (this._sectionTileRegion[m][u] = this._sectionTileRegion[m][u] || []),
                                        (this._sectionTileRegion[m][u][n] = this._sectionTileRegion[m][u][n] || []),
                                        this._sectionTileRegion[m][u][n][r] ||
                                            ((this._sectionTileRegion[m][u][n][r] = !0),
                                                this._renderTile(p, n, r, l, g, null, m, u));
                (this._cacheDirty = !1), delete this._sectionTileRegion;
            }
            this._drawSectionsToCtx(t);
        }
        else if (this.allTexturesLoaded())
            for (e in f)
                if (f.hasOwnProperty(e))
                    for (i in f[e])
                        f[e].hasOwnProperty(i) && ((l = f[e][i]), l && this._renderTile(t, i, e, l, g));
    },
    _ensureSectionExists: function (t, i) {
        var e;
        (this._sections[t] = this._sections[t] || []),
            (this._sectionCtx[t] = this._sectionCtx[t] || []),
            this._sections[t][i] ||
                ((this._sections[t][i] = document.createElement("canvas")),
                    (this._sections[t][i].width = this._tileWidth * this._autoSection),
                    (this._sections[t][i].height = this._tileHeight * this._autoSection),
                    (e = this._sectionCtx[t][i] = this._sections[t][i].getContext("2d")),
                    ige._globalSmoothing
                        ? ((e.imageSmoothingEnabled = !0),
                            (e.webkitImageSmoothingEnabled = !0),
                            (e.mozImageSmoothingEnabled = !0))
                        : ((e.imageSmoothingEnabled = !1),
                            (e.webkitImageSmoothingEnabled = !1),
                            (e.mozImageSmoothingEnabled = !1)),
                    e.translate(this._tileWidth / 2, this._tileHeight / 2));
    },
    _drawSectionsToCtx: function (t) {
        var i, e, o, s, n, r, a, h, l, c = ige._currentViewport.viewArea();
        (h = this._tileWidth * this._autoSection), (l = this._tileHeight * this._autoSection);
        for (i in this._sections)
            if (this._sections.hasOwnProperty(i))
                for (e in this._sections[i])
                    this._sections[i].hasOwnProperty(e) &&
                        ((s = i * this._tileWidth * this._autoSection),
                            (n = e * this._tileHeight * this._autoSection),
                            (r = this._translate.x + s - ige._currentCamera._translate.x),
                            (a = this._translate.y + n - ige._currentCamera._translate.y),
                            this._mountMode === 1 && ((r -= this._tileWidth / 2), (a -= this._tileHeight / 2)),
                            -(c.width / 2) > r + h + this._tileHeight / 2 ||
                                r - this._tileWidth / 2 > c.width / 2 ||
                                -(c.height / 2) > a + l + this._tileHeight / 2 ||
                                a > c.height / 2 ||
                                ((o = this._sections[i][e]),
                                    t.drawImage(o, 0, 0, h, l, s, n, h, l),
                                    ige._drawCount++,
                                    this._drawSectionBounds &&
                                        ((t.strokeStyle = "#ff00f6"),
                                            t.strokeRect(i * this._tileWidth * this._autoSection, e * this._tileHeight * this._autoSection, this._tileWidth * this._autoSection, this._tileHeight * this._autoSection))));
    },
    _renderTile: function (t, i, e, o, s, n, r, a) {
        var h, l, c, _, m, u, p, d, y, x, f, g, b, v = this._mountMode === 1 ? this._tileWidth / 2 : 0;
        return (this._mountMode === 1 ? this._tileHeight / 2 : 0,
            this._mountMode === 0 && ((h = i * this._tileWidth), (l = e * this._tileHeight)),
            this._mountMode === 1 &&
                ((y = i * this._tileWidth),
                    (x = e * this._tileHeight),
                    (f = y - x),
                    (g = (y + x) * 0.5),
                    (h = f - this._tileWidth / 2),
                    (l = g)),
            r !== void 0 && (h -= r * this._autoSection * this._tileWidth),
            a !== void 0 && (l -= a * this._autoSection * this._tileHeight),
            !n || n.xyInside(h, l)
                ? (0 > h - v && ((c = c || []), c.push({ x: -1 }), (_ = !0), (d = d || {}), (d.x = -1)),
                    h + v > t.canvas.width - this._tileWidth &&
                        ((c = c || []), c.push({ x: 1 }), (m = !0), (d = d || {}), (d.x = 1)),
                    0 > l - 0 && ((c = c || []), c.push({ y: -1 }), (u = !0), (d = d || {}), (d.y = -1)),
                    l + 0 > t.canvas.height - this._tileHeight &&
                        ((c = c || []), c.push({ y: 1 }), (p = !0), (d = d || {}), (d.y = 1)),
                    (_ || u || m || p) && c.push(d),
                    t.save(),
                    t.translate(h, l),
                    (b = this._textureList[o[0]]),
                    (s._cell = o[1]),
                    b && b.render(t, s, ige._tickDelta),
                    t.restore(),
                    c)
                : void 0);
    },
    _newTileEntity: function () {
        return this._mountMode === 0
            ? {
                _cell: 1,
                _bounds2d: { x: this._tileWidth, y: this._tileHeight },
                _renderPos: { x: -this._tileWidth / 2, y: -this._tileHeight / 2 }
            }
            : this._mountMode === 1
                ? {
                    _cell: 1,
                    _bounds2d: { x: this._tileWidth * 2, y: this._tileHeight },
                    _renderPos: { x: -this._tileWidth, y: -this._tileHeight / 2 }
                }
                : void 0;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_53Map);
var $i_66SmartTexture = {
    render: function (t, i) {
        var e = i._tileWidth, o = i._tileHeight, s = (i.bounds2d(), i._gridSize), n = 0, r = 0;
        if (i._drawGrid) {
            t.strokeStyle = i._gridColor;
            var a, h, l, c = n + e * s.x, _ = r + o * s.y;
            for (n = 0, r = 0, a = 0; s.y >= a; a++)
                (h = new $i_4(n, r + o * a)),
                    (l = new $i_4(c, r + o * a)),
                    i._mountMode === 1 && ((h = h.toIso()), (l = l.toIso())),
                    t.beginPath(),
                    t.moveTo(h.x, h.y),
                    t.lineTo(l.x, l.y),
                    t.stroke();
            for (a = 0; s.x >= a; a++)
                (h = new $i_4(n + e * a, r)),
                    (l = new $i_4(n + e * a, _)),
                    i._mountMode === 1 && ((h = h.toIso()), (l = l.toIso())),
                    t.beginPath(),
                    t.moveTo(h.x, h.y),
                    t.lineTo(l.x, l.y),
                    t.stroke();
        }
        if (i._highlightOccupied) {
            t.fillStyle = "#ff0000";
            for (r in i.map._mapData)
                if (i.map._mapData[r])
                    for (n in i.map._mapData[r])
                        i.map._mapData[r][n] &&
                            ((m = new $i_4(e * n, o * r)),
                                i._mountMode === 0 && t.fillRect(m.x, m.y, e, o),
                                i._mountMode === 1 &&
                                    (m.thisToIso(),
                                        t.beginPath(),
                                        t.moveTo(m.x, m.y),
                                        t.lineTo(m.x + e, m.y + o / 2),
                                        t.lineTo(m.x, m.y + o),
                                        t.lineTo(m.x - e, m.y + o / 2),
                                        t.lineTo(m.x, m.y),
                                        t.fill()));
        }
        if (i._highlightTileRect)
            for (t.fillStyle = "#e4ff00", r = i._highlightTileRect.y; i._highlightTileRect.y + i._highlightTileRect.height > r; r++)
                for (n = i._highlightTileRect.x; i._highlightTileRect.x + i._highlightTileRect.width > n; n++)
                    (m = new $i_4(e * n, o * r)),
                        i._mountMode === 0 && t.fillRect(m.x, m.y, e, o),
                        i._mountMode === 1 &&
                            (m.thisToIso(),
                                t.beginPath(),
                                t.moveTo(m.x, m.y - o / 2),
                                t.lineTo(m.x + e, m.y),
                                t.lineTo(m.x, m.y + o / 2),
                                t.lineTo(m.x - e, m.y),
                                t.lineTo(m.x, m.y - o / 2),
                                t.fill());
        if (i._drawMouse) {
            var m, u, p, d = i.mousePos(), y = i.mouseToTile();
            y.x >= 0 &&
                y.y >= 0 &&
                s.x > y.x &&
                s.y > y.y &&
                ((t.fillStyle = i._hoverColor || "#6000ff"),
                    i._mountMode === 0 && t.fillRect(y.x * e, y.y * o, e, o),
                    i._mountMode === 1 &&
                        ((m = y.clone().thisMultiply(e, o, 0).thisToIso()),
                            (m.y += o / 2),
                            t.beginPath(),
                            t.moveTo(m.x, m.y - o / 2),
                            t.lineTo(m.x + e, m.y),
                            t.lineTo(m.x, m.y + o / 2),
                            t.lineTo(m.x - e, m.y),
                            t.lineTo(m.x, m.y - o / 2),
                            t.fill()),
                    i._drawMouseData &&
                        ((u = "Tile X: " + y.x + " Y: " + y.y),
                            (p = t.measureText(u)),
                            (t.fillStyle = "rgba(0, 0, 0, 0.8)"),
                            t.fillRect(Math.floor(d.x - p.width / 2 - 5), Math.floor(d.y - 40), Math.floor(p.width + 10), 14),
                            (t.fillStyle = "#ffffff"),
                            t.fillText(u, Math.floor(d.x - p.width / 2), Math.floor(d.y - 30))));
        }
    }
}, $i_70 = $i_59.extend({
    classId: "$i_70",
    init: function (t) {
        $i_59.prototype.init.call(this),
            (this._trackRotateTarget = void 0),
            (this._trackTranslateTarget = void 0),
            (this._trackRotateSmoothing = void 0),
            (this._trackTranslateSmoothing = void 0),
            (this._entity = t);
    },
    limit: function (t) {
        return t !== void 0 ? ((this._limit = t), this._entity) : this._limit;
    },
    panTo: function (t, i, e) {
        return (t !== void 0 &&
            this._translate.tween().properties({ x: t.x, y: t.y, z: t.z }).duration(i).easing(e).start(),
            this._entity);
    },
    panBy: function (t, i, e) {
        return (t !== void 0 &&
            this._translate
                .tween()
                .properties({
                x: t.x + this._translate.x,
                y: t.y + this._translate.y,
                z: t.z + this._translate.z
            })
                .duration(i)
                .easing(e)
                .start(),
            this._entity);
    },
    trackTranslate: function (t, i, e) {
        return t !== void 0
            ? (this.log("Camera on viewport " + this._entity.id() + " is now tracking translation target " + t.id()),
                e !== void 0 && (this._trackTranslateRounding = e),
                i !== void 0 && (this._trackTranslateSmoothing = 1 > i ? 0 : i),
                (this._trackTranslateTarget = t),
                this._entity)
            : this._trackTranslateTarget;
    },
    trackTranslateSmoothing: function (t) {
        return t !== void 0 ? ((this._trackTranslateSmoothing = t), this) : this._trackTranslateSmoothing;
    },
    trackTranslateRounding: function (t) {
        return t !== void 0 ? ((this._trackTranslateRounding = t), this) : this._trackTranslateRounding;
    },
    unTrackTranslate: function () {
        delete this._trackTranslateTarget;
    },
    trackRotate: function (t, i) {
        return t !== void 0
            ? (this.log("Camera on viewport " + this._entity.id() + " is now tracking rotation of target " + t.id()),
                (this._trackRotateSmoothing = 1 > i ? 0 : i),
                (this._trackRotateTarget = t),
                this._entity)
            : this._trackRotateTarget;
    },
    trackRotateSmoothing: function (t) {
        return t !== void 0 ? ((this._trackRotateSmoothing = t), this) : this._trackRotateSmoothing;
    },
    unTrackRotate: function () {
        delete this._trackRotateTarget;
    },
    lookAt: function (t, i, e) {
        return (t !== void 0 &&
            (t.updateTransform(),
                i
                    ? this._translate
                        .tween()
                        .properties({
                        x: Math.floor(t._worldMatrix.matrix[2]),
                        y: Math.floor(t._worldMatrix.matrix[5]),
                        z: 0
                    })
                        .duration(i)
                        .easing(e)
                        .start()
                    : ((this._translate.x = Math.floor(t._worldMatrix.matrix[2])),
                        (this._translate.y = Math.floor(t._worldMatrix.matrix[5]))),
                this.updateTransform()),
            this);
    },
    update: function (t) {
        if ((this._processUpdateBehaviours(t), this._trackTranslateTarget)) {
            var i, e, o, s, n = this._trackTranslateTarget, r = n._worldMatrix.matrix, a = r[2], h = r[5];
            this._trackTranslateSmoothing
                ? ((i = this._translate.x),
                    (e = this._translate.y),
                    (o = Math.round(a - i)),
                    (s = Math.round(h - e)),
                    this._trackTranslateRounding
                        ? ((this._translate.x += Math.round(o / this._trackTranslateSmoothing)),
                            (this._translate.y += Math.round(s / this._trackTranslateSmoothing)))
                        : ((this._translate.x += o / this._trackTranslateSmoothing),
                            (this._translate.y += s / this._trackTranslateSmoothing)))
                : this.lookAt(this._trackTranslateTarget);
        }
        if (this._trackRotateTarget) {
            var l, c, _ = this._trackRotateTarget._parent !== void 0 ? this._trackRotateTarget._parent._rotate.z : 0, m = -(_ + this._trackRotateTarget._rotate.z);
            this._trackRotateSmoothing
                ? ((l = this._rotate.z), (c = m - l), (this._rotate.z += c / this._trackRotateSmoothing))
                : (this._rotate.z = m);
        }
        this.updateTransform();
    },
    tick: function (t) {
        this._processTickBehaviours(t), this._localMatrix.transformRenderingContext(t);
    },
    updateTransform: function () {
        this._localMatrix.identity(),
            this._localMatrix.multiply(this._localMatrix._newRotate(this._rotate.z)),
            this._localMatrix.multiply(this._localMatrix._newScale(this._scale.x, this._scale.y)),
            this._localMatrix.multiply(this._localMatrix._newTranslate(-this._translate.x, -this._translate.y)),
            this._parent
                ? (this._worldMatrix.copy(this._parent._worldMatrix), this._worldMatrix.multiply(this._localMatrix))
                : this._worldMatrix.copy(this._localMatrix);
    },
    _stringify: function () {
        var t, i = $i_59.prototype._stringify.call(this);
        for (t in this)
            if (this.hasOwnProperty(t) && this[t] !== void 0)
                switch (t) {
                    case "_trackTranslateTarget":
                        i +=
                            ".trackTranslate(ige.$('" +
                                this._trackTranslateTarget.id() +
                                "'), " +
                                this.trackTranslateSmoothing() +
                                ")";
                        break;
                    case "_trackRotateTarget":
                        i +=
                            ".trackRotate(ige.$('" +
                                this._trackRotateTarget.id() +
                                "'), " +
                                this.trackRotateSmoothing() +
                                ")";
                }
        return i;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_70);
var $i_71 = $i_59.extend([
    { extension: $i_44, overwrite: !0 },
    { extension: $i_43, overwrite: !0 }
], {
    classId: "$i_71",
    $i_71: !0,
    init: function (t) {
        var i, e;
        (this._alwaysInView = !0),
            $i_59.prototype.init.call(this),
            (this._mouseAlwaysInside = !0),
            (this._mousePos = new $i_5(0, 0, 0)),
            (this._overflow = ""),
            (this._clipping = !0),
            (this._bornTime = void 0),
            t &&
                ((i = t.width),
                    (e = t.height),
                    t &&
                        t.scaleToWidth &&
                        t.scaleToHeight &&
                        (this._lockDimension = new $i_5(t.scaleToWidth, t.scaleToHeight, 0))),
            (this._bounds2d = new $i_5(i || ige._bounds2d.x, e || ige._bounds2d.y, 0)),
            (this.camera = new $i_70(this)),
            (this.camera._entity = this);
    },
    minimumVisibleArea: function (t, i) {
        return (this._lockDimension = new $i_5(t, i, 0)), isClient && this._resizeEvent({}), this;
    },
    autoSize: function (t) {
        return t !== void 0 ? ((this._autoSize = t), this) : this._autoSize;
    },
    scene: function (t) {
        return t !== void 0 ? ((this._scene = t), this) : this._scene;
    },
    mousePos: function () {
        return this._mousePos.clone();
    },
    mousePosWorld: function () {
        return this._transformPoint(this._mousePos.clone());
    },
    viewArea: function () {
        var t = this.aabb(), i = this.camera._translate, e = this.camera._scale, o = t.width * (1 / e.x), s = t.height * (1 / e.y);
        return new $i_7(i.x - o / 2, i.y - s / 2, o, s);
    },
    update: function (t, i) {
        this._scene &&
            ((ige._currentCamera = this.camera),
                (ige._currentViewport = this),
                (this._scene._parent = this),
                this.camera.update(t, i),
                $i_59.prototype.update.call(this, t, i),
                this._scene.newFrame() && this._scene.update(t, i));
    },
    tick: function (t) {
        if (this._scene) {
            if (((ige._currentCamera = this.camera),
                (ige._currentViewport = this),
                (this._scene._parent = this),
                $i_59.prototype.tick.call(this, t),
                t.translate(-(this._bounds2d.x * this._origin.x) | 0, -(this._bounds2d.y * this._origin.y) | 0),
                t.clearRect(0, 0, this._bounds2d.x, this._bounds2d.y),
                (this._clipping || this._borderColor) &&
                    (t.beginPath(),
                        t.rect(0, 0, this._bounds2d.x / ige._scale.x, this._bounds2d.y / ige._scale.x),
                        this._borderColor && ((t.strokeStyle = this._borderColor), t.stroke()),
                        this._clipping && t.clip()),
                t.translate(((this._bounds2d.x / 2) | 0) + ige._translate.x, ((this._bounds2d.y / 2) | 0) + ige._translate.y),
                (ige._scale.x !== 1 || ige._scale.y !== 1) && t.scale(ige._scale.x, ige._scale.y),
                this.camera.tick(t),
                t.save(),
                this._scene.tick(t),
                t.restore(),
                this._drawGuides &&
                    t === ige._ctx &&
                    (t.save(),
                        t.translate(-this._translate.x, -this._translate.y),
                        this.paintGuides(t),
                        t.restore()),
                this._drawBounds &&
                    t === ige._ctx &&
                    (t.save(),
                        t.translate(-this._translate.x, -this._translate.y),
                        this.paintAabbs(t, this._scene, 0),
                        t.restore()),
                this._drawMouse && t === ige._ctx)) {
                t.save();
                var i, e, o, s, n = this.mousePos();
                t.scale(1 / this.camera._scale.x, 1 / this.camera._scale.y),
                    (e = Math.floor(n.x * this.camera._scale.x)),
                    (o = Math.floor(n.y * this.camera._scale.y)),
                    (t.fillStyle = "#fc00ff"),
                    t.fillRect(e - 5, o - 5, 10, 10),
                    (i = this.id() + " X: " + e + ", Y: " + o),
                    (s = t.measureText(i)),
                    (t.fillStyle = "rgba(0, 0, 0, 0.8)"),
                    t.fillRect(Math.floor(e - s.width / 2 - 5), Math.floor(o - 25), Math.floor(s.width + 10), 14),
                    (t.fillStyle = "#ffffff"),
                    t.fillText(i, e - s.width / 2, o - 15),
                    t.restore();
            }
            if (this._drawViewArea) {
                t.save();
                var r = this.viewArea();
                t.rect(r.x, r.y, r.width, r.height), t.stroke(), t.restore();
            }
        }
    },
    screenPosition: function () {
        return new $i_5(Math.floor(this._worldMatrix.matrix[2] + ige._bounds2d.x2), Math.floor(this._worldMatrix.matrix[5] + ige._bounds2d.y2), 0);
    },
    drawViewArea: function (t) {
        return t !== void 0 ? ((this._drawViewArea = t), this) : this._drawViewArea;
    },
    drawBoundsLimitId: function (t) {
        return t !== void 0 ? ((this._drawBoundsLimitId = t), this) : this._drawBoundsLimitId;
    },
    drawBoundsLimitCategory: function (t) {
        return t !== void 0 ? ((this._drawBoundsLimitCategory = t), this) : this._drawBoundsLimitCategory;
    },
    drawCompositeBounds: function (t) {
        return t !== void 0 ? ((this._drawCompositeBounds = t), this) : this._drawCompositeBounds;
    },
    drawGuides: function (t) {
        return t !== void 0 ? ((this._drawGuides = t), this) : this._drawGuides;
    },
    paintGuides: function (t) {
        var i = ige._bounds2d;
        this._drawGuides &&
            ((t.strokeStyle = "#ffffff"),
                t.translate(0.5, 0.5),
                t.beginPath(),
                t.moveTo(0, -i.y2),
                t.lineTo(0, i.y),
                t.stroke(),
                t.beginPath(),
                t.moveTo(-i.x2, 0),
                t.lineTo(i.x, 0),
                t.stroke());
    },
    paintAabbs: function (t, i, e) {
        var o, s, n, r, a, h, l, c, _, m, u, p, d, y, x, f, g, b, v, w, C, D = i._children;
        if (D) {
            o = D.length;
            while (o--)
                (s = D[o]),
                    e++,
                    s._shouldRender !== !1 &&
                        (((s._classId !== "$i_72" && !this._drawBoundsLimitId && !this._drawBoundsLimitCategory) ||
                            (this._drawBoundsLimitId &&
                                (this._drawBoundsLimitId instanceof Array
                                    ? this._drawBoundsLimitId.indexOf(s.id()) > -1
                                    : this._drawBoundsLimitId === s.id())) ||
                            (this._drawBoundsLimitCategory && this._drawBoundsLimitCategory === s.category())) &&
                            typeof s.aabb == "function" &&
                            ((n = s.aabb()),
                                this._drawCompositeBounds &&
                                    s._compositeCache &&
                                    ((r = s.compositeAabb()),
                                        (t.strokeStyle = "#ff0000"),
                                        t.strokeRect(r.x, r.y, r.width, r.height)),
                                n &&
                                    ((s._drawBounds || s._drawBounds === void 0) &&
                                        ((t.strokeStyle = "#00deff"),
                                            t.strokeRect(n.x, n.y, n.width, n.height),
                                            s._parent &&
                                                s._parent._mountMode === 1 &&
                                                ((a = s.bounds3dPolygon().aabb()),
                                                    t.save(),
                                                    (t.strokeStyle = "#0068b8"),
                                                    t.strokeRect(a.x, a.y, a.width, a.height),
                                                    t.restore(),
                                                    t.save(),
                                                    t.translate(a.x + a.width / 2, a.y + a.height / 2),
                                                    (l = s._bounds3d),
                                                    (c = new $i_5(-(l.x / 2), 0, 0).toIso()),
                                                    (_ = new $i_5(+(l.x / 2), 0, 0).toIso()),
                                                    (m = new $i_5(0, -(l.y / 2), 0).toIso()),
                                                    (u = new $i_5(0, +(l.y / 2), 0).toIso()),
                                                    (p = new $i_5(0, 0, -(l.z / 2)).toIso()),
                                                    (d = new $i_5(0, 0, +(l.z / 2)).toIso()),
                                                    (y = new $i_5(-(l.x / 2), -(l.y / 2), -(l.z / 2)).toIso()),
                                                    (x = new $i_5(+(l.x / 2), -(l.y / 2), -(l.z / 2)).toIso()),
                                                    (f = new $i_5(+(l.x / 2), +(l.y / 2), -(l.z / 2)).toIso()),
                                                    (g = new $i_5(-(l.x / 2), +(l.y / 2), -(l.z / 2)).toIso()),
                                                    (b = new $i_5(-(l.x / 2), -(l.y / 2), l.z / 2).toIso()),
                                                    (v = new $i_5(+(l.x / 2), -(l.y / 2), l.z / 2).toIso()),
                                                    (w = new $i_5(+(l.x / 2), +(l.y / 2), l.z / 2).toIso()),
                                                    (C = new $i_5(-(l.x / 2), +(l.y / 2), l.z / 2).toIso()),
                                                    (h = t.globalAlpha),
                                                    (t.globalAlpha = 1),
                                                    (t.strokeStyle = "#ff0000"),
                                                    t.beginPath(),
                                                    t.moveTo(c.x, c.y),
                                                    t.lineTo(_.x, _.y),
                                                    t.stroke(),
                                                    (t.strokeStyle = "#00ff00"),
                                                    t.beginPath(),
                                                    t.moveTo(m.x, m.y),
                                                    t.lineTo(u.x, u.y),
                                                    t.stroke(),
                                                    (t.strokeStyle = "#fffc00"),
                                                    t.beginPath(),
                                                    t.moveTo(p.x, p.y),
                                                    t.lineTo(d.x, d.y),
                                                    t.stroke(),
                                                    (t.strokeStyle = "#a200ff"),
                                                    (t.globalAlpha = s._highlight ? 0.9 : 0.6),
                                                    (t.fillStyle = "#545454"),
                                                    t.beginPath(),
                                                    t.moveTo(f.x, f.y),
                                                    t.lineTo(g.x, g.y),
                                                    t.lineTo(C.x, C.y),
                                                    t.lineTo(w.x, w.y),
                                                    t.lineTo(f.x, f.y),
                                                    t.fill(),
                                                    t.stroke(),
                                                    (t.fillStyle = "#282828"),
                                                    t.beginPath(),
                                                    t.moveTo(f.x, f.y),
                                                    t.lineTo(x.x, x.y),
                                                    t.lineTo(v.x, v.y),
                                                    t.lineTo(w.x, w.y),
                                                    t.lineTo(f.x, f.y),
                                                    t.fill(),
                                                    t.stroke(),
                                                    (t.fillStyle = "#676767"),
                                                    t.beginPath(),
                                                    t.moveTo(b.x, b.y),
                                                    t.lineTo(v.x, v.y),
                                                    t.lineTo(w.x, w.y),
                                                    t.lineTo(C.x, C.y),
                                                    t.lineTo(b.x, b.y),
                                                    t.fill(),
                                                    t.stroke(),
                                                    (t.globalAlpha = h),
                                                    t.restore())),
                                        this._drawBoundsData &&
                                            (s._drawBounds || s._drawBoundsData === void 0) &&
                                            ((t.globalAlpha = 1),
                                                (t.fillStyle = "#f6ff00"),
                                                t.fillText("ID: " +
                                                    s.id() +
                                                    " " +
                                                    "(" +
                                                    s.classId() +
                                                    ") " +
                                                    s.layer() +
                                                    ":" +
                                                    s.depth().toFixed(0), n.x + n.width + 3, n.y + 10),
                                                t.fillText("X: " +
                                                    s._translate.x.toFixed(2) +
                                                    ", " +
                                                    "Y: " +
                                                    s._translate.y.toFixed(2) +
                                                    ", " +
                                                    "Z: " +
                                                    s._translate.z.toFixed(2), n.x + n.width + 3, n.y + 20),
                                                t.fillText("Num Children: " + s._children.length, n.x + n.width + 3, n.y + 40)))),
                            this.paintAabbs(t, s, e));
        }
    },
    _resizeEvent: function (t) {
        if ((this._autoSize && this._parent && (this._bounds2d = this._parent._bounds2d.clone()),
            this._updateUiPosition(),
            this._scene && this._scene._resizeEvent(t),
            this._lockDimension)) {
            var i, e, o = 1;
            this._bounds2d.x > this._lockDimension.x && this._bounds2d.y > this._lockDimension.y
                ? ((i = this._bounds2d.x / this._lockDimension.x),
                    (e = this._bounds2d.y / this._lockDimension.y),
                    (o = e > i ? i : e))
                : (this._bounds2d.x > this._lockDimension.x &&
                    this._lockDimension.y > this._bounds2d.y &&
                    (o = this._bounds2d.y / this._lockDimension.y),
                    this._lockDimension.x > this._bounds2d.x &&
                        this._bounds2d.y > this._lockDimension.y &&
                        (o = this._bounds2d.x / this._lockDimension.x),
                    this._lockDimension.x > this._bounds2d.x &&
                        this._lockDimension.y > this._bounds2d.y &&
                        ((i = this._bounds2d.x / this._lockDimension.x),
                            (e = this._bounds2d.y / this._lockDimension.y),
                            (o = e > i ? i : e))),
                this.camera.scaleTo(o, o, o);
        }
    },
    _stringify: function () {
        var t, i = $i_59.prototype._stringify.call(this);
        for (t in this)
            if (this.hasOwnProperty(t) && this[t] !== void 0)
                switch (t) {
                    case "_autoSize":
                        i += ".autoSize(" + this._autoSize + ")";
                        break;
                    case "_scene":
                        i += ".scene(ige.$('" + this.scene().id() + "'))";
                }
        return i;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_71);
var $i_72 = $i_59.extend({
    classId: "$i_72",
    init: function () {
        (this._mouseAlwaysInside = !0),
            (this._alwaysInView = !0),
            $i_59.prototype.init.call(this),
            (this._shouldRender = !0),
            (this._autoSize = !0),
            (this._bounds2d.x = ige._bounds2d.x),
            (this._bounds2d.y = ige._bounds2d.y),
            this.streamSections(["transform", "ignoreCamera"]);
    },
    streamRoomId: function (t) {
        return t !== void 0 ? ((this._streamRoomId = t), this) : this._streamRoomId;
    },
    streamSectionData: function (t, i) {
        switch (t) {
            case "ignoreCamera":
                if (i === void 0)
                    return this._ignoreCamera + "";
                i === "false" ? this.ignoreCamera(!1) : this.ignoreCamera(!0);
                break;
            default:
                $i_59.prototype.streamSectionData.call(this, t, i);
        }
    },
    autoSize: function (t) {
        return t !== void 0 ? ((this._autoSize = t), this) : this._autoSize;
    },
    shouldRender: function (t) {
        return t !== void 0 ? ((this._shouldRender = t), this) : this._shouldRender;
    },
    ignoreCamera: function (t) {
        return t !== void 0 ? ((this._ignoreCamera = t), this) : this._ignoreCamera;
    },
    update: function (t, i) {
        if (this._ignoreCamera) {
            var e = ige._currentCamera;
            this.translateTo(e._translate.x, e._translate.y, e._translate.z),
                this.scaleTo(1 / e._scale.x, 1 / e._scale.y, 1 / e._scale.z),
                this.rotateTo(-e._rotate.x, -e._rotate.y, -e._rotate.z);
        }
        $i_59.prototype.update.call(this, t, i);
    },
    tick: function (t) {
        this._shouldRender && $i_59.prototype.tick.call(this, t);
    },
    _resizeEvent: function (t) {
        this._autoSize && (this._bounds2d = ige._bounds2d.clone());
        var i = this._children, e = i.length;
        while (e--)
            i[e]._resizeEvent(t);
    },
    _stringify: function () {
        var t, i = $i_59.prototype._stringify.call(this);
        for (t in this)
            if (this.hasOwnProperty(t) && this[t] !== void 0)
                switch (t) {
                    case "_shouldRender":
                        i += ".shouldRender(" + this.shouldRender() + ")";
                        break;
                    case "_autoSize":
                        i += ".autoSize(" + this.autoSize() + ")";
                }
        return i;
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_72);
var $i_78 = function () { };
$i_78.prototype = [];
for (var methodName in $i_59.prototype)
    $i_59.prototype.hasOwnProperty(methodName) &&
        methodName !== "init" &&
        ($i_78.prototype[methodName] = (function (t) {
            return function () {
                for (var i = this.length, e = 0; i > e; e++)
                    this[e][t].apply(this[e], arguments);
            };
        })(methodName));
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_78);
var $i_81 = $i_3.extend({
    classId: "$i_81",
    componentId: "box2d",
    init: function (t, i) {
        ige._state !== 0 &&
            this.log("Cannot add box2d component to the ige instance once the engine has started!", "error"),
            (this._entity = t),
            (this._options = i),
            (this._renderMode = 0),
            (this.b2Color = $i_22.Common.b2Color),
            (this.b2Vec2 = $i_22.Common.Math.b2Vec2),
            (this.b2Math = $i_22.Common.Math.b2Math),
            (this.b2Shape = $i_22.Collision.Shapes.b2Shape),
            (this.b2BodyDef = $i_22.Dynamics.b2BodyDef),
            (this.b2Body = $i_22.Dynamics.b2Body),
            (this.b2FixtureDef = $i_22.Dynamics.b2FixtureDef),
            (this.b2Fixture = $i_22.Dynamics.b2Fixture),
            (this.b2World = $i_22.Dynamics.b2World),
            (this.b2MassData = $i_22.Collision.Shapes.b2MassData),
            (this.b2PolygonShape = $i_22.Collision.Shapes.b2PolygonShape),
            (this.b2CircleShape = $i_22.Collision.Shapes.b2CircleShape),
            (this.b2DebugDraw = $i_22.Dynamics.b2DebugDraw),
            (this.b2ContactListener = $i_22.Dynamics.b2ContactListener),
            (this.b2Distance = $i_22.Collision.b2Distance),
            (this.b2Contact = $i_22.Dynamics.Contacts.b2Contact),
            (this.b2FilterData = $i_22.Dynamics.b2FilterData),
            (this.b2DistanceJointDef = $i_22.Dynamics.Joints.b2DistanceJointDef),
            (this.b2Contact.prototype.igeEntityA = function () {
                var t = this.m_fixtureA.m_body._entity;
                return ((t._box2dOurContactFixture = this.m_fixtureA), (t._box2dTheirContactFixture = this.m_fixtureB), t);
            }),
            (this.b2Contact.prototype.igeEntityB = function () {
                var t = this.m_fixtureB.m_body._entity;
                return ((t._box2dOurContactFixture = this.m_fixtureB), (t._box2dTheirContactFixture = this.m_fixtureA), t);
            }),
            (this.b2Contact.prototype.igeEitherId = function (t, i) {
                return i
                    ? !((this.m_fixtureA.m_body._entity._id !== t && this.m_fixtureB.m_body._entity._id !== t) ||
                        (this.m_fixtureA.m_body._entity._id !== i && this.m_fixtureB.m_body._entity._id !== i))
                    : this.m_fixtureA.m_body._entity._id === t || this.m_fixtureB.m_body._entity._id === t;
            }),
            (this.b2Contact.prototype.igeEitherCategory = function (t, i) {
                return i
                    ? !((this.m_fixtureA.m_body._entity._category !== t &&
                        this.m_fixtureB.m_body._entity._category !== t) ||
                        (this.m_fixtureA.m_body._entity._category !== i &&
                            this.m_fixtureB.m_body._entity._category !== i))
                    : this.m_fixtureA.m_body._entity._category === t || this.m_fixtureB.m_body._entity._category === t;
            }),
            (this.b2Contact.prototype.igeBothCategories = function (t) {
                return this.m_fixtureA.m_body._entity._category === t && this.m_fixtureB.m_body._entity._category === t;
            }),
            (this.b2Contact.prototype.igeEntityByCategory = function (t) {
                return this.m_fixtureA.m_body._entity._category === t
                    ? this.igeEntityA()
                    : this.m_fixtureB.m_body._entity._category === t
                        ? this.igeEntityB()
                        : void 0;
            }),
            (this.b2Contact.prototype.igeEntityById = function (t) {
                return this.m_fixtureA.m_body._entity._id === t
                    ? this.igeEntityA()
                    : this.m_fixtureB.m_body._entity._id === t
                        ? this.igeEntityB()
                        : void 0;
            }),
            (this.b2Contact.prototype.igeEntityByFixtureId = function (t) {
                return this.m_fixtureA.igeId === t
                    ? this.igeEntityA()
                    : this.m_fixtureB.igeId === t
                        ? this.igeEntityB()
                        : void 0;
            }),
            (this.b2Contact.prototype.igeOtherEntity = function (t) {
                return this.m_fixtureA.m_body._entity === t ? this.igeEntityB() : this.igeEntityA();
            }),
            (this._sleep = !0),
            (this._scaleRatio = 30),
            (this._gravity = new this.b2Vec2(0, 0)),
            (this._removeWhenReady = []),
            this.log("Physics component initiated!");
    },
    useWorker: function (t) {
        return typeof Worker != "undefined"
            ? t !== void 0
                ? ((this._useWorker = t), this._entity)
                : this._useWorker
            : (this.log("Web workers were not detected on this browser. Cannot access useWorker() method.", "warning"),
                void 0);
    },
    mode: function (t) {
        return t !== void 0 ? ((this._renderMode = t), this._entity) : this._renderMode;
    },
    sleep: function (t) {
        return t !== void 0 ? ((this._sleep = t), this._entity) : this._sleep;
    },
    scaleRatio: function (t) {
        return t !== void 0 ? ((this._scaleRatio = t), this._entity) : this._scaleRatio;
    },
    gravity: function (t, i) {
        return t !== void 0 && i !== void 0 ? ((this._gravity = new this.b2Vec2(t, i)), this._entity) : this._gravity;
    },
    world: function () {
        return this._world;
    },
    createWorld: function () {
        return (this._world = new this.b2World(this._gravity, this._sleep)), this.log("World created"), this._entity;
    },
    createFixture: function (t) {
        var i, e = new this.b2FixtureDef();
        for (i in t)
            t.hasOwnProperty(i) && i !== "shape" && i !== "filter" && (e[i] = t[i]);
        return e;
    },
    createBody: function (t, i) {
        var e, o, s, n, r, a, h, l, c, _, m, u, p = new this.b2BodyDef();
        switch (i.type) {
            case "static":
                p.type = this.b2Body.b2_staticBody;
                break;
            case "dynamic":
                p.type = this.b2Body.b2_dynamicBody;
                break;
            case "kinematic":
                p.type = this.b2Body.b2_kinematicBody;
        }
        for (e in i)
            if (i.hasOwnProperty(e))
                switch (e) {
                    case "type":
                    case "gravitic":
                    case "fixedRotation":
                    case "fixtures":
                        break;
                    default:
                        p[e] = i[e];
                }
        (p.position = new this.b2Vec2(t._translate.x / this._scaleRatio, t._translate.y / this._scaleRatio)),
            (o = this._world.CreateBody(p));
        for (e in i)
            if (i.hasOwnProperty(e))
                switch (e) {
                    case "gravitic":
                        i.gravitic || (o.m_nonGravitic = !0);
                        break;
                    case "fixedRotation":
                        i.fixedRotation && o.SetFixedRotation(!0);
                        break;
                    case "fixtures":
                        if (i.fixtures && i.fixtures.length)
                            for (l = 0; i.fixtures.length > l; l++) {
                                if (((s = i.fixtures[l]), (n = this.createFixture(s)), (n.igeId = s.igeId), s.shape)) {
                                    switch (s.shape.type) {
                                        case "circle":
                                            (a = new this.b2CircleShape()),
                                                s.shape.data && s.shape.data.radius !== void 0
                                                    ? a.SetRadius(s.shape.data.radius / this._scaleRatio)
                                                    : a.SetRadius(t._bounds2d.x / this._scaleRatio / 2),
                                                s.shape.data &&
                                                    ((c = s.shape.data.x !== void 0 ? s.shape.data.x : 0),
                                                        (_ = s.shape.data.y !== void 0 ? s.shape.data.y : 0),
                                                        a.SetLocalPosition(new this.b2Vec2(c / this._scaleRatio, _ / this._scaleRatio)));
                                            break;
                                        case "polygon":
                                            (a = new this.b2PolygonShape()),
                                                a.SetAsArray(s.shape.data._poly, s.shape.data.length());
                                            break;
                                        case "rectangle":
                                            (a = new this.b2PolygonShape()),
                                                s.shape.data
                                                    ? ((c = s.shape.data.x !== void 0 ? s.shape.data.x : 0),
                                                        (_ = s.shape.data.y !== void 0 ? s.shape.data.y : 0),
                                                        (m =
                                                            s.shape.data.width !== void 0
                                                                ? s.shape.data.width
                                                                : t._bounds2d.x / 2),
                                                        (u =
                                                            s.shape.data.height !== void 0
                                                                ? s.shape.data.height
                                                                : t._bounds2d.y / 2))
                                                    : ((c = 0),
                                                        (_ = 0),
                                                        (m = t._bounds2d.x / 2),
                                                        (u = t._bounds2d.y / 2)),
                                                a.SetAsOrientedBox(m / this._scaleRatio, u / this._scaleRatio, new this.b2Vec2(c / this._scaleRatio, _ / this._scaleRatio), 0);
                                    }
                                    a && ((n.shape = a), (r = o.CreateFixture(n)), (r.igeId = n.igeId));
                                }
                                s.filter &&
                                    r &&
                                    ((h = new this._entity.box2d.b2FilterData()),
                                        s.filter.categoryBits !== void 0 && (h.categoryBits = s.filter.categoryBits),
                                        s.filter.maskBits !== void 0 && (h.maskBits = s.filter.maskBits),
                                        s.filter.categoryIndex !== void 0 && (h.categoryIndex = s.filter.categoryIndex),
                                        r.SetFilterData(h)),
                                    s.density !== void 0 && r && r.SetDensity(s.density);
                            }
                        else
                            this.log("$i_22 body has no fixtures, have you specified fixtures correctly? They are supposed to be an array of fixture objects.", "warning");
                }
        return (o._entity = t), o;
    },
    staticsFromMap: function (t, i) {
        if (t.map) {
            var e, o, s, n, r, a = t.tileWidth(), h = t.tileHeight();
            (s = t.scanRects(i)), (n = s.length);
            while (n--)
                (r = s[n]),
                    (e = a * (r.width / 2)),
                    (o = h * (r.height / 2)),
                    new $i_59Box2d()
                        .translateTo(r.x * a + e, r.y * h + o, 0)
                        .width(r.width * a)
                        .height(r.height * h)
                        .drawBounds(!0)
                        .drawBoundsData(!1)
                        .box2dBody({ type: "static", allowSleep: !0, fixtures: [{ shape: { type: "rectangle" } }] });
        }
        else
            this.log("Cannot extract box2d static bodies from map data because passed map does not have a .map property!", "error");
    },
    contactListener: function (t, i, e, o) {
        var s = new this.b2ContactListener();
        t !== void 0 && (s.BeginContact = t),
            i !== void 0 && (s.EndContact = i),
            e !== void 0 && (s.PreSolve = e),
            o !== void 0 && (s.PostSolve = o),
            this._world.SetContactListener(s);
    },
    networkDebugMode: function (t) {
        return t !== void 0
            ? ((this._networkDebugMode = t),
                t === !0
                    ? this.contactListener(function () { }, function () { }, function (t) {
                        t.SetEnabled(!1);
                    }, function () { })
                    : this.contactListener(),
                this._entity)
            : this._networkDebugMode;
    },
    enableDebug: function (t) {
        if (t) {
            var i = new this.b2DebugDraw();
            (this._box2dDebug = !0),
                i.SetSprite(ige._ctx),
                i.SetDrawScale(this._scaleRatio),
                i.SetFillAlpha(0.3),
                i.SetLineThickness(1),
                i.SetFlags(this.b2DebugDraw.e_controllerBit |
                    this.b2DebugDraw.e_jointBit |
                    this.b2DebugDraw.e_pairBit |
                    this.b2DebugDraw.e_shapeBit),
                this._world.SetDebugDraw(i),
                new igeClassStore.$i_84(this._entity).depth(4e4).drawBounds(!1).mount(t);
        }
        else
            this.log("Cannot enable box2d debug drawing because the passed argument is not an object on the scenegraph.", "error");
    },
    destroyBody: function (t) {
        this._removeWhenReady.push(t);
    },
    updateCallback: function (t) {
        return t !== void 0 ? ((this._updateCallback = t), this._entity) : this._updateCallback;
    },
    start: function () {
        this._active ||
            ((this._active = !0),
                this._networkDebugMode ||
                    (this._renderMode === 0
                        ? this._entity.addBehaviour("box2dStep", this._behaviour)
                        : (this._intervalTimer = setInterval(this._behaviour, 1e3 / 60))));
    },
    stop: function () {
        this._active &&
            ((this._active = !1),
                this._renderMode === 0 ? this._entity.removeBehaviour("box2dStep") : clearInterval(this._intervalTimer));
    },
    _behaviour: function () {
        var t, i, e, o, s, n, r = this.box2d;
        if (r._active && r._world) {
            if (!r._world.IsLocked() && ((o = r._removeWhenReady), (s = o.length))) {
                n = r._world.DestroyBody;
                while (s--)
                    n.apply(r._world, [o[s]]);
                (r._removeWhenReady = []), (o = null);
            }
            r._renderMode === 0 ? r._world.Step(ige._tickDelta / 1e3, 8, 3) : r._world.Step(1 / 60, 8, 3),
                (t = r._world.GetBodyList());
            while (t)
                t._entity &&
                    ((i = t._entity),
                        (e = i._box2dBody),
                        t.IsAwake() && t.m_type !== 0
                            ? ((e.updating = !0),
                                i.translateTo(t.m_xf.position.x * r._scaleRatio, t.m_xf.position.y * r._scaleRatio, i._translate.z),
                                i.rotateTo(i._rotate.x, i._rotate.y, t.GetAngle()),
                                (e.updating = !1),
                                e.asleep && ((e.asleep = !1), r.emit("afterAwake", i)))
                            : e.asleep || ((e.asleep = !0), r.emit("afterAsleep", i))),
                    (t = t.GetNext());
            r._world.ClearForces(),
                (t = null),
                (i = null),
                typeof r._updateCallback == "function" && r._updateCallback();
        }
    },
    destroy: function () {
        this._entity.removeBehaviour("box2dStep");
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_81);
var $i_84 = $i_58.extend({
    classId: "$i_84",
    init: function (t, i) {
        $i_58.prototype.init.call(this), (this._entity = t), (this._options = i);
    },
    tick: function (t) {
        this._parent &&
            this._parent.isometricMounts() === 1 &&
            (t.scale(1.414, 0.707), t.rotate((45 * Math.PI) / 180)),
            this._entity.box2d._world.DrawDebugData(),
            $i_58.prototype.tick.call(this, t);
    }
}), $i_59Box2d = $i_59.extend({
    classId: "$i_59Box2d",
    init: function (t) {
        $i_59.prototype.init.call(this),
            t
                ? (typeof t == "string" && (t = ige.box2d.world(t)), (this._box2dWorld = t), (this._b2dRef = t))
                : (this._b2dRef = ige.box2d),
            ige.box2d &&
                (this._b2dRef._networkDebugMode
                    ? ((this._translateToProto = function () { }),
                        (this._translateByProto = function () { }),
                        (this._rotateToProto = function () { }),
                        (this._rotateByProto = function () { }),
                        (this._updateProto = this.update),
                        (this.update = this._update))
                    : ((this._translateToProto = this.translateTo),
                        (this._translateByProto = this.translateBy),
                        (this._rotateToProto = this.rotateTo),
                        (this._rotateByProto = this.rotateBy),
                        (this.translateTo = this._translateTo),
                        (this.translateBy = this._translateBy),
                        (this.rotateTo = this._rotateTo),
                        (this.rotateBy = this._rotateBy)));
    },
    box2dActive: function (t) {
        return this._box2dBody
            ? t !== void 0
                ? (this._box2dBody.SetActive(t), this)
                : this._box2dBody.IsActive()
            : this;
    },
    box2dBody: function (t) {
        return t !== void 0
            ? ((this._box2dBodyDef = t),
                ige.box2d
                    ? (this._box2dBody = this._b2dRef.createBody(this, t))
                    : this.log("You are trying to create a box2d entity but you have not added the box2d component to the ige instance!", "error"),
                this)
            : this._box2dBodyDef;
    },
    gravitic: function (t) {
        return this._box2dBody
            ? t !== void 0
                ? ((this._box2dBody.m_nonGravitic = !t),
                    (this._box2dBodyDef.gravitic = t),
                    this._box2dBody.SetAwake(!0),
                    this)
                : !this._box2dBody.m_nonGravitic
            : void 0;
    },
    _translateTo: function (t, i, e) {
        var o = this._box2dBody;
        return (this._translateToProto(t, i, e),
            o &&
                !o.updating &&
                (o.SetPosition({ x: t / this._b2dRef._scaleRatio, y: i / this._b2dRef._scaleRatio }),
                    o.SetAwake(!0)),
            this);
    },
    _translateBy: function (t, i, e) {
        this._translateTo(this._translate.x + t, this._translate.y + i, this._translate.z + e);
    },
    _rotateTo: function (t, i, e) {
        var o = this._box2dBody;
        return this._rotateToProto(t, i, e), o && !o.updating && (o.SetAngle(e), o.SetAwake(!0)), this;
    },
    _rotateBy: function (t, i, e) {
        this._rotateTo(this._rotate.x + t, this._rotate.y + i, this._rotate.z + e);
    },
    _update: function (t) {
        this._updateProto(t),
            this._translateTo(this._translate.x, this._translate.y, this._translate.z),
            this._rotateTo(this._rotate.x, this._rotate.y, this._rotate.z);
    },
    box2dNoDebug: function (t) {
        return t !== void 0 ? ((this._box2dNoDebug = t), this) : this._box2dNoDebug;
    },
    destroy: function () {
        this._box2dBody && this._b2dRef.destroyBody(this._box2dBody), $i_59.prototype.destroy.call(this);
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_59Box2d);
var $i_90 = $i_61.extend({
    classId: "$i_90",
    init: function () {
        $i_61.prototype.init.call(this),
            (this._min = 0),
            (this._max = 100),
            (this._progress = 0),
            (this._barColor = "#fff600"),
            (this._barText = { pre: "", post: "", color: "" });
    },
    barBackColor: function (t) {
        return t !== void 0 ? ((this._barBackColor = t), this) : this._barBackColor;
    },
    barColor: function (t) {
        return t !== void 0 ? ((this._barColor = t), this) : this._barColor;
    },
    barBorderColor: function (t) {
        return t !== void 0 ? ((this._barBorderColor = t), this) : this._barBorderColor;
    },
    barText: function (t, i, e) {
        return t !== void 0 && i !== void 0 && e !== void 0
            ? ((this._barText = { pre: t, post: i, color: e }), this)
            : this._barText;
    },
    min: function (t) {
        return t !== void 0 ? ((this._min = t), this) : this._min;
    },
    max: function (t) {
        return t !== void 0 ? ((this._max = t), this) : this._max;
    },
    progress: function (t) {
        return t !== void 0
            ? (this._min > t && (t = this._min), t > this._max && (t = this._max), (this._progress = t), this)
            : this._progress;
    },
    bindData: function (t, i) {
        return t !== void 0 && i !== void 0 && ((this._bindDataObject = t), (this._bindDataProperty = i)), this;
    },
    render: function (t) {
        this._bindDataObject &&
            this._bindDataProperty &&
            (this._bindDataObject._alive === !1
                ? delete this._bindDataObject
                : this.progress(parseInt(this._bindDataObject[this._bindDataProperty])));
        var i = this._min, e = this._max, o = this._progress, s = this._bounds2d.x / (e - i), n = (o - i) * s;
        o > e && (o = e),
            i > o && (o = i),
            this._barBackColor &&
                ((t.fillStyle = this._barBackColor),
                    t.fillRect(-this._bounds2d.x2, -this._bounds2d.y2, this._bounds2d.x, this._bounds2d.y)),
            this._barColor &&
                ((t.fillStyle = this._barColor),
                    t.fillRect(-this._bounds2d.x2, -this._bounds2d.y2, n, this._bounds2d.y)),
            this._barBorderColor &&
                ((t.strokeStyle = this._barBorderColor),
                    t.strokeRect(-this._bounds2d.x2, -this._bounds2d.y2, this._bounds2d.x, this._bounds2d.y)),
            this._barText &&
                (this._barText.pre || this._barText.post) &&
                ((t.textAlign = "center"),
                    (t.textBaseline = "middle"),
                    (t.fillStyle = this._barText.color),
                    t.fillText(this._barText.pre + (Math.floor(o) + "") + this._barText.post, 0, 0));
    },
    tick: function (t) {
        this._transformContext(t), this.render(t), $i_61.prototype.tick.call(this, t, !0);
    }
}), $i_113 = $i_59.extend({
    classId: "$i_113",
    init: function () {
        igeConfig.debug && (igeConfig.debug._enabled || (igeConfig.debug._timing = !1)),
            (this._alwaysInView = !0),
            (this._id = "ige"),
            (this.basePath = ""),
            (this.isServer = typeof module != "undefined" && module.exports !== void 0),
            (this.isClient = !this.isServer),
            (ige = this),
            console.log("------------------------------------------------------------------------------"),
            console.log("* Powered by the Isogenic Game Engine " + igeVersion + "                  *"),
            console.log("* (C)opyright " +
                new Date().getFullYear() +
                " Irrelon Software Limited                                  *"),
            console.log("* https://www.isogenicengine.com                                              *"),
            console.log("------------------------------------------------------------------------------"),
            $i_59.prototype.init.call(this),
            this.isClient && this.addComponent($i_42),
            (this._textureStore = []),
            (this._idCounter = new Date().getTime()),
            this.addComponent($i_14),
            this.addComponent($i_12),
            this.addComponent($i_9),
            this.isClient && this.addComponent($i_18),
            (this._renderContextModes = ["2d", "three"]),
            (this._requireScriptTotal = 0),
            (this._requireScriptLoading = 0),
            (this._loadingPreText = void 0),
            (this._enableUpdates = !0),
            (this._enableRenders = !0),
            (this._showSgTree = !1),
            (this._debugEvents = {}),
            (this._renderContext = "2d"),
            (this._renderMode = this._renderModes[this._renderContext]),
            (this._tickTime = "NA"),
            (this._updateTime = "NA"),
            (this._renderTime = "NA"),
            (this._tickDelta = 0),
            (this._fpsRate = 60),
            (this._state = 0),
            (this._textureImageStore = {}),
            (this._texturesLoading = 0),
            (this._texturesTotal = 0),
            (this._dependencyQueue = []),
            (this._drawCount = 0),
            (this._dps = 0),
            (this._dpf = 0),
            (this._frames = 0),
            (this._fps = 0),
            (this._clientNetDiff = 0),
            (this._frameAlternator = !1),
            (this._viewportDepth = !1),
            (this._mousePos = new $i_5(0, 0, 0)),
            (this._currentViewport = null),
            (this._currentCamera = null),
            (this._currentTime = 0),
            (this._globalSmoothing = !1),
            (this._register = { ige: this }),
            (this._categoryRegister = {}),
            (this._groupRegister = {}),
            (this._postTick = []),
            (this._timeSpentInUpdate = {}),
            (this._timeSpentLastUpdate = {}),
            (this._timeSpentInTick = {}),
            (this._timeSpentLastTick = {}),
            (this._timeScale = 1),
            (this._globalScale = new $i_5(1, 1, 1)),
            (this._graphInstances = []),
            (this._spawnQueue = []),
            (this._ctx = $i_49),
            (this._headless = !0),
            this.dependencyTimeout(3e4),
            this._dependencyQueue.push(this.texturesLoaded),
            (this._secondTimer = setInterval(this._secondTick, 1e3));
    },
    $: function (t) {
        return typeof t == "string" ? this._register[t] : typeof t == "object" ? t : this;
    },
    $$: function (t) {
        return this._categoryRegister[t] || new $i_78();
    },
    $$$: function (t) {
        return this._groupRegister[t] || new $i_78();
    },
    register: function (t) {
        return t !== void 0
            ? this._register[t.id()]
                ? ((t._registered = !1),
                    this.log('Cannot add object id "' +
                        t.id() +
                        '" to scenegraph because there is already another object in the graph with the same ID!', "error"),
                    !1)
                : ((this._register[t.id()] = t), (t._registered = !0), this)
            : this._register;
    },
    unRegister: function (t) {
        return (t !== void 0 && this._register[t.id()] && (delete this._register[t.id()], (t._registered = !1)), this);
    },
    categoryRegister: function (t) {
        return (t !== void 0 &&
            ((this._categoryRegister[t._category] = this._categoryRegister[t._category] || new $i_78()),
                this._categoryRegister[t._category].push(t),
                (t._categoryRegistered = !0)),
            this._register);
    },
    categoryUnRegister: function (t) {
        return (t !== void 0 &&
            this._categoryRegister[t._category] &&
            (this._categoryRegister[t._category].pull(t), (t._categoryRegistered = !1)),
            this);
    },
    groupRegister: function (t, i) {
        return (t !== void 0 &&
            ((this._groupRegister[i] = this._groupRegister[i] || new $i_78()),
                this._groupRegister[i].push(t),
                (t._groupRegistered = !0)),
            this._register);
    },
    groupUnRegister: function (t, i) {
        return (t !== void 0 &&
            (i !== void 0
                ? this._groupRegister[i] &&
                    (this._groupRegister[i].pull(t), t.groupCount() || (t._groupRegister = !1))
                : t.removeAllGroups()),
            this);
    },
    sync: function (t, i) {
        typeof i == "string" && (i = [i]),
            (this._syncArr = this._syncArr || []),
            this._syncArr.push({ method: t, attrArr: i }),
            this._syncArr.length === 1 && ((this._syncIndex = 0), this._processSync());
    },
    _processSync: function () {
        var t;
        ige._syncArr.length > ige._syncIndex
            ? ((t = ige._syncArr[ige._syncIndex]),
                t.attrArr.push(function () {
                    ige._syncIndex++, setTimeout(ige._processSync, 1);
                }),
                t.method.apply(ige, t.attrArr))
            : (delete ige._syncArr, delete ige._syncIndex, ige.emit("syncComplete"));
    },
    requireScript: function (t, i) {
        if (t !== void 0) {
            var e = this;
            e._requireScriptTotal++, e._requireScriptLoading++;
            var o = document.createElement("script");
            o.addEventListener("load", function () {
                e._requireScriptLoaded(this),
                    i &&
                        setTimeout(function () {
                            i();
                        }, 100);
            }),
                document.body.appendChild(o),
                (o.src = t),
                this.log("Loading script from: " + t),
                this.emit("requireScriptLoading", t);
        }
    },
    _requireScriptLoaded: function (t) {
        this._requireScriptLoading--,
            this.emit("requireScriptLoaded", t.src),
            this._requireScriptLoading === 0 && this.emit("allRequireScriptsLoaded");
    },
    requireStylesheet: function (t) {
        if (t !== void 0) {
            var i = document.createElement("link");
            (i.rel = "stylesheet"),
                (i.type = "text/css"),
                (i.media = "all"),
                (i.href = t),
                document.getElementsByTagName("head")[0].appendChild(i),
                this.log("Load css stylesheet from: " + t);
        }
    },
    addGraph: function (t, i) {
        if (t !== void 0) {
            var e, o = this.getClass(t);
            o
                ? (this.log("Loading SceneGraph data class: " + t),
                    (e = this.newClassInstance(t)),
                    typeof e.addGraph == "function" && typeof e.removeGraph == "function"
                        ? (e.addGraph(i), (this._graphInstances[t] = e))
                        : this.log('Could not load graph for class name "' +
                            t +
                            '" because the class does not implement both the require methods "addGraph()" and "removeGraph()".', "error"))
                : this.log('Cannot load graph for class name "' +
                    t +
                    '" because the class could not be found. Have you included it in your server/clientConfig.js file?', "error");
        }
        return this;
    },
    removeGraph: function (t, i) {
        if (t !== void 0) {
            var e = this._graphInstances[t];
            e
                ? (this.log("Removing SceneGraph data class: " + t),
                    e.removeGraph(i),
                    delete this._graphInstances[t])
                : this.log('Cannot remove graph for class name "' +
                    t +
                    '" because the class instance could not be found. Did you add it via ige.addGraph() ?', "error");
        }
        return this;
    },
    enableUpdates: function (t) {
        return t !== void 0 ? ((this._enableUpdates = t), this) : this._enableUpdates;
    },
    enableRenders: function (t) {
        return t !== void 0 ? ((this._enableRenders = t), this) : this._enableRenders;
    },
    debugEnabled: function (t) {
        return t !== void 0 ? (igeConfig.debug && (igeConfig.debug._enabled = t), this) : igeConfig.debug._enabled;
    },
    debugTiming: function (t) {
        return t !== void 0 ? (igeConfig.debug && (igeConfig.debug._timing = t), this) : igeConfig.debug._timing;
    },
    debug: function (t) {
        this._debugEvents[t] === !0 || this._debugEvents[t] === ige._frames;
    },
    debugEventOn: function (t) {
        this._debugEvents[t] = !0;
    },
    debugEventOff: function (t) {
        this._debugEvents[t] = !1;
    },
    triggerDebugEventFrame: function (t) {
        this._debugEvents[t] = ige._frames;
    },
    hideAllExcept: function (t) {
        var i, e = this._register;
        for (i in e)
            i !== t && e[i].opacity(0);
    },
    showAll: function () {
        var t, i = this._register;
        for (t in i)
            i[t].show();
    },
    setFps: function (t) {
        t !== void 0 &&
            (this.isServer
                ? (requestAnimFrame = function (i) {
                    setTimeout(function () {
                        i(new Date().getTime());
                    }, 1e3 / t);
                })
                : (window.requestAnimFrame = function (i) {
                    setTimeout(function () {
                        i(new Date().getTime());
                    }, 1e3 / t);
                }));
    },
    showStats: function () {
        this.log("showStats has been removed from the ige in favour of the new editor component, please remove this call from your code.");
    },
    defineClass: function (t, i) {
        igeClassStore[t] = i;
    },
    getClass: function (t) {
        return igeClassStore[t];
    },
    classDefined: function (t) {
        return Boolean(igeClassStore[t]);
    },
    newClassInstance: function (t, i) {
        return new igeClassStore[t](i);
    },
    dependencyCheck: function () {
        var t = this._dependencyQueue, i = t.length;
        while (i--)
            if (!this._dependencyQueue[i]())
                return !1;
        return !0;
    },
    viewportDepth: function (t) {
        return t !== void 0 ? ((this._viewportDepth = t), this) : this._viewportDepth;
    },
    dependencyTimeout: function (t) {
        this._dependencyCheckTimeout = t;
    },
    updateProgress: function () {
        if (typeof document != "undefined" && document.getElementById) {
            var t = document.getElementById("loadingProgressBar"), i = document.getElementById("loadingText");
            if (t) {
                var e = parseInt(t.parentNode.offsetWidth), o = Math.floor((e / this._texturesTotal) * (this._texturesTotal - this._texturesLoading));
                (t.style.width = o + "px"),
                    i &&
                        (this._loadingPreText === void 0 && (this._loadingPreText = i.innerHTML),
                            (i.innerHTML =
                                this._loadingPreText +
                                    " " +
                                    Math.floor((100 / this._texturesTotal) * (this._texturesTotal - this._texturesLoading)) +
                                    "%"));
            }
        }
    },
    textureLoadStart: function (t, i) {
        this._texturesLoading++, this._texturesTotal++, this.updateProgress(), this.emit("textureLoadStart", i);
    },
    textureLoadEnd: function (t, i) {
        var e = this;
        i._destroyed || this._textureStore.push(i),
            this._texturesLoading--,
            this.updateProgress(),
            this.emit("textureLoadEnd", i),
            this._texturesLoading === 0 &&
                (this.updateProgress(),
                    setTimeout(function () {
                        e._allTexturesLoaded();
                    }, 100));
    },
    textureFromUrl: function (t) {
        var i, e = this._textureStore, o = e.length;
        while (o--)
            if (((i = e[o]), i._url === t))
                return i;
    },
    texturesLoaded: function () {
        return ige._texturesLoading === 0;
    },
    _allTexturesLoaded: function () {
        this._loggedATL || ((this._loggedATL = !0), this.log("All textures have loaded")),
            this.emit("texturesLoaded");
    },
    globalSmoothing: function (t) {
        return t !== void 0 ? ((this._globalSmoothing = t), this) : this._globalSmoothing;
    },
    canvasReady: function () {
        return ige._canvas !== void 0 || isServer;
    },
    newId: function () {
        return (this._idCounter++,
            this._idCounter +
                (Math.random() * Math.pow(10, 17) +
                    Math.random() * Math.pow(10, 17) +
                    Math.random() * Math.pow(10, 17) +
                    Math.random() * Math.pow(10, 17)) +
                "");
    },
    newIdHex: function () {
        return (this._idCounter++,
            (this._idCounter +
                (Math.random() * Math.pow(10, 17) +
                    Math.random() * Math.pow(10, 17) +
                    Math.random() * Math.pow(10, 17) +
                    Math.random() * Math.pow(10, 17))).toString(16));
    },
    newIdFromString: function (t) {
        if (t !== void 0) {
            var i, e, o = 0, s = t.length;
            for (e = 0; s > e; e++)
                o += t.charCodeAt(e) * Math.pow(10, 17);
            i = o.toString(16);
            while (ige.$(i))
                (o += Math.pow(10, 17)), (i = o.toString(16));
            return i;
        }
    },
    start: function (t) {
        if (!ige._state)
            if (ige.dependencyCheck()) {
                if ((ige.log("Starting engine..."),
                    (ige._state = 1),
                    this.isClient &&
                        document.getElementsByClassName &&
                        document.getElementsByClassName("igeLoading"))) {
                    var i = document.getElementsByClassName("igeLoading"), e = i.length;
                    while (e--)
                        i[e].parentNode.removeChild(i[e]);
                }
                requestAnimFrame(ige.engineStep), ige.log("Engine started"), typeof t == "function" && t(!0);
            }
            else {
                var o = new Date().getTime();
                ige._dependencyCheckStart || (ige._dependencyCheckStart = o),
                    o - ige._dependencyCheckStart > this._dependencyCheckTimeout
                        ? (this.log("Engine start failed because the dependency check timed out after " +
                            this._dependencyCheckTimeout / 1e3 +
                            " seconds", "error"),
                            typeof t == "function" && t(!1))
                        : setTimeout(function () {
                            ige.start(t);
                        }, 200);
            }
    },
    stop: function () {
        return this._state ? (this.log("Stopping engine..."), (this._state = 0), !0) : !1;
    },
    autoSize: function (t) {
        return t !== void 0 ? ((this._autoSize = t), this) : this._autoSize;
    },
    pixelRatioScaling: function (t) {
        return t !== void 0 ? ((this._pixelRatioScaling = t), this) : this._pixelRatioScaling;
    },
    renderContext: function (t) {
        return t !== void 0
            ? ((this._renderContext = t),
                (this._renderMode = this._renderModes[t]),
                this.log("Rendering mode set to: " + t),
                this)
            : this._renderContext;
    },
    createFrontBuffer: function (t, i) {
        this.isClient &&
            (this._canvas ||
                ((this._createdFrontBuffer = !0), (this._pixelRatioScaling = !i), this._frontBufferSetup(t, i)));
    },
    _frontBufferSetup: function (t) {
        var i = document.createElement("canvas");
        (i.id = "igeFrontBuffer"), this.canvas(i, t), document.body.appendChild(i);
    },
    canvas: function (t, i) {
        return (t !== void 0 &&
            (this._canvas ||
                ((this._canvas = t),
                    (this._ctx = this._canvas.getContext("2d")),
                    this._pixelRatioScaling
                        ? ((this._devicePixelRatio = window.devicePixelRatio || 1),
                            (this._backingStoreRatio =
                                this._ctx.webkitBackingStorePixelRatio ||
                                    this._ctx.mozBackingStorePixelRatio ||
                                    this._ctx.msBackingStorePixelRatio ||
                                    this._ctx.oBackingStorePixelRatio ||
                                    this._ctx.backingStorePixelRatio ||
                                    1),
                            (this._deviceFinalDrawRatio = this._devicePixelRatio / this._backingStoreRatio))
                        : ((this._devicePixelRatio = 1),
                            (this._backingStoreRatio = 1),
                            (this._deviceFinalDrawRatio = 1)),
                    i && (this._autoSize = i),
                    window.addEventListener("resize", this._resizeEvent),
                    this._resizeEvent(),
                    (this._ctx = this._canvas.getContext("2d")),
                    (this._headless = !1),
                    this.input.setupListeners(this._canvas))),
            this._canvas);
    },
    clearCanvas: function () {
        this._ctx && this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    },
    removeCanvas: function () {
        this.input && this.input.destroyListeners(),
            window.removeEventListener("resize", this._resizeEvent),
            this._createdFrontBuffer && document.body.removeChild(this._canvas),
            delete this._canvas,
            delete this._ctx,
            (this._ctx = $i_49),
            (this._headless = !0);
    },
    openUrl: function (t) {
        t !== void 0 && (ige.cocoonJs && ige.cocoonJs.detected ? ige.cocoonJs.openUrl(t) : window.open(t));
    },
    showWebView: function (t) {
        if (ige.cocoonJs && ige.cocoonJs.detected)
            ige.cocoonJs.showWebView(t);
        else {
            var i = document.getElementById("igeOverlay");
            i ||
                ((i = document.createElement("iframe")),
                    (i.id = "igeOverlay"),
                    (i.style.position = "absolute"),
                    (i.style.border = "none"),
                    (i.style.left = "0px"),
                    (i.style.top = "0px"),
                    (i.style.width = "100%"),
                    (i.style.height = "100%"),
                    document.body.appendChild(i)),
                t !== void 0 && (i.src = t),
                (i.style.display = "block");
        }
        return this;
    },
    hideWebView: function () {
        if (ige.cocoonJs && ige.cocoonJs.detected)
            ige.cocoonJs.hideWebView();
        else {
            var t = document.getElementById("igeOverlay");
            t && (t.style.display = "none");
        }
        return this;
    },
    layerCall: function (js) {
        js !== void 0 && eval(js);
    },
    mousePos: function () {
        return this._mousePos.clone();
    },
    mouseOverList: function (t, i) {
        var e, o, s, n, r = !1;
        if ((t || ((t = ige), (i = []), (r = !0)), t === ige)) {
            if ((e = t._children)) {
                o = e.length;
                while (o--)
                    e[o]._scene && e[o]._scene._shouldRender && this.mouseOverList(e[o]._scene, i);
            }
        }
        else if (((s = this.mousePosWorld()),
            s && t.aabb && ((n = t.aabb()), n.xyInside(s.x, s.y) && i.push(t)),
            (e = t._children))) {
            o = e.length;
            while (o--)
                this.mouseOverList(e[o], i);
        }
        return r && i.reverse(), i;
    },
    _resizeEvent: function (t) {
        var i;
        if (ige._autoSize) {
            var e = window.innerWidth, o = window.innerHeight, s = ige._children, n = s.length;
            ige._canvas &&
                ((i = ige._canvasPosition()),
                    (e -= parseInt(i.left)),
                    (o -= parseInt(i.top)),
                    e % 2 && e--,
                    o % 2 && o--,
                    (ige._canvas.width = e * ige._deviceFinalDrawRatio),
                    (ige._canvas.height = o * ige._deviceFinalDrawRatio),
                    ige._deviceFinalDrawRatio !== 1 &&
                        ((ige._canvas.style.width = e + "px"),
                            (ige._canvas.style.height = o + "px"),
                            ige._ctx.scale(ige._deviceFinalDrawRatio, ige._deviceFinalDrawRatio))),
                (ige._bounds2d = new $i_5(e, o, 0));
            while (n--)
                s[n]._resizeEvent(t);
        }
        else
            ige._canvas && (ige._bounds2d = new $i_5(ige._canvas.width, ige._canvas.height, 0));
        if (ige._showSgTree) {
            var r = document.getElementById("igeSgTree");
            (i = ige._canvasPosition()),
                (r.style.top = parseInt(i.top) + 5 + "px"),
                (r.style.left = parseInt(i.left) + 5 + "px"),
                (r.style.height = ige._bounds2d.y - 30 + "px");
        }
        ige._resized = !0;
    },
    _canvasPosition: function () {
        try {
            return ige._canvas.getBoundingClientRect();
        }
        catch (t) {
            return { top: ige._canvas.offsetTop, left: ige._canvas.offsetLeft };
        }
    },
    toggleFullScreen: function () {
        var t = this._canvas;
        t.requestFullscreen
            ? t.requestFullscreen()
            : t.mozRequestFullScreen
                ? t.mozRequestFullScreen()
                : t.webkitRequestFullscreen && t.webkitRequestFullscreen();
    },
    watchStart: function (t) {
        return (this._watch = this._watch || []), this._watch.push(t), this._watch.length - 1;
    },
    watchStop: function (t) {
        (this._watch = this._watch || []), this._watch.splice(t, 1);
    },
    traceSet: function (t, i, e, o) {
        (t.___igeTraceCurrentVal = t.___igeTraceCurrentVal || {}),
            (t.___igeTraceCurrentVal[i] = t[i]),
            (t.___igeTraceMax = e || 1),
            (t.___igeTraceCount = 0),
            Object.defineProperty(t, i, {
                get: function () {
                    return t.___igeTraceCurrentVal[i];
                },
                set: function (e) {
                    o && o(e),
                        (t.___igeTraceCurrentVal[i] = e),
                        t.___igeTraceCount++,
                        t.___igeTraceCount === t.___igeTraceMax && ige.traceSetOff(t, i);
                }
            });
    },
    traceSetOff: function (t, i) {
        Object.defineProperty(t, i, {
            set: function (t) {
                this.___igeTraceCurrentVal[i] = t;
            }
        });
    },
    findBaseClass: function (t) {
        return t && t._classId
            ? t._classId.substr(0, 3) === "Ige"
                ? t._classId
                : t.__proto__._classId
                    ? this.findBaseClass(t.__proto__)
                    : ""
            : "";
    },
    getClassDerivedList: function (t, i) {
        return (i ? t._classId && i.push(t._classId) : (i = []),
            t.__proto__._classId && this.getClassDerivedList(t.__proto__, i),
            i);
    },
    spawnQueue: function (t) {
        return t !== void 0 ? (this._spawnQueue.push(t), this) : this._spawnQueue;
    },
    _secondTick: function () {
        var t = ige;
        (t._fps = t._frames), (t._dps = t._dpf * t._fps), (t._frames = 0), (t._drawCount = 0);
    },
    timeScale: function (t) {
        return t !== void 0 ? ((this._timeScale = t), this) : this._timeScale;
    },
    incrementTime: function (t, i) {
        return this._pause || (i || (i = t), (this._currentTime += (t - i) * this._timeScale)), this._currentTime;
    },
    currentTime: function () {
        return this._currentTime;
    },
    pause: function (t) {
        return t !== void 0 ? ((this._pause = t), this) : this._pause;
    },
    useManualTicks: function (t) {
        return t !== void 0 ? ((this._useManualTicks = t), this) : this._useManualTicks;
    },
    manualTick: function () {
        this._manualFrameAlternator !== this._frameAlternator &&
            ((this._manualFrameAlternator = this._frameAlternator), requestAnimFrame(this.engineStep));
    },
    useManualRender: function (t) {
        return t !== void 0 ? ((this._useManualRender = t), this) : this._useManualRender;
    },
    manualRender: function () {
        this._manualRenderQueued = !0;
    },
    engineStep: function (t, i) {
        var e, o, s, n, r, a, h, l, c, _ = ige, m = _._postTick, u = m.length;
        if ((_.incrementTime(t, _._timeScaleLastTimestamp),
            (_._timeScaleLastTimestamp = t),
            (t = Math.floor(_._currentTime)),
            igeConfig.debug._timing && (e = new Date().getTime()),
            _._state)) {
            for (i === void 0 && (i = _._ctx),
                _._frameAlternator = !_._frameAlternator,
                ige._useManualTicks
                    ? (_._manualFrameAlternator = !_._frameAlternator)
                    : requestAnimFrame(_.engineStep),
                _._tickStart = t,
                _._tickStart -= _._clientNetDiff,
                _.lastTick
                    ? (_._tickDelta = _._tickStart - _.lastTick)
                    : ((_.lastTick = 0), (_._tickDelta = 0)),
                a = ige._spawnQueue,
                h = a.length,
                l = h - 1; l >= 0; l--)
                (c = a[l]), c._bornTime > ige._currentTime || (c.mount(ige.$(c._birthMount)), a.splice(l, 1));
            for (_._enableUpdates &&
                (igeConfig.debug._timing
                    ? ((s = new Date().getTime()),
                        _.updateSceneGraph(i),
                        (ige._updateTime = new Date().getTime() - s))
                    : _.updateSceneGraph(i)),
                _._enableRenders &&
                    (_._useManualRender
                        ? _._manualRender &&
                            (igeConfig.debug._timing
                                ? ((n = new Date().getTime()),
                                    _.renderSceneGraph(i),
                                    (ige._renderTime = new Date().getTime() - n))
                                : _.renderSceneGraph(i),
                                (_._manualRender = !1))
                        : igeConfig.debug._timing
                            ? ((n = new Date().getTime()),
                                _.renderSceneGraph(i),
                                (ige._renderTime = new Date().getTime() - n))
                            : _.renderSceneGraph(i)),
                r = 0; u > r; r++)
                m[r]();
            (_.lastTick = _._tickStart), _._frames++, (_._dpf = _._drawCount), (_._drawCount = 0), _.input.tick();
        }
        (_._resized = !1), igeConfig.debug._timing && ((o = new Date().getTime()), (ige._tickTime = o - e));
    },
    updateSceneGraph: function (t) {
        var i, e, o, s = this._children, n = ige._tickDelta;
        if ((this._processUpdateBehaviours(t, n), s))
            if (((i = s.length), igeConfig.debug._timing))
                while (i--)
                    (e = new Date().getTime()),
                        s[i].update(t, n),
                        (o = new Date().getTime() - e),
                        s[i] &&
                            (ige._timeSpentInUpdate[s[i].id()] || (ige._timeSpentInUpdate[s[i].id()] = 0),
                                ige._timeSpentLastUpdate[s[i].id()] || (ige._timeSpentLastUpdate[s[i].id()] = {}),
                                (ige._timeSpentInUpdate[s[i].id()] += o),
                                (ige._timeSpentLastUpdate[s[i].id()].ms = o));
            else
                while (i--)
                    s[i].update(t, n);
    },
    renderSceneGraph: function (t) {
        var i, e;
        this._processTickBehaviours(t),
            this._viewportDepth &&
                (igeConfig.debug._timing
                    ? ((i = new Date().getTime()),
                        this.depthSortChildren(),
                        (e = new Date().getTime() - i),
                        ige._timeSpentLastTick[this.id()] || (ige._timeSpentLastTick[this.id()] = {}),
                        (ige._timeSpentLastTick[this.id()].depthSortChildren = e))
                    : this.depthSortChildren()),
            t.save(),
            t.translate(this._bounds2d.x2, this._bounds2d.y2);
        var o, s = this._children;
        if (s)
            if (((o = s.length), igeConfig.debug._timing))
                while (o--)
                    t.save(),
                        (i = new Date().getTime()),
                        s[o].tick(t),
                        (e = new Date().getTime() - i),
                        s[o] &&
                            (ige._timeSpentInTick[s[o].id()] || (ige._timeSpentInTick[s[o].id()] = 0),
                                ige._timeSpentLastTick[s[o].id()] || (ige._timeSpentLastTick[s[o].id()] = {}),
                                (ige._timeSpentInTick[s[o].id()] += e),
                                (ige._timeSpentLastTick[s[o].id()].ms = e)),
                        t.restore();
            else
                while (o--)
                    t.save(), s[o].tick(t), t.restore();
        t.restore();
    },
    fps: function () {
        return this._fps;
    },
    dpf: function () {
        return this._dpf;
    },
    dps: function () {
        return this._dps;
    },
    analyseTiming: function () {
        igeConfig.debug._timing ||
            this.log("Cannot analyse timing because the igeConfig.debug._timing flag is not enabled so no timing data has been recorded!", "warning");
    },
    saveSceneGraph: function (t) {
        var i, e, o;
        if ((t || (t = this.getSceneGraphData()),
            t.obj.stringify
                ? (t.str = t.obj.stringify())
                : console.log("Class " + t.classId + " has no stringify() method! For object: " + t.id, t.obj),
            (i = t.items)))
            for (e = i.length, o = 0; e > o; o++)
                this.saveSceneGraph(i[o]);
        return t;
    },
    sceneGraph: function (t, i) {
        var e, o, s, n, r = "";
        for (i === void 0 && (i = 0), t || (t = ige), e = 0; i > e; e++)
            r += "----";
        if ((igeConfig.debug._timing
            ? ((o = ""),
                (o += "T: " + ige._timeSpentInTick[t.id()]),
                ige._timeSpentLastTick[t.id()] &&
                    (typeof ige._timeSpentLastTick[t.id()].ms == "number" &&
                        (o += " | LastTick: " + ige._timeSpentLastTick[t.id()].ms),
                        typeof ige._timeSpentLastTick[t.id()].depthSortChildren == "number" &&
                            (o += " | ChildDepthSort: " + ige._timeSpentLastTick[t.id()].depthSortChildren)),
                console.log(r + t.id() + " (" + t._classId + ") : " + t._inView + " Timing(" + o + ")"))
            : console.log(r + t.id() + " (" + t._classId + ") : " + t._inView),
            i++,
            t === ige)) {
            if ((s = t._children)) {
                n = s.length;
                while (n--)
                    s[n]._scene &&
                        s[n]._scene._shouldRender &&
                        (igeConfig.debug._timing
                            ? ((o = ""),
                                (o += "T: " + ige._timeSpentInTick[s[n].id()]),
                                ige._timeSpentLastTick[s[n].id()] &&
                                    (typeof ige._timeSpentLastTick[s[n].id()].ms == "number" &&
                                        (o += " | LastTick: " + ige._timeSpentLastTick[s[n].id()].ms),
                                        typeof ige._timeSpentLastTick[s[n].id()].depthSortChildren == "number" &&
                                            (o +=
                                                " | ChildDepthSort: " +
                                                    ige._timeSpentLastTick[s[n].id()].depthSortChildren)),
                                console.log(r +
                                    "----" +
                                    s[n].id() +
                                    " (" +
                                    s[n]._classId +
                                    ") : " +
                                    s[n]._inView +
                                    " Timing(" +
                                    o +
                                    ")"))
                            : console.log(r + "----" + s[n].id() + " (" + s[n]._classId + ") : " + s[n]._inView),
                            this.sceneGraph(s[n]._scene, i + 1));
            }
        }
        else if ((s = t._children)) {
            n = s.length;
            while (n--)
                this.sceneGraph(s[n], i);
        }
    },
    getSceneGraphData: function (t, i) {
        var e, o, s, n, r, a, h = [];
        if ((t || (t = ige),
            (e = { text: "[" + t._classId + "] " + t.id(), id: t.id(), classId: t.classId() }),
            i ? (e.parentId = t._parent ? t._parent.id() : "sceneGraph") : ((e.parent = t._parent), (e.obj = t)),
            t === ige)) {
            if ((r = t._children)) {
                a = r.length;
                while (a--)
                    (o = { text: "[" + r[a]._classId + "] " + r[a].id(), id: r[a].id(), classId: r[a].classId() }),
                        i
                            ? r[a]._parent && (o.parentId = r[a]._parent.id())
                            : ((o.parent = r[a]._parent), (o.obj = r[a])),
                        r[a].camera
                            ? ((n = {
                                text: "[$i_70] " + r[a].id(),
                                id: r[a].camera.id(),
                                classId: r[a].camera.classId()
                            }),
                                i ? (n.parentId = r[a].id()) : ((n.parent = r[a]), (n.obj = r[a].camera)),
                                r[a]._scene && ((s = this.getSceneGraphData(r[a]._scene, i)), (o.items = [n, s])))
                            : r[a]._scene && ((s = this.getSceneGraphData(r[a]._scene, i)), (o.items = [s])),
                        h.push(o);
            }
        }
        else if ((r = t._children)) {
            a = r.length;
            while (a--)
                (o = this.getSceneGraphData(r[a], i)), h.push(o);
        }
        return h.length > 0 && (e.items = h), e;
    },
    _childMounted: function (t) {
        t.$i_71 && (ige._currentViewport || ((ige._currentViewport = t), (ige._currentCamera = t.camera))),
            $i_59.prototype._childMounted.call(this, t);
    },
    destroy: function () {
        this.stop(),
            this.isClient && this.removeCanvas(),
            $i_59.prototype.destroy.call(this),
            this.log("Engine destroy complete.");
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = $i_113);
var ClientWorld = {
    createWorld: function () {
        (this.mainScene = new $i_72().id("mainScene")),
            (this.objectScene = new $i_72().id("objectScene").mount(this.mainScene)),
            (this.uiScene = new $i_72().id("uiScene").ignoreCamera(!0).mount(this.mainScene)),
            new $i_62()
                .texture(ige.client.textures.font)
                .width(100)
                .text("Score")
                .top(5)
                .right(10)
                .mount(this.uiScene),
            new $i_62()
                .id("scoreText")
                .texture(ige.client.textures.font)
                .width(100)
                .text("0 points")
                .colorOverlay("#ff6000")
                .top(35)
                .right(10)
                .mount(this.uiScene),
            new $i_62()
                .texture(ige.client.textures.font)
                .width(100)
                .text("Fuel Level")
                .top(80)
                .right(10)
                .mount(this.uiScene),
            new $i_90()
                .id("player_fuelBar")
                .max(100)
                .min(0)
                .right(10)
                .top(120)
                .width(100)
                .height(10)
                .barBackColor("#953800")
                .barColor("#ff6000")
                .mount(ige.client.uiScene),
            (this.vp1 = new $i_71()
                .id("vp1")
                .autoSize(!0)
                .scene(this.mainScene)
                .drawBounds(!1)
                .drawBoundsData(!0)
                .mount(ige));
    }
}, ClientTerrain = {
    createTerrain: function () {
        var t, i, e, o, s;
        this.landingPads = [];
        while (!this.landingPadPositions ||
            !this.orbPositions ||
            1 > this.landingPadPositions.length ||
            3 > this.orbPositions.length) {
            for (this.landingPadPositions = [],
                this.orbPositions = [],
                this.terrain = [],
                e = new $i_6(),
                e.addPoint(0, 20),
                t = 0; 40 > t; t++)
                (i = Math.random() * 100),
                    (this.terrain[t] = Math.floor(Math.random() * 20)),
                    i > 90 && t > 1
                        ? 160 > this.terrain[t] * 20 &&
                            ((this.terrain[t + 1] = this.terrain[t]),
                                this.landingPadPositions.push([t * 4 * 20 + 40, this.terrain[t] * 20 - 2, 0]),
                                e.addPoint(t * 4, this.terrain[t]),
                                e.addPoint((t + 1) * 4, this.terrain[t]),
                                t++)
                        : (e.addPoint(t * 4, this.terrain[t]),
                            i > 50 &&
                                this.terrain[t] * 20 > 200 &&
                                t > 2 &&
                                39 > t &&
                                this.orbPositions.push([t * 4 * 20, this.terrain[t] * 20 - 20, 0]));
            e.addPoint(t * 4, 20);
        }
        for (t = 0; this.landingPadPositions.length > t; t++)
            (o = new LandingPad()
                .translateTo(this.landingPadPositions[t][0], this.landingPadPositions[t][1], 0)
                .mount(ige.client.objectScene)),
                this.landingPads.push(o);
        for (t = 0; this.orbPositions.length > t; t++)
            new Orb()
                .translateTo(this.orbPositions[t][0], this.orbPositions[t][1], 0)
                .scoreValue(Math.floor(this.orbPositions[t][1] / 4))
                .mount(ige.client.objectScene);
        for (e.multiply(20),
            this.terrainPoly = e,
            this.terrainTriangles = this.terrainPoly.clone(),
            this.terrainTriangles.divide(ige.box2d._scaleRatio),
            this.terrainTriangles = this.terrainTriangles.triangulate(),
            s = [],
            t = 0; this.terrainTriangles.length > t; t++)
            s.push({
                filter: { categoryBits: 1, maskBits: 65535 },
                shape: { type: "polygon", data: this.terrainTriangles[t] }
            });
        new $i_59Box2d().category("floor").box2dBody({ type: "static", allowSleep: !0, fixtures: s });
        var n = $i_59.extend({
            classId: "TerrainEntity",
            tick: function (t) {
                $i_59.prototype.tick.call(this, t), (t.strokeStyle = "#ffffff"), ige.client.terrainPoly.render(t);
            }
        });
        new n().mount(ige.client.mainScene);
    }
}, Orb = $i_59Box2d.extend({
    classId: "Orb",
    init: function () {
        $i_59Box2d.prototype.init.call(this),
            (this._rectColor = "#ffc600"),
            this.category("orb")
                .texture(ige.client.textures.orb)
                .width(10)
                .height(10)
                .box2dBody({
                type: "dynamic",
                linearDamping: 0,
                angularDamping: 0.05,
                allowSleep: !0,
                bullet: !1,
                gravitic: !0,
                fixedRotation: !1,
                fixtures: [
                    { density: 1, filter: { categoryBits: 256, maskBits: 65535 }, shape: { type: "circle" } }
                ]
            });
    },
    originalStart: function (t) {
        this._originalStart = t.clone();
    },
    scoreValue: function (t) {
        return t !== void 0 ? ((this._scoreValue = t), this) : this._scoreValue;
    },
    distanceBonus: function (t) {
        var i = t._translate.x - this._originalStart.x, e = t._translate.y - this._originalStart.y, o = Math.sqrt(i * i + e * e);
        return Math.floor(o / 10);
    },
    deposit: function (t, i) {
        t && ige.client.player.dropOrb();
        var e = this.distanceBonus(i);
        new ClientScore("+" + this._scoreValue + " for orb")
            .translateTo(this._translate.x, this._translate.y, 0)
            .mount(ige.client.objectScene)
            .start(),
            new ClientScore("+" + e + " for distance")
                .translateTo(this._translate.x, this._translate.y - 30, 0)
                .mount(ige.client.objectScene)
                .start(500),
            new ClientScore("+" + (this._scoreValue + e) + " total")
                .translateTo(this._translate.x, this._translate.y - 15, 0)
                .mount(ige.client.objectScene)
                .start(3e3),
            (ige.client.player._score += this._scoreValue + e),
            this.destroy();
    }
}), Player = $i_59Box2d.extend({
    classId: "Player",
    init: function (t) {
        $i_59Box2d.prototype.init.call(this);
        var i = this;
        (i._thrustPower = 0.5),
            (i._fuel = 100),
            (i._score = 0),
            (i.controls = { left: !1, right: !1, thrust: !1 }),
            i.id(t),
            i.addComponent($i_11).category("ship").texture(ige.client.textures.ship).width(20).height(20);
        var e, o, s = new $i_6()
            .addPoint(0, -this._bounds2d.y2)
            .addPoint(this._bounds2d.x2, this._bounds2d.y2)
            .addPoint(0, this._bounds2d.y2 - 5)
            .addPoint(-this._bounds2d.x2, this._bounds2d.y2);
        s.divide(ige.box2d._scaleRatio), (e = s.triangulate()), (this.triangles = e), (o = []);
        for (var n = 0; this.triangles.length > n; n++)
            o.push({
                density: 1,
                friction: 1,
                restitution: 0.2,
                filter: { categoryBits: 4, maskBits: 65527 },
                shape: { type: "polygon", data: this.triangles[n] }
            });
        o.push({
            density: 0,
            friction: 0,
            restitution: 0,
            isSensor: !0,
            filter: { categoryBits: 8, maskBits: 256 },
            shape: { type: "circle", data: { radius: 60 } }
        }),
            i.box2dBody({
                type: "dynamic",
                linearDamping: 0,
                angularDamping: 0.5,
                allowSleep: !0,
                bullet: !0,
                gravitic: !0,
                fixedRotation: !1,
                fixtures: o
            }),
            (i.thrustEmitter = new $i_63()
                .particle(ThrustParticle)
                .lifeBase(300)
                .quantityBase(60)
                .quantityTimespan(1e3)
                .deathOpacityBase(0)
                .velocityVector(new $i_5(0, 0.05, 0), new $i_5(-0.04, 0.05, 0), new $i_5(0.04, 0.15, 0))
                .particleMountTarget(ige.client.objectScene)
                .translateTo(0, 5, 0)
                .mount(i));
    },
    crash: function () {
        var t = this;
        this.dropOrb(),
            new $i_63()
                .particle(ExplosionParticle)
                .lifeBase(400)
                .quantityBase(100)
                .quantityTimespan(150)
                .deathOpacityBase(0)
                .velocityVector(new $i_5(0, -0.1, 0), new $i_5(-0.1, -0.1, 0), new $i_5(0.1, 0.1, 0))
                .linearForceVector(new $i_5(0, 0.5, 0))
                .particleMountTarget(ige.client.objectScene)
                .lifeSpan(150)
                .mount(ige.client.objectScene)
                .translateTo(this._translate.x, this._translate.y, 0)
                .start(),
            this.unMount(),
            this._box2dBody.SetAwake(!1),
            this._box2dBody.SetActive(!1),
            (this._countDownText = new ClientCountDown("Respawn in ", 3, "s", 1e3)
                .translateTo(this._translate.x, this._translate.y, 0)
                .rotateTo(0, 0, -ige.client.vp1.camera._rotate.z)
                .mount(ige.client.objectScene)
                .start()),
            this._countDownText._rotate
                .tween()
                .duration(2e3)
                .properties({ z: Math.radians(360) })
                .easing("outElastic")
                .start(),
            this._countDownText.on("complete", function () {
                t.respawn();
            });
    },
    respawn: function () {
        this._countDownText.destroy(),
            this.rotateTo(0, 0, 0)
                .translateTo(ige.client.landingPads[0]._translate.x, ige.client.landingPads[0]._translate.y - 20, 0)
                .mount(ige.client.objectScene),
            this._box2dBody.SetAngularVelocity(0),
            this._box2dBody.SetLinearVelocity(new $i_5(0, 0, 0)),
            this._box2dBody.SetActive(!0),
            (this._fuel = 100),
            new ClientScore("-100 for crash!")
                .colorOverlay("#ff6f6f")
                .translateTo(this._translate.x, this._translate.y + 50, 0)
                .mount(ige.client.objectScene)
                .start(),
            (this._score -= 100);
    },
    tick: function (t) {
        this._landed &&
            100 > this._fuel &&
            ((this._fuel += 0.05 * ige._tickDelta), this._fuel > 100 && (this._fuel = 100)),
            1 + 0.1 * (this._translate.y / 100),
            $i_59Box2d.prototype.tick.call(this, t),
            this._carryingOrb &&
                (t.save(),
                    t.rotate(-this._rotate.z),
                    (t.strokeStyle = "#a6fff6"),
                    t.beginPath(),
                    t.moveTo(0, 0),
                    t.lineTo(this._orb._translate.x - this._translate.x, this._orb._translate.y - this._translate.y),
                    t.stroke(),
                    t.restore()),
            ige.$("player_fuelBar").progress(this._fuel),
            ige.$("scoreText").text(this._score + " points"),
            this._currentTime - 2e3 > this._dropTime && (delete this._oldOrb, delete this._dropTime);
    },
    carryOrb: function (t, i) {
        if (!this._oldOrb || this._oldOrb !== t) {
            var e = new ige.box2d.b2DistanceJointDef(), o = i.m_fixtureA.m_body, s = i.m_fixtureB.m_body;
            e.Initialize(o, s, o.GetWorldCenter(), s.GetWorldCenter()),
                (this._orbRope = ige.box2d._world.CreateJoint(e)),
                (this._carryingOrb = !0),
                (this._orb = t),
                t.originalStart(t._translate);
        }
    },
    dropOrb: function () {
        this._carryingOrb &&
            (ige.box2d._world.DestroyJoint(this._orbRope),
                (this._oldOrb = this._orb),
                (this._dropTime = ige._currentTime),
                delete this._orbRope,
                delete this._orb,
                (this._carryingOrb = !1));
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = Player);
var PlayerBehaviour = function () {
    if ((ige.components.input.actionState("left")
        ? this.controls.left || (this.controls.left = !0)
        : this.controls.left && ((this.controls.left = !1), this._box2dBody.SetAngularVelocity(0)),
        ige.components.input.actionState("right")
            ? this.controls.right || (this.controls.right = !0)
            : this.controls.right && ((this.controls.right = !1), this._box2dBody.SetAngularVelocity(0)),
        ige.components.input.actionState("thrust")
            ? this.controls.thrust || (this.controls.thrust = !0)
            : this.controls.thrust && (this.controls.thrust = !1),
        this.controls.left && this._box2dBody.SetAngularVelocity(-2.5),
        this.controls.right && this._box2dBody.SetAngularVelocity(2.5),
        this.controls.thrust && this._fuel > 0)) {
        var t = this._rotate.z + Math.radians(-90), i = new ige.box2d.b2Vec2(Math.cos(t) * this._thrustPower, Math.sin(t) * this._thrustPower);
        this._box2dBody.ApplyForce(i, this._box2dBody.GetWorldCenter()),
            this._box2dBody.SetAwake(!0),
            this.thrustEmitter.start(),
            (this._fuel -= 0.005 * ige._tickDelta);
    }
    else
        this.thrustEmitter.stop();
    ige.components.input.actionState("drop") && this._carryingOrb && this.dropOrb();
}, ThrustParticle = $i_59Box2d.extend({
    classId: "ThrustParticle",
    init: function (t) {
        (this._emitter = t),
            $i_59Box2d.prototype.init.call(this),
            (this._rectColor = "#ff5a00"),
            this.addComponent($i_11)
                .texture(ige.client.textures.rectangle)
                .width(5)
                .height(5)
                .layer(1)
                .category("thrustParticle");
    },
    destroy: function () {
        this._emitter !== void 0 && this._emitter._particles.pull(this), $i_59Box2d.prototype.destroy.call(this);
    }
}), ExplosionParticle = ThrustParticle.extend({
    classId: "ExplosionParticle",
    init: function (t) {
        (this._emitter = t), ThrustParticle.prototype.init.call(this);
        var i = Math.floor(Math.random() * 3);
        i === 0 && (this._rectColor = "#ff5a00"),
            i === 1 && (this._rectColor = "#c1c1c1"),
            i === 2 && (this._rectColor = "#fffc00"),
            this.addComponent($i_11)
                .texture(ige.client.textures.rectangle)
                .width(5)
                .height(5)
                .layer(1)
                .category("thrustParticle");
    },
    destroy: function () {
        this._emitter !== void 0 && this._emitter._particles.pull(this),
            ThrustParticle.prototype.destroy.call(this);
    }
}), LandingPad = $i_59Box2d.extend({
    classId: "LandingPad",
    init: function () {
        $i_59Box2d.prototype.init.call(this),
            (this._rectColor = "#ffc600"),
            this.category("landingPad")
                .texture(ige.client.textures.rectangle)
                .width(80)
                .height(5)
                .box2dBody({
                type: "static",
                allowSleep: !0,
                fixtures: [{ filter: { categoryBits: 2, maskBits: 65535 }, shape: { type: "rectangle" } }]
            });
    }
}), ClientCountDown = $i_62.extend({
    classId: "ClientCountDown",
    init: function (t, i, e, o) {
        $i_62.prototype.init.call(this),
            (this._prefix = t || ""),
            (this._countdown = i),
            (this._count = i),
            (this._sufix = e || ""),
            (this._interval = o || 1e3),
            this.depth(1)
                .width(480)
                .height(110)
                .texture(ige.client.textures.font)
                .textAlignX(1)
                .textLineSpacing(0)
                .text(this._prefix + this._count + this._sufix);
    },
    start: function () {
        var t = this;
        return ((this._intervalTimer = setInterval(function () {
            t._timerTick();
        }, this._interval)),
            this);
    },
    _timerTick: function () {
        return (this._count--,
            this.text(this._prefix + this._count + this._sufix),
            this._count === 0 && (this.emit("complete"), this.stop()),
            this);
    },
    stop: function () {
        return clearInterval(this._intervalTimer), this;
    }
}), ClientScore = $i_62.extend({
    classId: "ClientScore",
    init: function (t) {
        $i_62.prototype.init.call(this),
            this.depth(1)
                .width(480)
                .height(110)
                .texture(ige.client.textures.font)
                .textAlignX(1)
                .textLineSpacing(0)
                .text(t)
                .hide();
    },
    start: function (t) {
        var i = this;
        return t
            ? (setTimeout(function () {
                i.start();
            }, t),
                void 0)
            : (this.show(),
                this._translate
                    .tween()
                    .duration(3e3)
                    .properties({ y: this._translate.y - 100 })
                    .easing("outElastic")
                    .afterTween(function () {
                    i.tween()
                        .duration(500)
                        .properties({ _opacity: 0 })
                        .afterTween(function () {
                        i.destroy();
                    })
                        .start();
                })
                    .start(),
                this._rotate
                    .tween()
                    .duration(2e3)
                    .properties({ z: Math.radians(360) })
                    .easing("outElastic")
                    .start(),
                void 0);
    }
}), Client = $i_2.extend({
    classId: "Client",
    init: function () {
        var t = this;
        (t.obj = []),
            (t.textures = {}),
            (t.textures.ship = new $i_53("./assets/Ship.js")),
            (t.textures.rectangle = new $i_53("./assets/Rectangle.js")),
            (t.textures.orb = new $i_53("./assets/Orb.js")),
            (t.textures.font = new $i_56("./assets/agency_fb_20pt.png")),
            t.implement(ClientWorld),
            t.implement(ClientTerrain),
            ige
                .addComponent($i_81)
                .box2d.sleep(!0)
                .box2d.gravity(0, 1)
                .box2d.createWorld()
                .box2d.mode(0)
                .box2d.start(),
            ige.on("texturesLoaded", function () {
                ige.createFrontBuffer(!0),
                    ige.start(function (i) {
                        i &&
                            (t.createWorld(),
                                t.createTerrain(),
                                ige.components.input.mapAction("left", ige.components.input.key.left),
                                ige.components.input.mapAction("right", ige.components.input.key.right),
                                ige.components.input.mapAction("thrust", ige.components.input.key.up),
                                ige.components.input.mapAction("drop", ige.components.input.key.space),
                                (t.player = new Player()
                                    .id("player1")
                                    .addBehaviour("PlayerControl", PlayerBehaviour)
                                    .translateTo(t.landingPads[0]._translate.x, t.landingPads[0]._translate.y - 20, 0)
                                    .mount(t.objectScene)),
                                t.vp1.camera.trackTranslate(t.player, 20),
                                ige.box2d.contactListener(function (i) {
                                    if (i.igeEitherCategory("floor") && i.igeEitherCategory("ship"))
                                        t.player.crash();
                                    else if (i.igeEitherCategory("landingPad") && i.igeEitherCategory("ship")) {
                                        delete t.player._oldOrb;
                                        var e = Math.degrees(t.player._rotate.z), o = Math.round(e / 360);
                                        o > 0 && (e -= 360 * o),
                                            0 > o && (e -= 360 * o),
                                            (t.player._rotate.z = Math.radians(e)),
                                            e > 30 || -30 > e ? t.player.crash() : (t.player._landed = !0);
                                    }
                                    else
                                        !t.player._carryingOrb &&
                                            i.igeEitherCategory("orb") &&
                                            i.igeEitherCategory("ship")
                                            ? (i.m_fixtureA.IsSensor() || i.m_fixtureB.IsSensor()) &&
                                                t.player.carryOrb(i.igeEntityByCategory("orb"), i)
                                            : i.igeEitherCategory("orb") &&
                                                i.igeEitherCategory("landingPad") &&
                                                (t.player._carryingOrb &&
                                                    t.player._orb === i.igeEntityByCategory("orb")
                                                    ? t.player._orb.deposit(!0, i.igeEntityByCategory("landingPad"))
                                                    : i
                                                        .igeEntityByCategory("orb")
                                                        .deposit(!1, i.igeEntityByCategory("landingPad")));
                                }, function (i) {
                                    i.igeEitherCategory("landingPad") &&
                                        i.igeEitherCategory("ship") &&
                                        (t.player._landed = !1);
                                }));
                    });
            });
    }
});
typeof module != "undefined" && module.exports !== void 0 && (module.exports = Client);
var Game = $i_2.extend({
    classId: "Game",
    init: function (t, i) {
        (ige = new $i_113()), isClient && (ige.client = new t()), isServer && (ige.server = new t(i));
    }
});
if (typeof module != "undefined" && module.exports !== void 0)
    module.exports = Game;
else
    var game = new Game(Client);
