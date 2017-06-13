import {default as Controller, Action} from '../Controller/Controller'
import RouteMetadata from './RouteMetadata'

export const GET = (pattern?: string) => {
    return (controller: Controller, property: string, desc: PropertyDescriptor) => {
        const action: Action = desc.value
        RouteMetadata.addAllowedMethod(action, 'GET')
        pattern && RouteMetadata.setMatchPattern(action, pattern)
    }
}

export const POST = (pattern?: string) => {
    return (controller: Controller, property: string, desc: PropertyDescriptor) => {
        const action: Action = desc.value
        RouteMetadata.addAllowedMethod(action, 'POST')
        pattern && RouteMetadata.setMatchPattern(action, pattern)
    }
}

export const PUT = (pattern?: string) => {
    return (controller: Controller, property: string, desc: PropertyDescriptor) => {
        const action: Action = desc.value
        RouteMetadata.addAllowedMethod(action, 'PUT')
        pattern && RouteMetadata.setMatchPattern(action, pattern)
    }
}

export const PATCH = (pattern?: string) => {
    return (controller: Controller, property: string, desc: PropertyDescriptor) => {
        const action: Action = desc.value
        RouteMetadata.addAllowedMethod(action, 'PATCH')
        pattern && RouteMetadata.setMatchPattern(action, pattern)
    }
}

export const DELETE = (pattern?: string) => {
    return (controller: Controller, property: string, desc: PropertyDescriptor) => {
        const action: Action = desc.value
        RouteMetadata.addAllowedMethod(action, 'DELETE')
        pattern && RouteMetadata.setMatchPattern(action, pattern)
    }
}

export const ALL = (pattern?: string) => {
    return (controller: Controller, property: string, desc: PropertyDescriptor) => {
        const action: Action = desc.value
        RouteMetadata.addAllowedMethod(action, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
        pattern && RouteMetadata.setMatchPattern(action, pattern)
    }
}

export default {GET, POST, PUT, PATCH, DELETE, ALL}
