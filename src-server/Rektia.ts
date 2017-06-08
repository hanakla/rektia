import * as Koa from 'koa'
import * as _ from 'lodash'
import {ListenOptions} from 'net'
import {Server} from 'http'
import * as Knex from 'knex'
import * as path from 'path'
import * as moduleAlias from 'module-alias'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'

import Context from './Context'
import ModelStatics from './Model/ModelStatics'
import REPL from './REPL'
import ConfigLoader from './Loader/ConfigLoader'
import ControllerLoader from './Loader/ControllerLoader'
import RenderMiddleware from './Middlewares/Render'
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
    private _renderMiddleware: RenderMiddleware

    public environment: string
    public appRoot: string

    constructor(private _options: Partial<AppOption> = {})
    {
        this._koa = new Koa()
        this.environment = _options.environment || 'development'
        this.appRoot = _options.appRoot || process.cwd()

        this._configLoader = new ConfigLoader({
            configDir: path.join(this.appRoot, 'config'),
            environment: this.environment
        })

        this._controllerLoader = new ControllerLoader({
            controllerDir: path.join(this.appRoot, 'app/controllers'),
        })

        this._router = new RouteBuilder()
        this._renderMiddleware = new RenderMiddleware({
            viewPath: path.join(this.appRoot, 'app/views')
        })

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
        console.log('\u001b[36m[Info] Config reloaded\u001b[m');
    }, 1000)

    private _attachContext = async (context: Context, next: () => Promise<any>) => {
        context.config = (path: string, defaultValue: any) => {
            console.log(this._config)
            _.get(this._config, path, defaultValue)
        }

        await next()
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
        process.on('uncaughtException', (e: Error) => {
            console.error(`\u001b[31m${e.stack}\u001b[m`)
        })

        process.on('unhandledRejection', (e: Error) => {
            console.error(`\u001b[31m${e.stack}\u001b[m`)
        })

        moduleAlias.addAliases({
            '@models': path.join(this.appRoot, 'app/models'),
            '@views': path.join(this.appRoot, 'app/views'),
        })

        await this._controllerLoader.load()
        await this._configLoader.load()
        await new Promise((resolve) => setTimeout(resolve, 1000))

        ModelStatics.setConnection(Knex(_.get(this._config, 'database')))

        this._koa.use(async (ctx: Context, next: () => Promise<any>) => {
            await next()

            if (typeof ctx.body === 'object' && React.isValidElement(ctx.body)) {
                ctx.type = 'text/html; charset=UTF-8'
                ctx.body = ReactDOMServer.renderToStaticMarkup(ctx.body)
            }
        })

        this._koa.use(this._attachContext)
        this._koa.use(this._renderMiddleware.middleware)
        this._koa.use(this._router.middleware)

        this._koa.listen(9000)
    }
}
