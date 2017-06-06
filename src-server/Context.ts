import {Context as KoaContext} from 'koa'

interface Context extends KoaContext {
    config: (path: string, defaultValue: any) => any
}

export default Context
