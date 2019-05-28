import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Initial1559039567086 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isNullable: false
          },
          {
            name: "displayName",
            type: "text",
            isNullable: false,
            charset: "utf-8"
          }
        ]
      })
    );

    await q.createTable(
      new Table({
        name: "items",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isNullable: false
          },
          {
            name: "user_id",
            type: "int",
            isNullable: false
          }
        ],
        foreignKeys: [
          {
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"]
          }
        ]
      })
    );
  }

  async down(q: QueryRunner) {
    q.dropTable("users");
    q.dropTable("items");
  }
}
