import "babel-polyfill"

import fs from "fs";
import path from "path";

import _ from "lodash";
import glob from "glob"
import Metacarattere  from "metacarattere";
import _Router from "router";

import * as PrettyLog from "./utils/pretty-log"
import Controller from "./controller";
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
     * @param {Boolean} options.watch
     * @param {Object} options.routes
     * @param {String} options.controllerDir
     */
    constructor(swapper, options) {
        this.swapper = swapper;
        this.options = options;
        this.routeTree = new RouteTree();
    }

    load(routes) {
        // try {
        this.routeTree.mergeFlattenTree(this._prefetchControllers());
        this.routeTree.mergeFlattenTree(this._prefetchRoutes(routes));
        // }
        // catch (e) {
        //     PrettyLog.error("Handle Exception in maya.js Router", e);
        // }
    }

    /**
     * @return {Map}
     */
    _prefetchControllers() {
        var routeTree = Object.create(null);
        var controllerDir = this.options.controllerDir;
        var loadableExtensions = Object.keys(require.extensions).map((dotext) => dotext.slice(1)).join(",")
        var controllerPaths = glob.sync(`${controllerDir}/**/*.{${loadableExtensions}}`);

        var flattenRoutes = controllerPaths.map((fullPath) => {
            // get controller relative path from `app/controller/`
            return [fullPath, fullPath.slice(controllerDir.length)];
        })
        .map(([fullPath, relativePath]) => {
            // Survey controller's implemented handlers.
            // And returns [fullPath, relatePath, methods].
            // `relativePath` is relate path from `app/controller/`

            var controller = this.swapper.require(fullPath, require);
            this._isValidController(controller);

            var validMethods = this._lookupValidHandler(controller);

            return [fullPath, relativePath, validMethods];
        })
        .reduce((urlMaps, [fullControllerPath, relativePath, methodNames]) => {
            // iterate per Controller.
            // Build url <> controller#method map looks
            // ["httpMethod", ["/url", "/fragment"], {handler info}]

            var pathInfo = path.parse(relativePath);
            var controllerName = pathInfo.name;
            var urlFragments = pathInfo.dir.split("/").map((fragment) => `/${fragment}`);

            if (controllerName === "_root_" && urlFragments[0] !== "/") {
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
                    mappedUrl.push(`/${controllerName}`, `/${urlName}`);
                }

                urlMaps.push([httpMethod, mappedUrl, {
                    controller : fullControllerPath,
                    method : methodName
                }]);
            });

            return urlMaps;
        }, [])

        return flattenRoutes;
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

        return protoMethodAndProps.filter((methodName) => {
            // ignore private methods
            if (methodName[0] === "_") { return false; }

            // ignore properties
            return _.isFunction(proto[methodName]);
        });
    }

    _prefetchRoutes(routes) {
        var routeTree = {};
        var controllerDir = this.options.controllerDir;

        var flattenRoutes = _.map(routes, (handler, routeConf) => {
            // Build url <> controller#method map looks
            // ["httpMethod", ["/url", "/fragment"], {handler info}]

            // handler expects string looks "controller.method" or "path/to/controller.method"

            var [httpMethod, url] = routeConf.split(" ");
            var [controllerName, methodName] = handler.split(".");
            var unresolvedControllerPath = path.join(controllerDir, controllerName);
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

            var urlFragments = url.split("/")
                .map((fragment) => `/${fragment}`)
                .filter((fragment) => fragment !== "/");

            return [httpMethod, urlFragments, {
                controller : fullControllerPath,
                method : methodName
            }];
        });


        return flattenRoutes;
    }

    /**
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     */
    async handle(req, res, next) {
        var method = req.method;
        var url = req.url;

        try {
            var target = this.routeTree.findMatchController(method, url);

            if (! target)
            {
                throw new NotFoundException();
            }

            // Assgin URL palaceholder parameters
            var matcher = new Metacarattere(target.url);
            var params = matcher.parse(url);
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
                await this._handleAsync(proto._before.call(controller, req, res));
            }

            await this._handleAsync(proto[target.method].call(controller, req, res));

            if (_.isFunction(proto._after)) {
                await this._handleAsync(proto._after.call(controller, req, res));
            }

            return;
        }

        throw new NotFoundException();
    }

    /**
     * @param {Promise|Generator|*} value
     */
    async _handleAsync(value) {
        var iterateGenerator = function (generator, resolve, reject, value) {
            try {
               var result = generator.next(value);

               if (result.done === true)  {
                   resolve(result.value);
                   return;
               }

               if (! result.value) {
                   iterateGenerator(generator, resolve, reject);
                   return;
               }

               // Wait for Promise
               if (_.isFunction(result.value.then === "function"))
               {
                   result.value.then(value => {
                       iterateGenerator(generator, resolve, reject, value);
                   });
                   return;
               }
           }
           catch (e) {
               reject(e);
           }
        };

        return new Promise((resolve, reject) => {
            if (value == null) {
                resolve(value);
            }
            else if (_.isFunction(value.next)) {
                iterateGenerator(value, resolve, reject);
            }
            else if (_.isFunction(value.then)) {
                value.then(resolve, reject);
            }
            else {
                resolve(value);
            }
        });
    }
}
