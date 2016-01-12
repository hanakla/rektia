const webpack = require("webpack");

module.exports = {
    context : __dirname + "/../static/scripts/",

    output : {
        path : __dirname + "/../.tmp/static/scripts/",
        filename : "[name].js",
    },

    devtool : "inline-source-map",

    resolve : {
        root : [
            (__dirname + "/../static/scripts/"),
        ],

        extensions : [
            "",
            ".js",
        ],

        modulesDirectories  : [
            "node_modules",
        ],

        alias : {
            "views" : __dirname + "/../views/",
            "socket.io" : "socket.io-client"
        },

        module : {
            loaders : [

            ],
        },
    },


    plugins : [
        new webpack.ResolverPlugin([
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("package.json", ["main"]),
        ]),
    ]
};
