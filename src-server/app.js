import fs from "fs";
import path from "path";

import _ from "lodash";
import express from "express";
import socketio from "socket.io";
import yargs from "yargs";
import Waterline from "waterline";

import ModuleSwapper from "./module-swapper";
import ConfigLoader from "./config-loader"
import NotAllowedException from "./exception/not-allowed"
import ModelLoader from "./model-loader";
import Logger from "./logger";
import FileWatcher from "./file-watcher";
import * as prettyLog from "./utils/pretty-log"
import Model from "./model";

// Middleware
import bodyParser from "body-parser";
import attachParams from "./middleware/attach-params"
import serverError from "./middleware/server-error";
import router from "./middleware/router";
import reloaderInjector from "./middleware/reloader-injector";
import ioWatchAssets from "./middleware/io-watch-assets";

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
     * @property {Logger} logger
     */

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

        this.logger = new Logger();
        this.watcher = new FileWatcher();
        this.waterline = new Waterline();

        this.swapper = new ModuleSwapper({
            logger  : this.logger,
            watch   : this.options.watch || true
        });

        this.config = new ConfigLoader(this.swapper, {
            logger      : this.logger,
            configDir   : path.join(this.options.appRoot, "config/"),
            env         : this.options.env
        });

        this.config.load();

        this._modelLoader = new ModelLoader(this.swapper, {
            modelDir : path.join(this.options.appRoot, "models/"),
        });
        this._modelLoader.load();

        this._express = express();
        this._socketio = socketio();

        this._exportClasses();
        global.maya = this;
    }

    async start() {
        try {
            this.config.startWatch();

            await this._buildScripts();

            this._setExpressConfig();

            this.models = await this._modelLoader.setupModels(this.waterline, this.config.get("database"));

            // Assumption register all middlewares before listen()
            this._registerMiddlewares();

            this._listen();

            if (this.options.env === App.ENV_DEVEL) {
                this._startAssetsWatching();
            }
        }
        catch (e) {
            this.logger.error("App#start", `${e.message}\n${e.stack}`);
            throw e;
        }
    }

    async _buildScripts() {
        this.logger.info("App Builder", "Run build.js");

        const buildScript = path.join(this.options.appRoot, "build.js");
        const builder = this.swapper.require(buildScript, require);
        const returns = builder(this.options.env);

        await returns.then ? returns : Promise.reoslve();
    }

    _exportClasses() {
        this.NotAllowedException = NotAllowedException;
        this.Model = Model;
        this._express.config = {get : (key) => this.config.get(key) };
    }

    _setExpressConfig() {
        this._express.set("views", path.join(this.options.appRoot, "views/"));
        this._express.set("view engine", this.config.get("maya.view.engine"));
    }

    _registerMiddlewares() {
        const staticRoot = path.join(this.options.appRoot, ".tmp/");
        const controllersDir = path.join(this.options.appRoot, "controller/");

        if (this.options.env === App.ENV_DEVEL) {
            this._express.use(reloaderInjector());
            this._socketio.use(ioWatchAssets());
        }

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
            this._socketio.attach(this._server);

            this.logger.info("App", `<maya.js start on port ${this.options.port} in ${this.options.env} environment.>`);
        }
        catch (e) {
            this.logger.error("App", "Handle Exception on startup maya.js (%s)", e.message);
            prettyLog.error("Handle Exception on startup maya.js", e);
        }
    }

    _startAssetsWatching() {
        const staticDir = path.join(this.options.appRoot, ".tmp/");
        const stylesDir = path.join(staticDir, "styles/");
        const controllersDir = path.join(this.options.appRoot, "controller/");
        const viewsDir = path.join(this.options.appRoot, "views/");

        // Request swapping links
        const swap = _.debounce((type, fileUrl) => {
            this._socketio.to("__maya__").emit("__maya__.swap", {fileType: "css", fileUrl});
        }, 1000, { maxWait: 5000});

        // Request page reloading
        const reload = _.debounce((file) => {
            this._socketio.to("__maya__").emit("__maya__.reload");
        }, 1000, { maxWait: 5000});

        // watch static assets
        this.watcher.watch(staticDir, (event, file) => {
            if (/^styles\/.+/.test(file)) {
                swap("css", `/${file}`);
            }
            else {
                reload();
            }
        });

        // watch controllers changes
        this.watcher.watch(controllersDir, (event, file) => {
            reload();
        });
    }

    use(...args) {
        this._express.use(...args);
    }
}
