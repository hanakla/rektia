import {Context, Route} from '../../../'
import AppController from './AppController'
import User from '@models/User'

export default class User extends AppController {

    @Route.GET('/:userId')
    async index(ctx: Context)
    {
        const {userId} = ctx.params
        const user = await User.find(userId)
        ctx.body = user.toJSON()
    }
}
