import { spawnSync } from "child_process";
import yargs = require("yargs");

export class MigrateCreate implements yargs.CommandModule {
  command = "migrate:create [name]";

  builder(args: yargs.Argv) {
    return args.positional("name", {}).required("name");
  }

  handler({ name }: yargs.Arguments<{ name: string }>) {
    spawnSync("yarn", [
      "typeorm",
      "migration:create",
      "-n",
      name,
      "-d",
      "migrations"
    ]);
  }
}
