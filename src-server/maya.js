import _ from "lodash";
import path from "path";
import Waterline from "waterline";
import yargs from "yargs";

import Logger from "./logger";
import FileWatcher from "./file-watcher";
import ModuleSwapper from "./module-swapper";
import ConfigLoader from "./loader/config-loader"
import ModelLoader from "./loader/model-loader";
import Server from "./server";

import handleAsync from "./utils/handle-async";

const VERSION = require(path.join(__dirname, "../package.json")).version;

/**
 * Initialize application backends.(Load config, Build assets, Start server)
 * @class Maya
 */
export default class Maya {
    static get VERSION() { return VERSION; }
    static get ENV_DEVEL() { return "devel"; }
    static get ENV_PRODUCTION() { return "production"; }

    /**
     * @param {String} argv argv, pre excuted `process.argv.slice(2)`
     * @return {Object}
     */
    static parseArgs(argv) {
        const args = yargs
        .string("port")
        .default("port", 3000)
        .describe("port", "Listening port number. (It's overrides configured port number)")

        .boolean("no-watch")
        .alias("w", "no-watch")
        .describe("no-watch", "No watching Model, View, Controller changing.")

        .string("env")
        .default("env", "devel")
        .describe("env", "Specify running environment (production, devel, test).")

        .help("help")
        .alias("h", "help")

        .parse(argv);

        var watch = ! args.w;
        if (args.env === Maya.ENV_DEVEL && args.w == null) {
            watch = true;
        }

        return {
            port    : args.port,
            watch   : watch,
            env     : args.env
        };
    }

    /**
     * @private
     * @property {Object} _options
     */

    /**
     * @property {Logger} logger
     */

    /**
     * @property {FileWatcher} watcher
     */

    /**
     * @property {ConfigLoader} config
     */

    /**
     * @property {ModelLoader} _modelLoader
     */

    /**
     * @property {ModuleSwapper} swapper
     */

    /**
     * @property {Waterline} waterline
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
        this._options = options || {};
        // this._options = _.defaults(options, {
        //     env     : "devel",
        //     appRoot : process.cwd() + path.sep,
        //     watch   : true,
        //     port    : null
        // });

        // application logger
        this.logger = new Logger({
            logLevel : 0,
            paused : true,
        });

        // file watcher
        this.watcher = new FileWatcher();

        // SwappableModule loader
        this.swapper = new ModuleSwapper({
            logger  : this.logger,
            watch   : this._options.watch
        });

        // config accessor
        this.config = new ConfigLoader(this.swapper, {
            logger      : this.logger,
            configDir   : path.join(this._options.appRoot, "config/"),
            env         : this._options.env
        });

        // Model loader
        this._modelLoader = new ModelLoader(this.swapper, {
            modelDir : path.join(this._options.appRoot, "models/"),
        });

        // database connector
        this.waterline = new Waterline();

        // express instance handler
        this.server = new Server({
            swapper : this.swapper,
            logger : this.logger
        });

        global.maya = this;
    }

    /**
     * Start application
     * @method start
     */
    async start() {
        try {
            // Load configs
            this.config.load({watch: this._options.watch});

            // set log level
            this.logger.setLogLevel(this.config.get("maya.log.level"));
            this.logger.resume();

            // Load model definitions
            this._modelLoader.load({watch: this._options.watch});

            // Link models to waterline and expose models
            this.models = await this._modelLoader.setupModels(this.waterline, this.config.get("database"));

            // Run build script (`app/build.js`)
            this.logger.info("App#start", "Waiting for build...");
            // await this._buildScripts();
            this.logger.info("App#start", "End build");

            // get socket.io host object
            this.sockets = this.server.getSocketIo();

            // if watch option enabled, start chnages watching.
            if (this._options.watch) {
                this.config.startWatch();
                this._startAssetsWatching();
            }

            // Decide listening port
            const listeningPort = this._options.port == null
                ? this.config.get("maya.server.port")
                : this._options.port | 0;

            // Start listening
            await this.server.start({
                config  : this.config,
                appRoot : this._options.appRoot,
                port    :  listeningPort,
                routes  : this.config.get("routes"),
                watch   : this._options.watch
            });

            this.logger.info("Server", `<maya.js start on port ${listeningPort} in ${this._options.env} environment.>`);
        }
        catch (e) {
            this.logger.error("App#start", `${e.message}\n${e.stack}`);
            process.exit(-1);
        }
    }

    /**
     * attach middleware to express
     * @method use
     */
    use(...args) {
        this.server.use(...args);
    }

    async _buildScripts() {
        this.logger.info("App Builder", "Run build.js");

        const buildScript = path.join(this._options.appRoot, "build.js");
        const builder = this.swapper.require(buildScript, require);
        const returns = builder(this._options.env);

        await handleAsync(returns);
    }

    _startAssetsWatching() {
        const staticDir = path.join(this._options.appRoot, ".tmp/");
        const stylesDir = path.join(staticDir, "styles/");
        const controllersDir = path.join(this._options.appRoot, "controller/");
        const viewsDir = path.join(this._options.appRoot, "views/");

        // Request swapping links
        const swap = _.debounce((type, fileUrl) => {
            this.sockets.to("__maya__").emit("__maya__.swap", {fileType: "css", fileUrl});
        }, 500, { maxWait: 5000});

        // Request page reloading
        const reload = _.debounce((file) => {
            this.sockets.to("__maya__").emit("__maya__.reload");
        }, 500, { maxWait: 5000});

        // watch static assets
        this.watcher.watch(staticDir, (event, file) => {
            if (/^styles\/.+/.test(file)) {
                // if css file updated
                swap("css", `/${file}`);
            }
            else {
                reload();
            }
        });

        // watch controllers changes
        this.watcher.watch(controllersDir, reload);

        // watch view changes
        this.watcher.watch(viewsDir, reload);
    }
}
