import "babel-polyfill";

import fs from "fs";
import path from "path";
import co from "co";
import _ from "lodash";
import glob from "glob"
import Metacarattere  from "metacarattere";
import _Router from "router";

import * as PrettyLog from "./utils/pretty-log";
import Controller from "./controller";
import RestController from "./rest-controller";
import ModuleSwapper from "./module-swapper";
import RouteTree from "./route-tree"

import NotFoundException from "./exception/notfound";
import ServerErrorException from "./exception/server-error";

export default class Router {

    /**
     * @property {ModuleSwapper} swapper
     */
    // swapper;

    /**
     * @property {Object} routes
     *  Structure likes:
     *    {
     *      "http method" : {
     *        "/url_fragment" : {
     *          isParam : false,
     *          controller : {
     *              controller : "path to controller",
     *              method : "handler method",
     *          }
     *          "/url_fragment" : {...}
     *        },
     *        "/:param_name" : {
     *          isParam : true,
     *          "/url_fragment" : {...}
     *          "/:param_name" : {
     *            "/:param_name" : {
     *              controller : { ... }
     *            }
     *          }
     *        }
     *      }
     *    }
     */
    // routes;

    /**
     * @property {Object} options
     * @property {Boolean} options.watch
     * @property {Object} options.routes
     * @property {String} options.controllerDir
     */

     /**
      * @property {routeTree} routeTree
      */

    /**
     * @class router
     * @constructor
     * @param {ModuleSwapper} swapper
     * @param {Object} options
     * @param {Logger} options.logger
     */
    constructor(swapper, options) {
        this.swapper = swapper;
        this.options = options;
        this.routeTree = new RouteTree();
    }

    /**
     * @param {Object} options
     * @param {Object} options.routes
     * @param {String} options.controllerDir
     */
    load(options) {
        this.routeTree.mergeFlattenTree(this._prefetchControllers(options.controllerDir));
        this.routeTree.mergeFlattenTree(this._prefetchRoutes(options));
    }

    /**
     * @param {String} controllerDir with "/" prefix
     * @return {Map}
     */
    _prefetchControllers(controllerDir) {
        const loadableExtensions = Object.keys(require.extensions).map((dotext) => dotext.slice(1)).join(",")
        const controllerPaths = glob.sync(`${controllerDir}/**/*.{${loadableExtensions}}`);

        return controllerPaths.map((fullPath) => {
            // get controller relative path from `app/controller/`
            return [fullPath, fullPath.slice(controllerDir.length)];
        })
        .map(([fullPath, relativePath]) => {
            // Survey controller's implemented handlers.
            // And returns [fullPath, relatePath, methods].
            // `relativePath` is relate path from `app/controller/`

            const controller = this.swapper.require(fullPath, require);
            this._isValidController(controller);

            const validMethods = this._lookupValidHandler(controller);

            return [fullPath, relativePath, validMethods];
        })
        .reduce((urlMaps, [fullControllerPath, relativePath, methodNames]) => {
            // iterate per Controller.
            // Build url <> controller#method map looks
            // ["httpMethod", ["/url", "/fragment"], {handler info}]

            const pathInfo = path.parse(relativePath);
            const controllerName = pathInfo.name;
            const urlFragments = pathInfo.dir.split("/")
                .filter((fragment) => fragment !== "")
                .map((fragment) => `/${fragment}`);

            if (controllerName === "_root_" && urlFragments.length !== 0) {
                throw new Error("_root_ Controller only deployment as `app/controller/_root_.js`");
            }

            if (controllerName !== "_root_") {
                // "app/controller/_root_.js" mapped to `example.com/*`
                // otherwise mapped to "exapmle.com/${controllerName}/*"
                urlFragments.push(`/${controllerName}`);
            }

            methodNames.forEach((methodName) => {
                var [httpMethod, ...splitedMethodName] = methodName.split("_");
                var urlName = splitedMethodName.join("_");
                var mappedUrl = urlFragments.slice(0);

                if (splitedMethodName.length === 0) {
                    // Case of method name likes "someMethodName"
                    urlName = httpMethod;
                    httpMethod = "all";
                }

                if (controllerName === "_root_") {
                    mappedUrl[0] = `/${urlName}`;
                }
                else {
                    mappedUrl.push(`/${urlName}`);
                }

                urlMaps.push([httpMethod, mappedUrl, {
                    controller : fullControllerPath,
                    method : methodName
                }]);
            });

            return urlMaps;
        }, []);
    }

