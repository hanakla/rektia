import * as Koa from 'koa'
import * as _ from 'lodash'
import {ListenOptions} from 'net'
import {Server} from 'http'
import * as Knex from 'knex'
import * as path from 'path'

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

    public environment: string
    public appRoot: string

    constructor(private _options: Partial<AppOption> = {})
    {
        this._koa = new Koa()
        this.environment = _options.environment || 'development'
        this.appRoot = _options.appRoot || process.cwd()

        this._configLoader = new ConfigLoader({
            configDir: path.join(this.appRoot, 'app/config'),
        })

        this._controllerLoader = new ControllerLoader({
            controllerDir: path.join(this.appRoot, 'app/controllers'),
        })

        this._router = new RouteBuilder()

        if (this.environment === 'development') {
            this._repl = new REPL(this)

            this._controllerLoader.onDidLoadController(this._handleControllerLoad)
            this._controllerLoader.onDidLoadError(console.error.bind(console))
        }
    }

    private _handleControllerLoad = _.debounce(() =>
    {
        const controllerSet = this._controllerLoader.getLoadedControllers()
        this._router.buildFromControllerSet(controllerSet)
        console.log('\u001b[36m[Info] Controller reloaded\u001b[m');
    }, 1000)

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

        process.on('unhandledRejection', (e: Error) => {
            console.error(`\u001b[31m${e.stack}\u001b[m`)
        })

        this._koa.use(this._router.middleware)
        this._koa.listen(9000)
    }
}
