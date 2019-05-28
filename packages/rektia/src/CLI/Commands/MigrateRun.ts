import yargs from "yargs";
import ConfigLoader from "../../Loader/ConfigLoader";
import { createConnections, ConnectionOptions } from "typeorm";
import path from "path";

export class MigrateRun implements yargs.CommandModule {
  command = "migrate:run";
  aliases = ["migrate"];

  builder(args: yargs.Argv) {
    return args;
  }

  async handler(_: yargs.Arguments<{ name: string }>) {
    const appRoot = process.cwd();

    const config = new ConfigLoader({
      configDir: path.join(appRoot, "config"),
      environment: "development"
    });

    await config.load();

    const databases = Object.entries(config.get("database")).map(
      ([name, option]: [string, any]): ConnectionOptions => ({
        name,
        ...option
      })
    );

    const connections = await createConnections(databases);

    await Promise.all(
      connections.map(con => con.runMigrations({ transaction: true }))
    );

    await Promise.all(connections.map(con => con.close()));

    console.log("migrated!");
  }
}
