/**
 * CommonJS module to override the default event handling of the native SocketProxy
 *
 * Kroll proxies have the EventEmitter prototype built-in automcatically, which is not
 * compatible with the socket.io API.
 */

var prototypePatched = false;

function connect() {
	var socket = this._nativeConnect.apply(this, arguments);
	if (!prototypePatched) {
		patchSocketPrototype(socket);
		prototypePatched = true;
	}
	return socket;
}

function Manager() {
	var manager = this._nativeManager.apply(this, arguments);
	if (prototypePatched) {
		return manager;
	}

	var originalSocketFunc = manager.socket;
	manager.socket = function socket() {
		var socket = originalSocketFunc.apply(manager, arguments);
		if (!prototypePatched) {
			patchSocketPrototype(socket);
			prototypePatched = true;
		}
		return socket;
	};
	return manager;
}

function patchSocketPrototype(socket) {
	var prototype = Object.getPrototypeOf(socket);
	// We need to use Object.defineProperties here because assignment is blocked
	// by properties already defined on Android's EventEmitter prototype.
	Object.defineProperties(prototype, {
		on: {
			value: function on(eventName, listener) {
				if (typeof eventName !== 'string') {
					throw new TypeError('The event name must be of type "string". Received "' + typeof eventName + '"');
				}
				if (typeof listener !== 'function') {
					throw new TypeError('The event listener must be of type "function". Received "' + typeof listener + '"');
				}

				if (!this.__eventListeners) {
					this.__eventListeners = new Map();
				}

				var eventListeners = this.__eventListeners;
				var listenerId = this._nativeOn(eventName, listener);
				var listeners = eventListeners.get(eventName);
				if (!listeners) {
					listeners = new Map();
					eventListeners.set(eventName, listeners);
				}
				listeners.set(listener, listenerId);
				return this;
			},
			configurable: true,
			writable: true,
			enumerable: true
		},
		once: {
			value: function once(eventName, listener) {
				this.on(eventName, function () {
					this.off(eventName, listener);
					listener.apply(null, arguments);
				});
				return this;
			},
			configurable: true,
			writable: true,
			enumerable: true
		},
		off: {
			value: function off(eventName, listener) {
				var eventListeners = this.__eventListeners || (this.__eventListeners = new Map());
				var listeners;
				if (!eventName && !listener) {
					this._nativeOff();
					eventListeners.clear();
				} else if (eventName && !listener) {
					this._nativeOff(eventName);
					listeners = eventListeners.get(eventName);
					if (listeners) {
						listeners.delete(listener);
					}
				} else if (eventName && listener) {
					listeners = eventListeners.get(eventName);
					if (listeners) {
						var listenerId = listeners.get(listener);
						if (listenerId !== undefined) {
							this._nativeOff(eventName, listenerId);
							listeners.delete(listener);
						}
					}
				} else {
					throw new TypeError('Invalid arguments received.');
				}

				return this;
			},
			configurable: true,
			writable: true,
			enumerable: true
		}
	});
}

module.exports = {
	connect: connect,
	Manager: Manager
};
