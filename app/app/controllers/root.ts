// import {Controller, Context} from '../../../'
import AppController from './AppController'

// export default class Root extends AppController {
//     public index(ctx: Context) {

//     }
// }

export const index = (ctx) => {
    ctx.body = ctx.config()
}

export function exported(ctx) {
    ctx.body = 'hi hey'
}
