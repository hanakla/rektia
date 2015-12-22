var exporters = {
    router : {
        backbone() {

        },

        routerjs() {

        }
    },
    model : {
        backbone() {

        }
    }
}

module.exports = function (args) {
    var [moduleType, exportTarget] = args
    var moduleGroup, exporter;

    if (! (moduleGroup = exporters[moduleType])) {
        console.error(`unregisted module type : ${moduleType}`)
        return
    }

    if (! (exporter = moduleGroup[exportTarget])) {
        console.error(`unsupported export target : ${exportTarget}`)
        console.error(`Supported target for ${moduleType} : `)
        console.error("\t" + Object.keys(moduleGroup).join("\n\t") + "\n")
    }

    exporter()
}
