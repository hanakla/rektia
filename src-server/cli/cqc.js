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
        console.error("\u001b[31m[maya.js] Failed to load entry point\u001b[m");
    }
}
