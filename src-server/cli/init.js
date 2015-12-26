import fs from "fs-extra"
import path from "path";
import glob from "glob";
import {spawnSync} from "child_process";

import App from "../app";

module.exports._copyBoilerplate = _copyBoilerplate;
module.exports.run = run;

function _copyBoilerplate(appDir) {
    const boilerplatePath = path.join(__dirname, "../../boilerplate/");
    const fromFiles = glob.sync(path.join(boilerplatePath, "**/{*,.gitkeep}"), {mark: true})
        // exclude directories
        .filter((fromPath) => fromPath[fromPath.length - 1] !== "/");

    // Copy boilerplate files if does not exists in appDir
    fromFiles.forEach((fromPath) => {
        const relatePath = fromPath.slice(boilerplatePath.length);
        const toPath = path.join(appDir, relatePath);

        if (! fs.existsSync(toPath)) {
            fs.copySync(fromPath, toPath);
        }
    });
}

function run(argv) {
    const appDir = process.cwd();
    const packageJsonPath = path.join(appDir, "package.json");

    // copy files
    console.log("\u001b[36m[maya.js] Generate project files.\u001b[m");
    _copyBoilerplate(appDir);

    // npm init
    var npmInitReuslt = spawnSync("npm", ["init"], {stdio : "inherit"});

    if (npmInitReuslt.status !== 0) {
        console.error("\u001b[31m[maya.js] package.json setup failed.\u001b[m");
        return;
    }

    console.log("\u001b[32m[maya.js] Setup successful.");
    console.log("  Execute \u001b[32;7m`npm install`\u001b[m\u001b[32m and Let's fight \u001b[32;7m`maya cqc`\u001b[m! ");
}
