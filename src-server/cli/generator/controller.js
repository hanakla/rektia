import _ from "lodash";
import fs from "fs";
import path from "path";
import yargs from "yargs";

const ES2015_TEMPLATE =
`const Controller = require("maya").Controller;

module.exports = Controller.create({<% methods.forEach(function (methodName, idx, list) { %>
\t<%= (idx !== 0 ? "\\n\\t" : "") %>
\t<%= methodName %>(req, res) {
\t\t
\t}<%= idx !== (list.length - 1) ? "," : "" %><% }); %>
});`;

/**
 * Parse `maya generate controller` args.
 * - `--indent (-i)` - indent type ("tab" or number of spaces)
 * - `--force (-f)` - Overwrite files even exist
 * - `--help (-h)` - Show help
 * @param {Array<String>} argv
 * @return {Object}
 */
function parseArgs(argv) {
    const parser = yargs

        .string("indent")
        .alias("indent", "i")
        .default("i", "2")
        .describe("i", "Generate code indent type.(\"tab\" or number of spaces)")

        .boolean("force")
        .alias("force", "f")
        .default("f", false)
        .describe("f", "Overwrite files to even exist")

        .boolean("help")
        .alias("help", "h")

        .strict();

    const options = parser.parse(argv);

    if (options.help) {
        console.log(
            "Usage :\n"
            + "\tcontroller <controller_name> [<http_method>:]<method_name> [[<http_method>:]<method_name>...]"
        );

        parser.showHelp("log");
        process.exit(0);
    }

    return options;
}

/**
 * @param {Array<String>} argv
 */
module.exports = (argv) => {
    const options = parseArgs(argv);
    const [controllerName, ...methodDefinitions] = options._;

    const controllerDir = path.join(process.cwd(), "server/controller/");
    const exportPath = path.join(controllerDir, `${controllerName}.js`);

    const indent = options.indent === "tab" ? "\t" : " ".repeat(parseInt(options.indent, 10));
    const template = _.template(ES2015_TEMPLATE);

    const methods = methodDefinitions.map((methodDef) => {
        var [httpMethod, name] = methodDef.split(":");

        if (! name) {
            [httpMethod, name] = ["", httpMethod];
        }

        if (httpMethod !== ""){
            httpMethod = `${httpMethod}_`;
        }

        return httpMethod + name;
    });

    const content = template({methods}).replace(/\t/gm, indent);

    // Check exists, if -f switch not taked.
    if (options.force === false && fs.existsSync(exportPath)) {
        let relatePath = exportPath.replace(process.cwd(), ".");

        console.error(`\u001b[31m[maya.js] Controller '${controllerName}' already exists in '${relatePath}'`);
        console.error(`if you want overwrite it, please take '-f' switch.\u001b[m`);
        process.exit(-1);
    }

    fs.writeFileSync(exportPath, content, "utf-8");
};
