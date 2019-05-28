import Koa from "koa";
import _ from "lodash";
import path from "path";
import moduleAlias from "module-alias";
import { createConnections } from "typeorm";

import Context from "./Context";
import REPL from "./REPL";
import ConfigLoader from "./Loader/ConfigLoader";
import ControllerLoader from "./Loader/ControllerLoader";
import { ErrorHandlerMiddleware } from "./Middlewares/ErrorHandler";
import { default as RouteBuilder, RouteInfo } from "./Router/RouteBuilder";

interface AppOption {
  environment: string;
  appRoot: string;
}

export interface AppExposer {
  getRoutes: () => RouteInfo[];
}

export class Rektia {
  public static app: Rektia;

  private readonly server: Koa;
  private readonly repl: REPL;
  private readonly configLoader: ConfigLoader;
  private readonly controllerLoader: ControllerLoader;
  private readonly router: RouteBuilder;

  public readonly environment: string;
  public readonly appRoot: string;

  constructor(private options: Partial<AppOption> = {}) {
    if (Rektia.app) {
      throw new Error("Rektia already started.");
    }

    Rektia.app = this;

    this.server = new Koa();
    this.environment = options.environment || "development";
    this.appRoot = options.appRoot || process.cwd();

    this.configLoader = new ConfigLoader({
      configDir: path.join(this.appRoot, "config"),
      environment: this.environment
    });

    this.controllerLoader = new ControllerLoader({
      controllerDir: path.join(this.appRoot, "controllers")
    });

    this.router = new RouteBuilder();

    if (this.environment === "development") {
      this.repl = new REPL(this);

      this.controllerLoader.watch();
      this.controllerLoader.onDidLoadController(this.handleControllerLoad);
      this.controllerLoader.onDidLoadError(console.error.bind(console));

      this.configLoader.watch();
      this.configLoader.onDidLoadConfig(this.handleConfigLoad);
    }
  }

  private handleControllerLoad = _.debounce(() => {
    const controllerSet = this.controllerLoader.getLoadedControllers();
    this.router.buildFromControllerSet(controllerSet);
    console.log("\u001b[36m[Info] Controller reloaded\u001b[m");
  }, 1000);

  private handleConfigLoad = _.debounce(() => {
    console.log("\u001b[36m[Info] Config reloaded\u001b[m");
  }, 1000);

  private attachContext = async (
    context: Context,
    next: () => Promise<any>
  ) => {
    context.config = (path: string, defaultValue: any) =>
      this.configLoader.get(path, defaultValue);

    await next();
  };

  public getExposer() {
    return {
      getRoutes: () => this.router.routes()
    };
  }

  public getConfig(path: string, defaultValue?: any): any {
    return this.configLoader.get(path, defaultValue);
  }

  public use(middleware: Koa.Middleware) {
    this.server.use(middleware);
  }

  public async start() {
    process.on("uncaughtException", (e: Error) => {
      console.error(`\u001b[31m${e.stack}\u001b[m`);
    });

    process.on("unhandledRejection", (e: Error) => {
      console.error(`\u001b[31m${e.stack}\u001b[m`);
    });

    moduleAlias.addAliases({
      // "@models": path.join(this.appRoot, "models"),
      // "@views": path.join(this.appRoot, "views")
    });

    // Connect to database
    await Promise.all([this.controllerLoader.load(), this.configLoader.load()]);

    const databases = Object.entries(this.configLoader.get("database")).map(
      ([name, option]: [string, any]) => ({ name, ...option })
    );

    await createConnections(databases);

    this.router.buildFromControllerSet(
      this.controllerLoader.getLoadedControllers()
    );

    // new TypeGenerator(this, {
    //   appDir: this.appRoot
    // }).generateTypeDefinition();

    this.server.use(new ErrorHandlerMiddleware().middleware);
    this.server.use(this.attachContext);
    this.server.use(this.router.middleware);

    const port = this.configLoader.get("server.port");
    console.log(
      `\u001b[36m[Info] Rektia started on port ${port} in mode ${
        this.environment
      }\u001b[m`
    );
    this.server.listen(port);
  }
}
