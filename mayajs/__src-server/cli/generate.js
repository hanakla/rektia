module.exports = (argv) => {
    var [command, ...otherArgs] = argv;

    switch (command) {
        case "c":
        case "controller":
            require("./generator/controller.js")(otherArgs);
            break;

        case "help":
        default:
            console.log(
`Generate component

Usage :
    maya generate <component_name> [<options>...]

Component :
    controller(c)\t<controller_name> [<http_method>:]<method_name> [[<http_method>:]<method_name>...]
`);

            process.exit(0);
    }
};
