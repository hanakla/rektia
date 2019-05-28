import yargs from "yargs";
import { MigrateCreate } from "./Commands/MigrateCreate";
import { MigrateRun } from "./Commands/MigrateRun";

yargs
  .usage("fukc")
  .command(new MigrateCreate())
  .command(new MigrateRun()).argv;

// program.command("migrate").action(migrateAction);

// program.command("migrate:create <name>").action(createMigrationAction);

// program.parse(process.argv);
