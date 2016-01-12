import fs from "fs";
import path from "path";
import http from "http";
import https from "https";

import _ from "lodash";
import koa from "koa";
import socketio from "socket.io";

import Router from "./router"

// Middleware
import attachParams from "./middleware/attach-params"
import serverError from "./middleware/server-error";
import router from "./middleware/router";
import reloaderInjector from "./middleware/reloader-injector";
import ioWatchAssets from "./middleware/io-watch-assets";

export default class Server {
    /**
     * @private
     * @property {express.Application} _express
     */
    // _express = null;

    /**
     * @private
     * @property {express.Application} _swapper
     */
    // _swapper = null;

    /**
     * @property {socketio.Server} _sockets
     */
    // _sockets = null;

    /**
     * @private
     * @property {http.Server|https.Server} _server
     */
    // _server = null;


    /**
     * @private
     * @property {Router} router
     */
    // router = null;

    /**
     * @class Server
     * @constructor
     * @param {Object} options
     * @param {ModuleSwapper} options.swapper
     * @param {Logger} options.logger
     * @param {Object} options.routes
     * @param {Logger} options.logger
     */
    constructor(options) {
        this._swapper = options.swapper;
        this._logger = options.logger;
        this._koa = koa();
        this._sockets = socketio();
        this.router = new Router(this._swapper, {logger: this._logger});

        this.use(serverError());
    }

    /**
     * get socket.io host.
     * @return {Socketio.Server}
     */
    getSocketIo() {
        return this._sockets;
    }

    /**
     * Start up http(s) server
     * @param {Object} options
     * @param {ConfigLoader} options.config
     * @param {String} options.appRoot Application running path
     * @param {Object|Boolean} options.https HTTPS options
     * @param {String} options.https.key path to SSL key
     * @param {String} options.https.cert path to SSL cert
     * @param {Number} options.port Listening port number
     * @param {Object} options.routes route definition object
     * @param {Boolean} options.watch if true, enable watch for Controller, Model, View
     */
    async start(options) {
        try {
            this._registerMiddlewares(options);
            this.router.load({
                routes  : options.routes,
                controllerDir  : path.join(options.appRoot, "controller/")
            });
            await this._listen(options);
        }
        catch (e) {
            this._logger.error("Server#start", `${e.message}\n${e.stack}`);
            throw e;
        }
    }

    _registerMiddlewares(options) {
        const controllersDir = path.join(options.appRoot, "controller/");
        const viewsDir = path.join(options.appRoot, "views/");

        this.use(attachParams(this));
        this.use(router(this.router));
    }

    async _listen(options) {
        // Get request handlers
        const handler = this._koa.callback();

        // Create server
        if (options.https) {
            this._server = https.createServer({
                key : fs.readFileSync(options.https.key),
                cert : fs.readFileSync(options.https.cert),
            }, handler);
        }
        else {
            this._server = http.createServer(handler);
        }

        // Attach socket.io to server
        this._sockets.attach(this._server);

        // Start server
        return new Promise((resolve, reject) => {
            this._server.listen(options.port, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    use(...args) {
        this._koa.use(...args);
    }
}