    /**
     * @private
     * @method _lookupValidHandler
     * @param {Controller} controller method lookup target
     * @return {Array<string>} lookuped valid method names
     */
    _lookupValidHandler(controller) {
        // Lookup only first level prototype's public methods.

        // It's for security reason.
        // if accept access to instance method / property or deep prototype methods.
        // it could allow calls some methods to themalicious attacker.
        // if callled method is destructive (likes Controller._dispose) or property.
        // There is a possibility that the cause to services stopping or mismatch datas.
        const proto = Object.getPrototypeOf(controller);
        const protoMethodAndProps = Object.keys(proto);

        const validMethods = protoMethodAndProps.filter((methodName) => {
            // ignore private methods
            if (methodName[0] === "_") { return false; }

            // ignore properties
            return _.isFunction(proto[methodName]);
        });

        if (controller instanceof RestController === false) {
            return validMethods;
        }

        // if conntroller is a RestController
        // List up more deep methods
        const restProto = Object.getPrototypeOf(proto);
        const restMethods = Object.keys(restProto);

        validMethods.push(...restMethods.filter(methodName => {
            // ignore private methods
            if (methodName[0] === "_") { return false; }

            // ignore properties
            return _.isFunction(restProto[methodName]);
        }));

        return validMethods;
    }

    _prefetchRoutes(options) {
        const routes = options.routes;
        const controllerDir = options.controllerDir;

        return  _.map(routes, (handler, routeConf) => {
            // Build url <> controller#method map looks
            // ["httpMethod", ["/url", "/fragment"], {handler info}]

            // handler expects string looks "controller.method" or "path/to/controller.method"

            var [httpMethod, url] = routeConf.split(" ");
            const [controllerName, methodName] = handler.split(".");
            const unresolvedControllerPath = path.join(controllerDir, controllerName);
            var fullControllerPath;

            if (url === undefined) {
                url = httpMethod;
                httpMethod = "all";
            }

            //
            // Lookup Controller
            //
            try {
                fullControllerPath = require.resolve(unresolvedControllerPath);
            }
            catch (e) {
                throw new Error(`Routed controller doesn't exists. (url: ${url}, name: ${controllerName})`);
            }

            // Check controller validness.
            const controller = this.swapper.require(fullControllerPath);
            this._isValidController(controller);

            const urlFragments = url.split("/")
                .map((fragment) => `/${fragment}`)
                .filter((fragment) => fragment !== "/");

            return [httpMethod, urlFragments, {
                controller : fullControllerPath,
                method : methodName
            }];
        });
    }

    /**
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     */
    async handle(req, res, next) {
        const method = req.method;
        const url = req.url;

        try {
            const target = this.routeTree.findMatchController(method, url);

            if (! target)
            {
                throw new NotFoundException();
            }

            // Assgin URL palaceholder parameters
            const matcher = new Metacarattere(target.pattern);
            const params = matcher.parse(url);
            _.assign(req.params, params);

            // launch
            await this._launchController(target, req, res);
            next();
        }
        catch (e) {
            // All Exceptions Handled By `server-error` middleware.
            next(e);
        }
    }

    _isValidController(controller) {
        // Check controller extending correctness
        const proto = Object.getPrototypeOf(controller);

        if (! proto instanceof Controller) {
            throw new Error(`Controller must be create via Controller.create. (for ${fullControllerPath})`);
        }
    }
    /**
     * @param {Object} target
     * @param {String} target.controller
     * @param {String} target.method
     * @param {String} target.urlPattern
     * @param {String} target.httpMethod LowerCased request http method
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     */
    async _launchController(target, req, res) {
        const controller = this.swapper.require(target.controller, require);
        const proto = Object.getPrototypeOf(controller);

        if (_.isFunction(proto[target.method]))
        {
            if (_.isFunction(proto._before)) {
                await co(proto._before.call(controller, req, res));
            }

            await co(proto[target.method].call(controller, req, res));

            if (_.isFunction(proto._after)) {
                await co(proto._after.call(controller, req, res));
            }

            return;
        }

        throw new NotFoundException();
    }
}
