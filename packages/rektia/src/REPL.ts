import repl from "repl";
import CLITable from "cli-table2";
import glob from "glob";
import { parse } from "path";
import { fromPairs } from "lodash";

import { Rektia, AppExposer } from "./Rektia";
import { join } from "path";

export default class REPL {
  private replServer: repl.REPLServer;
  private exposer: AppExposer;

  constructor(private app: Rektia) {
    this.exposer = app.getExposer();

    this.replServer = repl.start({
      prompt: "▷ "
    });

    this.replServer.on("exit", this.onREPLExit);

    this.exposeContext();

    this.replServer.defineCommand("routes", {
      help: "Show routes",
      action: () => this.actionShowRoutes()
    });
  }

  private onREPLExit = () => {
    process.exit(0);
  };

  private actionShowRoutes = () => {
    const table = new CLITable({
      head: ["Method", "Path", "Handler"]
    });

    this.exposer.getRoutes().forEach(routeInfo => {
      table.push([
        routeInfo.httpMethod,
        routeInfo.route,
        `${routeInfo.controllerName}#${routeInfo.methodName}`
      ]);
    });

    console.log(table.toString());
  };

  private async exposeContext() {
    const matches = await new Promise<string[]>((resolve, reject) => {
      glob(join(this.app.appRoot, "models/**/*.{js,ts}"), (err, matches) => {
        err ? reject(err) : resolve(matches);
      });
    });

    const models = fromPairs(
      matches.map(path => {
        const modelName = parse(path).name;
        const imported = require(path);
        const model = imported.default || imported[modelName];
        return [modelName, { get: () => model }];
      })
    );

    Object.defineProperties((this.replServer as any).context, {
      routes: { get: () => this.actionShowRoutes() },
      exit: { get: () => process.exit(0) },
      quit: { get: () => process.exit(0) },
      ...models
    });
  }
}
