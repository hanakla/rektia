import * as _ from 'lodash'
import * as path from 'path'
import {default as Controller, Action} from '../Controller/Controller'

export const isControllerExtended = (subject: any) => {
    if (!subject) {
        return false
    }

    for (
        let proto = Object.getPrototypeOf(subject);
        proto === Controller;
        proto = Object.getPrototypeOf(proto)
    ) {
        if (proto === Controller) {
            return true
        }
    }

    return false
}

export const lookUpHandlerMethods = (controller: typeof Controller): [string, Action][] => {
    const methods = controller.prototype || controller

    return _.difference(
        Object.getOwnPropertyNames(methods).filter(prop => typeof methods[prop] === 'function'),
        ['constructor']
    ).map((methodName): [string, Action] => [methodName, methods[methodName]])
}

export const controllerPathToRoute = (controllerPath: string, methods: [string, Action][]): [string, Action, string][] => {
    const pathInfo = path.parse(controllerPath)

    return methods.map(([methodName, method]): [string, Action, string] => {
        const path = (pathInfo.dir !== '' ? pathInfo.dir : '').split('/').map(_.snakeCase).join('/')
        const name = _.snakeCase(pathInfo.name !== 'Root' ? pathInfo.name : '')
        const action = _.snakeCase(methodName !== 'index' ? methodName : '')

        return [
            '/' + [path, name, action].filter(fragment => !!fragment && fragment !== '').join('/'),
            method,
            methodName
        ]
    })
}

export const getControllerName = (relativePath: string, controller: typeof Controller) => {
    const pathInfo = path.parse(relativePath)
    const dir = pathInfo.dir ? `${pathInfo.dir}/` : ''
    const name = controller ? (controller.name || pathInfo.name) : pathInfo.name
    return `${dir}${name}`
}
