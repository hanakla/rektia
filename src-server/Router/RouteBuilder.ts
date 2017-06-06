import * as _ from 'lodash'
import * as KoaRouter from 'koa-router'

import Controller from '../Controller'
import * as RouterUtil from '../Utils/RouterUtil'
import Context from '../Context'

export interface RouteInfo {
    httpMethod: string
    route: string
    controllerName: string
    methodName: string
}

export default class RouteBuilder {
    private _routeMaps: RouteInfo[] = []
    private _router: KoaRouter
    private _middleware: KoaRouter.IMiddleware

    public routes(): RouteInfo[]
    {
        return _.cloneDeep(this._routeMaps)
    }

    public buildFromControllerSet(controllers: {[relativePath: string]: typeof Controller})
    {
        try {
            const r = this._router = new KoaRouter()
            this._routeMaps = []

            Object.entries(controllers).forEach(([path, controller]: [string, typeof Controller]) => {
                if (!controller) return

                const controllerName = RouterUtil.getControllerName(path, controller)
                const methods = RouterUtil.lookUpHandlerMethods(controller)
                const routes = RouterUtil.controllerPathToRoute(path, methods)

                routes.forEach(([route, method, methodName]) => {
                    this._routeMaps.push({
                        httpMethod: 'ALL',
                        route,
                        controllerName,
                        methodName
                    })

                    r.all(route, method)
                })
            })

            this._middleware = r.routes()
        } catch (e) {
            console.log(e)
        }
    }

    public middleware = (context: Context, next: () => Promise<any>) =>
    {
        this._middleware(context, next)
    }
}
