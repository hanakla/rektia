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
const KoaRouter = require("koa-router");
const RouterUtil = require("../Utils/RouterUtil");
class RouteBuilder {
    constructor() {
        this._routeMaps = [];
        this.middleware = (context, next) => __awaiter(this, void 0, void 0, function* () {
            this._middleware(context, next);
        });
        this._router = new KoaRouter();
        this._middleware = this._router.routes();
    }
    routes() {
        return _.cloneDeep(this._routeMaps);
    }
    buildFromControllerSet(controllers) {
        try {
            const r = this._router = new KoaRouter();
            this._routeMaps = [];
            Object.entries(controllers).forEach(([path, controller]) => {
                if (!controller)
                    return;
                const controllerName = RouterUtil.getControllerName(path, controller);
                const methods = RouterUtil.lookUpHandlerMethods(controller);
                const routes = RouterUtil.controllerPathToRoute(path, methods);
                routes.forEach(([route, method, methodName]) => {
                    this._routeMaps.push({
                        httpMethod: 'ALL',
                        route,
                        controllerName,
                        methodName
                    });
                    r.all(route, method);
                });
            });
            this._middleware = r.routes();
        }
        catch (e) {
            console.log(e);
        }
    }
}
exports.default = RouteBuilder;
