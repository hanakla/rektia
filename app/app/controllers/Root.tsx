import * as React from 'react'
import {Context} from '../../../'
import AppController from './AppController'
import User from '@models/User'

import layout from '@views/layout/application'

export default class Root extends AppController {
    async index(ctx: Context)
    {
        const user = await User.find(1)

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
                <p>It works, hello {user.get('display_name')}</p>
            </main>
        ]))
    }

    async exported(ctx: Context)
    {
        try {

            ctx.type = 'application/json'
            // console.log()
            await User.findBy({name: 'ragg'})

            User.findBy({name: 'ragg'})

            // .map(model => {
            //     // console.log('hi')
            //     return {}
            // }) //.then(()=>{})
            ctx.body = JSON.stringify(await User.find(1).items, null, 4)
            // await ctx.render('root/index.tsx', {title: 'Rektia'})
        } catch (e) {
            console.log(e)
        }
    }
}
