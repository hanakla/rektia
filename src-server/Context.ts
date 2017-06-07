import {Context as KoaContext} from 'koa'

interface Context extends KoaContext {
    config: (path: string, defaultValue?: any) => any
    render: <T = any>(path: string, locals?: T) => Promise<any>
}

export default Context
