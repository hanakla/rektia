import * as path from 'path'
import * as fs from 'fs'
import * as chokidar from 'chokidar'
import glob from 'glob'
import * as Module from 'module'
import {EventEmitter as EE3} from 'eventemitter3'
import * as LoaderUtil from '../Utils/LoaderUtil'
import Controller from '../Controller'

type HandledEvents = 'add' | 'change' | 'unlink' | 'unlinkDir'

export default class ControllerLoader {
    private _emitter = new EE3()
    private _controllers: {[relativePath: string]: typeof Controller} = {}

    /**
     * @class ConfigLoader
     * @constructor
     */
    constructor(private _options: {controllerDir: string}) {　}

    /**
     * Load config files
     * @method load
     */
    public async load()
    {
        const controllers = await LoaderUtil.readRequireableFiles(this._options.controllerDir, {recursive: true})

        for (const controllerPath of controllers) {
            this._loadController(controllerPath)
        }

        const watchPath = path.join(this._options.controllerDir, '**/*')
        chokidar.watch(watchPath, {ignoreInitial: true}).on('all', this._handleFileChange)
    }

    private _handleFileChange = (event: HandledEvents, fullPath: string) =>
    {
        const relative = path.relative(this._options.controllerDir, fullPath)
        let controller = this._controllers[relative]

        // if already loaded to replace
        if (event === 'add' || event === 'change') {
            const Controller = this._loadController(fullPath, !!controller)
            this._emitter.emit('did-load-controller')
            // console.info(`Reload controller: ${relative} (${Controller && Controller.name})`)
        }
    }

    private _loadController(fullPath: string, reload: boolean = false): typeof Controller | null
    {
        const relative = path.relative(this._options.controllerDir, fullPath)
        const oldController = this._controllers[relative]
        let state

        try {
            if (reload) {
                state = typeof oldController.__detach === 'function' ? oldController.__detach() : null
                delete require('module')._cache[fullPath]
            }

            const controller = require(fullPath)
            this._controllers[relative] = controller ?
                (controller.default ? controller.default : controller)
                : controller

            if (reload) {
                if (this._controllers[relative].__attach) {
                    this._controllers[relative].__attach(state)
                }
            }
        } catch (e) {
            this._controllers[relative] = oldController
            console.error(e);
        }

        return this._controllers[relative]
    }

    public getLoadedControllers(): {[relativePath: string]: typeof Controller}
    {
        return {...this._controllers}
    }

    public onDidLoadController(listener: () => void): void
    {
        this._emitter.on('did-load-controller', listener)
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
