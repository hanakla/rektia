// export const index = (ctx) => {
//     ctx.body = 'WOOFOO'
// }

import {Context, Route} from '../../../../'
import AppController from '../AppController'

export default class Root extends AppController {
    async index(ctx)
    {
        ctx.body = ''
    }
}
