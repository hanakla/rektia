import io from "socket.io-client";

// if (typeof window === "object") {
//     window.maya = module.exports;
// }

module.exports = function (uri, opts) {
    return new SocketWrapper(io(uri, opts));
};

Object.defineProperties(module.exports, {
    protocol : {
        get() { return io.protocol; },
        set(val) { io.protocol = val; }
    },
    connect : {
        get() { return module.exports; }
    }
});


function SocketWrapper(socket) {
    this._socket = socket;
    // this._emitter = new Emitter();
}

SocketWrapper.prototype = {
    open() {
        this._socket.open();
        return this;
    },

    connect() {
        return this.open();
    },

    close() {
        this._socket.close();
        return this;
    },

    disconnect() {
        return this.close();
    },


    on(event, handler) {
        this._socket.on(event, handler);
    },

    off(event, handler) {
        this._socket.removeListener(event, handler);
    },

    push(...args) {
        this._socket.emit(...args);
        return this;
    },

    send(...args) {
        this._socket.send(...args);
        return this;
    },


    compress(compress) {
        this._socket.compress(compress);
        return this;
    }
};
