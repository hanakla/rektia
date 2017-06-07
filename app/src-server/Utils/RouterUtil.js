"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const path = require("path");
const Controller_1 = require("../Controller/Controller");
exports.isControllerExtended = (subject) => {
    if (!subject) {
        return false;
    }
    for (let proto = Object.getPrototypeOf(subject); proto === Controller_1.default; proto = Object.getPrototypeOf(proto)) {
        if (proto === Controller_1.default) {
            return true;
        }
    }
    return false;
};
exports.lookUpHandlerMethods = (controller) => {
    const methods = controller.prototype || controller;
    return _.difference(Object.getOwnPropertyNames(methods).filter(prop => typeof methods[prop] === 'function'), ['constructor']).map((methodName) => [methodName, methods[methodName]]);
};
exports.controllerPathToRoute = (controllerPath, methods) => {
    const pathInfo = path.parse(controllerPath);
    return methods.map(([methodName, method]) => {
        const path = (pathInfo.dir !== '' ? pathInfo.dir : '').split('/').map(_.snakeCase).join('/');
        const name = _.snakeCase(pathInfo.name !== 'Root' ? pathInfo.name : '');
        const action = _.snakeCase(methodName !== 'index' ? methodName : '');
        return [
            '/' + [path, name, action].filter(fragment => !!fragment && fragment !== '').join('/'),
            method,
            methodName
        ];
    });
};
exports.getControllerName = (relativePath, controller) => {
    const pathInfo = path.parse(relativePath);
    const dir = pathInfo.dir ? `${pathInfo.dir}/` : '';
    const name = controller ? (controller.name || pathInfo.name) : pathInfo.name;
    return `${dir}${name}`;
};
