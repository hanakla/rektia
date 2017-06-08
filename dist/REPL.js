"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repl = require("repl");
class REPL {
    constructor(app) {
        this._actionShowRoutes = () => {
            const routes = this._exposer.getRoutes().map(routeInfo => {
                return `${routeInfo.httpMethod} ${routeInfo.route}\t\t=> ${routeInfo.controllerName}#${routeInfo.methodName}`;
            });
            console.log(`${routes.join('\n')}`);
        };
        this._exposer = app.getExposer();
        this._server = repl.start({
            prompt: '▷ '
        });
        this._exposeContext();
        this._server.defineCommand('routes', {
            help: 'Show routes',
            action: () => this._actionShowRoutes()
        });
    }
    _exposeContext() {
        const _this = this;
        Object.defineProperties(this._server.context, {
            routes: { get: () => _this._actionShowRoutes() },
            exit: { get: () => process.exit(0) },
            quit: { get: () => process.exit(0) }
        });
    }
}
exports.default = REPL;
