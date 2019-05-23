

import Context from '../Context'

export default class ErrorHandlerMiddleware {
    constructor()
    {
    }

    public middleware = async (ctx: Context, next: () => Promise<any>) =>
    {
        try {
            await next()
        } catch (e) {
            ctx.type = 'text/html; charset=UTF-8'
            ctx.body = 'Error'
        }
    }
}
