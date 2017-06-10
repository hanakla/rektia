import * as sass from 'node-sass'
import outdent from 'outdent'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'

import Context from '../Context'

export default class ErrorHandlerMiddleware {
    private static _style = outdent`
        *
            box-sizing: border-box
        body
            margin: 0
            font-size: 16px
        header
            padding: 8px
            background-color: #f47
            color: #fff
        .container
            width: 80vw
            margin: 0 auto
    `

    private static _compiledCSS: Promise<string> = null

    constructor()
    {
        if (! ErrorHandlerMiddleware._compiledCSS) {
            ErrorHandlerMiddleware._compiledCSS = new Promise((resolve, reject) => {
                sass.render({
                    data: ErrorHandlerMiddleware._style,
                    indentedSyntax: true,
                    outputStyle: 'compressed',
                }, (err, result) => {
                    resolve(result.css.toString())
                })
            })
        }
    }


    private _body = async (error: Error) => (
        <html>
            <head>
                <meta charSet='utf-8' />
                <title>Error</title>
                <style>{await ErrorHandlerMiddleware._compiledCSS}</style>
            </head>
            <body>
                <header>
                    <div className="container">
                        Error raised: {error.message}
                    </div>
                </header>

                <main className='container'>
                    <pre>{error.stack}</pre>
                </main>
            </body>
        </html>
    )

    middleware = async (ctx: Context, next: () => Promise<any>) =>
    {
        try {
            await next()
        } catch (e) {
            ctx.type = 'text/html; charset=UTF-8'
            ctx.body = ReactDOMServer.renderToString(await this._body(e))
        }
    }
}
