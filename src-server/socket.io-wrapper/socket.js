import {CompositeDisposable} from "event-kit";
import Emitter from "../utils/emitter";

export default class SocketIOSocket {
    constructor(socket) {
        this._disposable = new CompositeDisposable();
        this._emitter = new Emitter();
        this._socket = socket;

        this._disposable.add(this._emitter);

        this._handleEvents()
    }

    _handleEvents() {
        const onError = err => this._emitter.emit("error", err);
        const onConnect = socket => this._emitter.emit("connect", this);
        const onDisconnect = reason => this._emitter.emit("disconnect", reason);
        const clearHandlers = () => {
            this._socket.removeListener("error", onError);
            this._socket.removeListener("connect", onConnect);
            this._socket.removeListener("disconnect", onDisconnect);
            this._socket.removeListener("disconnect", clearHandlers);
            this._emitter.dispose();
        };

        this._socket.on("error", onError);
        this._socket.on("connect", onConnect);
        this._socket.on("disconnect", onDisconnect);
        this._socket.on("disconnect", clearHandlers);
    }


    get rooms() {
        return this._socket.rooms;
    }

    get client() {
        return this._socket.client;
    }

    get conn() {
        return this._socket.conn;
    }

    get request() {
        return this._socket.request;
    }

    get id() {
        return this._socket.id;
    }

    // Flag setters

    get json() {
        this._socket.json;
        return this;
    }

    get volatile() {
        this._socket.volatile;
        return this;
    }

    get broadcast() {
        this._socket.broadcast;
        return this;
    }


    on(event, handler, thisArg = null) {
        return this._emitter.on(event, handler, thisArg || this);
    }

    off(event, handler, thisArg = null) {
        return this._emitter.off(event, handler, thisArg || this);
    }


    receive(name, handler) {
        this._socket.on(event, handler);
        return this;
    }

    offReceive(event, handler) {
        this._socket.removeListener(event, handler);
        return this;
    }

    emit(...args) {
        this._socket.emit(...args);
        return this;
    }


    join(name) {
        return new Promise((resolve, reject) => {
            this._socket.join(name, err => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    leave(name) {
        return new Promise((resove, reject) => {
            this._socket.leave(name, err => {
                if (err) reject(err);
                resolve();
            });
        });
    }


    to(room) {
        this._socket.to(room);
        return this;
    }

    "in"(room) {
        this.to(room);
        return this;
    }
}
