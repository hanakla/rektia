import path from "path";

module.exports = function (args) {
    require(path.join(process.cwd(), "app"));
}
