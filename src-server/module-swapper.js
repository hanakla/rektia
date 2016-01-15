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
        this.watcher = {};
        this.options = options;
        this.logger = options.logger;
    }

    require(modulePath, callerRequire) {
        callerRequire = callerRequire || require;

        try {
            var fullPath = callerRequire.resolve(modulePath);

            if (this.options.watch === true) {
                this.registerWatcher(fullPath);
            }

            return callerRequire(fullPath);
        }
        catch (e) {
            throw new Error(`Module loading failed for '${modulePath}'. (${e.message})`);
        }
    }

    // watch (path, callback) {
    //     fs.watch(path, callback);
    // }

    swapModule(fullPath) {
        var cache = require.cache[fullPath];

        if (! this.isSwappableModuleCache(cache)) { return; }

        var oldCache = cache;

        try {
            oldCache.exports._dispose();
            oldCache = null;
        }
        catch (e) {
            throw new Error(`Module swapping failed for '${fullPath}' in disposing. (${e.message})`);
        }

        try {
            delete require.cache[fullPath];
            require(fullPath);
        }
        catch (e) {
            // restore old module.exports
            delete require.cache[fullPath];
            throw new Error(`Module swapping failed for '${fullPath}'. (${e.message})`);
        }

        this.logger.verbose("ModuleSwapper", "swapped module %s", fullPath);
    }

    isSwappableModuleCache(cache) {
        if (! cache) { return false; }
        if (cache.hasOwnProperty("exports") === false) { return false; }
        if (cache.exports instanceof Swappable === false) { return false; }
        return true;
    }

    registerWatcher(fullPath) {
        if (this.watcher[fullPath]) { return; }

        this.logger.silly("ModuleSwapper", "start watching : %s", fullPath);

        this.watcher[fullPath] = fs.watch(fullPath, (event, filename) => {
            switch (event) {
            //    case "rename":
            //         fullPath = filename;
            //     //    this.watcher[filename] = this.watcher[fullPath];
            //        break;

                case "change":
                    try {
                        this.swapModule(fullPath);
                        break;
                    }
                    catch (e) {
                        this.logger.error("ModuleSwapper#swapModule", e.stack);
                    }
           }
       });
    }
}
