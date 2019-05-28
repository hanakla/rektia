import * as path from "path";
import * as fs from "fs";
import * as chokidar from "chokidar";
import * as glob from "glob";
import EventEmitter from "eventemitter3";

import * as LoaderUtil from "./LoaderUtil";
import Controller from "../Controller/Controller";
import Future from "../Utils/Future";

type HandledEvents = "add" | "change" | "unlink" | "unlinkDir";

export default class ControllerLoader {
  private emitter = new EventEmitter();
  private controllers: { [relativePath: string]: typeof Controller } = {};

  constructor(private options: { controllerDir: string }) {}

  /** Load config files */
  public async load() {
    const controllers = await LoaderUtil.readRequireableFiles(
      this.options.controllerDir,
      { recursive: true }
    );

    for (const controllerPath of controllers) {
      await this.loadController(controllerPath);
    }
  }

  public watch() {
    const watchPath = path.join(this.options.controllerDir, "**/*");
    chokidar
      .watch(watchPath, { ignoreInitial: true })
      .on("all", this.handleFileChange);
  }

  public getLoadedControllers(): { [relativePath: string]: typeof Controller } {
    return this.controllers;
  }

  public onDidLoadController(listener: () => void): void {
    this.emitter.on("did-load-controller", listener);
  }

  public onDidLoadError(listener: (e: Error) => void): void {
    this.emitter.on("did-load-error", listener);
  }

  private handleFileChange = async (event: HandledEvents, fullPath: string) => {
    const relative = path.relative(this.options.controllerDir, fullPath);
    let controller = this.controllers[relative];

    // if already loaded to replace
    if (event === "add" || event === "change") {
      await this.loadController(fullPath, !!controller);
    }
  };

  private loadController(
    fullPath: string,
    reload: boolean = false
  ): Promise<typeof Controller> {
    return new Promise<typeof Controller>((resolve, reject) => {
      const relative = path.relative(this.options.controllerDir, fullPath);
      const oldController = this.controllers[relative];

      try {
        const controller = require(fullPath);

        this.controllers[relative] = controller.__esModule
          ? controller.default || controller
          : controller;

        this.emitter.emit("did-load-controller");
        resolve(this.controllers[relative]);
      } catch (e) {
        this.controllers[relative] = oldController;
        this.emitter.emit("did-load-error", e);
        reject(e);
      }
    });
  }
}
