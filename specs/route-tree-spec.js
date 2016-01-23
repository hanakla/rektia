const RouteTree = require("../lib/route-tree");

describe("RouteTree", () => {
    const routeTree = new RouteTree;

    // describe("#mergeFlattenTree", () => {
    //     it("expects", () => {
    //         routeTree.mergeFlattenTree
    //     });
    // });

    describe("#findMatchController", () => {
        const routes = [
            ["all",     ["/index"],             {controller: "_root_.js",   method: "index"}],
            ["all",     ["/signup"],            {controller: "signup.js",   method: "index"}],
            ["post",    ["/signup"],            {controller: "signup.js",   method: "post_index"}],
            ["all",     ["/:userName"],         {controller: "user.js",     method: "index"}],
            ["all",     ["/:userName/profile"], {controller: "user.js",     method: "profile"}]
        ];

        const tree = new RouteTree();
        tree.mergeFlattenTree(routes);

        it("Should lookup handler (static route)", () => {
            expect(tree.findMatchController("get", "/index")).to.eql({
                controller  : "_root_.js",
                method      : "index",
                pattern     : "/index"
            });

            expect(tree.findMatchController("get", "/signup")).to.eql({
                controller  : "signup.js",
                method      : "index",
                pattern     : "/signup/index"
            });

            expect(tree.findMatchController("post", "/signup")).to.eql({
                controller  : "signup.js",
                method      : "post_index",
                pattern     : "/signup/index"
            });
        });

        it("Should lookup handler with parameter", () => {
            expect(tree.findMatchController("get", "/maya")).to.eql({
                controller  : "user.js",
                method      : "index",
                pattern     : "/:userName/index"
            });

            expect(tree.findMatchController("get", "/maya/profile")).to.eql({
                controller  : "user.js",
                method      : "profile",
                pattern     : "/:userName/profile"
            });
        });

        it("Should be preferred static route than parameter route", () => {
            expect(tree.findMatchController("get", "/signup")).to.eql({
                controller  : "signup.js",
                method      : "index",
                pattern     : "/signup/index"
            });

            expect(tree.findMatchController("get", "/maya")).to.eql({
                controller  : "user.js",
                method      : "index",
                pattern     : "/:userName/profile"
            });
        });

        it("Should lookup index handler via URL `/`", () => {
            expect(tree.findMatchController("get", "/")).to.eql({
                controller  : "_root_.js",
                method      : "index",
                pattern     : "/index"
            });

            expect(tree.findMatchController("get", "/signup/")).to.eql({
                controller  : "_root_.js",
                method      : "index",
                pattern     : "/index"
            });
        });

        it("Should not match to `/` suffixed url as without `/` suffixed URL", () => {
            expect(tree.findMatchController("get", "/signup/")).to.be(undefined);
        });

        it("Should return undefined when match handler not exists", () => {
            expect(tree.findMatchController("get", "/not-found")).to.be(undefined);
        });
    });
});
