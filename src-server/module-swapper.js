import fs from "fs";
import Swappable from "./swappable";
import prettyLog from "./utils/pretty-log"

const LABEL = "[ModuleSwapper]";

export default class ModuleSwapper {

    /**
     * @property {Object<string, fs.FSWatcher>} watcher
     */
    // watcher;

    /**
     * @property {Object} options
     */
    // options;

    constructor(options) {
        this.watcher = {};
        this.options = options;
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

        cache.exports.dispose();
        delete require.cache[fullPath];
        require(fullPath);

        console.log(`\u001b[36;1m${LABEL} \u001b[m\u001b[36mswapped module ${fullPath}\u001b[m`);
    }

    isSwappableModuleCache(cache) {
        if (! cache) { return false; }
        if (cache.hasOwnProperty("exports") === false) { return false; }
        if (cache.exports instanceof Swappable === false) { return false; }
        return true;
    }

    registerWatcher(fullPath) {
        if (this.watcher[fullPath]) { return; }

        console.log(`\u001b[36;1m${LABEL} \u001b[m\u001b[36mstart watching : \u001b[m${fullPath}`);

        this.watcher[fullPath] = fs.watch(fullPath, (event, filename) => {
            switch (event) {
            //    case "rename":
            //         fullPath = filename;
            //     //    this.watcher[filename] = this.watcher[fullPath];
            //        break;

               case "change":
                   this.swapModule(fullPath);
                   break;
           }
       });
    }
}
