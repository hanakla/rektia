import { BaseConnectionOptions } from "typeorm/connection/BaseConnectionOptions";

export declare namespace Configuration {
  interface Server {
    port: number;
  }

  interface Databases {
    [name: string]: BaseConnectionOptions;
  }
}
