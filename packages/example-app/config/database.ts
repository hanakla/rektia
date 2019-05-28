import { Configuration } from "@ragg/rektia";
import { User } from "../models/User";
import { Item } from "../models/Item";

export default {
  // default: {
  //   type: "mysql",
  //   host: "localhost",
  //   user: "root",
  //   port: 3306,
  //   password: "",
  //   database: "rektia_test"
  // }
  default: {
    type: "sqlite",
    database: process.cwd() + "/test.sqlite",
    logging: true,
    entities: [User, Item],
    migrations: ["migrations/*.ts"]
  }
} as Configuration.Databases;
