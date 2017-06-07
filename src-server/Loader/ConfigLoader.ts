import * as _ from 'lodash'
import * as path from 'path'
import * as chokidar from 'chokidar'
import * as glob from 'glob'
import * as LoaderUtil from '../Utils/LoaderUtil'
import {EventEmitter as EE3} from 'eventemitter3'

interface ConfigLoaderOption {
    configDir: string
    environment: string
}

type HandledEvents = 'add' | 'change' | 'unlink' | 'unlinkDir'

export default class ConfigLoader {
    private _emitter = new EE3()
    private _configs: any = {}

    /**
     * @class ConfigLoader
     * @constructor
     */
    constructor(private _options: ConfigLoaderOption) { }

    /**
     * Load config files
     * @method load
     */
    public async load()
    {
        const configFiles = await LoaderUtil.readRequireableFiles(this._options.configDir, {
            recursive: true,
            ignore: path.join(this._options.configDir, 'environments/**/*')
        })

        this._configs = {}

        for (const filePath of configFiles) {
            await this._loadConfig(filePath)
        }
    }

    public watch()
    {
        const watchPath = path.join(this._options.configDir, '**/*')
        chokidar.watch(watchPath, {ignoreInitial: true}).on('all', this._handleFileChange)
    }

    private _handleFileChange = async (event: HandledEvents, fullPath: string) =>
    {
        const relative = path.relative(this._options.configDir, fullPath)

        // if already loaded to replace
        if (event === 'add' || event === 'change') {
            await this._loadConfig(fullPath)
        }
    }

    private async _loadConfig(fullPath: string)
    {
        try {
            const relative = path.relative(this._options.configDir, fullPath)
            const pathInfo = path.parse(relative)
            const namespace = pathInfo.name

            const config = require(fullPath)
            const _storage = {}

            if (config.__esModule) {
                if (config.default) {
                    Object.assign(_storage, _.cloneDeep(_.omit(config, ['default'])))
                    Object.assign(_storage, _.cloneDeep(config.default))
                } else {
                    Object.assign(_storage, _.cloneDeep(config))
                }
            } else {
                Object.assign(_storage, _.cloneDeep(config))
            }

            this._configs[namespace] = _storage
            this._emitter.emit('did-load-config')
        } catch (e) {
            console.error(e)
        }
    }

    public getConfig()
    {
        return _.cloneDeep(this._configs)
    }

    public onDidLoadConfig(listener: () => void)
    {
        this._emitter.on('did-load-config', listener)
    }
}
