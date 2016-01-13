import {Disposable} from "event-kit";
import Emitter from "../utils/emitter";
import SocketIOSocket from "./socket";

export default class Namespace {
    constructor(nsp) {
        this._emitter = new Emitter();
        this._nsp = nsp;
    }

    _handleConnection(socket) {
        this._emitter.on("connect", socket => {
            const wrappedSocket = new SocketIOSocket(wrappedSocket);
            this._emitter.emit("connect", wrappedSocket);
            this._emitter.emit("connection", wrappedSocket);
        });
    }

    _handleEvents() {
        const onConnect = socket => {
            const wrappedSocket = new SocketIOSocket(wrappedSocket);
            this._emitter.emit("connect", this);
        };;

        this._socket.on("connect", onConnect);
        this._socket.on("connection", onConnection);
    }

    dispose() {
        this._emitter.dispose();
    }


    get rawNamespace() {
        return this._nsp;
    }

    get name() {
        return this._nsp.name;
    }

    get connected() {
        return this._nsp.connected;
    }

    get json() {
        return this._nsp.json;
    }

    get volatile() {
        return this._nsp.volatile;
    }


    /**
     * @return {Promise}
     */
    clients() {
        return new Promise((resolve, reject) => {
            this._nsp.clients(clients => resolve(clients));
        });
    }

    compress(compress) {
        this._nsp.compress(compress);
        return this;
    }

    use(fn) {
        this._nsp.use(fn)
        return this;
    }


    on(event, handler, thisArg = null) {
        return this._emitter.on(event, handler, thisArg || this);
    }

    off(event, handler, thisArg = null) {
        return this._emitter.off(event, handler, thisArg || this);
    }


    receive(event, handler) {
        this._nsp.on(event, handler);
        return this;
    }

    offReceive(event, handler) {
        this._nsp.removeListener(event, handler);
        return this;
    }

    emit(...args) {
        this._nsp.emit(...args);
        return this;
    }


    send(...args) {
        this._nsp.send(...args);
        return this;
    }

    write(...args) {
        return this.send(...args);
    }


    to(name) {
        this._nsp.to(name);
        return this;
    }

    in(name) {
        return this.to(name);
    }
}
