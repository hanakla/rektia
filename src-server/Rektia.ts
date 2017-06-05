import * as Koa from 'koa'

import {ListenOptions} from 'net'
import {Server} from 'http'
import * as Knex from 'knex'
import * as path from 'path'

import ConfigLoader from './Loader/ConfigLoader'
import ControllerLoader from './Loader/ControllerLoader'
import RouteBuilder from './Router/RouteBuilder'

interface AppOption {
    environment: string
    appRoot: string
}

export default class Rektia {
    static app: Rektia

    private _koa: Koa
    private _knex: Knex
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
            this._controllerLoader.onDidLoadController(this._handleControllerLoad)
        }
    }

    private _handleControllerLoad = () =>
    {
        const controllerSet = this._controllerLoader.getLoadedControllers()
        this._router.buildFromControllerSet(controllerSet)
    }

    public use(middleware: Koa.Middleware)
    {
        this._koa.use(middleware)
    }

    public async start()
    {
        await this._controllerLoader.load()
        // console.log(Object.keys(this._controllerLoader.getLoadedControllers()))

        this._koa.use(this._router.middleware)
        this._koa.listen(9000)
    }
}
