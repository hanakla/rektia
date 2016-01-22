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
            ["all", ["/index"], {controller: "_root_.js", method: "index"}],
            ["all", ["/signup"], {controller: "signup.js", method: "signup"}],
            ["post", ["/signup"], {controller: "signup.js", method: "post_signup"}]
        ];

        const tree = new RouteTree();
        tree.mergeFlattenTree(routes);

        it("Should lookup correct handler", () => {

        });
    });
});
