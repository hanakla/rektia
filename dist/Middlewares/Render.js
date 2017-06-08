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
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const path = require("path");
class RenderMiddleware {
    constructor(_options) {
        this._options = _options;
        this.middleware = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            ctx.render = (view, locals = {}) => {
                const viewPath = path.parse(view);
                const fullPath = path.join(this._options.viewPath, view);
                if (require.extensions[viewPath.ext]) {
                    const view = require(fullPath);
                    if (viewPath.ext.match(/[tj]sx/)) {
                        const element = (view.default ? view.default : view)(locals);
                        console.log(element);
                        if (React.isValidElement(element)) {
                            ctx.type = 'text/html; charset=UTF-8';
                            ctx.body = ReactDOMServer.renderToStaticMarkup(element);
                        }
                    }
                    else {
                        ctx.type = 'text/html; charset=UTF-8';
                        ctx.body = view(locals);
                    }
                }
                return Promise.resolve();
            };
            yield next();
        });
    }
}
exports.default = RenderMiddleware;
