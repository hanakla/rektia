import "babel-polyfill";

import _ from "lodash";
import path from "path";
import fs from "fs";
import glob from "glob";

import pascalize from "./utils/pascalize";
import * as deep from "./utils/deep";

export default class ModelLoader {
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
     * @property {String} options.modelDir
     */

    /**
     * @private
     * @property {Object} _configs
     */

    /**
     * @private
     * @property {Logger} logger
     */

    /**
     * @class ConfigLoader
     * @constructor
     * @param {ModuleSwapper} swapper
     * @param {Object} options
     * @param {String} options.modelDir
     */
    constructor(swapper, options) {
        this._swapper = swapper;
        this.options = options;
        this.logger = options.logger;
        this._modelPaths = [];
    }

    /**
     * Load model files
     * @method load
     */
    load() {
        const loadableExtensions = Object.keys(require.extensions).join(",");
        const modelSchemaFiles = glob.sync(`${this.options.modelDir}/**/*{${loadableExtensions}}`);

        modelSchemaFiles.forEach(fullPath => {
            const pathInfo = path.parse(fullPath.slice(this.options.modelDir.length));
            const identity = pathInfo.dir + (pathInfo.dir !== "" ? "/" : "") + pathInfo.name;
            const model = this._swapper.require(fullPath);

            model.prototype.identity = identity;

            this._modelPaths.push(fullPath);
        });
    }

    /**
     * Set models into Waterline
     * @param {Waterline} waterline
     * @param {Object} waterline connection options
     * @return {Promise<Object>} waterline connected Models
     */
    async setupModels(waterline, options) {
        this._modelPaths.forEach(fullPath => {
            waterline.loadCollection(this._swapper.require(fullPath));
        });

        return new Promise((resolve, reject) => {
            waterline.initialize(options, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                const dsPattern = new RegExp(`\\${path.sep}`, "g");
                const models = Object.create(null);
                _.each(result.collections, (model, identity) => {
                    const dirSeparated = identity.replace(dsPattern, ".").split(".");
                    const pascalizeKey = dirSeparated.map((v) => pascalize(v)).join(".");

                    deep.set(models, pascalizeKey, model);
                });

                resolve(models);
            });
        });
    }

    /**
     * @method startWatch
     */
    startWatch() {
        fs.watch(this.options.modelDir, {recursive: true}, (ev, file) => {
            this.logger.info("ModelLoader", "Reloading config : %s", file);
            this.load();
        });
    }
}
