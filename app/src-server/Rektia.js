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
const Koa = require("koa");
const _ = require("lodash");
const path = require("path");
const REPL_1 = require("./REPL");
const ConfigLoader_1 = require("./Loader/ConfigLoader");
const ControllerLoader_1 = require("./Loader/ControllerLoader");
const RouteBuilder_1 = require("./Router/RouteBuilder");
class Rektia {
    constructor(_options = {}) {
        this._options = _options;
        this._handleControllerLoad = _.debounce(() => {
            const controllerSet = this._controllerLoader.getLoadedControllers();
            this._router.buildFromControllerSet(controllerSet);
            console.log('\u001b[36m[Info] Controller reloaded\u001b[m');
        }, 1000);
        this._handleConfigLoad = _.debounce(() => {
            this._config = this._configLoader.getConfig();
            console.log(`\u001b[36m[Info] Config reloaded\u001b[m`);
        });
        this._attachContext = (context, next) => __awaiter(this, void 0, void 0, function* () {
            context.config = (path, defaultValue) => {
                console.log(this._config);
                _.get(this._config, path, defaultValue);
            };
            yield next();
        });
        this._koa = new Koa();
        this.environment = _options.environment || 'development';
        this.appRoot = _options.appRoot || process.cwd();
        this._configLoader = new ConfigLoader_1.default({
            configDir: path.join(this.appRoot, 'config'),
            environment: this.environment
        });
        this._controllerLoader = new ControllerLoader_1.default({
            controllerDir: path.join(this.appRoot, 'app/controllers'),
        });
        this._router = new RouteBuilder_1.default();
        if (this.environment === 'development') {
            this._repl = new REPL_1.default(this);
            this._controllerLoader.watch();
            this._controllerLoader.onDidLoadController(this._handleControllerLoad);
            this._controllerLoader.onDidLoadError(console.error.bind(console));
            this._configLoader.watch();
            this._configLoader.onDidLoadConfig(this._handleConfigLoad);
        }
    }
    getExposer() {
        return {
            getRoutes: () => this._router.routes()
        };
    }
    use(middleware) {
        this._koa.use(middleware);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            process.on('uncaughtException', (e) => {
                console.error(`\u001b[31m${e.stack}\u001b[m`);
            });
            process.on('unhandledRejection', (e) => {
                console.error(`\u001b[31m${e.stack}\u001b[m`);
            });
            yield this._controllerLoader.load();
            yield this._configLoader.load();
            // this._koa.use(async (ctx: Context, next: () => Promise<any>) => {
            //     try { await next() } catch (e) { console.log(e) }
            //     console.log(ctx.body, ctx.response.type)
            // })
            this._koa.use(this._attachContext);
            this._koa.use(this._router.middleware);
            this._koa.listen(9000);
        });
    }
}
exports.default = Rektia;
