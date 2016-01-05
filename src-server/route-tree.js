import _ from "lodash"

// TODO: Replace searching algorithm to
//  fragments->method pattern. (Now is `method->fragments` implement).
// For simplify and reduce searching times.
export default class RouteTree {
    /**
     * @class RouteTree
     * @constructor
     * @param {Object?} routeTree initial route tree
     */
    constructor(routeTree) {
        this.clear();
        routeTree && (this.tree = routeTree);
    }

    /**
     * Clear holding route tree
     * @method clear
     */
    clear() {
        this.tree = Object.create(null);
    }

    /**
     * @method mergeFlattenTree
     * @param {Array<Array<string, Array<string>, Object>} routeList
     */
    mergeFlattenTree(routeList) {
        var routeTree = Object.create(null);

        _.each(routeList, ([httpMethod, urlFragments, handlerInfo], idx, list) => {
            // Build route tree
            var targetNode;
            routeTree[httpMethod] = routeTree[httpMethod] || {};

            urlFragments.reduce((parent, fragment) => {
                parent[fragment] = parent[fragment] || Object.create(null);

                targetNode = parent[fragment];
                targetNode._parent = parent;
                targetNode._url = (parent._url ? parent._url : "") + fragment;
                targetNode.isParam = fragment[1] === ":";

                return parent[fragment];
            }, routeTree[httpMethod]);

            targetNode.controller = handlerInfo;
        });

        this.merge(routeTree);
    }

    /**
     * @method merge
     * @param {Array<Object>}
     */
    merge(...trees) {
        return _.merge(this.tree, ...trees);
    }

    /**
     * @method findMatchController
     * @param {String} httpMethod
     * @param {String} url likes "/path/to/route"
     * @return {Object}
     *  controller : Path to controller file
     *  method : Calling method name
     *  url : matched url pattern
     */
    findMatchController(httpMethod, url, routeTree = this.tree) {
        var targetHandlerInfo;
        var urlFragments;

        httpMethod = httpMethod.toLowerCase();

        urlFragments = url.split("/")
            .slice(1)  // Remove predixed "/" in "/route/url"
            .map(fragment => `/${fragment}`)
            .filter(fragment => fragment !== "/"); // ignore single slash

        if (! routeTree[httpMethod]) {
            // if specified method doesn't exists in routeTree
            // replace method to "all"
            httpMethod = "all";
        }

        var candidateNodes = [routeTree[httpMethod]];
        var currentFragment;
        var candidateNodes;

        while (currentFragment = urlFragments.shift()) {
            currentFragment = currentFragment === "/" ? "/index" : currentFragment;
            candidateNodes = this._findMatchNodes(candidateNodes, currentFragment);
        }

        if (candidateNodes.length === 1) {
            let matchedNode = candidateNodes[0];
            console.log(this.tree);
            // console.log(candidateNodes);

            if (! matchedNode.controller) {
                // if matchedNode is middle node.
                // check "/index" node.
                if (matchedNode["/index"]) {
                    matchedNode = matchedNode["/index"];
                }
                else {
                    return;
                }
            }

            let matchedNodeInfo = matchedNode.controller;

            var matchedPattern = [];

            return {
                controller : matchedNodeInfo.controller,
                method : matchedNodeInfo.method,
                url : matchedNode._url
            };
        }

        // If not exists handler , re-search with "all" method.
        // (It's required, if routeTree[httpMethod] is exists and matche fragments exists in routeTree.all,
        // RouteTree failed to pick matche handler.)
        return this.findMatchController("all", url, this.tree);
    }

    /**
     * @private
     * @param {Array<Object>} nodes
     * @param {String} fragment a URL fragment likes "/fragment"
     */
    _findMatchNodes(nodes, fragment) {
        return nodes.reduce((matches, node) => {
            matches.push(..._.select(node, (child, key) => {
                return key === fragment || child.isParam;
            }));

            return matches;
        }, []);
    }
}
