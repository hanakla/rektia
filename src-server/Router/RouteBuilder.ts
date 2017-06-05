import Controller from '../Controller'
import Context from '../Context'

export default class RouteBuilder {
    buildFromControllerSet(controllers: {[relativePath: string]: typeof Controller})
    {
        Object.entries(controllers).reduce((memo, [path, controller]) => {
            if (typeof controller === 'function') {
                console.log(Object.getOwnPropertyNames(controller.prototype))
            } else {
                console.log('not func', controller)
            }
            return memo
        }, [])
    }

    middleware = (context: Context, next: () => Promise<any>) =>
    {
        console.log('route')
    }
}
