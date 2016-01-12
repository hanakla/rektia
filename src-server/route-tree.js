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
     *  [0] -> httpMethod
     *  [1] -> url fragments pattern
     *  [2] -> Controller information
     */
    mergeFlattenTree(routeList) {
        const routeTree = Object.create(null);

        _.each(routeList, ([httpMethod, urlFragments, handlerInfo], idx, list) => {
            var targetNode;
            const validUrlFragments = urlFragments.filter(f => f !== "/" && f !== "" & !! f);

            // Build route tree
            const pattern = [];
            validUrlFragments.reduce((parentNode, fragment) => {
                pattern.push(fragment);
                parentNode[fragment] = parentNode[fragment] || Object.create(null);

                targetNode = parentNode[fragment];
                targetNode._isParam = fragment[1] === ":";
                targetNode._pattern = pattern.join("");

                return targetNode;
            }, routeTree);

            targetNode._handlers = targetNode._handlers || Object.create(null);
            targetNode._handlers[httpMethod] = handlerInfo;
        });

        this.merge(routeTree);
    }

    /**
     * @method merge
     * @param {Array<Object>}
     */
    merge(...trees) {
        // TODO: Implement merge with conflict checking
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
        httpMethod = httpMethod.toLowerCase();

        const urlFragments = url.replace(/(^\/|\/$)/g, "")
            .split("/")
            .filter(fragment => fragment !== "")
            .map(fragment => `/${fragment}`);

        const candidateNodes = urlFragments.reduce((candidateNodes, currentFragment) => {
            return this._findMatchNodes(candidateNodes, currentFragment);
        }, [this.tree]);

        const matchedNode = candidateNodes[0];
        const candidateHandlers = matchedNode != null ? matchedNode._handlers : null;

        // Find `/index` handler when handler not find in matchedNode.
        var handlers = candidateHandlers;
        if (handlers == null && matchedNode && matchedNode["/index"]) {
            handlers = matchedNode["/index"]._handlers;
        }

        if (candidateNodes.length > 1) {
            console.warn("Can't resolve route.", candidateNodes.map(node => node._handlers));
            return;
        }

        if (matchedNode == null ||  handlers == null) return;
        if (handlers[httpMethod] == null && handlers.all == null) return;

        const matchedNodeInfo = (handlers[httpMethod] || handlers.all);

        return {
            controller : matchedNodeInfo.controller,
            method : matchedNodeInfo.method,
            pattern : matchedNode._pattern
        };
    }

    /**
     * @private
     * @param {Array<Object>} nodes
     * @param {String} fragment a URL fragment likes "/fragment"
     */
    _findMatchNodes(nodes, fragment) {
        const firstMatches = _.reduce(nodes, (matches, node) => {
            _.each(node, (child, key) => {
                if (key === fragment) {
                    matches.statics.push(child);
                }
                else if (child._isParam) {
                    matches.dynamics.push(child);
                }
            });

            return matches;
        }, {dynamics : [], statics: []});

        if (firstMatches.statics.length === 1) {
            return firstMatches.statics;
        }
        else if (firstMatches.dynamics.length === 1){
            return firstMatches.dynamics;
        }

        return [...firstMatches.statics, ...firstMatches.dynamics];
    }
}
