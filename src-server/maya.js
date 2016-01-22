import _ from "lodash";
import fs from "fs";
import path from "path";
import Waterline from "waterline";
import yargs from "yargs";
import co from "co";
import Wildgeese from "wildgeese";

import Logger from "./logger";
import FileWatcher from "./file-watcher";
import ModuleSwapper from "./module-swapper";
import ConfigLoader from "./loader/config-loader";
import ModelLoader from "./loader/model-loader";
import ValidationLoader from "./loader/validation-loader";
import Server from "./server";

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
        const parser = yargs()
            .boolean("interactive")
            .alias("interactive", "i")
            .describe("i", "Run with REPL")

            .string("port")
            .describe("port", "Listening port number. (It's overrides configured port number)")

            .boolean("no-watch")
            .describe("no-watch", "No watching Model, View, Controller changing.")

            .string("env")
            .default("env", "devel")
            .describe("env", "Specify running environment (production, devel, test).")

            .help("help")
            .alias("help", "h")

            .strict();

        const args = parser.parse(argv);

        var watch = ! args.w;
        if (args.w == null && args.env === Maya.ENV_DEVEL) {
            watch = true;
        }

        return {
            interactive : args.interactive,
            port    : args.port != null ? parseInt(args.port, 10) : null,
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
     * @property {String} keys
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
            watcher : this.watcher,
            watch   : this._options.watch
        });

        // config accessor
        this.config = new ConfigLoader(this.swapper, {
            logger      : this.logger,
            configDir   : path.join(this._options.appRoot, "config/"),
            env         : this._options.env
        });

        // Load configs
        this.config.load({watch: this._options.watch});

        // Model loader
        this._modelLoader = new ModelLoader(this.swapper, {
            logger : this.logger,
            modelDir : path.join(this._options.appRoot, "models/"),
            modelLogicsDir : path.join(this._options.appRoot, "logics/model-logic/"),
        });

        // validator
        this.validator = new Wildgeese();

        // Validation loader
        this._validationLoader = new ValidationLoader(this.swapper, {
            logger : this.logger,
            validationsDir : path.join(this._options.appRoot, "logics/validator-rules/")
        });

        // database connector
        this.waterline = new Waterline();

        // express instance handler
        this.server = new Server({
            swapper : this.swapper,
            logger : this.logger,
            browserSync : options.env === Maya.ENV_DEVEL && options.watch
        });

        Object.defineProperty(this, "keys", {
            set : value => this.server._koa.keys = value,
            get : () => this.server._koa.keys
        })

        global.maya = this;
    }

    /**
     * Start application
     * @method start
     */
    async start() {
        try {
            // set log level
            this.logger.setLogLevel(this.config.get("maya.log.level"));
            this.logger.resume();

            // Load validators
            this._validationLoader.load(this.validator);
            // console.log(this.validator);

            // Load model definitions
            this._modelLoader.load();

            // Link models to waterline and expose models
            this.models = await this._modelLoader.setupModels(
                this.waterline,
                this.validator,
                this.config.get("database")
            );

            // Run build script (`app/build.js`)
            this.logger.info("App#start", "Waiting for build...");
            await this._buildScripts();
            this.logger.info("App#start", "End build");

            // get socket.io host object
            this.io = this.server.getSocketIo();

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
                port    : listeningPort,
                routes  : this.config.get("routes"),
                watch   : this._options.watch
            });

            this.logger.info("Server", `<maya.js start on port \u001b[1m${listeningPort}\u001b[m in \u001b[34m${this._options.env} environment.\u001b[m>`);
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
        this.logger.verbose("App#_buildScripts", "Run build.js");

        const buildScript = path.join(this._options.appRoot, "build.js");
        const builder = this.swapper.require(buildScript, require);
        const returns = builder(this._options.env);

        await co(returns);
    }

    _startAssetsWatching() {
        const waitMs = 2000;
        const appRoot = this._options.appRoot;

        const staticDir = path.join(appRoot, ".tmp/");
        const controllersDir = path.join(appRoot, "controllers/");
        const viewsDir = path.join(appRoot, "views/");
        const modelsDir = path.join(appRoot, "models/");
        const modelLogicsDir = path.join(appRoot, "logics/model-logic/");
        const validatorsDir = path.join(appRoot, "logics/validator-rules/");

        const logReloading = (type) => {
            this.logger.info("App#watch", `${type} changes detected.`);
        };

        if (! fs.existsSync(staticDir)) {
            fs.mkdirSync(staticDir);
        }

        const assetsWatcher = (event, file) => {
            logReloading("\u001b[1mStatic Assets\u001b[m");
            this.server.requestReload(file);
        };

        const controllersWatcher = () => {
            logReloading("\u001b[1mController\u001b[m");
            this.server.requestReload();
        };

        const viewsWatcher = () => {
            logReloading("\u001b[1mView\u001b[m");
            this.server.requestReload();
        };

        const modelWatcher = (async function () {
            logReloading("\u001b[1mModel\u001b[m");

            try {
                // teardown old models
                this.models = null;
                await new Promise(resolve => this.waterline.teardown(resolve))
                this.waterline = null;

                // reload models
                this.waterline = new Waterline();
                this.models = await this._modelLoader.reload(
                    this.waterline,
                    this.validator,
                    this.config.get("database")
                );
                this.server.requestReload();
            }
            catch (e) {
                this.logger.error(`Model reloading error (${e.message})`);
            }
        }).bind(this);

        const validatorWatcher = (async function () {
            logReloading("\u001b[1mValidator\u001b[m");

            // Reloading validator
            try {
                const validator = new Wildgeese();
                this._validationLoader.reload(validator);
                this.validator = validator;
                // _.map(this.validator._validators, v => console.log(v.__generatorFunction__.toString()));

                // Reload models (models depends validator)
                // await modelWatcher();
                modelWatcher();
            }
            catch (e) {
                this.logger.error(`Validator reloading error (${e.message})`);
            }
        }).bind(this);

        // watch static assets
        this.watcher.watch(staticDir, _.throttle(assetsWatcher, waitMs));

        // watch controllers changes
        this.watcher.watch(controllersDir, _.throttle(controllersWatcher, waitMs));

        // watch view changes
        this.watcher.watch(viewsDir, _.throttle(viewsWatcher, waitMs));

        // watch model changes
        this.watcher.watch([modelsDir, modelLogicsDir], _.throttle(modelWatcher, waitMs));

        // watch validator changes
        this.watcher.watch(validatorsDir, _.throttle(validatorWatcher, waitMs))

    }
}
