import * as _ from "lodash";
import * as Knex from "knex";
import * as fs from "fs";
import * as path from "path";
import { listTablesAsync } from "./KnexListDBTable";

import { Rektia } from "../Rektia";
import * as DBTypeGeneratorHelper from "./DBTypeGeneratorHelper";

interface TypeGeneratorOptions {
  appDir: string;
}

export default class TypeGenerator {
  constructor(private _app: Rektia, private _options: TypeGeneratorOptions) {}

  public async generateTypeDefinition() {
    const knex = Knex(this._app.getConfig("database.default"));
    const tables = await listTablesAsync(knex);
    const columnDefs: [
      string,
      { [p: string]: Knex.ColumnInfo }
    ][] = (await Promise.all(
      tables.map(async tableName => [
        tableName,
        await knex(tableName).columnInfo()
      ])
    )) as any;

    const indent = (num: number = 1) => "    ".repeat(num);

    const interfaceDefs = columnDefs
      .map(([tableName, columnDef]) => {
        const interfaceName = DBTypeGeneratorHelper.modelClassNameFromTableName(
          tableName
        );

        const columnTypes = _.map(columnDef, (def, columnName) => {
          const type = DBTypeGeneratorHelper.columnTypeToTypeScriptType(def);
          return `${indent(3)}${columnName}: ${type}`;
        }).join("\n");

        return `${indent(
          2
        )}interface ${interfaceName} {\n${columnTypes}\n${indent(2)}}`;
      })
      .join("\n\n");

    fs.writeFileSync(
      path.join(this._options.appDir, "app/app.d.ts"),
      `declare namespace app {\n` +
        `${indent(1)}namespace Entity {\n` +
        `${interfaceDefs}\n` +
        `${indent(1)}}\n` +
        `}`
    );
  }
}
