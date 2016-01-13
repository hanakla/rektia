import _ from "lodash";
import path from "path";
import fs from "fs";
import glob from "glob";

import pascalize from "../utils/pascalize";
import * as deep from "../utils/deep";

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
     * @param {String} options.modelLogicsDir
     */
    constructor(swapper, options) {
        this._swapper = swapper;
        this.options = options;
        this.logger = options.logger;
        this._modelInfos = {};
    }

    /**
     * Load model files
     * @method load
     */
    load() {
        const loadableExtensions = Object.keys(require.extensions).join(",");

        // Load models
        const modelSchemaFiles = glob.sync(`${this.options.modelDir}/**/*{${loadableExtensions}}`);

        modelSchemaFiles.forEach(fullPath => {
            const pathInfo = path.parse(fullPath.slice(this.options.modelDir.length));
            const identity = pathInfo.dir + (pathInfo.dir !== "" ? "/" : "") + pathInfo.name;
            const model = this._swapper.require(fullPath);
            const modelId = (pathInfo.dir !== "" ? pathInfo.dir + "/" : "") + pathInfo.name;;

            this._modelInfos[modelId] = {identity, model: fullPath};
        });

        // Load logics and assign to model.
        const logicFiles = glob.sync(`${this.options.modelLogicsDir}/**/*{${loadableExtensions}}`);

        logicFiles.forEach(fullPath => {
            const relativePath = fullPath.slice(this.options.modelLogicsDir.length);
            const pathInfo = path.parse(relativePath);
            const modelId = (pathInfo.dir !== "" ? pathInfo.dir + "/" : "") + pathInfo.name;

            if (! this._modelInfos[modelId]) {
                this.logger.warn("ModelLoader", `There is no model that corresponds to the Logic.(for app/logics/model-logic/${relativePath})`);
                return;
            }

            this._modelInfos[modelId].logic = fullPath;
        });
    }

    /**
     * Set models into Waterline
     * @param {Waterline} waterline
     * @param {Object} waterline connection options
     * @return {Promise<Object>} waterline connected Models
     */
    async setupModels(waterline, options) {
        _.each(this._modelInfos, info => {
            const modelPath = info.model;
            const logicPath = info.logic;

            const model = this._swapper.require(modelPath);
            const logic = logicPath ? _.cloneDeep(this._swapper.require(logicPath)) : {};
            this._wrapLogicMethods(logic);

            waterline.loadCollection(model.toWaterlineCollection(logic, {
                identity : info.identity
            }));
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

    _wrapLogicMethods(obj) {
        _.each(obj, (prop, name) => {
            if (! _.isFunction(prop)) return;

            obj[name] = function (...args) {
                return prop(this, ...args);
            };
        });

        return obj;
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
