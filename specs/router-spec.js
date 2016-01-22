var ModuleSwapper, Router, moduleSwapper, routesDefinition;

ModuleSwapper = require("../lib/module-swapper");

Router = require("../lib/router");

moduleSwapper = new ModuleSwapper({
    watch: false
});

routesDefinition = {
    "/index": "_root_.index",
    "get /spec": "_root_.index",
    "post /spec": "_root_.index",
    "put /spec": "_root_.index",
    "delete /spec": "_root_.index",
    "patch /spec": "_root_.index",
    "/index/:param": "_root_.index"
};

describe("Router test", function() {
    describe("#constructor", function() {});

    describe("#load", function() {
        it("The `route` argument format", function() {
            var router;
            router = new Router(moduleSwapper, {
                watch: false,
                routes: {},
                controllerDir: __dirname + "/mocks/router-valid-controllers/"
            });
        });
    });

    describe("#_prefetchControllers", function() {
        it("load valid controllers", function() {
            var router;
            router = new Router(moduleSwapper, {
                watch: false,
                routes: {},
                controllerDir: __dirname + "/mocks/router-valid-controllers/"
            });
            (function() {
                router._prefetchControllers();
            }).should.not["throw"]();
        });

        it("load invalid controllers", function() {
            var router;
            router = new Router(moduleSwapper, {
                watch: false,
                routes: {},
                controllerDir: __dirname + "/mocks/router-invalid-controllers/"
            });
            (function() {
                router._prefetchControllers();
            }).should["throw"]("_root_ Controller only deployment as `app/controller/_root_.js`");
        });
    });
});
