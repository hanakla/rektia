import {CompositeDisposable, Disposable} from "event-kit";

/**
 * @class DisposableEmitter
 * @constructor
 */
export default class DisposableEmitter {
    constructor() {
        this.disposed = false;
        this._events = Object.create(null);
        this._eventDisposers = new CompositeDisposable();
    }

    /**
     * @return {Disposable}
     */
    on(event, fn, context = this) {
        if (this.disposed) {
          throw new Error("Emitter has been disposed");
        }

        if (typeof fn !== "function") {
            throw new TypeError("Listener must be function");
        }

        const listener = {
            listener: fn,
            context: context,
            once: false
        };

        this._events[event] = this._events[event] || [];
        this._events[event].push(listener);

        const disposer = new Disposable(() => { this.off(event, fn, context); });
        listener.disposer = disposer;

        return disposer;
    }

    addListener(...args) {
        return this.on(...args);
    }

    /**
     * @return {Disposable}
     */
    once(event, fn, context = this) {
        if (this.disposed) {
            throw new Error("Emitter has been disposed");
        }

        if (typeof fn !== "function") {
            throw new TypeError("Listener must be function");
        }

        const listener = {
            listener: fn,
            context: context != null ? context : this,
            once: true
        };

        this._events[event] = this._events[event] || [];
        this._events[event].push(listener);

        const disposer = new Disposable(() => {  this.off(event, fn, context); });
        listener.disposer = disposer;
        this._eventDisposers.add(disposer);

        return disposer;
    };

    /**
     * @return {this}
     */
    off(event, fn, context = this, once = false) {
        if (this.disposed) {
            return this;
        }

        const listeners = this._events[event];
        if (listeners == null || listeners.length === 0) {
            return this;
        }

        const newListeners = [];
        for (let i = 0, len = listeners.length; i < len; i++) {
            let entry = listeners[i];

            if (
                (entry.listener !== fn)
                || (entry.once !== once)
                || (context !== entry.context)
            ) {
                newListeners.push(entry);
            }
            else {
                entry.disposer.disposalAction = null;
            }
        }

        this._events[event] = newListeners;
        return this;
    };

    removeListener(...args) {
        return this.off(...args);
    }

    /**
     * @return {this}
     */
    removeAllListeners(event) {
        // var disposers, entry, i, len, listeners;
        if (this.disposed) {
            return this;
        }

        if (event == null) {
            // Clear all reference from disposables
            this._eventDisposers.disposables.forEach(disposble => {
                disposable.disposalAction = null;
                disposable.dispose();
            });

            this._eventDisposers.clear();
            this._events = Object.create(null);

            return this;
        }

        const listeners = this._events[event];
        if (listeners == null || listeners.length === 0) {
            return this;
        }

        for (let i = 0, len = listeners.length; i < len; i++) {
            let entry = listeners[i];

            entry.disposer.disposalAction = null;
            disposers.remove(entry.disposer);
        }

        this._events[event] = [];
        return this;
    };

    /**
     * @return {this}
     */
    emit(event, ...args) {
        if (this.disposed) {
            throw new Error("Emitter has been disposed");
        }

        const listeners = this._events[event];
        if (listeners == null || listeners.length === 0) {
            return this;
        }

        for (let i = 0, len = listeners.length; i < len; i++) {
            let entry = listeners[i];

            if (entry.once) {
                this.off(event, entry.listener, entry.context, true);
            }

            entry.listener.apply(entry.context, args);
        }

        return this;
    };

    /**
     * @return {Array | boolean}
     */
    listeners(event, exists = false) {
        if (this.disposed) {
            return [];
        }

        const available = this._events[event] != null && this._events[event].length !== 0;

        if (exists) {
            return available;
        }

        if (!available) {
            return [];
        }

        return this._events[event].map(entry => {
            return entry.listener;
        })
    };

    dispose() {
        this._eventDisposers = null;
        this._events = null;

        return this.disposed = true;
    };
}
