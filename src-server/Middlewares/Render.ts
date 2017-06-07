import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'

import Context from '../Context'
import * as path from 'path'

interface RenderMiddlewareOptions {
    viewPath: string
}

export default class RenderMiddleware {
    constructor(private _options: RenderMiddlewareOptions)
    {

    }

    public middleware = async (ctx: Context, next: () => Promise<any>) =>
    {
        ctx.render = <T extends any>(view: string, locals: T = {}): Promise<any> =>
        {
            const viewPath = path.parse(view)
            const fullPath = path.join(this._options.viewPath, view)

            if (require.extensions[viewPath.ext]) {
                const view = require(fullPath)

                if (viewPath.ext.match(/[tj]sx/)) {
                    const element = (view.default ? view.default : view)(locals)
                    console.log(element)

                    if (React.isValidElement(element)) {
                        ctx.type = 'text/html; charset=UTF-8'
                        ctx.body = ReactDOMServer.renderToStaticMarkup(element)
                    }
                } else {
                    ctx.type = 'text/html; charset=UTF-8'
                    ctx.body = view(locals)
                }
            }

            return Promise.resolve()
        }

        await next()
    }
}
