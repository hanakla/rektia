import fs from "fs";
import {Disposable, CompositeDisposable} from "event-kit";

export default class FileWatcher {
    /**
     * @class FileWatcher
     * @constructor
     */
    constructor() {
        this._watchers = new CompositeDisposable();
    }

    /**
     * @param {String|Array<String>} path
     * @param {Function(event: String, file: String)} callback
     * @return {Disposable}
     */
    watch(paths, callback) {
        const targets = Array.isArray(paths) ? paths : [paths];
        const watchers = targets.map(path => fs.watch(path, {persistent: true, recursive: true}, callback));
        watchers.map(watcher => watcher.on("error", err => { throw err; }));

        var unwatch = new Disposable(() => {
            watchers.map(w => w.close());
            this._watchers.remove(unwatch);
            unwatch = null;
        });

        this._watchers.add(unwatch);
        return unwatch;
    }

    unwatchAll() {
        this._watchers.dispose();
        this._watchers = new CompositeDisposable();
    }
}
