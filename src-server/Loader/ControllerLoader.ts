import * as path from 'path'
import * as fs from 'fs'
import * as chokidar from 'chokidar'
import * as glob from 'glob'
import { EventEmitter as EE3 } from 'eventemitter3'

import * as LoaderUtil from '../Utils/LoaderUtil'
import Controller from '../Controller/Controller'
import Future from '../Utils/Future'

type HandledEvents = 'add' | 'change' | 'unlink' | 'unlinkDir'

export default class ControllerLoader {
    private _emitter = new EE3()
    private controllers: { [relativePath: string]: typeof Controller } = {}

    /**
     * @class ConfigLoader
     * @constructor
     */
    constructor(private options: { controllerDir: string }) { }

    /**
     * Load config files
     * @method load
     */
    public async load() {
        const controllers = await LoaderUtil.readRequireableFiles(this.options.controllerDir, { recursive: true })

        for (const controllerPath of controllers) {
            await this.loadController(controllerPath)
        }
    }

    public watch() {
        const watchPath = path.join(this.options.controllerDir, '**/*')
        chokidar.watch(watchPath, { ignoreInitial: true }).on('all', this.handleFileChange)
    }

    private handleFileChange = async (event: HandledEvents, fullPath: string) => {
        const relative = path.relative(this.options.controllerDir, fullPath)
        let controller = this.controllers[relative]

        // if already loaded to replace
        if (event === 'add' || event === 'change') {
            await this.loadController(fullPath, !!controller)
        }
    }

    private loadController(fullPath: string, reload: boolean = false): Promise<typeof Controller> {
        return new Promise<typeof Controller>((resolve, reject) => {
            const relative = path.relative(this.options.controllerDir, fullPath)
            const oldController = this.controllers[relative]

            let state

            try {
                delete require('module')._cache[fullPath]

                const controller = require(fullPath)
                this.controllers[relative] = controller ?
                    (controller.__esModule ? (controller.default || controller) : controller)
                    : controller

                this._emitter.emit('did-load-controller')
                resolve(this.controllers[relative])
            } catch (e) {
                this.controllers[relative] = oldController
                this._emitter.emit('did-load-error', e)
                reject(e)
            }
        })
    }

    public getLoadedControllers(): { [relativePath: string]: typeof Controller } {
        return { ...this.controllers }
    }

    public onDidLoadController(listener: () => void): void {
        this._emitter.on('did-load-controller', listener)
    }

    public onDidLoadError(listener: (e: Error) => void): void {
        this._emitter.on('did-load-error', listener)
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
