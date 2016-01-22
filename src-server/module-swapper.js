import fs from "fs";
import Swappable from "./swappable";
import prettyLog from "./utils/pretty-log"

export default class ModuleSwapper {

    /**
     * @property {Object<string, fs.FSWatcher>} watcher
     */
    // watcher;

    /**
     * @property {Object} options
     * @property {Logger} options.logger
     */
    // options;

    /**
     * @property {Logger} logger
     */

    constructor(options) {
        this._loaded = {};
        this.options = options;
        this.log = options.logger;
    }

    /**
     * Load and watch module
     * @param {String} modulePath
     * @param {Function} callerRequire=require
     * @param {Boolean} forceReload=false  force load module as Swappable
     */
    require(modulePath, callerRequire, forceReload = false) {
        const _require = callerRequire || require;

        if (this._options.watch !== true) {
            return _require(modulePath);
        }

        try {
            const fullPath = _require.resolve(modulePath);

            // no re-watching for already loaded modules.
            if (this._loaded[fullPath]) return _require(fullPath);

            this._loaded[fullPath] = {
                forceReload,
                watcher: this.registerWatcher(fullPath)
            };

            return _require(fullPath);
        }
        catch (e) {
            throw new Error(`Module loading failed for '${modulePath}'. (${e.message})`);
        }
    }

    // watch (path, callback) {
    //     fs.watch(path, callback);
    // }

    swapModule(fullPath) {
        const loadState = this._loaded[fullPath];
        const oldCache = require.cache[fullPath];

        if (this.isSwappableModuleCache(oldCache) === false && loadState.forceReload !== true) return;

        // Try to load updated module
        try {
            delete require.cache[fullPath];
            require(fullPath);
        }
        catch (e) {
            // restore old module.exports
            require.cache[fullPath] = oldCache;
            throw new Error(`Module swapping failed for '${fullPath}'. (${e.message})`);
        }

        // Try to dispose old module
        try {
            if (typeof oldCache.exports === "object" && typeof oldCache.exports._dispose === "function") {
                oldCache.exports._dispose();
            };
        }
        catch (e) {
            throw new Error(`Module swapping failed for '${fullPath}' in disposing. (${e.message})`);
        }

        this.log.verbose("ModuleSwapper", "swapped module %s", fullPath);
    }

    isSwappableModuleCache(cache) {
        if (! cache) { return false; }
        if (cache.hasOwnProperty("exports") === false) { return false; }
        if (cache.exports instanceof Swappable === false) { return false; }
        return true;
    }

    registerWatcher(fullPath) {
        if (this._loaded[fullPath]) { return; }

        this.log.silly("ModuleSwapper", "start watching : %s", fullPath);

        return fs.watch(fullPath, (event, filename) => {
            switch (event) {
                case "change":
                    try {
                        this.swapModule(fullPath);
                        break;
                    }
                    catch (e) {
                        this.log.error("ModuleSwapper#swapModule", e.stack);
                    }
           }
       });
    }
}
