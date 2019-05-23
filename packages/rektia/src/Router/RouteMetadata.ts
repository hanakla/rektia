// import {Context} from '../Context'
import {Action} from '../Controller/Controller'

type MethodTypes = 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'

export interface IRouteMetadata {
    methods: Set<MethodTypes>
    controllerName: string
    extraMatchPattern: string|null
}

export const rectiaRouteAllMethods = Object.freeze(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

export default class RelationMetadata {
    private static _metadata = new WeakMap<Action, IRouteMetadata>()

    private static _initialMetadata(): IRouteMetadata
    {
        return {methods: new Set(), controllerName: null, extraMatchPattern: null}
    }

    public static setControllerName(actionMethod: Action, controllerName: string)
    {
        const meta: IRouteMetadata = this.getFor(actionMethod) || this._initialMetadata()
        meta.controllerName = controllerName
        this.setFor(actionMethod, meta)
    }

    public static getControllerName(actionMethod: Action): string|null
    {
        const meta = this.getFor(actionMethod)
        return meta ? meta.controllerName : null
    }

    public static getControllerNameFromFirstRegisteredAction(actionMethods: Action[]): string|null
    {
        const registeredAction = actionMethods.find(action => this._metadata.has(action))

        if (!registeredAction) return null
        return this.getControllerName(registeredAction)
    }

    public static isRegisteredAction(actionMethod: Action)
    {
        return this._metadata.has(actionMethod)
    }

    public static addAllowedMethod(actionMethod: Action, methods: MethodTypes|MethodTypes[])
    {
        methods = Array.isArray(methods) ? methods : [methods]

        const meta: IRouteMetadata = this.getFor(actionMethod) || this._initialMetadata()
        meta.methods = new Set([...meta.methods, ...methods])
        this.setFor(actionMethod, meta)
    }

    public static setMatchPattern(actionMethod: Action, pattern: string)
    {
        const meta: IRouteMetadata = this.getFor(actionMethod) || this._initialMetadata()
        meta.extraMatchPattern = pattern
        this.setFor(actionMethod, meta)
    }

    public static setFor(actionMethod: Action, option: IRouteMetadata) {
        this._metadata.set(actionMethod, option)
    }

    public static getFor(actionMethod: Action): IRouteMetadata|null
    {
        return this._metadata.get(actionMethod)
    }
}
