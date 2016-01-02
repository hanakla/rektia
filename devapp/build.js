"use strict";

// maya.js exposed `maya` on `global`before run this function.
// you use some maya.js APIs throughs from `maya` variable
// e.g. `const options = maya.config.get("some.config");`

const path = require("path");
const spawn = require("child_process").spawn;
const spawnSync = require("child_process").spawnSync;

// This function called from maya.js
// maya, passed current environment("devel", "production", "test") into `env` arguments.
// if you want to use other build system, write build system startup code in this function.

/**
 * @return {Promise?}
 *      if you returns Promise in this function.
 *      Maya.js wait for promise fulfilled.
 *      it's optional.
 */
module.exports = (env) => {
    const npmBinProcess = spawnSync("npm", ["bin"]);

    if (npmBinProcess.status !== 0) {
        let error = npmBinProcess.stderr.toString().trim("\n");
        throw new Error(`[in build.js] Failed to execute \`npm bin\`(${error})`);
    }

    const localBin = npmBinProcess.stdout.toString().trim("\n");
    const flyBin = path.join(localBin, "fly");

    return new Promise((resolve, reject) => {
        if (env === "devel") {
            // if env is "devel", run fly as watching mode.
            const fly = spawn(flyBin, ["devel"]);

            fly.stderr.on("error", chunk => console.error(chunk.toString()));
            process.on("exit", () => { fly.kill(); });

            resolve();
        }
        else {
            // if env is "test" or "production", wait compile complete.
            spawnSync(flyBin, ["production"], {stdio: "inherit"});
            resolve();
        }
    });
};
