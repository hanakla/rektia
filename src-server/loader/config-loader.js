import _ from "lodash";
import path from "path";
import fs from "fs";
import glob from "glob";
import Emitter from "../utils/emitter"

import * as deep from "../utils/deep"

export default class ConfigLoader {

    /**
     * @private
     * @property {Emitter} _emitter
     */

    /**
     * @private
     * @property {ModuleSwapper} _swapper
     */

    /**
     * @private
     * @property {Object} options
     * @property {String} options.configDir
     * @property {String} options.env
     */

    /**
     * @private
     * @property {Object} _configs
     */

    /**
     * @private
     * @property {Logger} log
     */

    /**
     * @class ConfigLoader
     * @constructor
     * @param {ModuleSwapper} swapper
     * @param {Object} options
     * @param {String} options.configDir
     * @param {String} options.env
     */
    constructor(swapper, options) {
        this._emitter = new Emitter();
        this._swapper = swapper;
        this.options = options;
        this._log = options.logger;
        this._configs = Object.create(null);
    }

    /**
     * Load config files
     * @method load
     */
    load() {
        var loadableExtensions = Object.keys(require.extensions).join(",");
        var allConfigFiles = glob.sync(`${this.options.configDir}/**/*{${loadableExtensions}}`);
        var envConfigFiles = allConfigFiles.filter((path) => path.indexOf(`${this.options.configDir}env/${this.options.env}/`) === 0);
        var commonConfigFiles = allConfigFiles.filter((path) => envConfigFiles.indexOf(path) === -1);

        var loadedConfigs = commonConfigFiles.map((filePath) => {
            var namespace = path.parse(filePath).name;
            return {[namespace] : this._swapper.require(filePath)};
        })
        .concat(envConfigFiles.map((filePath) => {
            var namespace = path.parse(filePath).name;
            return {[namespace] : this._swapper.require(filePath)};
        }));

        this._emitter.emit("reload");

        _.merge(this._configs, ...loadedConfigs);
    }

    /**
     * Get config value
     * @param {String} key
     */
    get(key, defaults) {
        return deep.get(this._configs, key, defaults);
    }

    /**
     * @method startWatch
     */
    startWatch() {
        fs.watch(this.options.configDir, {recursive: true}, (ev, file) => {
            this._log.info("ConfigLoader", "Reloading config : %s", file);
            this.load();
        });
    }

    /**
     * @method observe
     * @param {String} key
     * @param {Function} listener
     */
    observe(key, listener) {
        var oldValue = this.get(key);
        this._emitter.on("reload", () => {
            var newValue = this.get(key);

            if (! _.isEqual(newValue, oldValue)) {
                listener(newValue)
            }
        });
    }
}
