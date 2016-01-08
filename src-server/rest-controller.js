import _ from "lodash";
import extend from "./utils/extend";
import * as deep from "./utils/deep";

import Controller from "./controller";

// Write class uses function
// For listup RestController methods in Router.
export default function RestController() {
    if (_.isFunction(this._init)) {
        this._init();
    }
}

/**
 * @static
 * @method create
 * @param {Object} proto
 * @param {String|Model} proto._model
 * @return {RestController}
 */
RestController.create = proto => {
    const SubClass = extend(proto, RestController);
    const instance = new SubClass();

    if (_.isFunction(instance._init)) {
        instance._init();
    }

    if (typeof proto._model !== "string") {
        throw new Error("Model property must be (dot-notation) model name string for reference `maya.models`.");
    }

    return instance;
};


RestController.prototype = _.extend(Object.create(Controller), {
    _init() {
        this.model = deep.get(maya.models, this._model);
    },

    _dispose() {
        delete this.model;
    },

    // Delegation handler for Router register

    "get_index"(req, res) {
        return this._list(req, res);
    },

    "get_:id"(req, res) {
        return this._get(req, res);
    },

    "post_index"(req, res) {
        return this._post(req, res);
    },

    "delete_:id"(req, res) {
        return this._delete(req, res);
    },

    "put_:id"(req, res) {
        return this._put(req, res);
    },

    "patch_:id"(req, res) {
        return this._put(req, res);
    },

    // Real handlers

    *_list(req, res) {
        res.json(yield this.model.find());
    },

    *_get(req, res) {
        res.json(yield this.model.find(req.params.id)[0]);
    },

    *_post(req, res) {
        res.json(yield this.model.create(req.body)[0]);
    },

    *_delete(req, res) {
        res.json(yield this.model.destroy(req.params.id)[0]);
    },

    *_put(req, res) {
        res.json(yield this.model.update(req.params.id, req.body)[0]);
    }
});
