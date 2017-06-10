import * as repl from 'repl'
import {default as Rektia, AppExposer} from './Rektia'

export default class REPL {
    private _server: repl.REPLServer
    private _exposer: AppExposer

    constructor(app: Rektia)
    {
        this._exposer = app.getExposer()
        this._server = repl.start({
            prompt: '▷ '
        })

        this._server.on('exit', this.onREPLExit)

        this._exposeContext()

        this._server.defineCommand('routes', {
            help: 'Show routes',
            action: () => this._actionShowRoutes()
        })
    }

    private onREPLExit = () => {
        process.exit(0)
    }

    private _actionShowRoutes = () => {
        const routes = this._exposer.getRoutes().map(routeInfo => {
            return `${routeInfo.httpMethod} ${routeInfo.route}\t\t=> ${routeInfo.controllerName}#${routeInfo.methodName}`
        })

        console.log(`${routes.join('\n')}`)
    }

    private _exposeContext()
    {
        const _this = this

        Object.defineProperties((this._server as any).context, {
            routes: { get: () => _this._actionShowRoutes() },
            exit: { get: () => process.exit(0) },
            quit: { get: () => process.exit(0) }
        })
    }
}
