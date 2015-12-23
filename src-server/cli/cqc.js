import path from "path";

module.exports = function (args) {
    var cwd = process.cwd();
    var packageJsonPath = path.join(cwd, "package.json");
    var packageJson = require(packageJsonPath);
    var entry = path.join(cwd, packageJson.main ? packageJson.main : "app");

    try {
        require(entry);
    }
    catch (e) {
        console.error("\u001b[31m[maya.js] Failed to load entry point\n");
        console.error(e.message, "\n", e.stack);
        console.error("\u001b[m");
        process.exit(-1);
    }
}
