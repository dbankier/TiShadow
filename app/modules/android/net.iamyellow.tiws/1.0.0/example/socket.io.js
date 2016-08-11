/*jslint bitwise: true, continue: true, eqeq: true, forin: true, nomen: true, plusplus: true, regexp: true, unparam: true, sloppy: true, stupid: true, sub: true, vars: true */
/*global Ti: true, console: true, setTimeout: true, clearTimeout: true, setInterval: true, clearTimeout: true, clearInterval: true, module: true, exports: true, require: true, document: true, XMLHttpRequest: true, window: true*/
/*! Socket.IO.js build:0.9.16, development. Copyright(c) 2011 LearnBoost <dev@learnboost.com> MIT Licensed */
var io = {};
module.exports = io;
(function() {
    (function(e, t) {
        var n = e;
        n.version = "0.9.16";
        n.protocol = 1;
        n.transports = [];
        n.j = [];
        n.sockets = {};
        n.connect = function(e, t) {
            var r = n.util.parseUri(e), i, s;
            i = n.util.uniqueUri(r);
            var o = {
                host : r.host,
                secure : "https" == r.protocol,
                port : r.port || ("https" == r.protocol ? 443 : 80),
                query : r.query || ""
            };
            n.util.merge(o, t);
            if (o["force new connection"] || !n.sockets[i]) {
                s = new n.Socket(o)
            }
            if (!o["force new connection"] && s) {
                n.sockets[i] = s
            }
            s = s || n.sockets[i];
            return s.of(r.path.length > 1 ? r.path : "")
        }
    })(io, this);
    (function(e, t) {
        var n = e.util = {};
        var r = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
        var i = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
        n.parseUri = function(e) {
            var t = r.exec(e || ""), n = {}, s = 14;
            while (s--) {
                n[i[s]] = t[s] || ""
            }
            return n
        };
        n.uniqueUri = function(e) {
            var t = e.protocol, n = e.host, r = e.port;
            n = n || "localhost";
            if (!r && t == "https") {
                r = 443
            }
            return (t || "http") + "://" + n + ":" + (r || 80)
        };
        n.query = function(e, t) {
            var r = n.chunkQuery(e || ""), i = [];
            n.merge(r, n.chunkQuery(t || ""));
            for (var s in r) {
                if (r.hasOwnProperty(s)) {
                    i.push(s + "=" + r[s])
                }
            }
            return i.length ? "?" + i.join("&") : ""
        };
        n.chunkQuery = function(e) {
            var t = {}, n = e.split("&"), r = 0, i = n.length, s;
            for (; r < i; ++r) {
                s = n[r].split("=");
                if (s[0]) {
                    t[s[0]] = s[1]
                }
            }
            return t
        };
        var s = false;
        n.load = function(e) {
            e()
        };
        n.on = function(e, t, n, r) {
            if (e.attachEvent) {
                e.attachEvent("on" + t, n)
            } else {
                if (e.addEventListener) {
                    e.addEventListener(t, n, r)
                }
            }
        };
        n.request = function(e) {
            return Ti.Network.createHTTPClient()
        };
        n.defer = function(e) {
            if (!n.ua.webkit || "undefined" != typeof importScripts) {
                return e()
            }
            n.load(function() {
                setTimeout(e, 100)
            })
        };
        n.merge = function(t, r, i, s) {
            var o = s || [], u = typeof i == "undefined" ? 2 : i, a;
            for (a in r) {
                if (r.hasOwnProperty(a) && n.indexOf(o, a) < 0) {
                    if ( typeof t[a] !== "object" || !u) {
                        t[a] = r[a];
                        o.push(r[a])
                    } else {
                        n.merge(t[a], r[a], u - 1, o)
                    }
                }
            }
            return t
        };
        n.mixin = function(e, t) {
            n.merge(e.prototype, t.prototype)
        };
        n.inherit = function(e, t) {
            function n() {
            }
            n.prototype = t.prototype;
            e.prototype = new n
        };
        n.isArray = Array.isArray ||
        function(e) {
            return Object.prototype.toString.call(e) === "[object Array]"
        };
        n.intersect = function(e, t) {
            var r = [], i = e.length > t.length ? e : t, s = e.length > t.length ? t : e;
            for (var o = 0, u = s.length; o < u; o++) {
                if (~n.indexOf(i, s[o])) {
                    r.push(s[o])
                }
            }
            return r
        };
        n.indexOf = function(e, t, n) {
            for (var r = e.length, n = n < 0 ? n + r < 0 ? 0 : n + r : n || 0; n < r && e[n] !== t; n++) {
            }
            return r <= n ? -1 : n
        };
        n.toArray = function(e) {
            var t = [];
            for (var n = 0, r = e.length; n < r; n++) {
                t.push(e[n])
            }
            return t
        };
        n.ua = {};
        n.ua.hasCORS = true;
        n.ua.webkit = false;
        n.ua.iDevice = false
    })("undefined" != typeof io ? io : module.exports, this);
    (function(e, t) {
        function n() {
        }
        e.EventEmitter = n;
        n.prototype.on = function(e, n) {
            if (!this.$events) {
                this.$events = {}
            }
            if (!this.$events[e]) {
                this.$events[e] = n
            } else {
                if (t.util.isArray(this.$events[e])) {
                    this.$events[e].push(n)
                } else {
                    this.$events[e] = [this.$events[e], n]
                }
            }
            return this
        };
        n.prototype.addListener = n.prototype.on;
        n.prototype.once = function(e, t) {
            function r() {
                n.removeListener(e, r);
                t.apply(this, arguments)
            }

            var n = this;
            r.listener = t;
            this.on(e, r);
            return this
        };
        n.prototype.removeListener = function(e, n) {
            if (this.$events && this.$events[e]) {
                var r = this.$events[e];
                if (t.util.isArray(r)) {
                    var i = -1;
                    for (var s = 0, o = r.length; s < o; s++) {
                        if (r[s] === n || r[s].listener && r[s].listener === n) {
                            i = s;
                            break
                        }
                    }
                    if (i < 0) {
                        return this
                    }
                    r.splice(i, 1);
                    if (!r.length) {
                        delete this.$events[e]
                    }
                } else {
                    if (r === n || r.listener && r.listener === n) {
                        delete this.$events[e]
                    }
                }
            }
            return this
        };
        n.prototype.removeAllListeners = function(e) {
            if (e === undefined) {
                this.$events = {};
                return this
            }
            if (this.$events && this.$events[e]) {
                this.$events[e] = null
            }
            return this
        };
        n.prototype.listeners = function(e) {
            if (!this.$events) {
                this.$events = {}
            }
            if (!this.$events[e]) {
                this.$events[e] = []
            }
            if (!t.util.isArray(this.$events[e])) {
                this.$events[e] = [this.$events[e]]
            }
            return this.$events[e]
        };
        n.prototype.emit = function(e) {
            if (!this.$events) {
                return false
            }
            var n = this.$events[e];
            if (!n) {
                return false
            }
            var r = Array.prototype.slice.call(arguments, 1);
            if ("function" == typeof n) {
                n.apply(this, r)
            } else {
                if (t.util.isArray(n)) {
                    var i = n.slice();
                    for (var s = 0, o = i.length; s < o; s++) {
                        i[s].apply(this, r)
                    }
                } else {
                    return false
                }
            }
            return true
        }
    })("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports);
    (function(e, t) {"use strict";
        return e.JSON = {
            parse : t.parse,
            stringify : t.stringify
        }
    })("undefined" != typeof io ? io : module.exports, typeof JSON !== "undefined" ? JSON : undefined);
    (function(e, t) {
        var n = e.parser = {};
        var r = n.packets = ["disconnect", "connect", "heartbeat", "message", "json", "event", "ack", "error", "noop"];
        var i = n.reasons = ["transport not supported", "client not handshaken", "unauthorized"];
        var s = n.advice = ["reconnect"];
        var o = t.JSON, u = t.util.indexOf;
        n.encodePacket = function(e) {
            var t = u(r, e.type), n = e.id || "", a = e.endpoint || "", f = e.ack, l = null;
            switch(e.type) {
                case"error":
                    var c = e.reason ? u(i, e.reason) : "", h = e.advice ? u(s, e.advice) : "";
                    if (c !== "" || h !== "") {
                        l = c + (h !== "" ? "+" + h : "")
                    }
                    break;
                case"message":
                    if (e.data !== "") {
                        l = e.data
                    }
                    break;
                case"event":
                    var p = {
                        name : e.name
                    };
                    if (e.args && e.args.length) {
                        p.args = e.args
                    }
                    l = o.stringify(p);
                    break;
                case"json":
                    l = o.stringify(e.data);
                    break;
                case"connect":
                    if (e.qs) {
                        l = e.qs
                    }
                    break;
                case"ack":
                    l = e.ackId + (e.args && e.args.length ? "+" + o.stringify(e.args) : "");
                    break
            }
            var d = [t, n + (f == "data" ? "+" : ""), a];
            if (l !== null && l !== undefined) {
                d.push(l)
            }
            return d.join(":")
        };
        n.encodePayload = function(e) {
            var t = "";
            if (e.length == 1) {
                return e[0]
            }
            for (var n = 0, r = e.length; n < r; n++) {
                var i = e[n];
                t += "�" + i.length + "�" + e[n]
            }
            return t
        };
        var a = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;
        n.decodePacket = function(e) {
            var t = e.match(a);
            if (!t) {
                return {}
            }
            var n = t[2] || "", e = t[5] || "", u = {
                type : r[t[1]],
                endpoint : t[4] || ""
            };
            if (n) {
                u.id = n;
                if (t[3]) {
                    u.ack = "data"
                } else {
                    u.ack = true
                }
            }
            switch(u.type) {
                case"error":
                    var t = e.split("+");
                    u.reason = i[t[0]] || "";
                    u.advice = s[t[1]] || "";
                    break;
                case"message":
                    u.data = e || "";
                    break;
                case"event":
                    try {
                        var f = o.parse(e);
                        u.name = f.name;
                        u.args = f.args
                    } catch(l) {
                    }
                    u.args = u.args || [];
                    break;
                case"json":
                    try {
                        u.data = o.parse(e)
                    } catch(l) {
                    }
                    break;
                case"connect":
                    u.qs = e || "";
                    break;
                case"ack":
                    var t = e.match(/^([0-9]+)(\+)?(.*)/);
                    if (t) {
                        u.ackId = t[1];
                        u.args = [];
                        if (t[3]) {
                            try {
                                u.args = t[3] ? o.parse(t[3]) : []
                            } catch(l) {
                            }
                        }
                    }
                    break;
                case"disconnect":
                case"heartbeat":
                    break
            }
            return u
        };
        n.decodePayload = function(e) {
            if (e.charAt(0) == "�") {
                var t = [];
                for (var r = 1, i = ""; r < e.length; r++) {
                    if (e.charAt(r) == "�") {
                        t.push(n.decodePacket(e.substr(r + 1).substr(0, i)));
                        r += Number(i) + 1;
                        i = ""
                    } else {
                        i += e.charAt(r)
                    }
                }
                return t
            } else {
                return [n.decodePacket(e)]
            }
        }
    })("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports);
    (function(e, t) {
        function n(e, t) {
            this.socket = e;
            this.sessid = t
        }
        e.Transport = n;
        t.util.mixin(n, t.EventEmitter);
        n.prototype.heartbeats = function() {
            return true
        };
        n.prototype.onData = function(e) {
            this.clearCloseTimeout();
            if (this.socket.connected || this.socket.connecting || this.socket.reconnecting) {
                this.setCloseTimeout()
            }
            if (e !== "") {
                var n = t.parser.decodePayload(e);
                if (n && n.length) {
                    for (var r = 0, i = n.length; r < i; r++) {
                        this.onPacket(n[r])
                    }
                }
            }
            return this
        };
        n.prototype.onPacket = function(e) {
            this.socket.setHeartbeatTimeout();
            if (e.type == "heartbeat") {
                return this.onHeartbeat()
            }
            if (e.type == "connect" && e.endpoint == "") {
                this.onConnect()
            }
            if (e.type == "error" && e.advice == "reconnect") {
                this.isOpen = false
            }
            this.socket.onPacket(e);
            return this
        };
        n.prototype.setCloseTimeout = function() {
            if (!this.closeTimeout) {
                var e = this;
                this.closeTimeout = setTimeout(function() {
                    e.onDisconnect()
                }, this.socket.closeTimeout)
            }
        };
        n.prototype.onDisconnect = function() {
            if (this.isOpen) {
                this.close()
            }
            this.clearTimeouts();
            this.socket.onDisconnect();
            return this
        };
        n.prototype.onConnect = function() {
            this.socket.onConnect();
            return this
        };
        n.prototype.clearCloseTimeout = function() {
            if (this.closeTimeout) {
                clearTimeout(this.closeTimeout);
                this.closeTimeout = null
            }
        };
        n.prototype.clearTimeouts = function() {
            this.clearCloseTimeout();
            if (this.reopenTimeout) {
                clearTimeout(this.reopenTimeout)
            }
        };
        n.prototype.packet = function(e) {
            this.send(t.parser.encodePacket(e))
        };
        n.prototype.onHeartbeat = function(e) {
            this.packet({
                type : "heartbeat"
            })
        };
        n.prototype.onOpen = function() {
            this.isOpen = true;
            this.clearCloseTimeout();
            this.socket.onOpen()
        };
        n.prototype.onClose = function() {
            var e = this;
            this.isOpen = false;
            this.socket.onClose();
            this.onDisconnect()
        };
        n.prototype.prepareUrl = function() {
            var e = this.socket.options;
            return this.scheme() + "://" + e.host + ":" + e.port + "/" + e.resource + "/" + t.protocol + "/" + this.name + "/" + this.sessid
        };
        n.prototype.ready = function(e, t) {
            t.call(this)
        }
    })("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports);
    (function(e, t, n) {
        function r(e) {
            this.options = {
                port : 80,
                secure : false,
                document : "document" in n ? document : false,
                resource : "socket.io",
                transports : t.transports,
                "connect timeout" : 1e4,
                "try multiple transports" : true,
                reconnect : true,
                "reconnection delay" : 500,
                "reconnection limit" : Infinity,
                "reopen delay" : 3e3,
                "max reconnection attempts" : 10,
                "sync disconnect on unload" : false,
                "auto connect" : true,
                "flash policy port" : 10843,
                manualFlush : false
            };
            t.util.merge(this.options, e);
            this.connected = false;
            this.open = false;
            this.connecting = false;
            this.reconnecting = false;
            this.namespaces = {};
            this.buffer = [];
            this.doBuffer = false;
            if (this.options["sync disconnect on unload"] && (!this.isXDomain() || t.util.ua.hasCORS)) {
                var r = this;
                t.util.on(n, "beforeunload", function() {
                    r.disconnectSync()
                }, false)
            }
            if (this.options["auto connect"]) {
                this.connect()
            }
        }

        function i() {
        }
        e.Socket = r;
        t.util.mixin(r, t.EventEmitter);
        r.prototype.of = function(e) {
            if (!this.namespaces[e]) {
                this.namespaces[e] = new t.SocketNamespace(this, e);
                if (e !== "") {
                    this.namespaces[e].packet({
                        type : "connect"
                    })
                }
            }
            return this.namespaces[e]
        };
        r.prototype.publish = function() {
            this.emit.apply(this, arguments);
            var e;
            for (var t in this.namespaces) {
                if (this.namespaces.hasOwnProperty(t)) {
                    e = this.of(t);
                    e.$emit.apply(e, arguments)
                }
            }
        };
        r.prototype.handshake = function(e) {
            function s(t) {
                if ( t instanceof Error) {
                    n.connecting = false;
                    n.onError(t.message)
                } else {
                    e.apply(null, t.split(":"))
                }
            }

            var n = this, r = this.options;
            var o = ["http" + (r.secure ? "s" : "") + ":/", r.host + ":" + r.port, r.resource, t.protocol, t.util.query(this.options.query, "t=" + +(new Date))].join("/");
            var u = t.util.request();
            u.open("GET", o, true);
            if (this.isXDomain()) {
                u.withCredentials = true
            }
            u.onreadystatechange = function() {
                if (u.readyState == 4) {
                    u.onreadystatechange = i;
                    if (u.status == 200) {
                        s(u.responseText)
                    } else {
                        if (u.status == 403) {
                            n.onError(u.responseText)
                        } else {
                            n.connecting = false;
                            !n.reconnecting && n.onError(u.responseText)
                        }
                    }
                }
            };
            u.onerror = function(e) {
                n.connecting = false;
                !n.reconnecting && n.onError(e.error)
            };
            u.send(null)
        };
        r.prototype.getTransport = function(e) {
            var n = e || this.transports, r;
            for (var i = 0, s; s = n[i]; i++) {
                if (t.Transport[s] && t.Transport[s].check(this) && (!this.isXDomain() || t.Transport[s].xdomainCheck(this))) {
                    return new t.Transport[s](this, this.sessionid)
                }
            }
            return null
        };
        r.prototype.connect = function(e) {
            if (this.connecting) {
                return this
            }
            var n = this;
            n.connecting = true;
            this.handshake(function(r, i, s, o) {
                function u(e) {
                    if (n.transport) {
                        n.transport.clearTimeouts()
                    }
                    n.transport = n.getTransport(e);
                    if (!n.transport) {
                        return n.publish("connect_failed")
                    }
                    n.transport.ready(n, function() {
                        n.connecting = true;
                        n.publish("connecting", n.transport.name);
                        n.transport.open();
                        if (n.options["connect timeout"]) {
                            n.connectTimeoutTimer = setTimeout(function() {
                                if (!n.connected) {
                                    n.connecting = false;
                                    if (n.options["try multiple transports"]) {
                                        var e = n.transports;
                                        while (e.length > 0 && e.splice(0,1)[0] != n.transport.name) {
                                        }
                                        if (e.length) {
                                            u(e)
                                        } else {
                                            n.publish("connect_failed")
                                        }
                                    }
                                }
                            }, n.options["connect timeout"])
                        }
                    })
                }
                n.sessionid = r;
                n.closeTimeout = s * 1e3;
                n.heartbeatTimeout = i * 1e3;
                if (!n.transports) {
                    n.transports = n.origTransports = o ? t.util.intersect(o.split(","), n.options.transports) : n.options.transports
                }
                n.setHeartbeatTimeout();
                u(n.transports);
                n.once("connect", function() {
                    clearTimeout(n.connectTimeoutTimer);
                    e && typeof e == "function" && e()
                })
            });
            return this
        };
        r.prototype.setHeartbeatTimeout = function() {
            clearTimeout(this.heartbeatTimeoutTimer);
            if (this.transport && !this.transport.heartbeats()) {
                return
            }
            var e = this;
            this.heartbeatTimeoutTimer = setTimeout(function() {
                e.transport.onClose()
            }, this.heartbeatTimeout)
        };
        r.prototype.packet = function(e) {
            if (this.connected && !this.doBuffer) {
                this.transport.packet(e)
            } else {
                this.buffer.push(e)
            }
            return this
        };
        r.prototype.setBuffer = function(e) {
            this.doBuffer = e;
            if (!e && this.connected && this.buffer.length) {
                if (!this.options.manualFlush) {
                    this.flushBuffer()
                }
            }
        };
        r.prototype.flushBuffer = function() {
            this.transport.payload(this.buffer);
            this.buffer = []
        };
        r.prototype.disconnect = function() {
            if (this.connected || this.connecting) {
                if (this.open) {
                    this.of("").packet({
                        type : "disconnect"
                    })
                }
                this.onDisconnect("booted")
            }
            return this
        };
        r.prototype.disconnectSync = function() {
            var e = t.util.request();
            var n = ["http" + (this.options.secure ? "s" : "") + ":/", this.options.host + ":" + this.options.port, this.options.resource, t.protocol, "", this.sessionid].join("/") + "/?disconnect=1";
            e.open("GET", n, false);
            e.send(null);
            this.onDisconnect("booted")
        };
        r.prototype.isXDomain = function() {
            return false
        };
        r.prototype.onConnect = function() {
            if (!this.connected) {
                this.connected = true;
                this.connecting = false;
                if (!this.doBuffer) {
                    this.setBuffer(false)
                }
                this.emit("connect")
            }
        };
        r.prototype.onOpen = function() {
            this.open = true
        };
        r.prototype.onClose = function() {
            this.open = false;
            clearTimeout(this.heartbeatTimeoutTimer)
        };
        r.prototype.onPacket = function(e) {
            this.of(e.endpoint).onPacket(e)
        };
        r.prototype.onError = function(e) {
            if (e && e.advice) {
                if (e.advice === "reconnect" && (this.connected || this.connecting)) {
                    this.disconnect();
                    if (this.options.reconnect) {
                        this.reconnect()
                    }
                }
            }
            this.publish("error", e && e.reason ? e.reason : e)
        };
        r.prototype.onDisconnect = function(e) {
            var t = this.connected, n = this.connecting;
            this.connected = false;
            this.connecting = false;
            this.open = false;
            if (t || n) {
                this.transport.close();
                this.transport.clearTimeouts();
                if (t) {
                    this.publish("disconnect", e);
                    if ("booted" != e && this.options.reconnect && !this.reconnecting) {
                        this.reconnect()
                    }
                }
            }
        };
        r.prototype.reconnect = function() {
            function i() {
                if (e.connected) {
                    for (var t in e.namespaces) {
                        if (e.namespaces.hasOwnProperty(t) && "" !== t) {
                            e.namespaces[t].packet({
                                type : "connect"
                            })
                        }
                    }
                    e.publish("reconnect", e.transport.name, e.reconnectionAttempts)
                }
                clearTimeout(e.reconnectionTimer);
                e.removeListener("connect_failed", s);
                e.removeListener("connect", s);
                e.reconnecting = false;
                delete e.reconnectionAttempts;
                delete e.reconnectionDelay;
                delete e.reconnectionTimer;
                delete e.redoTransports;
                e.options["try multiple transports"] = n
            }

            function s() {
                if (!e.reconnecting) {
                    return
                }
                if (e.connected) {
                    return i()
                }
                if (e.connecting && e.reconnecting) {
                    return e.reconnectionTimer = setTimeout(s, 1e3)
                }
                if (e.reconnectionAttempts++ >= t) {
                    if (!e.redoTransports) {
                        e.on("connect_failed", s);
                        e.options["try multiple transports"] = true;
                        e.transports = e.origTransports;
                        e.transport = e.getTransport();
                        e.redoTransports = true;
                        e.connect()
                    } else {
                        e.publish("reconnect_failed");
                        i()
                    }
                } else {
                    if (e.reconnectionDelay < r) {
                        e.reconnectionDelay *= 2
                    }
                    e.connect();
                    e.publish("reconnecting", e.reconnectionDelay, e.reconnectionAttempts);
                    e.reconnectionTimer = setTimeout(s, e.reconnectionDelay)
                }
            }
            this.reconnecting = true;
            this.reconnectionAttempts = 0;
            this.reconnectionDelay = this.options["reconnection delay"];
            var e = this, t = this.options["max reconnection attempts"], n = this.options["try multiple transports"], r = this.options["reconnection limit"];
            this.options["try multiple transports"] = false;
            this.reconnectionTimer = setTimeout(s, this.reconnectionDelay);
            this.on("connect", s)
        }
    })("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports, this);
    (function(e, t) {
        function n(e, t) {
            this.socket = e;
            this.name = t || "";
            this.flags = {};
            this.json = new r(this, "json");
            this.ackPackets = 0;
            this.acks = {}
        }

        function r(e, t) {
            this.namespace = e;
            this.name = t
        }
        e.SocketNamespace = n;
        t.util.mixin(n, t.EventEmitter);
        n.prototype.$emit = t.EventEmitter.prototype.emit;
        n.prototype.of = function() {
            return this.socket.of.apply(this.socket, arguments)
        };
        n.prototype.packet = function(e) {
            e.endpoint = this.name;
            this.socket.packet(e);
            this.flags = {};
            return this
        };
        n.prototype.send = function(e, t) {
            var n = {
                type : this.flags.json ? "json" : "message",
                data : e
            };
            if ("function" == typeof t) {
                n.id = ++this.ackPackets;
                n.ack = true;
                this.acks[n.id] = t
            }
            return this.packet(n)
        };
        n.prototype.emit = function(e) {
            var t = Array.prototype.slice.call(arguments, 1), n = t[t.length - 1], r = {
                type : "event",
                name : e
            };
            if ("function" == typeof n) {
                r.id = ++this.ackPackets;
                r.ack = "data";
                this.acks[r.id] = n;
                t = t.slice(0, t.length - 1)
            }
            r.args = t;
            return this.packet(r)
        };
        n.prototype.disconnect = function() {
            if (this.name === "") {
                this.socket.disconnect()
            } else {
                this.packet({
                    type : "disconnect"
                });
                this.$emit("disconnect")
            }
            return this
        };
        n.prototype.onPacket = function(e) {
            function r() {
                n.packet({
                    type : "ack",
                    args : t.util.toArray(arguments),
                    ackId : e.id
                })
            }

            var n = this;
            switch(e.type) {
                case"connect":
                    this.$emit("connect");
                    break;
                case"disconnect":
                    if (this.name === "") {
                        this.socket.onDisconnect(e.reason || "booted")
                    } else {
                        this.$emit("disconnect", e.reason)
                    }
                    break;
                case"message":
                case"json":
                    var i = ["message", e.data];
                    if (e.ack == "data") {
                        i.push(r)
                    } else {
                        if (e.ack) {
                            this.packet({
                                type : "ack",
                                ackId : e.id
                            })
                        }
                    }
                    this.$emit.apply(this, i);
                    break;
                case"event":
                    var i = [e.name].concat(e.args);
                    if (e.ack == "data") {
                        i.push(r)
                    }
                    this.$emit.apply(this, i);
                    break;
                case"ack":
                    if (this.acks[e.ackId]) {
                        this.acks[e.ackId].apply(this, e.args);
                        delete this.acks[e.ackId]
                    }
                    break;
                case"error":
                    if (e.advice) {
                        this.socket.onError(e)
                    } else {
                        if (e.reason == "unauthorized") {
                            this.$emit("connect_failed", e.reason)
                        } else {
                            this.$emit("error", e.reason)
                        }
                    }
                    break
            }
        };
        r.prototype.send = function() {
            this.namespace.flags[this.name] = true;
            this.namespace.send.apply(this.namespace, arguments)
        };
        r.prototype.emit = function() {
            this.namespace.flags[this.name] = true;
            this.namespace.emit.apply(this.namespace, arguments)
        }
    })("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports);
    (function(e, t, n) {
        function r(e) {
            t.Transport.apply(this, arguments)
        }
        e.websocket = r;
        t.util.inherit(r, t.Transport);
        r.prototype.name = "websocket";
        r.prototype.open = function() {
            var e = t.util.query(this.socket.options.query), n = this, r;
            this.websocket = require("net.iamyellow.tiws").createWS();
            this.websocket.addEventListener("open", function() {
                n.onOpen();
                n.socket.setBuffer(false)
            });
            this.websocket.addEventListener("message", function(e) {
                n.onData(e.data)
            });
            this.websocket.addEventListener("close", function(e) {
                n.onClose();
                n.socket.setBuffer(true)
            });
            this.websocket.addEventListener("error", function(e) {
                n.onError({
                    advice : "reconnect"
                })
            });
            this.websocket.open(this.prepareUrl() + e);
            return this
        };
        r.prototype.send = function(e) {
            this.websocket.send(e);
            return this
        };
        r.prototype.payload = function(e) {
            for (var t = 0, n = e.length; t < n; t++) {
                this.packet(e[t])
            }
            return this
        };
        r.prototype.close = function() {
            this.websocket.close();
            return this
        };
        r.prototype.onError = function(e) {
            this.socket.onError(e)
        };
        r.prototype.scheme = function() {
            return this.socket.options.secure ? "wss" : "ws"
        };
        r.check = function() {
            return true
        };
        r.xdomainCheck = function() {
            return true
        };
        t.transports.push("websocket")
    })("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this)
})()
