import fs from "fs";
import path from "path";

// Check valid maya.js project
module.exports._isValidMayaProject = function _isValidMayaProject(cwd) {
    try {
        const packageJson = require(path.join(cwd, "package.json"));
        const deps = packageJson.dependencies;
        const devDeps = packageJson.devDependencies;

        if (deps && Object.keys(deps).indexOf("maya") !== -1) {
            return true;
        }

        if (devDeps && Object.keys(devDeps).indexOf("maya") !== -1) {
            return true;
        }

        return "DEPENDENCY_NOT_FOUND";
    }
    catch (e) {
        return "PACKAGE_JSON_NOT_FOUND";
    }
};


module.exports._exitIfInvalidMayaProject = function _exitIfInvalidMayaProject(cwd) {
    const valid = _isValidMayaProject(cwd);

    if (valid === true) {
        return;
    }

    switch (valid) {
        case "DEPENDENCY_NOT_FOUND":
            console.error("\u001b[31mHere is not maya.js project. \n(reliance on maya.js can not be found in `dependencies` or `devDependencies`)\u001b[m");
            break;

        case "PACKAGE_JSON_NOT_FOUND":
            console.error("\u001b[31mHere is not maya.js project. \n(package.json not found.)\u001b[m");
            break;
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
            _exitIfInvalidMayaProject(cwd);
            require("./cqc")(args);
            break;

        case "_dev":
            process.chdir(path.join(__dirname, "../../devapp"));
            require("./cqc")(args);
            break;

        case "export":
            _exitIfInvalidMayaProject(cwd);
            require("./export")(args);
            break;

        case "g":
        case "generate":
            _exitIfInvalidMayaProject(cwd);
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
