import SocketIONamespace from "./namespace";

export default class SocketIOServer {
    constructor(io) {
        this._io = io;
        this._sockets = this.of("/");
        this._nsps = Object.create(null);
    }


    get rawServer() {
        return this._io;
    }

    //
    // Delegation methods
    //

    of(name, fn) {
        var nsp = this._nsps[name];

        if (! nsp) {
            nsp = new SocketIONamespace(this._io.of(name, fn));
            this._nsps[name] = nsp;
        }

        return nsp;
    }
}

// pass through methods
[
    "serveClient", "set", "path", "adapter", "origins",
    "listen", "attach", "bind", "onconnection",
    /* "of", */ "close"
].forEach(methodName => {
    SocketIOServer.prototype[methodName] = function (...args) {
        this._io[methodName](...args);
        return this;
    };
});

[
    /* "on" */, "to", "in", "use", "emit", "send",
    "write", "clients", "compress",

    // mayajs-socketio-wrapper methods
    "on", "off", "receive", "offReceive"
].forEach(methodName => {
    SocketIOServer.prototype[methodName] = function (...args) {
        return this._sockets[methodName](...args);
    }
});
