import _ from "lodash";
import path from "path";
import Router from "koa-router";
import Koa from "koa";

import Controller from "../Controller/Controller";
import Context from "../Context";
import {
  default as RouteMetadata,
  rectiaRouteAllMethods
} from "./RouteMetadata";
import * as RouterUtil from "../Utils/RouterUtil";

export interface RouteInfo {
  httpMethod: string;
  route: string;
  controllerName: string;
  methodName: string;
}

const equals = (arr: ArrayLike<any>, arr2: ArrayLike<any>) => {
  return _.difference(arr, arr2).length === 0;
};

export default class RouteBuilder {
  private router: Router;
  private _middleware: Koa.Middleware;

  constructor() {
    this.router = new Router();
    this._middleware = this.router.routes();
  }

  public routes(): RouteInfo[] {
    return this.router.stack.map(layer => {
      const actionMethod = RouterUtil.findRegisteredActionInRouterStack(
        layer.stack
      );
      const map: any = {};

      if (equals(rectiaRouteAllMethods, layer.methods)) {
        map.httpMethod = "ALL";
      } else {
        map.httpMethod = layer.methods.join("|");
      }

      Object.assign(map, {
        route: layer.path,
        controllerName: RouteMetadata.getControllerName(actionMethod),
        methodName: actionMethod.name
      });

      return map;
    });
  }

  public buildFromControllerSet(controllers: {
    [relativePath: string]: typeof Controller;
  }) {
    try {
      const r = (this.router = new Router());

      Object.entries(controllers).forEach(
        ([relativePath, controller]: [string, typeof Controller]) => {
          if (!controller) return;

          const controllerName = RouterUtil.getControllerName(
            relativePath,
            controller
          );
          const methods = RouterUtil.lookUpHandlerMethods(controller);
          const routes = RouterUtil.controllerPathToRoute(
            relativePath,
            methods
          );

          routes.forEach(([baseRoute, actionMethod, methodName]) => {
            RouteMetadata.setControllerName(actionMethod, controllerName);

            const meta = RouteMetadata.getFor(actionMethod);
            const extraMatchPattern = meta.extraMatchPattern;
            const methods = [...meta.methods];

            // console.log(baseRoute, extraMatchPattern)
            const pattern = !_.isEmpty(extraMatchPattern)
              ? path.join(baseRoute, "../", extraMatchPattern || "")
              : baseRoute;
            // .replace(/\/\//g, '/')
            // .replace(/\/$/, '')

            // console.log(pattern)

            if (methods.length === 0) {
              r.all(baseRoute, actionMethod);
            } else {
              methods.forEach(methodType => {
                const routerMethod = methodType.toLocaleLowerCase();
                r[routerMethod](pattern, actionMethod);
              });
            }
          });
        }
      );

      this._middleware = r.routes();
    } catch (e) {
      console.log(e);
    }
  }

  public middleware: Koa.Middleware = async (
    context: Context,
    next: () => Promise<any>
  ) => {
    await this._middleware(context, next);
  };
}
