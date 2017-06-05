import * as _ from 'lodash'
import * as path from 'path'
import * as chokidar from 'chokidar'
import glob from 'glob'
import * as LoaderUtil from '../Utils/LoaderUtil'
import {EventEmitter as EE3} from 'eventemitter3'

// import * as deep from '../utils/deep'

export default class ConfigLoader extends EE3 {

    /**
     * @class ConfigLoader
     * @constructor
     */
    constructor(private _options: {configDir: string})
    {
        super()

        // this._emitter = new Emitter();;
        // this.options = options;
        // this.logger = options.logger;
        // this._configs = Object.create(null);
    }

    /**
     * Load config files
     * @method load
     */
    public async load()
    {
        // // var loadableExtensions = Object.keys(require.extensions).join(",");
        // // var allConfigFiles = glob.sync(`${this.options.configDir}/**/*{${loadableExtensions}}`);
        // // var envConfigFiles = allConfigFiles.filter((path) => path.indexOf(`${this.options.configDir}env/${this.options.env}/`) === 0);
        // // var commonConfigFiles = allConfigFiles.filter((path) => envConfigFiles.indexOf(path) === -1);

        // const {configDir} = this._options
        // const allConfigFiles = await LoaderUtil.readRequireableFiles(configDir, {recursive: true})

        // // var loadedConfigs = commonConfigFiles.map((filePath) => {
        // //     var namespace = path.parse(filePath).name;
        // //     return {[namespace] : this._swapper.require(filePath)};
        // // })
        // // .concat(envConfigFiles.map((filePath) => {
        // //     var namespace = path.parse(filePath).name;
        // //     return {[namespace] : this._swapper.require(filePath)};
        // // }));

        // const configs = allConfigFiles.map(path => {
        //     path.join(configDir, path)
        //     // require(path)
        // })

        // // _.merge(this._configs, ...loadedConfigs);
    }

    // /**
    //  * Get config value
    //  * @param {String} key
    //  */
    // get(key, defaults) {
    //     return deep.get(this._configs, key, defaults);
    // }

    // private onFileChanged = _.debounce(path => {
    //     this.emit('changed')
    // }, 300)

    // /**
    //  * @method startWatch
    //  */
    // startWatch() {
    //     chokidar.watch(this.options.configDir).on('all', path => {})
    //     fs.watch(this.options.configDir, {recursive: true}, (ev, file) => {
    //         this.logger.info("ConfigLoader", "Reloading config : %s", file);
    //         this.load();
    //     });
    // }

    // /**
    //  * @method observe
    //  * @param {String} key
    //  * @param {Function} listener
    //  */
    // observe(key, listener) {
    //     var oldValue = this.get(key);
    //     this._emitter.on("reload", () => {
    //         var newValue = this.get(key);

    //         if (! _.isEqual(newValue, oldValue)) {
    //             listener(newValue)
    //         }
    //     });
    // }
}
