import fs from "fs";
import path from "path";

// Check valid maya.js project
module.exports.exitIfInvalidMayaProject = function exitIfInvalidMayaProject(cwd) {
    try {
        const packageJson = require(path.join(cwd, "package.json"));
        const deps = packageJson.dependencies;
        const devDeps = packageJson.devDependencies;

        if (deps && Object.keys(deps).indexOf("maya") !== -1) {
            return;
        }

        if (devDeps && Object.keys(devDeps).indexOf("maya") !== -1) {
            return;
        }

        console.error("\u001b[31mHere is not maya.js project. \n(reliance on maya.js can not be found in `dependencies` or `devDependencies`)\u001b[m");
    }
    catch (e) {
        console.error("\u001b[31mHere is not maya.js project. \n(package.json not found.)\u001b[m");
    }

    process.exit(-1);
}

module.exports.run = function run() {
    const cwd = process.cwd();
    const [, , command, ...args] = process.argv;

    switch (command) {
        case "init":
            require("./init")(args);
            break;

        case "cqc":
            exitIfInvalidMayaProject(cwd);
            require("./cqc")(args);
            break;

        case "_dev":
            process.chdir(path.join(__dirname, "../../devapp"));
            require("./cqc")(args);
            break;

        case "export":
            exitIfInvalidMayaProject(cwd);
            require("./export")(args);
            break;

        case "g":
        case "generate":
            exitIfInvalidMayaProject(cwd);
            require("./generate")(args);
            break;

        case "h":
        case "help":
        default:
            if (command !== undefined) {
                console.log(`\u001b[31mCommand not found : ${command}\u001b[m\n`);
            }
            console.log(
    `Usage :
        maya <command> [<options>...]

    Commands :
        cqc\t\t\tStart maya.js server.
        export\t\tExport maya.js components for other libraries.
        generate(g)\t\tGenerate some components
        help\t\tShow this help
    `
            );
            process.exit(0);
    }
};
