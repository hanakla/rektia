import * as React from 'react'
import {Context} from '../../../'
import AppController from './AppController'
import User from '@models/User'

import layout from '@views/layout/application'

export default class Root extends AppController {
    async index(ctx: Context)
    {
        await User.find(1)

        ctx.body = layout({title: 'Rektia index'}, ([
            <style dangerouslySetInnerHTML={{__html: `
                html, body {
                    width: 400px;
                    margin: 0 auto;
                    font-family: sans-serif;
                    font-weight: 100;
                }
            `}} />,
            <header>
                <h1 style={{fontWeight:300}}>Rektia</h1>
            </header>,

            <main>
                <p>It works</p>
            </main>
        ]))
    }

    async exported(ctx: Context, next)
    {
        await ctx.render('root/index.tsx', {title: 'Rektia'})
        await next()
    }
}
