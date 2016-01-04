import path from "path";
import yargs from "yargs";
import repl from "repl";

function parseArgs(argv) {
    const parser = yargs()
        .boolean("interactive")
        .alias("interactive", "i")
        .describe("i", "Run with REPL")

        .help("help")
        .alias("help", "h")

        .strict();

    return parser.parse(argv);
}

module.exports = function (args) {
    const options = parseArgs(args);
    const cwd = process.cwd();
    const packageJsonPath = path.join(cwd, "package.json");
    const packageJson = require(packageJsonPath);
    const entry = path.join(cwd, packageJson.main ? packageJson.main : "app");
    var replServer;

    try {
        require(entry);

        if (options.interactive) {
            setTimeout(() => {
                replServer = repl.start({
                    prompt : "(๑>ヮ<)و✧> ",
                    useColors : true,
                });
            }, 500);
        }
    }
    catch (e) {
        console.error("\u001b[31m[maya.js] Failed to load entry point\n");
        console.error(e.message, "\n", e.stack);
        console.error("\u001b[m");
        process.exit(-1);
    }
}
