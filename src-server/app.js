import fs from "fs";
import path from "path";

import _ from "lodash";
import express from "express";
import socketio from "socket.io";
import yargs from "yargs";

import ModuleSwapper from "./module-swapper";
import ConfigLoader from "./config-loader"
import NotAllowedException from "./exception/not-allowed"
import * as prettyLog from "./utils/pretty-log"

// Middleware
import bodyParser from "body-parser";
import attachParams from "./middleware/attach-params"
import serverError from "./middleware/server-error";
import router from "./middleware/router";

const VERSION = require(path.join(__dirname, "../package.json")).version;


export default class App {
    static get VERSION() { return VERSION;}
    static get ENV_DEVEL() { return "devel"; }
    static get ENV_PRODUCTION() { return "production"; }

    /**
     * @param {String} argv argv, pre excuted `process.argv.slice(2)`
     * @return {Object}
     */
    static parseArgs(argv) {
        var args = yargs
        .string("port")
        .default("port", 3000)
        .describe("port", "Listening port number.")

        // Not implement for disable watching
        // .boolean("watch")
        // .default("watch", true)
        // .alias("w", "watch")
        // .describe("watch", "Watch Model, View, Controller changing.")

        .string("env")
        .default("env", "devel")
        .describe("env", "Specify running environment (production, devel, test).")

        .help("help")
        .alias("h", "help")

        .parse(argv);

        return {
            port    : args.port | 0,
            watch   : !! args.watch,
            env     : args.env
        };
    }


    /**
     * @private
     * @property {Object} options
     */
    // options;

    /**
     * @private
     * @property {express.Application} _express
     */
    // _express;

    /**
     * @private
     * @property {socketio.Server} _socketio
     */
    // _socketio

    /**
     * @private
     * @property {http.Server} _server
     */
    // _server

    /**
     * @private
     * @property {Swapper} swapper
     */
    // swapper;

    /**
     * @private
     * @property {Router} router
     */
    // router;

    /**
     * @param {Object} options
     * @param {String} options.env Application running environment
     * @param {String} options.appRoot Application running path
     * @param {Number} options.port Listening port number
     * @param {Object} options.routes route definition object
     * @param {Boolean} options.watch if true, enable watch for Controller, Model, View
     */
    constructor(options) {
        this.options = _.defaults(options, {
            env     : "devel",
            appRoot : process.cwd() + path.sep,
            watch   : false,
            routes  : {},
            port    : 3000
        });

        this.swapper = new ModuleSwapper({
            watch   : this.options.watch || true
        });

        this.config = new ConfigLoader(this.swapper, {
            configDir   : path.join(this.options.appRoot, "config/"),
            env         : this.options.env
        });
        this.config.load();

        this._express = express();

        this._exportClasses();
        global.maya = this;
    }

    start() {
        this.config.startWatch();

        this._setExpressConfig();

        // Assumption register all middlewares before listen()
        this._registerMiddlewares();

        this._listen();
    }

    _exportClasses() {
        this.NotAllowedException = NotAllowedException;
        this._express.config = {get : (key) => this.config.get(key) };
    }

    _setExpressConfig() {
        this._express.set("views", path.join(this.options.appRoot, "views/"));
        this._express.set("view engine", this.config.get("maya.view.engine"));
    }

    _registerMiddlewares() {
        const staticRoot = path.join(this.options.appRoot, "public/");
        const controllersDir = path.join(this.options.appRoot, "controller/");

        this._express.use(express.static(staticRoot));

        this._express.use(bodyParser());
        this._express.use(attachParams(this));

        this._express.use(router(this.swapper, {
            watch   : this.options.env === App.ENV_DEVEL,
            routes  : this.config.get("routes"),
            controllerDir  : controllersDir
        }));

        this._express.use(serverError());
    }

    _listen(hostname, backlog, callback) {
        try {
            this._server = this._express.listen(this.options.port, hostname, backlog, callback);
            this._socketio = socketio(this._server);

            console.log(`\u001b[36;1m<maya.js start on port ${this.options.port} in ${this.options.env} environment.>\u001b[m`);
        }
        catch (e) {
            prettyLog.error("Handle Exception on startup maya.js", e);
        }
    }

    use(...args) {
        this._express.use(...args);
    }
}
