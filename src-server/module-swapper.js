import fs from "fs";
import Swappable from "./swappable";
import prettyLog from "./utils/pretty-log"

export default class ModuleSwapper {
    /**
     * @private
     * @property {Object<string, Object>} _loaded
     */
    // _loaded;

    /**
     * @private
     * @property {Object} options
     * @property {Boolean} options.watch
     */
    // _options;

    /**
     * @private
     * @property {FileWatcher} _watcher
     */
    // _watcher;

    /**
     * @private
     * @property {Logger} log
     */
    // log,

    /**
     * @class ModuleSwapper
     * @constructor
     * @param {Object} options
     * @param {Logger} options.logger
     * @param {FileWatcher} options.watcher
     * @param {Boolean} options.watch
     */
    constructor(options) {
        this._loaded = {};

        this._options = options;
        this._watcher = options.watcher;
        this._log = options.logger;
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

        this._log.verbose("ModuleSwapper", "swapped module %s", fullPath);
    }

    isSwappableModuleCache(cache) {
        if (! cache) { return false; }
        if (cache.hasOwnProperty("exports") === false) { return false; }
        if (cache.exports instanceof Swappable === false) { return false; }
        return true;
    }

    registerWatcher(fullPath) {
        if (this._loaded[fullPath]) { return; }

        this._log.silly("ModuleSwapper", "start watching : %s", fullPath);

        return this._watcher.watch(fullPath, (event, filename) => {
            switch (event) {
                case "change":
                    try {
                        this.swapModule(fullPath);
                        break;
                    }
                    catch (e) {
                        this._log.error("ModuleSwapper#swapModule", "Failed to swap module %s", e.stack);
                    }
           }
       });
    }
}
