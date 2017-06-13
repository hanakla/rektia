import * as _ from 'lodash'
import * as KoaRouter from 'koa-router'
import * as path from 'path'

import Controller from '../Controller/Controller'
import Context from '../Context'
import {default as RouteMetadata, rectiaRouteAllMethods} from './RouteMetadata'
import * as RouterUtil from '../Utils/RouterUtil'

export interface RouteInfo {
    httpMethod: string
    route: string
    controllerName: string
    methodName: string
}

const koaRouterAllMethods = Object.freeze([
    'HEAD', 'ACL', 'BIND', 'CHECKOUT', 'CONNECT', 'COPY', 'DELETE', 'GET', 'HEAD', 'LINK',
    'LOCK', 'M-SEARCH', 'MERGE', 'MKACTIVITY', 'MKCALENDAR', 'MKCOL', 'MOVE', 'NOTIFY',
    'OPTIONS', 'PATCH', 'POST', 'PROPFIND', 'PROPPATCH', 'PURGE', 'PUT', 'REBIND',
    'REPORT', 'SEARCH', 'SUBSCRIBE', 'TRACE', 'UNBIND', 'UNLINK', 'UNLOCK', 'UNSUBSCRIBE'
])

const equals = (arr: ArrayLike<any>, arr2: ArrayLike<any>) => {
    return _.difference(arr, arr2).length === 0
}

export default class RouteBuilder {
    private _router: KoaRouter
    private _middleware: KoaRouter.IMiddleware

    constructor()
    {
        this._router = new KoaRouter()
        this._middleware = this._router.routes()
    }

    public routes(): RouteInfo[]
    {
        return this._router.stack.map(layer => {
            const actionMethod = RouterUtil.findRegisteredActionInRouterStack(layer.stack)
            const map: any = {}

            if (
                equals(koaRouterAllMethods, layer.methods)
                || equals(rectiaRouteAllMethods, layer.methods)
            ) {
                map.httpMethod = 'ALL'
            } else {
                map.httpMethod = layer.methods.join('|')
            }

            Object.assign(map, {
                route: layer.path,
                controllerName: RouteMetadata.getControllerName(actionMethod),
                methodName: actionMethod.name,
            })

            return map
        })
    }

    public buildFromControllerSet(controllers: {[relativePath: string]: typeof Controller})
    {
        try {
            const r = this._router = new KoaRouter()
            console.log(controllers)

            Object.entries(controllers).forEach(([relativePath, controller]: [string, typeof Controller]) => {
                if (!controller) return

                const controllerName = RouterUtil.getControllerName(relativePath, controller)
                const methods = RouterUtil.lookUpHandlerMethods(controller)
                const routes = RouterUtil.controllerPathToRoute(relativePath, methods)

                routes.forEach(([baseRoute, actionMethod, methodName]) => {
                    RouteMetadata.setControllerName(actionMethod, controllerName)

                    const meta = RouteMetadata.getFor(actionMethod)
                    const extraMatchPattern = meta.extraMatchPattern
                    const methods = [...meta.methods]

                    // console.log(baseRoute, extraMatchPattern)
                    const pattern = !_.isEmpty(extraMatchPattern) ? path.join(baseRoute, '../', extraMatchPattern || '') : baseRoute
                        // .replace(/\/\//g, '/')
                        // .replace(/\/$/, '')

                    // console.log(pattern)

                    if (methods.length === 0) {
                        r.all(baseRoute, actionMethod)
                    } else {
                        methods.forEach(methodType => {
                            const routerMethod = methodType.toLocaleLowerCase()
                            r[routerMethod](pattern, actionMethod)
                        })
                    }
                })
            })

            this._middleware = r.routes()
        } catch (e) {
            console.log(e)
        }
    }

    public middleware = async (context: Context, next: () => Promise<any>) =>
    {
        await this._middleware(context, next)
    }
}
