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
const path = require("path");
const chokidar = require("chokidar");
const eventemitter3_1 = require("eventemitter3");
const LoaderUtil = require("../Utils/LoaderUtil");
const Future_1 = require("../Utils/Future");
class ControllerLoader {
    /**
     * @class ConfigLoader
     * @constructor
     */
    constructor(_options) {
        this._options = _options;
        this._emitter = new eventemitter3_1.EventEmitter();
        this._controllers = {};
        this._handleFileChange = (event, fullPath) => __awaiter(this, void 0, void 0, function* () {
            const relative = path.relative(this._options.controllerDir, fullPath);
            let controller = this._controllers[relative];
            // if already loaded to replace
            if (event === 'add' || event === 'change') {
                yield this._loadController(fullPath, !!controller);
            }
        });
    }
    /**
     * Load config files
     * @method load
     */
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const controllers = yield LoaderUtil.readRequireableFiles(this._options.controllerDir, { recursive: true });
            for (const controllerPath of controllers) {
                yield this._loadController(controllerPath);
            }
        });
    }
    watch() {
        const watchPath = path.join(this._options.controllerDir, '**/*');
        chokidar.watch(watchPath, { ignoreInitial: true }).on('all', this._handleFileChange);
    }
    _loadController(fullPath, reload = false) {
        return new Future_1.default((resolve, reject) => {
            const relative = path.relative(this._options.controllerDir, fullPath);
            const oldController = this._controllers[relative];
            let state;
            try {
                if (reload) {
                    state = typeof oldController.__detach === 'function' ? oldController.__detach() : null;
                    delete require('module')._cache[fullPath];
                }
                const controller = require(fullPath);
                this._controllers[relative] = controller ?
                    (controller.__esModule ? (controller.default || controller) : controller)
                    : controller;
                if (reload) {
                    if (this._controllers[relative].__attach) {
                        this._controllers[relative].__attach(state);
                    }
                }
                this._emitter.emit('did-load-controller');
                resolve(this._controllers[relative]);
            }
            catch (e) {
                this._controllers[relative] = oldController;
                this._emitter.emit('did-load-error', e);
                reject(e);
            }
        });
    }
    getLoadedControllers() {
        return Object.assign({}, this._controllers);
    }
    onDidLoadController(listener) {
        this._emitter.on('did-load-controller', listener);
    }
    onDidLoadError(listener) {
        this._emitter.on('did-load-error', listener);
    }
}
exports.default = ControllerLoader;
