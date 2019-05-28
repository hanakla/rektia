import _ from "lodash";
import path from "path";
import chokidar from "chokidar";
import * as LoaderUtil from "./LoaderUtil";
import { EventEmitter as EE3 } from "eventemitter3";

interface ConfigLoaderOption {
  configDir: string;
  environment: string;
}

type HandledEvents = "add" | "change" | "unlink" | "unlinkDir";

export default class ConfigLoader {
  private _emitter = new EE3();
  private configs: any = {};

  /**
   * @class ConfigLoader
   * @constructor
   */
  constructor(private _options: ConfigLoaderOption) {}

  /**
   * Load config files
   * @method load
   */
  public async load() {
    const configFiles = await LoaderUtil.readRequireableFiles(
      this._options.configDir,
      {
        recursive: true,
        ignore: path.join(this._options.configDir, "environments/**/*")
      }
    );

    this.configs = {};

    for (const filePath of configFiles) {
      await this.loadConfig(filePath);
    }
  }

  public watch() {
    const watchPath = path.join(this._options.configDir, "**/*");
    chokidar
      .watch(watchPath, { ignoreInitial: true })
      .on("all", this.handleFileChange);
  }

  private handleFileChange = async (event: HandledEvents, fullPath: string) => {
    // if already loaded to replace
    if (event === "add" || event === "change") {
      await this.loadConfig(fullPath);
    }
  };

  private async loadConfig(fullPath: string) {
    try {
      const relative = path.relative(this._options.configDir, fullPath);
      const pathInfo = path.parse(relative);
      const namespace = pathInfo.name;

      const config = require(fullPath);
      const _storage = {};

      if (config.__esModule) {
        if (config.default) {
          Object.assign(_storage, _.cloneDeep(_.omit(config, ["default"])));
          Object.assign(_storage, _.cloneDeep(config.default));
        } else {
          Object.assign(_storage, _.cloneDeep(config));
        }
      } else {
        Object.assign(_storage, _.cloneDeep(config));
      }

      this.configs[namespace] = _storage;
      this._emitter.emit("did-load-config");
    } catch (e) {
      console.error(e);
    }
  }

  public getConfig() {
    return _.cloneDeep(this.configs);
  }

  public get(path: string, defaultValue?: any) {
    return _.get(this.configs, path, defaultValue);
  }

  public onDidLoadConfig(listener: () => void) {
    this._emitter.on("did-load-config", listener);
  }
}
