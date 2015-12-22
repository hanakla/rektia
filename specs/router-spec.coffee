ModuleSwapper = require "../lib/module-swapper"
Router = require "../lib/router"

moduleSwapper = new ModuleSwapper({watch: false})

routesDefinition =
    "/index"        : "_root_.index"
    "get /spec"     : "_root_.index"
    "post /spec"    : "_root_.index"
    "put /spec"     : "_root_.index"
    "delete /spec"  : "_root_.index"
    "patch /spec"   : "_root_.index"
    "/index/:param" : "_root_.index"

describe "Router test", ->
    describe "#constructor", ->
        # it "", ->

    describe "#load", ->
        it "The `route` argument format", ->
            # routesDefinition is `route` argument format

            # initialize router
            router = new Router(moduleSwapper, {
                watch : false,
                routes : {},
                controllerDir : __dirname + "/mocks/router-valid-controllers/"
            })

    describe "#_prefetchControllers", ->
        it "load valid controllers", ->
            router = new Router(moduleSwapper, {
                watch : false,
                routes : {},
                controllerDir : __dirname + "/mocks/router-valid-controllers/"
            })

            (-> router._prefetchControllers()).should.not.throw()

        it "load invalid controllers", ->
            router = new Router(moduleSwapper, {
                watch : false,
                routes : {},
                controllerDir : __dirname + "/mocks/router-invalid-controllers/"
            })

            # `router-invalid-controllers` contains `_root_` controller other than controllers dir root.
            # it's throws Error
            (-> router._prefetchControllers()).should.throw("_root_ Controller only deployment as `app/controller/_root_.js`")
