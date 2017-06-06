import * as Koa from 'koa'
import * as _ from 'lodash'
import {ListenOptions} from 'net'
import {Server} from 'http'
import * as Knex from 'knex'
import * as path from 'path'

import Context from './Context'
import REPL from './REPL'
import ConfigLoader from './Loader/ConfigLoader'
import ControllerLoader from './Loader/ControllerLoader'
import {default as RouteBuilder, RouteInfo} from './Router/RouteBuilder'

interface AppOption {
    environment: string
    appRoot: string
}

export interface AppExposer {
    getRoutes: () => RouteInfo[]
}

export default class Rektia {
    static app: Rektia

    private _koa: Koa
    private _knex: Knex
    private _repl: REPL
    private _configLoader: ConfigLoader
    private _controllerLoader: ControllerLoader
    private _router: RouteBuilder
    private _config: any

    public environment: string
    public appRoot: string

    constructor(private _options: Partial<AppOption> = {})
    {
        this._koa = new Koa()
        this.environment = _options.environment || 'development'
        this.appRoot = _options.appRoot || process.cwd()

        this._configLoader = new ConfigLoader({
            configDir: path.join(this.appRoot, 'app/config'),
            environment: this.environment
        })

        this._controllerLoader = new ControllerLoader({
            controllerDir: path.join(this.appRoot, 'app/controllers'),
        })

        this._router = new RouteBuilder()

        if (this.environment === 'development') {
            this._repl = new REPL(this)

            this._controllerLoader.watch()
            this._controllerLoader.onDidLoadController(this._handleControllerLoad)
            this._controllerLoader.onDidLoadError(console.error.bind(console))

            this._configLoader.watch()
            this._configLoader.onDidLoadConfig(this._handleConfigLoad)
        }
    }

    private _handleControllerLoad = _.debounce(() =>
    {
        const controllerSet = this._controllerLoader.getLoadedControllers()
        this._router.buildFromControllerSet(controllerSet)
        console.log('\u001b[36m[Info] Controller reloaded\u001b[m');
    }, 1000)

    private _handleConfigLoad = _.debounce(() => {
        this._config = this._configLoader.getConfig()
        console.log(`\u001b[36m[Info] Config reloaded\u001b[m`);
    })

    private _attachContext = (context: Context) => {
        context.config = (path: string, defaultValue: any) => _.get(this._config, path, defaultValue)
    }

    public getExposer()
    {
        return {
            getRoutes:() => this._router.routes()
        }
    }

    public use(middleware: Koa.Middleware)
    {
        this._koa.use(middleware)
    }

    public async start()
    {
        await this._controllerLoader.load()
        await this._configLoader.load()

        process.on('unhandledRejection', (e: Error) => {
            console.error(`\u001b[31m${e.stack}\u001b[m`)
        })

        this._koa.use(this._attachContext)
        this._koa.use(this._router.middleware)
        this._koa.listen(9000)
    }
}
