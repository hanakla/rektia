import fs from "fs"
import path from "path";
import yargs from "yargs";
import {spawnSync} from "child_process";

import App from "../app"

module.exports = function (args) {
    var appDir = process.cwd();

    fs.writeFileSync(path.join(appDir, "package.json"), JSON.stringify({
        main: "app.js",
        dependencies : {
            "maya" : `^${App.VERSION}`
        }
    }));

    var npmInitReuslt = spawnSync("npm", ["init"], {stdio : "inherit"});

    if (npmInitReuslt.status !== 0) {
        console.error("\u001b[31m[maya.js] Setup aborted.\u001b[m");
        return;
    }

    console.log("\u001b[36m[maya.js] Trying to execute `npm install --save maya`...\u001b[m");

    var npmInstallResult = spawnSync("npm", ["install", "--save", "maya"]);

    if (npmInstallResult.status !== 0) {
        console.error("\u001b[31m[maya.js] `npm install` failed. Please install maya.js manually.");
        console.error("  > npm install --save maya\u001b[m");
        return;
    }

    console.log("\u001b[32m[maya.js] Setup successful. Let's fight \u001b[32;7m`maya cqc`\u001b[m!");
}
