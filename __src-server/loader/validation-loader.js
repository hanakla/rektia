import glob from "glob";

/**
 * @class ValidationLoader
 */
export default class ValidationLoader {
    /**
     * @private
     * @property {ModuleSwapper} _swapper
     */

    /**
     * @private
     * @property {Object} options
     * @property {Logget} options.logger
     * @property {String} options.validationsDir
     */

    /**
     * @private
     * @property {Logger} logger
     */

    /**
     * @class ValidationLoader
     * @constructor
     * @param {ModuleSwapper} swapper
     * @param {Object} options
     * @param {Logger} options.logger
     * @param {String} options.validationsDir
     */
    constructor(swapper, options) {
        this._swapper = swapper;

        this.options = options;
        this.logger = options.logger;
    }

    /**
     * Load config files
     * @method load
     * @param {Wildgeese} wildgeese
     */
    load(wildgeese) {
        const loadableExtensions = Object.keys(require.extensions).join(",");
        const validationRuleFiles = glob.sync(`${this.options.validationsDir}/**/*{${loadableExtensions}}`);
        const rules = validationRuleFiles.map(filePath => this._swapper.require(filePath));
        wildgeese.addRule(rules);
    }

    /**
     * @method reload
     * @param {Wildgeese} wildgeese
     */
    reload(wildgeese) {
        this.load(wildgeese);
    }
}
