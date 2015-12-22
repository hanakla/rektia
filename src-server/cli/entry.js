var [, , command, ...args] = process.argv
// console.log(command, args)

switch (command) {
    case "init":
        require("./init")(args);
        break;

    case "cqc":
        require("./cqc")(args);
        break;

    case "export":
        require("./export")(args);
        break;

    default:
        if (command !== undefined) {
            console.log(`\u001b[31mCommand not found : ${command}\u001b[m\n`);
        }
        console.log(
`Usage :
    maya <command> [<options>...]

Commands :
    cqc\t\t\tStart maya.js server.
    example\t\tStart maya.js example app for development maya.js.
    export\t\tExport maya.js components for other libraries.
`
        );
}
