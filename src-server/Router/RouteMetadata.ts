// import {Context} from '../Context'
import {Action} from '../Controller/Controller'

interface IRouteMetadata {
    methods: ['POST'|'GET'|'DELETE'|'PUT']
    extraMatchPattern: string
}

export default class RelationMetadata {
    private static _metadata = new WeakMap<Action, IRouteMetadata>()

    public static setFor(actionMethod: Action, option: IRouteMetadata) {
        this._metadata.set(actionMethod, option)
    }

    public static getFor(actionMethod: Action): IRouteMetadata|null
    {
        return this._metadata.get(actionMethod)
    }
}
