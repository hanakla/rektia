"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
const chokidar = require("chokidar");
const LoaderUtil = require("../Utils/LoaderUtil");
const eventemitter3_1 = require("eventemitter3");
class ConfigLoader {
    /**
     * @class ConfigLoader
     * @constructor
     */
    constructor(_options) {
        this._options = _options;
        this._emitter = new eventemitter3_1.EventEmitter();
        this._configs = {};
        this._handleFileChange = (event, fullPath) => __awaiter(this, void 0, void 0, function* () {
            const relative = path.relative(this._options.configDir, fullPath);
            // if already loaded to replace
            if (event === 'add' || event === 'change') {
                yield this._loadConfig(fullPath);
            }
        });
    }
    /**
     * Load config files
     * @method load
     */
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const configFiles = yield LoaderUtil.readRequireableFiles(this._options.configDir, {
                recursive: true,
                ignore: path.join(this._options.configDir, 'environments/**/*')
            });
            this._configs = {};
            for (const filePath of configFiles) {
                yield this._loadConfig(filePath);
            }
        });
    }
    watch() {
        const watchPath = path.join(this._options.configDir, '**/*');
        chokidar.watch(watchPath, { ignoreInitial: true }).on('all', this._handleFileChange);
    }
    _loadConfig(fullPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const relative = path.relative(this._options.configDir, fullPath);
                const pathInfo = path.parse(relative);
                const namespace = pathInfo.name;
                const config = require(fullPath);
                const _storage = {};
                if (config.__esModule) {
                    if (config.default) {
                        Object.assign(_storage, _.cloneDeep(_.omit(config, ['default'])));
                        Object.assign(_storage, _.cloneDeep(config.default));
                    }
                    else {
                        Object.assign(_storage, _.cloneDeep(config));
                    }
                }
                else {
                    Object.assign(_storage, _.cloneDeep(config));
                }
                this._configs[namespace] = _storage;
                this._emitter.emit('did-load-config');
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    getConfig() {
        return _.cloneDeep(this._configs);
    }
    onDidLoadConfig(listener) {
        this._emitter.on('did-load-config', listener);
    }
}
exports.default = ConfigLoader;
